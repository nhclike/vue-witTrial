#include <stdio.h>
#include <sys/time.h>
#include <sys/timeb.h>
#include <unistd.h>
#include <pthread.h>

#include "libavcodec/avcodec.h"
#include "libavformat/avformat.h"
//#include "libavutil/imgutils.h"
#include "libavutil/fifo.h"
//#include "libswscale/swscale.h"


#define LOG_INFO printf("-----test----%s %d \n", __func__, __LINE__);

#define CIRCULAR_BUFF_SIZE 32*1024*1024
#define CUSTOM_BUFF_SIZE 32 * 1024
#define INIT_PCM_BUFF_SIZE 128 * 1024

#define BE_FOURCC(ch0, ch1, ch2, ch3)           \
	((uint32_t)(unsigned char)(ch3) | \
	((uint32_t)(unsigned char)(ch2) << 8) | \
	((uint32_t)(unsigned char)(ch1) << 16) | \
	((uint32_t)(unsigned char)(ch0) << 24))

#define QT_ATOM BE_FOURCC

#define FREE_ATOM QT_ATOM('f', 'r', 'e', 'e')
#define JUNK_ATOM QT_ATOM('j', 'u', 'n', 'k')
#define MDAT_ATOM QT_ATOM('m', 'd', 'a', 't')
#define MOOV_ATOM QT_ATOM('m', 'o', 'o', 'v')
#define PNOT_ATOM QT_ATOM('p', 'n', 'o', 't')
#define SKIP_ATOM QT_ATOM('s', 'k', 'i', 'p')
#define WIDE_ATOM QT_ATOM('w', 'i', 'd', 'e')
#define PICT_ATOM QT_ATOM('P', 'I', 'C', 'T')
#define FTYP_ATOM QT_ATOM('f', 't', 'y', 'p')
#define UUID_ATOM QT_ATOM('u', 'u', 'i', 'd')

#define CMOV_ATOM QT_ATOM('c', 'm', 'o', 'v')
#define STCO_ATOM QT_ATOM('s', 't', 'c', 'o')
#define CO64_ATOM QT_ATOM('c', 'o', '6', '4')

#define TRAK_ATOM QT_ATOM('t', 'r', 'a', 'k')
#define MDIA_ATOM QT_ATOM('m', 'd', 'i', 'a')
#define MINF_ATOM QT_ATOM('m', 'i', 'n', 'f')
#define STBL_ATOM QT_ATOM('s', 't', 'b', 'l')

#define BE_32(x) (((uint32_t)(((uint8_t*)(x))[0]) << 24) |  \
	(((uint8_t*)(x))[1] << 16) | \
	(((uint8_t*)(x))[2] << 8) | \
	((uint8_t*)(x))[3])

#define BE_64(x) (((uint64_t)(((uint8_t*)(x))[0]) << 56) |  \
	((uint64_t)(((uint8_t*)(x))[1]) << 48) | \
	((uint64_t)(((uint8_t*)(x))[2]) << 40) | \
	((uint64_t)(((uint8_t*)(x))[3]) << 32) | \
	((uint64_t)(((uint8_t*)(x))[4]) << 24) | \
	((uint64_t)(((uint8_t*)(x))[5]) << 16) | \
	((uint64_t)(((uint8_t*)(x))[6]) << 8) | \
	((uint64_t)((uint8_t*)(x))[7]))

typedef void(*DataCallback)(unsigned char *buff, int size,double timestamp);
typedef void(*RequestCallback)(int offset);

typedef enum ErrorCode {
    kErrorCode_Success = 0,
    kErrorCode_Invalid_Param,
    kErrorCode_Invalid_State,
    kErrorCode_Invalid_Data,
    kErrorCode_Invalid_Format,
    kErrorCode_NULL_Pointer,
    kErrorCode_Open_File_Error,
    kErrorCode_Eof,
    kErrorCode_FFmpeg_Error,
    kErrorCode_Old_Frame
}ErrorCode;

typedef struct WebDecoder {
	AVFormatContext *avformatContext;
    AVCodecContext *videoCodecContext;
    AVCodecContext *audioCodecContext;
    AVFrame *avFrame;
	int videoStreamIdx;
    int audioStreamIdx;

    DataCallback videoCallback;
    DataCallback audioCallback;
    RequestCallback requestCallback;	
	
	unsigned char *yuvBuffer;
    unsigned char *pcmBuffer;
	int currentPcmBufferSize;
    int videoBufferSize;
    int videoSize;
	unsigned char *customIoBuffer;
	
	int64_t fileSize;
	int64_t fileReadPos;
	double beginTimeOffset;
    int accurateSeek;
}WebDecoder;

