<template>
    <el-dialog
        :title="alertTitle"
        :close-on-click-modal="false"
        append-to-body
        :visible.sync="visible"
        @close="closeDialog"
    >
        <el-form
            :model="dataForm"
            :rules="alertBoxAction==='add'?addRule:dataRule"
            ref="dataForm"
            @keyup.enter.native="dataFormSubmit()"
            label-width="170px"
        >
            <!-- 输入通道|输出通道|增录通道|新增通道 -->
            <el-form-item label="通道号" prop="channelId">
                <el-input
                    v-model="dataForm.channelId"
                    placeholder="通道号"
                    :disabled="alertBoxAction!=='add'"
                ></el-input>
            </el-form-item>
            <el-form-item label="通道名称" prop="name">
                <el-input v-model="dataForm.name" placeholder="通道名称"></el-input>
            </el-form-item>
            <!-- 新增通道 -->
            <template v-if="deviceType == '2'">
                <el-form-item label="组号" prop="number">
                    <el-input v-model="dataForm.number" placeholder="组号"></el-input>
                </el-form-item>
                <!-- <el-form-item label="分隔模式" prop="mode">
                    <el-input v-model="dataForm.mode"></el-input>
                </el-form-item>-->
            </template>
            <!-- 增录通道 -->
            <template v-if="deviceType === '1'&&channelFlag == '0'">
                <el-form-item label="通道类型" prop="channelType">
                    <el-input v-model="dataForm.channelType" disabled></el-input>
                </el-form-item>
                <el-form-item label="通道类型编号" prop="number">
                    <el-input v-model="dataForm.number" disabled></el-input>
                </el-form-item>
                <el-form-item label="通道流类型" prop="streamType">
                    <el-input v-model="dataForm.streamType" disabled></el-input>
                </el-form-item>
                <el-form-item label="设备唯一通道号" prop="uniqueChannel">
                    <el-input v-model="dataForm.uniqueChannel" disabled></el-input>
                </el-form-item>
            </template>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <span class="shj-btn--confirm shj-btn--medium" @click="dataFormSubmit()">确定</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="visible = false">取消</span>
        </div>
    </el-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import { validNonNegativeInteger } from '@/utils/validate';
export default {
    data() {
        return {
            visible: false,
            alertBoxAction: null, // add|edit|view
            deviceType: '1', // 主机类型
            channelFlag: null,
            courtroomId: null,
            dataForm: {
                id: 0,
                name: '',
                channelId: null,
                channelType: null,
                number: null,
                streamType: null,
                uniqueChannel: null
                // mode: null,
            },
            addRule: {
                channelId: [{ required: true, trigger: ['blur', 'change'], validator: validNonNegativeInteger }],
                number: [{ required: true, trigger: ['blur', 'change'], validator: validNonNegativeInteger }],
                // mode: [{ required: true, message: '分隔模式不能为空', trigger: 'blur' }],
                name: [{ required: true, message: '通道名称不能为空', trigger: ['blur', 'change'] }]
            },
            dataRule: {
                name: [{ required: true, message: '通道名称不能为空', trigger: ['blur', 'change'] }],
                number: [{ required: true, trigger: ['blur', 'change'], validator: validNonNegativeInteger }]
            }
        };
    },
    computed: {
        alertTitle() {
            let action = (alertBoxAction) => {
                return (
                    {
                        add: '新增',
                        edit: '修改',
                        view: '查看'
                    }[alertBoxAction] || ''
                );
            };

            let name = (channelFlag) => {
                return (
                    {
                        0: '增录通道',
                        1: '输入通道',
                        2: '输出通道'
                    }[this.channelFlag] || ''
                );
            };

            return action(this.alertBoxAction) + name(this.channelFlag);
        }
    },
    created() {},
    methods: {
        ...mapActions('moduleSystem', ['getChannelDetail', 'updateChannelInfo', 'saveChannelInfo']),

        // 保存通道信息
        resSaveChannelInfo(params) {
            this.saveChannelInfo(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.$emit('refreshDataList');
                    this.visible = false;
                }
            });
        },

        // 修改通道信息
        reqUpdateChannelInfo(params) {
            this.updateChannelInfo(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.$emit('refreshDataList');
                    this.visible = false;
                }
            });
        },

        // 表单初始化
        init(id, alertBoxAction, deviceType, channelFlag, courtroomId) {
            this.alertBoxAction = alertBoxAction;
            this.deviceType = deviceType;
            this.channelFlag = channelFlag;
            this.courtroomId = courtroomId;
            this.dataForm.id = id || 0;
            this.visible = true;
            this.$nextTick(() => {
                this.$refs['dataForm'].resetFields();
            });

            if (this.dataForm.id) {
                // 修改
                this.getChannelDetail(`${this.dataForm.id}`).then((res) => {
                    if (res.code === 0) {
                        this.dataForm = res.data;
                    }
                });
            }
        },

        // 重置表单
        resetForm() {
            this.dataForm = {
                id: 0,
                name: '',
                channelId: null,
                channelType: null,
                number: null,
                streamType: null,
                uniqueChannel: null
            };
        },

        // 表单提交
        dataFormSubmit() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    if (this.alertBoxAction === 'edit') {
                        let params = this.dataForm;
                        this.reqUpdateChannelInfo(params);
                    } else if (this.alertBoxAction === 'add') {
                        let { id, ...paramsAdd } = this.dataForm;
                        paramsAdd.flag = this.channelFlag;
                        paramsAdd.courtroomId = this.courtroomId;
                        this.resSaveChannelInfo(paramsAdd);
                        return false;
                    }
                }
            });
        },

        closeDialog() {
            this.resetForm();
        }
    }
};
</script>

<style lang='less' type="text/less" scoped>
/deep/ .el-dialog__body {
    height: auto !important;
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
