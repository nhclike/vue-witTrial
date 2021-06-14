/* 数据字典
 * @Author: ShiHuiJun
 * @Date: 2020-10-10 10:00:20
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-12 16:51:14
 */

/* 模版-弹框-列表 */
<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">数据字典</span>
                </div>
                <!-- 列表查询区 -->
                <div class="form-body inquire">
                    <div>
                        <el-form
                            :model="inquireForm"
                            :label-position="'right'"
                            label-width="1.9rem"
                            status-icon
                            :rules="inquireFormRules"
                            ref="inquireForm"
                            @submit.native.prevent
                        >
                            <el-row>
                                <el-col :span="8">
                                    <el-form-item label="字典名称">
                                        <el-input
                                            v-model="inquireForm.name"
                                            placeholder
                                            clearable
                                            @input="queryList(true)"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                              <!--  <el-col :span="8">
                                    <el-form-item label="字典状态">
                                        <el-select
                                            filterable
                                            v-model="inquireForm.deptNo"
                                            placeholder=""
                                            clearable
                                            @change="queryList(true)"
                                        >
                                            <el-option
                                                v-for="(item,
                                                index) in deptList"
                                                :key="index"
                                                :label="item.name"
                                                :value="item.id"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>-->
                                <el-col :span="8">
                                    <el-form-item label="状态">
                                        <el-select
                                            v-model="inquireForm.delFlag"
                                            placeholder=""
                                            clearable
                                            @change="queryList"
                                        >
                                            <el-option label="启用" :value="0"></el-option>
                                            <el-option label="禁用" :value="-1"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </div>
                <div class="opt-box">
                    <div class="title">字典信息列表</div>
                    <div class="opt-btns">
                        <button
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            @click="addOrUpdateHandle('add')"
                        >
                            <i class="i-addCourt"></i>新增字典
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
                        width="75"
                        align="center"
                        header-align="center"
                        :reserve-selection="true"
                    ></el-table-column>
                    <el-table-column
                        show-overflow-tooltip
                        v-for="item in tableColumnData"
                        :key="item.prop"
                        :prop="item.prop"
                        :label="item.label"
                        :width="item.width"
                        :min-width="item.minWidth"
                        :formatter="item.formatter"
                        align="center"
                        header-align="center"
                    ></el-table-column>
                    <el-table-column
                        label="状态"
                        width
                        min-width="50"
                        align="center"
                        header-align="center"
                    >
                        <template slot-scope="scope">
                            <!--操作栏按钮-->
                            <el-tag
                                :type="
                                    String(scope.row.delFlag) === '0'
                                        ? 'success'
                                        : 'info'
                                "
                                >{{
                                    String(scope.row.delFlag) | dictStatusFilter
                                }}</el-tag
                            >
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="showTableOperate"
                        label="操作"
                        width
                        min-width="125"
                        align="center"
                        header-align="center"
                    >
                        <template slot-scope="scope">
                            <!-- 操作栏按钮 -->
                            <span
                                v-for="(item, index) in tableOperate"
                                :key="index"
                                v-if="showOperateBtn(scope.row, item, index)"
                                :id="item.id"
                                class="listButton"
                                :class="item.class"
                                @click="
                                    handleClickOperate(scope.row, item, index)
                                "
                                >{{ item.conntentText }}</span
                            >
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
                        v-if="tablePaginationData.layout.indexOf('->') > -1"
                    >
                        共
                        <i class="font-color-primary">{{
                            tablePaginationData.pages
                        }}</i
                        >页
                        <i class="font-color-primary">{{
                            tablePaginationData.total
                        }}</i
                        >条记录
                    </span>
                </el-pagination>
            </div>
        </div>
        <!-- 弹窗-开庭-->
        <div class="alert-box" v-if="showAlertBoxDictOperate">
            <dict-operate
                ref="dictOperate"
                :operateBtnName="operateBtnName"
                @emitClose="showAlertBoxDictOperate = false"
                @refreshDataList="queryList();showAlertBoxDictOperate = false"
            ></dict-operate>
        </div>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import DictOperate from '@/views/judge/workBench/system/dict/DictOperate';
