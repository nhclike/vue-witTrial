/*庭审页面头部(书记员和当事人)
 * @Author: nihc
 * @Date: 2020-09-08 11:23:37
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-12 13:36:30
 */
<template>
    <el-row class="header">
        <el-col :span="9" class="caseInfo">
            <img class="caseIcon" src="/images/trial/caseName.png" />
            <span
                v-if="caseCodes.length < 1"
                class="case-name txt-ellipsis"
                :title="caseName"
            >{{ caseName }}</span>
            <template v-else >
                <div class="pos-r case-box">
                    <span
                    class="case-name txt-ellipsis"
                    :title="caseName"
                    @click="caseItemShow=!caseItemShow"
                    >
                        {{caseName}}
                    </span>
                    <div class="case-icon">
                        <a-icon type="caret-up" v-if="caseItemShow" style="color:#fff"/>
                        <a-icon type="caret-down" v-else style="color:#fff" />
                    </div>
                    <div class="case-item" v-show="caseItemShow">
                        <ul>
                            <li v-for="(item, index) in caseCodes" :key="index"
                            @click.stop="changeCaseCode(item)"
                            >
                                <span>{{item}}</span>
                            </li>
                        </ul>
                        <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
                    </div>
                </div>
            </template>
            <!-- <el-select
                v-else
                class="el-select_transparent_caseCode case-name"
                v-model="caseName"
                placeholder
                @change="changeCaseCode"
            >
                <el-option
                    v-for="(item, index) in caseCodes"
                    :key="index"
                    :label="item"
                    :value="item"
                ></el-option>
            </el-select> -->
            <span class="randomNum" v-if="isShowRandomCode">本案随机码:{{ randomNum }}</span>
        </el-col>
        <el-col :span="11">
            <div class="opt-box">
                <div class="switchItem" v-show="isShowDossierView">
                    <a-switch
                        checked-children="开"
                        un-checked-children="关"
                        @click="changeStatus(plaintiffViewStatus)"
                        @change="changeYGSwitch"
                        :checked="plaintiffViewStatus"
                    />
                    <span>{{ygName}}阅卷</span>
                </div>
                <div class="switchItem" v-show="isShowDossierView">
                    <a-switch
                        checked-children="开"
                        un-checked-children="关"
                        @click="changeStatus(defendantViewStatus)"
                        @change="changeBGSwitch"
                        :checked="defendantViewStatus"
                    />
                    <span>{{bgName}}阅卷</span>
                </div>
                <div v-if="isShowTrialControl">
                    <button
                        :disabled="btn.disabledtrialStatus.indexOf(trialStatus) > -1"
                        v-if="btn.trialStatusArr.indexOf(trialStatus) > -1"
                        v-for="(btn, index) in optBtns"
                        :key="index"
                        @click="click(btn.func, btn, index)"
                        :class="{
                            'btn-item': true,
                            active: active === index,
                            disabled:
                                btn.disabledtrialStatus.indexOf(trialStatus) > -1
                        }"
                    >
                        <img
                            v-if="
                                active === index ||
                                btn.disabledtrialStatus.indexOf(trialStatus) > -1
                            "
                            :src="`/images/trial/${btn.activeIcon}.png`"
                            alt
                        />
                        <img v-else :src="`/images/trial/${btn.icon}.png`" alt />
                        {{ btn.name }}
                    </button>
                </div>

                <button class="btn-item" v-if="isShowBroadcast" @click="showAlertBoxVoiceBroadcast">
                    <img src="/images/trial/voiceBroadcast.png" alt />
                    开庭播报
                </button>
                 <!-- <button class="btn-item" @click="goToThreePageView">
                    <img src="/images/trial/voiceBroadcast.png" alt />
                    多页查看
                </button> -->
                <!-- shjTodo-WITTRIAL-517 如果是远程庭审，显示【远程设备】按钮 -->
                <!-- <button class="btn-item" v-if="isShowTrialDevice" @click="showAlertBoxTrialDevice">
                    <img src="/images/trial/voiceBroadcast.png" alt />
                    远程设备
                </button> -->
                <!-- 质证控制 -->
                <button
                    v-if="isShowProvControl"
                    class="btn-item"
                    @click="crossExamination(provControl)"
                    :class="[provControl.class]"
                >
                    <img :src="`/images/trial/${provControl.icon}.png`" alt />
                    {{ provControl.name }}
                </button>
                <button
                    v-if="isShowStartSignIn"
                    class="btn-item"
                    @click="changeSignInStatus(signInControl.status)"
                    :class="[signInControl.class]"
                >
                    <img :src="`/images/trial/${signInControl.icon}.png`" alt />
                    {{ signInControl.name }}
                </button>
                <button
                    v-if="isShowEndTrial"
                    class="btn-item"
                    @click="endTrial()"
                    >
                    <img :src="`/images/trial/endTrial.png`" alt />
                    关闭阅卷
                </button>
                <button
                    v-if="isShowHelp"
                    class="btn-item red"
                    @click="handleAlarm()"
                    >
                    <img src="@/assets/images/icon/icon-btnAlarm.png" alt title="一键报警" />
                    一键报警
                </button>
            </div>
        </el-col>
        <el-col class="full-height header-right">
            <!-- <div class="goBack-box alarm" v-if="isShowHelp" @click="handleAlarm()">
                <img src="@/assets/images/icon/icon-btnAlarm.png" alt title="一键报警" />
            </div> -->
            <div class="username">您好，{{ userInfo().name }}</div>
            <div class="goBack-box" v-if="$store.state.role === 'judge'" @click="goBack()">
                <img src="/images/trial/goBack.png" />
                <span class="goBack">返回</span>
            </div>
            <!-- 当事人去掉退出按钮 -->
            <!-- <div class="goBack-box" v-if="$store.state.role === 'party'" @click="logOutSys()">
                <img src="@/assets/images/icon/icon_exit.png" />
                <span class="goBack">退出</span>
            </div> -->
        </el-col>
    </el-row>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { stompClient, sendMsgFn } from '@/utils/SocketJS';
