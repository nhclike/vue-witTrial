/* 系统配置操作
*/
<template>
  <div class="alert-box-body">
    <div class="form-top">
      <p class="form-title">{{operateBtnName === 'add'?'新增':operateBtnName === 'edit'?'编辑':'查看'}}配置</p>
      <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
    </div>
    <div class="form-body">
      <el-form
        :model="ruleForm" label-position="right" label-width="1.4rem" status-icon :rules="operateBtnName !== 'view' ? rules : viewRules"
        ref="ruleForm"
      >
        <el-form-item label="key" prop="paramKey">
          <el-input
            :disabled="operateBtnName === 'view' ? true:false"
            v-model="ruleForm.paramKey"
            placeholder
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="值" prop="paramValue">
          <el-input
            :disabled="operateBtnName === 'view' ? true:false"
            v-model="ruleForm.paramValue"
            placeholder
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input
            :disabled="operateBtnName === 'view' ? true:false"
            v-model="ruleForm.remark"
            placeholder
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            :disabled="operateBtnName === 'view' ? true:false"
            v-model="ruleForm.status"
            placeholder=""
            clearable
          >
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="form-bottom" v-if="showOperate">
      <span class="shj-btn--confirm shj-btn--medium" @click="submitForm()">确定</span>
      <span class="shj-btn--primary_light shj-btn--medium" @click="cancel()">取消</span>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import ShjListPage from '@/components/common/ShjListPage';
  import { treeDataTranslate } from '@/utils/utils';
  export default {
    name: 'ConfigOperate',
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
        // 控制是否由操作按钮
        showOperate: this.operateBtnName ==='view'? false: true,

        isIndeterminate: false, // 设置 indeterminate 状态，只负责样式控制
        /* 表单 */
        rules: {
          paramKey: [
            { required: true, message: 'key不能为空', trigger: 'blur' }
          ],
          paramValue: [
            { required: true, message: '值不能为空', trigger: 'blur' }
          ]
        },
        viewRules: {}, // 查看模式下表单校验规则
        // 校验表单
        ruleForm: {
          paramKey: '',
          paramValue: '',
          remark: '',
          status: ''
        }
      };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {},
    methods: {
      ...mapActions( 'moduleSystem', ['systemConfigUpdate', 'systemConfigSave']),

    // 初始化
      init(data) {
        if(data){
          this.ruleForm = data;
        }
      },

      cancel() {
        this.$emit('refreshDataList')
      },
      // 重置
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },

      // 确定
      submitForm() {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            let params = this.ruleForm;
            this.reqAddOrUpdate(params);
          }
        });
      },

      // 新增、修改
      reqAddOrUpdate(params) {
        if (this.operateBtnName ==='add') {
          this.systemConfigSave(params).then((res) => {
            if (res.code === 0) {
              this.$message.success(`${res.msg}`);
              this.$emit('refreshDataList');
            }
          });
        }else {
          this.systemConfigUpdate(params).then((res) => {
            if (res.code === 0) {
              this.$message.success(`${res.msg}`);
              this.$emit('refreshDataList');
            }
          });
        }
      },

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

