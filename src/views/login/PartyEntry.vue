/*
 * @Author: nihc
 * @Date: 2020-11-25 17:50:58
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-20 10:13:34
 */


<template>
    <div class="entry">
        <div class="CVR_IDCard" v-if="showIDCard">
            <OBJECT
                ref="CVR_IDCard"
                height="1"
                width="1"
                classid="clsid:10946843-7507-44FE-ACE8-2B3483D179B7"
                name="CVR_IDCard"
            ></OBJECT>
        </div>
        <div class="faceCamera" v-if="false">
            <video
                ref="video"
                id="video"
                width="320"
                height="240"
                preload
                autoplay
                loop
                muted
            ></video>
            <canvas ref="canvas" id="canvas" width="320" height="240"></canvas>

        </div>
        <div >
            <div class="cameraBox" ref="cameraBox" v-if="false" style="width:500px;height:300px">

                <!-- <Photo
                :showCamera="showCamera"
                :cameraWidth="cameraWidth"
                :cameraHeight="cameraHeight"
                :action="cameraAction"
                @changeImg="changeImg"
                ></Photo> -->
                 <photo-flash
                :showCamera="showCamera"
                :cameraWidth="cameraWidth"
                :cameraHeight="cameraHeight"
                :action="cameraAction"
                @changeImg="changeImg"
                ></photo-flash>

            </div>
            <button @click="takePhoto" v-if="false">拍照</button>
            <img :src="CardidUrl" alt="" v-if="false">

        </div>

        <div class="login-box">
            <div class="logo">
                <img src="@/assets/images/logo_login.png" />
                <div class="title">人民法院智慧庭审系统</div>
            </div>
            <div class="tab-box">
                <div class="tab-header">
                    <span
                        :class="{ active: activeTab === '1' }"
                        @click="activeTab = '1'"
                        >AI核验签到</span
                    >
                    <span
                        :class="{ active: activeTab === '2' }"
                        @click="activeTab = '2'"
                        >手动登录</span
                    >
                </div>
                <div class="tab-content">
                    <div v-show="activeTab === '1'">
                        <div class="faceBox">

                            <div class="face pos-r">
                                <p
                                    class="vertical-horizontal-center font-color-error"
                                >
                                    {{ this.isdetected }}
                                </p>

                                <img src="@/assets/images/login/face.png" />
                                <div class="cameraBox vertical-horizontal-center" ref="cameraBox">

                                    <!-- <Photo
                                    :showCamera="showCamera"
                                    :cameraWidth="cameraWidth"
                                    :cameraHeight="cameraHeight"
                                    :action="cameraAction"
                                    @changeImg="changeImg"
                                    ></Photo> -->
                                    <photo-flash
                                    :showCamera="showCamera"
                                    :cameraWidth="cameraWidth"
                                    :cameraHeight="cameraHeight"
                                    :action="cameraAction"
                                    @changeImg="changeImg"
                                    ></photo-flash>

                                </div>
                            </div>
                            <div class="info txt-center">
                                1、请把二代身份证放到身份证读卡器&nbsp;&nbsp;&nbsp;&nbsp;2、请面对屏幕上方摄像机
                            </div>
                        </div>

                    </div>
                    <div v-show="activeTab === '2'" class="form">
                        <el-form
                            :model="ruleForm"
                            ref="ruleForm"
                            :rules="rules"
                            class="ruleForm"
                            label-position="top"
                        >
                            <el-form-item label prop="name">
                                <el-input
                                    v-model="ruleForm.name"
                                    placeholder="请输入用户名"
                                    clearable
                                    @keyup.enter.native="submit"
                                >
                                    <i
                                        class="el-input__icon i-idCard"
                                        slot="prefix"
                                    ></i>
                                </el-input>
                            </el-form-item>

                            <el-form-item
                                label
                                prop="randomCode"
                                :error="error"
                            >
                                <el-input
                                    v-model="ruleForm.randomCode"
                                    placeholder="请输入随机码"
                                    :type="setType"
                                    clearable
                                    @keyup.enter.native="submit"
                                >
                                    <i
                                        class="el-input__icon i-randomNum"
                                        slot="prefix"
                                    ></i>
                                </el-input>
                            </el-form-item>
                        </el-form>
                        <div class="info txt-left">
                            随机码请咨询书记员或审判长
                        </div>
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
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
import { requestFullScreen, isIE } from '@/utils/utils';
// import '../../../public/adapter.screenshare.js';  //ie调起getUserMedia
import PhotoFlash from './photoFlash';
import {global} from '@/utils/utils.js';

