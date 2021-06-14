/* 打点列表---播放器播放直播画面
 * @Author: nihc
 * @Date: 2020-09-25 17:31:48
 * @Last Modified by: nihc
 * @Last Modified time: 2021-03-01 11:48:49
 */

<template>
  <div class="RecordPlay full-height  pos-r" ref="dotPage">
    <div class="video-box" v-if="showVideo" ref="videoPlayerBox">
       <n-b-video
            v-if="isNB"
            :url="url"
            :isShowVideo="showPlayer"
            @videoPlayerLoaded="videoPlayerLoaded"
            :videoWidth="videoWidth"
            :playMode="playMode"
            :Dot="videoDot"
            :playList="playList"
            :NBAction="NBAction"
            >
        </n-b-video>
        <flv
            v-else
            :url="url"
            :isShowVideo="showPlayer"
            @videoPlayerLoaded="videoPlayerLoaded"
            :videoWidth="videoWidth"
            :playMode="playMode"
            :Dot="videoDot"
            :playList="playList"
            :NBAction="NBAction"
        ></flv>
    </div>
    <div class="content-box" >
      <div class="title" ref="title">打点列表</div>
      <div class="content-body" :style="styleObject">
        <ul v-if="showList">
          <li v-for="(item,index) in listData" :key="index"
          :class="{'clearfix':true,'active':index==activeIndex}"
          @click="playDot(index)"
          >
            <a-icon type="play-square" theme="filled" style="color:#0255E7" class="fl"/>
            <div class="fl">{{item.createTime}}{{item.descr.substr(0,10)}}</div>
            <div class="fr font-color-error" v-if="isShowDotList" @click="handleDelete(item.id)">删除</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { IEVersion } from '@/utils/utils';
