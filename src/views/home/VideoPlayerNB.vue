/* 视频播放电子卷宗和影音证据的视频播放
 * @Author: nihc
 * @Date: 2020-09-25 17:31:48
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-11 14:42:02
 */

<template>
  <div class="full-height">
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
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import NBVideo from '@/views/plugins/NBVideo';

export default {
    components: {
        NBVideo
    },
    props:{
        filePlayUrl:{
            type:String,
            default:''
        }
    },
    data() {
        return {
            showPlayer: false,
            videoWidth: 500,
            playMode:1,//0直播1点播
            NBAction:'',
            url: {
                urls: [], // 复合画面地址
                liveUrl: '' // 直播流地址
            },
            showVideo: false,        
            videoDot:0, // 视频的打点默认60s
            playList: []
        };
    },
    computed: {
        
    },
    watch:{
      filePlayUrl:{
        handler(newVal,oldVal){
          console.log("filePlayUrl---newVal",newVal);
          let _this=this;
          this.$nextTick(function () {
            if(!!newVal){
                _this.showVideo = true;
                _this.$nextTick(() => {
                    _this.initListHeight();

                });
            }
          })
        },
        deep:true,
        immediate:true
      }
    },
    mounted() {
        console.log("VideoPlayerNB-----mounted")

    },
    updated(){
        console.log("VideoPlayerNB-----updated")

    },
    beforeDestroy(){
        console.log("VideoPlayerNB-----beforeDestroy")
        this.showVideo=false;
        this.showPlayer=false;
    },
    methods: {
       initListHeight() {
            this.videoWidth = this.$refs.videoPlayerBox.clientWidth;
            console.log('videoWidth', this.videoWidth);
            this.showPlayer = true;
            let _this=this;
            this.$nextTick(()=>{
                _this.url.liveUrl = this.filePlayUrl;    
                _this.url.urls = [];
                _this.NBAction=`playnum${new Date().getTime()}`;
            })
            


        },
        videoPlayerLoaded() {
            this.$emit('emitHideLoadingIframe');
        }
    }
};
</script>

<style  scoped lang="less" type="text/less">
/deep/.video-player .video-js{
    width: auto;
}
</style>
