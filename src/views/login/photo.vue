/* webcamjs加facedetection.js前台拉取摄像头并且识别人脸
 * @Author: nihc 
 * @Date: 2020-11-25 17:51:24 
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-13 17:25:56
 */

<template>
	<div v-show="showCamera">
		  <div id="my_camera"></div>
		  <!-- <form>
		    <input type=button value="拍照" @click="take_snapshot()">
		  </form> -->
			<img :src="imgUrl" id="picture" alt="">
	</div>
</template>
<script>
require('../../../public/webcam/webcam.js');
require('jquery.facedetection/dist/jquery.facedetection.js');

import { mapMutations ,mapActions} from 'vuex';
	export default {
		name: 'TakePhoto',
		props:{
			cameraWidth:{
				type:Number,
				default:700
			},
			cameraHeight:{
				type:Number,
				default:420
			},
			showCamera:{
				type:Boolean,
				default:false
			},
			action:{
				type:String,
				default:''
			}
		},
		data() {
			return{
				imgUrl:''
			}
		},

		mounted() {
			//console.log("SWF_URL",SWF_URL)
									_this.setCamera()

		},
		watch:{
			showCamera:{
				handler(newVal){
					let _this=this;
					if(newVal){
						this.$nextTick(()=>{
							//_this.unfreezeCamera();
							_this.setCamera()
						})
					}
					// else{
					// 	_this.unfreezeCamera();
					// }
				},
				deep:true,
				immediate:true
			},
			action:{
				handler(newVal){
					let act=this.action.split('num')[0];
					if(act==='snapshot'){
						this.take_snapshot()
					}
					if(act==='reset'){
						this.resetCamera()
					}
				},
				deep:true,
				immediate:true
			}
		},
		methods:{
		
			// 接口引入
			...mapActions('moduleLogin', [
					'faceDetection'
			]),
			resetCamera(){
				Webcam.reset();
			},
			setCamera(){
					Webcam.set({
						width: this.cameraWidth,
						height: this.cameraHeight,
						image_format: 'jpeg',
						jpeg_quality: 90
						//swfURL:require('../../assets/webcam/webcam.swf')
						//swfURL:SWF_URL

					});
					Webcam.setSWFLocation('/webcam/webcam.swf');
					Webcam.attach('#my_camera');
			},
			freezeCamera(){
					Webcam.freeze();
			},
			unfreezeCamera(){
					Webcam.unfreeze();
			},
			take_snapshot: function () {
				// take snapshot and get image data
				let _this=this;
				Webcam.snap( function(data_uri) {
					console.log('snap',data_uri)
					// display results in pages
					// document.getElementById('results').innerHTML = 
					//   '<h2>Here is your image:</h2>' + 
					// 	'<img src="'+data_uri+'"/>';
					//_this.$emit("changeImg",data_uri);

						_this.imgUrl=data_uri;
						_this.$nextTick(()=>{
							console.log($('#picture'));
							$('#picture').faceDetection({
									complete: function (faces) {
											console.log(faces);
											let base64=data_uri.substring(23);
											_this.$emit("changeImg",faces,base64);

											
									}
							});
						})
						// let base64=data_uri.substring(23);
						// _this.faceDetection(base64).then((res)=>{
						// 	console.log('faceDetection',res);
						// 	if(res.code===0 && res.data){
						// 		_this.$emit("changeImg",base64);
						// 	}
						// })
				} );
			}
		}
	}
</script>
<style scoped lang='less'>
#my_camera{
	width:100%;
	height: 100%;
}
</style>
