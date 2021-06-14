<template>
    <el-dialog
        title="排期列表"
        :close-on-click-modal="false"
        :visible.sync="visible"
        @close="$emit('emitClose')">
        <div class="full-height">
            <div class="shjListPage">
                <div ref="top" class="list-top">
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
                                    <el-col :span="12">
                                        <el-form-item label="计划开庭时间">
                                            <el-date-picker
                                                v-model="inquireForm.planBeginDate"
                                                placeholder=""
                                                clearable
                                                type="date"
                                                format="yyyy-MM-dd"
                                                value-format="yyyy-MM-dd"
                                                @change="queryList(true)"
                                            >
                                            </el-date-picker>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-form>
                        </div>
                    </div>
                </div>
                <!-- 列表内容区 -->
                <div class="tableContent">
                    <el-table
                        element-loading-text="拼命加载中"
                        :data="tableData"
                        style="width: 100%"
                        ref="multipleTable"
                        :row-key="getRowKeys"
                    >
                        <el-table-column
                            show-overflow-tooltip
                            prop="caseCode"
                            header-align="center"
                            align="center"
                            minWidth="130px"
                            label="案号">
                        </el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            prop="planBeginDate"
                            header-align="center"
                            align="center"
                            minWidth="130px"
                            label="开庭时间">
                        </el-table-column>
                        <el-table-column
                            prop="trialStatus"
                            header-align="center"
                            align="center"
                            label="庭审状态"
                            :formatter="trialStatusFormat"
                        >
                        </el-table-column>
                        <el-table-column
                            prop="trialCount"
                            header-align="center"
                            align="center"
                            label="庭审次数">
                        </el-table-column>
                        <el-table-column
                            prop="cognate"
                            header-align="center"
                            align="center"
                            label="是否并案"
                            :formatter="commFilter.formatBoolean"
                        >
                        </el-table-column>
                        <el-table-column
                            v-if="showTableOperate"
                            label="操作"
                            align="center"
                            header-align="center"
                        >
                            <template slot-scope="scope">
                                <!-- 操作栏按钮 -->
                                <span
                                    v-for="(item,index) in tableOperate"
                                    :key="item.id"
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
        </div>
    </el-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import { debounce } from '@/utils/utils';
export default {
    name: 'SchedulingList',
    inject: ['reload', 'trialStatusList'],
    props: {
        courtroomId: '' // 法庭id
    },
    data() {
        return {
            visible: false,
            // 查询/过滤条件-用于v-model数据绑定
            inquireForm: {
                planBeginDate: new Date().Format('yyyy-MM-dd')
            },
            // 表单验证
            inquireFormRules: {},
            tableStyle: 'height:0px',
            /* 组件名称 */
            /* 表格 */
            // 设置表格的row-key
            getRowKeys(row) {
                return row.trialId;
            },
            showTableSelection: false, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            // 行-数据
            tableData: [],
            // 列[操作-按钮]-数据
            tableOperate: [
                {
                    id: 'edit', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '进入庭审', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: false, // 是否显示按钮
                    action: 'enterTrial'
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
        this.init();
    },
    methods: {
        ...mapActions({
            queryTrialByRoomId: 'moduleCase/queryTrialByRoomId',
            getMainCaseTrialId: 'moduleSystem/getMainCaseTrialId'
        }),
        // 初始化
        init() {
            this.visible = true;
            this.queryList();
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
                courtroomId: this.courtroomId,
                planBeginDate: this.inquireForm.planBeginDate
            };
            this.queryTrialByRoomId(params).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.tablePaginationData.total = res.data.totalCount;
                    this.tablePaginationData.pages = res.data.totalPage;
                }
            });
        }, 500),

        // 控制操作栏按钮是否显示
        showOperateBtn(row, item, index) {
            let active = item.active;
            if (active) {
                return true;
            }
            switch (item.action) {
                case 'enterTrial':
                    return row.trialFlag === 1;
            }
        },

        // 列【操作】点击事件
        async handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    case 'enterTrial':
                        let trialID = row.trialId;
                        if (row.cognate === '1') {  // cognate === 1 并案 获取主案件trialId
                            await this.getMainCase(row.trialId, (data) => {
                                trialID = data;
                            });
                        }
                        this.$emit('enterTrial', trialID);
                        break;
                    default:
                        console.log('error');
                        break;
                }
            }
        },
        async getMainCase(trialId, callback) {
            await this.getMainCaseTrialId(trialId).then((res) => {
                if (res.code === 0) {
                    callback(res.data.trialId);
                }
            });
        },
        trialStatusFormat(row, column, cellValue) {
            let obj = this.commFilter.formatDict(this.trialStatusList());
            return obj[cellValue] || '';
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

<style lang='less' type="text/less" scoped>
    .form-body.inquire {
        padding: 0;
        /deep/ .el-form .el-form-item {
            margin: 0 0.2rem 0.2rem 0;
        }
    }
    /deep/ .el-dialog__body {
        height: 700px;
        .tableContent {
            height: 480px;
        }
    }
    /deep/ .el-dialog__header {
        background-color: #1677ff;
        padding: 20px;
        .el-dialog__title {
            font-size: @font28px;
            color: #fff;
        }
        .el-dialog__close {
            font-size: @font34px;
            color: #fff;
        }
    }
    /deep/ .el-dialog__footer {
        text-align: center;
        span {
            margin: 0 20px;
        }
    }
</style>