import Photo from './photo';
require('tracking/build/tracking-min.js');
require('tracking/build/data/face-min.js');


export default {
    name: 'PartyEntry',
    components: {
        Photo,
        PhotoFlash
    },
    inject: ['reload'],
    props: {},
    data() {
        return {
            isdetected: '请放置好身份证',
            showCamera: false, // 显示photo组件
            cameraAction: '',
            cameraHeight: 500,
            cameraWidth: 300,
            timeOutNum: 3000,
            matchCount: 0,
            showIDCard: false,
            idCardInfo: {}, // 读卡信息存储
            CardidUrl: '', // 身份证图片base64
            timer: null, // 读卡定时器
            cameraTimer: null, // 抓拍定时器
            activeTab: '2', // tab项切换
            rememberPwd: true, // 记住密码
            isShow: false, // 密码可见
            ruleForm: {
                name: '',
                randomCode: ''
            }, // 表单
            rules: {
                // 表单验证
                name: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: 'change'
                    }
                    // { min: 11, max: 11, message: '长度为11位', trigger: 'change' }
                ],
                randomCode: [
                    {
                        required: true,
                        message: '请输入随机码',
                        trigger: 'change'
                    }
                    // {
                    //     min: 1,
                    //     max: 30,
                    //     message: '长度在 1 到 30 个字符',
                    //     trigger: 'change'
                    // }
                ]
            },
            error: ''// 手动登录错误提示
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
    watch: {
        activeTab: {
            handler() {
                let _this = this;
                this.$nextTick(() => {
                    if (_this.activeTab === '1') {
                        if (isIE()) {
                            _this.timer = setInterval(() => {
                                if (_this.readIdCard()) {
                                    _this.clearTimer();
                                }
                            }, _this.timeOutNum);
                        }
                    } else {
                        _this.clearTimer();
                        _this.showCamera = false;
                        _this.clearCameraTimer();
                        _this.isdetected = '请放置好身份证';
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    // created() {
    // },
    mounted() {
        this.init();
        this.clearTimer();
        this.clearCameraTimer();

        this.roleMut('party');// 页面进入就记录入口---否则人脸登录失败会跳转到法官登录页
    },
    beforeDestroy() {
        this.clearTimer();
        this.clearCameraTimer();
    },
    destroyed() {
    },
    methods: {
        // 接口引入
        ...mapActions('moduleLogin', [
            'casePeopleLogin',
            'getCurUserInfo',
            'AILogin',
            'tokenExpires'
        ]),
        ...mapMutations([
            'isLoginMut',
            'userInfoMut',
            'tokenMut',
            'roleMut'
        ]),

        // 初始化
        init() {
            // window.sessionStorage.clear();
            if (this.userInfo) {
                this.ruleForm.name = this.userInfo.username;
            }
        },
        clearTimer() {
            if (this.timer) {
                clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
                this.timer = null;
            }
        },
        clearCameraTimer() {
            if (this.cameraTimer) {
                clearInterval(this.cameraTimer);
                this.cameraTimer = null;
            }
        },
        // 按钮点击-登录
        submit() {
            try {
                requestFullScreen();

            } catch (error) {
                console.log(error);
            } finally {
                if (this.tokenGet) {
                    this.tokenExpires(this.tokenGet);
                }
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        let params = {
                            name: this.ruleForm.name.trim(),
                            randomCode: this.ruleForm.randomCode.trim(),
                            token: this.tokenGet
                        };

                        // 请求接口-登录
                        this.reqCasePeopleLogin(params);
                        // this.doLogin(params);
                    }
                });
            }

        },

        // 接口-手动登录
        reqCasePeopleLogin(params) {
            // 1系统登录获取token和userId
            let _this = this;
            this.casePeopleLogin(params).then((res) => {
                // console.log('casePeopleLogin', res);
                if (res.code === 0) {
                    // 2保存token
                    let token = res.data.token.token;
                    let trialId = res.data.trialId;
                    // 3更新登录状态,用户信息及存储token
                    _this.isLoginMut(1);
                    _this.tokenMut(token);
                    // 4获取并且更新用户信息
                    _this.roleMut('party');
                    // 5设置当前系统登录角色
                    _this.getCurUserInfo().then((res) => {
                        console.log(res);
                        if (res.code == 0) {
                            _this.userInfoMut(res.data);
                            global.aaa = res.data.id;
                            _this.$nextTick(() => {
                                _this.doLogin(trialId);
                            });
                        }

                    });
                } else {
                    this.error = res.msg;
                }
            });
        },

        doLogin(trialId) {
            this.$router.push({
                path: '/home/topicReader',
                query: {
                    trialId: trialId
                }
            });
        },

        // 人脸识别登录
        reqAILogin(params) {
            let _this = this;
            this.AILogin(params).then((res) => {
                ++_this.matchCount;
                if (_this.matchCount > 5) {
                    _this.$message.success('识别失败,请重新登录!');

                    _this.activeTab = '2';
                }
                if (res.code === 0) {
                    // 登录成功
                    _this.$message.success('识别成功,正在登录跳转');
                    clearInterval(this.cameraTimer);
                    _this.cameraTimer = null;
                    let token = res.data.token.token;
                    let trialId = res.data.trialId;
                    // 3更新登录状态,用户信息及存储token
                    _this.isLoginMut(1);
                    _this.tokenMut(token);
                    // 4获取并且更新用户信息
                    _this.roleMut('party');
                    // 5设置当前系统登录角色
                    _this.getCurUserInfo().then((res) => {
                        console.log('getCurUserInfo', res);
                        if (res.code == 0) {
                            _this.userInfoMut(res.data);
                            global.aaa = res.data.id;

                            _this.$nextTick(() => {
                                _this.doLogin(trialId);
                            });
                        }

                    });

                } else if (res.code === 10110) {
                    console.log('人脸比对相识度过低');
                    _this.$message.error('人脸比对相识度过低!');


                } else if (res.code === 10111) {
                    console.log('AI 登录失败,未找到今日庭审案件信息');
                    _this.$message.error('未找到今日庭审信息!');
                    _this.activeTab = '2';

                }
                else {
                    this.isdetected = '请您保持脸部在画面中央!';
                    if (this.activeTab === '1') {
                        _this.cameraTimer = setInterval(() => {
                            _this.takePhoto();
                        }, this.timeOutNum);
                    }
                }
            }).catch((err) => {
                console.log(err);
                clearInterval(this.cameraTimer);
                _this.cameraTimer = null;
                window.reload();
            });
        },

        formatUrl() {
            return `${__API__}/trial/sys/downloadCenter/downloadPlugin/systemPluginParty`;
        },

        /* --------------------身份证读取-开始-------------------- */
        readIdCard() {
            this.showIDCard = true;
            this.isdetected = '正在读取身份证';

            this.clearForm();
            this.CVR_IDCard = this.$refs.CVR_IDCard;
            let ret = this.CVR_IDCard.ReadCard();
            if (ret == '0') {
                this.isdetected = '已读取身份证信息';
                this.fillForm();
                return true;
            }
            this.isdetected = '请放置好身份证';
            console.log('读卡错误,错误原因:' + ret);
            return false;
        },

        fillForm() {
            this.idCardInfo = {
                name: this.CVR_IDCard.Name,
                sex: this.CVR_IDCard.Sex,
                nation: this.CVR_IDCard.Nation,
                born: this.CVR_IDCard.Born,
                address: this.CVR_IDCard.Address,
                cardNo: this.CVR_IDCard.CardNo,
                police: this.CVR_IDCard.IssuedAt,
                activityLFrom: this.CVR_IDCard.EffectedDate,
                activityLTo: this.CVR_IDCard.ExpiredDate,
                deviceNo: this.CVR_IDCard.CardReaderId,
                photoBuffer: this.CVR_IDCard.Picture,
                photoDisplay: 'data:image/jpeg;base64,' + this.CVR_IDCard.Picture
            };
            this.CardidUrl = 'data:image/jpeg;base64,' + this.CVR_IDCard.Picture;
            this.isdetected = '已经读取到身份证信息';

            console.log('身份证base64', this.idCardInfo.photoBuffer);
            this.clearTimer();
            this.initCameraPhoto();

        },

        clearForm() {
            this.idCardInfo = {};
        },

        // 连接
        connect() {
            function onSuccess(data) {
                document.getElementById('result').value =
                    '提示:' +
                    data.match('"errorMsg" : (.*)')[1] +
                    '\n返回值：' +
                    data.match('"resultFlag" : (.*)')[1];
            }

            this.clearForm();
            let options = {};
            options.type = 'GET';
            options.url = '/OpenDevice';
            options.timeout = 5000;
            options.onSuccess = onSuccess;
            this.ajax(options);
        },

        // 读安全模块号
        disconnect() {
            function onSuccess(data) {
                document.getElementById('result').value =
                    '提示:' +
                    data.match('"errorMsg" : (.*)')[1] +
                    '\n返回值：' +
                    data.match('"resultFlag" : (.*)')[1];
            }

            this.clearForm();

            let options = {};
            options.type = 'GET';
            options.url = 'CloseDevice';
            options.timeout = 5000;
            options.onSuccess = onSuccess;
            this.ajax(options);
        },

        // 读卡
        readCert() {
            function onSuccess(data) {
                let endDt = new Date();
                document.getElementById('timeElapsed').value =
                    endDt.getTime() - startDt.getTime() + '毫秒';
                let errorMsg = data.match('"errorMsg" : (.*)')[1];
                let resultFlag = data.match('"resultFlag" : (.*)')[1];
                document.getElementById('result').value =
                    '提示:' + errorMsg + '\n返回值：' + resultFlag; // 结果

                let certType = data.match('"certType" : "(.*?)"')[1];
                if (certType == ' ') {
                    certType = '身份证';
                } else if (certType == 'I') {
                    certType = '外国人居住证';
                } else if (certType == 'J') {
                    certType = '港澳台居住证';
                } else {
                    certType = '未知';
                }
                document.getElementById('certType').value = certType; // 证件类别

                document.getElementById('partyName').value = data.match(
                    '"partyName" : "(.*?)"'
                )[1]; // 姓名
                document.getElementById('gender').value = data.match(
                    '"gender" : "(.*?)"'
                )[1]; // 性别
                document.getElementById('nation').value = data.match(
                    '"nation" : "(.*?)"'
                )[1]; // 民族
                document.getElementById('bornDay').value = data.match(
                    '"bornDay" : "(.*?)"'
                )[1]; // 出生日期
                document.getElementById('certAddress').value = data.match(
                    '"certAddress" : "(.*?)"'
                )[1]; // 住址
                document.getElementById('certNumber').value = data.match(
                    '"certNumber" : "(.*?)"'
                )[1]; // 身份证号
                document.getElementById('certOrg').value = data.match(
                    '"certOrg" : "(.*?)"'
                )[1]; // 签发机关
                document.getElementById('effDate').value = data.match(
                    '"effDate" : "(.*?)"'
                )[1]; // 开始期限
                document.getElementById('expDate').value = data.match(
                    '"expDate" : "(.*?)"'
                )[1]; // 结束期限
            }
            this.clearForm();

            let startDt = new Date();
            let options = {};
            options.type = 'GET';
            options.url = 'readcard';
            options.timeout = 5000;
            options.onSuccess = onSuccess;
            this.ajax(options);
        },

        // 断开
        readSAMID() {
            function onSuccess(data) {
                document.getElementById('result').value =
                    '提示:' +
                    data.match('"errorMsg" : (.*)')[1] +
                    '\n返回值：' +
                    data.match('"resultFlag" : (.*)')[1];
                document.getElementById('samid').value = data.match(
                    '"samid" : "(.*?)"'
                )[1]; // 安全模块号
            }

            document.getElementById('samid').value = '';
            let startDt = new Date();
            let options = {};
            options.type = 'GET';
            options.url = 'getsamid';
            options.timeout = 5000;
            options.onSuccess = onSuccess;
            this.ajax(options);
        },

        ajax(options) {
            if (options.type == null) {
                options.type = 'POST';
            }

            if (options.url == null) {
                options.url = '';
            }

            if (options.timeout == null) {
                options.timeout = 5000;
            }

            if (options.onComplate == null) {
                options.onComplate = function() {};
            }

            if (options.onError == null) {
                options.onError = function() {};
            }

            if (options.onSuccess == null) {
                options.onSuccess = function() {};
            }

            if (options.data) {
                options.data = '';
            }

            let xml;
            if (typeof ActiveXObject != 'undefined') {
                let aVersions = [
                    'Microsoft.XMLHTTP',
                    'Msxml2.XMLHttp.6.0',
                    'Msxml2.XMLHttp.5.0',
                    'Msxml2.XMLHttp.4.0',
                    'Msxml2.XMLHttp.3.0'
                ];
                for (let i = 0; i < aVersions.length; i++) {
                    try {
                        xml = new ActiveXObject(aVersions[i]);
                    } catch (e) {}
                }
            } else if (typeof XMLHttpRequest != 'undefined') {
                xml = new XMLHttpRequest();
            }

            xml.open(options.type, options.url, true);

            let timeoutLength = options.timeout;

            let requestDone = false;

            setTimeout(function() {
                requestDone = true;
            }, timeoutLength);

            xml.onreadystatechange = function() {
                if (xml.readyState == 4 && !requestDone) {
                    if (httpSuccess(xml)) {
                        options.onSuccess(httpData(xml));
                    } else {
                        options.onError();
                    }

                    options.onComplate();

                    xml = null;
                }
            };

            xml.send();

            function httpSuccess(r) {
                try {
                    return (
                        (!r.status && location.protocol == 'file:') ||
                        (r.status >= 200 && r.status <= 300) ||
                        r.status == 304 ||
                        (navigator.userAgent.indexOf('Safari') >= 0 &&
                            typeof r.status == 'undefined')
                    );
                } catch (e) {}
                return false;
            }

            function httpData(r) {
                let ct = r.getResponseHeader('responseType');
                if (ct) {
                    if (ct == 'script') {
                        eval.call(window, data);
                    }
                    if (ct == 'xml') {
                        return r.responseXML;
                    }
                    if (ct == 'json') {
                        return JSON.parse(r.responseText);
                    }
                }
                return r.responseText;
            }
        },


        /* --------------------身份证读取-结束-------------------- */
        /* --------------------webcam人脸识别-开始-------------------- */
        initCameraPhoto() {
            this.isdetected = '请您保持脸部在中央位置';
            this.cameraHeight = this.$refs.cameraBox.clientHeight;
            this.cameraWidth = this.$refs.cameraBox.clientWidth;
            console.log('this.cameraHeight', this.cameraHeight, 'this.cameraWidth', this.cameraWidth);
            this.showCamera = true;
            let _this = this;
            this.cameraTimer = setInterval(() => {
                _this.takePhoto();
            }, this.timeOutNum);
        },
        changeImg(b64) {
            console.log(`changeImg${b64}`);
            this.isdetected = '请保持不动';
            let params = {
                facePic: b64, // 脸图片base64编码
                identityNo: this.idCardInfo.cardNo,
                identityPic: this.idCardInfo.photoBuffer,
                // name: '时慧君' // 当事人姓名
                name: this.idCardInfo.name// 当事人姓名
            };
            console.log('changeImg', params, this.idCardInfo);
            if (this.tokenGet) {
                this.tokenExpires(this.tokenGet);
            }
            this.reqAILogin(params);
            // if (face.length > 0) {


            // }
            // else {
            //     this.isdetected = '未检测到人脸';
            // }


        },
        takePhoto() {
            this.cameraAction = `snapshotnum${new Date().getTime()}`;
        }
        /* --------------------webcam人脸识别-end-------------------- */


    }
};
</script>

<style scoped lang='less'>
.faceCamera {
    video,
    canvas {
        z-index: 999;
        position: absolute;
        top: 0;
        left: 0;
        // transform: translate(-50%, -50%);
    }
}
@camera_w:740px;
@camera_h:420px;

.cameraBox{
    width: 540px;
    height: @camera_h;
    z-index: -1;
}

@form_h: 70px;
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
            margin-top: 30px;
            margin-bottom: 70px;
            font-size: 70px;
            color: @text_color_white;
        }
        .tab-box {
            width: 1020px;
            height: 650px;
            background: @bg_area;
            border: 1px solid @border_color_area;
            border-radius: @border_radius_large;
            .tab-header {
                color: @text_color_area;
                font-size: @font38px;
                display: flex;
                width: 6.3rem;
                margin: 0 auto;
                justify-content: space-around;
                span {
                    cursor: pointer;
                    background: transparent;
                    line-height: 90px;
                }
                .active {
                    color: @text_color_white;
                    border-bottom: 8px solid @text_color_white;
                    font-weight: bolder;
                }
            }
        }
        .face {
            margin-top: 40px;
            margin-bottom: 30px;
            position: relative;
            img {
                width: @camera_w;
                height: @camera_h;
                opacity: 0.3;
            }
        }
        .info {
            color: @text_color_area;
        }
        .form {
            width: 630px;
            margin: 0 auto;
            /deep/.el-form {
                margin-top: 85px;
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
                                    height: @form_h;
                                    line-height: @form_h;
                                }
                            }
                        }
                    }
                }
            }
            .btns {
                margin-top: 50px;
                text-align: center;
                width: 100%;
                span {
                    display: block;
                }
                .shj-btn--primary {
                    background: #3874ff;
                    border-color: #3874ff;
                }
            }
        }
    }
}
</style>
