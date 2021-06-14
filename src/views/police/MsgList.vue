<template>
    <div class="main-content">
        <audio
            ref="alarmAudio"
            src="../../../public/video/alarmvoice.mp3"
            preload="auto"
            loop="loop"
            style="visibility: hidden"
        ></audio>
        <div class="header">
            <img class="icon" src="@/assets/images/icon/icon-msg.png" />
            <span class="name">法庭消息列表</span>
        </div>
        <div class="content">
            <div class="left">
                <div class="left-header">
                    <span>法庭画面</span>
                    <div class="court-list">
                        <div class="combo" @click="toggleCourtList">
                            <i class="full-circle"></i>
                            <div :title="currentCourt.courtroomName">{{currentCourt.courtroomName}}</div>
                            <i :class="isShowCourtList ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
                        </div>
                        <ul ref="courtList" v-if="isShowCourtList">
                            <li v-for="(item, index) in courtList"
                                :key="item.courtroomId"
                                @click="handleCourtClick(index);toggleCourtList()"
                                :title="item.courtroomName"
                            >{{item.courtroomName}}</li>
                        </ul>
                        <iframe v-if="isShowCourtList" src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
                    </div>
                </div>
                <div class="video-box" ref="videoBox">
                    <n-b-video
                        :url="url"
                        :isShowVideo="showPlayer"
                        @videoPlayerLoaded="videoPlayerLoaded"
                        :videoWidth="videoWidth"
                        :NBAction="NBAction"
                        :playList="[]"
                        :playMode="0"
                    ></n-b-video>
                </div>
            </div>
            <ul>
                <li v-for="(item, index) in msgList"
                    :key="item.id"
                >
                    <span class="time">{{ subStringTime(item.sendTime) }}</span>
                    <span class="msg"> {{ item.fromCourt }}{{ item.content }}  {{ item.otherExplain }}</span>
                    <a-button type="primary" v-if="item.status && item.status == 1" disabled>
                        已处理
                    </a-button>
                    <a-button type="primary" v-else @click="handleMsg(item.id,index)">
                        未处理
                    </a-button>
                </li>
            </ul>
        </div>

    </div>
</template>

<script>

import { mapActions } from 'vuex';
import NBVideo from '@/views/plugins/NBVideo';
import {stompClient, disconnectSocket, connectSocket,  startSubscribeFn, sendMsgFn, cancelSubscribeFn} from '@/utils/SocketJS';
export default {
    name: 'MsgList',
    components: {
        NBVideo
    },
    data() {
        return {
            isShowMsgBox: false, // 是否显示消息提示框
            isHandle: false, // 消息是否已处理
            msgList: [],  // 当天消息列表
            showPlayer: false,
            videoWidth: 500,
            NBAction: '',
            url: {
                urls: [], // 复合画面地址
                liveUrl: '' // 直播流地址
            },
            courtList: [], // 法庭列表
            currentCourt: {},
            isShowCourtList: false, // 是否显示法庭下拉列表
            token: ''
        };
    },
    mounted() {
        this.init();
        window.addEventListener('beforeunload', this.handleBeforeUnload, false);

    },
    beforeDestroy: function() {
        this.handleBeforeUnload();
        window.removeEventListener('beforeunload', this.handleBeforeUnload, false);


    },
    methods: {
        // 接口引入
        ...mapActions({
            getTodayMsgData: 'modulePolice/getTodayMsgData',
            handleMsgById: 'modulePolice/handleMsgById',
            getCourtListWithLiveUrl: 'modulePolice/getCourtListWithLiveUrl',
            getLiveUrlByCourtRoomId: 'moduleJudge/getLiveByRoomId'
        }),
        async init() {
            // 先订阅成功在初始化页面
            console.log('MsgList---init---stompClient', stompClient);
            await this.initSocketJS();
            console.log('MsgList---initSocketJS---stompClient', stompClient);

            await this.getMsgList();
            console.log('MsgList---this.msgList', this.msgList);
            await this.getCourtList(true);

        },
        handleBeforeUnload() {
            this.resetVideo();
            this.socketJSCancelSubscribe(stompClient);
        },
        getMsgList() {
            this.getTodayMsgData().then((res) => {
                if (res.code === 0) {
                    console.log('getMsgList');
                    this.msgList = res.data ? res.data : [];
                }
            });
        },
        // 处理某条消息
        handleMsg(id, index) {
            this.handleMsgById(id).then((res) => {
                if (res.code === 0) {
                    this.$nextTick(() => {
                        this.msgList[index].status = 1;
                    });
                }
            });
        },
        // 接收到消息
        handleRecievedMsg(data) {
            this.resetVideo();
            if (data.type === 2) {
                this.$refs.alarmAudio.play();
            }
            let _this = this;
            this.$CusTips({
                content: `${data.courtName}${data.content}`,
                type: data.type,
                autoClose: data.type === 1,
                ok: () => {
                    if (data.type === 2 && !_this.$refs.alarmAudio.paused) {
                        _this.$refs.alarmAudio.pause();
                    }
                }
            });
            this.getMsgList();
            let index = this.courtList.findIndex((p) => { return p.courtroomId === data.CourtRoomId });
            this.handleCourtClick(index);
        },
        subStringTime(value) {
            let moment = value.substring(value.indexOf(' '));
            return moment.substring(0, moment.lastIndexOf(':'));
        },
        /** *************************直播start***************************/
        videoPlayerLoaded() {
            this.$emit('emitHideLoadingIframe');
        },
        // 获取法庭列表
        async getCourtList(isInit) {
            let res = await this.getCourtListWithLiveUrl();
            if (res.code === 0) {
                console.log('getCourtList', res.data);
                this.courtList = res.data;
                if (isInit) {
                    this.handleCourtClick(0);
                    this.videoWidth = this.$refs.videoBox.clientWidth;
                    this.showPlayer = true;
                }
            } else {
                this.$message.error('获取直播流失败');
            }
        },

        // 关闭直播流
        stopVideo() {
            this.NBAction = `stopVideonum${Date.now()}`;
        },
        resetVideo() {
            // 先关闭直播流
            if (this.url.liveUrl !== '') {
                this.stopVideo();
            }
        },
        // 切换法庭下拉列表
        toggleCourtList() {
            this.isShowCourtList = !this.isShowCourtList;
        },
        // 切换直播流
        async handleCourtClick(index) {
            if (index === -1) {
                this.$message.error('找不到该法庭');
                return;
            }
            let res = await this.getLiveUrlByCourtRoomId({courtroomId: this.courtList[index].courtroomId});

            if (res.code !== 0) {
                this.$message.error('获取法庭直播流失败');
                return;
            }
            if (!res.data.liveUrl) {
                this.$message.error('该法庭设备未开启或未配置！');
                return;
            }

            // 切换之前如果前面有视频播放先关闭之前的播放
            this.resetVideo();

            this.currentCourt = this.courtList[index];
            this.url.liveUrl = res.data.liveUrl;
            this.url.urls = [];
            this.NBAction = `playnum${new Date().getTime()}`;
        },
        /** *************************直播end***************************/

        /** *************************消息通信start***************************/
        async initSocketJS() {
            let _this = this;
            if (stompClient && stompClient.connected) {
                await this.socketJSSubscribeMsg(stompClient);
            }
            else {
                try {
                    let res = await connectSocket(this.tokenGet);
                    console.log('MsgList---stompClient--resolve', res);
                    if (res && res.connected) {
                        await _this.socketJSSubscribeMsg(stompClient);
                    }
                    else {
                        setTimeout(() => {
                            _this.initSocketJS();
                        }, 500);
                    }
                } catch (res) {
                    console.log('MsgList---stompClient---reject', res);
                    setTimeout(() => {
                        _this.initSocketJS();
                    }, 20);
                }
            }
        },
        socketJSSubscribeMsg(stompClient) {
            let _this = this;
            startSubscribeFn(`/bailiffHelper/message`, function(params) {
                let data = JSON.parse(params.body);
                _this.handleRecievedMsg(data);
            }, {id: 'N', token: _this.token}, stompClient);


            console.log('订阅完成', stompClient);
        },
        socketJSCancelSubscribe(stompClient) {
            if (!stompClient || !stompClient.connected) {
                return false;
            }
            cancelSubscribeFn('N', stompClient);
            disconnectSocket(stompClient);
        }

        /** *************************消息通信end***************************/
    }
};

