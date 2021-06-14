/*庭审笔录---打点/传阅/语音识别----wps
 * @Author: nihc
 * @Date: 2020-09-07 10:49:40
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-12 15:06:03
 */

<template>
    <div class="page-box full-height">
        <div class="page-title">
            <div class="fl">
                庭审笔录
            </div>

            <div class="opt-box fr margin-right20" style="display:block">
                <!-- <a-button type="primary" class="margin-right20" @click="autoAddText()">语音识别</a-button>
                <a-button type="primary" class="margin-right20">手写笔录</a-button> -->
                <!-- <a-button type="primary" @click="openFile">打开模板</a-button> -->
                <a-button type="primary" class="margin-right20" @click.stop="fnSpeechRecognition()" v-show="isShowSpeechRecognition">语音识别</a-button>

                <a-button type="primary" class="margin-right20" @click.stop="fnDotList()" v-show="isShowDotList">打点列表</a-button>

                <a-button type="primary" class="margin-right20" v-show="isShowDotBtn" @click="fnDot()">打点</a-button>
                <!--<a-button type="primary" @click="saveFile()" v-show="isShowDotSave">保存</a-button>-->
                <a-button type="primary" v-if="ntkoReadonly" @click="refresh()" :disabled="refreshCount > 0">
                    同步书记员笔录{{refreshCount > 0 ? refreshCount : ''}}
                </a-button>
            </div>
        </div>
        <div class="page-content" ref="ntkoBox" >
            <ntko v-if="showNtko&&isWindow" ref="ntko"
                  :NtkoAction="NtkoAction"
                  :addTextString="addTextString"
                  :signPicPath="$attrs['signPicPath']"
                  :receiveNoteCirculation="$attrs['sendNoteCirculation']"
                  :ntkoHeight="ntkoHeight"
                  :ntkoDotTimeStamp="ntkoDotTimeStamp"
                  @ntkoLoaded="ntkoLoaded"
                  @emitDotSuccess="emitDotSuccess"
                  :signStatus="signStatus"
                  :ntkoFilePath="ntkoFilePath"
                  @emitNtkoReadonly="emitNtkoReadonly"
                  >
                  </ntko>
                  <wps
                    v-if="showNtko&&!isWindow" ref="ntko"
                  :NtkoAction="NtkoAction"
                  :addTextString="addTextString"
                  :signPicPath="$attrs['signPicPath']"
                  :receiveNoteCirculation="$attrs['sendNoteCirculation']"
                  :ntkoHeight="ntkoHeight"
                  :ntkoDotTimeStamp="ntkoDotTimeStamp"
                  @ntkoLoaded="ntkoLoaded"
                  @emitDotSuccess="emitDotSuccess"
                  :signStatus="signStatus"
                  :ntkoFilePath="ntkoFilePath"
                  @emitNtkoReadonly="emitNtkoReadonly"

                  ></wps>
        </div>
        <div class="page-footer">
            <a-row style="width:100%;position: relative;z-index: 1800">
                <a-col :span="24" class="txt-right">
                    <!--<a-button type="primary" class="margin-right20" v-show="isShowReviewBtn" @click="noteCirculation(2)">-->
                        <!--笔录审阅-->
                    <!--</a-button>-->
                    <a-button type="primary" class="margin-right20" @click="noteCirculation"
                              v-show="isShowPassBtn && signStatus == '0'">笔录传阅
                    </a-button>
                    <!-- <a-button v-show="isShowSignature && signStatus !== '2'" type="primary" class="margin-right20"
                              @click="signature(0)">法官签名
                    </a-button>
                    <a-button v-show="isShowSignature && signStatus !== '2'" type="primary" class="margin-right20"
                              @click="signature(1)">当事人签名
                    </a-button>
                    <a-button v-show="isShowSignature && signStatus === '1'" type="primary"
                              @click="endSignature">结束签名
                    </a-button> -->
                </a-col>
            </a-row>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Ntko from '@/views/plugins/Ntko';
import InitiateSignature from '@/views/home/InitiateSignature';
import wps from '@/views/plugins/Wps';

