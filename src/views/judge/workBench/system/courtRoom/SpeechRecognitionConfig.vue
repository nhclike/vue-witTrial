<template>
    <el-dialog
        title="语音识别配置"
        :close-on-click-modal="false"
        :visible.sync="visible">
        <el-form :model="dataFormXF" :rules="dataRuleXF" ref="dataFormXF" label-width="112px" key="xf">
            <span class="shj-btn--confirm shj-btn--medium formTitle">讯飞</span>
            <el-form-item prop="manufacturer" style="display: none;">
                <el-input v-model="dataFormXF.manufacturer"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="dataFormXF.status" @change="radioChange('XF')">
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="服务IP" prop="ip">
                <el-input
                    v-model="dataFormXF.ip"
                    placeholder="服务IP"
                ></el-input>
            </el-form-item>
            <el-form-item label="端口" prop="port">
                <el-input v-model="dataFormXF.port" placeholder="端口"></el-input>
            </el-form-item>
            <el-form-item label="同步地址" prop="syncAddress">
                <el-input v-model="dataFormXF.syncAddress" placeholder="同步地址"></el-input>
            </el-form-item>
            <el-form-item label="系统编号" prop="configKey">
                <el-input v-model="dataFormXF.configKey" placeholder="系统编号"></el-input>
            </el-form-item>
        </el-form>
        <el-form class="mt50" :model="dataFormYJ" :rules="dataRuleYJ" ref="dataFormYJ" label-width="112px" key="yj">
            <span class="shj-btn--confirm shj-btn--medium formTitle">云嘉</span>
            <el-form-item prop="manufacturer" style="display: none;">
                <el-input v-model="dataFormYJ.manufacturer"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="dataFormYJ.status" @change="radioChange('YJ')">
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="服务IP" prop="ip">
                <el-input
                    v-model="dataFormYJ.ip"
                    placeholder="服务IP"
                ></el-input>
            </el-form-item>
            <el-form-item label="端口" prop="port">
                <el-input v-model="dataFormYJ.port" placeholder="端口"></el-input>
            </el-form-item>
            <el-form-item label="同步地址" prop="syncAddress">
                <el-input v-model="dataFormYJ.syncAddress" placeholder="同步地址"></el-input>
            </el-form-item>
            <el-form-item label="RedisKey" prop="configKey">
                <el-input v-model="dataFormYJ.configKey" placeholder="RedisKey"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <span class="shj-btn--confirm shj-btn--medium" @click="formValidate()">确定</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="visible = false">取消</span>
        </div>
    </el-dialog>
</template>

<script>
    import { mapActions } from 'vuex';
    export default {
        data () {
            return {
                visible: false,
                dataFormXF: {
                    manufacturer: 'xf',
                    roomId: '',
                    ip: '',
                    port: '',
                    syncAddress: '',
                    configKey: '',
                    status: 0
                },
                dataFormYJ: {
                    manufacturer: 'yj',
                    roomId: '',
                    ip: '',
                    port: '',
                    syncAddress: '',
                    configKey: '',
                    status: 0
                },
                dataRuleXF: {

                },
                dataRuleYJ: {

                }
            }
        },
        created () {

        },
        methods: {
            ...mapActions('moduleSystem', ['getSpeechRecogInfo', 'updateSpeechRecog']),
            init (id) {
                this.dataFormXF.roomId = id;
                this.dataFormYJ.roomId = id;
                this.visible = true;
                this.$nextTick(() => {
                    this.$refs['dataFormXF'].resetFields();
                    this.$refs['dataFormYJ'].resetFields();
                });
                this.getSpeechRecogInfo({roomId:id}).then((res) => {
                    if(res.code === 0) {
                        if(res.data) {
                            const array = Object.keys(res.data);
                            if(array.indexOf('xf') > -1) this.dataFormXF = res.data.xf;
                            if(array.indexOf('yj') > -1) this.dataFormYJ = res.data.yj;
                        }
                    }
                })

            },
            formValidate() {
                const xf = new Promise((resolve, reject) => {
                    this.$refs['dataFormXF'].validate(valid => {
                        if (valid) resolve()
                    })
                });
                const yj = new Promise((resolve, reject) => {
                    this.$refs['dataFormYJ'].validate(valid => {
                        if (valid) resolve()
                    })
                });
                Promise.all([xf, yj]).then(() => {
                    this.dataFormSubmit();
                })
            },
            // 表单提交
            dataFormSubmit () {
                let params = [this.dataFormXF,this.dataFormYJ];
                this.updateSpeechRecog(params).then((res) => {
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
                })
            },
            radioChange(type) {
                if(type === 'XF' && this.dataFormXF.status === 1) {
                    this.dataFormYJ.status = 0
                }else if(type === 'YJ' && this.dataFormYJ.status === 1) {
                    this.dataFormXF.status = 0
                }
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
    /deep/ .el-form{
        border: 1px solid #909399;
        padding:  50px 30px 15px 30px;
        margin: 30px 15px 0 15px;
        position: relative;
    }
    .formTitle {
        position: absolute;
        top: -35px;
        left: 20px;
    }
    .mt50 {
        margin-top: 50px;
    }
</style>
