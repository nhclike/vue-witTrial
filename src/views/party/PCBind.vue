/* 设备绑定
 * @Author: ShiHuiJun
 * @Date: 2020-11-27 11:13:41
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-08 15:38:58
 */

<template>
    <div class="entry">
        <div class="login-box">
            <div class="logo">
                <img src="@/assets/images/logo_login.png" />
                <div class="title">人民法院智慧庭审系统</div>
            </div>
            <div class="tab-box">
                <div class="tab-header">
                    <span class="active">设备绑定</span>
                </div>
                <div class="tab-content form">
                    <el-form
                        :model="ruleForm"
                        :label-position="'right'"
                        label-width="1.5rem"
                        status-icon
                        :rules="rules"
                        ref="ruleForm"
                    >
                        <el-form-item label="法庭" prop="courtroomId">
                            <el-select
                                filterable
                                v-model="ruleForm.courtroomId"
                                placeholder
                                clearable
                            >
                                <el-option
                                    v-for="(item,index) in courtList"
                                    :key="index"
                                    :label="item.courtroomName"
                                    :value="item.courtroomId"
                                ></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="角色" prop="roleCode">
                            <el-select v-model="ruleForm.roleCode" placeholder clearable>
                                <el-option
                                    v-for="(item, index) in pcRoleList"
                                    :key="index"
                                    :label="item.value"
                                    :value="item.key"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="校验码" prop="randomCode">
                            <el-input v-model="ruleForm.randomCode" placeholder="请输入校验码" clearable></el-input>
                        </el-form-item>
                    </el-form>
                    <div>
                        <a
                            class="font-color-error"
                            target="_blank"
                            download
                            :href="formatUrl()"
                        >插件下载</a>
                    </div>
                    <div class="btn-box">
                        <span class="shj-btn--primary shj-btn--medium" @click="submit">确定</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';
import { isIE, getCpu, getDisk } from '@/utils/utils';
export default {
    name: 'JudgeEntry',
    components: {},
    inject: ['reload'],
    props: {},
    data() {
        return {
            courtList: [
                /*  {
                    courtroomId: '1',
                    courtroomName: '第一法庭'
                } */
            ], // 法庭下拉列表
            pcRoleList: [],
            ruleForm: {
                courtroomId: '',
                roleCode: '',
                randomCode: '' // 第一法庭 068633
            }, // 表单
            rules: {
                // 表单验证
                courtroomId: [
                    {
                        required: true,
                        message: '请选择庭审法庭',
                        trigger: ['blur', 'change']
                    }
                ],
                roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }],
                randomCode: [{ required: true, message: '请输入校验码', trigger: 'change' }]
            },
            error: ''
        };
    },
    computed: {
        ...mapGetters(['peoplekeyGet'])
    },
    watch: {
        /* peoplekeyGet: {
            handler() {
                this.$nextTick(() => {
                    if (this.peoplekeyGet) {
                        console.log(`[PCBind]`, 'watch peoplekey load', this.peoplekeyGet);

                    }
                });
            },
            deep: true,
            immediate: true
        } */
    },
    created() {
        //
    },
    mounted() {
        //this.getPeopleKey(); // 获取pc设备id
        this.init();

    },
    methods: {
        // 接口引入
        ...mapActions({
            queryCourtroom: 'moduleCase/queryCourtroom',
            checkRoomPcBind: 'moduleSystem/checkRoomPcBind',
            saveRoomPc: 'moduleSystem/saveRoomPc'
        }),
        ...mapMutations(['peoplekeyMut']),

        // getPeopleKey() {
        //     if (this.peoplekeyGet) {
        //         console.log(`[PCBind]`, 'peoplekey load', this.peoplekeyGet);
        //         this.init();
        //     } else if (isIE()) {
        //         let cpuInfo = getCpu();
        //         let diskInfo = getDisk();
        //         // console.log(`[App]`, 'cpuInfo', cpuInfo, 'diskInfo', diskInfo);
        //         let value = `CPU:${cpuInfo.ProcessorID}-HD:${diskInfo.SerialNumber}`;
        //         this.peoplekeyMut(value);
        //         console.log(`[Party]`, 'peoplekey get', this.peoplekeyGet);
        //         this.init();
        //     } else {
        //         console.log(`[Party]`, '无法获取peoplekey');
        //         this.$confirm(`浏览器不支持设备绑定，请使用IE浏览器`, '系統提示', {
        //             confirmButtonText: '确定',
        //             cancelButtonText: '取消',
        //             showCancelButton: false,
        //             customClass: 'confirm-success',
        //             type: 'error'
        //         })
        //             .then(() => {
        //                 // this.reload();
        //             })
        //             .catch(() => {
        //                 // this.reload();
        //             });
        //     }
        // },

        async init() {
            await this.reqQueryCourtroom();
            this.pcRoleList = await this.commFilter.queryDictValue({ type: 'pc_role' });
            this.reqCheckRoomPcBind();
        },

        // 查询法庭
        async reqQueryCourtroom() {
            await this.queryCourtroom().then((res) => {
                if (res.code === 0) {
                    this.courtList = res.data;
                }
                return res;
            });
        },

        // 验证电脑是否绑定了角色
        reqCheckRoomPcBind(params) {
            this.checkRoomPcBind(params).then((res) => {
                if (res.code === 0) {
                    if (res.data) {
                        this.ruleForm.courtroomId = res.data.roomId;
                        this.ruleForm.roleCode = res.data.roleCode;
                        this.ruleForm.randomCode = res.data.randomCode;
                    }
                }
            });
        },

        // 保存法庭电脑绑定角色信息复制
        reqSaveRoomPc(params) {
            this.saveRoomPc(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.$router.push({
                        path: '/partyTrial'
                    });
                }
            });
        },

        // 按钮点击-确认
        submit() {
            // debugger;
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    this.reqSaveRoomPc({
                        roomId: this.ruleForm.courtroomId,
                        roleCode: this.ruleForm.roleCode,
                        cpuid: this.peoplekeyGet,
                        randomCode: this.ruleForm.randomCode
                    });
                }
            });
        },

        // 插件下载地址
        formatUrl() {
            return `${__API__}/trial/sys/downloadCenter/downloadPlugin/systemPluginParty`;
        }
    }
};
</script>

