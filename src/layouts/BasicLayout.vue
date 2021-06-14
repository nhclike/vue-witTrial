/* 主框架---审判长庭审页面
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:23:13
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-13 11:38:35
 */

<template>
    <div class="basic-layout full-height">
        <!-- 庭审头部 -->
        <trial-header
        v-if="showHeader"
        @showAlertBoxVoiceBroadcast="showAlertBoxVoiceBroadcast=true"
        @showAlertBoxTrialDevice="showAlertBoxTrialDevice=true"
        @showAlertBoxOpenCourt="showAlertBoxOpenCourt=true"
        @changeCrossExamination="changeCrossExamination"
        @changeSignInStatus="changeSignInStatus"
        @showAlertBoxAddRecord="showAlertBoxAddRecord=true"
        :provControl="provControl"
        :signInControl="signInControl"
        :randomNum="randomNum"
        :caseName="caseName"
        :trialStatus="trialStatus"
        :remoteVideo="remoteVideo"
        @emitTrialStatus="emitTrialStatus"
        @emitChangeYGSwitch="emitChangeYGSwitch"
        @emitChangeBGSwitch="emitChangeBGSwitch"
        :defendantViewStatus="defendantViewStatus"
        :plaintiffViewStatus="plaintiffViewStatus"
        @sendAlarm="sendMsgToPolice"
        :caseCodes="caseCodes"
        @emitCaseCode="(val)=>{caseName=val;}"
        ></trial-header>
        <div class="content" v-if="showContent">
            <!-- 电子卷宗和影音证据 -->
            <div class="left" ref="leftTreeBox">
                <div class="left-btn-opt-box" >
                    <img v-show="leftBtnShowStatus&&!isShowWPS" @click="leftBtnHide" src="@/assets/images/icon/icon-showBtn.png" alt="">
                </div>
                <tree-tab
                @changeRightRouter="linkToFileUpload"
                @emitNodeSelect="treeNodeSelect"
                :treeAction="treeAction"
                :selectedKeys="selectedKeys"
                :ahdm="ahdm"
                ></tree-tab>
            </div>
            <!-- 路由匹配到的组件将显示在这里(主要是材料查看) -->
            <div class="middle full-height pos-r" ref="leftBox">
                <router-view
                    ref="leftRouter"
                    v-if="!slidStatus.rightScale"
                    :name="leftRouterName"
                    :crossExaminationStatus="crossExaminationStatus"
                    :fileId="fileId"
                    :fileAction="fileAction"
                    :fileNodeInfo="fileNodeInfo"
                    :typeCode="typeCode"
                    :filePlayUrl="filePlayUrl"
                    :pdfFileUrl="pdfFileUrl"
                    :ntkoFilePath="excelFileUrl"
                    @emitDotLinkTo="emitDotLinkTo"
                    @emitProveShareClick="emitProveShareClick"
                    @emitClickCheck="emitClickCheck"
                    @emitShowLoadingIframe="showIframeLoading"
                    @emitHideLoadingIframe="hideIframeLoading"
                    @emitCancelFileChange="emitCancelFileChange"
                    :trialStatus="trialStatus"
                    :DotListAction="DotListAction"
                    :addTextStr="addTextStr"
                ></router-view>

                <div class="controlBox">
                    <img v-show="!slidStatus.leftScale&&!isShowWPS" @click="leftBigger" src="@/assets/images/icon/icon-bigger.png" alt="">
                    <img v-show="slidStatus.leftScale" @click="splitScreen" src="@/assets/images/icon/icon-smaller.png" alt="">
                </div>
                <div class="pos-a btnLeftControlBox">
                    <img v-show="!leftBtnShowStatus" @click="leftBtnShow" src="@/assets/images/icon/icon-hideBtn.png" alt="">
                </div>
            </div>
            <!-- 路由匹配到的组件将显示在这里 -->
            <div class="right full-height pos-r" ref="rightBox" >
                 <router-view
                    ref="rightRouter"
                    v-if="!slidStatus.leftScale&&isShowRightRouter&&!isShowWPS"
                    :name="rightRouterName"
                    :signPicPath="signPicPath"
                    :dotTimestamp="dotTimestamp"
                    :ntkoFilePath="noteUrl"
                    :sendNoteCirculation="sendNoteCirculation"
                    :signStatus="signStatus"
                    :signFlag="signFlag"
                    @emitSignStatus="handleSignStatus"
                    @noteCirculation="noteCirculation"
                    @signature="signature"
                    @emitShowDotList="emitShowDotList"
                    @emitShowSpeechRecognition="emitShowSpeechRecognition"
                    @emitShowLoadingIframe="showIframeLoading"
                    @emitHideLoadingIframe="hideIframeLoading"
                    @emitUpdateProofTree="updataProofTree"
                    @emitSendMsg="emitSendMsg"
                    @emitTrialDotSuccess="emitTrialDotSuccess"
                    :acceptMsg="acceptMsg"
                    :trialStatus="trialStatus"
                    :caseCode="caseName"
                    :caseCodes="caseCodes"
                    @emitPolice="togglePoliceAssistant"
                    :acceptAddress="acceptAddress"
                    @emitAcceptAddress="emitAcceptAddress"
                    @emitLiveAdderss="emitLiveAdderss"
                ></router-view>
               
                
                <div class="controlBox">
                    <img v-show="!slidStatus.rightScale&&!isShowWPS" @click="rightBigger" src="@/assets/images/icon/icon-bigger.png" alt="">
                    <img v-show="slidStatus.rightScale" @click="splitScreen" src="@/assets/images/icon/icon-smaller.png" alt="">
                </div>
                 <div class="pos-a btnRightControlBox">
                    <img v-show="!rightBtnShowStatus" @click="rightBtnShow" src="@/assets/images/icon/icon-showBtn.png" alt="">
                </div>
            </div>
            <!--360不显示-->
            <!-- <div class="wps-box full-height full-width pos-a"  style="z-index:9000;width:8rem;height:4rem">
                <wps>
                    
                </wps>
            </div> -->
            <!-- 右侧操作项 -->
            <div class="opt-btns pos-r" v-if="optBtns.length>0" ref="rightBtnBox">
                <div class="btn-opt-box" v-if="!isShowWPS">
                    <img v-show="rightBtnShowStatus" @click="rightBtnHide" src="@/assets/images/icon/icon-hideBtn.png" alt="">
                    <span>隐藏菜单</span>
                </div>
                <div ref="btnWrapper" class="btn-wrapper">
                    <button
                        v-for="(btn,index) in optBtns"
                        :key="index"
                        @click="click(btn.func,btn,index)"
                        v-show="btn.isShow"
                        :class="[activeIndex==index?'active':'']">
                        <img :src="`/images/trial/${btn.icon}.png`" alt="">
                        <!-- <img src="/images/trial/caseInfo.png" alt=""> -->
                        {{btn.name}}
                    </button>
                </div>
            </div>
        </div>
         <!-- 当事人控制框 -->
        <div class="allowReadBox" v-if="isAllowRead">
            <div class="vertical-horizontal-center allowWrapper">
                <div class="text-center">
                    <img src="@/assets/images/logo_login.png" alt="">
                    <h1>录音录像与在线庭审告知</h1>
                    <p>
                        本次开庭全程录音录像，录音录像皆为庭审记录。本次开庭采用在线庭审，在线庭审活动与线下开庭活动具有同等法律效力，诉讼参与人未经审判人员允许，不得随意退出在线庭审，不得出现违反法律规定，法庭纪律和其他破坏法庭秩序，违反社会公序良俗的行为，与案件无关人员不得发言，不得进入在线庭审的录像区域。
                    </p>
                </div>
            </div>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>

        </div>
        <div class="wps-box"  v-if="isShowWPS">
            <div class="full-width full-height">
                <TrialRecordModal
                    @emitShowDotList="emitShowDotList"
                    @emitShowSpeechRecognition="emitShowSpeechRecognition"
                    @noteCirculation="noteCirculation"
                    @emitTrialDotSuccess="emitTrialDotSuccess"
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
        <!-- 弹窗-开庭-->
        <div class="alert-box" v-if="showAlertBoxOpenCourt">
            <open-court
                :operateBtnName="operateBtnName"
                :remoteVideo="remoteVideo"
                @emitClose="showAlertBoxOpenCourt=false"
                @emitTrialStatus="emitTrialStatus"
            ></open-court>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
        <!-- 弹窗-增录-->
        <div class="alert-box" v-if="showAlertBoxAddRecord">
            <add-record
                :operateBtnName="operateBtnName"
                @emitClose="showAlertBoxAddRecord=false"
            ></add-record>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>

        </div>
        <!-- 弹窗-语音播报-->
        <div class="alert-box" v-if="showAlertBoxVoiceBroadcast">
            <voice-broadcast
                :operateBtnName="operateBtnName"
                @emitClose="showAlertBoxVoiceBroadcast=false"
            ></voice-broadcast>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
         <!-- 弹窗-消息聊天-->
        <div class="alert-box" v-if="showMessageModal">
            <message-modal
                :acceptMsg="acceptMsg"
                @emitClose="showMessageModal=false;activeIndex=-1;unreadMsg=false"
                @emitSendMsg="emitSendMsg"

            ></message-modal>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
        <!-- shjTodo-弹窗-远程设备-->
        <div class="alert-box" v-if="showAlertBoxTrialDevice">
            <trial-device
                @emitClose="showAlertBoxTrialDevice=false"
                :trialStatus="trialStatus"
            ></trial-device>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
        <!-- 弹窗-打点列表-->
        <!-- <div class="alert-box" v-if="showAlertBoxDotList">
            <dot-list @emitClose="emitCloseDotList" v-if="showAlertBoxDotList"></dot-list>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>

        </div> -->

        <!-- 弹窗-页面右下角提示框-->
        <div class="alert-box-right-bottom" v-if="showAlertBoxInRightBottom">
            <right-bottom-tip
                :tipMsg="tipMsg"
                @emitClose="showAlertBoxInRightBottom=false"
            ></right-bottom-tip>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
        <!-- 弹窗-质证分享选择人-->
        <div class="alert-box" v-if="showAlertBoxChooseMember" style="z-index:2010">
            <choose-member
                @emitClose="showAlertBoxChooseMember=false"
                @emitChooseMemberList="emitChooseMemberList"
            ></choose-member>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>

        </div>
        <!-- 弹窗-质证分享查看 -->
        <div class="alert-box" v-if="proveDialogVisible" style="z-index:2001" >
            <div class="alert-box-body">
                <div class="header-title">
                    <span>{{proveSendName}}质证</span>
                </div>

                <viewer
                :images="viewerImages"
                :options="viewerOptions"
                 @inited="inited"
                 class="viewer"
                    ref="viewer">
                    <template slot-scope="scope">
                        <img style="width:7rem;height:8.5rem" v-for="src in scope.images" :src="src" :key="src">
                    </template>
                </viewer>
                <!-- <img style="width:8rem;height:11rem" :src="viewerImages[0]" :key="viewerImages[0]" /> -->

                <div class="footer-btns" v-if="isShowOperateAuth">
                    <button class="shj-btn--danger" @click="closeProve()" v-show="proveOperateBtnShow.isShowCloseProve">结束</button>
                    <button class="shj-btn--primary" @click="rejectProve()" v-show="proveOperateBtnShow.isShowRejectProve">拒绝</button>
                    <button class="shj-btn--primary" @click="passProve()" v-show="proveOperateBtnShow.isShowPassProve">传阅</button>
                </div>
            </div>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
         <!-- 弹窗-图片点击查看 -->
        <div>
             <viewer
                :images="clickViewerImages"
                :options="viewerOptions"
                 @inited="inited"
                 class="viewer"
                    ref="viewer">
                    <template slot-scope="scope">
                        <img style="width:1px;height:1px" v-for="src in scope.images" :src="src" :key="src">
                    </template>
                </viewer>
               
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
        <!-- 弹窗-警务助手-->
        <div class="alert-box" v-if="showAlertBoxPolice">
            <police-assistant
                @emitClose="showAlertBoxPolice=false"
                @sendMsgToPolice="sendMsgToPolice"
            >
            </police-assistant>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
        <!-- 小鱼视频框唤醒 -->
        <div id="xyVideoBox">
            <iframe id="xyIframe" src="about:blank" width="1px" height="1px" style="display: none;"></iframe>
        </div>
        <!-- 带iframe的加载框 -->
        <loading-iframe :isLoadingShow="isLoadingShow"></loading-iframe>
        <!-- 带iframe的初始加载框 -->
        <loading-iframe :isLoadingShow="isInitLoadingShow" :loading="initLoading"></loading-iframe>
    </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex';