import { debounce } from '@/utils/utils';
export default {
    name: 'DictMangement',
    components: { DictOperate },
    props: {},
    data() {
        return {
            /* 弹窗 */
            operateBtnName: 'add', // 父传子>表单当前操作模式-add|edit|view
            showAlertBoxDictOperate: false, // 是否显示-弹窗-用户操作
            /* 表单 */
            deptList: [],
            // 查询/过滤条件-用于v-model数据绑定
            inquireForm: {
                name: '', // 真实姓名
                deptNo: ''
                //                status: ''
            },
            // 表单验证
            inquireFormRules: {},
            /* 表格 */
            tableStyle: 'height:0px',
            // 设置表格的row-key
            getRowKeys(row) {
                return row.id;
            },
            showTableSelection: false, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            // 所有页选中的数据列表
            selectionList: [
                // {
                //     page: '1',
                //     selection: []
                // }
            ],
            multipleSelection: [], // 列[选择]-选中列表
            // 列[基本]-参数配置
            tableColumnData: [
                {
                    prop: 'name',
                    label: '字典名称',
                    width: '',
                    minWidth: '50',
                    formatter: this.commFilter.formatEmpty
                },
                {
                    prop: 'type',
                    label: '字典类型',
                    width: '',
                    minWidth: '50',
                    formatter: this.commFilter.formatEmpty
                },
                {
                    prop: 'code',
                    label: '字典code',
                    width: '',
                    minWidth: '50',
                    formatter: this.commFilter.formatEmpty
                },
                {
                    prop: 'value',
                    label: '值',
                    width: '',
                    minWidth: '50',
                    formatter: this.commFilter.formatEmpty
                }
            ],
            // 行-数据
            tableData: [],
            // 列[操作-按钮]-数据
            tableOperate: [
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '编辑', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'edit'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: 'error', // 样式名称
                    conntentText: '删除', // 按钮内容
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
        // this.init();
    },
    mounted() {
        this.initTable();
    },
    methods: {
        ...mapActions({
            dictList: 'moduleSystem/dictList',
            deleteDict: 'moduleSystem/deleteDict'
        }),

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
            let queryParams = {
                curPage: search ? '1' : String(this.tablePaginationData.currentPage),
                limit: String(this.tablePaginationData.pageSize),
                name: this.inquireForm.name,
                delFlag: this.inquireForm.delFlag
            };
            // 请求接口-获取列表
            this.getListData(queryParams);
        }, 500),

        // 接口-获取列表
        getListData(params) {
            this.dictList(params).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.tablePaginationData.total = res.data.totalCount;
                    this.tablePaginationData.pages = res.data.totalPage;
                }
            });
        },

        // 控制操作栏按钮是否显示
        showOperateBtn(row, item, index) {
            let active = item.active;
            if (active) {
                return true;
            }
        },

        // 列【操作】点击事件
        handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    case 'edit':
                        this.$nextTick(() => {
                            this.addOrUpdateHandle('edit', row);
                        });
                        break;
                    case 'delete':
                        this.$confirm(`确定删除吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        })
                            .then(() => {
                                this.reqDelete([row.id]);
                            })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                    case 'resetPassword':
                        this.$message.info('操作成功');
                        break;
                }
            }
        },
        // 新增 / 修改
        addOrUpdateHandle(optName, row) {
            this.showAlertBoxDictOperate = true;
            this.operateBtnName = optName;
            if(optName !== 'add') {
                this.$nextTick(() => {
                    this.$refs.dictOperate.init(row);
                });
            }
        },
        // 删除
        reqDelete(params) {
            this.deleteDict(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success('删除成功');
                    this.queryList();
                } else {
                    this.$message.error(res.msg);
                }
            });
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
<style scoped lang='less'>
@import '@/assets/style/table/el-table.less';
</style>
