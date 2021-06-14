/*C组的网页播放器
 * @Author: nihc 
 * @Date: 2020-10-14 16:41:30 
 * @Last Modified by: nihc
 * @Last Modified time: 2020-10-14 18:53:02
 */

<template>
  <div>
    <div class="container" id="videoPlayer">
        <div class="sideBar">
            <span class="no-padding">
                <img src="img/home.png" class="left" id="btnHome" title="Visit My Homepage" onclick="window.open('https://blog.csdn.net/sonysuqin')" />
            </span>
        </div>
        <div class="canvasDiv">
            <div class="loadEffect" id="loading" style="display:none;">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <canvas id="playCanvas" width="852" height="480"></canvas>
        </div>
        <div class="sideBar">
            <span class="no-padding">
                <img src="img/play.png" class="left" id="btnPlayVideo" @click="playVideo()" />
            </span>
            <span class="no-padding" style=" padding-left:5px;">
                <img src="img/stop.png" class="left" id="btnStopVideo" @click="stopVideo()" />
            </span>
            <span class="track-padding">
            </span>
            <span class="no-padding">
                <input id="timeTrack" type="range" value="0">
            </span>
            <span class="no-padding" style=" padding-left:10px;">
                <label id="timeLabel">00:00:00/00:00:00</label>
            </span>
            <span class="no-padding right">
                <img src="img/fullscreen.png" class="right" id="btnFullscreen" @click="fullscreen()" />
            </span>
        </div>
    </div>
    <div id="footer">Copyright &copy; 2019 sonysuqin.All rights reserved.</div>
  </div>
</template>

<script>

import '../../../public/vPlayer/common.js';
import '../../../public/vPlayer/webgl.js';
// import '@/assets/vPlayer/webgl.js';
import '../../../public/vPlayer/pcm-player.js';
import {Player} from '../../../public/vPlayer/player';

export default {
  data(){
    return {
      videoFileUrl:require('../../../public/vPlayer/video/h265_high.mp4'),
      player:null
    }
  },
  mounted(){
    this.player=new Player()
  },
  methods:{
    playVideo(){
      let self=this;
      var el = document.getElementById("btnPlayVideo");
      var currentState = self.player.getPlayerState();
      if (currentState == playerStatePlaying) {
      el.src = "img/play.png";
      } else {
          el.src = "img/pause.png";
      }
            
		   if (currentState != playerStatePlaying) {
		       const canvasId = "playCanvas";	
               var canvas = document.getElementById(canvasId);
			   if (!canvas) {
			       logger.logError("No Canvas with id " + canvasId + "!");
			       return false;
               }
			   
			   self.player.play(videoFileUrl, canvas, function (e) {
		         console.log("play error " + e.error + " status " + e.status + ".");
				 if (e.error == 1) {
				   //logger.logInfo("Finished.");
				   var el = document.getElementById("btnPlayVideo");
                   el.src = "img/play.png";
				 }
               }); 	
               
               var timeTrack = document.getElementById("timeTrack");
               var timeLabel = document.getElementById("timeLabel");
               self.player.setTrack(timeTrack, timeLabel);			   
           }else {
               self.player.pause();
		   }		

           return true;
    },
    stopVideo() {
        let self=this;
        var el = document.getElementById("btnPlayVideo");
        el.src = "img/play.png";
        self.player.stop();
        /*var button = document.getElementById("btnPlayVideo");
        button.value = "Play";*/
    },
    fullscreen() {
        this.player.fullscreen();
    }
  }

}
</script>

<style>
.sideBar {
    width: 852px;
    height: 28px;
    outline: 2px solid rgba(0, 0, 0, 0.9);
    background-color: rgba(243, 244, 246, 0.9);
}

#btnHome:hover {
    transform: scale(1.4);
}

#btnPlayVideo:hover {
    transform: scale(1.2);
}

#btnStopVideo:hover {
    transform: scale(1.2);
}

#btnFullscreen:hover {
    transform: scale(1.3);
}

#videoPlayer {
    width: 852px;
    height: 536px;
    background-color: white;
    border: 2px solid rgba(0, 0, 0, 0.9);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    z-index: 10;
}

#timeTrack {
    margin: auto;
    width: 540px;
    height: 28px;
    line-height: 28px;
}

#timeLabel {
    margin: auto;
    padding-top: 0;
    font-size: 14px;
    width: 200px;
    height: 28px;
    line-height: 28px;
}

.loadEffect {
    width: 120px;
    height: 120px;
    position: absolute;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0; 
    z-index: 999;
}

.loadEffect span{
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: lightgreen;
    position: absolute;
    -webkit-animation: load 1.04s ease infinite;
}
@-webkit-keyframes load{
    0%{
        opacity: 1;
    }
    100%{
        opacity: 0.2;
    }
}
.loadEffect span:nth-child(1){
    left: 0;
    top: 50%;
    margin-top:-8px;
    -webkit-animation-delay:0.13s;
}
.loadEffect span:nth-child(2){
    left: 14px;
    top: 14px;
    -webkit-animation-delay:0.26s;
}
.loadEffect span:nth-child(3){
    left: 50%;
    top: 0;
    margin-left: -8px;
    -webkit-animation-delay:0.39s;
}
.loadEffect span:nth-child(4){
    top: 14px;
    right:14px;
    -webkit-animation-delay:0.52s;
}
.loadEffect span:nth-child(5){
    right: 0;
    top: 50%;
    margin-top:-8px;
    -webkit-animation-delay:0.65s;
}
.loadEffect span:nth-child(6){
    right: 14px;
    bottom:14px;
    -webkit-animation-delay:0.78s;
}
.loadEffect span:nth-child(7){
    bottom: 0;
    left: 50%;
    margin-left: -8px;
    -webkit-animation-delay:0.91s;
}
.loadEffect span:nth-child(8){
    bottom: 14px;
    left: 14px;
    -webkit-animation-delay:1.04s;
}

.canvasDiv {
    width: 852px;
    height: 480px
}

#playCanvas {
    width: 852px;
    height: 480px;
}

.no-padding {
    margin-top: 0px;
    padding-right: 0px;
    padding-left: 0px;
    padding-top: 0px;
    height: 28px;
    display: inline-block;
    float: left;
    vertical-align: middle;
}

.track-padding {
    padding-left: 0px;
    width: 50px;
    height: 28px;
    display: inline-block;
    float: left;
}

.left {
    width: 28px;
    float: left;
}

.right {
    width: 28px;
    float: right;
}

#footer {
    height: 40px;
    line-height: 40px;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    background: #F3F4F6;
    color: #000;
    font-family: Arial;
    font-size: 14px;
    letter-spacing: 1px;
}

</style>