WebDecoder *decoder = NULL;
AVFifoBuffer *fifo = NULL;
pthread_mutex_t m_mutex;

//const int kCustomIoBufferSize = 32 * 1024;
//const int kInitialPcmBufferSize = 128 * 1024;

int readCallback(void *opaque, uint8_t *buf, int buf_size) {
	pthread_mutex_lock(&m_mutex);
	int len = av_fifo_size(fifo);
	if (len <= 0){
		pthread_mutex_unlock(&m_mutex);
		sleep(1);
		return 0;
	}
		
	av_fifo_generic_read(fifo, buf, buf_size, NULL);
	pthread_mutex_unlock(&m_mutex);
	
	//printf("size:%d\n",len);
	/*for(int i=0;i<buf_size;i++){
		printf(" %#x",*(buf + i));		
	}
	printf("\n");*/
	
	if (len < buf_size)
		return len;
	else
		return buf_size;
}

int64_t seekCallback(void *opaque, int64_t offset, int whence) {
	printf("seek: %ld---%d\n",offset,whence);
	if (whence == AVSEEK_SIZE) {
		return decoder->fileSize;
    }
	
	if (decoder != NULL && decoder->requestCallback != NULL) {
		pthread_mutex_lock(&m_mutex);
	    if(fifo){
			av_fifo_reset(fifo);
		}
	    pthread_mutex_unlock(&m_mutex);
        decoder->requestCallback(offset);
    }	
	return -1;
}

int roundUp(int numToRound, int multiple) {
    return (numToRound + multiple - 1) & -multiple;
}

int copyYuvData(AVFrame *frame, unsigned char *buffer, int width, int height){
	int ret = 0;
	unsigned char *src	= NULL;
	unsigned char *dst	= buffer;
	int i = 0;
	
	if (frame == NULL || buffer == NULL) {
		ret = -1;
		return ret;
    }
	
	if (!frame->data[0] || !frame->data[1] || !frame->data[2]) {
		ret = -1;
		return ret;
	}

	for (i = 0; i < height; i++) {
		src = frame->data[0] + i * frame->linesize[0];
		memcpy(dst, src, width);
		dst += width;
	}

	for (i = 0; i < height / 2; i++) {
		src = frame->data[1] + i * frame->linesize[1];
		memcpy(dst, src, width / 2);
		dst += width / 2;
	}

	for (i = 0; i < height / 2; i++) {
		src = frame->data[2] + i * frame->linesize[2];
		memcpy(dst, src, width / 2);
		dst += width / 2;
	}

	return ret;	
}

ErrorCode seekTo(int ms, int accurateSeek) {	
	int ret = 0;
    int64_t pts = (int64_t)ms * 1000;
    decoder->accurateSeek = accurateSeek;
    ret = avformat_seek_file(decoder->avformatContext,
                                 -1,
                                 INT64_MIN,
                                 pts,
                                 pts,
                                 AVSEEK_FLAG_BACKWARD);
	if (ret == -1) {
        return kErrorCode_FFmpeg_Error;
    } else {
        avcodec_flush_buffers(decoder->videoCodecContext);
        avcodec_flush_buffers(decoder->audioCodecContext);

        // Trigger seek callback
        AVPacket packet;
        av_init_packet(&packet);
        av_read_frame(decoder->avformatContext, &packet);

        decoder->beginTimeOffset = (double)ms / 1000;
        return kErrorCode_Success;
    }
	return 0;
}

int openCodecContext(AVFormatContext *fmtCtx, enum AVMediaType type, int *streamIdx, AVCodecContext **decCtx){
	int ret = 0;
	
	int streamIndex		= -1;
	AVStream *st		= NULL;
	AVCodec *dec		= NULL;
    AVDictionary *opts	= NULL;

    ret = av_find_best_stream(fmtCtx, type, -1, -1, NULL, 0);
	if (ret < 0) {
		return ret;
	}

	streamIndex = ret;
    st = fmtCtx->streams[streamIndex];
	
	dec = avcodec_find_decoder(st->codecpar->codec_id);
	if (!dec) {          
	   ret = AVERROR(EINVAL);
       return ret;
	}
	
	*decCtx = avcodec_alloc_context3(dec);
	if (!*decCtx) {            
	   ret = AVERROR(ENOMEM);
	   return ret;
	}
	
	if ((ret = avcodec_parameters_to_context(*decCtx, st->codecpar)) != 0) {
		return ret;
	}
	
	av_dict_set(&opts, "refcounted_frames", "0", 0);
	if ((ret = avcodec_open2(*decCtx, dec, NULL)) != 0) {
		return ret;
	}
	
	*streamIdx = streamIndex;
	avcodec_flush_buffers(*decCtx);
	
	return ret;	
}

