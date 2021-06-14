self.Module = {
    onRuntimeInitialized: function () {
        onWasmLoaded();
    }
};

require("./common.js");
require("./libweb-api.js");
require("./log.js");
self.Log.setLogLevel(Log.error);

function Decoder() {
    this.coreLogLevel       = 0;
    this.accurateSeek       = true;
    this.wasmLoaded         = false;
    this.tmpReqQue          = [];
    this.decodeTimer        = null;
    this.videoCallback      = null;
    this.audioCallback      = null;
	this.requestCallback    = null;
	this.openDecoderFlag    = false;
	this.cacheBuffer        = null;
	this.startNum           = 0;
}

Decoder.prototype.processReq = function (req) {
//    this.logger.logInfo("processReq " + req.t + ".");
    switch (req.t) {
        case kFeedDataReq: 
            this.feedData(req.d, req.s, req.f);
            break;
		case kStartDecodingReq:
		    this.startDecoding(10);
			break;
		case kStopDecodingReq:
		    this.stopDecoding();
			break;
		case kCloseDecoderReq:
		    this.closeDecoder();
			break;
		case kSeekToReq:
		    this.seekTo(req.ms);
			break;
        default:
		    Log.info("Decoder", "Unsupport messsage ");
    }
};

Decoder.prototype.loadDecoder = function () {
	var ret = Module._loadDecoder();
    if (0 == ret) {      
		Log.info("Decoder", "loadDecoder succ");
    }
    /*var objData = {
        t: kInitDecoderRsp,
        e: ret
    };
    self.postMessage(objData);*/
};

Decoder.prototype.unloadDecoder = function () {
	var ret = Module._unloadDecoder();   
};

Decoder.prototype.openDecoder = function (fileSize) {
	Log.info("Decoder", "openDecoder...");
    var paramCount = 7, paramSize = 4;
    var paramByteBuffer = Module._malloc(paramCount * paramSize);
    var ret = Module._openDecoder(paramByteBuffer, paramCount, fileSize, this.videoCallback, this.audioCallback, this.requestCallback);
    if (ret == 0) {
        var paramIntBuff    = paramByteBuffer >> 2;
        var paramArray      = Module.HEAP32.subarray(paramIntBuff, paramIntBuff + paramCount);
        var duration        = paramArray[0];
        var videoPixFmt     = paramArray[1];
        var videoWidth      = paramArray[2];
        var videoHeight     = paramArray[3];
        var audioSampleFmt  = paramArray[4];
        var audioChannels   = paramArray[5];
        var audioSampleRate = paramArray[6];

	    Log.info("Decoder", "videoWidth:" + videoWidth + " videoHeight: " + videoHeight + " videoPixFmt: " + videoPixFmt);
        var objData = {
            t: kOpenDecoderRsp,
            e: ret,
			s: fileSize,
            v: {				
                d: duration,
                p: videoPixFmt,
                w: videoWidth,
                h: videoHeight
            },
            a: {
                f: audioSampleFmt,
                c: audioChannels,
                r: audioSampleRate
            }
        };
        self.postMessage(objData);
    } else {
        var objData = {
            t: kOpenDecoderRsp,
            e: ret
        };
        self.postMessage(objData);
    }
    Module._free(paramByteBuffer);
	return ret;
};
// 关闭解码器
Decoder.prototype.closeDecoder = function () {
    if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
        this.decodeTimer = null;
    }

    var ret = Module._closeDecoder();

    var objData = {
        t: kDecoderStatusRsp,
		m: kCloseDecoderRsp,
        e: ret
    };
    self.postMessage(objData);
	this.openDecoderFlag = false;
	this.startNum = 0;
};

Decoder.prototype.feedData = function (data,fileSize,flag) {
    var typedArray = new Uint8Array(data);
	var cacheBuffer = Module._malloc(typedArray.length);	
	Module.HEAPU8.set(typedArray, cacheBuffer);
//	Log.info("Decoder", "typedArray.length: "+typedArray.length + "--flag:"+flag);	
	var ret = Module._feedData(cacheBuffer, typedArray.length, fileSize,flag);	
//	Log.info("Decoder", "ret: "+ ret);	
	if (ret >= 0) {	
		if(!this.openDecoderFlag){
			if(flag === 2){ //解析moov
//			    Log.info("Decoder", "解析moov");	
			    if(this.startNum < 2){ //媒体头到达之后稍微等待一段时间进行解码
					this.startNum++;
					return;
				}
				var ret = this.openDecoder(fileSize);				
				if(ret === 0){	
                    Log.info("Decoder", "ret: "+ ret);				
                    this.startDecoding(10);					
				}
                this.openDecoderFlag = true;
                this.startNum = 0;				
			}			
		}
	}
	
	/*if(ret < 6000000 && this.openDecoderFlag){ //剩余空间太小，暂停喂养数据
		Log.info("Decoder", "spaceSize: "+ ret);
		var objData = {
          t: kPauseDownloadingReq,
        };
        self.postMessage(objData);
	}*/
	
	if (cacheBuffer != null) {
        Module._free(cacheBuffer);
        cacheBuffer = null;
    }
};