</script>

<style lang="less" scoped type="text/less">
    @lh_height: 45px;
.main-content {
    position: relative;
    width: 100%;
    height: 100%;
    font-size: @font26px;
    background: url(../../assets/images/bg.png) no-repeat top center;
    background-size: 100% 100%;
    .header {
        height: @trial_top_menu_h;
        padding: 40px 40px 30px 40px;
        color: #fff;
        .icon {
            height: 40px;
            vertical-align: sub;
        }
        .name {
            font-size: @font38px;
            margin-right: 30px;
        }
    }
    .content {
        padding: 20px 40px 40px;
        height: calc(100% - @trial_top_menu_h);
        background-color: @bg_box ;
        .left {
            float: left;
            width: 65%;
            height: 100%;
            .left-header {
                height: 60px;
                font-size: @font30px;
                display: flex;
                justify-content: space-between;
                .court-list {
                    width: 320px;
                    height: 350px;
                    position: relative;
                    z-index: 99;
                    font-size: @font24px;
                    ul {
                        position: absolute;
                        top: @lh_height + 5px;
                        left: 0;
                        right: 0;
                        max-height: 300px;
                        overflow-y: auto;
                        background-color: #fff;
                        border-radius: 3px;
                        li {
                            height: @lh_height;
                            line-height: @lh_height;
                            padding: 0 25px;
                            cursor: pointer;
                            &:hover {
                                background-color: #F5F7FA;
                            }
                        }
                    }
                    .combo {
                        display: flex;
                        align-items: center;
                        background-color: #fff;
                        border: 1px solid #C0C4CC;
                        padding: 0 10px;
                        border-radius: 3px;
                        cursor: pointer;
                        i {
                            height: @lh_height;
                            line-height: @lh_height;
                            &.full-circle {
                                &:before {
                                    content: '';
                                    display: inline-block;
                                    width: 8px;
                                    height: 8px;
                                    border-radius: 50%;
                                    vertical-align: middle;
                                    background-color: #04F900;
                                }
                            }
                        }
                        & > div {
                            flex: 1;
                            padding: 0 5px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                }
            }
            .video-box {
                width: 100%;
                height: calc(100% - 80px);
                position: relative;
                .list {
                    position: absolute;
                    width: 150px;
                    top: 15px;
                    right: 15px;
                    color: #fff;
                    z-index: 1999;
                    cursor: pointer;
                }
            }
        }

        & > ul {
            float: left;
            width: 33%;
            height: 100%;
            color: #0255E7;
            font-size: @font28px;
            margin: 0 0 0 2%;
            border-radius: 5px;
            overflow-y: auto;
            li {
                display: flex;
                align-items: center;
                margin: 15px 0;
                .msg {
                    flex: 1;
                    margin: 0 40px;
                }
                button[disabled] {
                    background-color: #909399;
                    color: #fff;
                }
            }
        }
    }
}
</style>