import Template from '../../views/template/Template.vue';

export default {
    name: 'TrialHeader',
    components: {Template},
    inject: ['reload', 'userInfo'],
    props: {
        provControl: {
            default: {
                status: false,
                name: '允许质证',
                icon: 'startExamination',
                class: ''
            }
        },
        signInControl: {
            default: {
                status: false,
                name: '开始签到',
                icon: 'startSignIn',
                class: ''
            }
        },
        plaintiffViewStatus: {
            // 法官允许原告阅卷状态
            type: Boolean,
            default: false
        },
        defendantViewStatus: {
            // 法官允许被告阅卷状态
            type: Boolean,
            default: false
        },
        randomNum: {
            type: String,
            default: '666666'
        },
        caseName: {
            type: String,
            default: 'asdasdad'
        },
        caseCodes: {
            type: Array,
            default: []
        },
        // 庭审状态 '0'-待庭审 '1'-庭审中 '2'-休庭中 '3'-复庭（弃用） '4'-闭庭（待校对） '5'-已结束（已校对）
        trialStatus: {
            type: String,
            default: '0'
        },
        // '0'-非远程庭审 '1'-远程庭审
        remoteVideo: {
            type: String,
            default: '0'
        }
    },
    data() {
        return {
            active: -1,
            ygName: '原告',
            bgName: '被告',
            caseItemShow: false,
            optBtns: [
                {
                    name: '开庭',
                    icon: 'openCourt',
                    activeIcon: 'openCourtActive',
                    func: 'showAlertBoxOpenCourt',
                    trialStatusArr: ['0', '1', '4', '5'],
                    disabledtrialStatus: ['1', '4', '5']
                },
                {
                    name: '复庭',
                    icon: 'returnCourt',
                    activeIcon: 'returnCourtActive',
                    func: 'fnOpenCourt',
                    trialStatusArr: ['2'],
                    disabledtrialStatus: ['0', '1', '4', '5']
                },
                {
                    name: '休庭',
                    icon: 'restCourt',
                    activeIcon: 'restCourtActive',
                    func: 'fnPauseCourt',
                    trialStatusArr: ['0', '1', '2', '4', '5'],
                    disabledtrialStatus: ['0', '2', '4', '5']
                },
                {
                    name: '闭庭',
                    icon: 'closeCourt',
                    activeIcon: 'closeCourtActive',
                    func: 'fnCloseCourt',
                    trialStatusArr: ['0', '1', '2', '4', '5'],
                    disabledtrialStatus: ['0', '4', '5']
                }
                /*  {
                    name: '增录',
                    icon: 'addRecord',
                    activeIcon: 'addRecordActive',
                    func: 'showAlertBoxAddRecord',
                    trialStatusArr: ['0', '1', '2', '4', '5'],
                    disabledtrialStatus: ['0', '2', '4', '5']
                } */
            ]
        };
    },
    computed: {
        ...mapGetters('moduleJudge', ['proveInfoGet']),
        isShowRandomCode() {
            return this.comm.isTrialAuthorizeShow('trial:randomCode');
        },
        isShowTrialControl() {
            return this.comm.isTrialAuthorizeShow('trial:controller');
        },
        isShowProvControl() {
            let isShow = this.trialStatus == 1 ? true : false;
            return this.comm.isTrialAuthorizeShow('trial:prove') && isShow;
        },
        isShowDossierView() {
            let isShow = this.trialStatus == 4 || this.trialStatus == 5 ? false : true;
            return this.comm.isTrialAuthorizeShow('trial:dossierView') && isShow;
        },
        isShowBroadcast() {
            return this.comm.isTrialAuthorizeShow('trial:broadcast');
        },
        isShowStartSignIn() {
            // 闭庭后签到按钮隐藏
            // let isShow = this.trialStatus == 4 || this.trialStatus == 5 ? false : true;
            // return this.comm.isTrialAuthorizeShow('trial:startSignIn') && isShow;
            return false;//国产化注释掉签到功能
        },
        isShowEndTrial() {
            // 闭庭后显示结束庭审按钮
            let isShow = this.trialStatus == 4 || this.trialStatus == 5 ? true : false;
            // let isShow=true;
            return this.comm.isTrialAuthorizeShow('trial:endTrial') && isShow;
        },
        isShowTrialDevice() {
            return this.comm.isTrialAuthorizeShow('trial:remotevideo1');
        },
        isShowAddRecord() {
            return this.comm.isTrialAuthorizeShow('trial:addRecord');
        },
        isShowHelp() {
            return this.comm.isTrialAuthorizeShow('trial:helper');
        }
    },
    watch: {},
    created() {
        //
    },
    mounted() {
        let _this = this; // 声明一个变量指向Vue实例this，保证作用域一致

        this.timer = setInterval(() => {
            _this.date = new Date().Format('yyyy年MM月dd日 hh:mm'); // 修改数据date
        }, 1000);
        // this.getPeopleTypes();
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
        }
    },
    methods: {
        ...mapActions({
            logOut: 'moduleLogin/logOut',
            openCourt: 'moduleJudge/openCourt',
            closeCourt: 'moduleJudge/closeCourt',
            pauseCourt: 'moduleJudge/pauseCourt',
            peopleTypes: 'moduleJudge/peopleTypes',
            stopRecord: 'moduleXyDevice/stopRecord', // 停止录制
            backToSynthesis:'moduleJudge/backToSynthesis'
        }),
        ...mapMutations('moduleJudge', ['recordIdMut']),
        changeStatus(item) {
            console.log('click', item);
            this.item = !item;
        },
        click(func, item, index) {
            console.log(item);
            this.active = index;
            if (this[func]) {
                this[func](item);
            }
        },
        goToThreePageView(){
            this.$router.push({
                path:'/three/topicReader',
                query: {
                    // caseCode: item.caseCode,
                    trialId: this.$route.query.trialId
                }
            })
        },
        goBack() {
            this.$router.push({
                path: this.$route.query.fromWorkBench ? '/main/judge/workbench' : '/main/judge'
            });
        },
        logOutSys() {
            window.sessionStorage.clear();
            window.opener = null;
            window.open('', '_self');
            window.location.href = 'about:blank';
            window.close();
        },
        getPeopleTypes() {
            this.peopleTypes(this.$route.query.trialId).then((res) => {
                if (res.code == 0) {
                    this.bgName = res.data.bgType;
                    this.ygName = res.data.ygType;
                }
            });
        },
        // 开庭、复庭
        showAlertBoxOpenCourt(item) {
            this.$emit('showAlertBoxOpenCourt', item.icon);
        },
        // 增录
        showAlertBoxAddRecord() {
            this.$emit('showAlertBoxAddRecord');
        },
        // 语音播报
        showAlertBoxVoiceBroadcast() {
            this.$emit('showAlertBoxVoiceBroadcast');
        },
        // 远程设备
        showAlertBoxTrialDevice() {
            this.$emit('showAlertBoxTrialDevice');
        },
        // 允许质证(法官允许当事人质证)
        crossExamination(item) {
            this.$emit('changeCrossExamination', item);
        },
        // 休庭
        fnPauseCourt() {
            this.$CusConfirm({
                title: '确定休庭吗？',
                cancel: () => {
                    // console.log('点取消调用');
                },
                ok: () => {
                    let params = {
                        trialId: this.$route.query.trialId
                    };
                    this.reqPauseCourt(params);
                }
            });
        },
        reqPauseCourt(params) {
            this.pauseCourt(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.recordIdMut(res.data);
                    this.$emit('emitTrialStatus', '2');
                    /* if (this.remoteVideo === '1') {
                        // shjTodo-如果是远程庭审，休庭做什么？
                    } */
                }
            });
        },
        // 复庭
        fnOpenCourt() {
            this.$CusConfirm({
                title: '确定复庭吗？',
                cancel: () => {
                    // console.log('点取消调用');
                },
                ok: () => {
                    let params = {
                        trialId: this.$route.query.trialId
                    };
                    this.reqOpenCourt(params);
                }
            });
        },
        reqOpenCourt(params) {
            this.openCourt(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.recordIdMut(res.data);
                    this.$emit('emitTrialStatus', '1');
                    /* if (this.remoteVideo === '1') {
                        // shjTodo-如果是远程庭审，复庭做什么？
                    } */
                }
            });
        },
        // 闭庭
        fnCloseCourt() {
            this.$CusConfirm({
                title: '确定闭庭吗？',
                cancel: () => {
                    // console.log('点取消调用');
                },
                ok: () => {
                    let params = {
                        trialId: this.$route.query.trialId
                    };
                    this.reqCloseCourt(params);
                }
            });
        },
        reqCloseCourt(params) {
            this.closeCourt(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.recordIdMut(false);
                    this.$emit('emitTrialStatus', '4');
                    /* if (this.remoteVideo === '1') {
                        // shjTodo-如果是远程庭审，闭庭后关闭所有设备以及软终端，保存录像地址
                    } */
                    this.backToSynthesis(params);

                }
            });
        },
        // 停止录制
        reqStopRecord(params) {
            this.stopRecord(params).then((res) => {
                console.log('stopRecord', res);
            });
        },
        changeYGSwitch(checked) {
            console.log(`a-switch to ${checked}`);
            this.$emit('emitChangeYGSwitch', checked);
        },
        changeBGSwitch(checked) {
            console.log(`a-switch to ${checked}`);
            this.$emit('emitChangeBGSwitch', checked);
        },
        handleAlarm() {
            this.$CusConfirm({
                title: '是否通知法警，请确认？',
                cancel: () => {
                    //                    console.log('点取消调用');
                },
                ok: () => {
                    this.$emit('sendAlarm', {
                        type: 2,
                        content: '正在报警，请及时处理！'
                    });
                }
            });
        },

        // 切换并案案号
        changeCaseCode(caseCode) {
            this.caseItemShow = false;
            this.$emit('emitCaseCode', caseCode);
        },
        changeSignInStatus(signInStatus) {
            this.$emit('changeSignInStatus', signInStatus);
            // if (signInStatus) {
            //     this.signInControl = {
            //         status: false,
            //         name: '开始签到',
            //         icon: 'startSignIn',
            //         class: ''
            //     };
            //     sendMsgFn(
            //         {
            //             msgType: 'signInStatus',
            //             trialId: this.$route.query.trialId,
            //             optType: 0 // 0结束签到1发起签到
            //         },
            //         stompClient
            //     );
            // } else {
            //     this.signInControl = {
            //         status: true,
            //         name: '结束签到',
            //         icon: 'stopSignIn',
            //         class: 'red'
            //     };
            //     sendMsgFn(
            //         {
            //             msgType: 'signInStatus',
            //             trialId: this.$route.query.trialId,
            //             optType: 1 // 0结束签到1发起签到
            //         },
            //         stompClient
            //     );
            // }
        },
        // 结束庭审
        endTrial() {
            this.$CusConfirm({
                title: '关闭阅卷后当事人将无法查看本地庭审信息，请确认是否关闭？ ',
                cancel: () => {
                    // console.log('点取消调用');
                },
                ok: () => {
                    // console.log('点确定调用');
                    sendMsgFn(
                        {
                            msgType: 'endTrial',
                            trialId: this.$route.query.trialId
                        },
                        stompClient
                    );
                }
            });

        },
        // 闭庭后大屏切回合成画面
        reqBackToSynthesiso(params) {
            params = {
                trialId: this.trialId,
                number: this.inputChannelList[this.activeInputIndex].deviceType === '2' ?
                    this.inputChannelList[this.activeInputIndex].number : null
            };
            let _this = this;
            this.backToSynthesis(params).then((res) => {
                _this.outputChannelChecked = [];
                if (res.code === 0) {

                }
                _this.activeInputIndex = -1;
            });
        }
    }
};
</script>