Decoder.prototype.startDecoding = function (interval) {
	Log.info("Decoder", "Start decoding");
		
    if (!this.decodeTimer) {
		this.decodeTimer = setInterval(this.decode, interval);
    }    
	
	var objData = {
        t: kDecoderStatusRsp,
		m: kStartDecodingRsp,
        e: 0
    };
    self.postMessage(objData);
};

Decoder.prototype.stopDecoding = function () {
	Log.info("Decoder", "Stop decoding");
	if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
        this.decodeTimer = null;
    }	
	var objData = {
        t: kDecoderStatusRsp,
		m: kStopDecodingRsp,
        e: 0
    };
    self.postMessage(objData);
};

Decoder.prototype.seekTo = function (ms) {
    var ret = Module._seekTo(ms, 1);
    var objData = {
        t: kSeekToRsp,
        r: ret
    };
    //self.postMessage(objData);
}

Decoder.prototype.decode = function () {
//	Log.info("Decoder", "decode...");
    var ret = Module._decodeOnePacket();
	if(ret != 0){
		Log.info("Decoder", "decode: "+ ret);		
	}
/* 	if(ret < -100){
		self.decoder.stopDecoding();
	} */
	
    if (ret == 7) {
		Log.info("Decoder", "Decoder finished.");
        self.decoder.stopDecoding();
		var objData = {
			t: kDecoderStatusRsp,
			m: kDecodeFinishedEvt,
			e: 0
        };
        self.postMessage(objData);
    }
		
/* 	if(ret > 32000000){ //剩余空间太大需要喂养数据，开始下载
//		Log.info("Decoder", "decode spaceSize: "+ ret);
		var objData = {
          t: kStartDownloadingReq,
        };
        self.postMessage(objData);
	} */

    while (ret == 9) {
 //     self.decoder.logger.logInfo("One old frame");
        ret = Module._decodeOnePacket();
/* 		if(ret > 30000000){  //剩余空间太大需要喂养数据，开始下载
		var objData = {
          t: kStartDownloadingReq,
        };
        self.postMessage(objData);
	    } */
    }
};

Decoder.prototype.cacheReq = function (req) {
    if (req) {
        this.tmpReqQue.push(req);
    }
};

Decoder.prototype.onWasmLoaded = function () {
	Log.info("Decoder", "Wasm loaded");
    this.wasmLoaded = true;
	this.loadDecoder();
    this.videoCallback = Module.addFunction(function (buff, size, timestamp) {
        var outArray = Module.HEAPU8.subarray(buff, buff + size);
        var data = new Uint8Array(outArray);
        var objData = {
            t: kVideoFrame,
            s: timestamp,
            d: data
        };
//		Log.info("Decoder", "video timestamp: " + timestamp);
        self.postMessage(objData, [objData.d.buffer]);
    },'viid');

    this.audioCallback = Module.addFunction(function (buff, size, timestamp) {
        var outArray = Module.HEAPU8.subarray(buff, buff + size);
        var data = new Uint8Array(outArray);
        var objData = {
            t: kAudioFrame,
            s: timestamp,
            d: data
        };	
//        Log.info("Decoder", "audio timestamp: " + timestamp);		
        self.postMessage(objData, [objData.d.buffer]);
    },'viid');
	
	this.requestCallback = Module.addFunction(function (offset) {
/* 		if(offset <= 0){
			return;
		} */
//		Log.info("Decoder", "requestCallback...");
        var objData = {
            t: kRequestDataEvt,
            o: offset
        };
        self.postMessage(objData);	
    },'vi');

    while (this.tmpReqQue.length > 0) {
        var req = this.tmpReqQue.shift();
        this.processReq(req);
    }
};

self.decoder = new Decoder;

self.onmessage = function (evt) {
    if (!self.decoder) {
		Log.info("Decoder", "Decoder not initialized!");
        return;
    }

    var req = evt.data;
    if (!self.decoder.wasmLoaded) {
        self.decoder.cacheReq(req);
		Log.info("Decoder", "Temp cache req " + req.t + ".");
        return;
    }

    self.decoder.processReq(req);
};

function onWasmLoaded() {
    if (self.decoder) {
        self.decoder.onWasmLoaded();
    } else {
        Log.info("Decoder", "No decoder!");
    }
}
export{
    Decoder
}