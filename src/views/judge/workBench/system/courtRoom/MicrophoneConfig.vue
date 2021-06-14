<template>
    <el-dialog
        title="话筒配置"
        :close-on-click-modal="false"
        :visible.sync="visible">
        <form
            label-position="right"
            label-width="1.7rem"
            status-icon
            ref="ruleForm"
        >
            <div v-for="(item, index) in roleList"
                 :key="item.roleId"
                 style="clear: both"
            >
                <div class="percent percent15">
                    <label class="label">{{item.roleName}}</label>
                </div>
                <div class="percent percent15">
                    <input
                        class="custom-input"
                        :value="index + 1"
                        disabled
                    >
                </div>
                <div class="percent percent33">
                    <input
                        class="custom-input"
                        :ref="'XF_'+(index+1)"
                        placeholder="讯飞话筒"
                    >
                </div>
                <div class="percent percent33">
                    <input
                        class="custom-input"
                        :ref="'YJ_'+(index+1)"
                        placeholder="云嘉话筒"
                    >
                </div>
            </div>
        </form>
        <div slot="footer" class="dialog-footer">
            <span class="shj-btn--confirm shj-btn--medium" @click="submitForm()">确定</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="visible = false">取消</span>
        </div>
    </el-dialog>
</template>

<script>
    import { mapActions } from 'vuex';
    export default {
        components: {},
        name: 'ConfigMicrophone',
        inject: ['reload'],
        filters: {},
        data() {
            return {
                visible: false,
                roomId: '', // 法庭id
                roleList: [], // 角色列表
                /* 表单 */
                rules: {

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
                detail: 'moduleSystem/getMicrophoneInfo',
                getRoleList: 'moduleSystem/getRoleList',
                addOrUpdate: 'moduleSystem/updateMicrophone'
            }),

            // 初始化
            init(id) {
                this.visible = true;
                this.roomId = id;
                this.$nextTick(() => {
                    this.$refs['ruleForm'].reset();
                });
                this.getRoleList('exclude=sysAdmin,admin,suspects').then((res) => {
                    if (res.code === 0) {
                        this.roleList = res.data;
                    }
                }).then(() => {
                    this.detail({roomId: this.roomId}).then((res) => {
                        if (res.code === 0 && res.data && res.data.length > 0) {
                            this.renderFormValue(res.data)
                        }
                    })
                })

            },

            // 确定
            submitForm() {
                let params = [];
                for (let i = 0; i < this.roleList.length; i++) {
                    params.push({
                        roomId: this.roomId,
                        microphoneId: i + 1,
                        personName: this.roleList[i].roleName,
                        micIdYj: this.$refs[`YJ_${i+1}`][0].value,            // 云嘉话筒
                        microphoneName: this.$refs[`XF_${i+1}`][0].value      // 讯飞话筒

                    })
                }
                this.reqAddOrUpdate(params);
            },
            // 更新
            reqAddOrUpdate(params){
                this.addOrUpdate(params).then((res) => {
                    if (res.code === 0) {
                        this.$message({
                            message: '操作成功',
                            type: 'success',
                            duration: 1500,
                            onClose: () => {
                                this.visible = false;
                            }
                        })
                    }
                });
            },
            renderFormValue(array) {
                for(let i = 0; i < this.roleList.length; i++) {
                    let index = array.findIndex((p => p.personName === this.roleList[i].roleName));
                    this.$refs[`XF_${index+1}`][0].value = array[index].microphoneName;
                    this.$refs[`YJ_${index+1}`][0].value = array[index].micIdYj;
                }
            }
        }
    };
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
    /deep/ .el-dialog__body {
        max-height: 800px;
        overflow: auto;
    }
    /deep/ .el-dialog__footer {
        text-align: center;
        span {
            margin: 0 20px;
        }
    }
    /deep/ .el-col {
        padding: 0 20px 20px 0;
    }
    .percent {
        float: left;
        padding: 0 20px 20px 0;
        &.percent15 {
            width: 15%;
        }
        &.percent33 {
            width: 33%;
        }
    }
    .label {
        display: inline-block;
        width: 100%;
        color: #606266;
        font-size: @font28px;
        text-align: right;
    }
    .custom-input {
        display: inline-block;
        width: 100%;
        font-size: @font28px;
        border-radius: 5px;
        padding: 0 3px 0 15px;
        height: 40px;
        line-height: 40px;
        color: #606266;
        border: 1px solid #DCDFE6;
        &[disabled] {
            color: #C0C4CC;
            cursor: not-allowed;
        }
        &:focus {
            border: 1px solid #409EFF;
            outline: 0;
        }
        &::-webkit-input-placeholder {
            color: #c8cedb;
        }
        &:-moz-placeholder {
            color: #c8cedb;
        }
        &:-ms-input-placeholder {
            color: #c8cedb;
        }
    }
</style>

