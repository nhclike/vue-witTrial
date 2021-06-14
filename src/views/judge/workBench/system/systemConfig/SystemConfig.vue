/* 系统配置 */
<template>
  <div class="listPage">
    <div class="shjListPage">
      <div ref="top" class="list-top">
          <!-- 列表标题区 -->
          <div class="table-top">
              <span class="flag">&nbsp;</span>
              <span class="title">系统配置</span>
          </div>
        <!-- 列表查询区 -->
        <div class="form-body inquire">
          <div>
            <el-form
              :label-position="'right'"
              :model="inquireForm"
              label-width="1.8rem"
              status-icon
              :rules="inquireFormRules"
              ref="inquireForm"
              class="demo-form-inline"
              :inline="true"
              @submit.native.prevent
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item label="配置key">
                    <el-input v-model="inquireForm.paramKey" placeholder="配置key" clearable v-on:input="queryList(true)"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="描述">
                    <el-input v-model="inquireForm.remark" placeholder="描述" clearable v-on:input="queryList(true)"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="状态">
                    <el-select v-model="inquireForm.status" clearable @change="queryList(true)">
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>
        <div class="opt-box">
          <div class="title"></div>
          <div class="opt-btns">
            <button class="shj-btn--primary_workBench shj-btn--medium_workBench"
                    @click="Handle('add')"
            >
              <i class="i-addCourt"></i>新增配置
            </button>
          </div>
        </div>
      </div>
      <!-- 列表内容区 -->
      <div class="tableContent" :style="tableStyle">
          <el-table
            element-loading-text="拼命加载中"
            :data="tableData"
            style="width: 100%"
            ref="multipleTable"
            :row-key="getRowKeys"
          >
            <el-table-column
              v-if="showTableSelection"
              type="selection"
              width="55"
              align="center"
              header-align="center"
              :reserve-selection="true"
            ></el-table-column>
            <el-table-column
              prop="paramKey"
              header-align="center"
              align="center"
              label="配置key"
            ></el-table-column>
            <el-table-column
                show-overflow-tooltip
              prop="paramValue"
              header-align="center"
              align="center"
              label="值"
            ></el-table-column>
            <el-table-column
                show-overflow-tooltip
              prop="remark"
              header-align="center"
              align="center"
              label="描述"
              ></el-table-column>
            <el-table-column
              prop="status"
              header-align="center"
              align="center"
              label="状态"
              >
                <template slot-scope="scope">
                    <el-tag :type="String(scope.row.status) === '1' ? '' : 'danger'">
                        {{String(scope.row.status) | statusFilter}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column
              v-if="showTableOperate"
              label="操作"
              min-width="100"
              align="center"
              header-align="center"
            >
              <template slot-scope="scope">
                <!-- 操作栏按钮 -->
                <span
                  v-for="(item, index) in tableOperate"
                  :key="index"
                  v-if="showOperateBtn(scope.row,item,index)"
                  :id="item.id"
                  class="listButton"
                  :class="item.class"
                  @click="handleClickOperate(scope.row,item)"
                >{{item.contentText}}</span>
              </template>
            </el-table-column>
          </el-table>
      </div>
      <!-- 列表分页区 -->
      <div ref="pagination" class="tablePagination block">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="tablePaginationData.currentPage"
          :page-sizes="tablePaginationData.pageSizes"
          :page-size="tablePaginationData.pageSize"
          :layout="tablePaginationData.layout"
          :total="tablePaginationData.total"
        >
        <span
          class="pagination_slot"
          v-if="tablePaginationData.layout.indexOf('->')>-1"
        >
            共
            <i class="font-color-primary">{{tablePaginationData.pages}}</i>页
            <i class="font-color-primary">{{tablePaginationData.total}}</i>条记录
        </span>
        </el-pagination>
      </div>
    </div>
    <!-- 弹窗-开庭-->
    <div class="alert-box" v-if="showAlertBoxConfigOperate">
      <config-operate
        ref="configOperate"
        :operateBtnName="operateBtnName"
        @emitClose="showAlertBoxConfigOperate = false"
        @refreshDataList="search();showAlertBoxConfigOperate = false"
      ></config-operate>
    </div>
  </div>
</template>

<script>
import { treeDataTranslate, debounce } from '@/utils/utils';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import ConfigOperate from '@/views/judge/workBench/system/systemConfig/ConfigOperate';

export default {
    components: {
        ConfigOperate
    },
    data() {
        return {

            /* 弹窗 */
            operateBtnName: 'add',
            showAlertBoxConfigOperate: false,

            showTableSelection: false, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            visible: false,
            options: [
                {
                    value: '1',
                    label: '启用'
                },
                {
                    value: '0',
                    label: '禁用'
                }
            ],
            inquireForm: {
                paramKey: '',
                paramValue: '',
                remark: '',
                status: ''
            },
            /* 表格 */
            tableStyle: 'height:0px',
            // 列[操作-按钮]-数据
            tableOperate: [
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '编辑', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'edit'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '查看', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'view'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: 'error', // 样式名称
                    contentText: '删除', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'delete'
                }
            ],
            tableData: [],
            tablePaginationData: {
                pageSizes: [10, 20, 50, 100],
                currentPage: 1,
                pageSize: 10,
                total: 0,
                pages: 0,
                layout: 'slot,->, prev, pager, next, jumper'
            },
            inquireFormRules: {
                paramValue: [
                    { required: true, message: 'key不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    mounted() {
        this.init();
    },

    methods: {
        ...mapActions('moduleSystem', ['systemConfigList', 'systemConfigDelete']),
        init() {
            this.search();
        },
        showOperateBtn(row, item, index) {
            return item.active;
        },
        getRowKeys(row) {
            return row.id;
        },
        search() {
            this.setTableStyle();
            this.queryList();
        },

        // 设置表格高度
        setTableStyle() {
            let topH = this.$refs.top.clientHeight;
            let bottomH = this.$refs.pagination.clientHeight;
            this.tableStyle = `height:calc(100% - ${topH + bottomH}px)`;
        },
        // 查询-获取列表
        queryList: debounce(function(search) {
            this.tablePaginationData.currentPage = search
                ? 1
                : this.tablePaginationData.currentPage;
            // 请求接口-获取列表
            let params = {
                curPage: search ? '1' : String(this.tablePaginationData.currentPage),
                limit: String(this.tablePaginationData.pageSize),
                paramKey: this.inquireForm.paramKey,
                status: this.inquireForm.status,
                remark: this.inquireForm.remark
            };

            this.systemConfigList(params).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.tablePaginationData.total = res.data.totalCount;
                    this.tablePaginationData.pages = res.data.totalPage;
                }
            });
        }, 500),
        Handle(operateBtnName, row) {
            this.showAlertBoxConfigOperate = true;
            this.operateBtnName = operateBtnName;
            this.$nextTick(() => {
                this.$refs.configOperate.init(row);
            });
        },
        // 列【操作】点击事件
        handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    case 'delete':
                        this.$confirm(`确定删除吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        })
                            .then(() => {
                                let ids = [];
                                ids.push(row.id);
                                this.systemConfigDelete(ids).then((res) => {
                                    if (res.code === 0) {
                                        this.init();
                                    }
                                });
                            })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                    case 'edit':
                        this.Handle(item.action, row);
                        break;
                    case 'view':
                        this.Handle(item.action, row);
                        break;
                }
            }
        },
        // 每页数量-pageSize-change事件-表格数据重新渲染
        handleSizeChange(val) {
            this.tablePaginationData.pageSize = val;
            this.queryList();
        },

        // 页码-currentPage-change事件-表格数据重新渲染
        handleCurrentChange(val) {
            this.tablePaginationData.currentPage = val;
            this.queryList();
        }

    }
};
</script>
<style lang="less">
  @import '../../../../../assets/style/table/el-table.less';
</style>
