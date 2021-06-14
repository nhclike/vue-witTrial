//引入log;
import { Log } from "./log.js";
Log.setLogLevel(Log.info);

//Decoder states.
const decoderStateIdle          = 0;
const decoderStateOpen          = 1;
const decoderStateStart         = 2;
const decoderStateStop          = 3;
const decoderStateClose         = 4;
const decoderStateFinished      = 5;

//Player states.
const playerStateIdle           = 0;
const playerStatePlaying        = 1;
const playerStatePausing        = 2;

//Constant.
const maxVideoFrameQueueSize    = 20;
const minVideoFrameQueueSize    = 6;
const downloadSpeedByteRateCoef = 1.5;

/*function FileInfo(url) {
    this.url = url;
    this.size = 0;
    this.offset = 0;
    this.chunkSize = 65536;
}*/

function Player() {
	Log.info("Player","init...");
	this.initDecodeWorker();
	this.initDownloadWorker();
	this.pcmPlayer          = null;
	this.canvas             = null;
    this.webglPlayer        = null;
    this.callback           = null;
    this.audioQueue         = [];
    this.videoQueue         = [];
    this.videoStart         = 0;
	this.videoRendererTimer = null;
	
	this.decoderState       = decoderStateIdle;
    this.playerState        = playerStateIdle; //播放状态:默认0:未播放|1:播放中|2:暂停中
	this.beginTimeOffset    = 0;
	
	this.duration           = 0;
    this.videoWidth         = 0;
    this.videoHeight        = 0;
    this.yLength            = 0;
    this.uvLength           = 0;
	
	this.audioEncoding      = "";
    this.audioChannels      = 0;
    this.audioSampleRate    = 0;
	
//	this.fileInfo           = null;
	this.downloading        = false;
	
	this.loadingDiv         = null;
	this.timeLabel          = null;
    this.timeTrack          = null;
    this.trackTimer         = null;
    this.trackTimerInterval = 500;
    this.displayDuration    = "00:00:00";
	
	this.seeking            = false;
	this.audioTime          = 0;
};

import {MP4_Buffer} from "./mp4-buffer";
//初始化下载器
Player.prototype.initDownloadWorker = function () {
	var self = this;
    this.downloadWorker = new MP4_Buffer();
    this.downloadWorker.onmessage = function (evt) {
        var objData = evt.data;
        switch (objData.t) {
            case kFileData:
                self.onFileData(objData.d, objData.s, objData.f);
                break;
			case kDowndoaderSeekToRsp: 
                self.onSeekToRsp(1);
                break;
        }
    }
};

//接收数据
Player.prototype.onFileData = function (data,fileSize,flag) {	  
	  var objData = {
        t: kFeedDataReq,
        d: data,
		s: fileSize,
		f: flag
      };
      this.decodeWorker.postMessage(objData);
}; 
import {Decoder} from "./decoder";
//初始化解码器
Player.prototype.initDecodeWorker = function () {
	var self = this;
    this.decodeWorker =new Decoder();
	this.decodeWorker.onmessage = function (evt) {
		var objData = evt.data;
//		 Log.info("Player", "requestCallback..test.:"+objData.t);
        switch (objData.t) {
			case kInitDecoderRsp: // 0
		    //    self.onInitDecoder(objData);
                break;								
			case kOpenDecoderRsp: // 2
                self.onOpenDecoder(objData);
                break;
			case kVideoFrame: 
                self.onVideoFrame(objData);
                break;
            case kAudioFrame: 
                self.onAudioFrame(objData);
                break;
			case kDecoderStatusRsp: //11
                self.onDecoderState(objData);
                break;
			case kStartDownloadingReq: //12
                self.startDownloading();
                break;
            case kPauseDownloadingReq: //13
                self.pauseDownloading();
                break;
			case kStopDownloadingReq: //14 
                self.stopDownloading();
                break;
			case kRequestDataEvt:  //9
                self.onRequestData(objData.o);
                break;
	    }
	}
};