<style scoped lang='less'>
@form_h: 60px;
.entry {
    width: 100%;
    height: 100%;
    background: url('@{base_url}/login/login_bg.png') no-repeat top center;
    background-size: 100% 100%;
    .login-box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        top: 50%;
        text-align: center;
        .logo {
            display: flex;
            align-items: center;
            margin-bottom: 50px;
        }
        img {
            width: 220px;
            height: 240px;
        }
        .title {
            line-height: 60px;
            margin-right: 10px;
            font-size: 70px;
            color: @text_color_white;
        }
        .tab-box {
            width: 830px;
            margin: 0 auto;
            height: 650px;
            background: @bg_area;
            border: 1px solid @border_color_area;
            border-radius: @border_radius_large;
            .tab-header {
                color: @text_color_area;
                font-size: @font38px;
                display: flex;
                width: 600px;
                margin: 0 auto;
                // justify-content: space-around;
                letter-spacing: 2px;
                text-indent: 2px;
                span {
                    cursor: pointer;
                    background: transparent;
                    line-height: 90px;
                }
                .active {
                    color: @text_color_white;
                    &:after {
                        content: '';
                        display: block;
                        width: 90%;
                        border-bottom: 5px solid @text_color_white;
                        margin: 0 auto;
                    }
                }
            }
        }
        .form {
            width: 600px;
            margin: 0 auto;
            .el-select {
                height: @form_h;
                line-height: @form_h;
            }
            /deep/.el-form {
                margin-top: 60px;
                .el-form-item {
                    height: @form_h;
                    line-height: @form_h;
                    margin-bottom: 40px;
                    text-align: left;
                    .el-form-item__label {
                        color: @text_color_white;
                        height: @form_h;
                        line-height: @form_h;
                    }
                    .el-form-item__content {
                        height: @form_h;
                        line-height: @form_h;
                        .el-input {
                            .el-input__inner {
                                height: @form_h;
                                line-height: @form_h;
                            }
                            .el-input__prefix {
                                left: 20px;
                            }
                            .el-input__suffix {
                                right: 20px;
                                .el-input__icon {
                                    height: @form_h;
                                    line-height: @form_h;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
.btn-box {
     width: 100%;
    span {
        width: 100%;
    }
    .shj-btn--primary {
        background: #3a73ff;
        border-color: #3a73ff;
    }
}
</style>