export default {
    components: {
        wps,
        Ntko,
        InitiateSignature
    },
    inject: ['reload', 'userInfo'],
    inheritAttrs: false,
    props: {
        dotTimestamp: {
            type: String,
            default: ''
        },
        trialStatus: {
            type: String,
            default: ''
        },
        signStatus: {
            type: String, // 0 未签名 1 签名中 2 已签名
            default: ''
        },
        ntkoFilePath: {// 打开文件的文件地址
            type: String,
            default: ''
        }

    },
    data() {
        return {
            NtkoAction: '', // ntko相关操作
            addTextString: '增加的文本', // 增加的文本
            currentUser: {},
            ntkoHeight: 500,
            ntkoDotTimeStamp: '',
            showNtko: false,
            ntkoReadonly: false, // ntko是否只读,
            refreshCount: 0, // 刷新笔录状态控制
            isShowDotBtn: false,
            isShowDotSave: false,
            isShowPassBtn: false, // 是否显示笔录传阅按钮
            isShowReviewBtn: true, // 是否显示笔录审阅按钮
            isShowSignature: false, // 是否显示签名按钮
            signWin: null, // 签名页面窗口
            mode: 1, // 签名模式 默认签名+指纹
            isEndTrial: false, // 是否是庭审后页面
            isTrialing: false
        };
    },
    computed: {
        ...mapGetters('moduleJudge', ['recordIdGet', 'trialStatusGet']),

        isShowSpeechRecognition() {
            return this.comm.isTrialAuthorizeShow('trial:record:voice');
        },
        isShowDotList() {
            return this.comm.isTrialAuthorizeShow('trial:record:dotList');
        },
        isWindow() {
            return window.navigator.platform.indexOf('Linux')>-1?false:true;
        }
    },
    watch: {
        dotTimestamp: {
            handler(newVal, oldVal) {
                if (newVal) {
                    this.ntkoDotTimeStamp = newVal;
                    this.markLink();
                }
            },
            deep: true,
            immediate: true
        },
        trialStatus: {
            handler(newVal, oldVal) {
                if (newVal === '1' && this.comm.isTrialAuthorizeShow('trial:record:dot')) {
                    this.isShowDotBtn = true;
                }
                else {
                    this.isShowDotBtn = false;
                }
                // 签名按钮 闭庭后显示
                this.isShowSignature = (newVal === '4' || newVal === '5') && this.comm.isTrialAuthorizeShow('trial:record:signature');

                // 笔录传阅 庭审中页面 闭庭后且签名结束前显示
                this.isShowPassBtn = (newVal === '4' || newVal === '5') &&
                    this.comm.isTrialAuthorizeShow('trial:record:pass') &&
                    window.location.href.indexOf('home') > -1;
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        this.currentUser = this.userInfo();
        let _this = this;
        this.$nextTick(function() {
            this.isEndTrial = window.location.href.indexOf('trialCheck') > -1;

            // 庭审 及庭审后页面都显示保存按钮
            if (this.isEndTrial || this.comm.isTrialAuthorizeShow('trial:record:dotSave')) {
                _this.isShowDotSave = true;
            }
            // 为签名存储trialId
            // sessionStorage.setItem('trialId', _this.$route.query.trialId);
            _this.init();
            _this.resetNtko();

        });

        // window.addEventListener('resize', this.resetNtko, false);
        window.addEventListener('beforeunload', this.resetSign, false);
    },
    beforeDestroy() {
        this.resetSign();
        // window.removeEventListener('resize', this.resetNtko, false);

        window.removeEventListener('beforeunload', this.resetSign, false);

    },
    methods: {
        // 接口引入
        ...mapActions('moduleJudge', ['updateSignStatus']),
        init() {
            // if (this.signStatus === '1') {
            //     this.openSignWin();
            // }
        },
        resetNtko() {
            console.log('resetNtko');
            let _this = this;

            _this.showNtko = false;
            _this.$nextTick(() => {
                // _this.$emit('emitShowLoadingIframe');
                setTimeout(() => {
                    _this.ntkoHeight = _this.$refs.ntkoBox.clientHeight - 30;
                    // console.log('_this.ntkoHeight',_this.ntkoHeight);
                    _this.showNtko = true;
                }, 20);
            });


        },
        saveFile() {
            this.NtkoAction = `saveFileAndTipntko${Date.now()}`;
        },
        ntkoLoaded() {
            console.log('ntko加载完毕');
            this.$emit('emitHideLoadingIframe');
        },
        fnDot() {
            this.NtkoAction = `fnDotntko${Date.now()}`;

        },
        fnDotList() {
            console.log('点击打点列表');
            this.$emit('emitShowDotList');
        },
        fnSpeechRecognition() {
            this.$emit('emitShowSpeechRecognition');

        },
        emitDotSuccess() {
            this.$emit('emitTrialDotSuccess');
        },
        markLink() {
            this.NtkoAction = `markLinkntko${Date.now()}`;
        },
        autoAddText() {
            this.NtkoAction = `addTextntko${Date.now()}`;
        },
        // 发起笔录传阅 type 1/审阅 type 2
        noteCirculation(type) {
            //            debugger;
            // if (this.noteUrl === '') {
            //     this.$message.info('请先保存笔录');
            //     return;
            // }
            this.NtkoAction = `saveFilentko${Date.now()}`;
            this.$emit('noteCirculation', type);
        },
        // 发起签名
        signature(mode) {
            this.mode = mode;
            let _this = this;
            this.$CusConfirm({
                title: '签名前，请确认光标放在需要签名的位置。  发起签名后笔录不可再修改，是否发起签名？',
                cancel: () => {
                    //                    console.log('点取消调用');
                },
                ok: () => {
                    if (_this.signWin) {
                        _this.signWin.close();
                        _this.signWin = null;
                    }
                    let params = {
                        noteSignStatus: '1',
                        trialId: _this.$route.query.trialId
                    };
                    _this.updateSignStatus(params).then((res) => {
                        if (res.code === 0) {
                            _this.openSignWin();
                            this.$emit('signature');
                        }
                    });
                }
            });
        },
        // 结束签名
        endSignature() {
            let _this = this;
            this.$CusConfirm({
                title: '是否结束签名？',
                cancel: () => {
                    //                    console.log('点取消调用');
                },
                ok: () => {
                    let params = {
                        noteSignStatus: '2',
                        trialId: _this.$route.query.trialId,
                        noteUrl: this.ntkoFilePath
                    };
                    _this.updateSignStatus(params).then((res) => {
                        if (res.code === 0) {
                            _this.NtkoAction = `saveFilentko${Date.now()}`;
                            _this.$emit('emitSignStatus', '2'); // 更改签名状态
                            _this.signWin.close();
                            _this.signWin = null;
                        }
                    });

                }
            });
        },
        openSignWin() {
            let toRouter = {
                path: '/signature',
                query: {
                    trialId: this.$route.query.trialId,
                    mode: this.mode
                }
            };
            let routeData = this.$router.resolve(toRouter);
            let left = (document.body.clientWidth - 400) / 2;
            let top = (document.body.clientHeight - 300) / 2;
            this.signWin = window.open(routeData.href, '_blank', 'width=400, height=300, top=' + top + ', left=' + left + ', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');


        },
        handleNoteCirculation(flag) {
            this.$refs.ntko.handleNoteCirculation1(flag);
        },
        resetSign() {
            if (this.signWin) {
                this.signWin.close();
                this.signWin = null;
            }
        },
        refresh() {
            this.refreshCount = 10;
            let timer = null;
            timer = setInterval(() => {
                if (this.refreshCount > 0) {
                    this.refreshCount--;
                } else {
                    clearInterval(timer);
                }
            }, 1000);
            this.$refs.ntko.replaceWithLatestContent();
        },
        emitNtkoReadonly(boolean) {
            this.ntkoReadonly = boolean;
        }
    }


};
</script>

<style lang="less" type="text/less" scoped>
.page-box{
    padding:0 40px 20px 40px;
    .page-title{
        height: 60px;
        line-height: 60px;
        font-size: @font28px;
        color:@text_color_black;
        border-bottom: 1px solid @text_color_white_4;
    }
    .page-content{
        height: calc(100% - 100px);
        position: relative;
        padding: 10px 0;
    }
    .page-footer{
        height: 40px;
        display: flex;
        justify-content: space-around;
        .selectBox{
            width: 200px;
        }
    }
}
// 自定义下拉框
.select-container {
    position: relative;
    flex: 1;
    height: 36px;
    border: 1px solid #ccc;
    padding: 3px;
    background-color: #fff;
    cursor: pointer;
    .select-input {
        display: block;
        width: 100%;
        height: 100%;
    }
    .select-list {
        position: absolute;
        bottom: 40px;
        left: 0;
        right: 0;
        height: 150px;
        background-color: #fff;
        cursor: pointer;
        z-index: 2000;
        ul{
            margin: 0;
            height: 100%;
            overflow: auto;
            border: 1px solid #ccc;
            li {
                width: 100%;
                padding: 0 3px;
                margin: 5px 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                &:hover{
                    background-color: #6196ff;
                    color: #fff;
                }
            }
        }
    }
}
</style>