import NBVideo from '@/views/plugins/NBVideo';
import Flv from '@/views/plugins/Flv.vue';
export default {
    components: {
        NBVideo,
        Flv
    },
    props: {
        DotListAction: {
            type: String,
            default: ''
        },
        trialStatus: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            showPlayer: false,
            videoWidth: 500,
            playMode: 0, // 0直播1点播
            playList: [],
            NBAction: '',
            url: {
                urls: [], // 复合画面地址
                liveUrl: '' // 直播流地址
            },
            isLoaded: false,
            showVideo: false,
            showList: false,
            activeIndex: -1,
            styleObject: {
                height: '3rem'
            },
            videoDot: 0, // 视频的打点默认60s
            listData: []
        };
    },
    computed: {
        // 合并监听
        listenChange() {
            console.log('RecordPlay---computed listenChange');

            const {trialStatus, isLoaded} = this;
            return {
                trialStatus, isLoaded
            };
        },
        isShowDotList() {
            return this.comm.isTrialAuthorizeShow('trial:record:dotList');
        },
        isNB() {
            // ie使用nb播放器，其他用flv
            return !(navigator.platform.indexOf('Linux') > -1 || IEVersion() === -1)
        }
    },
    watch: {
        DotListAction: {
            handler(newVal) {
                let actionStr = newVal.split('num')[0];
                let _this = this;
                if (actionStr == 'updateDotList') {
                    _this.reqDotList();
                }
            },
            deep: true,
            immediate: true
        },
        listenChange: {
            handler(newVal, oldVal) {
                let _this = this;

                this.$nextTick(() => {
                    console.log('RecordPlay---listenChange', newVal, oldVal);
                    // debugger;

                    if (newVal.isLoaded) {
                        if (newVal.trialStatus == '1') {
                            _this.getLiveUrl();
                        } else {
                            _this.stopVideo();
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
                // this.$nextTick(() => {
                //     if (_this.trialStatus == '1') {
                //         _this.getLiveUrl();
                //     } else {
                //         _this.stopVideo();
                //     }
                // });
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {

        this.showVideo = true;
        this.$nextTick(() => {
            this.initListHeight();

        });

    },
    beforeDestroy() {
        console.log('RecordPlay---beforeDestroy');
    },
    methods: {
        ...mapActions('moduleJudge', ['findListDot', 'deleteDot', 'queryRecordList', 'getLiveAddress']),

        videoPlayerLoaded() {
            this.$emit('emitHideLoadingIframe');
            this.isLoaded = true;
        },
        initListHeight() {

            setTimeout(() => {
                this.videoWidth = this.$refs.videoPlayerBox.clientWidth;
                console.log('videoWidth', this.videoWidth);
                this.$emit('emitShowLoadingIframe');

                this.showPlayer = true;
                let videoHeight = this.$refs.videoPlayerBox.clientHeight;
                let pageHeight = this.$refs.dotPage.clientHeight;
                let titleHeight = this.$refs.title.clientHeight;
                this.styleObject = {
                    height: pageHeight - videoHeight - titleHeight - 50 + 'px'
                };
                this.showList = true;
                console.log('videoHeight', videoHeight, pageHeight);
                this.reqDotList();
            }, 20);


        },
        // 获取直播流
        getLiveUrl() {
            this.getLiveAddress({trialId: this.$route.query.trialId}).then((res) => {
                if (res.code === 0) {
                    this.url.liveUrl = res.data.url;
                    // this.url.liveUrl = 'rtsp://admin1:admin1@172.19.82.241:554/cam/realmonitor?channel=21&subtype=0';
                    this.url.urls = res.data.urls || [];
                    this.NBAction = `playnum${new Date().getTime()}`;
                } else {
                    this.$message.error('获取直播流失败');
                }
            });
        },
        // 关闭直播流
        stopVideo() {
            //
            this.NBAction = `stopVideonum${Date.now()}`;
        },
        // 获取播放列表---封装播放列表
        reqRecordList() {
            let params = {
                trialId: this.$route.query.trialId
            };
            let _this = this;
            this.queryRecordList(params).then((res) => {
                if (res.code == 0) {
                    console.log(res);

                    let recordList = res.data.recordList;
                    for (let i = 0; i < recordList.length; i++) {
                        _this.playList.push({
                            type: 'rtmp/flv', // rtmp
                            src: recordList[i].url.replace(/\//g, '/')
                        });
                    }
                }
            });
        },
        // 获取打点列表
        reqDotList() {
            let params = {
                trialId: this.$route.query.trialId
            };
            let _this = this;
            // 获取打点列表数据
            this.findListDot(params).then((res) => {
                if (res.code == 0) {
                    console.log('获取打点列表数据', res.data);
                    _this.listData = res.data;
                }
            });
        },
        handleDelete(id) {
            this.deleteDot({id: id}).then(res => {
                this.$message.success('删除成功');
                this.reqDotList();
            });

        },
        // 1word跳转到打点处
        // 2开始播放打点处的视频
        playDot(index) {
            this.activeIndex = index;

            // 视频播放---触发地址改变
            // let playUrl = this.listData[index].recordFile.replace(/\\/g, '/');
            // console.log('playUrl', playUrl);
            // this.url.liveUrl = playUrl;
            // this.url.liveUrl = `rtmp://172.19.82.228:1960/NBVod/mp4|D:\\SNTest\\1\\2`;
            // this.url.liveUrl=`rtmp://58.200.131.2:1935/livetv/hunantv`;
            // 从后台获取视频打点时间
            // this.videoDot=this.listData[index].timeStamp;//设置打点

            // this.videoDot=60;//设置打点
            // this.action=`DotPlaynum${new Date().getTime()}`;

            // 文档打点
            this.$emit('emitDotLinkTo', this.listData[index].dotTimeStamp);

        }

    }
};
</script>

<style  scoped lang="less" type="text/less">
.RecordPlay{
    display: flex;
    flex-direction: column;
    .video-box {
        width: 100%;
        height: 0;
        padding-bottom: 60%;
    }
}
.content-box{
  font-size: @font24px;
  padding:0 20px;
  flex:1;
  .title{
    height: 60px;
    line-height: 60px;
    font-size: @font28px;
  }
  .content-body{
    overflow-y: auto;
    ul{
      li{
        font-size: @font24px;
        cursor: pointer;
        /deep/.anticon{
          margin: 6px 6px 6px 0;
        }
        &.active{
          color:@color_primary;
        }
        margin: 10px 0;
      }
    }
  }
}
</style>