<style scoped lang="less">
.header {
    height: @trial_top_menu_h;
    padding: 40px 40px 30px 40px;
    display: flex;
    align-items: center;
    .caseInfo {
        color: #fff;
        height: 100%;
        display: flex;
        align-items: center;
        vertical-align: middle;

        .caseCode {
            span,
            i {
                vertical-align: middle;
            }
        }
        .case-box{
            height: 55px;
            cursor: pointer;
            .case-icon{
                position: absolute;
                top:20px;
                right: 20px;
                /deep/.anticon{
                    font-size: @font24px;
                }
            }
            .case-item{
                position: absolute;
                top:55px;
                z-index: 2001;
                width: 100%;
                ul{
                    width: 100%;
                    color: @text_color_content;
                    background:#fff;
                    li{
                        line-height: 50px;
                        height: 50px;
                        font-size: @font24px;
                        margin: 10px;
                    }
                }
            }
        }
        .caseIcon {
            height: 40px;
        }
        .i-btn {
            padding: 0 10px;
        }
        .randomNum {
            font-size: @font24px;
            margin-top: 10px;
            opacity: 0.7;
        }
    }
    .opt-box {
        flex: 1;
        text-align: center;
        margin: 0;
        justify-content: center;
        color: #fff;
        .switchItem {
            /deep/.ant-switch {
                background: @color_grey;
                padding: 0 8px;
                height: 28px;
                .ant-switch-inner {
                    font-size: @font18px;
                }
                &::after {
                    width: 24px;
                    height: 24px;
                }
            }
            /deep/.ant-switch-checked {
                background: @color_primary;
            }
            span {
                margin-left: 10px;
                font-size: @font20px;
            }
            margin-right: 10px;
        }
        .btn-item {
            background-color: @bg_box;
            color: @color_primary;
            font-size: @font24px;
            margin: 0 5px;
            padding: 4px;
            border-radius: 5px;
            border: 1px solid transparent;
            line-height: normal;
            cursor: pointer;
            &.active {
                background-color: @color_primary;
                color: @bg_box;
            }
            &.disabled {
                background-color: @color_info;
                color: @text_color_white;
                cursor: not-allowed;
            }
            &.red {
                color: @color_danger;
            }
            img {
                height: 30px;
                width: 30px;
                margin: 0;
            }
        }
    }
    .header-right {
        display: flex;
        justify-content: flex-end;
        flex:1;
        & > div {
            margin-left: 5px;
        }
        .username {
            font-size: @font28px;
            color: @color_primary;
            align-items: center;
            min-width: 240px;
        }
        .goBack-box {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            cursor: pointer;
            img {
                width: 40px;
                height: 40px;
            }
            .goBack {
                font-size: @font28px;
                color: @color_primary;
                margin-left: 10px;
                height: 45px;
                width: 60px;
                line-height: 45px;
            }
            &.alarm img {
                width: 50px;
                height: 50px;
            }
        }
    }
}
.case-name {
    display: inline-block;
    font-size: @font38px;
    min-width: 4rem;
    margin-right: 30px;
}
</style>
<style lang="less">
</style>

