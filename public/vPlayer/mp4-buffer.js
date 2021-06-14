require("./common.js");
import { Log } from "./log.js";
import {Downloader} from "./downloader";

self.Log.setLogLevel(Log.error);
self.downloadStatus = false;
self.mp4_Buffer = new MP4_Buffer();

function MP4_Buffer() {
	this.chunkSize = 1000000; //65536 1000000
	this.intervalTime = 1000;
	this.startintervalTime = 10;
	this.downloader = new Downloader();
	this.mdatPos = 0
	this.moovPos = 0;
	this.freePos = 0;
	this.moovStartFound = false;
	this.fileSize = 0;
	this.seekFlag = false;
	this.seekCount = 0;
	this.dataOffset = 0;
}

function decodeUnicode(str){
  str = str.replace(/\\/g, "%");
  return unescape(str);
}

MP4_Buffer.prototype.load = function(url) {
	Log.info("MP4_Buffer", "Load...");
 	if(this.downloadStatus){
		return this;
	}
    this.downloadStatus = true;	
	
	
	this.downloader.setCallback(
		function (response, end, error) { 
		    Log.info("MP4_Buffer", "length: " + response.byteLength  + " end: " + end);
			var nextStart = 0;
			if (response) {
				//progressbar.progressbar({ value: Math.ceil(100*downloader.chunkStart/downloader.totalLength) });				                			
						
				if(self.mp4_Buffer.mdatPos  === self.mp4_Buffer.moovPos){
					self.mp4_Buffer.dataOffset = 0;
					var data = new Uint8Array(response);
					let i = 0;
					while(i < response.byteLength){
						var size = Number('0x' + Array.from(data.slice(i, i+4)).map(n => ('00' + n.toString(16)).slice(-2)).join(''));
					    var type = decodeUnicode(Array.from(data.slice(i+4, i+8)).map(n => ('\\u00' + ('00' + n.toString(16)).slice(-2))).join('')); 
						
					    if (type == 'mdat') { //moov后置
						    if(self.mp4_Buffer.moovPos != 0){
								var size = i+size;
								if(size < self.mp4_Buffer.downloader.totalLength){ //mdat之后还有box
								    self.mp4_Buffer.fileSize = size;
								}
								self.mp4_Buffer.downloader.setInterval(self.mp4_Buffer.intervalTime);	
								//Log.error("MP4_Buffer", "size:"+size);
								break;
							}
							self.mp4_Buffer.mdatPos = i;
							self.mp4_Buffer.moovPos = i + size;
							self.mp4_Buffer.moovStartFound = true;
							nextStart = self.mp4_Buffer.moovPos;
							self.mp4_Buffer.downloader.setChunkSize(self.mp4_Buffer.downloader.totalLength - self.mp4_Buffer.moovPos + 1);
							self.mp4_Buffer.downloader.setInterval(self.mp4_Buffer.startintervalTime);
						    break;
					    }
						else if(type == 'moov'){
							self.mp4_Buffer.moovPos = i;
							self.mp4_Buffer.freePos = i + size;
							nextStart = self.mp4_Buffer.downloader.chunkStart + response.byteLength;
//							self.mp4_Buffer.downloader.setInterval(self.mp4_Buffer.intervalTime);	

                            var objData = { //如果moov前置，则第一次下载的数据全部传递
							   t: kFileData,
							   d: data.slice(i, response.byteLength),  
							   s: self.mp4_Buffer.downloader.totalLength,
							   f: 0
							};
							self.postMessage(objData);
							
                            if(self.mp4_Buffer.freePos > response.byteLength){
								self.mp4_Buffer.mdatPos = 16800000;
								nextStart = self.mp4_Buffer.downloader.chunkStart + response.byteLength;
							    self.mp4_Buffer.downloader.setChunkSize(nextStart);
							    self.mp4_Buffer.downloader.setInterval(self.mp4_Buffer.startintervalTime);
								break;								
							}							
						}
						else if(type == 'free' && self.mp4_Buffer.moovPos != 0){ //moov前置再判断mdat位置,mdat只有还有box
							self.mp4_Buffer.freePos = i;
							self.mp4_Buffer.mdatPos = i + size;	
                            Log.info("MP4_Buffer", "self.mp4_Buffer.mdatPos: " + self.mp4_Buffer.mdatPos);							
							self.mp4_Buffer.downloader.setChunkSize(self.mp4_Buffer.mdatPos);  
							self.mp4_Buffer.downloader.setInterval(self.mp4_Buffer.startintervalTime);
						    break;
						}
						else{	
						   //Log.info("MP4_Buffer", "length: " + data.slice(i, i + size));
                           var objData = {  //第一次下载的数据只传递ftyp,free数据
							   t: kFileData,
							   d: data.slice(i, i + size),
							   s: self.mp4_Buffer.downloader.totalLength,
							   f: 0
							};
							self.postMessage(objData);						   
					    }
						i = i + size;
					}					
				}else{
					nextStart = self.mp4_Buffer.downloader.chunkStart + response.byteLength;
					
					var type = 0;
					var sendFileSize = self.mp4_Buffer.downloader.totalLength;
                    if(self.mp4_Buffer.moovStartFound){  //区分moov位置，判断moov数据如果后置则传递的数据需要二次处理
						type = 1;
//                        nextStart = 2*self.mp4_Buffer.downloader.chunkStart + response.byteLength;	//稍微多传送一些数据进行解码				
					}else{
						if(nextStart >= self.mp4_Buffer.mdatPos){							
						    type = 2;
							self.mp4_Buffer.downloader.setInterval(self.mp4_Buffer.intervalTime);

                            if(self.mp4_Buffer.fileSize != 0){
								sendFileSize = self.mp4_Buffer.fileSize;
							}							
						}
					}
					
                    var objData = {
						t: kFileData,
						d: response,
						s: sendFileSize,
						f: type
					};
					self.postMessage(objData);

                     if(self.mp4_Buffer.seekFlag){   //定位成功发送回包
						if(self.mp4_Buffer.seekCount > 1){
                           self.mp4_Buffer.seekFlag = false;
						   var objData = {
		                       t: kDowndoaderSeekToRsp,
						   };
						   self.postMessage(objData);
						   self.mp4_Buffer.seekCount = 0;						   
						}
                        self.mp4_Buffer.seekCount++;						
					} 
					
				}							
			}
			
			if (end) {
				if(self.mp4_Buffer.moovStartFound){
					nextStart = self.mp4_Buffer.mdatPos;
					self.mp4_Buffer.moovStartFound = false;				
					self.mp4_Buffer.downloader.setChunkSize(self.mp4_Buffer.chunkSize);
					self.mp4_Buffer.downloader.setInterval(self.mp4_Buffer.intervalTime);		
					self.mp4_Buffer.downloader.setChunkStart(nextStart);					
				}else{
					self.mp4_Buffer.downloader.stop();
				}
			} else {
				self.mp4_Buffer.downloader.setChunkStart(nextStart);		
			}
			
			if (error) {
				//reset();
				//progresslabel.text("Download error!");
			}			
		}
	);
	
	this.downloader.setInterval(this.intervalTime);
	this.downloader.setChunkSize(this.chunkSize);
	this.downloader.setUrl(url);
	this.downloader.start(); 
}

