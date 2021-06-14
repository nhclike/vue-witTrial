<template>
    <el-dialog
        :title="channelFlag == '0' ? '增录通道配置' : channelFlag == '1' ? '输入通道配置' : '输出通道配置'"
        :close-on-click-modal="false"
        :visible.sync="visible"
        @close="close"
    >
        <div class="full-height">
            <div class="shjListPage">
                <div ref="top" class="list-top">
                    <div class="opt-box" style="justify-content: flex-end;">
                        <div class="opt-btns">
                            <button
                                v-if="deviceType==='2'"
                                class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="addMut()"
                            >
                                <i class="i-addCourt"></i>新增通道
                            </button>
                            <button
                                class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="deleteMut()"
                            >
                                <i class="el-icon-refresh"></i>批量删除
                            </button>
                            <button
                                v-if="deviceType==='1'"
                                class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="sync()"
                            >
                                <i class="el-icon-refresh"></i>同步通道
                            </button>
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
                        @selection-change="handleSelectionChange"
                        :row-key="getRowKeys"
                    >
                        <el-table-column
                            type="selection"
                            minWidth="3%"
                            align="center"
                            header-align="center"
                            :reserve-selection="true"
                        ></el-table-column>
                        <el-table-column
                            prop="channelId"
                            header-align="center"
                            align="center"
                            minWidth="12%"
                            label="通道号"
                        ></el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            prop="name"
                            header-align="center"
                            align="center"
                            minWidth="13%"
                            label="通道名称"
                        ></el-table-column>
                        <template v-if="deviceType === '2'">
                            <el-table-column
                                show-overflow-tooltip
                                prop="number"
                                header-align="center"
                                align="center"
                                minWidth="13%"
                                label="组号"
                            ></el-table-column>
                            <!-- <el-table-column
                                show-overflow-tooltip
                                prop="mode"
                                header-align="center"
                                align="center"
                                minWidth="17%"
                                label="分隔模式"
                            ></el-table-column>-->
                        </template>
                        <template v-if="deviceType === '1'&&channelFlag == '0'">
                            <el-table-column
                                prop="channelType"
                                header-align="center"
                                align="center"
                                minWidth="13%"
                                label="通道类型"
                            ></el-table-column>
                            <el-table-column
                                show-overflow-tooltip
                                prop="number"
                                header-align="center"
                                align="center"
                                minWidth="13%"
                                label="类型编号"
                            ></el-table-column>
                            <el-table-column
                                prop="streamType"
                                header-align="center"
                                align="center"
                                minWidth="17%"
                                label="通道流类型"
                            ></el-table-column>
                            <el-table-column
                                show-overflow-tooltip
                                prop="uniqueChannel"
                                header-align="center"
                                align="center"
                                minWidth="17%"
                                label="唯一通道号"
                            ></el-table-column>
                        </template>
                        <el-table-column
                            v-if="showTableOperate"
                            label="操作"
                            minWidth="17%"
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
        <channel-operate
            v-if="updateVisible"
            ref="channelOperate"
            @refreshDataList="queryList(true)"
        ></channel-operate>
    </el-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import ChannelOperate from '@/views/judge/workBench/system/courtRoom/ChannelOperate';
