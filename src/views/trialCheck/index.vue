<template>
    <div class="basic-layout full-height">
        <trial-header-simple
            :randomNum="randomNum"
            :caseName="caseName"
            :caseCodes="caseCodes"
            @emitCaseCode="
                (val) => {
                    caseName = val;
                }
            "
        ></trial-header-simple>
        <div class="content">
            <!-- 电子卷宗和影音证据 -->
            <div class="left">
                <tree-tab
                @emitNodeSelect="treeNodeSelect"
                :ahdm="ahdm"

                ></tree-tab>
            </div>
            <div class="middle full-height pos-r" ref="leftBox">
                <router-view
                    :name="leftRouterName"
                    :fileId="fileId"
                    :fileAction="fileAction"
                    :typeCode="typeCode"
                    :filePlayUrl="filePlayUrl"
                    :pdfFileUrl="pdfFileUrl"
                    :ntkoFilePath="excelFileUrl"
                    @emitDotLinkTo="emitDotLinkTo"
                    @emitShowLoadingIframe="showIframeLoading"
                    @emitHideLoadingIframe="hideIframeLoading"
                ></router-view>
                <div class="controlBox">
                    <img
                        v-show="!slidStatus.leftScale&&!isShowWPS"
                        @click="leftBigger"
                        src="@/assets/images/icon/icon-bigger.png"
                        alt=""
                    />
                    <img
                        v-show="slidStatus.leftScale"
                        @click="splitScreen"
                        src="@/assets/images/icon/icon-smaller.png"
                        alt=""
                    />
                </div>
            </div>
            <div class="right full-height pos-r" ref="rightBox">
                <router-view
                    ref="rightRouter"
                    v-if="!isShowWPS"
                    :name="rightRouterName"
                    @emitShowDotList="emitShowDotList"
                    @emitShowSpeechRecognition="emitShowSpeechRecognition"
                    :sendNoteCirculation="sendNoteCirculation"
                    @signature="signature"
                    :signStatus="signStatus"
                    @emitSignStatus="handleSignStatus"
                    :signPicPath="signPicPath"
                    :ntkoFilePath="noteUrl"
                    :caseCode="caseName"
                    :caseCodes="caseCodes"
                    :trialStatus="trialStatus"
                    :dotTimestamp="dotTimestamp"
                    @emitShowLoadingIframe="showIframeLoading"
                    @emitHideLoadingIframe="hideIframeLoading"
                ></router-view>
                <div class="controlBox">
                    <img
                        v-show="!slidStatus.rightScale&&!isShowWPS"
                        @click="rightBigger"
                        src="@/assets/images/icon/icon-bigger.png"
                        alt=""
                    />
                    <img
                        v-show="slidStatus.rightScale"
                        @click="splitScreen"
                        src="@/assets/images/icon/icon-smaller.png"
                        alt=""
                    />
                </div>
            </div>
            <div class="opt-btns pos-r">
                <button
                    v-for="(btn, index) in optBtns"
                    :key="index"
                    @click="click(btn.func, btn, index)"
                    v-show="btn.isShow"
                    :class="[activeIndex == index ? 'active' : '']"
                >
                    <img :src="`/images/trial/${btn.icon}.png`" alt="" />
                    <!-- <img src="/images/trial/caseInfo.png" alt=""> -->
                    {{ btn.name }}
                </button>
            </div>
        </div>
        <!-- 弹窗-页面右下角提示框-->
        <div class="alert-box-right-bottom" v-if="showAlertBoxInRightBottom">
            <right-bottom-tip
                :tipMsg="tipMsg"
                @emitClose="showAlertBoxInRightBottom = false"
            ></right-bottom-tip>
            <iframe
                src="about:blank"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                style="
                    position: absolute;
                    visibility: inherit;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    height: 100%;
                    z-index: -1;
                "
            ></iframe>
        </div>
         <div class="wps-box"  v-if="isShowWPS">
            <div class="full-width full-height">
                <TrialRecordModal
                    @emitShowDotList="emitShowDotList"
                    @emitShowSpeechRecognition="emitShowSpeechRecognition"
                    @signature="signature"
                    :signStatus="signStatus"
                    :trialStatus="trialStatus"
                    :dotTimestamp="dotTimestamp"
                    :ntkoFilePath="noteUrl"
                    ref="TrialRecordModal"
                >
                    
                </TrialRecordModal>
                <!-- <wps>
                
                </wps> -->
            </div>
            
        </div>
        <!-- 带iframe的加载框 -->
        <loading-iframe :isLoadingShow="isLoadingShow"></loading-iframe>
    </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex';
