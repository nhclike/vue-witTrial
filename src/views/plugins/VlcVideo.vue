/* Vlc播放插件
 * @Author: zhangt
 * @Date: 2020-09-03 17:47:08
 * @Last Modified by: nihc
 * @Last Modified time: 2020-09-30 11:50:16
 */

<template>
    <div id="nbVideo" class="nbVideo" ref="vlcVideo">
        <object
            class="vlcObj"
            type="application/x-vlc-plugin"
            id="vlc"
            events="True"
            classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921"
            codebase
        >
            <param name="mrl" />
            <param name="volume" value="50" />
            <param name="autoplay" value="true" />
            <param name="loop" value="false" />
            <param name="fullscreen" value="true" />
            <div v-if="videoError === '0'" class="notSupportVlc">
                您的浏览器不支持播放该视频,请使用IE浏览器!
            </div>
        </object>
    </div>
</template>

<script>
import { IEVersion } from '@/utils/utils';

export default {
    name: 'VlcVideo',
    props: {
        url: {
            type: Object,
            default: ''
        },
        videoWidth: {
            type: Number,
            default: 500
        }
    },
    data() {
        return {
            videoObj: null, // 视频对象
            videoError: '-1' // -1-可以正常播放,'0'-浏览器不支持, '1'-链接不存在,'2'-直播已结束
        };
    },
    watch: {
        url: {
            handler(newVal) {
                if (newVal.liveUrl && newVal.liveUrl !== '') {
                    this.play(newVal.liveUrl);
                    // eslint-disable-next-line no-empty
                } else {
                }
            },
            deep: true,
            immediate: true
        }
    },
    // eslint-disable-next-line no-empty-function
    mounted() {},
    methods: {
        play(mrl) {
            if (IEVersion() === -1) {
                this.videoError = '0';
            } else {
                let vlc = document.getElementById('vlc');
                let id = vlc.playlist.add(mrl);
                vlc.video.aspectRatio = '4:3'; // 获取和设置长宽比使用视频屏幕。该属性采用字符串作为输入值。有效值为：“1:1”，“4:3”，“16:9”，“16:10”，“221:100”和“5:4”
                let vlcW = this.videoWidth;
                let vlcH = vlcW / 1.666667;
                vlc.style.height = `${vlcH}px`;
                vlc.style.width = `${vlcW}px`;
                vlc.playlist.playItem(id);
            }
            setTimeout(() => {
                this.$emit('videoPlayerLoaded');
            }, 200);
        }
        
    }
};
</script>

<style type="text/less" lang="less" scoped>
.nbVideo {
    background-color: #000;
    width: 100%;
    height: 0;
    padding-bottom: 60%;
    position: relative;
}
.notSupportVlc {
    width: 100%;
    color: @text_color_white;
    text-align: center;
    margin-top: 200px;
    position: absolute;
    font-size: @font28px
}
</style>