import { debounce } from '@/utils/utils';
export default {
    name: 'CourtRoomManagement',
    components: {
        ChannelOperate
    },
    inject: ['reload'],
    props: {},
    data() {
        return {
            visible: false,
            channelFlag: null, // 通道类型
            deviceType: '1', // 主机类型
            courtroomId: '', // 法庭id
            updateVisible: false, // 是否显示操作弹窗
            tableStyle: 'height:0px',
            /* 组件名称 */
            /* 表格 */
            // 设置表格的row-key
            getRowKeys(row) {
                return row.id;
            },
            showTableOperate: true, // 是否显示-列[操作]
            // 所有页选中的数据列表
            selectionList: [
                // {
                //     page: '1',
                //     selection: []
                // }
            ],
            multipleSelection: [], // 列[选择]-选中列表
            // 行-数据
            tableData: [],
            // 列[操作-按钮]-数据
            tableOperate: [
                {
                    id: 'edit', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '编辑', // 按钮内容
                    active: true, // 是否显示按钮
                    action: 'edit'
                },
                {
                    id: 'delete', // DOM节点id,用来确定样式或特殊操作
                    class: 'error', // 样式名称
                    contentText: '删除', // 按钮内容
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
        //            this.init();
    },
    methods: {
        ...mapActions('moduleSystem', ['queryChannelList', 'deleteChannel', 'syncChannelData']),
        // 初始化
        init(flag, deviceType, courtroomId) {
            this.visible = true;
            this.channelFlag = flag;
            this.deviceType = deviceType;
            this.courtroomId = courtroomId;
            this.initTable();
        },

        // 新增通道
        addMut() {
            this.handle(null, 'add');
        },

        // 同步通道
        sync() {
            let params = {
                flag: this.channelFlag,
                courtroomId: this.courtroomId
            };
            this.syncChannelData(params).then((res) => {
                if (res.code === 0) {
                    this.selectionList = [];
                    this.queryList(true);
                }
            });
        },

        //  新增|修改 处理
        handle(id, alertBoxAction) {
            this.updateVisible = true;
            this.$nextTick(() => {
                this.$refs.channelOperate.init(id, alertBoxAction, this.deviceType, this.channelFlag, this.courtroomId);
            });
        },

        // 批量删除
        deleteMut() {
            let length = this.multipleSelection.length;
            if (length === 0) {
                this.$message.error('请选择需要删除的通道');
                return;
            }
            let ids = [];
            for (let i = 0; i < length; i++) {
                ids.push(this.multipleSelection[i].id);
            }
            this.$confirm(`确定批量删除${length}个通道吗？`, '系統提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                showCancelButton: true,
                customClass: 'confirm-success',
                type: 'warning'
            })
                .then(() => {
                    this.deleteHandle(ids.join(','));
                })
                .catch(() => {
                    // this.$message.info('已取消删除');
                });
        },

        // 删除
        deleteHandle(id) {
            this.deleteChannel(id).then((res) => {
                if (res.code === 0) {
                    if (id.indexOf(',') > -1) {
                        this.tablePaginationData.currentPage = 1;
                    }
                    this.selectionList = [];
                    this.$message.success('删除成功');
                    this.queryList();
                } else {
                    this.$message.error(res.msg);
                }
            });
        },

        close() {
            this.tablePaginationData.currentPage = 1;
            this.selectionList = [];
            this.$refs.multipleTable.clearSelection();
        },

        /* --------------------表格-开始-------------------- */
        // 初始化表格
        initTable() {
            // this.setTableStyle();
            this.queryList();
        },

        // 查询-获取列表
        queryList: debounce(function(search) {
            this.tablePaginationData.currentPage = search ? 1 : this.tablePaginationData.currentPage;
            // flag 通道区分:0=增录通道，1=输入通道，2=输出通道
            // 请求接口-获取列表
            let params = {
                curPage: String(this.tablePaginationData.currentPage),
                limit: String(this.tablePaginationData.pageSize),
                courtroomId: this.courtroomId,
                flag: this.channelFlag,
                deviceType: this.deviceType
            };
            this.queryChannelList(params).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.setTablePagination(res.data);
                    this.resetPageSelection(res.data);
                }
            });
        }, 500),

        // 分页显示
        setTablePagination(data) {
            this.tablePaginationData.total = data.totalCount;
            this.tablePaginationData.pages = Math.ceil(data.totalCount / this.tablePaginationData.pageSize);
        },

        // 分页-勾选回显
        resetPageSelection(data) {
            if (this.tablePaginationData.pages < 1) {
                return false;
            }
            if (this.selectionList.length < 1) {
                for (let i = 0; i < this.tablePaginationData.pages; i++) {
                    this.selectionList.push({
                        page: i + 1,
                        selection: []
                    });
                }
            }
            // console.log('resetPageSelection selectionList', this.selectionList);
            this.multipleSelection = [];
            this.selectionList[this.tablePaginationData.currentPage - 1].selection.forEach((row) => {
                this.multipleSelection.push(row);
            });
            if (this.multipleSelection.length > 0) {
                this.multipleSelection.forEach((selectRow) => {
                    this.$refs.multipleTable.toggleRowSelection(selectRow, true);
                });
            } else {
                this.$refs.multipleTable.clearSelection();
            }
            // console.log('resetSelections multipleSelection', this.multipleSelection);
            this.validSelect = true;
        },

        // 每页数量-pageSize-change事件-表格数据重新渲染
        handleSizeChange(val) {
            this.tablePaginationData.pageSize = val;
            this.queryList();
        },

        // 页码-currentPage-change事件-表格数据重新渲染
        handleCurrentChange(val) {
            this.validSelect = false;
            this.tablePaginationData.currentPage = val;
            this.queryList();
        },

        // 控制操作栏按钮是否显示
        showOperateBtn(row, item, index) {
            return item.active;
        },

        // 列【操作】点击事件
        handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    case 'edit':
                        this.handle(row.id, 'edit');
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
                                this.deleteHandle(row.id);
                            })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                    default:
                        console.log('error');
                        break;
                }
            }
        },

        // 列[选择]-change事件-选中的表格数据发生改变
        handleSelectionChange(val) {
            if (this.validSelect) {
                this.multipleSelection = val;
                console.log('handleSelectionChange multipleSelection', this.multipleSelection);
                this.selectionList[this.tablePaginationData.currentPage - 1].selection = val;
            }
            console.log('handleSelectionChange selectionList', this.selectionList);
        }
        // --------------------表格-结束-------------------- */
    }
};
</script>

<style lang='less' type="text/less" scoped>
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
