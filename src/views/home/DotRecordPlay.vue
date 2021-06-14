<!--
 * @Descripttion: 打点列表播放---videojs播放器播放打点记录
 * @Author: zhangt
 * @Date: 2021-05-07 13:23:03
 * @Last Modified by: zhangt
 * @Last Modified time: 2021-05-12 17:44:48
-->

<template>
  <div class="full-height" ref="dotPage">
    <div class="video-box" v-if="showVideo" ref="videoPlayerBox">
        <video-player
        class="vjs-custom-skin video-player"
        ref="videoPlayer"
        :options="playerOptions"
        @loadeddata="onPlayerLoadeddata($event)"
        @canplay="onPlayerCanplay($event)"
        @ended="onPlayerEnded($event)"
        @timeupdate="onPlayerTimeUpdate($event)"
        ></video-player>
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

export default {
    components: {
    },
    data() {
        return {
            showVideo: false,
            showList: false,
            activeIndex: -1,
            curPlayIndex: -1,
            styleObject: {
                height: '3rem'
            },
            playList: [],
            playerOptions: {
                width: "100%",
                techOrder: ['html5', 'flash'], // 兼容顺序,使用flash播放，可以播放flv格式的文件
                playbackRates: [0.7, 1.0, 1.5, 2.0], // 播放速度
                autoplay: false, // 如果true,浏览器准备好时开始回放
                notSupportedMessage: '此视频暂无法播放!', // 无法播放时显示的信息
                sourceOrder: true,
                loop: false, // 导致视频一结束就重新开始。
                // preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                muted: true, // 默认情况下将会消除任何音频。
                language: 'zh-CN',
                // aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                hls: true, // 启用hls？
                flash: {
                    hls: { withCredentials: false }
                },
                html5: { hls: { withCredentials: false } },
                sources: [
                    // {
                    //     type: 'application/x-mpegURL',
                    //     src: 'http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8'
                    // },
                    // {
                    //     type: 'application/x-mpegURL',
                    //     src: 'http://172.19.82.247/vod/2.mp4'
                    // },
                    // {
                    //     // withCredentials: true，
                    //     type: 'application/x-mpegURL', // hls
                    //     src: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8' // url地址
                    // }
                    // {
                    //     type: 'rtmp/flv', // rtmp
                    //     src: `rtmp://172.19.82.228:1960/NBVod/mp4|D:\\SNTest\\1\\2`// rtmp
                    // }
                    // {
                    //     type: 'rtmp/flv', // rtmp
                    //     src: `rtmp://58.200.131.2:1935/livetv/hunantv`
                    // }
                    // {
                    //     type: 'video/mp4', // 资源格式写法：'video/mp4'，否则控制台会出现notSupportedMessage设置的错误
                    //     src: 'https://cdn.theguardian.tv/webM/2015/07/20/150716YesMen_synd_768k_vp8.webm' // url地址
                    // }
                ],
                // poster: '/static/images/author.jpg', // 你的封面地址
                // width: document.documentElement.clientWidth,
                // height: document.documentElement.clientHeight, // 设置高度，fluid需要设置成flase
                // 配置控制栏
                controlBar: {
                    volumePanel: {
                        inline: false // 音量调节是否水平
                    },
                    currentTimeDisplay: true, // 当前播放位置
                    timeDivider: true, // 时间分割线
                    durationDisplay: true, // 总时间
                    progressControl: true, // 进度条
                    remainingTimeDisplay: false, // 剩余时间
                    fullscreenToggle: true // 全屏按钮
                }
            },
            listData: []
        };
    },
    computed: {
      player() {
        return this.$refs.videoPlayer.player;
      },
      isShowDotList() {
          return this.comm.isTrialAuthorizeShow('trial:record:dotList');
      }
    },
    mounted() {
        // this.$emit('emitShowLoadingIframe');

        this.showVideo = true;
        this.$nextTick(() => {
            this.initListHeight();

        });

    },
    methods: {
        ...mapActions('moduleJudge', ['findListDot', 'deleteDot', 'queryRecordList']),

        initListHeight() {
            setTimeout(() => {
                let videoHeight = this.$refs.videoPlayerBox.clientHeight;
                let pageHeight = this.$refs.dotPage.clientHeight;
                let titleHeight = this.$refs.title.clientHeight;
                this.styleObject = {
                    height: pageHeight - videoHeight - titleHeight - 50 + 'px'
                };
                this.reqDotList();
                this.showList = true;
                console.log('videoHeight', videoHeight, pageHeight);
            }, 20);
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
                    this.recordList = res.data.recordList
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
        // 1word跳转到打点处
        // 2开始播放打点处的视频
        playDot(index) {
            this.activeIndex = index;
            if (!this.playerOptions.autoplay) {
                this.playerOptions.autoplay = true;
            }
            // 视频播放---触发地址改变
            let playUrl = this.listData[index].httpUrl.replace(/\\/g, '/');
            console.log('playUrl', playUrl);
            let playParams = {
                type: 'video/mp4', // http
                src: playUrl
            };
            // 从后台获取视频打点时间
            this.videoDot=Number(this.listData[index].timeStamp);//设置打点
            //this.action=`stopVideonum${new Date().getTime()}`;
            //播放列表改变会触发定点播放列表播放
            //this.playList=[playUrl,`rtmp://58.200.131.2:1935/livetv/hunantv`]
            this.videoPlay(playParams)

            // 文档打点
            this.$emit('emitDotLinkTo', this.listData[index].dotTimeStamp);

        },

        videoPlay(params) {
            // this.playerOptions.sources = [
            //     {
            //         type: 'video/mp4',
            //         src: url
            //     }
            // ];
            this.playerOptions.sources = [
                params
            ];
            this.player.play();
        },

        // 视频加载完成---改变视频播放的起点--即为视频打点的位置
        onPlayerLoadeddata(player) {
            console.log('Loadeddata>视频加载完成!', player);
            this.player.currentTime(this.videoDot);
        },

        // 可以播放视频
        onPlayerCanplay(player) {
            console.log('Canplay>可以播放视频!', player);

        },
        // 视频播放时间更新事件
        onPlayerTimeUpdate(player) {
            // console.log('timeUpdate>播放时间更新!', player);
            // let curTime = this.player.currentTime();
            // console.log(curTime);
        },
        // 视频播放结束--自动播放下段视频
        onPlayerEnded(player) {
            console.log('Ended>视频播放结束!', player);
            console.log('this.activeIndex', this.activeIndex);
            if (this.activeIndex >= this.listData.length - 1) {
                return false;
            }
            // else {
            //     ++this.activeIndex;
            //     this.videoPlay(this.listData[this.activeIndex]);
            // }
            // this.videoPlay(require('../../../public/video/1.mp4'));

        },
    }
};
</script>

<style  scoped lang="less" type="text/less">
.video-player {
    width: 100%;
    height: 100%;
}
.content-box{
  font-size: @font24px;
  padding:0 20px;
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