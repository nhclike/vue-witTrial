<template>
    <el-dialog
        :title="!dataForm.id ? '新增角色' : '修改角色'"
        :close-on-click-modal="false"
        :visible.sync="visible">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="112px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="dataForm.roleName" placeholder="角色名称"
                          maxlength="50"
                ></el-input>
            </el-form-item>
            <el-form-item label="角色code" prop="roleCode">
                <el-input v-model="dataForm.roleCode" placeholder="角色code" :disabled="dataForm.id ? true : false"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="dataForm.remark" placeholder="备注"></el-input>
            </el-form-item>
            <el-form-item size="mini" label="授权">
                <el-tree
                    :data="menuList"
                    :props="menuListTreeProps"
                    node-key="menuId"
                    ref="menuListTree"
                    :default-expand-all="true"
                    check-strictly="true"
                    show-checkbox
                    >
                </el-tree>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <span class="shj-btn--confirm shj-btn--medium" @click="dataFormSubmit()">确定</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="visible = false">取消</span>
        </div>
    </el-dialog>
</template>

<script>
    import { mapActions } from 'vuex';
    import { treeDataTranslate } from '@/utils/utils';
    export default {
        data () {
            return {
                visible: false,
                menuList: [],
                menuListTreeProps: {
                    label: 'name',
                    children: 'children'
                },
                dataForm: {
                    id: 0,
                    roleName: '',
                    roleCode: '',
                    remark: ''
                },
                dataRule: {
                    roleName: [
                        { required: true, message: '角色名称不能为空', trigger: 'blur' }
                    ]
                },
                tempKey: -666666 // 临时key, 用于解决tree半选中状态项不能传给后台接口问题. # 待优化
            }
        },
        created () {

        },
        methods: {
            ...mapActions('moduleSystem', ['queryPermList', 'queryRoleList', 'getRoleDetail', 'addOrUpdateRole']),
            init (id) {
                this.dataForm.id = id || 0;
                this.queryPermList().then((res) => {
                    if(res.code === 0) {
                        this.menuList = treeDataTranslate(res.data, 'menuId')
                    }
                }).then(() => {
                    this.visible = true;
                    this.$nextTick(() => {
                        this.$refs['dataForm'].resetFields();
                        this.$refs.menuListTree.setCheckedKeys([])
                    })
                }).then(() => {
                    if (this.dataForm.id) {
                        // 修改
                        this.getRoleDetail(`${this.dataForm.id}`).then((res) => {
                            if(res.code === 0) {
                                this.dataForm.roleName = res.data.roleName;
                                this.dataForm.roleCode = res.data.roleCode;
                                this.dataForm.remark = res.data.remark;
                                let idx = res.data.menuIdList.indexOf(this.tempKey);
                                if (idx !== -1) {
//                                    res.data.menuIdList.splice(idx, res.data.menuIdList.length - idx)
                                    res.data.menuIdList.splice(idx, res.data.menuIdList.length - idx)
                                }
                                this.$refs.menuListTree.setCheckedKeys(res.data.menuIdList);
                            }
                        })
                    }
                })
            },
            // 表单提交
            dataFormSubmit () {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        let params = {
                            'roleId': this.dataForm.id || undefined,
                            'roleName': this.dataForm.roleName,
                            'roleCode': this.dataForm.roleCode,
                            'remark': this.dataForm.remark,
//                            'menuIdList': [].concat(this.$refs.menuListTree.getCheckedKeys(), [this.tempKey], this.$refs.menuListTree.getHalfCheckedKeys())
                            'menuIdList': [].concat(this.$refs.menuListTree.getCheckedKeys())
                        };
                        this.addOrUpdateRole(params).then((res) => {
                            if (res.code === 0) {
                                this.$message({
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 1500,
                                    onClose: () => {
                                        this.visible = false;
                                        this.$emit('refreshDataList')
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    }
</script>

<style lang='less' type="text/less" scoped>
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
    /deep/ .el-tree {
        height: 300px;
        overflow: auto;
        .el-tree-node__content {
            height: 40px;
        }
        .el-tree-node__label{
            font-size: @font26px;
        }
        .el-tree-node__expand-icon {
            font-size: @font24px;
        }
    }
</style>
