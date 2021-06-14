/* 当事人登录---webRTC
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:18:05
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-20 10:14:09
 */

<template>
    <div class="entry">
        <div class="CVR_IDCard">
            <OBJECT
                ref="CVR_IDCard"
                height="0"
                width="0"
                classid="clsid:10946843-7507-44FE-ACE8-2B3483D179B7"
                name="CVR_IDCard"
            ></OBJECT>
        </div>
        <div class="faceCamera">
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
        <div style="display:none">
            <canvas id="picture" ref="picture"></canvas>

            <button class="shj-btn--primary" @click="snapshot">截图</button>

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
                    <div v-if="activeTab === '1'">
                        <div class="face pos-r">
                            <p
                                class="vertical-horizontal-center font-color-error"
                            >
                                {{ this.isdetected }}
                            </p>

                            <img src="@/assets/images/login/face.png" />
                        </div>
                        <div class="info txt-center">
                            1、请把二代身份证放到身份证读卡器&nbsp;&nbsp;&nbsp;&nbsp;2、请面对屏幕上方摄像机
                        </div>
                    </div>
                    <div v-if="activeTab === '2'" class="form">
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
                                    autocomplete="off"
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
// import dat from 'dat.gui';
import '../../../public/adapter.screenshare.js';

// import tracking from 'tracking/build/tracking-min.js';
require('tracking/build/tracking-min.js');
require('tracking/build/data/face-min.js');
// require('tracking/examples/assets/stats.min.js');
export default {
    name: 'PartyEntry',
    components: {},
    inject: ['reload'],
    props: {},
    data() {
        return {
            isdetected: '请您保持脸部在画面中央!',
            idCardInfo: {},
            count: 0,
            videoWidth: 320,
            videoHeight: 240,
            // videos
            myVideo: {},
            activeTab: '2',
            userToken: null,
            rememberPwd: true, // 记住密码
            isShow: false, // 密码可见
            constraints: {
                audio: {
                    noiseSuppression: true,
                    echoCancellation: true
                },
                video: {
                    width: 400,
                    height: 300,
                    frameRate: 30,
                    // transform: 'scaleX(-1)',
                    facingMode: 'environment'
                }
            },
            ruleForm: {
                name: '',
                randomCode: ''
            }, // 表单
            rules: {
                // 表单验证
                name: [
                    {
                        required: true,
                        message: '请输入姓名',
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
            error: ''
        };
    },
    computed: {
        ...mapState(['userInfo']),
        ...mapGetters(['userInfoGet']),

        // 输入框类型切换
        setType() {
            return this.isShow ? 'text' : 'password';
        }
    },
    watch: {
        activeTab: {
            handler() {
                this.$nextTick(() => {
                    if (this.activeTab === '1') {
                        if (isIE()) {
                            this.timer = setInterval(() => {
                                if (this.readIdCard()) {
                                    clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
                                }
                            }, 2000);
                        }
                        this.initFaceCamera();
                    } else {
                        if (this.timer) {
                            clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
                        }
                        this.stopMediaStreamTrack();
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
        this.myVideo = document.getElementById('video');

    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
        }
    },
    destroyed() {
        this.stopMediaStreamTrack();
    },
    methods: {
        // 接口引入
        ...mapActions('moduleLogin', [
            'casePeopleLogin',
            'getCurUserInfo',
            'AILogin'
        ]),
        ...mapMutations([
            'isLoginMut',
            'userInfoMut',
            'tokenMut',
            'roleMut'
        ]),

        // 初始化
        init() {
            if (this.userInfo) {
                this.ruleForm.name = this.userInfo.username;
            }
        },

        // 按钮点击-登录
        submit() {
            requestFullScreen(document.documentElement);

            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    let params = {
                        name: this.ruleForm.name,
                        randomCode: this.ruleForm.randomCode
                    };

                    // 请求接口-登录
                    this.reqCasePeopleLogin(params);
                    // this.doLogin(params);
                }
            });
        },

        // 接口-登录
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
                        _this.userInfoMut(res.data);
                        _this.$nextTick(() => {
                            _this.doLogin(trialId);
                        });
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
                    // caseCode: item.caseCode,
                    trialId: trialId
                }
            });
        },

        // 人脸识别登录
        reqAILogin(params) {
            this.AILogin(params).then((res) => {
                if (res.code === 0) {
                    //
                } else {
                    this.isdetected = '请您保持脸部在画面中央!';
                    if (this.activeTab === '1') {
                        setTimeout(() => {
                            this.initFaceCamera();
                        }, 5000);
                    }
                }
            });
        },

        formatUrl() {
            return `${__API__}/trial/sys/downloadCenter/downloadPlugin`;
        },

        /* --------------------身份证读取-开始-------------------- */
        readIdCard() {
            this.clearForm();
            this.CVR_IDCard = this.$refs.CVR_IDCard;
            let ret = this.CVR_IDCard.ReadCard();
            if (ret == '0') {
                this.fillForm();
                return true;
            }
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
                photoDisplay:
                    'data:image/jpeg;base64,' + this.CVR_IDCard.Picture
            };
            console.log('身份证base64', this.idCardInfo.photoBuffer);
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
            // let startDt = new Date();
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
                        // eslint-disable-next-line no-undef
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
                        // eval.call(window, data);
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

        /* --------------------人脸识别-开始-------------------- */
        async initFaceCamera() {
            this.canvas = this.$refs.canvas;
            // 获取媒体属性，旧版本浏览器可能不支持mediaDevices，我们首先设置一个空对象
            if (!navigator.mediaDevices) {
                navigator.mediaDevices = {};
                console.log('设置mediaDevices空对象');
            }
            // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
            // 使用getUserMedia，因为它会覆盖现有的属性。
            // 这里，如果缺少getUserMedia属性，就添加它。
            if (!navigator.mediaDevices.getUserMedia) {
                navigator.getUserMedia =
                    navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia; // 有些浏览器不支持，会返回错误信息
                console.log('重新定义getUserMedia');
                if (!navigator.getUserMedia) {
                    // 不存在则报错
                    console.log('此浏览器中不包含getUserMedia方法');
                    return false;
                }
            }

            // await navigator.mediaDevices
            //     .getUserMedia(this.constraints)
            //     .then(this.getMediaStreamSuccess)
            //     .catch(this.getMediaStreamError);
            await this.getUserMedia();

            await this.onPlay();
        },
        // 拿到媒体流
        async getUserMedia() {
            console.log(`Requesting  video stream`);

            if ('mediaDevices' in navigator) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia(
                        this.constraints
                    );
                    this.getMediaStreamSuccess(stream);
                    console.log('Received local video stream');
                } catch (error) {
                    this.getMediaStreamError();
                    console.log(`getUserMedia error: ${error}`);
                }
            }
        },
        // 视频媒体流成功
        getMediaStreamSuccess(stream) {
            window.stream = stream; // make stream available to browser console
            window.attachMediaStream(this.myVideo, stream);
            this.myVideo.srcObject = stream;
            console.log('getMediaStreamSuccess', stream);
        },

        // 视频媒体流失败
        getMediaStreamError(error) {
            this.$message.error('视频媒体流获取错误' + error);
        },

        // 截图
        snapshot() {
            let canvas = this.$refs.picture;
            canvas.width = 400;
            canvas.height = 300;
            canvas.getContext('2d').drawImage(this.myVideo, 0, 0, canvas.width, canvas.height);
        },

        // 开始识别
        async onPlay() {
            console.log('onPlay');
            // this.onTrackTracking();
        },

        // 人脸侦测中
        onTrackTracking() {
            const _this = this;
            const video = this.myVideo;
            const canvas = this.canvas;
            const canvasContext = canvas.getContext('2d');
            // eslint-disable-next-line no-undef
            let tracker = new tracking.ObjectTracker('face');
            video.pause();
            video.src = '';
            tracker.setInitialScale(4);
            tracker.setStepSize(2);
            tracker.setEdgesDensity(0.1);
            // eslint-disable-next-line no-undef
            console.log('tracker setEdgesDensity');
            _this.trackerTask = tracking.track('#video', tracker, {camera: true});
            /* let element = tracking.one(this.myVideo);
            console.log('element', element);
 */
            console.log('tracker trackerTask');
            let yRect;
            tracker.on('track', function(event) {
                console.log('track event');
                if (event.data && event.data.length === 0) {
                    if (_this.isGetFace) {
                        _this.isdetected = '正在登录...';
                    } else {
                        _this.isdetected = '请您保持脸部在画面中央!';
                        canvasContext.clearRect(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );
                    }
                } else {
                    for (let rect of event.data.values()) {
                        console.log('已检测到人脸');
                        // _this.isdetected = '已检测到人脸，正在登录...';
                        canvasContext.strokeStyle = '#ff0000';
                        canvasContext.strokeRect(
                            rect.x,
                            rect.y,
                            rect.width,
                            rect.height
                        );
                        canvasContext.font = '11px Helvetica';
                        canvasContext.fillStyle = '#fff';
                        canvasContext.fillText(
                            'x: ' + rect.x + 'px',
                            rect.x + rect.width + 5,
                            rect.y + 11
                        );
                        canvasContext.fillText(
                            'y: ' + rect.y + 'px',
                            rect.x + rect.width + 5,
                            rect.y + 22
                        );
                        // _this.isGetFace = true;
                        // _this.shoot(
                        //     rect,
                        //     video,
                        //     canvas,
                        //     canvasContext,
                        //     tracker
                        // );
                        // window.stream.getTracks().forEach((track) => track.stop()); // 停止侦测
                        // _this.sleep(1000 * 60 * 1);

                        yRect = rect;
                        break;
                    }
                    /* event.data.forEach(function(rect) {

                    }); */
                    if (event.data && _this.count <= 10) {
                        console.log(_this.count);
                        if (_this.count < 0) {
                            _this.count = 0;
                            _this.isdetected = '请您保持脸部在画面中央!';
                        }
                        _this.count += 1;
                        if (_this.count > 10) {
                            _this.isdetected = '已检测到人脸，正在登录';
                            _this.isGetFace = true;
                            _this.shoot(
                                yRect,
                                video,
                                canvas,
                                canvasContext,
                                tracker
                            );
                            window.stream
                                .getTracks()
                                .forEach((track) => track.stop());
                            _this.count = 0;
                        }
                    } else {
                        _this.count -= 1;
                        if (_this.count < 0) {
                            _this.isdetected = '请您保持脸部在画面中央!';
                        }
                    }
                }

                /* let gui = new dat.GUI();
                gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
                gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
                gui.add(tracker, 'stepSize', 1, 5).step(0.1); */
            });
        },

        shoot(rect, video, canvas, canvasContext, tracker) {
            // 把当前视频帧内容渲染到画布上
            // canvasContext.drawImage(video,x,y,width+20,height+20);
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            canvasContext.drawImage(
                video,
                rect.x - 50,
                rect.y - 50,
                rect.width + 50,
                rect.height + 100,
                0,
                0,
                rect.width + 50,
                rect.height + 100
            );
            let imgSrc = this.canvas.toDataURL('image/png');
            // console.log(imgSrc);
            // 删除字符串前的提示信息 "data:image/png;base64,"
            let b64 = imgSrc.substring(22);
            let idCardB64 =
                '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAB+AGYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDv6KKKACikZgilmIAHJJrgvEvjJ5TJZ6adsfQzg8n6f40Adjf6tY6cubu5SM4yFzyfoK5y88eW6S7bS3eRB/Ex25+grgpZZJXLyMXc9WY5JqPBJpgd9F4+i/5a2jD3Vh/hWlaeM9IuGVHlaF2/56LgD6npXmG00YIFAHtyOkiBkYMp6EGnV5Ho2v';
            let params = {
                facePic: b64, // 脸图片base64编码
                // identityPic: this.idCardInfo.photoBuffer, // '身份证图片base64编码'
                identityPic: idCardB64,
                name: '时慧君' // 当事人姓名
                // name: this.idCardInfo.name// 当事人姓名
            };
            this.reqAILogin(params);
        },

        // 休眠方法--测试
        sleep(numberMillis) {
            let now = new Date();
            let exitTime = now.getTime() + numberMillis;
            while (true) {
                now = new Date();
                if (now.getTime() > exitTime) {
                    return;
                }
            }
        },

        // base64转文件
        dataURLtoFile(dataurl, filename) {
            let arr = dataurl.split(',');
            let mime = arr[0].match(/:(.*?);/)[1];
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        },

        // 结束媒体流
        stopMediaStreamTrack() {
            // this.trackerTask.stop();// 停止侦测
            // this.trackerTask.closeCamera();// 关闭摄像头
            if (typeof window.stream === 'object') {
                if (this.myVideo.srcObject) {
                    this.myVideo.srcObject = null;
                }
                // this.$store.commit('setVideoCanvasObject', '')
                window.stream.getTracks().forEach((track) => track.stop()); // 停止侦测
            }
        }
        /* --------------------人脸识别-结束-------------------- */
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
            /* .tab-content {
            } */
        }
        .face {
            margin-top: 40px;
            margin-bottom: 30px;
            position: relative;
            img {
                width: 740px;
                height: 420px;
            }
        }
        .info {
            color: @text_color_area;
        }
        a {
            text-decoration: underline;
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
                margin-top: 10px;
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
