/*
 * @Author: nihc
 * @Date: 2020-11-25 17:46:00
 * @Last Modified by: nihc
 * @Last Modified time: 2021-03-08 18:00:07
 */

<template>
    <div class="entry">
        <div class="title-box">
            <p>
                <img class="caseIcon" src="/images/trial/caseName.png" />
                <span>{{caseCode}}</span>
            </p>
            <p>案由:{{caseCouseName}}</p>
        </div>

        <div class="sign-box">
            <div class="content-box">
                <div class="tab-box">
                    <div class="tab-header">
                        <span :class="{ active: activeTab === '1' }" @click="activeTab = '1'">AI核验签到</span>
                        <span :class="{ active: activeTab === '2' }" @click="activeTab = '2'">手动签到</span>
                    </div>
                    <div class="tab-content">
                        <div v-show="activeTab === '1'">
                            <div class="faceBox">
                                <div class="face pos-r">
                                    <p
                                        class="vertical-horizontal-center font-color-error"
                                    >{{ this.isdetected }}</p>

                                    <div class="CVR_IDCard" v-if="showIDCard">
                                        <OBJECT
                                            ref="CVR_IDCard"
                                            height="1"
                                            width="1"
                                            classid="clsid:10946843-7507-44FE-ACE8-2B3483D179B7"
                                            name="CVR_IDCard"
                                        ></OBJECT>
                                    </div>
                                    <img src="@/assets/images/login/face.png" />
                                    <div
                                        class="cameraBox vertical-horizontal-center"
                                        ref="cameraBox"
                                    >
                                        <!-- <photo-flash
                                            :showCamera="showCamera"
                                            :cameraWidth="cameraWidth"
                                            :cameraHeight="cameraHeight"
                                            :action="cameraAction"
                                            @changeImg="changeImg"
                                        ></photo-flash> -->

                                        <n-b-video
                                            ref="nbVideo"
                                            :isShowVideo="showCamera"
                                            @videoPlayerLoaded="videoPlayerLoaded"
                                            @emitStatusChange="emitStatusChange"
                                            @emitSetWinNum="emitSetWinNum"
                                            @changeImg="changeImg"
                                            :videoWidth="cameraWidth"
                                            :videoHeight="cameraHeight"
                                            :NBAction="cameraAction"
                                        ></n-b-video>
                                    </div>
                                </div>
                                <div
                                    class="info txt-center"
                                >1、请把二代身份证放到身份证读卡器&nbsp;&nbsp;&nbsp;&nbsp;2、请面对屏幕上方摄像机</div>
                            </div>
                            <!-- <span
                                    class="shj-btn--primary shj-btn--medium"
                                    @click="takePhoto"
                                >截图</span> -->
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
                                        placeholder="请输入姓名"
                                        clearable
                                        @keyup.enter.native="submit"
                                    >
                                        <i class="el-input__icon i-idCard" slot="prefix"></i>
                                    </el-input>
                                </el-form-item>

                                <el-form-item label prop="randomCode" :error="error">
                                    <el-input
                                        v-model="ruleForm.randomCode"
                                        placeholder="请输入随机码"
                                        :type="setType"
                                        clearable
                                        @keyup.enter.native="submit"
                                    >
                                        <i class="el-input__icon i-randomNum" slot="prefix"></i>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                            <div class="info txt-left">随机码请咨询书记员或审判长</div>
                            <div>
                                <!-- <a
                                    class="font-color-error"
                                    target="_blank"
                                    download=""
                                    :href="formatUrl()"
                                    >插件下载
                                </a>-->
                            </div>
                            <div class="btns">
                                <span
                                    class="shj-btn--primary shj-btn--medium"
                                    @click="signInSubmit"
                                >签到</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="list-box">
                    <div class="list-header">
                        <span>签到列表</span>
                    </div>
                    <div class="list-content" ref="tableBox">
                        <div class="list-item">
                            <sign-table :tableHeight="tableHeight" :tableAction="tableAction"></sign-table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <loading-iframe :isLoadingShow="isShowPic" :loading="loadingObj"></loading-iframe>
    </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
import { isIE, getByteLen } from '@/utils/utils';
// import PhotoFlash from '@/views/login/photoFlash';
import SignTable from '@/views/party/signTable';
import NBVideo from '@/views/plugins/NewNBVideo';
import { stompClient, sendMsgFn } from '@/utils/SocketJS';
import LoadingIframe from '@/components/common/LoadingIframe';

