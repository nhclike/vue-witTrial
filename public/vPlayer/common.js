//Player request.
const kPlayVideoReq         = 0;
const kPauseVideoReq        = 1;
const kStopVideoReq         = 2;

//Player response.
const kPlayVideoRsp         = 0;
const kAudioInfo            = 1;
const kVideoInfo            = 2;
const kAudioData            = 3;
const kVideoData            = 4;

//Downloader request.
const kGetFileInfoReq       = 0;
const kStartDownloadFileReq = 1;
const kPauseDownloadFileReq = 2;
const kStopDownloadFileReq  = 3;
const kSeekDownloadFileReq  = 4;

//Downloader response.
const kGetFileInfoRsp       = 0;
const kFileData             = 1;
const kDowndoaderSeekToRsp  = 2;

//Decoder request.
const kInitDecoderReq       = 0;
const kUninitDecoderReq     = 1;
const kOpenDecoderReq       = 2;
const kCloseDecoderReq      = 3;
const kFeedDataReq          = 4;
const kStartDecodingReq     = 5;
const kPauseDecodingReq     = 6;
const kStopDecodingReq      = 7;
const kSeekToReq            = 8;

//Decoder response.
const kInitDecoderRsp       = 0;
const kUninitDecoderRsp     = 1;
const kOpenDecoderRsp       = 2;
const kCloseDecoderRsp      = 3;
const kVideoFrame           = 4;
const kAudioFrame           = 5;
const kStartDecodingRsp     = 6;
const kStopDecodingRsp      = 7;
const kDecodeFinishedEvt    = 8;
const kRequestDataEvt       = 9;
const kSeekToRsp            = 10;
const kDecoderStatusRsp     = 11;
const kStartDownloadingReq  = 12;
const kPauseDownloadingReq  = 13;
const kStopDownloadingReq   = 14;



