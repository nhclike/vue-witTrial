<template>
    <el-dialog
        :title="!dataForm.id ? '新增权限' : '修改权限'"
        :close-on-click-modal="false"
        :visible.sync="visible">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="112px">
            <el-form-item label="类型" prop="type">
                <el-radio-group v-model="dataForm.type">
                    <el-radio v-for="(type, index) in dataForm.typeList" :label="index" :key="index">{{ type }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="dataForm.typeList[dataForm.type] + '名称'" prop="name">
                <el-input v-model="dataForm.name" :placeholder="dataForm.typeList[dataForm.type] + '名称'"></el-input>
            </el-form-item>
            <el-form-item label="上级菜单" prop="parentName">
                <el-popover
                    ref="menuListPopover"
                    placement="bottom-start"
                    trigger="click">
                    <el-tree
                        :data="menuList"
                        :props="menuListTreeProps"
                        node-key="menuId"
                        ref="menuListTree"
                        @current-change="menuListTreeCurrentChangeHandle"
                        :default-expand-all="true"
                        :highlight-current="true"
                        :expand-on-click-node="false">
                    </el-tree>
                </el-popover>
                <el-input v-model="dataForm.parentName" v-popover:menuListPopover :readonly="true" placeholder="点击选择上级菜单" class="menu-list__input"></el-input>
            </el-form-item>
            <el-form-item v-if="dataForm.type === 1" label="菜单路由" prop="url">
                <el-input v-model="dataForm.url" placeholder="菜单路由"></el-input>
            </el-form-item>
            <el-form-item v-if="dataForm.type !== 0" label="授权标识" prop="perms">
                <el-input v-model="dataForm.perms" placeholder="多个用逗号分隔, 如: user:list,user:create"></el-input>
            </el-form-item>
            <el-form-item label="排序号" prop="orderNum">
                <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序号"></el-input-number>
            </el-form-item>
            <el-form-item v-if="dataForm.type !== 2" label="菜单图标" prop="icon">
                <el-input v-model="dataForm.icon"  placeholder="菜单图标名称" class="icon-list__input"></el-input>
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
            let validateUrl = (rule, value, callback) => {
                if (this.dataForm.type === 1 && !/\S/.test(value)) {
                    callback(new Error('菜单URL不能为空'))
                } else {
                    callback()
                }
            }
            return {
                visible: false,
                dataForm: {
                    id: 0,
                    type: 1,
                    typeList: ['目录', '菜单', '按钮'],
                    name: '',
                    parentId: 0,
                    parentName: '',
                    url: '',
                    perms: '',
                    orderNum: 0,
                    icon: ''
                },
                dataRule: {
                    name: [
                        { required: true, message: '菜单名称不能为空', trigger: 'blur' }
                    ]/*,
                    parentName: [
                        { required: true, message: '上级菜单不能为空', trigger: 'change' }
                    ],
                    url: [
                        { validator: validateUrl, trigger: 'blur' }
                    ]*/
                },
                menuList: [],
                menuListTreeProps: {
                    label: 'name',
                    children: 'children'
                }
            }
        },
        created () {

        },
        methods: {
            ...mapActions('moduleSystem', ['queryPermList', 'getPermDetail', 'addOrUpdatePerm']),
            init (id) {
                this.dataForm.id = id || 0;
                this.queryPermList().then((res) => {
                    if(res.code === 0) {
                        this.menuList = treeDataTranslate(res.data, 'menuId')
                    }
                }).then(() => {
                    this.visible = true;
                    this.$nextTick(() => {
                        this.$refs['dataForm'].resetFields()
                    })
                }).then(() => {
                    if (!this.dataForm.id) {
                        // 新增
                        this.menuListTreeSetCurrentNode()
                    } else {
                        // 修改
                        this.getPermDetail(`${this.dataForm.id}`).then((res) => {
                            if(res.code === 0) {
                                this.dataForm.id = res.data.menuId;
                                this.dataForm.type = res.data.type;
                                this.dataForm.name = res.data.name;
                                this.dataForm.parentId = res.data.parentId;
                                this.dataForm.url = res.data.url;
                                this.dataForm.perms = res.data.perms;
                                this.dataForm.orderNum = res.data.orderNum;
                                this.dataForm.icon = res.data.icon;
                                this.menuListTreeSetCurrentNode()
                            }
                        })
                    }
                })
            },
            // 菜单树选中
            menuListTreeCurrentChangeHandle (data, node) {
                this.dataForm.parentId = data.menuId;
                this.dataForm.parentName = data.name
            },
            // 菜单树设置当前选中节点
            menuListTreeSetCurrentNode () {
                this.$refs.menuListTree.setCurrentKey(this.dataForm.parentId);
                this.dataForm.parentName = (this.$refs.menuListTree.getCurrentNode() || {})['name']
            },
            // 表单提交
            dataFormSubmit () {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        let params = {
                            'menuId': this.dataForm.id || undefined,
                            'type': this.dataForm.type,
                            'name': this.dataForm.name,
                            'parentId': this.dataForm.parentId,
                            'url': this.dataForm.url,
                            'perms': this.dataForm.perms,
                            'orderNum': this.dataForm.orderNum,
                            'icon': this.dataForm.icon
                        };
                        this.addOrUpdatePerm(params).then((res) => {
                            if (res.code === 0) {
                                this.$message.success('操作成功');
                                this.visible = false;
                                this.$emit('refreshDataList')
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
    /deep/ .el-popover {
        width: 300px;
    }

</style>
