/* 打点列表播放---南北播放器播放打点记录
 * @Author: nihc
 * @Date: 2020-09-25 17:31:48
 * @Last Modified by: nihc
 * @Last Modified time: 2021-03-01 11:47:49
 */

<template>
  <div class="RecordPlay full-height  pos-r" ref="dotPage">
    <div class="video-box" v-if="showVideo" ref="videoPlayerBox">
       <n-b-video
            :url="url"
            :isShowVideo="showPlayer"
            @videoPlayerLoaded="videoPlayerLoaded"
            :videoWidth="videoWidth"
            :playMode="playMode"
            :Dot="videoDot"
            :NBAction="NBAction"
            :playList="playList"
            >
        </n-b-video>
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
            videoDot: 60, // 视频的打点默认60s
            playList: [],
            listData: [
                // {
                //     'id': 1,
                //     'trialId': '12',
                //     'createTime': '2020-09-07 13:20:14',
                //     'recordFile': '222',
                //     'timeStamp': '123',
                //     'descr': '123435345'
                // },
                // {
                //     'id': 2,
                //     'trialId': '12',
                //     'createTime': '2020-09-07 13:20:14',
                //     'recordFile': '222',
                //     'timeStamp': '123',
                //     'descr': '123435345'
                // }
            ]
        };
    },
    computed: {
    
    },
    mounted() {
        this.showVideo = true;
        this.$nextTick(() => {
            this.initListHeight();

        });

    },
    computed: {
        
        isShowDotList() {
            return this.comm.isTrialAuthorizeShow('trial:record:dotList');
        }
    },
    methods: {
        ...mapActions('moduleJudge', ['findListDot', 'deleteDot', 'queryRecordList']),
        init() {
            this.reqDotList();
            //封装播放列表
            //this.reqRecordList();
        },
        initListHeight() {
            setTimeout(() => {
                this.videoWidth = this.$refs.videoPlayerBox.clientWidth;
                this.playMode=1;//设置播放模式为点播
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
                this.init();
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

                    let recordList = res.data.recordList.recordList;
                    for (let i = 0; i < recordList.length; i++) {
                        _this.playList.push(recordList[i].url.replace(/\//g, '/'));
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
        videoPlayerLoaded() {
            this.$emit('emitHideLoadingIframe');
        },
        // 1word跳转到打点处
        // 2开始播放打点处的视频
        playDot(index) {
            this.activeIndex = index;

            // 视频播放---触发地址改变
            let playUrl = this.listData[index].recordFile.replace(/\\/g, '/');
            console.log('playUrl', playUrl);
            this.url.liveUrl = playUrl; 
            //this.url.liveUrl = `rtmp://172.19.82.228:1960/NBVod/mp4|D:\\SNTest\\1\\2`;
            //this.url.liveUrl=`rtmp://58.200.131.2:1935/livetv/hunantv`;
            // 从后台获取视频打点时间
            this.videoDot=Number(this.listData[index].timeStamp);//设置打点
            //this.action=`stopVideonum${new Date().getTime()}`;
            //播放列表改变会触发定点播放列表播放
            //this.playList=[playUrl,`rtmp://58.200.131.2:1935/livetv/hunantv`]
            //this.videoDot=60;//设置打点
            
            this.NBAction=`DotPlaynum${new Date().getTime()}`;

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
