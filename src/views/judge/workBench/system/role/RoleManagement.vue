<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">角色管理</span>
                </div>
                <!-- 列表查询区 -->
                <div class="form-body inquire">
                    <div>
                        <el-form
                            :model="inquireForm"
                            :label-position="'right'"
                            label-width="1.8rem"
                            status-icon
                            ref="inquireForm"
                            @submit.native.prevent
                        >
                            <el-row>
                                <el-col :span="8">
                                    <el-form-item label="角色名称">
                                        <el-input v-model="inquireForm.roleName" placeholder clearable
                                                  @input="queryList(true)"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </div>
                <div class="opt-box">
                    <div class="title">角色列表</div>
                    <div class="opt-btns">
                        <button class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="addOrUpdateHandle()"
                        >
                            <i class="i-addCourt"></i>新增角色
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
                        prop="roleName"
                        header-align="center"
                        align="center"
                        label="角色名称">
                    </el-table-column>
                    <el-table-column
                        prop="roleCode"
                        header-align="center"
                        align="center"
                        label="角色code">
                    </el-table-column>
                    <el-table-column
                        prop="createTime"
                        header-align="center"
                        align="center"
                        min-width="200"
                        label="创建时间">
                    </el-table-column>
                    <el-table-column
                        prop="remark"
                        header-align="center"
                        align="center"
                        label="备注">
                    </el-table-column>
                    <el-table-column
                        v-if="showTableOperate"
                        label="操作"
                        width
                        min-width="100"
                        align="center"
                        header-align="center"
                    >
                        <template slot-scope="scope">
                            <!-- 操作栏按钮 -->
                            <span
                                v-for="(item,index) in tableOperate"
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
        <!-- 弹窗 新增 修改 -->
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="queryList"></add-or-update>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
// import { treeDataTranslate } from '@/utils/utils';
import AddOrUpdate from '@/views/judge/workBench/system/role/RoleOperate';
import { debounce } from '@/utils/utils';
export default {
    name: 'RoleManagement',
    components: {
        AddOrUpdate
    },
    inject: ['reload'],
    props: {

    },
    data() {
        return {
            addOrUpdateVisible: false, // 是否显示操作弹窗
            tableStyle: 'height:0px',
            /* 组件名称 */
            // 查询/过滤条件-用于v-model数据绑定
            inquireForm: {
                roleName: ''
            },
            /* 表格 */
            // 设置表格的row-key
            getRowKeys(row) {
                return row.roleId;
            },
            showTableSelection: false, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            // 行-数据
            tableData: [],
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
                    class: 'error', // 样式名称
                    contentText: '删除', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'delete'
                }
            ],
            // 分页-数据
            tablePaginationData: {
                pageSizes: [10, 20, 50, 100],
                currentPage: 1,
                pageSize: 10,
                total: 0,
                pages: 0,
                layout: 'slot,->, prev, pager, next, jumper'
            }
        };
    },
    computed: {},
    watch: {},
    created() {
        //
    },
    mounted() {
        this.initTable();
    },
    methods: {
        ...mapActions('moduleSystem', ['queryRoleList', 'deleteRole']),

        // 删除
        deleteHandle(id) {
            let ids = id ? [id] : this.dataListSelections.map(item => {
                return item.roleId;
            });
            this.deleteRole(ids).then((res) => {
                if (res.code === 0) {
                    this.$message.success('删除成功');
                    this.queryList();
                } else {
                    this.$message.error(res.msg);
                }
            });
        },

        // 新增 / 修改
        addOrUpdateHandle(id) {
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.addOrUpdate.init(id);
            });
        },

        /* --------------------表格-开始-------------------- */
        // 初始化表格
        initTable() {
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
                roleName: this.inquireForm.roleName
            };
            this.queryRoleList(params).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.tablePaginationData.total = res.data.totalCount;
                    this.tablePaginationData.pages = res.data.totalPage;
                }
            });
        }, 500),

        // 控制操作栏按钮是否显示
        showOperateBtn(row, item, index) {
            return item.active;
        },

        // 列【操作】点击事件
        handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    case 'edit':
                        this.addOrUpdateHandle(row.roleId);
                        break;
                    case 'delete':
                        this.$confirm(`确定删除吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        }).then(() => {
                            this.deleteHandle(row.roleId);
                        })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
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
        /* --------------------表格-结束-------------------- */

    }
};
</script>

<style lang="less" scoped>
    @import '../../../../../assets/style/table/el-table.less';
</style>
