<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p class="form-title">警务助手</p>
            <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
        </div>
        <div class="form-body">
            <el-form
                :model="ruleForm"
                label-position="right"
                label-width="2rem"
                status-icon
                ref="ruleForm"
            >
                <el-form-item label="请选择被告" prop="addCheckList">
                    <el-checkbox
                        :indeterminate="isIndeterminate"
                        v-model="checkAll"
                        @change="handleCheckAllChange"
                    >全选</el-checkbox>
                    <el-checkbox-group
                        v-model="ruleForm.addCheckList"
                        @change="handleCheckedListChange"
                    >
                        <el-row>
                            <el-col :span="8" v-for="check in checkList" :key="check.peopleId">
                                <el-checkbox :title="check.name" :label="check.name">{{check.name}}</el-checkbox>
                            </el-col>
                        </el-row>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="其他说明" prop="remark">
                    <el-input type="textarea" v-model="ruleForm.remark" placeholder="其他说明"></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div class="form-bottom">
            <span class="shj-btn--confirm shj-btn--medium" @click="sendMsg()">发送</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="$emit('emitClose')">取消</span>
        </div>
    </div>
</template>

<script>

    import { mapActions } from 'vuex';
    import {getParameter} from '@/utils/utils';
    import { objArr2KeyArr, removeArrDefVal } from '@/utils/utils';
    export default {
        name: 'PoliceAssistant',
        data() {
            return {
                checkList: [],
                /* checkbox-group */
                checkAll: false, // 全选状态
                // 校验表单
                ruleForm: {
                    addCheckList: [], // 复选框选中值
                    remark: ''
                },
                isIndeterminate: false // 设置 indeterminate 状态，只负责样式控制
            };
        },
        mounted() {
            this.init();

        },
        destroyed() {

        },
        methods: {
            // 接口引入
            ...mapActions('modulePolice', ['getDefendantData']),
            // 初始化
            init() {
                this.initDefendantList();
            },
            initDefendantList() {
                this.getDefendantData(this.$route.query.trialId).then((res) => {
                    if (res.code === 0) {
                        this.checkList = res.data;
                    }
                });
            },
            // 发送消息 带被告
            sendMsg() {
                let params = {
                    type: 1,
                    content: "带被告 "+ this.ruleForm.addCheckList.join(' '),
                    otherExplain: this.ruleForm.remark === '' ? '' : ' 其他说明：' + this.ruleForm.remark
                };
                this.$emit('sendMsgToPolice', params);
            },

            /* --------------------checkbox-group事件-开始-------------------- */
            // 点击全选按钮
            handleCheckAllChange(val) {
                this.ruleForm.addCheckList = val
                    ? objArr2KeyArr(this.checkList, 'name')
                    : []; // 将数组转为只含有指定属性的数组
                this.isIndeterminate = false;
            },

            // 点击复选框选项
            handleCheckedListChange(val) {
                this.checkAll = val.length === this.checkList.length;
                this.isIndeterminate =
                    val.length > 0 && val.length < this.checkList.length;
            }
            /* --------------------checkbox-group事件-结束-------------------- */

        }
    };

</script>

<style lang="less" scoped type="text/less">
    /deep/.el-checkbox .el-checkbox__label {
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: @font28px;
        line-height: @form_item_h;
        vertical-align: top;
    }
    .alert-box {
        .alert-box-body {
            width: 900px;
        }
    }
    .main-content {
        height: 100%;
        padding: 30px 0 30px 30px;
        font-size: @font26px;
        letter-spacing: 2px;

    }
</style>