Player.prototype.onSeekToRsp = function (ret) {
    if (ret != 0) {
        this.justSeeked = false;
//        this.seeking = false;
		this.downloading = true;  //更新下载状态
//		this.startDecoding();
//		this.playerState = playerStatePlaying;     
        this.resume();
    }
};

//定位数据传递给下载器
Player.prototype.onRequestData = function (offset) {
	Log.info("Player","onRequestData...");
    if (!this.justSeeked) {
		return;
	}
	
	Log.info("Player","Request data: " + offset);
	var req = {
        t: kSeekDownloadFileReq,
		o: offset
    };
    this.downloadWorker.postMessage(req);
		
    //this.startDownloadTimer();
	//this.restartAudio();
	this.justSeeked = false;
};

//解码器状态
Player.prototype.onDecoderState = function (objData) {
	switch (objData.m) {
        case kStartDecodingRsp: 
            this.decoderState = decoderStateStart;
            break;
		case kStopDecodingRsp: 
            this.decoderState = decoderStateStop;
            break;
		case kCloseDecoderRsp: 
            this.decoderState = decoderStateClose;
            break;
		case kDecodeFinishedEvt: 		    			
            this.decoderState = decoderStateFinished;			
            break;
        default:
    }
}

//视频参数
Player.prototype.onVideoParam = function (v) {
    if (this.playerState == playerStateIdle) {
        return;
    }

    this.duration = v.d;
    this.videoWidth = v.w;
    this.videoHeight = v.h;
    this.yLength = this.videoWidth * this.videoHeight;
    this.uvLength = (this.videoWidth / 2) * (this.videoHeight / 2);
	
	if (this.timeTrack) {
        this.timeTrack.min = 0;
        this.timeTrack.max = this.duration;
        this.timeTrack.value = 0;
        this.displayDuration = this.formatTime(this.duration / 1000);
    }

    /*var byteRate = 1000 * this.fileInfo.size / this.duration;
    var targetSpeed = downloadSpeedByteRateCoef * byteRate;
    var chunkPerSecond = targetSpeed / this.fileInfo.chunkSize;
    this.chunkInterval = 1000 / chunkPerSecond;*/
};

//音频参数
Player.prototype.onAudioParam = function (a) {
    if (this.playerState == playerStateIdle) {
        return;
    }

    var sampleFmt = a.f;
    var channels = a.c;
    var sampleRate = a.r;

    var encoding = "16bitInt";
    switch (sampleFmt) {
        case 0:
            encoding = "8bitInt";
            break;
        case 1:
            encoding = "16bitInt";
            break;
        case 2:
            encoding = "32bitInt";
            break;
        case 3:
            encoding = "32bitFloat";
            break;
        default:
		    break;
            //this.logger.logError("Unsupported audio sampleFmt " + sampleFmt + "!");
    }

    this.pcmPlayer = new PCMPlayer({
        encoding: encoding,
        channels: channels,
        sampleRate: sampleRate,
        flushingTime: 5000
    });

    this.audioEncoding      = encoding;
    this.audioChannels      = channels;
    this.audioSampleRate    = sampleRate;
};

// 打开解码器
Player.prototype.onOpenDecoder = function (objData) {
    if (this.playerState == playerStateIdle) {
        return;
    }

    if (objData.e == 0) {
//		this.fileInfo.size = objData.s;
        this.onVideoParam(objData.v);
        this.onAudioParam(objData.a);
        this.decoderState = decoderStateOpen;
    } else {
        this.reportPlayError(objData.e);
    }
};

//重新开始播放音频
Player.prototype.restartAudio = function () {
    if (this.pcmPlayer) {
        this.pcmPlayer.destroy();
        this.pcmPlayer = null;
    }

    this.pcmPlayer = new PCMPlayer({
        encoding: this.audioEncoding,
        channels: this.audioChannels,
        sampleRate: this.audioSampleRate,
        flushingTime: 5000
    });
};