import TrialRecordModal from '@/views/home/TrialRecordModal';

import wps from '@/views/plugins/Wps';
import TrialHeader from '@/components/header/TrialHeader';
import OpenCourt from '@/views/home/OpenCourt';
import AddRecord from '@/views/home/AddRecord';
import ChooseMember from '@/views/home/ChooseMember';
import VoiceBroadcast from '@/views/home/VoiceBroadcast';
import TrialDevice from '@/views/home/TrialDevice';
import RecordPlay from '@/views/home/RecordPlay';
import TreeTab from '@/views/home/TreeTab';
import PoliceAssistant from '@/views/home/PoliceAssistant';
import LoadingIframe from '@/components/common/LoadingIframe';
import {stompClient, disconnectSocket, connectSocket,  startSubscribeFn, sendMsgFn,  cancelSubscribeFn} from '@/utils/SocketJS';
import RightBottomTip from '@/views/home/RightBottomTip';
import {requestFullScreen, IsF11Fullscreen} from '@/utils/utils';
import '@/assets/style/viewer.css';
import Viewer from 'v-viewer/src/component.vue';
import {iflyteInit} from '@/utils/iflytekCourt';
import MessageModal from '../views/home/MessageModal.vue';

export default {
    name: 'BasicLayout',
    components: {
        wps,
        TrialHeader,
        TrialRecordModal,
        OpenCourt,
        AddRecord,
        ChooseMember,
        VoiceBroadcast,
        TrialDevice,
        RecordPlay,
        TreeTab,
        RightBottomTip,
        // DotList,
        LoadingIframe,
        Viewer,
        PoliceAssistant,
        MessageModal
    },
    inject: ['reload', 'userInfo', 'systemConfig'],
    data() {
        return {
            showHeader: false, // 显示头部,因为头部和庭审状态相关,获取到庭审状态后渲染
            showContent: false, // 显示主内容
            pdfFileUrl: '', // 使用pdf插件打开的文件地址
            initLoading: {// 初始页面加载显示框
                text: '正在与审判长建立连接'
            },
            addTextStr: '', // 语音识别增加的文本
            isInitLoadingShow: false, // 初始页面加载显示是否显示控制
            isShowRightRouter: true, // 控制右侧路由刷新
            ahdm: '', // 案件信息中的ahdm---查询电子卷宗使用
            treeAction: '', // 左侧树的操作
            selectedKeys: [], // 左侧树的选中的树节点
            dotTimestamp: '', // 打点时间戳
            clickViewerImages:[],//材料点击预览查看图片数据
            viewerImages: [], // 质证分享图片数据()
            viewerOptions: {  // 放大查看插件的配置项
                'button':false,
                'navbar':false,
                'title':false,
                'keyboard':false,
                'fullscreen':false
            },
            slidStatus: { // 分屏控制状态
                leftScale: true,
                rightScale: false
            },
            leftBtnShowStatus:true, //左侧按钮显示状态
            rightBtnShowStatus: true, // 右侧按钮显示状态:默认显示
            noteUrl: '', // 笔录地址
            DotListAction: '', // 打点列表操作,用于打点成功后通知打点列表操作
            acceptMsg: {}, // 即时通信接收到的消息
            unreadMsg: false, // 即时通信 是否有未读消息
            filePlayUrl: null, // 视频播放参数
            audioUrl: '', // 音频播放地址
            excelFileUrl: '', // excel文件地址
            defendantViewStatus: false, // 允许被告阅卷
            plaintiffViewStatus: false, // 允许原告阅卷
            isAllowRead: false, // 允许阅卷控制面板显示
            isLoadingShow: false, // 显示loading
            trialStatus: '0', // 庭审状态 '0'-待庭审 '1'-庭审中 '2'-休庭中 '3'-待校对 '4'-已结束
            remoteVideo: '0', // '0'-非远程庭审 '1'-远程庭审
            operateBtnName: 'view', // 父传子>表单当前操作模式-add|edit|view
            showAlertBoxOpenCourt: false, // 是否显示-弹窗-开庭
            showAlertBoxAddRecord: false, // 是否显示-弹窗-增录
            showAlertBoxVoiceBroadcast: false, // 是否显示-弹窗-语音播报
            showAlertBoxTrialDevice: false, // 是否显示-弹窗-远程设备
            showAlertBoxInRightBottom: false, // 是否显示-弹窗-右下角弹窗
            // showAlertBoxDotList: false, // 是否显示打点列表
            showMessageModal:false,//是否打开消息聊天框
            showAlertBoxChooseMember: false, // 是否显示 质证 或 笔录传阅 选人弹框
            chooseMemberType: null, // 选人弹框类型 0-质证 1-笔录传阅
            showAlertBoxPolice: false, // 是否显示-弹窗-警务助手
            crossExaminationStatus: false, // true:允许质证---决定topicReader中质证分享是否显示
            leftRouterName: 'TopicReader',
            rightRouterName: 'CaseInfo',
            activeIndex: 0, // 当前选中的btn--右侧功能项切换
            curChooseMember: [], // 审判长选择的分享的人员
            curProveShareInfo: null, // 当前质证分享信息---点击质证分享获取的质证信息进行存储
            curProveShareBase64: '', // 存储当前质证分享的base64图片
            curProveShareOperateType: '', // 当前质证分享操作---区分传阅和分享操作
            proveDialogVisible: false, // 质证分享图片弹框显示
            proveOperateBtnShow: { // 法官端质证图片操作项按钮显示
                isShowCloseProve: true,
                isShowPassProve: false,
                isShowRejectProve: false
            },
            provControl: {  // 法官端头部质证状态按钮控制
                // status: false,
                // name: '允许质证',
                // icon: 'startExamination',
                // class: ''
            },
            signInControl: {  // 法官端头部质证状态按钮控制
                // status: false,
                // name: '开始签到',
                // icon: 'startSignIn',
                // class: ''
            },
            randomNum: '', // 案件随机码
            caseName: '', // 案件名称
            caseCodes: [], // 并案案号列表
            currentUser: {}, // 当前用户信息
            tipMsg: '', // 右下角弹窗消息内容
            trialId: '', // 庭审id
            signPicPath: '', // 签名图片地址
            signStatus: '',  // 签名状态
            signFlag: '', // 当时人签到标识
            sendNoteCirculation: false, // 笔录是否全屏,
            optBtns: [], // 右侧操作按钮
            fileId: '', // 材料id
            fileAction: '', // 材料的动作监听
            fileNodeInfo: {}, // 材料节点信息
            typeCode: null, // 1-电子卷宗 2-影音证据
            oldTypeCode: null,
            isShowWPS:false,//是否显示wps
            acceptAddress: null,// 庭审画面接收到的消息
            iflyteClientPath :'', //讯飞程序客户端地址
            iflyteServerUrl:'' //讯飞websocket服务地址
        };
    },
    computed: {
        ...mapGetters({
            proveInfoGet: 'moduleJudge/proveInfoGet',
            tokenGet: 'tokenGet',
            loginGet: 'loginGet',
            roleGet: 'roleGet',
            trialPermsListGet: 'trialPermsListGet'
        }),
        // 是否显示质证弹框的操作按钮---结束质证,传阅,拒绝
        isShowOperateAuth() {
            return this.comm.isTrialAuthorizeShow('trial:judgeProveShare');
        },
        proveSendName() {
            return this.proveInfoGet.sender ? this.proveInfoGet.sender : '';
        }

    },
    watch: {
        // 监听质证信息(每次变化说明进行了质证分享操作---将质证图片保存成地址)
        proveInfoGet(newVal, oldVal) {
            console.log('监听质证信息变化', newVal, oldVal);
            let _this = this;
            _this.showProveShare(newVal.picUrl);

        },
        trialPermsListGet: {// 监听到权限值的更新初始化操作和页面显示---与权限相关的初始化必须在此操作否则会出现偶现bug
            handler(newVal, oldVal) {
                console.log('trialPermsListGet', newVal, oldVal);
            },
            deep: true,
            immediate: true
        },
        trialStatus: {// 监听庭审状态,根据庭审状态改打点列表播放页面
            handler(newVal) {
                let _this = this;
                this.$nextTick(() => {
                    // shjTodo-如果是远程庭审，庭审中时拉起xy客户端？
                    // checkXyClient-pullClient
                    if (_this.trialStatus == 0 || _this.trialStatus == 1) { // 庭审前和庭审中打点列表页面播放直播视频
                        if (_this.leftRouterName == 'DotRecordPlay') {
                            // debugger;
                            _this.leftRouterName = 'RecordPlay';
                        }
                    }
                    else {
                        if (_this.leftRouterName == 'RecordPlay') {
                            // debugger;
                            _this.leftRouterName = 'DotRecordPlay';
                        }
                    }
                });

            },
            deep: true,
            immediate: true
        }
    },
    created() {
        console.log('BasicLayout created');
    },
    async mounted() {

        console.log('BasicLayout mounted', stompClient);
        console.log('BasicLayout---loginGet', this.loginGet);
        if (this.loginGet != 1) {
            console.log('进入庭审页面未登录!---路由重定向', this.tokenGet);
            this.roleToLink();

        }
        if (this.tokenGet) {
            let res = await this.tokenVerify(this.tokenGet);
            if (res.code != 0) {
                console.log('进入庭审页面token已经失效!');
                this.roleToLink();
            }
        }

        // console.log('systemConfig', this.systemConfig());
        this.currentUser = this.userInfo();
        this.trialId = this.$route.query.trialId;
        if (this.$store.getters.roleGet == 'judge') {
            this.initLoading = {
                text: '正在初始化页面,请稍候!'
            };
        }
        this.isInitLoadingShow = true;

        await this.initSocketJS();
        console.log('BasicLayout mounted----await', stompClient);
        // 处理消息连接出错后重定向回partyTrial但是不触发mounted导致可以退出全屏的异常情况
        // 重新建立连接后根据全屏状态再次确定是否全屏.
        let isFull = IsF11Fullscreen();
        console.log('BasicLayout---isFull' + isFull);
        if (!isFull) {
            // debugger;
            try {
                // this.$message.success("BasicLayout---mounted全屏!");
                requestFullScreen();
            } catch (error) {
                console.log(error);
            }
        }


        // 刷新走beforeunload
        window.addEventListener('beforeunload', this.handleBeforeUnload, false);

    },
    beforeDestroy() {
        console.log("beforeDestroy");
        this.handleBeforeUnload();
        window.removeEventListener('beforeunload', this.handleBeforeUnload, false);
    },
    beforeRouteLeave (to, from, next) {
       if(this.isShowWPS){
            this.$refs.TrialRecordModal.$refs.ntko.handleBeforeUnload();
        }
        setTimeout(()=>{
             next()
        },500)
    },
    methods: {
        ...mapMutations(
            {
                trialPermsListMut: 'trialPermsListMut',
                proveInfoMut: 'moduleJudge/proveInfoMut',
                recordIdMut: 'moduleJudge/recordIdMut'
            }
        ),
        ...mapActions({
            proveVerify: 'moduleJudge/proveVerify',
            queryTrialById: 'moduleJudge/queryTrialById',
            dossierViewVerify: 'moduleJudge/dossierViewVerify',
            getTrialRolePerm: 'moduleJudge/getTrialRolePerm',
            saveProvePhotoToURL: 'moduleJudge/saveProvePhotoToURL',
            viewProvingPic: 'moduleJudge/viewProvingPic',
            getNoteCirculationStatus: 'moduleJudge/getNoteCirculationStatus',
            tokenVerify: 'moduleLogin/tokenVerify'
        }),
        handleBeforeUnload() {
            // debugger;
            
            console.log('basicLayout handleBeforeUnload', stompClient);
            this.$off('noteCirculation');
            this.$off('signature');
            try {
                this.socketJSCancelSubscribe(stompClient);
            } catch (error) {
                console.log(error);
            }
            

            this.trialPermsListMut([]);
        },
        inited(viewer) {
            this.$viewer = viewer;
        },
        // 进入庭审页面验证token
        async roleToLink() {

            if (this.roleGet == 'party') {
                this.$router.push('/partyTrial');
            } else {
                this.$router.push('/login/judgeEntry');
            }
        },
        /** *****************分屏处理start**********************/
        splitScreen() {
            this.$refs.rightBox.style.display = 'block';
            this.$refs.leftBox.style.display = 'block';
            let lrem = '9.3rem';
            this.$refs.leftBox.style.width = `${lrem}`;
            this.$refs.leftBox.style.flex = `0 0 ${lrem}`;
            this.slidStatus = {
                leftScale: false,
                rightScale: false
            };
        },
        leftBigger() {
            this.$refs.leftBox.style.display = 'block';
            this.$refs.leftBox.style.flex = 1;
            this.$refs.rightBox.style.display = 'none';
            this.slidStatus = {
                leftScale: true,
                rightScale: false
            };
        },
        rightBigger() {
            this.$refs.rightBox.style.display = 'block';
            this.$refs.rightBox.style.flex = 1;
            this.$refs.leftBox.style.display = 'none';
            this.slidStatus = {
                leftScale: false,
                rightScale: true
            };


        },
        leftBtnHide(){
            this.$refs.leftTreeBox.style.display='none';
            this.$refs.leftBox.style.flex = 1;
            this.leftBtnShowStatus=false;
          

        },
        leftBtnShow(){
            this.$refs.leftTreeBox.style.display='block';
            let trem='4rem';
            this.$refs.leftTreeBox.style.width=`${trem}`;
            this.$refs.leftTreeBox.style.flex=`0 0 ${trem}`;
            this.leftBtnShowStatus=true;

            if(this.$refs.leftBox.style.flex===1){ 
                return false
            }
            else{
                this.splitScreen();
            }
        },
        // 右侧操作按钮隐藏
        rightBtnHide() {
            this.$refs.rightBtnBox.style.display = 'none';
            this.$refs.rightBox.style.flex = 1;
            this.rightBtnShowStatus = false;
            // 隐藏菜单刷新庭审画面重置播放器
            if (this.rightRouterName == 'TrialScene') {
                this.isShowRightRouter = false;
                this.$nextTick(() => {
                    this.isShowRightRouter = true;
                });
            }

        },
        // 右侧操作按钮显示
        rightBtnShow() {
            this.$refs.rightBtnBox.style.display = 'block';

            let brem = this.comm.px2rem(180);

            let rrem = this.comm.px2rem(850);
            this.$refs.rightBox.style.flex = `0 0 ${rrem}`;
            this.$refs.rightBtnBox.style.flex = `0 0 ${brem}`;

            this.rightBtnShowStatus = true;
            // 隐藏菜单刷新庭审画面重置播放器

            if (this.rightRouterName == 'TrialScene') {
                this.isShowRightRouter = false;
                this.$nextTick(() => {
                    this.isShowRightRouter = true;
                });
            }

        },
        /** *****************分屏处理end**********************/

        /** *****************消息通信start**********************/
        // 初始化消息连接
        async initSocketJS() {
            console.log('BasicLayout---stompClient--initSocketJS', stompClient);
            let _this = this;
            // 已经连接则直接订阅;在party页面已经连接过.书记员则会自己建立连接
            if (stompClient && stompClient.connected) {
                await _this.socketJSSubscribeMsg(stompClient);

            }
            else {
                try {
                    let res = await connectSocket(this.tokenGet);
                    console.log('BasicLayout---stompClient--resolve', res);
                    if (res && res.connected) {
                        await _this.socketJSSubscribeMsg(stompClient);
                    }
                    else {
                        setTimeout(() => {
                            _this.initSocketJS();
                        }, 500);
                    }
                } catch (res) {
                    console.log('BasicLayout---stompClient-reject', res);
                    // this.$message.error('通信连接失败,请重新登录!');
                    setTimeout(() => {
                        _this.initSocketJS();
                    }, 500);
                }
            }

        },
        // 消息订阅
        socketJSSubscribeMsg(stompClient) {
            let _this = this;

            // 订阅法官质证分享
            startSubscribeFn(`/judgeProve/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                console.log('订阅法官质证分享---打开质证分享的图片', params);
                let data = JSON.parse(params.body);
                // _this.openNotification('消息提示', '订阅法官质证分享');
                // 更新质证消息,监听到质证消息改变会显示质证分享弹框
                _this.proveInfoMut(data);
            }, {id: 1, token: _this.tokenGet}, stompClient);

            // 订阅法官开始/结束质证
            startSubscribeFn(`/proveStatus/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                console.log('订阅法官开始/结束质证');
                // _this.openNotification('消息提示', '法官结束质证', params);
                let data = JSON.parse(params.body);
                if (data.proveStatus == 'end') {
                    _this.closeProveShare();
                }
            }, {id: 2, token: _this.tokenGet}, stompClient);

            // 订阅法官允许质证/禁止质证
            startSubscribeFn(`/proveControl/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {

                // 接收到法官允许质证的消息后,改变质证状态为允许质证,使得当事人显示分享质证按钮
                let data = JSON.parse(params.body);
                if (data.proveControl == 'forbid') {
                    _this.crossExaminationStatus = false;
                    console.log('订阅法官禁止质证');
                    _this.openNotification('消息提示', '法官禁止质证');
                }
                else {
                    _this.crossExaminationStatus = true;
                    console.log('订阅法官允许质证');
                    _this.openNotification('消息提示', '法官允许质证');

                }

            }, {id: 3, token: _this.tokenGet}, stompClient);

            // 订阅法官拒接当事人质证
            startSubscribeFn(`/judgeRefuseProve/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                console.log('法官拒接当事人质证');
                _this.closeProveShare();

                _this.openNotification('消息提示', '法官拒绝了您的质证');

            }, {id: 4, token: _this.tokenGet}, stompClient);

            // 订阅当事人质证
            startSubscribeFn(`/casePeopleProve/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                // _this.openNotification('消息提示', '当事人质证发来质证');
                _this.proveOperateBtnShow = {
                    isShowCloseProve: false,
                    isShowPassProve: true,
                    isShowRejectProve: true
                };
                let data = JSON.parse(params.body);
                console.log('当事人质证发来质证', data);
                // 更新当前质证消息
                _this.curProveShareInfo = data;
                // 更新质证消息,监听到质证消息改变会显示质证分享弹框
                _this.proveInfoMut(_this.curProveShareInfo);


            }, {id: 5, token: _this.tokenGet}, stompClient);

            // 法官订阅 签名
            startSubscribeFn(`/noteSign/${_this.trialId}/message`,
                function(params) {
                    if (_this.comm.isTrialAuthorizeShow('trial:record:signature')) {
                        let data = JSON.parse(params.body);
                        console.log('签名成功', data);
                        _this.signPicPath = data.imgUrl;
                    }

                }, {id: 6, token: _this.tokenGet}, stompClient);

            // 订阅法官允许阅卷
            startSubscribeFn(`/dossierView/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅法官允许阅卷', data);
                if (data.optType == 1) {
                    _this.isAllowRead = false;
                    _this.$CusConfirm({
                        title: '法官已开启阅卷，请自行查看左侧电子卷宗目录里的内容',
                        autoClose:true,
                        cancel: () => {
                            // console.log('点取消调用');
                        },
                        ok: () => {
                            // console.log('点确定调用');
                            
                        }
                    })
                    //_this.openNotification('消息提示', '法官允许阅卷');
                }
                else {
                    _this.isAllowRead = true;

                    //_this.openNotification('消息提示', '法官禁止阅卷');
                }
                // _this.isAllowRead = data.optType == 1 ? false : true;
            }, {id: 7, token: _this.tokenGet}, stompClient);

            // 订阅消息通信中的消息
            startSubscribeFn(`/im/${_this.trialId}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅消息通信中的消息', data);
                _this.acceptMsg = data;
                // 没有未读消息 且 不在即时通讯页面
                if (!_this.unreadMsg && _this.rightRouterName !== 'Message') {
                    const index = _this.optBtns.findIndex((btn) => { return btn.rightRouterName === 'Message' });
                    _this.$refs.btnWrapper.childNodes[index].classList.add('new-msg');
                    _this.unreadMsg = true;
                }
            }, {id: 8, token: _this.tokenGet}, stompClient);

            // 订阅庭审状态改变的消息
            startSubscribeFn(`/trialStatus/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅庭审状态改变的消息', data);
                _this.trialStatus = data.trialStatus;

            }, {id: 9, token: _this.tokenGet}, stompClient);

            // 订阅庭审画面视频地址改变的消息
            startSubscribeFn(`/sendLiveAddress/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅庭审画面视频地址改变的消息', data);
                _this.acceptAddress = data.liveAddress;

            }, {id: 10, token: _this.tokenGet}, stompClient);

            startSubscribeFn(`/signInStatus/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅当事人签到', data);
                if (data.optType == 2) {
                    _this.signFlag = String(new Date().getTime());
                }
            }, {id: 11, token: _this.tokenGet}, stompClient);
            // 订阅结束庭审的消息
            startSubscribeFn(`/endTrial/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅结束庭审的消息', data);
                try {
                    //_this.$refs.rightRouter.$refs.ntko.handleBeforeUnload();
                    this.$refs.TrialRecordModal.$refs.ntko.handleBeforeUnload();

                    
                } catch (error) {

                }
                _this.rightRouter = '';
                _this.$nextTick(() => {
                    _this.$router.push({
                        path: '/partyTrial'
                    });
                });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

                // _this.$message.success('审判长已关闭阅卷,即将关闭浏览器!');
                // setTimeout(() => {
                //     window.opener = null;
                //     window.open('', '_self');
                //     window.location.href = 'about:blank';
                //     window.close();
                // }, 2000);


            }, {id: 12, token: _this.tokenGet}, stompClient);
            // 订阅笔录传阅
            startSubscribeFn(`/noteView/${_this.trialId}/${this.currentUser.id}/message`, this.noteCirculationMsgHandle,
                {id: 13, token: _this.tokenGet}, stompClient);
            // 订阅语音识别
            startSubscribeFn(`/asr/${_this.trialId}/${this.currentUser.id}/message`,
                function(params) {
                    let data = JSON.parse(params.body);
                    console.log('订阅语音识别', data);
                    if (data.send) {
                        _this.addTextStr = data.message;
                        if (_this.leftRouterName === 'SpeechRecognition') {
                            _this.$refs.leftRouter.addResult();

                        }
                    }
                },
                {id: 14, token: _this.tokenGet}, stompClient);
            console.log('订阅完成', stompClient);
            // 只有订阅成功才更新权限显示---防止有时候在重新订阅的过程,消息发送缺失
            // 更新权限值
            _this.updataAuthorize();

        },
        // 取消消息订阅
        socketJSCancelSubscribe(stompClient) {
            if (!stompClient || !stompClient.connected) {
                return false;
            }
            cancelSubscribeFn(1, stompClient);
            cancelSubscribeFn(2, stompClient);
            cancelSubscribeFn(3, stompClient);
            cancelSubscribeFn(4, stompClient);
            cancelSubscribeFn(5, stompClient);
            cancelSubscribeFn(6, stompClient);
            cancelSubscribeFn(7, stompClient);
            cancelSubscribeFn(8, stompClient);
            cancelSubscribeFn(9, stompClient);
            cancelSubscribeFn(10, stompClient);
            cancelSubscribeFn(11, stompClient);
            cancelSubscribeFn(12, stompClient);
            cancelSubscribeFn(13, stompClient);
            cancelSubscribeFn(14, stompClient);
            //从庭审页面跳到签到页面会触发,此时若注销socket,签到消息在没刷新的情况下不会重新订阅,会导致结束签到消息接收失败
            //disconnectSocket(stompClient);
        },
        // 即时通信发送消息
        emitSendMsg(text) {
            let time = new Date().Format('yyyy-MM-dd hh:mm:ss');
            console.log('emitSendMsg', text, time);

            sendMsgFn({
                'msgType': 'im',
                'trialId': this.$route.query.trialId,
                'senderId': this.currentUser.id,
                'sender': this.currentUser.name,
                'sendTime': time,
                'content': text
            }, stompClient);
        },
        // 即时通信 新消息处理
        handleMsgDisplay(item) {
            if (this.unreadMsg) {
                const index = this.optBtns.findIndex((btn) => { return btn.rightRouterName === 'Message' });
                this.$refs.btnWrapper.childNodes[index].classList.remove('new-msg');
            }
             //this.changeRouter(item);
            this.showMessageModal=true;
            this.unreadMsg = false;
        },


        /** *****************消息通信end**********************/

        /** *****************通用事件处理start**********************/

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
        // 打开消息提示框
        openNotification(title, desc) {
            this.$notification.open({
                message: title,
                description: desc
            });
        },

        // 路由切换
        changeRouter(item) {
            let _this=this;
            // 切换菜单先分屏
            if (this.slidStatus.leftScale || this.slidStatus.rightScale) {
                this.splitScreen();
            }
            
            // 点击庭审笔录,隐藏菜单
            // 非庭审页面,保存笔录
            if (item.rightRouterName === 'TrialRecordModal') {
                //this.rightBtnHide();
            } else {
                try {
                    //this.$refs.rightRouter.$refs.ntko.handleBeforeUnload();
                    this.$refs.TrialRecordModal.$refs.ntko.handleBeforeUnload();
                } catch (error) {

                }finally{

                    setTimeout(()=>{
                        //关闭wps页面
                        if(_this.isShowWPS){
                            _this.isShowWPS=false;
                        }
                    },1000)
                     
                }
                
            }
           
            // 避免同一页面显示两个播放器
            if (item.rightRouterName === 'TrialScene' && ['DotRecordPlay', 'RecordPlay', 'VideoPlayerNB'].indexOf(this.leftRouterName) > -1) {
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
        // 改变右侧路由---左边切换成影音证据后右侧切换成文件上传
        changeRightRouter(url) {
            this.rightRouterName = url;
        },
        // 庭审状态
        emitTrialStatus(trialStatus) {
            this.trialStatus = trialStatus;
            //            debugger;
            sendMsgFn({
                'msgType': 'trialStatus',
                'trialId': this.$route.query.trialId,
                'userId': this.currentUser.id,
                'trialStatus': trialStatus
            }, stompClient);
        },
        /** *****************通用事件处理end**********************/

        /** *****************页面初始化操作start**********************/
        // 初始化
        async initPage() {
            // 1更新庭审信息
            // 2初始化阅卷状态
            // 3查看当前是否有未结束的质证
            await this.getTrialInfoAndHandle();
            await this.initDossierStatus();
            await this.queryViewProvingPic();


        },
        // 查看当前用户在庭审中正在质证的质证信息
        queryViewProvingPic() {
            this.viewProvingPic({trialId: this.$route.query.trialId}).then((res) => {
                console.log('queryViewProvingPic', res);
                if (res.data) {
                    let data = res.data;
                    this.curProveShareInfo = data;// 刷新后重新定义当前质证信息
                    this.proveInfoMut(data);// 显示当前质证信息
                    if (data.flowStatus == 1 && data.status == 2) {
                        this.proveOperateBtnShow = {
                            isShowCloseProve: false,
                            isShowPassProve: true,
                            isShowRejectProve: true
                        };
                    } else if (data.flowStatus == 2 && data.status == 3) {
                        this.proveOperateBtnShow = {
                            isShowCloseProve: true,
                            isShowPassProve: false,
                            isShowRejectProve: false
                        };
                    } else {
                        this.proveOperateBtnShow = {
                            isShowCloseProve: false,
                            isShowPassProve: false,
                            isShowRejectProve: false
                        };
                    }

                }
            });
        },
        // 初始化右侧操作工具
        initBtnAuthorize() {
            this.optBtns = [
                {
                    isShow: this.comm.isTrialAuthorizeShow('trial:caseInfo'),
                    icon: 'caseInfo',
                    name: '案件信息',
                    leftRouterName: '',
                    rightRouterName: 'CaseInfo',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: this.comm.isTrialAuthorizeShow('trial:memo'),
                    icon: 'memoBook',
                    name: '备忘录',
                    leftRouterName: '',
                    rightRouterName: 'MemoBook',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: this.comm.isTrialAuthorizeShow('trial:record'),
                    icon: 'TrialRecordModal',
                    name: '庭审笔录',
                    leftRouterName: '',
                    rightRouterName: 'TrialRecordModal',
                    url: '',
                    //func: 'changeRouter'
                    func: 'fnShowWPS'
                },
                {
                    isShow: this.comm.isTrialAuthorizeShow('trial:video'),
                    icon: 'trialScene',
                    name: '庭审画面',
                    leftRouterName: '',
                    rightRouterName: 'TrialScene',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: this.comm.isTrialAuthorizeShow('trial:helper'),
                    icon: 'policeAssistant',
                    name: '警务助手',
                    leftRouterName: '',
                    rightRouterName: 'PoliceHistory',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: this.comm.isTrialAuthorizeShow('trial:lawInfo'),
                    icon: 'legalInfo',
                    name: '法信平台',
                    leftRouterName: '',
                    rightRouterName: 'LawInfo',
                    url: '',
                    func: 'changeRouter'
                },
                {
                    isShow: this.comm.isTrialAuthorizeShow('trial:IM'),
                    icon: 'message',
                    name: '即时通讯',
                    leftRouterName: '',
                    rightRouterName: 'Message',
                    url: '',
                    func: 'handleMsgDisplay'
                }
            ];
            this.activeIndex = 0;
        },

        // 更新权限
        updataAuthorize() {
            console.log('updataAuthorize---更新权限值!');
            let _this = this;
            if (this.$route.query.trialId) {
                this.getTrialRolePerm({'trialId': this.$route.query.trialId}).then((res) => {
                    if (res.code == 0 && res.data) {
                        _this.trialPermsListMut(res.data.permsList);
                        _this.$nextTick(async () => {
                            console.log('初始化按钮');
                            await _this.initBtnAuthorize();
                            // 初始化 当事人页面 庭审笔录按钮显示
                            // if (window.location.href.indexOf('partyTrial') > -1) {
                            //     await _this.getCirculationStatus();
                            // }
                            await _this.initPage();
                        });
                    }
                });
            }
        },
        // 查询庭审信息并且处理
        // 1填充案件名称,随机码
        // 2初始化质证状态
        // 3初始化法官允许阅卷状态
        getTrialInfoAndHandle() {
            let _this = this;
            // 查询庭审信息
            this.queryTrialById({trialId: this.$route.query.trialId}).then((res) => {
                console.log('查询庭审信息', res);
                if (res.code != 0) {
                    return false;
                }
                let proveControlStatus = res.data.proveControl;
                let signInControlStatus = res.data.signStatus;
                _this.randomNum = res.data.randomCode;
                _this.caseName = res.data.caseCode;
                _this.caseCodes = res.data.caseCodes || [];
                _this.defendantViewStatus = res.data.defendantView == 1 ? true : false;
                _this.plaintiffViewStatus = res.data.plaintiffView == 1 ? true : false;
                // 获取庭审状态---头部按钮显示与庭审状态相关
                _this.trialStatus = res.data.trialStatus;

                _this.remoteVideo = res.data.remoteVideo;
                _this.signStatus = res.data.noteSignStatus;
                let recordId = res.data.nruSessionid;
                _this.ahdm = res.data.ahdm;
                _this.iflyteClientPath = res.data.iflyteClientPath;
                _this.iflyteServerUrl = res.data.iflyteServerUrl;
                iflyteInit(this.iflyteClientPath,this.iflyteServerUrl,this.caseName);
                // 更新庭审id
                _this.recordIdMut(recordId);
                _this.noteUrl = res.data.noteUrl;
                if (_this.comm.isTrialAuthorizeShow('trial:prove')) { // 质证权限决定头部质证按钮的显示控制
                    // this.$message.success('proveControl'+proveControl);
                    if (proveControlStatus == 0) { // 禁止质证
                        _this.provControl = {
                            status: false,
                            name: '允许质证',
                            icon: 'startExamination',
                            class: ''
                        };
                    } else { // 允许质证
                        _this.provControl = {
                            status: true,
                            name: '结束质证',
                            icon: 'endExamination',
                            class: 'red'
                        };
                    }

                }
                else {
                    if (proveControlStatus == 0) { // 禁止质证
                        _this.crossExaminationStatus = false;
                    } else { // 允许质证
                        _this.crossExaminationStatus = true;
                    }
                }
                if (signInControlStatus == 0) {
                    _this.signInControl = {
                        status: false,
                        name: '开始签到',
                        icon: 'startSignIn',
                        class: ''
                    };
                } else {
                    _this.signInControl = {
                        status: true,
                        name: '结束签到',
                        icon: 'stopSignIn',
                        class: 'red'
                    };
                }
                // 头部显示放再签名和质证状态更新后,否则影响头部按钮显示
                // 中间内容显示也需要放在质证状态更新后,否则会影响质证分享按钮偶现不受控bug
                _this.$nextTick(() => {
                    _this.showHeader = true;
                    _this.showContent = true;
                    _this.$nextTick(() => {
                        _this.isInitLoadingShow = false;
                    });
                });

            });
        },
        // 初始化阅卷状态显示
        initDossierStatus() {
            let _this = this;
            this.dossierViewVerify(this.$route.query.trialId).then((res) => {
                console.log('initDossierStatus', res.data);
                _this.isAllowRead = !res.data;

            });
        },
        fnShowWPS(){
            this.isShowWPS=true;
            this.splitScreen();
        },
        /** *****************页面初始化操作start**********************/

        /** *****************打点列表start**********************/
        // 显示打点列表---点击打点列表操作
        emitShowDotList() {
            if (this.slidStatus.leftScale || this.slidStatus.rightScale) {
                this.splitScreen();
            }
            if (this.trialStatus == 0 || this.trialStatus == 1) { // 庭审前和庭审中打点列表页面播放直播视频
                this.leftRouterName = 'RecordPlay';

            }
            else {
                this.leftRouterName = 'DotRecordPlay';
            }
            // this.rightRouterName = 'TrialRecordModal';
        },
        // 显示语音识别
        emitShowSpeechRecognition() {
            if (this.slidStatus.leftScale || this.slidStatus.rightScale) {
                this.splitScreen();
            }
            this.leftRouterName = 'SpeechRecognition';
            // this.rightRouterName = 'TrialRecordModal';
        },
        // 关闭打点列表
        // emitCloseDotList() {
        //     this.showAlertBoxDotList = false;

        // },
        // 打点链接跳转
        emitDotLinkTo(timeStamp) {
            console.log('emitDotLinkTo的timeStamp', timeStamp);
            this.dotTimestamp = timeStamp;
        },
        // 庭审打点成功
        emitTrialDotSuccess() {
            // 通知打点列表页面更新打点列表
            if (this.leftRouterName == 'RecordPlay') {
                this.DotListAction = `updateDotListnum${Date.now()}`;
            }
        },
        /** *****************打点列表end**********************/
        /** *****************签到状态start**********************/

        changeSignInStatus(signInStatus) {
            // debugger;
            if (signInStatus) {
                this.signInControl = {
                    status: false,
                    name: '开始签到',
                    icon: 'startSignIn',
                    class: ''
                };
                sendMsgFn(
                    {
                        'msgType': 'signInStatus',
                        'trialId': this.$route.query.trialId,
                        'optType': 0 // 0结束签到1发起签到
                    },
                    stompClient
                );
            } else {
                this.signInControl = {
                    status: true,
                    name: '结束签到',
                    icon: 'stopSignIn',
                    class: 'red'
                };
                sendMsgFn(
                    {
                        'msgType': 'signInStatus',
                        'trialId': this.$route.query.trialId,
                        'optType': 1 // 0结束签到1发起签到
                    },
                    stompClient
                );
            }
        },
        /** *****************签到状态end**********************/

        /** *****************质证操作start**********************/

        // 修改质证状态(头部允许质证按钮操作触发的事件)
        changeCrossExamination(item) {
            // 法官修改了质证状态则发送消息提醒当事人发起质证
            this.crossExaminationStatus = item.status;
            if (item.name == '结束质证') {
                this.provControl = {
                    status: false,
                    name: '允许质证',
                    icon: 'startExamination',
                    class: ''
                };
                // 法官结束质证
                let params = {
                    'msgType': 'proveControl',
                    'trialId': this.trialId,
                    'proveControl': 'forbid'
                };
                sendMsgFn(params, stompClient);
            }
            else {
                // 法官允许当事人质证
                let params = {
                    'msgType': 'proveControl',
                    'trialId': this.trialId,
                    'proveControl': 'allow'
                };
                sendMsgFn(params, stompClient);
                this.provControl = {
                    status: true,
                    name: '结束质证',
                    icon: 'endExamination',
                    class: 'red'
                };
            }
        },
        // 质证分享选择人员操作结束---点击确认按钮
        emitChooseMemberList(data) {
            console.log('emitChooseMemberList', data);
            this.showAlertBoxChooseMember = false;

            if (this.chooseMemberType === 0) { // 质证

                this.curChooseMember = data;
                // 如果为传阅改变按钮显示---传阅不保存数据直接分享
                if (this.curProveShareOperateType === 'passProve') {
                    this.proveOperateBtnShow = {
                        isShowCloseProve: true,
                        isShowPassProve: false,
                        isShowRejectProve: false
                    };
                    // 传阅的质证分享信息改变
                    // 1接收到当事人发来的消息后改变---正常
                    // 2刷新后从后台查询到的---异常
                    // ---点击传阅的时候不需要再更新质证消息
                    // 直接分享质证
                    this.shareProve();
                }
                else { // 否则是法官质证分享需要先保存后分享
                    this.saveCurProvInfo();

                }
            } else if (this.chooseMemberType === 1) { // 笔录传阅
                this.sendMsgNoteCirculation(data);
            }
        },
        //材料图片点击预览查看
        emitClickCheck(screnShoot){
            this.clickViewerImages=[screnShoot];
            let _this=this;
            setTimeout(() => {
                _this.$viewer.view(0);

            }, 20);
        },
        // 质证分享按钮被点击(包括当事人和法官)
        emitProveShareClick(screnShoot) {
            this.curProveShareBase64 = screnShoot;

            // 此处增加判断根据角色决定要不要显示人员选择框
            this.curProveShareOperateType = 'shareProve';


            // 审判长选择分享人员---其他不选默认发送给审判长
            if (this.comm.isTrialAuthorizeShow('trial:judgeProveShare')) {
                // 显示质证选人框
                this.showAlertBoxChooseMember = true;
                this.chooseMemberType = 0;
            }
            else { // 当事人没有选人弹框就直接保存质证图片然后分享
                this.saveCurProvInfo();

            }

        },
        // 请求接口将质证图片存储到数据库,并且获取质证信息
        saveCurProvInfo() {
            let params = {
                trialId: this.$route.query.trialId,
                picBase64: this.curProveShareBase64.split(',')[1]
            };
            let _this = this;
            _this.saveProvePhotoToURL(params).then((res) => {
                console.log('saveProvePhotoToURL', res);
                if (res.code == 0) {
                    // 存储质证分享信息
                    _this.curProveShareInfo = res.data;
                    // 其他人直接分享质证
                    _this.shareProve();
                }
            });
        },
        // 分享质证操作
        shareProve() {
            // 1更新质证分享信息显示质证分享图片
            this.proveInfoMut(this.curProveShareInfo);
            let _this = this;
            this.$nextTick(function() {
                // 2发送质证消息
                if (this.comm.isTrialAuthorizeShow('trial:judgeProveShare')) {
                    sendMsgFn({
                        'msgType': 'judgeProve',
                        'proveId': _this.proveInfoGet.proveId,
                        'trialId': _this.trialId,
                        'senderId': _this.proveInfoGet.senderId,
                        'sender': _this.proveInfoGet.sender,
                        'picUrl': _this.proveInfoGet.picUrl,
                        'peopleTypes': _this.curChooseMember
                    }, stompClient);
                } else {
                    sendMsgFn({
                        'msgType': 'casePeopleProve',
                        'proveId': _this.proveInfoGet.proveId,
                        'trialId': _this.trialId,
                        'senderId': _this.proveInfoGet.senderId,
                        'sender': _this.proveInfoGet.sender,
                        'picUrl': _this.proveInfoGet.picUrl
                    }, stompClient);
                }
            });
        },
        // 法官结束质证
        closeProve() {

            let params = {
                'msgType': 'proveStatus',
                'proveId': this.proveInfoGet.proveId,
                'trialId': this.trialId,
                'proveStatus': 'end'
            };
            sendMsgFn(params, stompClient);
            this.closeProveShare();
            this.proveOperateBtnShow = {
                isShowCloseProve: true,
                isShowPassProve: false,
                isShowRejectProve: false
            };
        },
        // 法官拒绝当事人的质证
        rejectProve() {

            console.log('rejectProve');
            let params = {
                'msgType': 'judgeRefuseProve',
                'proveId': this.proveInfoGet.proveId,
                'trialId': this.trialId,
                'senderId': this.proveInfoGet.senderId,
                'sender': this.proveInfoGet.sender,
                'picUrl': this.proveInfoGet.picUrl
            };
            sendMsgFn(params, stompClient);
            this.closeProveShare();
            this.proveOperateBtnShow = {
                isShowCloseProve: true,
                isShowPassProve: false,
                isShowRejectProve: false
            };
        },
        // 法官传阅当时人的质证
        passProve() {
            console.log('passProve---proveInfoGet', this.proveInfoGet);
            this.showAlertBoxChooseMember = true;
            this.chooseMemberType = 0;
            this.curProveShareOperateType = 'passProve';
        },
        // 质证分享弹框显示
        showProveShare(src) {
            // this.viewerOptions={
            //     'button':false,
            //     'navbar':false,
            //     'title':false,
            //     'keyboard':false,
            //     'fullscreen':false
            // }
            this.proveDialogVisible = true;
            this.viewerImages = [this.formatUrl(src)];
        },
        // 质证分享弹框关闭
        closeProveShare() {
            this.proveDialogVisible = false;
            this.viewerImages = [];
        },
        // 格式化地址
        formatUrl(item) {
            let itemUrl = item.replace(/\\/g, '/');
            let url = `${__API__}/trial${itemUrl}`;
            return url;
        },
        /** *****************质证操作end**********************/
        /** *****************阅卷控制start**********************/

        emitChangeYGSwitch(checked) {
            this.plaintiffViewStatus = checked;

            let params = {
                'msgType': 'dossierView',
                'trialId': this.trialId,
                'type': 'plaintiff',
                'optType': checked ? '1' : '0'
            };
            sendMsgFn(params, stompClient);

        },
        emitChangeBGSwitch(checked) {
            this.defendantViewStatus = checked;

            let params = {
                'msgType': 'dossierView',
                'trialId': this.trialId,
                'type': 'defendant',
                'optType': checked ? '1' : '0'
            };
            sendMsgFn(params, stompClient);
        },
        /** *****************阅卷控制end**********************/
        /** *****************笔录相关start**********************/

        // 法官点击笔录传阅
        // eslint-disable-next-line no-dupe-keys
        noteCirculation() {
            this.showAlertBoxChooseMember = true;
            this.chooseMemberType = 1;
        },
        // 法官发送笔录传阅
        sendMsgNoteCirculation(data) {
            // 发送消息
            sendMsgFn({
                'msgType': 'noteView',
                'trialId': this.$route.query.trialId,
                'peopleTypes': data
            }, stompClient);
            this.openRightBottomTip('发送笔录传阅成功');
        },
        // 当事人接收笔录传阅
        noteCirculationMsgHandle(msg) {
            console.log('订阅笔录传阅消息处理', msg);
            if (this.slidStatus.leftScale || this.slidStatus.rightScale) {
                this.splitScreen();
            }

            this.sendNoteCirculation = true;
            if (this.rightRouterName === 'TrialRecordModal') {
                this.$refs.rightRouter.handleNoteCirculation(true);
            } else {
                this.activeIndex = this.optBtns.findIndex(p =>  p.icon === 'TrialRecordModal' );
                this.changeRightRouter('TrialRecordModal');
            }
        },
        // 当事人一直显示笔录按钮，不再通过该接口判断 获取笔录传阅状态
        getCirculationStatus() {
            this.getNoteCirculationStatus(this.trialId).then((res) => {
                if (res.code === 0) {
                    let index = this.optBtns.findIndex((p) => { return p.icon === 'TrialRecordModal' });
                    this.optBtns[index].isShow = res.data === 1;
                }
            });
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
        /** *****************电子卷宗和影音证据相关start**********************/
        // 影音证据切换右侧成文件上传页面
        linkToFileUpload() {
            this.activeIndex = -1;
            if(this.slidStatus.leftScale||this.slidStatus.rightScale){
                this.splitScreen();
            }
            this.changeRightRouter('FileUpload');
        },
        // 上传相关操作触发左侧的影音证据更新
        updataProofTree(uid) {
            this.treeAction = `updateProofTreenum${uid}`;
            this.fileId = '';
            this.fileAction = `initnum${Date.now()}`;
        },
        // 取消材料跳转
        emitCancelFileChange(fileId) {
            this.selectedKeys = [fileId];
            this.typeCode = this.oldTypeCode;
        },
        // 树节点选中传参
        treeNodeSelect(item) {
            console.log('点击节点');
            console.log('treeNodeSelect', item);
            this.selectedKeys = [item.fileId];
            let url = item.url ? item.url.replace(/\\/g, '/') : '';
            // let url = this.formatUrl(item.url);
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
                        _this.fileAction = '';
                    });
                    break;
                case '1':// 图片方式
                    this.leftRouterName = 'TopicReader';
                    this.$nextTick(() => {
                        _this.fileId = item.fileId;
                        _this.fileAction = `initnum${Date.now()}`;
                        _this.oldTypeCode = _this.typeCode;
                        _this.typeCode = item.type;
                        if (_this.oldTypeCode == null) {
                            _this.oldTypeCode = _this.typeCode;
                        }
                        _this.fileNodeInfo = item;
                    });

                    break;
                case '2':// pdf插件

                    this.leftRouterName = 'PdfView';
                    this.$nextTick(() => {
                        _this.pdfFileUrl = url;
                        _this.fileAction = '';

                    });
                    break;
                case '3':// excel原文件打开
                    this.excelFileUrl = '';
                    this.leftRouterName = 'NtkoView';
                    this.$nextTick(() => {
                        _this.excelFileUrl = url;
                        _this.fileAction = '';
                    });
                    break;
                default:
                    break;
            }

        },

        /** *****************电子卷宗和影音证据相关end**********************/



        /** *****************警务助手start**********************/
        // 警务助手
        togglePoliceAssistant() {
            this.showAlertBoxPolice = !this.showAlertBoxPolice;
        },
        // 法官发送消息 给警务
        sendMsgToPolice(params) {
            sendMsgFn({
                'msgType': 'bailiffHelper',
                'trialId': this.$route.query.trialId,
                'senderId': this.currentUser.id,
                'type': params.type,
                'content': params.content,
                'otherExplain': params.otherExplain ? params.otherExplain : ''
            }, stompClient);
            if (params.type === 1) {
                this.togglePoliceAssistant();
            } else if (params.type === 2) {
                this.$message.warning('已通知法警！');
            }
            setTimeout(() => {
                if (this.rightRouterName === 'PoliceHistory') {
                    this.$refs.rightRouter.getMsgList();
                }
            }, 2000);

        },
        /** *****************警务助手end**********************/

        /** *****************庭审画面 start**********************/
        emitLiveAdderss(params) {
            sendMsgFn({
                'msgType': 'sendLiveAddress',
                'trialId': this.$route.query.trialId,
                'type': params.type,
                'VINPUT': params.VINPUT
            }, stompClient);
        },
        emitAcceptAddress(acceptAddress) {
            this.acceptAddress = acceptAddress;
        }
        /** *****************庭审画面 end**********************/
    }
};
</script>
<style scoped lang="less" type="text/less">
.basic-layout {
    font-size: @font20px;
    width: 2560px;
    height: 100%;
    background: url('./../assets/images/bg.png') no-repeat top center;
    background-size:cover;
   background-attachment:fixed;
   background-color:@bg_box;
    overflow: hidden;
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
        overflow: hidden;
        .left {
            padding:0 20px;
            position: relative;
            width: 400px;
            background-color:@bg_box ;
            margin-right: 40px;

            .left-btn-opt-box{
                position: absolute;
                right: 0;
                top: 10px;
                z-index: 2001;
            }
        }
        .middle {
             flex: 1;
            // flex: 0 0 930px;
            width: 930px;
            background-color:@bg_box ;
            // overflow: hidden;
        }
        .right {
            display: none;
            // flex: 0 0 850px;
            width: 850px;
            margin-left:40px;
            background-color:@bg_box ;
        }
        .controlBox{
            position: absolute;
            top:10px;
            right: 10px;
            img{
                width:40px;
                height: 40px;
            }
        }
        .btnRightControlBox{
            position: absolute;
            right: -40px;
            top:0;
            z-index: 9999;
        }
        .btnLeftControlBox{
            position: absolute;
            left: -40px;
            top:0;

        }
        .opt-btns {
            flex: 0 0 180px;
            width: 180px;
            margin-left: 40px;
            .btn-opt-box{
                color:@color_primary;
                background: @bg_box;
                font-size: @font24px;
                margin-bottom: 10px;
                img{
                    margin: 0 10px;
                }

            }
            .btn-wrapper{
                button {
                    position: relative;
                    width: 180px;
                    height: 130px;
                    border-radius: 5px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-size: @font28px;
                    justify-content: center;
                    background-color:@bg_box ;
                    color:@color_primary;
                    border: 1px solid transparent;
                    &.active{
                        background-color: @color_primary;
                        color:@bg_box;
                    }
                    &.new-msg:before{
                        content: "";
                        position: absolute;
                        display: inline-block;
                        width: 25px;
                        height: 25px;
                        background: transparent url("../assets/images/icon/icon_redDot.gif") 0 0 ~'/' 100% 100%;
                        top: -8px;
                        right: -8px;
                        z-index: 1000;
                    }

                    img{
                        width: 60px;
                        height: 60px;
                    }
                    &:not(:first-child) {
                        margin-top: 15px;
                    }
                }
            }

            .trial-control-btns {
                top: 0;
                left: -130px;
            }
        }

    }
    .allowReadBox{
        position: fixed;
        top:@trial_top_menu_h;
        left: 0;
        right: 0;
        bottom: 0;
        background: #D2EAFF;
        z-index: 2005;
        .allowWrapper{
            width: 22rem;
        }
        img{
            width: 180px;
            height: 185px;
        }
        h1{
            word-spacing: 20px;
            letter-spacing: 20px;
            font-size: 72px;
            font-weight: bold;
            margin: 10px 0;
        }
        p{
            font-size: 54px;
            margin-top: 10px;
            word-spacing: 10px;
            letter-spacing: 10px;
            text-align: left;

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
    .header-title{
       position: absolute;
       top:-60px;
       z-index: 3000;
       width: 100%;
       text-align: left;
       color: #fff;
       font-size: @font28px;
    }
    .footer-btns {
        text-align: center;
        position: absolute;
        bottom:-80px;
        width: 100%;
        z-index: 3000;
        button {
            margin:10px;
            font-size: @font28px;
        }
    }
}
</style>
<style lang="less">
</style>
