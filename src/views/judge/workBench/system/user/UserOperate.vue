/* 操作用户
 * @Author: ShiHuiJun
 * @Date: 2020-10-10 09:33:28
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2020-10-13 10:45:31
 */
<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p class="form-title">{{operateBtnName === 'add'?'新增':operateBtnName === 'edit'?'编辑':'查看'}}用户</p>
            <i
                type="primary"
                class="el-icon-close form-top-icon"
                @click="$emit('emitClose')"
            ></i>
        </div>
        <div class="form-body">
            <el-form
                :model="ruleForm"
                label-position="right"
                label-width="1.5rem"
                status-icon
                :rules="operateBtnName !== 'view' ? rules : viewRules"
                ref="ruleForm"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input
                        v-model="ruleForm.username"
                        placeholder
                        clearable
                        :disabled="operateBtnName === 'edit'"
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="真实姓名" prop="name">
                    <el-input
                        v-model="ruleForm.name"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="所属部门" prop="deptId">
                    <el-select
                        filterable
                        v-model="ruleForm.deptId"
                        placeholder=""
                        clearable
                    >
                        <el-option
                            v-for="(item, index) in deptList"
                            :key="index"
                            :label="item.name"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-select
                        v-model="ruleForm.sex"
                        placeholder=""
                        clearable
                    >
                        <el-option v-for="item in sexList"
                                   :key="item.value"
                                   :label="item.key"
                                   :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input
                        v-model="ruleForm.email"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input
                        v-model="ruleForm.mobile"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="创建人" prop="creator">
                    <el-input
                        v-model="ruleForm.creator"
                        placeholder
                        clearable
                        disabled
                    ></el-input>
                    <el-input
                        v-model="ruleForm.createUserId"
                        placeholder
                        clearable
                        disabled
                        type="hidden"
                    ></el-input>
                </el-form-item>
                <el-form-item label="用户角色" prop="checkList">
                    <el-checkbox
                        :indeterminate="isIndeterminate"
                        v-model="checkAll"
                        @change="handleCheckAllChange"
                        >全选</el-checkbox
                    >
                    <el-checkbox-group
                        v-model="ruleForm.roleIdList"
                        @change="handleCheckedListChange"
                    >
                        <el-row>
                            <el-col
                                :span="8"
                                v-for="check in checkList"
                                :key="check.key"
                            >
                                <el-checkbox
                                    :title="check.roleName"
                                    :label="check.roleId"

                                    >{{ check.roleName }}</el-checkbox
                                >
                            </el-col>
                        </el-row>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="是否启用" prop="status">
                    <el-select
                        v-model="ruleForm.status"
                        placeholder=""
                        clearable
                    >
                        <el-option label="启用" :value="1"></el-option>
                        <el-option label="禁用" :value="0"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
        <div class="form-bottom">
            <span class="shj-btn--confirm shj-btn--medium" @click="submitForm()"
                >确定</span
            >
            <span
                class="shj-btn--primary_light shj-btn--medium"
                @click="$emit('emitClose')"
                >取消</span
            >
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
import { objArr2KeyArr } from '@/utils/utils';
export default {
    name: 'UserOperate',
    components: { ShjListPage },
    inject: ['reload', 'userInfo'],
    filters: {},
    props: {
        operateBtnName: {
            type: String,
            default: 'view',
            required: false
        }
    },
    data() {
        let validMobile = (rule, value, callback) => {
            const exp = /^[1]([3-9])[0-9]{9}$/;
            if (value && value !== '' && !exp.test(value) ) {
                callback(new Error('请输入正确的手机号'));
            } else {
                callback();
            }
        };
        let validEmail = (rule, value, callback) => {
            const exp = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (value && value !== '' && !exp.test(value) ) {
                callback(new Error('邮箱格式不正确'));
            } else {
                callback();
            }
        };
        return {
            sexList: [
                {
                    key: '女',
                    value: 0
                },{
                    key: '男',
                    value: 1
                },{
                    key: '未知',
                    value: -1
                }
            ],
            deptList: [],
            // 复选框列表
            checkList: [],
            /* checkbox-group */
            checkAll: false, // 全选状态
            isIndeterminate: false, // 设置 indeterminate 状态，只负责样式控制
            /* 表单 */
            rules: {
                name: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' }
                ],
                username: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' }
                ],
//                deptId: [
//                    { required: true, message: '部门不能为空', trigger: 'blur' }
//                ],
                email: [
                    { validator: validEmail, trigger: 'blur' }
                ],
                mobile: [
                    { validator: validMobile, trigger: 'blur' }
                ]
            },
            viewRules: {}, // 查看模式下表单校验规则
            // 校验表单
            ruleForm: {
                username: '',
                name: '',
                password: 'admin@123',
                deptId: '',
                sex: 1,
                email: '',
                mobile: '',
                creator: this.operateBtnName === 'add' ? this.userInfo().name : '',
                createUserId: this.operateBtnName === 'add' ? this.userInfo().id : '',
                roleIdList: [], // 复选框选中值
                status: 1
            }
        };
    },
    computed: {},
    watch: {},
    created() {
        //
    },
    mounted() {
    },
    methods: {
        ...mapActions({
            detail: 'moduleSystem/getUserDetailById',
            addOrUpdate: 'moduleSystem/addOrUpdateUser',
            getRoleList: 'moduleSystem/getRoleList',
            getDeptList: 'moduleSystem/getDeptListNormal'
        }),

        // 初始化
        init(formData) {
            this.getRoleList().then((res) => {
                if (res.code === 0) {
                    this.checkList = res.data;
                }
            }).then(() => {
                this.getDeptList({}).then((res) => {
                    if (res.code === 0) {
                        this.deptList = res.data;
                    }
                })
            }).then(() => {
                this.$nextTick(() => {
                    if(formData){
                        let {password,...params} = formData; // 删除password字段
                        this.ruleForm = params;
                        this.ruleForm.roleIdList = params.roleIds ? params.roleIds.split(',') : [];
                    }
                })
            })
        },

        // 确定
        submitForm() {
            this.$refs['ruleForm'].validate((valid) => {
                if (valid) {
                    let params = this.ruleForm;
                    params.id = this.operateBtnName !== 'add' ? this.ruleForm.id : null;
                    this.reqAddOrUpdate(params);
                }
            });
        },

        // 新增、修改
        reqAddOrUpdate(params) {
            this.addOrUpdate(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.$emit('refreshDataList');
                }
            });
        },

        /* --------------------checkbox-group事件-开始-------------------- */
        // 点击全选按钮
        handleCheckAllChange(val) {
            this.ruleForm.roleIdList = val
                ? objArr2KeyArr(this.checkList, 'roleId')
                : []; // 将数组转为只含有指定属性的数组
            this.isIndeterminate = false;
        },

        // 点击复选框选项
        handleCheckedListChange(val) {
            if(!val) return;
            this.checkAll = val.length === this.checkList.length;
            this.isIndeterminate =
                val.length > 0 && val.length < this.checkList.length;
        }
        /* --------------------checkbox-group事件-结束-------------------- */
    }
};
</script>

<style lang="less" scoped>
.alert-box {
    .alert-box-body {
        width: 50%;
        /deep/.el-checkbox .el-checkbox__label {
            width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: @font28px;
            line-height: @form_item_h;
            vertical-align: top;
        }
    }
}
</style>