import LoadingIframe from '@/components/common/LoadingIframe';
import TrialRecordModal from '@/views/home/TrialRecordModal';
import TrialHeaderSimple from '@/components/header/TrialHeaderSimple';
import TreeTab from '@/views/home/TreeTab';
import {
    stompClient,
    disconnectSocket,
    connectSocket,
    startSubscribeFn,
    // sendMsgFn,
    cancelSubscribeFn
} from '@/utils/SocketJS';
import RightBottomTip from '@/views/home/RightBottomTip';

export default {
    components: {
        TrialHeaderSimple,
        TreeTab,
        RightBottomTip,
        LoadingIframe,
        TrialRecordModal
    },
    data() {
        return {
            ahdm: '', // 案件信息中的ahdm---查询电子卷宗使用

            filePlayUrl: null, // 视频播放参数
            pdfFileUrl: '', // 使用pdf插件打开的文件地址
            excelFileUrl: '', // excel文件地址
            leftRouterName: 'TopicReader',
            rightRouterName: 'CaseInfo',
            noteUrl: '', // 笔录地址
            dotTimestamp: '', // 打点时间戳
            activeIndex: 0, // 当前选中的btn--右侧功能项切换
            randomNum: '', // 案件随机码
            caseName: '', // 案件名称
            caseCodes: [], // 并案案号列表currentUser: {}, // 当前用户信息
            trialStatus: '', // 庭审状态
            signStatus: '',  // 签名状态
            isLoadingShow: false, // 显示loading

            trialId: '',
            slidStatus: {
                // 分屏控制状态
                leftScale: false,
                rightScale: false
            },
            optBtns: [
                {
                    isShow: true,
                    icon: 'caseInfo',
                    name: '案件信息',
                    leftRouterName: '',
                    rightRouterName: 'CaseInfo',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: true,
                    icon: 'memoBook',
                    name: '笔录查看',
                    leftRouterName: 'DotRecordPlay',
                    rightRouterName: 'TrialRecordModal',
                    url: '',
                    func: 'fnShowWPS'
                },
                {
                    isShow: true,
                    icon: 'trialRecord',
                    name: '庭审点播',
                    leftRouterName: '',
                    rightRouterName: 'TrialPlay',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: true,

                    icon: 'policeAssistant',
                    name: '警务记录',
                    leftRouterName: '',
                    rightRouterName: 'PoliceHistory',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: true,
                    icon: 'legalInfo',
                    name: '法信平台',
                    leftRouterName: '',
                    rightRouterName: 'LawInfo',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: true,
                    icon: 'message',
                    name: '通讯记录',
                    leftRouterName: '',
                    rightRouterName: 'Message',
                    url: '',
                    func: 'changeRouter'
                }
            ],
            fileId: '', // 材料id
            fileAction: '', // 材料的动作监听
            typeCode: null, // 1-电子卷宗 2-影音证据
            signPicPath: '', // 签名图片地址
            sendNoteCirculation: false, // 笔录是否全屏,
            showAlertBoxInRightBottom: false, // 是否显示-弹窗-右下角弹窗
            isShowWPS:false,//是否显示wps

            tipMsg: '' // 右下角弹窗消息内容
        };
    },
    inject: ['reload', 'userInfo'],
    async mounted() {
        this.currentUser = this.userInfo();
        this.trialId = this.$route.query.trialId;
        sessionStorage.setItem('trialId', this.trialId); // 跳转签名页时调用
        await this.initSocketJS();

        await this.updataAuthorize();

        await this.getTrialInfoAndHandle();
        window.addEventListener('beforeunload', this.handleBeforeUnload, false);

    },
    beforeDestroy() {
        this.handleBeforeUnload();
        window.removeEventListener('beforeunload', this.handleBeforeUnload, false);
    },
    methods: {
        ...mapMutations(
            {
                trialPermsListMut: 'trialPermsListMut',
                recordIdMut: 'moduleJudge/recordIdMut'
            }
        ),

        ...mapActions('moduleJudge', ['queryTrialById', 'getTrialRolePerm']),
        handleBeforeUnload() {
            this.socketJSCancelSubscribe(stompClient);

        },
        /** *****************分屏处理start**********************/
        splitScreen() {
            this.$refs.rightBox.style.display = 'block';
            this.$refs.leftBox.style.display = 'block';
            let lrem = this.comm.px2rem(930);
            let rrem = this.comm.px2rem(850);

            this.$refs.leftBox.style.flex = `0 0 ${lrem}`;
            this.$refs.rightBox.style.flex = `0 0 ${rrem}`;
            this.slidStatus = {
                leftScale: false,
                rightScale: false
            };
        },
        leftBigger() {
            this.$refs.leftBox.style.flex = 1;
            this.$refs.rightBox.style.display = 'none';
            this.slidStatus = {
                leftScale: true,
                rightScale: false
            };
        },
        rightBigger() {
            this.$refs.rightBox.style.flex = 1;
            this.$refs.leftBox.style.display = 'none';
            this.slidStatus = {
                leftScale: false,
                rightScale: true
            };
        },

        /** *****************分屏处理end**********************/
        click(func, item, index) {
            this.activeIndex = index;
            if (this[func]) {
                this[func](item);
            }
        },
        showIframeLoading() {
            this.isLoadingShow = true;
        },
        hideIframeLoading() {
            this.isLoadingShow = false;
        },
        // 路由切换
        changeRouter(item) {
            let _this=this;

            if (this.slidStatus.leftScale || this.slidStatus.rightScale) {
                this.splitScreen();
            }
            // 点击庭审笔录,隐藏菜单
            // 非庭审页面,保存笔录
            if (item.rightRouterName !== 'TrialRecordModal') {
                console.log('changrouter')
                try {
                    this.$refs.rightRouter.$refs.ntko.handleBeforeUnload();
                } catch (error) {
                    console.log('保存失败', error)
                }finally{

                    setTimeout(()=>{
                        //关闭wps页面
                        if(_this.isShowWPS){
                            _this.isShowWPS=false;
                        }
                    },1000)
                     
                }
            }
            if (item.rightRouterName === 'TrialPlay' && ['DotRecordPlay', 'RecordPlay', 'VideoPlayerNB'].indexOf(this.leftRouterName) > -1) {
                item.leftRouterName = 'TopicReader';
            }
            if (item.leftRouterName) {
                this.leftRouterName = item.leftRouterName;
            }
            if (item.rightRouterName) {
                this.rightRouterName = item.rightRouterName;
            }
            if (item.url) {
                this.$router.push({
                    path: item.url
                    // query: {
                    //     id: 'id'
                    // }
                });
            }
            this.sendNoteCirculation = false;
        },

        // 更新权限
        updataAuthorize() {
            this.getTrialRolePerm({'trialId': this.$route.query.trialId}).then((res) => {
                if (res.code == 0 && res.data) {
                    this.trialPermsListMut(res.data.permsList);
                }
            });
        },
        fnShowWPS(){
            this.isShowWPS=true;
            this.splitScreen();
        },
        // 查询庭审信息并且处理
        // 1填充案件名称,随机码
        // 2初始化质证状态
        // 3初始化法官允许阅卷状态
        getTrialInfoAndHandle() {
            let _this = this;
            // 查询庭审信息
            this.queryTrialById({ trialId: this.trialId }).then((res) => {
                console.log('查询庭审信息', res);
                if (res.code != 0) {
                    return false;
                }
                _this.randomNum = res.data.randomCode;
                _this.caseName = res.data.caseCode;
                _this.caseCodes = res.data.caseCodes || [];
                _this.trialStatus = res.data.trialStatus;
                _this.signStatus = res.data.noteSignStatus;
                _this.defendantViewStatus =
                    res.data.defendantView == 1 ? true : false;
                _this.plaintiffViewStatus =
                    res.data.plaintiffView == 1 ? true : false;
                // 更新庭审id
                _this.recordIdMut(res.data.nruSessionid);
                // 更新笔录地址
                _this.noteUrl = res.data.noteUrl;
                _this.ahdm = res.data.ahdm ? res.data.ahdm : '';

            });
        },
        // 庭审状态
        emitTrialStatus(trialStatus) {
            this.trialStatus = trialStatus;
        },
        // 树节点选中传参
        treeNodeSelect(item) {
            console.log('点击节点');
            console.log('treeNodeSelect', item);
            this.selectedKeys = [item.fileId];
            let url = item.url ? item.url.replace(/\\/g, '/') : '';
            let _this = this;
            switch (item.readType) {
                case '-1':
                    this.$message.error('文件正在处理中!');
                    break;
                case '0':// 南北播放器
                    this.filePlayUrl = '';
                    this.leftRouterName = 'VideoPlayerNB';
                    if (this.rightRouterName === 'TrialScene') {
                        this.rightRouterName = 'CaseInfo';
                        this.activeIndex = this.optBtns.findIndex((p) => { return p.rightRouterName === 'CaseInfo' });
                    }
                    this.$nextTick(function() {
                        console.log('url', url);
                        _this.filePlayUrl = url;
                    });
                    break;
                case '1':// 图片方式
                    this.leftRouterName = 'TopicReader';
                    this.$nextTick(() => {
                        _this.fileId = item.fileId;
                        _this.fileAction = `initnum${Date.now()}`;
                        _this.typeCode = item.type;
                        _this.fileNodeInfo = item;
                    });

                    break;
                case '2':// pdf插件

                    this.leftRouterName = 'PdfView';
                    this.$nextTick(() => {
                        _this.pdfFileUrl = url;

                    });
                    break;
                case '3':// excel原文件打开
                    this.excelFileUrl = '';
                    this.leftRouterName = 'NtkoView';
                    this.$nextTick(() => {
                        _this.excelFileUrl = url;
                    });
                    break;
                default:
                    break;
            }
        },

        // 格式化地址
        formatUrl(item) {
            let itemUrl = item.replace(/\\/g, '/');
            let url = `${__API__}/trial${itemUrl}`;
            return url;
        },
        // 显示打点列表
        emitShowDotList() {
            if (this.slidStatus.leftScale || this.slidStatus.rightScale) {
                this.splitScreen();
            }
            this.leftRouterName = 'DotRecordPlay';
            this.rightRouterName = 'TrialRecordModal';
        },
        // 显示语音识别
        emitShowSpeechRecognition() {
            if (this.slidStatus.leftScale || this.slidStatus.rightScale) {
                this.splitScreen();
            }
            this.leftRouterName = 'SpeechRecognition';
            this.rightRouterName = 'TrialRecordModal';
        },

        /** *****************笔录相关start**********************/
        // 打点链接跳转
        emitDotLinkTo(timeStamp) {
            console.log('emitDotLinkTo的timeStamp', timeStamp);
            this.dotTimestamp = timeStamp;
        },
        // 法官发送笔录签名
        signature() {
            this.handleSignStatus('1'); // 更改签名状态
            this.emitTrialStatus('5');  // 更改庭审状态
            this.openRightBottomTip('发送签名成功');
        },
        // 签名状态更新
        handleSignStatus(value) {
            this.signStatus = value;
        },
        // 右下角弹窗
        openRightBottomTip(msg) {
            this.tipMsg = msg;
            this.showAlertBoxInRightBottom = true;
            setTimeout(() => {
                this.showAlertBoxInRightBottom = false;
            }, 3000);
        },
        /** *****************笔录相关end**********************/

        /** *************************消息通信start***************************/
        async initSocketJS() {
            let _this = this;
            if (stompClient && stompClient.connected) {
                await this.socketJSSubscribeMsg(stompClient);
            }
            else {
                try {
                    let res = await connectSocket(this.tokenGet);
                    console.log('trialCheck---index---stompClient--resolve', res);
                    if (res && res.connected) {
                        await _this.socketJSSubscribeMsg(stompClient);
                    }
                    else {
                        setTimeout(() => {
                            _this.initSocketJS();
                        }, 500);
                    }
                } catch (res) {
                    console.log('trialCheck---index---stompClient---reject', res);
                    // this.$message.error('正在重连,请稍后!');
                    setTimeout(() => {
                        _this.initSocketJS();
                    }, 500);
                }
            }
        },
        socketJSSubscribeMsg(stompClient) {
            let _this = this;
            startSubscribeFn(
                `/noteSign/${_this.trialId}/message`,
                function(params) {
                    let data = JSON.parse(params.body);
                    _this.signPicPath = data.imgUrl;
                },
                { id: 'a', token: _this.tokenGet },
                stompClient
            );

            console.log('订阅完成', stompClient);
        },
        socketJSCancelSubscribe(stompClient) {
            if (!stompClient || !stompClient.connected) {
                return false;
            }
            cancelSubscribeFn('a', stompClient);
            disconnectSocket(stompClient);
        }

        /** *************************消息通信end***************************/
    }
};
</script>