void closeCodecContext(AVFormatContext *fmtCtx, AVCodecContext *decCtx, int streamIdx) {
	if (fmtCtx == NULL || decCtx == NULL) {
		return;
    }
	 
	if (streamIdx < 0 || streamIdx >= fmtCtx->nb_streams) {
		return;
	}
	 
	fmtCtx->streams[streamIdx]->discard = AVDISCARD_ALL;
    avcodec_close(decCtx);
}

ErrorCode processDecodedVideoFrame(AVFrame *frame) {
	ErrorCode ret = kErrorCode_Success;
    double timestamp = 0.0f;
	
	if (frame == NULL || decoder->videoCallback == NULL || decoder->yuvBuffer == NULL || decoder->videoBufferSize <= 0) {
		return kErrorCode_Invalid_Param;
	}

	if (decoder->videoCodecContext->pix_fmt != AV_PIX_FMT_YUV420P && decoder->videoCodecContext->pix_fmt != AV_PIX_FMT_YUVJ420P ) {
		return kErrorCode_Invalid_Format;
    }
	
	ret = copyYuvData(frame, decoder->yuvBuffer, decoder->videoCodecContext->width, decoder->videoCodecContext->height);
	if (ret != kErrorCode_Success) {
		return ret;
	}

	timestamp = (double)frame->pts * av_q2d(decoder->avformatContext->streams[decoder->videoStreamIdx]->time_base);

	if (decoder->accurateSeek && timestamp < decoder->beginTimeOffset) {
		return kErrorCode_Old_Frame;
    }

	decoder->videoCallback(decoder->yuvBuffer, decoder->videoSize, timestamp);	
	
	return ret;
}

ErrorCode processDecodedAudioFrame(AVFrame *frame) {
	ErrorCode ret       = kErrorCode_Success;
	int sampleSize      = 0;
    int audioDataSize   = 0;
    int targetSize      = 0;
    int offset          = 0;
    int i               = 0;
    int ch              = 0;
    double timestamp    = 0.0f;	
	
	if (frame == NULL || decoder->audioCallback == NULL) {
		return kErrorCode_Invalid_Param;
    }
	
	sampleSize = av_get_bytes_per_sample(decoder->audioCodecContext->sample_fmt);
	if (sampleSize < 0) {
		return kErrorCode_Invalid_Data;
    }
	
	if (decoder->pcmBuffer == NULL) {
		decoder->pcmBuffer = (unsigned char*)av_mallocz(INIT_PCM_BUFF_SIZE);
		decoder->currentPcmBufferSize = INIT_PCM_BUFF_SIZE;
    }
	
	audioDataSize = frame->nb_samples * decoder->audioCodecContext->channels * sampleSize;
	if (decoder->currentPcmBufferSize < audioDataSize) {
		 targetSize = roundUp(audioDataSize, 4);          
         decoder->currentPcmBufferSize = targetSize;
         av_free(decoder->pcmBuffer);
         decoder->pcmBuffer = (unsigned char*)av_mallocz(decoder->currentPcmBufferSize);
    }
	 
	for (i = 0; i < frame->nb_samples; i++) {
		for (ch = 0; ch < decoder->audioCodecContext->channels; ch++) {
			 memcpy(decoder->pcmBuffer + offset, frame->data[ch] + sampleSize * i, sampleSize);
			 offset += sampleSize;
	    }
	}
	 
	timestamp = (double)frame->pts * av_q2d(decoder->avformatContext->streams[decoder->audioStreamIdx]->time_base);
	 
	 if (decoder->accurateSeek && timestamp < decoder->beginTimeOffset) {
		 return kErrorCode_Old_Frame;
     }
	 
	decoder->audioCallback(decoder->pcmBuffer, audioDataSize, timestamp);	
	return ret;
}