//开始下载
MP4_Buffer.prototype.start = function() {
	if(!this.downloadStatus){
		Log.info("MP4_Buffer", "downloader not init");
		return;
	}	
	
	this.downloader.resume();
	this.downloadStatus = true;
}

//暂停下载
MP4_Buffer.prototype.pause = function() {
	if(!this.downloadStatus){
		Log.info("MP4_Buffer", "downloader not init");
		return;
	}

    this.downloader.stop();	
}

//定位
MP4_Buffer.prototype.seek = function(offset) {
//	Log.error("MP4_Buffer", "seek offset:" + offset);
	if(!this.downloadStatus){
		Log.info("MP4_Buffer", "downloader not init");
		return;
	}

	if(offset < 0){
		 var objData = {
			 t: kDowndoaderSeekToRsp,
		 };
		 self.postMessage(objData);
		 this.downloader.resume();
		 return;
	}
	
	this.downloader.setChunkSize(this.chunkSize);
	this.downloader.setInterval(this.intervalTime);		
	this.downloader.setChunkStart(offset);
	this.downloader.resume();
	this.seekFlag = true;
}

//停止下载
MP4_Buffer.prototype.stop = function() {
	if(!this.downloadStatus){
		Log.info("MP4_Buffer", "downloader not init");
		return;
	}

    this.downloader.stop();
    this.downloadStatus = false;
    this.mdatPos = 0;
	this.moovPos = 0;
	this.freePos = 0;
	this.fileSize = 0;
	this.moovStartFound = false;
}

self.onmessage = function (evt) {	
	var objData = evt.data;
    switch (objData.t) {
		case kGetFileInfoReq:
            self.mp4_Buffer.load(objData.u);
            break;
        case kStartDownloadFileReq:
            self.mp4_Buffer.start();
            break;
		case kPauseDownloadFileReq:
            self.mp4_Buffer.pause();
            break;
		case kStopDownloadFileReq:
            self.mp4_Buffer.stop();
            break;
		case kSeekDownloadFileReq:
            self.mp4_Buffer.seek(objData.o);
            break;
        default:
		    Log.info("MP4_Buffer", "Unsupport messsage " + objData.t);
    }
};
export{
	MP4_Buffer
}