let validateRandomCode = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入随机码'));
    } else if (!!randomNum && value !== randomNum) {
        callback(new Error('随机码错误'));
    } else {
        callback();
    }
};
let randomNum = null;
export default {
    name: 'signIn',
    components: {
        // PhotoFlash,
        SignTable,
        NBVideo,
        LoadingIframe
    },
    inject: ['reload', 'userInfo'],
    props: {},
    data() {
        return {
            isShowPic: false, // 是否显示摄像头拉起的画面
            loadingObj:{
                text:'正在开启摄像头请稍后'
            },
            isdetected: '请放置好身份证',
            showCamera: false, // 显示photo组件
            isLoaded: false, // nbvide是否加载
            playStauts:'',//nbvideo播放状态
            cameraAction: '',
            cameraHeight: 0,
            cameraWidth: 0,
            timeOutNum: 3000,
            matchCount: 0,
            showIDCard: false,
            idCardInfo: {}, // 读卡信息存储
            CardidUrl: '', // 身份证图片base64
            timer: null, // 读卡定时器
            cameraTimer: null, // 抓拍定时器
            activeTab: '2', // tab项切换
            rememberPwd: true, // 记住密码
            isShow: true, // 密码可见
            ruleForm: {
                name: '',
                randomCode: ''
            }, // 表单
            rules: {
                // 表单验证
                name: [
                    {
                        required: true,
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (!this.ruleForm.name) {
                                callback(new Error(`请输入用户名！`));
                            } else if (getByteLen(value) > 20) {
                                callback(new Error(`用户名不能超过10个中文字符`));
                            } else {
                                callback();
                            }
                        }
                    }
                    // { min: 11, max: 11, message: '长度为11位', trigger: 'change' }
                ],
                randomCode: [
                    {
                        required: true,
                        trigger: 'blur',
                        validator: validateRandomCode
                    }
                ]
            },
            error: '', // 手动登录错误提示
            tableHeight: '',
            tableAction: '',
            caseCode: '', // 案件名称
            caseCouseName: '' // 案由
            // randomNum:""//案件随机码
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
                        console.log('activeTab---initData', this.activeTab);
                        _this.initData();

                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    async mounted() {

        if (this.userInfo) {
            this.ruleForm.name = this.userInfo.username;
        }
        this.initData();
        // 填充案件信息
        await this.queryTrialInfo();
        await this.clearTimer();
        await this.clearCameraTimer();

        await this.setTableHeight();
        window.addEventListener('beforeunload', this.handleBeforeUnload, false);
        window.addEventListener('resize', this.setTableHeight, false);
    },
    beforeDestroy() {
        this.handleBeforeUnload();

        window.removeEventListener('beforeunload', this.handleBeforeUnload, false);
        window.removeEventListener('resize', this.setTableHeight, false);
    },
    methods: {
        // 接口引入
        ...mapActions({
            saveSignIn: 'moduleParty/saveSignIn',
            queryTrialById: 'moduleJudge/queryTrialById',
            tokenExpires: 'moduleLogin/tokenExpires'
        }),
        ...mapMutations(['isLoginMut', 'userInfoMut', 'tokenMut', 'roleMut']),
        handleBeforeUnload() {
            this.clearTimer();
            this.clearCameraTimer();
        },
        initData() {
            this.showCamera = false;
            this.clearForm();
            this.isdetected = '请放置好身份证';
            this.matchCount = 0;
            this.isShowPic=false;
            this.clearTimer();
            this.clearCameraTimer();

        },
        setTableHeight() {
            setTimeout(() => {
                console.log('this.$refs.tableBox.clientHeight', this.$refs.tableBox.clientHeight);
                this.tableHeight = this.$refs.tableBox.clientHeight + 'px';
            }, 20);
        },
        // 清除身份证读取定时器
        clearTimer() {
            if (this.timer) {
                clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
                this.timer = null;
            }
        },
        // 清除人脸识别定时器
        clearCameraTimer() {
            if (this.cameraTimer) {
                clearInterval(this.cameraTimer);
                this.cameraTimer = null;
            }
        },
        // 清除表单name
        clearForm() {
            this.ruleForm = {
                name: '',
                randomCode: ''
            }; // 表单
        },
        // 查询庭审信息
        queryTrialInfo() {
            let _this = this;
            this.queryTrialById({ trialId: this.$route.query.trialId }).then((res) => {
                if (res.code == 0) {
                    console.log(res);
                    let rdata = res.data;
                    _this.caseCode = rdata.caseCode;
                    _this.caseCouseName = rdata.caseCouseName;
                    // _this.randomNum=rdata.randomCode;
                    console.log('randomCode', rdata.randomCode);
                    randomNum = rdata.randomCode;
                }
            });
        },
        // 按钮点击-签到
        signInSubmit() {
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    let params = {
                        name: this.ruleForm.name.trim(),
                        peopleId: this.userInfo().id,
                        trialId: this.$route.query.trialId,
                        signType: 2// 2手动签到1人脸签到
                    };

                    // 请求接口-签到
                    this.saveSignInInfo(params);
                }
            });
        },

        // 保存签到信息
        saveSignInInfo(params) {
            let _this = this;
            this.saveSignIn(params).then((res) => {
                ++_this.matchCount;
                console.log(`saveSignInInfo---${new Date()}`)
                if (_this.matchCount > 5) {
                    _this.$message.success('识别失败,请重新登录!');
                    _this.activeTab = '2';
                }
                else {
                    switch (res.code) {
                        case 0:
                            console.log(res.data);
                            sendMsgFn(
                                {
                                    msgType: 'signInStatus',
                                    trialId: this.$route.query.trialId,
                                    optType: 2 // 0结束签到1发起签到2当事人签到
                                },
                                stompClient
                            );
                            _this.$message.success('签到成功');
                            _this.tableAction = `refreshnum${new Date().getTime()}`;
                            if (_this.activeTab == '1') {

                                _this.activeTab = '2';
                            }
                            break;
                        case 10110:
                            console.log('人脸比对相识度过低');
                            break;
                        case 10109:
                            console.log('未检测到人脸');
                            break;
                        case 10111:
                            console.log('AI 签到失败,未找到今日庭审案件信息');
                            _this.activeTab = '2';

                            break;
                        default:
                            console.log('未知错误');

                            break;
                    }
                }

            });
        },

        formatUrl() {
            return `${__API__}/trial/sys/downloadCenter/downloadPlugin/systemPluginParty`;
        },

        /* --------------------身份证读取-开始-------------------- */
        readIdCard() {
            this.showIDCard = true;
            this.isdetected = '正在读取身份证';
            this.$nextTick(() => {
                this.clearIdCardInfo();
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
            });
            // this.initCameraPhoto();

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

        clearIdCardInfo() {
            this.idCardInfo = {};
        },
        /* --------------------身份证读取-结束-------------------- */
        /* --------------------webcam人脸识别-开始-------------------- */
        videoPlayerLoaded() {
            console.log(`signIn---NBVideo---videoPlayerLoaded---${new Date()}`);
            this.isLoaded = true;
            this.cameraAction = `getCameranum${new Date().getTime()}`;


        },
        emitStatusChange(num,ret){
            console.log('emitStatusChange',num,ret)
            this.playStauts=ret;
        },
        emitSetWinNum(){
            console.log("SignIn---emitSetWinNum")
            this.isShowPic=true;

        },
        initCameraPhoto() {

            let _this = this;
            _this.showCamera = true;

            this.$nextTick(() => {
                _this.isdetected = '正在开启摄像头';
                _this.cameraHeight = _this.$refs.cameraBox.clientHeight;
                _this.cameraWidth = _this.cameraHeight * 16 / 10;
                console.log('this.cameraHeight', this.cameraHeight, 'this.cameraWidth', this.cameraWidth);

            });
            this.cameraTimer = setInterval(() => {
                // console.log('initCameraPhoto',_this.playStauts);
                if (_this.isLoaded&&_this.playStauts=='Playing') {
                    _this.takePhoto();
                    _this.isShowPic=false;

                }
            }, this.timeOutNum);
        },
        changeImg(b64) {
            console.log(`changeImg---${new Date()}`);
            console.log(`base64---${b64}`);
            this.isdetected = '请保持不动';
            let params = {
                facePic: b64, // 脸图片base64编码
                identityNo: this.idCardInfo.cardNo,
                identityPic: this.idCardInfo.photoBuffer,
                signType: 1,
                peopleId: this.userInfo().id,
                trialId: this.$route.query.trialId,
                name: this.idCardInfo.name // 当事人姓名
            };
            console.log('changeImg', params, this.idCardInfo);
            this.saveSignInInfo(params);
        },
        takePhoto() {
            // console.log('signIn---takePhoto');
            this.cameraAction = `screenShotnum${new Date().getTime()}`;
        }
        /* --------------------webcam人脸识别-end-------------------- */
    }
};
</script>

