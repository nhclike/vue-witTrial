/*
 * @Author: nihc 
 * @Date: 2020-11-25 17:51:11 
 * @Last Modified by: nihc
 * @Last Modified time: 2020-11-30 14:44:21
 */
<template>
	<div>
			<div  v-if="showCamera" class="cameraWrapper" ref="cameraWrapper">
				<object  id="my_camera" align="middle" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
							codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"
							:height="cameraHeight" viewastext="在线拍照" :width="cameraWidth">
					<param name="allowScriptAccess" value="sameDomain"/>
					<param name="movie" value="/camera.swf"/>
					<param name="quality" value="high"/>
					<param name="bgcolor" value="#ffffff"/>
					<param name="wmode" value="transparent"/>
					<embed style="z-index: 100" align="middle" allowscriptaccess="sameDomain" bgcolor="#ffffff" :height="cameraHeight"
								name="my_camera" pluginspage="http://www.macromedia.com/go/getflashplayer" quality="high"
								wmode="transparent"
								src="/camera.swf" type="application/x-shockwave-flash" :width="cameraWidth"></embed>
				</object>
			</div>
		  
			<img  v-show="false" :src="imgUrl" :width="cameraWidth" :height="cameraHeight" id="picture" alt="">
	</div>
</template>
<script>
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
				var camObj = document["my_camera"];
				var base64Data = camObj.GetBase64Code();
				console.info(base64Data);

				//展示
				var src = "data:image/png;base64," + base64Data;
				this.imgUrl=src;
				// _this.$nextTick(()=>{
				// 	console.log($('#picture'));
				// 	$('#picture').faceDetection({
				// 			complete: function (faces) {
				// 					console.log(faces);
				// 					_this.$emit("changeImg",faces,base64Data);	
				// 			}
				// 	});
				// })
				_this.$emit("changeImg",base64Data);	

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
