/* 庭审直播
 * @Author: ShiHuiJun
 * @Date: 2021-01-18 11:04:12
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-19 15:04:38
 */

<template>
    <div class="main-content full-height">
        <trial-living-header></trial-living-header>
        <div class="content">
            <div class="left page-box full-height">
                <div class="page-top">
                    <div class="page-title">
                        <div class="tab-title">
                            <div
                                class="tab-item"
                                @click="changeTab(0)"
                                :class="[activeTabIndex==0?'active':'']"
                            >法庭列表</div>
                        </div>
                    </div>
                </div>
                <div class="page-content" ref="pageContent">
                    <div class="tab-content" v-if="activeTabIndex==0">
                        <div class="search-box">
                            <el-input
                                placeholder="搜索"
                                prefix-icon="el-icon-search"
                                v-model="searchKey"
                                clearable
                                @input="fnSearch(searchKey)"
                            ></el-input>
                        </div>
                        <ul ref="courtList" class="courtList">
                            <li v-for="(item, index) in courtList" :key="index">
                                <a
                                    :class="{'txt-ellipsis':true,'active':activeCourtIndex===index}"
                                    :title="item.roomName"
                                    :disabled="String(item.status)==='0'"
                                    @click="handleCourtClick(item,index);"
                                >{{item.roomName}}</a>

                                <div
                                    :class="[
                                    'status-flag',
                                    `status-flag-${item.status}`
                                ]"
                                >{{ String(item.status)==='1'?'庭审中':'空闲' }}</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="right-top">
                    <span>案号:{{caseCode}}</span>
                </div>
                <div class="right-content video-box" ref="videoBox">
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
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import TrialLivingHeader from '@/components/header/TrialLivingHeader';
import NBVideo from '@/views/plugins/NBVideo';
import { debounce } from '@/utils/utils';
export default {
    name: 'TrialLiving',
    components: {
        TrialLivingHeader,
        NBVideo
    },
    data() {
        return {
            activeTabIndex: 0,
            caseCode: '', // (2020)浙0302民初2881号
            searchKey: null,
            activeCourtIndex: -1,
            // 法庭列表
            courtList: [
                /* {
                    liveUrl: 'rtsp://admin1:admin1@172.19.82.241:554/cam/realmonitor?channel=21&subtype=0',
                    roomName: '第一法庭',
                    status: 1
                } */
            ],
            /* 南北播放器 */
            isLoaded: false,
            showPlayer: false,
            videoWidth: 500,
            NBAction: '',
            url: {
                urls: [], // 复合画面地址
                liveUrl: '' // 直播流地址 rtsp://admin1:admin1@172.19.82.241:554/cam/realmonitor?channel=21&subtype=0
            }
        };
    },
    mounted() {
        this.initNBVideo();
        this.getCourtList({});
    },
    beforeDestroy() {
        console.log('TrialLiving---beforeDestroy');
        this.resetVideo();
    },
    methods: {
        // 接口引入
        ...mapActions({
            getLiveGroupByRoom: 'moduleJudge/getLiveGroupByRoom',
            getLiveByRoomId: 'moduleJudge/getLiveByRoomId'
        }),

        // 获取法庭列表
        getCourtList(params) {
            this.getLiveGroupByRoom(params).then((res) => {
                if (res.code === 0) {
                    this.courtList = res.data;
                }
            });
        },

        // 根据法庭id获取庭审中的案件以及直播地址
        reqGetLiveByRoomId(params) {
            this.getLiveByRoomId(params).then((res) => {
                if (res.code === 0) {
                    this.caseCode = res.data.caseCode;
                    this.playVideo({
                        liveUrl: res.data.liveUrl,
                        urls: res.data.urls || []
                    });
                }
            });
        },

        // 搜索
        fnSearch: debounce(function(key) {
            this.getCourtList({ keyword: this.searchKey });
        }, 500),

        // 切换直播流
        handleCourtClick(item, index) {
            this.activeCourtIndex = index;
            this.reqGetLiveByRoomId({courtroomId: item.courtroomId});
        },

        /* --------------------南北播放器-开始-------------------- */
        // 初识化播放器
        initNBVideo() {
            this.$emit('emitShowLoadingIframe');
            setTimeout(() => {
                this.videoWidth = this.$refs.videoBox.clientWidth;
                console.log('videoWidth', this.videoWidth);
                this.showPlayer = true;
            }, 20);
        },

        // 播放器加载完成
        videoPlayerLoaded() {
            this.$emit('emitHideLoadingIframe');
            this.isLoaded = true;
        },

        // 关闭直播流
        resetVideo() {
            if (this.url.liveUrl) {
                this.NBAction = `stopVideonum${Date.now()}`;
            }
        },

        // 播放直播流
        playVideo(url) {
            // this.url.liveUrl = 'rtsp://admin1:admin1@172.19.82.241:554/cam/realmonitor?channel=21&subtype=0';
            this.url.liveUrl = url.liveUrl;
            this.url.urls = url.urls;
            this.NBAction = `playnum${new Date().getTime()}`;
        }
        /* --------------------南北播放器-结束-------------------- */
    }
};
</script>

<style lang="less" scoped type="text/less">
@lh_height: 45px;
.main-content {
    font-size: @font28px;
    background: url('@{base_url}/bg.png') no-repeat top center;
    background-size: 100% 100%;
    .content {
        width: 2480px;
        margin: 0 auto;
        height: calc(100% - @top_menu_h - 40px);
        background-color: @bg_box;
        display: flex;
        .left {
            width: 21%;
            border-right: 1px solid @text_color_white;
        }
        .right {
            flex: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 0 20px;
            .right-top {
                line-height: 60px;
                font-size: @font30px;
            }
            .right-content {
                flex: 1;
                margin-bottom: 20px;
                overflow-y: hidden;
            }
            .video-box {
                height: 0;
                width: 100%;
            }
        }
    }
}

.page-content {
    padding: 30px 0;
}

.tab-title {
    overflow: hidden;
    .tab-item {
        padding: 0 10px;
        text-align: center;
        float: left;
        cursor: pointer;
        border-bottom: 3px solid transparent;
    }
    .active {
        color: @border_color_area;
        border-bottom: 3px solid @border_color_area;
    }
}
.tab-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.search-box {
    font-size: @font24px;
    margin-bottom: 25px;
    padding: 0 30px;
    /deep/.el-input {
        .el-input__inner {
            height: 46px;
            line-height: 46px;
            padding: 0 30px 0 60px;
        }
        .el-input__prefix {
            left: 20px;
            .el-input__icon {
                line-height: 48px;
            }
        }
        .el-input__suffix {
            .el-input__icon {
                line-height: 48px;
            }
        }
    }
}

ul.courtList {
    flex: 1;
    line-height: 40px;
    padding: 0 30px;
    overflow-y: auto;
    li {
        display: flex;
        align-items: center;
        &:not(:last-child) {
            margin-bottom: 20px;
        }
        a {
            color: @text_color_black;
            flex: 1;
            margin-right: 10px;
            &.active {
                color: @color_primary;
            }
            &[disabled] {
                color: @text_color_black_75;
            }
        }
        .status-flag {
            font-size: @font24px;
            color: @text_color_white;
            width: 100px;
            text-align: center;
            &.status-flag-0 {
                background: #f0d463;
            }
            &.status-flag-1 {
                background: #27c742;
            }
        }
    }
}
</style>