<style scoped lang="less" type="text/less">
.basic-layout {
    font-size: @font20px;
    width: 2560px;
    height: 100%;
    background: url('./../../assets/images/bg.png') no-repeat top center;
    background-size: 100% 100%;
    .wps-box{
        position: fixed;
        top:120px;
        bottom: 40px;
        right:260px;
        background: none;
        z-index: 1999;
        width: 850px;

        
    }
    .content {
        padding: 0 40px 40px;
        height: calc(100% - @trial_top_menu_h);
        display: flex;
        position: relative;
        .left {
            padding: 0 20px;
            // flex: 0 0 400px;
            width: 400px;
            background-color: @bg_box;
        }
        .middle {
            flex: 0 0 930px;
            width: 930px;
            margin-left: 40px;
            background-color: @bg_box;
        }
        .right {
            flex: 0 0 850px;
            width: 850px;
            margin-left: 40px;
            background-color: @bg_box;
        }
        .controlBox {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        .opt-btns {
            flex: 0 0 180px;
            width: 180px;
            margin-left: 40px;
            button {
                width: 180px;
                height: 130px;
                border-radius: 5px;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: @font28px;
                justify-content: center;
                background-color: @bg_box;
                color: @color_primary;
                border: 1px solid transparent;
                &.active {
                    background-color: @color_primary;
                    color: @bg_box;
                }

                img {
                    width: 60px;
                    height: 60px;
                }
                &:not(:first-child) {
                    margin-top: 15px;
                }
            }
            .trial-control-btns {
                top: 0;
                left: -130px;
            }
        }
    }
    .alert-box-right-bottom {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 350px;
        height: 200px;
        background-color: #fff;
        z-index: 2000;
        .tip-body {
            height: 100%;
        }
    }
}
</style>
