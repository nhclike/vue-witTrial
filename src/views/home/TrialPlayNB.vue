/* 庭审后页面---庭审点播---点播列表---nb播放器
 * @Author: nihc
 * @Date: 2020-09-25 17:31:48
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-11 15:11:04
 */

<template>
  <div class="RecordPlay full-height  pos-r" ref="dotPage">
    <div class="video-box" v-if="showVideo" ref="videoPlayerBox">
       <n-b-video
            :url="url"
            @videoPlayerLoaded="videoPlayerLoaded"
            :videoWidth="videoWidth"
            :isShowVideo="showPlayer"
            :playMode="playMode"
            :playList="playList"
            :NBAction="NBAction"
            ></n-b-video>

    </div>
    <div class="content-box" >
      <div class="title" ref="title">点播列表</div>
      <div class="content-body" :style="styleObject">
        <ul v-if="showList">
          <li v-for="(item,index) in recordList" :key="index"
          :class="{'clearfix':true,'active':index==activeIndex}"
          @click="playVideo(index)"
          >
            <a-icon type="play-square" theme="filled" style="color:#0255E7" class="fl"/>
            <div class="fl">{{item.fileName}}</div>
            <!-- <div class="fr">{{item.createTime}}</div> -->
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import NBVideo from '@/views/plugins/NBVideo';

export default {
    components: {
        NBVideo
    },
    data() {
        return {
            showPlayer: false,
            videoWidth: 500,
            playMode:0,//0直播1点播
            NBAction:'',
            playList:[],
            url: {
                urls: [], // 复合画面地址
                liveUrl: '' // 直播流地址
            },
            showVideo: false,
            showList: false,
            activeIndex: -1,
            styleObject: {
                height: '3rem'
            },
            recordList: [

            ]
        };
    },
    computed: {

    },
    mounted() {
        this.$emit('emitShowLoadingIframe');

        this.showVideo = true;
        this.$nextTick(() => {
            this.initListHeight();

        });

    },
    methods: {
        ...mapActions('moduleJudge', [ 'queryRecordList']),
        initListHeight() {
            setTimeout(() => {
                this.videoWidth = this.$refs.videoPlayerBox.clientWidth;
                this.playMode=1;//设置播放模式为点播
                console.log('TrialPlay---videoWidth', this.videoWidth);
                this.showPlayer = true;
                let videoHeight = this.$refs.videoPlayerBox.clientHeight;
                let pageHeight = this.$refs.dotPage.clientHeight;
                let titleHeight = this.$refs.title.clientHeight;
                this.styleObject = {
                    height: pageHeight - videoHeight - titleHeight - 50 + 'px'
                };
                this.showList = true;
                console.log('TrialPlay---videoHeight', videoHeight, pageHeight);
                this.init();
            }, 20);


        },
        init() {
            this.reqRecordList();
        },
        // 获取播放列表---封装播放列表
        reqRecordList() {
            let params = {
                trialId: this.$route.query.trialId
            };
            let _this = this;
            this.queryRecordList(params).then((res) => {
                if (res.code == 0) {
                    console.log('TrialPlay---queryRecordList',res);

                    _this.recordList = res.data.recordList;

                }
            });
        },

        videoPlayerLoaded() {
            this.$emit('emitHideLoadingIframe');
        },

        playVideo(index) {
            this.activeIndex = index;


            // vlc视频播放---触发地址改变
            let playUrl = this.recordList[index].fileUrl.replace(/\\/g, '/');
            console.log('TrialPlay---playUrl', playUrl);
            //this.url.liveUrl = `rtmp://172.19.82.228:1960/NBVod/mp4|D:\\SNTest\\1\\2`;
            //this.url.liveUrl = require('../../../public/video/1.mp4');


            this.url.liveUrl = playUrl;

            this.NBAction=`playnum${new Date().getTime()}`;

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
