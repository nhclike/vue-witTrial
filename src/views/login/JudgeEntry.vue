/* 法官登录
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:17:09
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-20 10:13:25
 */
<template>
    <div class="entry">
        <div class="login-box">
            <img src="@/assets/images/logo_login.png" />
            <div class="title">人民法院智慧庭审系统</div>
            <div class="form">
                <el-form
                    :model="ruleForm"
                    ref="ruleForm"
                    :rules="rules"
                    class="ruleForm"
                    label-position="top"
                >
                    <el-form-item label prop="username">
                        <el-input
                            v-model="ruleForm.username"
                            placeholder="请输入用户名"
                            clearable

                        >
                            <i class="el-input__icon i-user" slot="prefix"></i>
                        </el-input>
                    </el-form-item>

                    <el-form-item label prop="password" :error="error">
                        <el-input
                            v-model="ruleForm.password"
                            placeholder="请输入密码"
                            :type="setType"
                            clearable

                        >
                            <i class="el-input__icon i-lock" slot="prefix"></i>
                        </el-input>
                    </el-form-item>
                </el-form>
                <div>
                    <a
                        class="font-color-error"
                        target="_blank"
                        download=""
                        :href="formatUrl()"
                        >插件下载</a
                    >
                </div>
                <div class="btns">
                    <span
                        class="shj-btn--primary shj-btn--medium"
                        @click="submit"
                        >登录</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {global} from '@/utils/utils.js';

import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
import { requestFullScreen, IsF11Fullscreen} from '@/utils/utils';
export default {
    name: 'JudgeEntry',
    components: {},
    inject: ['reload'],
    props: {},
    data() {
        return {
            userToken: null,
            rememberPwd: true, // 记住密码
            isShow: false, // 密码可见
            ruleForm: {
                username: '',
                password: ''
            }, // 表单
            rules: {
                // 表单验证
                username: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: ['blur', 'change']
                    }
                    // { min: 11, max: 11, message: '长度为11位', trigger: 'change' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'change' }
                    // {
                    //     min: 1,
                    //     max: 30,
                    //     message: '长度在 1 到 30 个字符',
                    //     trigger: 'change'
                    // }
                ]
            },
            error: ''
        };
    },
    computed: {
        ...mapState(['userInfo']),
        ...mapGetters(['userInfoGet', 'tokenGet']),

        // 输入框类型切换
        setType() {
            return this.isShow ? 'text' : 'password';
        }
    },
    watch: {},
    // created() {
    // },
    mounted() {
        this.init();
        this.roleMut('judge');

    },
    methods: {
        // 接口引入
        ...mapActions('moduleLogin', ['sysLogin', 'getCurUserInfo', 'tokenExpires']),

        ...mapMutations([
            'isLoginMut',
            'userInfoMut',
            'tokenMut',
            'roleMut',
            'clearStateMut'
        ]),

        // 初始化
        init() {
            // window.sessionStorage.clear();
            if (this.userInfo) {
                this.ruleForm.username = this.userInfo.username;
                // this.ruleForm.password = this.userInfo.password;
            }
        },

        // 按钮点击-登录
        submit() {
            let isFull = IsF11Fullscreen();
            console.log('JudgeEntry---isFull' + isFull);
            if (!isFull) {
                // debugger;
                try {
                    // this.$message.success("BasicLayout---mounted全屏!");
                    requestFullScreen();
                } catch (error) {
                    console.log(error);
                }
            }
            // 登录时有之前的token先处理掉之前的token
            if (this.tokenGet) {
                this.tokenExpires(this.tokenGet);
                this.clearStateMut();
            }
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    let params = {
                        username: this.ruleForm.username.trim(),
                        password: this.ruleForm.password.trim()

                    };

                    // 请求接口 - 登录;
                    this.postLoginVerify(params);
                    // this.doLogin(params);
                }
            });

        },

        // 接口-登录
        postLoginVerify(params) {
            // 1系统登录获取token和userId
            let _this = this;
            this.sysLogin(params).then((res) => {
                // console.log('sysLogin', res);
                if (res.code === 0) {
                    // 2保存token
                    let token = res.data.token;
                    // 3更新登录状态,用户信息及存储token
                    _this.isLoginMut(1);
                    _this.tokenMut(token);
                    // 4获取并且更新用户信息
                    _this.roleMut('judge');
                    // 5设置当前系统登录角色
                    _this.getCurUserInfo().then((res) => {
                        console.log('getCurUserInfo', res);
                        if (res.code == 0) {
                            _this.userInfoMut(res.data);
                            global.aaa = res.data.id;
                        }


                    });

                    this.$nextTick(() => {
                        this.doLogin(res);
                    });
                } else {
                    this.error = res.msg;
                }
            });
        },

        doLogin(res) {
            this.$router.push({
                path: '/main/judge/index'
            });
        },

        formatUrl() {
            return `${__API__}/trial/sys/downloadCenter/downloadPlugin/systemPluginJudge`;
        }
    }
};
</script>

<style scoped lang='less'>
@form_h: 70px;
.entry {
    width: 100%;
    height: 100%;
    background: url('@{base_url}/bg.png') no-repeat top center;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .login-box {
        text-align: center;
        img {
            width: 220px;
            height: 240px;
        }
        .title {
            line-height: 60px;
            margin-top: 30px;
            margin-bottom: 70px;
            font-size: 70px;
            color: @text_color_white;
        }
        a {
            text-decoration: underline;
        }
        .form {
            width: 630px;
            margin: 0 auto;

            /deep/.el-form {
                .el-form-item {
                    height: @form_h;
                    line-height: @form_h;
                    margin-bottom: 40px;
                    text-align: left;
                    .el-form-item__content {
                        height: @form_h;
                        line-height: @form_h;
                        .el-input {
                            .el-input__inner {
                                padding-left: 70px;
                                height: @form_h;
                                line-height: @form_h;
                            }
                            .el-input__prefix {
                                left: 20px;
                            }
                            .el-input__suffix {
                                right: 20px;
                                .el-input__icon {
                                    // height: @form_h;
                                    line-height: @form_h;
                                }
                            }
                        }
                    }
                }
            }

            .btns {
                text-align: center;
                width: 100%;
                span {
                    display: block;
                }
            }
        }
    }
}
</style>