// 音频帧
Player.prototype.onAudioFrame = function (frame) {
    if (this.playerState != playerStatePlaying) {
        return;
    }

    if (this.seeking) {
        this.restartAudio();
        this.startTrackTimer();
        this.hideLoading();
        this.seeking = false;
    }

    switch (this.playerState) {
        case playerStatePlaying: //Directly display audio.
		    this.audioTime = frame.s;
            this.pcmPlayer.play(new Uint8Array(frame.d));
            break;
        case playerStatePausing: //Temp cache.
            this.audioQueue.push(new Uint8Array(frame.d));
            break;
        default:
    }
};

// 视频帧
Player.prototype.onVideoFrame = function (frame) {
    if (this.playerState != playerStatePlaying) {
        return;
    }	

   if (this.seeking) {
        this.restartAudio();
        this.startTrackTimer();
        this.hideLoading();
        this.seeking = false;
    }

    //Queue video frames for memory controlling.
    this.videoQueue.push(frame);
    if (this.videoQueue.length >= maxVideoFrameQueueSize) {
        if (this.decoding) { 
			Log.info("Player","maxVideoFrameQueueSize...");
            this.pauseDownloading();		
            this.stopDecoding();
        }
    }
};

// 播放错误处理
Player.prototype.reportPlayError = function (error, status, message) {
    var e = {
        error: error || 0,
        status: status || 0,
        message: message
    };

    if (this.callback) {
        this.callback(e);
    }
};

// 渲染视频帧
Player.prototype.renderVideoFrame = function (data) {
    this.webglPlayer.renderFrame(data, this.videoWidth, this.videoHeight, this.yLength, this.uvLength);
};

//视频播放
Player.prototype.displayLoop = function() {	
	this.videoRendererTimer = requestAnimationFrame(this.displayLoop.bind(this));
	
	if (this.videoQueue.length == 0) {
		if (this.decoderState == decoderStateFinished) {
			Log.info("Player","decoderStateFinished...");
			this.stop();
            this.reportPlayError(1, 0, "Finished");									
		}
        return;
    }	
	
	var frame = this.videoQueue[0];
    var audioTimestamp = this.pcmPlayer.getTimestamp() + this.beginTimeOffset;
//	var audioTimestamp = this.audioTime;
	
    var delay = frame.s - audioTimestamp;
	
//	 Log.info("Player","displayLoop..."+delay+" frame.s:"+frame.s+" audioTimestamp:"+audioTimestamp + "getTimestamp:"+this.pcmPlayer.getTimestamp()+"offset:"+this.beginTimeOffset);
	
	if (audioTimestamp <= 0 || delay <= 0) {
		var data = new Uint8Array(frame.d);
        this.renderVideoFrame(data);
        this.videoQueue.shift();

        if (this.videoQueue.length < minVideoFrameQueueSize && this.decoderState != decoderStateFinished) {
            if (!this.decoding) {
                //this.logger.logInfo("Image queue size < " + maxVideoFrameQueueSize / 2 + ", restart decoding.");
				this.startDownloading();
                this.startDecoding();
            }
        }

        /*if (this.videoQueue.length == 0) {
            if (this.decoderState == decoderStateFinished) {
                this.reportPlayError(1, 0, "Finished");
                this.stop();
            }
        }*/
	}
}

//定位
Player.prototype.seekTo = function(ms) {	
	Log.info("Player","seek time: " + ms);
	if (this.justSeeked) {
		return;
	}
    // Pause playing.
    this.pause();

    // Clear video queue.
    this.videoQueue.length = 0;

    // Clear audio queue.
    this.audioQueue.length = 0;

    // Request decoder to seek.
    this.decodeWorker.postMessage({
        t: kSeekToReq,
        ms: ms
    });

    // Reset begin time offset.
    //this.logger.logInfo("this.beginTimeOffset = -1");
    this.beginTimeOffset = ms / 1000;

    this.seeking = true;
    this.justSeeked = true;
    this.showLoading();
};

Player.prototype.setTrack = function (timeTrack, timeLabel) {
    this.timeTrack = timeTrack;
    this.timeLabel = timeLabel;

    if (this.timeTrack) {
        var self = this;
        this.timeTrack.oninput = function () {
            if (!self.seeking) {
                self.seekTo(self.timeTrack.value);
            }
        }
        this.timeTrack.onchange = function () {
            if (!self.seeking) {
                self.seekTo(self.timeTrack.value);
            }
        }
    }
};