ErrorCode decodePacket(AVPacket *pkt, int *decodedLen) {
	int ret = 0;
    AVCodecContext *codecContext = NULL;
	
	if (pkt == NULL || decodedLen == NULL) {
        return kErrorCode_Invalid_Param;
    }
	
	*decodedLen = 0;
	
	if (pkt->stream_index == 0) {
        codecContext = decoder->videoCodecContext;
    } else if (pkt->stream_index == 1) {
        codecContext = decoder->audioCodecContext;
    } else {
        return kErrorCode_Invalid_Data;
    }
	
    if (avcodec_send_packet(codecContext, pkt) < 0) {
        return kErrorCode_FFmpeg_Error;
    }
	
	while (ret >= 0) {
        ret = avcodec_receive_frame(codecContext, decoder->avFrame);
        if (ret == AVERROR(EAGAIN)) {
            return kErrorCode_Success;
        } else if (ret == AVERROR_EOF) {
            return kErrorCode_Eof;
        } else if (ret < 0) {
            return kErrorCode_FFmpeg_Error;
        } else {			
			int r = pkt->stream_index ?  processDecodedAudioFrame(decoder->avFrame) : processDecodedVideoFrame(decoder->avFrame);			
            if (r == kErrorCode_Old_Frame) {
                return r;
            }
        }
    }

    *decodedLen = pkt->size;
	return kErrorCode_Success;	
}

ErrorCode decodeOnePacket() {
	int decodedLen	= 0;
    int ret			= 0;
	
	if (decoder == NULL) {
		return kErrorCode_Invalid_State;
    }
	
	AVPacket packet;
    av_init_packet(&packet);
	packet.data = NULL;
	packet.size = 0;
	 
	ret = av_read_frame(decoder->avformatContext, &packet);
	if (ret == AVERROR_EOF) {
		return kErrorCode_Eof;
	}
	
	if (ret < 0 || packet.size == 0) {
		goto end;
    }
	
	do {
		ret = decodePacket(&packet, &decodedLen);
		if (ret != kErrorCode_Success || decodedLen <= 0) {
			goto end;
		}
		
		packet.data += decodedLen;
		packet.size -= decodedLen;
    } while (packet.size > 0);	
end:
	av_packet_unref(&packet);
	pthread_mutex_lock(&m_mutex);
	int len = av_fifo_space(fifo);
    pthread_mutex_unlock(&m_mutex);
	return len;
	
}

