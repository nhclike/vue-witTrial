/* 操作字典
 * @Author: ShiHuiJun
 * @Date: 2020-10-10 09:33:28
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2020-10-13 10:45:31
 */
<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p class="form-title">{{operateBtnName === 'add'?'新增':operateBtnName === 'edit'?'编辑':'查看'}}字典</p>
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
                label-width="1.6rem"
                status-icon
                :rules="operateBtnName !== 'view' ? rules : viewRules"
                ref="ruleForm"
            >
                <el-form-item label="字典名称" prop="name">
                    <el-input
                        v-model="ruleForm.name"
                        placeholder
                        clearable
                        :disabled="operateBtnName === 'edit'"
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="字典类型" prop="type">
                    <el-input
                        v-model="ruleForm.type"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="字典code" prop="code">
                    <el-input
                        v-model="ruleForm.code"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="字典值" prop="value">
                    <el-input
                        v-model="ruleForm.value"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="排序" prop="orderNum">
                    <el-input
                        v-model="ruleForm.orderNum"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input
                        v-model="ruleForm.remark"
                        placeholder
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>
                <el-form-item label="是否启用" prop="delFlag">
                    <el-select
                        v-model="ruleForm.delFlag"
                        placeholder=""
                        clearable
                    >
                        <el-option label="启用" :value="0"></el-option>
                        <el-option label="禁用" :value="-1"></el-option>
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
    name: 'DictOperate',
    components: { ShjListPage },
    filters: {},
    props: {
        operateBtnName: {
            type: String,
            default: 'view',
            required: false
        }
    },
    data() {
        return {
            isIndeterminate: false, // 设置 indeterminate 状态，只负责样式控制
            /* 表单 */
            rules: {
                name: [
                    { required: true, message: '名称不能为空', trigger: 'blur' }
                ],
                type: [
                    { required: true, message: '类型不能为空', trigger: 'blur' }
                ],
                code: [
                    { required: true, message: 'code不能为空', trigger: 'blur' }
                ],
                value: [
                    { required: true, message: '字典值不能为空', trigger: 'blur' }
                ]
            },
            viewRules: {}, // 查看模式下表单校验规则
            // 校验表单
            ruleForm: {
                id: null,
                name: '',
                type: '',
                code: '',
                value: '',
                orderNum: '',
                remark:'',
                delFlag: 0
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
            detail: 'moduleSystem/getDictDetailById',
            addOrUpdate: 'moduleSystem/addOrUpdateDict'
        }),
        // 初始化
        init(formData) {
            this.ruleForm = formData;
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
        }
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

<style lang="less">
</style>

