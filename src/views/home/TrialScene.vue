/* 庭审画面---直播视频切换
 * @Author: ShiHuiJun
 * @Date: 2020-09-04 11:25:01
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-15 17:19:19
 */

<template>
    <div class="trialScene full-height pos-r">
        <div class="video-box" ref="videoBox">
            <n-b-video
                v-if="isNB"
                :objId="'trialSceneVideoObj'"
                :url="url"
                :isShowVideo="showPlayer"
                @videoPlayerLoaded="videoPlayerLoaded"
                :videoWidth="videoWidth"
                :NBAction="NBAction"
                :playList="[]"
            ></n-b-video>
            <flv
                v-else
                :objId="'trialSceneVideoObj'"
                :url="url"
                :isShowVideo="showPlayer"
                @videoPlayerLoaded="videoPlayerLoaded"
                :videoWidth="videoWidth"
                :NBAction="NBAction"
                :playList="[]"
            ></flv>
        </div>
        <div class="content">
            <div v-if="Number(trialStatus) < 4" class="list wi-tabs">
                <div ref="wiTabItem" class="wi-tab-header" >
                    <div
                        v-if="isShowVideoSwitch"
                        :class="{active:activeTab===1,'wi-tab-item':true}"
                        @click="clickTab(1)"
                    >屏幕信号切换</div>
                    <div
                        v-if="isShowPartySwitch"
                        :class="{active:activeTab===2,'wi-tab-item':true}"
                        @click="clickTab(2);"
                    >原/被告席切换</div>
                    <div
                        v-if="isShowLocalDisplay"
                        :class="{active:activeTab===3,'wi-tab-item':true}"
                        @click="clickTab(3);"
                    >本地显示</div>
                </div>
                <div v-if="activeTab===1" class="wi-tab-content">
                    <div class="title">
                        <i class="i-inputDev"></i>示证信号
                    </div>
                    <div class="inputList" v-if="Number(trialStatus) > 0">
                        <button
                            v-for="(sign, index) in inputChannelList"
                            :key="index"
                            :title="sign.name"
                            :class="[activeInputIndex===index?'shj-btn--primary1':'shj-btn--primary_light1','txt-ellipsis']"
                            @click="inputClick(sign,index)"
                        >{{ sign.name }}</button>
                    </div>
                    <div class="title">
                        <i class="i-outputDev"></i>显示设备
                    </div>
                    <div class="outputList" v-if="Number(trialStatus) > 0">
                        <div class="o-item">
                            <span title="全部显示" class="txt-ellipsis" @click="outputClick('all')">全部显示</span>
                            <div title="全部显示" class="txt-ellipsis">全部显示</div>
                        </div>

                        <div class="o-item" v-for="(sign, index) in outputChannelList" :key="index">
                            <span
                                :title="sign.inputDevName"
                                class="txt-ellipsis"
                                @click="outputClick('single',sign, index)"
                            >{{ sign.inputDevName }}</span>
                            <div :title="sign.name" class="txt-ellipsis">{{ sign.name|emptyFilter }}</div>
                        </div>
                    </div>
                </div>
                <div v-if="activeTab===2" class="wi-tab-content">
                    <div class="title">
                        <i class="i-inputDev"></i>示证信号
                    </div>
                    <div class="inputList" v-if="Number(trialStatus) > 0">
                        <button
                            v-for="(sign, index) in inputChannelList_local"
                            :key="index"
                            :title="sign.name"
                            :class="[activeInputIndex_party===index?'shj-btn--primary1':'shj-btn--primary_light1','txt-ellipsis']"
                            @click="inputClick_party(sign, index)"
                        >{{ sign.name }}</button>
                    </div>
                    <div class="title">
                        <i class="i-outputDev"></i>显示设备
                    </div>
                    <div class="outputList" v-if="Number(trialStatus) > 0">
                        <div class="o-item" v-for="(sign, index) in outPutChannelList_party" :key="index">
                            <span
                                :title="sign.inputDevName"
                                class="txt-ellipsis"
                                @click="outputClick_party(sign, index)"
                            >{{ sign.inputDevName }}</span>
                            <div :title="sign.name" class="txt-ellipsis">{{ sign.name|emptyFilter }}</div>
                        </div>
                    </div>
                </div>
                <div v-if="activeTab===3" class="wi-tab-content">
                    <div class="title">
                        <i class="i-inputDev"></i>示证信号
                    </div>
                    <div class="inputList" v-if="Number(trialStatus) > 0">
                        <button
                            v-for="(sign, index) in inputChannelList_local"
                            :key="index"
                            :title="sign.name"
                            :class="[activeInputIndex_local===index?'shj-btn--primary1':'shj-btn--primary_light1','txt-ellipsis']"
                            @click="inputClick_local(sign, index)"
                        >{{ sign.name }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { IEVersion } from '@/utils/utils';
import NBVideo from '@/views/plugins/NBVideo';
import Flv from '@/views/plugins/Flv';
export default {
    name: 'TrialScene',
    components: {
        NBVideo,
        Flv
    },
    inject: ['reload', 'userInfo'],
    filters: {},
    props: {
        // 庭审状态 '0'-待庭审 '1'-庭审中 '2'-休庭中 '3'-待校对 '4'-已结束
        trialStatus: {
            type: String,
            default: ''
        },
        acceptAddress: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            activeTab: -1, // 1-示证切换 2-当事人切换 3-本地显示
            trialId: '', // 庭审id
            isLoaded: false,
            showPlayer: false,
            videoWidth: 500,
            NBAction: '',
            url: {
                urls: [], // 复合画面地址
                liveUrl: '' // 直播流地址 rtsp://admin1:admin1@172.19.82.241:554/cam/realmonitor?channel=21&subtype=0
            },
            /* 示证切换 */
            activeInputIndex: -1,
            // 示证信号
            inputChannelList: [
                /* {
                    channelId: 1,
                    channelType: null,
                    courtroomId: 'O50001',
                    devID: null,
                    dwFanSpeed: null,
                    flag: 1,
                    inputDevName: null,
                    name: '审判长画面',
                    number: null,
                    streamType: null,
                    uniqueChannel: null,
                    wmainBoardTemp: null
                } */
            ],
            // 输出通道
            outputChannelList: [
                /* {
                    channelId: 1,
                    channelType: null,
                    courtroomId: 'O50001',
                    devID: null,
                    dwFanSpeed: null,
                    flag: 2,
                    inputDevName: null,
                    name: '左大屏',
                    number: null,
                    streamType: null,
                    uniqueChannel: null,
                    wmainBoardTemp: null
                } */
            ],
            /* 当事人切换 */
            activeInputIndex_party: -1,
            // 示证信号
            inputChannelList_local: [],
            // 显示设备
            outPutChannelList_party: [],
            /* 本地显示 */
            activeInputIndex_local: -1,
            outputChannelChecked: [] // 选择的输出通道
        };
    },
    computed: {
        // 示证切换
        isShowVideoSwitch() {
            return this.comm.isTrialAuthorizeShow('trial:video:switch');
        },
        // 当事人切换
        isShowPartySwitch() {
            return this.comm.isTrialAuthorizeShow('trial:video:localSwitch');
        },
        // 本地显示
        isShowLocalDisplay() {
            return this.comm.isTrialAuthorizeShow('trial:video:videoDisplay');
        },
        // 合并监听
        listenChange() {
            console.log('TrialScene---computed listenChange');

            const {trialStatus, acceptAddress, isLoaded} = this;
            return {
                trialStatus, acceptAddress, isLoaded
            };
        },
        isNB() {
            // ie使用nb播放器，其他用flv
            return !(navigator.platform.indexOf('Linux') > -1 || IEVersion() === -1)
        }
    },
    watch: {
        // 庭审画面经常崩溃-解决：确认已加载视频播放插件后再执行视频插件中的方法
        listenChange: {
            handler(newVal, oldVal) {
                this.$nextTick(() => {
                    console.log('TrialScene---listenChange', newVal, oldVal);
                    console.log('acceptAddress', newVal.acceptAddress);
                    if (newVal.isLoaded) {
                        if (newVal.trialStatus !== '1') {
                            this.stopVideo();
                            return false;
                        }
                        if (newVal.acceptAddress) {
                            this.resetVideo();
                            this.url.liveUrl = this.acceptAddress;
                            // this.url.liveUrl = 'rtsp://admin1:admin1@172.19.82.241:554/cam/realmonitor?channel=21&subtype=0';
                            // this.url.liveUrl = 'http://172.19.82.4:8181/live?port=8182&app=live&stream=mystream';
                            this.url.urls = [];
                            this.NBAction = `playnum${new Date().getTime()}`;
                            return false;
                        }
                        if (newVal.trialStatus === '1') {
                            this.getLiveUrl();
                        }
                    }
                });
            },
            deep: true,
            immediate: true
        },
        trialStatus: {
            handler() {
                let _this = this;
                // this.$message.success(`this.trialStatus${this.trialStatus}`);
                this.$nextTick(() => {
                    if (Number(_this.trialStatus) > 0) {
                        this.init();
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        this.trialId = this.$route.query.trialId;
        if (this.isShowVideoSwitch || this.isShowPartySwitch || this.isShowLocalDisplay) {
            this.$refs.wiTabItem.children[0].click();
        }
        this.$nextTick(() => {
            this.initNBVideo();
        });
    },
    beforeDestroy() {
        console.log('TrialScene---beforeDestroy');
        this.resetVideo();
        this.$emit('emitAcceptAddress', null);

    },
    methods: {
        // 接口引入
        ...mapActions('moduleJudge', [
            'getLiveAddress',
            'getTrailInputChannelList',
            'getTrailOutChannelList',
            'changeVideo',
            'getLiveAddressOnlyLocal',
            'getAddChannelInfo',
            'getLiveAddressForYBG',
            'getDsrChannel'// 获取当事人视频切换列表
        ]),

        // 初始化
        init() {
            this.reqGetTrailInputChannelList();// 示证切换-示证信号
            this.reqGetOutChannelList();// 示证切换-示证信号
            this.reqGetAddChannelInfo({ trialId: this.trialId });// 本地切换-示证信号
            this.reqGetDsrChannel({ trialId: this.trialId });// 本地切换-显示设备
        },

        initNBVideo() {
            this.$emit('emitShowLoadingIframe');
            setTimeout(() => {
                this.videoWidth = this.$refs.videoBox.clientWidth;
                console.log('videoWidth', this.videoWidth);
                this.showPlayer = true;
            }, 20);
        },

        videoPlayerLoaded() {
            this.$emit('emitHideLoadingIframe');
            this.isLoaded = true;
        },

        resetVideo() {
            // 先关闭直播流
            if (this.url.liveUrl !== '') {
                this.stopVideo();
            }
        },

        // 关闭直播流
        stopVideo() {
            this.NBAction = `stopVideonum${Date.now()}`;
        },

        // 获取直播流
        async getLiveUrl() {
            if (this.$store.getters.roleGet === 'party') {
                let arr = await this.commFilter.queryDictValue({ type: 'plaintiff_select' });
                // shjTodo-userInfo获取当事人类型
                if (
                    arr.findIndex((row) => {
                        return row.value === this.userInfo().name;
                    }) > -1
                ) {
                    this.reqGetLiveAddressForYBG({ trialId: this.trialId, peopleType: 'plaintiff' });
                } else {
                    this.reqGetLiveAddressForYBG({ trialId: this.trialId, peopleType: 'defendant' });
                }
            } else {
                this.reqGetLiveAddress({ trialId: this.trialId });
            }
        },

        // 示证切换、本地切换
        clickTab(tab) {
            this.activeTab = tab;
        },

        // 示证切换 点击示证信号
        inputClick(sign, index) {
            this.activeInputIndex = index;
        },

        // 示证切换 点击显示设备
        outputClick(mode, sign, index) {
            if (this.activeInputIndex < 0) {
                this.$message.error('请选择一个示证信号');
                return;
            }
            if (mode === 'all') {
                this.outputChannelChecked = [];
                this.outputChannelList.forEach((row, index) => {
                    this.outputChannelChecked.push(row.channelId);
                });
                this.reqChangeVideo(mode);
            } else {
                this.outputChannelChecked = [sign.channelId];
                this.reqChangeVideo(mode, index);
            }
        },

        // 当事人切换 点击示证信号
        inputClick_party(sign, index) {
            this.activeInputIndex_party = index;
        },

        // 本地当前播放视频信号投放至当事人
        outputClick_party(sign, index) {
            if (this.activeInputIndex_party < 0) {
                this.$message.error('请选择一个示证信号');
                return;
            }
            if (sign.wmainBoardTemp === 'plaintiff_select') {
                // 原告、公诉人
                this.$emit('emitLiveAdderss', {
                    trialId: this.trialId,
                    type: 'plaintiff',
                    VINPUT: this.inputChannelList_local[this.activeInputIndex_party].channelId
                });
            } else if (sign.wmainBoardTemp === 'defendant_select') {
                // 被告、辩护人
                this.$emit('emitLiveAdderss', {
                    trialId: this.trialId,
                    type: 'defendant',
                    VINPUT: this.inputChannelList_local[this.activeInputIndex_party].channelId
                });
            }
            this.outPutChannelList_party[index].inputDevName = this.inputChannelList_local[this.activeInputIndex_party].name;
        },

        // 本地切换 示证信号地址
        inputClick_local(sign, index) {
            this.activeInputIndex_local = index;

            let params = {
                trialId: this.trialId,
                channelId: sign.channelId
            };
            this.reqGetLiveAddressOnlyLocal(params);
        },


        /* --------------------接口-开始-------------------- */

        // 获取庭审直播流地址 trialId
        reqGetLiveAddress(params) {
            this.getLiveAddress(params).then((res) => {
                if (res.code === 0) {
                    this.url.liveUrl = res.data.url;
                    console.log('url',this.url.liveUrl);
                    this.url.urls = res.data.urls || [];
                    this.NBAction = `playnum${new Date().getTime()}`;
                    if (res.data.channelCache) {
                        this.activeInputIndex_local = this.inputChannelList_local.findIndex((row) => {
                            return String(row.channelId) === String(res.data.channelCache);
                        });
                    }
                } else {
                    this.$message.error('获取直播流失败');
                }
            });
        },

        // 获取直播流原被告屏幕 trailId,peopleType
        reqGetLiveAddressForYBG(params) {
            this.getLiveAddressForYBG(params).then((res) => {
                if (res.code === 0) {
                    this.url.liveUrl = res.data.url;
                    this.url.urls = res.data.url || [];
                    this.NBAction = `playnum${new Date().getTime()}`;
                } else {
                    this.$message.error('获取直播流失败');
                }
            });
        },

        // 获取本地直播流地址
        reqGetLiveAddressOnlyLocal(params) {
            this.getLiveAddressOnlyLocal(params).then((res) => {
                if (res.code === 0) {
                    this.resetVideo();
                    this.url.liveUrl = res.data.url;
                    this.url.urls = res.data.url || [];
                    this.NBAction = `playnum${new Date().getTime()}`;
                }
            });
        },

        // 获取输入通道
        reqGetTrailInputChannelList() {
            this.getTrailInputChannelList({ trialId: this.trialId }).then((res) => {
                if (res.code === 0) {
                    if (res.data.length > 0) {
                        this.inputChannelList = res.data;
                    }
                }
            });
        },

        // 获取输出通道
        reqGetOutChannelList() {
            this.getTrailOutChannelList({ trialId: this.trialId }).then((res) => {
                if (res.code === 0) {
                    if (res.data.length > 0) {
                        this.outputChannelList = res.data;
                    }
                }
            });
        },

        // 获取 本地显示 输入通道
        reqGetAddChannelInfo(params) {
            this.getAddChannelInfo(params).then((res) => {
                if (res.code === 0) {
                    if (res.data.length > 0) {
                        this.inputChannelList_local = res.data;
                    }
                }
            });
        },

        // 获取 本地显示 输出通道 trialId
        reqGetDsrChannel(params) {
            this.getDsrChannel(params).then((res) => {
                if (res.code === 0) {
                    this.outPutChannelList_party = res.data;
                }
            });
        },

        // 切换远程显示设备
        reqChangeVideo(mode, index) {
            let params = {
                trialId: this.trialId,
                VINPUT: String(this.inputChannelList[this.activeInputIndex].channelId),
                VOUTPUT: this.outputChannelChecked.join(','),
                number: this.inputChannelList[this.activeInputIndex].deviceType === '2' ?
                    this.inputChannelList[this.activeInputIndex].number : null
            };
            let _this = this;
            this.changeVideo(params).then((res) => {
                _this.outputChannelChecked = [];
                if (res.code === 0) {
                    if (mode === 'all') {
                        for (let [index] of _this.outputChannelList.entries()) {
                            _this.outputChannelList[index].inputDevName = _this.inputChannelList[_this.activeInputIndex].name;
                        }
                    } else {
                        _this.outputChannelList[index].inputDevName = _this.inputChannelList[_this.activeInputIndex].name;
                    }
                    _this.$message.success(`${res.data}`);
                }
                _this.activeInputIndex = -1;
            });
        }

        /* --------------------接口-结束-------------------- */

    }
};
</script>

<style lang="less" scoped>
@title_lh: 40px;
.trialScene {
    display: flex;
    flex-direction: column;
    .title {
        line-height: @title_lh;
        font-size: @font28px;
    }
    .content {
        flex: 1;
        padding: 20px;
        height: 40%;
        overflow-y: auto;
        .list {
            height: 100%;
        }
    }
    .video-box {
        width: 100%;
        height: 0;
        padding-bottom: 60%;
    }
    .inputList {
        padding: 20px 0;
        button {
            width: 180px;
            height: 50px;
            margin-bottom: 20px;
            font-size: @font28px;
            &:not(:nth-child(4n + 1)) {
                margin-left: 15px;
            }
        }
    }
    .outputList {
        padding: 20px;
        .o-item {
            &:not(:nth-child(3n + 1)) {
                margin-left: 100px;
            }
            display: inline-block;
            width: 150px;
            span {
                color: @text_color_white;
                cursor: pointer;
                display: inline-block;
                width: 150px;
                height: 70px;
                line-height: 60px;
                text-align: center;
                font-size: @font24px;
                background: url('@{base_url}/icon/icon_device.png') no-repeat center center / 100% 100%;
            }
            div {
                width: 100%;
                text-align: center;
            }
        }
    }
}
.wi-tabs {
    .wi-tab-header {
        border-bottom: 1px solid @text_color_white_4;
        line-height: 60px;
        color: @text_color_black;
        margin-bottom: 20px;
        .wi-tab-item {
            cursor: pointer;
            display: inline-block;
            font-size: @font28px;
            &:not(:first-child) {
                margin-left: 20px;
            }
            &.active {
                color: @color_primary;
                border-bottom: 1px @color_primary solid;
            }
        }
    }
    .wi-tab-content {
        font-size: @font28px;
    }
}
</style>