ErrorCode openDecoder(int *paramArray, int paramCount, long fileSize, long videoCallback, long audioCallback, long requestCallback) {
	ErrorCode ret = kErrorCode_Success;
	int params[7] = { 0 };
	AVInputFormat* piFmt = NULL;
	
	decoder->fileSize = fileSize; 
	decoder->avformatContext = avformat_alloc_context();
    decoder->customIoBuffer = (unsigned char*)av_mallocz(CUSTOM_BUFF_SIZE); 
	
	AVIOContext* ioContext = avio_alloc_context(decoder->customIoBuffer,CUSTOM_BUFF_SIZE,0,NULL,readCallback,NULL,seekCallback);
//	AVIOContext* ioContext = avio_alloc_context(decoder->customIoBuffer,CUSTOM_BUFF_SIZE,0,NULL,readCallback,NULL,NULL);
	if (ioContext == NULL) {
		ret = kErrorCode_FFmpeg_Error;
		return ret;
	}
	
	decoder->avformatContext->pb = ioContext;
	decoder->avformatContext->flags = AVFMT_FLAG_CUSTOM_IO;	

	if(avformat_open_input(&decoder->avformatContext, NULL, piFmt, NULL) != 0){
		ret = kErrorCode_FFmpeg_Error;
		return ret;
	}
	 
	if(avformat_find_stream_info(decoder->avformatContext, NULL) < 0){
		ret = kErrorCode_FFmpeg_Error;
		return ret;
	} 
	
	for (int i = 0; i < decoder->avformatContext->nb_streams; i++) {
		decoder->avformatContext->streams[i]->discard = AVDISCARD_DEFAULT;
	}	

    if (openCodecContext(decoder->avformatContext,AVMEDIA_TYPE_VIDEO,&decoder->videoStreamIdx,&decoder->videoCodecContext) != 0) {
		ret = kErrorCode_FFmpeg_Error;
		return ret;
	}
	
	if (openCodecContext(decoder->avformatContext,AVMEDIA_TYPE_AUDIO,&decoder->audioStreamIdx,&decoder->audioCodecContext) != 0) {
		ret = kErrorCode_FFmpeg_Error;
		return ret;
	}
	
//	av_seek_frame(decoder->avformatContext, -1, 0, AVSEEK_FLAG_BACKWARD);
	
	decoder->videoSize = avpicture_get_size(decoder->videoCodecContext->pix_fmt,decoder->videoCodecContext->width,decoder->videoCodecContext->height);
	decoder->videoBufferSize = 3 * decoder->videoSize;
	decoder->yuvBuffer = (unsigned char *)av_mallocz(decoder->videoBufferSize);
	decoder->avFrame = av_frame_alloc();
        
    params[0] = 1000 * (decoder->avformatContext->duration + 5000) / AV_TIME_BASE;
    params[1] = decoder->videoCodecContext->pix_fmt;
    params[2] = decoder->videoCodecContext->width;
    params[3] = decoder->videoCodecContext->height;
    params[4] = decoder->audioCodecContext->sample_fmt;
    params[5] = decoder->audioCodecContext->channels;
    params[6] = decoder->audioCodecContext->sample_rate;

	enum AVSampleFormat sampleFmt = decoder->audioCodecContext->sample_fmt;
	if (av_sample_fmt_is_planar(sampleFmt)) {
		const char *packed = av_get_sample_fmt_name(sampleFmt);
		params[4] = av_get_packed_sample_fmt(sampleFmt);
	}
	
	if (paramArray != NULL && paramCount > 0) {
		for (int i = 0; i < paramCount; ++i) {
			paramArray[i] = params[i];
		}
    }

    decoder->videoCallback = (DataCallback)videoCallback;
    decoder->audioCallback = (DataCallback)audioCallback;
    decoder->requestCallback = (RequestCallback)requestCallback;
		
	if (ret != kErrorCode_Success && decoder != NULL) {
        av_freep(&decoder);
    }
	 
	return 0;
}

ErrorCode closeDecoder(){
	if (decoder == NULL || decoder->avformatContext == NULL) {
          return 0;
    }
	
	if (decoder->videoCodecContext != NULL) {
		closeCodecContext(decoder->avformatContext, decoder->videoCodecContext, 0);
		decoder->videoCodecContext = NULL;
     }
	 
	 if (decoder->audioCodecContext != NULL) {
		 closeCodecContext(decoder->avformatContext, decoder->audioCodecContext, 1);
		 decoder->audioCodecContext = NULL;
     }
	 
	 AVIOContext *pb = decoder->avformatContext->pb;
	 if (pb != NULL) {
		 if (pb->buffer != NULL) {
			 av_freep(&pb->buffer);
             decoder->customIoBuffer = NULL;
	     }
		 av_freep(&decoder->avformatContext->pb);
	 }
	 
	 avformat_close_input(&decoder->avformatContext);
	 decoder->avformatContext = NULL;
	 
	 if (decoder->yuvBuffer != NULL) {
		 av_freep(&decoder->yuvBuffer);
	 }
	 
	 if (decoder->pcmBuffer != NULL) {
		 av_freep(&decoder->pcmBuffer);
     }
	 
	 if (decoder->avFrame != NULL) {
		 av_freep(&decoder->avFrame);
	 }
	 
	 if(fifo){
		av_fifo_reset(fifo);
	 }
	 return kErrorCode_Success;	 
}

