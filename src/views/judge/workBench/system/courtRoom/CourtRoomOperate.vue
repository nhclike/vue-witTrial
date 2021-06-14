<template>
    <el-dialog
        :title="!dataForm.id ? '新增法庭' : '修改法庭'"
        :close-on-click-modal="false"
        :visible.sync="visible">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="112px">
            <el-form-item label="法庭名称" prop="courtroomName">
                <el-input
                    v-model="dataForm.courtroomName"
                    placeholder="法庭名称"
                    maxlength="50"
                ></el-input>
            </el-form-item>
            <el-form-item label="所属法院">
                <el-input placeholder="所属法院" disabled :value="systemConfig().courtName"></el-input>
            </el-form-item>
            <el-form-item label="法庭类型" prop="courtroomType">
                <el-select
                    filterable
                    v-model="dataForm.courtroomType"
                >
                    <el-option label="标准庭" value="1"></el-option>
                    <el-option label="简易庭" value="0"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="容纳人数" prop="courtroomSize">
                <el-input-number v-model="dataForm.courtroomSize" controls-position="right" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="法庭排序" prop="orderNum">
                <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="法庭状态" prop="courtroomStatus">
                <el-select
                    v-model="dataForm.courtroomStatus"
                >
                    <el-option label="启用" value="1"></el-option>
                    <el-option label="禁用" value="0"></el-option>
                </el-select>
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
    export default {
        inject: ['systemConfig'],
        data () {
            return {
                visible: false,
                menuList: [],
                dataForm: {
                    id: 0,
                    courtroomName: '',
                    courtroomType: '1',
                    courtroomSize: undefined,
                    orderNum: undefined,
                    courtroomStatus: '1'
                },
                dataRule: {
                    courtroomName: [
                        { required: true, message: '法庭名称不能为空', trigger: 'blur' }
                    ],
                    courtroomType: [
                        { required: true, message: '法庭类型不能为空', trigger: 'blur' }
                    ],
                    courtroomStatus: [
                        { required: true, message: '法庭状态不能为空', trigger: 'blur' }
                    ]
                }
            }
        },
        created () {

        },
        methods: {
            ...mapActions('moduleSystem', ['getCourtRoomDetail', 'addOrUpdateCourtRoom']),
            init (id) {
                this.dataForm.id = id || 0;
                this.visible = true;
                this.$nextTick(() => {
                    this.$refs['dataForm'].resetFields();
                });
                if (this.dataForm.id) {
                    // 修改
                    this.getCourtRoomDetail(`${this.dataForm.id}`).then((res) => {
                        if(res.code === 0) {
                            this.dataForm.courtroomName = res.data.courtroomName;
                            this.dataForm.courtCode = res.data.courtCode;
                            this.dataForm.courtroomType = res.data.courtroomType;
                            this.dataForm.courtroomSize = res.data.courtroomSize ? res.data.courtroomSize: undefined;
                            this.dataForm.orderNum = res.data.orderNum ? res.data.orderNum : undefined;
                            this.dataForm.courtroomStatus = res.data.courtroomStatus;
                        }
                    })
                }
            },
            // 表单提交
            dataFormSubmit () {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        let params = this.dataForm;
                        params.courtroomId = this.dataForm.id || undefined;
                        this.addOrUpdateCourtRoom(params).then((res) => {
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
</style>