Player.prototype.formatTime = function (s) {
    var h = Math.floor(s / 3600) < 10 ? '0' + Math.floor(s / 3600) : Math.floor(s / 3600);
    var m = Math.floor((s / 60 % 60)) < 10 ? '0' + Math.floor((s / 60 % 60)) : Math.floor((s / 60 % 60));
    var s = Math.floor((s % 60)) < 10 ? '0' + Math.floor((s % 60)) : Math.floor((s % 60));
    return result = h + ":" + m + ":" + s;
};

//更新进度条时间
Player.prototype.updateTrackTime = function () {
    if (this.playerState == playerStatePlaying && this.pcmPlayer) {
//        var currentPlayTime = this.pcmPlayer.getTimestamp() + this.beginTimeOffset;
		var currentPlayTime = this.audioTime;
        if (this.timeTrack) {
            this.timeTrack.value = 1000 * currentPlayTime;
        }
//		 Log.info("Player", "timestamp: " + currentPlayTime);		
        if (this.timeLabel) {
            this.timeLabel.innerHTML = this.formatTime(currentPlayTime) + "/" + this.displayDuration;
        }
    }
};


Player.prototype.startTrackTimer = function () {
	if (this.trackTimer != null) {
		return;
	}
    var self = this;
    this.trackTimer = setInterval(function () {
        self.updateTrackTime();
    }, this.trackTimerInterval);
};

Player.prototype.stopTrackTimer = function () {
    if (this.trackTimer != null) {		
        clearInterval(this.trackTimer);
        this.trackTimer = null;
    }
};

//获取播放状态
Player.prototype.getPlayerState = function () {
    return this.playerState;
};

//恢复播放
Player.prototype.resume = function () {
	 Log.info("Player","Resume...");
	 
	 if (this.playerState != playerStatePausing) {
        var ret = {
            e: -1,
            m: "Not pausing"
        };
        return ret;
    }
	
	this.pcmPlayer.resume();
	
	 while (this.audioQueue.length > 0) {
        //this.logger.logDebug("Flush one cache audio.");
        var data = this.audioQueue.shift();
        this.pcmPlayer.play(data);
    }
		
	this.playerState = playerStatePlaying;
	this.startDownloading();
    this.startDecoding();
    if (!this.seeking) {
        this.startTrackTimer();
    }
	 	 
	var ret = {
       e: 0,
       m: "Success"
    };
    return ret;
};

//全屏
Player.prototype.fullscreen = function () {
    if (this.webglPlayer) {
        this.webglPlayer.fullscreen();
    }
};

//播放
Player.prototype.play = function (url, canvas, callback) {
	 Log.info("Player","Play...");
	 
	 if (this.playerState == playerStatePausing) {
		 ret = this.resume();
		 return ret;
     }
	 
	 if (this.playerState == playerStatePlaying) {
		 return;
     }
	 
	 var ret = {
        e: 0,
        m: "Success"
     };
	 
	 var success = true;
	 
	 if (!url) {
		 ret = {
			 e: -1,
			 m: "Invalid url"
		};
		success = false;
		return ret;
     }
	 if (!canvas) {
		 ret = {
			 e: -2,
			 m: "Canvas not set"
		 };
		 success = false;
		 return ret;
     }	 
	 if (!this.decodeWorker) {
		 ret = {
			 e: -4,
			 m: "Decoder not initialized"
         };
		 success = false;
		 return ret;
     }	 
	 if (!this.downloadWorker) {
		  ret = {
			  e: -3,
              m: "Downloader not initialized"
		  };
		  success = false;
		  return ret;
	 }
	 
	 this.canvas = canvas;// 初始化canvas
     this.callback = callback;//初始化回调函数
	 this.playerState = playerStatePlaying; // 播放状态设置为播放中
	 this.startTrackTimer();
	 this.displayLoop(); // 循环显示
	 
	 this.webglPlayer = new WebGLPlayer(this.canvas, {
            preserveDrawingBuffer: false
     });
	 
 	 var req = {
            t: kGetFileInfoReq,//下载器请求,0:获取文件信息
            u: url
     }; 
     this.downloadWorker.postMessage(req);
     this.downloading = true;	 
	 
//	 this.fileInfo = new FileInfo(url);  //初始化文件信息
}