<style scoped lang='less'>
@camera_w: 592px;
@camera_h: 370px;
@sign_left: 920px;
.cameraBox {
    width: @camera_w;
    height: @camera_h;
    z-index: 0;
    // border: 1px solid red;
}

@form_h: 70px;
.entry {
    width: 100%;
    height: 100%;
    background: url('@{base_url}/login/login_bg.png') no-repeat top center;
    background-size: 100% 100%;
    .title-box {
        height: 200px;
        color: #fff;
        margin: 0 80px;
        padding: 40px 0;
        font-size: @font30px;
        .caseIcon {
            height: 40px;
        }
        p {
            margin: 10px 0;
        }
    }
    .sign-box {
        position: absolute;
        top: 200px;
        left: 80px;
        right: 80px;
        bottom: 80px;
        .content-box {
            width: 100%;
            height: 100%;
            background: @bg_area;
            border: 1px solid @border_color_area;
            border-radius: @border_radius_large;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px 0;
        }
        .tab-box {
            width: @sign_left;
            height: 100%;
            padding-right: 60px;
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
            .tab-content {
                border-right: 2px solid @border_color_area;
                .face {
                    margin-top: 40px;
                    margin-bottom: 30px;
                    position: relative;
                    text-align: center;
                    p {
                        z-index: 1999;
                    }
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
        .list-box {
            width: calc(100% - @sign_left);
            height: 100%;
            // background: red;
            .list-header {
                color: @text_color_area;
                font-size: @font38px;
                display: flex;
                width: 6.3rem;
                justify-content: flex-start;
                padding-left: 30px;
                span {
                    cursor: pointer;
                    background: transparent;
                    line-height: 90px;
                }
            }
            .list-content {
                height: calc(100% - 90px);
                // border: 1px solid #000;
                display: flex;

                .list-item {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}
</style>
