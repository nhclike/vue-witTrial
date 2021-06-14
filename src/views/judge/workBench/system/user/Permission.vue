<template>
    <el-dialog
        title="用户权限配置"
        :close-on-click-modal="false"
        :visible.sync="visible"
    >
        <div class="full-height">
            <div class="shjListPage">
                <div ref="top" class="list-top">
                    <el-row>
                        <el-col :span="12">
                            <span>用户：</span>
                            <label>{{ userInfo.name }}</label>
                        </el-col>
                        <el-col :span="12">
                            <span>部门：</span>
                            <label>{{ userInfo.deptName }}</label>
                        </el-col>
                    </el-row>
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
                            prop="privTypeName"
                            header-align="center"
                            align="center"
                            minWidth="100"
                            label="权限分类"
                        ></el-table-column>
                        <el-table-column
                            label="操作"
                            width
                            min-width="100"
                            align="center"
                            header-align="center"
                        >
                            <template slot-scope="scope">
                                <el-checkbox
                                    v-for="(item, index) in scope.row.dataPrivs"
                                    :key="scope.row.privType + index"
                                    :label="item.privName"
                                    :checked="item.has === '1'"
                                    @change="handleClick(scope.$index, index)"
                                ></el-checkbox>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <div slot="footer" class="dialog-footer text-center">
                <span class="shj-btn--confirm shj-btn--medium mr30" @click="dataFormSubmit()">确定</span>
                <span class="shj-btn--primary_light shj-btn--medium" @click="visible = false">取消</span>
            </div>
        </div>
    </el-dialog>
</template>

<script>
import { mapActions } from 'vuex';
export default {
    name: 'userPermission',
    components: {},
    inject: ['reload'],
    props: {},
    data() {
        return {
            visible: false,
            userInfo: {
                name: '',
                deptName: ''
            },
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
            tableData: []// 列[操作-按钮]-数据
        };
    },
    computed: {},
    watch: {},
    created() {
        //
    },
    beforeDestroy() {
        this.tableData = [];
    },
    methods: {
        ...mapActions('moduleSystem', ['queryUserPermissionList', 'saveUserPermission']),
        // 初始化
        init(row) {
            this.tableData = [];
            this.visible = true;
            this.userInfo = row;
            this.initTable();
        },

        /* --------------------表格-开始-------------------- */
        // 初始化表格
        initTable() {
            this.queryList();
        },

        // 查询-获取列表
        queryList() {
            // 请求接口-获取列表
            this.queryUserPermissionList(this.userInfo.id).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data;
                }
            });
        },
        dataFormSubmit() {
            const userDataPrivs = [];
            if (document.querySelector('input[type=checkbox]:checked')) {
                this.tableData.forEach((item) => {
                    item.dataPrivs.forEach((item2) => {
                        if (item2.has === '1') {
                            userDataPrivs.push({
                                privCode: item2.privCode,
                                privType: item.privType,
                                privValue: item2.privName,
                                userId: this.userInfo.id
                            });
                        }
                    });
                });
            }
            let params = {
                userId: this.userInfo.id,
                userDataPrivs: userDataPrivs
            };
            this.saveUserPermission(params).then((res) => {
                if (res.code === 0) {
                    this.$message({
                        message: '操作成功',
                        type: 'success',
                        duration: 1500,
                        onClose: () => {
                            this.visible = false;
                        }
                    });
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
        handleClick($index, index) {
            this.tableData[$index].dataPrivs[index].has = event.target.checked ? '1' : '0';
        }
        // --------------------表格-结束-------------------- */
    }
};
</script>

<style lang='less' type="text/less" scoped>
.shjListPage {
    height: calc(100% - 60px);
    .list-top {
        font-size: @font26px;
        label {
            font-weight: 600;
        }
    }
    .tableContent /deep/ .el-table {
         thead tr th {
             color: #333;
             font-weight: 600;
             background-color: #ddd;
         }
        tbody tr td{
            border-bottom: 1px solid #ccc;
            &:first-child {
                background-color: #eee;
            }
        }
    }
}
.mr30 {
    margin-right: 30px;
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