ErrorCode feedData(unsigned char *buffer,int size, int type){
	if(fifo == NULL){		
		return -1;
	}
	 
	if (type == 1){   //-movflag faststart
		uint32_t atom_type = 0;
		uint64_t atom_size = 0;
		uint32_t offset_count;
		uint64_t current_offset;
		uint64_t moov_inter_atom_size = 0;

		atom_size = BE_32(buffer);

		for (int i = 4; i < atom_size - 4;) {
			atom_type = BE_32(buffer + i);		
//			moov_atom_size = BE_32(buffer + i - 4);
//			std::cout << atom_type << " : " << moov_atom_size << std::endl;

			if (atom_type == MOOV_ATOM  || atom_type == TRAK_ATOM || atom_type == MDIA_ATOM 
				|| atom_type == MINF_ATOM || atom_type == STBL_ATOM){
				i = i + 8;
			}else{	
				moov_inter_atom_size = BE_32(buffer + i - 4);
				if (atom_type == STCO_ATOM) {
					printf(" patching stco atom...\n");
					if (i + moov_inter_atom_size  > atom_size) {
						printf(" bad atom size\n");
						goto error_out;
					} 
					offset_count = BE_32(buffer + i + 8);
//					std::cout << offset_count << std::endl;
					if (i + 12 + offset_count * UINT64_C(4) > atom_size) {
						printf(" bad atom size/element count\n");
						goto error_out;
					}
					for (int j = 0; j < offset_count; j++) {
						current_offset = BE_32(buffer + i + 12 + j * 4);
						//std::cout << current_offset << std::endl;
						current_offset += atom_size;
						*(buffer + i + 12 + j * 4 + 0) = (current_offset >> 24) & 0xFF;
						*(buffer + i + 12 + j * 4 + 1) = (current_offset >> 16) & 0xFF;
						*(buffer + i + 12 + j * 4 + 2) = (current_offset >> 8) & 0xFF;
						*(buffer + i + 12 + j * 4 + 3) = (current_offset >> 0) & 0xFF;
					}
				}
				else if (atom_type == CO64_ATOM) {
					printf(" patching co64 atom...\n");
					moov_inter_atom_size = BE_32(buffer + i - 4);
					if (i + moov_inter_atom_size - 4 > atom_size) {
						printf(" bad atom size\n");
						goto error_out;
					}
					offset_count = BE_32(buffer + i + 8);
					if (i + 12 + offset_count * UINT64_C(8) > moov_inter_atom_size) {
						printf(" bad atom size/element count\n");
						goto error_out;
					}
					for (int j = 0; j < offset_count; j++) {
						current_offset = BE_64(buffer + i + 12 + j * 8);
						current_offset += atom_size;
						*(buffer + i + 12 + j * 8 + 0) = (current_offset >> 56) & 0xFF;
						*(buffer + i + 12 + j * 8 + 1) = (current_offset >> 48) & 0xFF;
						*(buffer + i + 12 + j * 8 + 2) = (current_offset >> 40) & 0xFF;
						*(buffer + i + 12 + j * 8 + 3) = (current_offset >> 32) & 0xFF;
						*(buffer + i + 12 + j * 8 + 4) = (current_offset >> 24) & 0xFF;
						*(buffer + i + 12 + j * 8 + 5) = (current_offset >> 16) & 0xFF;
						*(buffer + i + 12 + j * 8 + 6) = (current_offset >> 8) & 0xFF;
						*(buffer + i + 12 + j * 8 + 7) = (current_offset >> 0) & 0xFF;
					}
				}
				i += moov_inter_atom_size;
			}
		}		
	}
	
		
	/*int sCount = 0;
	while(av_fifo_space(fifo) < size){
		printf("feedData sleep...\n");
		sleep(1);
		sCount++;
	}*/
	
	/*printf("size=%d space=%d fifo=%d\n",size,av_fifo_space(fifo),av_fifo_size(fifo));
	for(int i=0;i<size;i++){
		printf(" %#x",*(buffer + i));		
	}
	printf("\n");*/
	
	/*if(av_fifo_space(fifo) < size){
		return 10;
	}*/

	
	
	pthread_mutex_lock(&m_mutex);
	int len = av_fifo_space(fifo);
	if(len < size){
        pthread_mutex_unlock(&m_mutex);
		return -10;
	}
	av_fifo_generic_write(fifo, buffer, size, NULL);
	pthread_mutex_unlock(&m_mutex);
	
error_out:
	return len;
}

ErrorCode loadDecoder(){
	if (decoder != NULL) {
		return 0;
	}
	
	av_register_all();
//	avcodec_register_all();
	if(fifo == NULL){
		fifo = av_fifo_alloc(CIRCULAR_BUFF_SIZE);		
	}		
	if(pthread_mutex_init(&m_mutex, NULL) != 0){
		return 0;
	}
	decoder = (WebDecoder *)av_mallocz(sizeof(WebDecoder));
		
	return 0;
}

ErrorCode unloadDecoder(){
	if (decoder != NULL) {
		av_freep(&decoder);
		decoder = NULL;
	}
	if(fifo != NULL){
		av_fifo_free(fifo);
		fifo = NULL;		
	}
	pthread_mutex_destroy(&m_mutex);		
	
	return kErrorCode_Success;
}

int main() {
    //simpleLog("Native loaded.");
    return 0;
}