//暂停
Player.prototype.pause = function () {
	Log.info("Player","Pause...");
	
	if (this.playerState != playerStatePlaying) {
        var ret = {
            e: -1,
            m: "Not playing"
        };
        return ret;
    }
	
	//Pause video rendering and audio flushing.
    this.playerState = playerStatePausing;
	
	this.pauseDownloading();
	this.stopDecoding();
	this.stopTrackTimer();
	//Pause audio context.
    this.pcmPlayer.pause();
	
	var ret = {
        e: 0,
        m: "Success"
    };

    return ret;
};

//停止
Player.prototype.stop = function () {
	Log.info("Player","Stop...");
	
	if (this.playerState == playerStateIdle) {
        var ret = {
            e: -1,
            m: "Not playing"
        };
        return ret;
    }
	
    this.playerState = playerStateIdle;
	
	this.timeTrack.value = 0;
	this.stopTrackTimer();
	this.timeLabel.innerHTML = this.formatTime(0) + "/00:00:00";
	if (this.videoRendererTimer != null) {
        //clearTimeout(this.videoRendererTimer);
		cancelAnimationFrame(this.videoRendererTimer);
        this.videoRendererTimer = null;
		Log.info("Player","videoRendererTimer...");
    }
	
	this.webglPlayer.clearFrame();	
	this.stopDownloading();
	this.stopDecoding();	
	
//	this.callback           = null;
    this.duration           = 0;
    this.pixFmt             = 0;
    this.videoWidth         = 0;
    this.videoHeight        = 0;
    this.yLength            = 0;
    this.uvLength           = 0;
	this.decoding           = false;
    this.audioQueue         = [];
    this.videoQueue         = [];
    this.videoStart         = 0;
	this.downloading        = false;
    this.canvas             = null;
    this.webglPlayer        = null;
	
	if (this.pcmPlayer) {
        this.pcmPlayer.destroy();
        this.pcmPlayer = null;
    }	
	
	this.decodeWorker.postMessage({
        t: kCloseDecoderReq
    });
};

//开始下载
Player.prototype.startDownloading = function () {
	if(this.downloading || this.justSeeked)
		return;
	
	Log.info("Player", "startDownloading...");
    var req = {
        t: kStartDownloadFileReq
    };
    this.downloadWorker.postMessage(req);
    this.downloading = true;
};

//暂停下载
Player.prototype.pauseDownloading = function () {
	if(!this.downloading)
		return;
	
	Log.info("Player", "pauseDownloading...");
    var req = {
        t: kPauseDownloadFileReq
    };
    this.downloadWorker.postMessage(req);
    this.downloading = false;
};

//停止下载
Player.prototype.stopDownloading = function () {
	/*if(!this.downloading && this.playerState != playerStatePausing){
		return;		
	}*/
			
	Log.info("Player", "stopDownloading...");
    var req = {
        t: kStopDownloadFileReq
    };
    this.downloadWorker.postMessage(req);
    this.downloading = false;
};

//开始解码
Player.prototype.startDecoding = function () {
	Log.info("Player", "startDecoding...");
    var req = {
        t: kStartDecodingReq
    };
    this.decodeWorker.postMessage(req);
    this.decoding = true;
};

// 停止解码
Player.prototype.stopDecoding = function () {
	Log.info("Player", "stopDecoding...");
	var req = {
        t: kStopDecodingReq
    };
    this.decodeWorker.postMessage(req);
    this.decoding = false;
};

Player.prototype.setLoadingDiv = function (loadingDiv) {
    this.loadingDiv = loadingDiv;
}

Player.prototype.hideLoading = function () {
    if (this.loadingDiv != null) {
        loading.style.display = "none";
    }
};

Player.prototype.showLoading = function () {
    if (this.loadingDiv != null) {
        loading.style.display = "block";
    }
};
    
export {
    Player 
}