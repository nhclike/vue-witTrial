<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">权限管理</span>
                </div>
                <div class="opt-box">
                    <div class="title">权限列表</div>
                    <div class="opt-btns">
                        <button class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="addOrUpdateHandle()"
                        >
                            <i class="i-addCourt"></i>新增权限
                        </button>
                    </div>
                </div>
            </div>
            <!-- 列表内容区 --><!--:model="tableData"-->
            <div class="tableContent" :style="tableStyle">
                <el-table
                    element-loading-text="拼命加载中"
                    :data="tableData"
                    style="width: 100%"
                    ref="multipleTable"
                    :row-key="getRowKeys"
                    :indent="30"
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
                        prop="name"
                        header-align="center"
                        min-width="150"
                        label="权限名称" >
                    </el-table-column>
                    <el-table-column
                        prop="parentName"
                        header-align="center"
                        align="center"
                        min-width="100"
                        label="上级菜单">
                    </el-table-column>
                    <!--<el-table-column
                        header-align="center"
                        align="center"
                        label="图标">
                    </el-table-column>-->
                    <el-table-column
                        prop="type"
                        header-align="center"
                        align="center"
                        label="类型">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.type === 0" size="small">目录</el-tag>
                            <el-tag v-else-if="scope.row.type === 1" size="small" type="success">菜单</el-tag>
                            <el-tag v-else-if="scope.row.type === 2" size="small" type="info">按钮</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="orderNum"
                        header-align="center"
                        align="center"
                        label="排序号">
                    </el-table-column>
                    <!--<el-table-column
                        prop="url"
                        header-align="center"
                        align="center"
                        width="150"
                        :show-overflow-tooltip="true"
                        label="菜单URL">
                    </el-table-column>-->
                    <el-table-column
                        prop="perms"
                        header-align="center"
                        align="center"
                        min-width="100"
                        :show-overflow-tooltip="true"
                        label="授权标识">
                    </el-table-column>
                    <el-table-column
                        v-if="showTableOperate"
                        label="操作"
                        width
                        min-width="60"
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
        </div>
        <!-- 弹窗 新增 修改 -->
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="queryList"></add-or-update>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import { treeDataTranslate } from '@/utils/utils';
import AddOrUpdate from '@/views/judge/workBench/system/permission/PermissionOperate';
export default {
    name: 'PermissionManagement',
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
            /* 表格 */
            // 设置表格的row-key
            getRowKeys(row) {
                return row.menuId;
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
            ]
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
        ...mapActions('moduleSystem', ['queryPermList', 'deletePerm']),

        // 新增 / 修改
        addOrUpdateHandle(id) {
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.addOrUpdate.init(id);
            });
        },

        // 删除
        deleteHandle(id) {
            this.deletePerm(id).then((res) => {
                if (res.code === 0) {
                    this.$message.success('删除成功');
                    this.queryList();
                } else {
                    this.$message.error(res.msg);
                }
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
            this.tableStyle = `height:calc(100% - ${topH + 10}px)`;
        },

        // 查询-获取列表
        queryList() {
            // 请求接口-获取列表
            this.queryPermList().then((res) => {
                if (res.code === 0) {
                    this.tableData = treeDataTranslate(res.data, 'menuId');
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
                        this.addOrUpdateHandle(row.menuId);
                        break;
                    case 'delete':
                        this.$confirm(`确定删除吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        }).then(() => {
                            this.deleteHandle(row.menuId);
                        })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                }
            }
        }
        /* --------------------表格-结束-------------------- */


    }
};
</script>
<style lang="less" scoped>
    @import '../../../../../assets/style/table/el-table.less';
</style>
