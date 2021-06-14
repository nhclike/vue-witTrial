/* pdf查看插件
 * @Author: Nihc 
 * @Date: 2020-11-16 11:20:03 
 * @Last Modified by: Nihc
 * @Last Modified time: 2020-11-16 11:54:08
 */

<template>
  <div class="pdf-box full-height" v-if="showPdfBox">
      <iframe  id="previewPdf" :src="src" height="100%"
      width="100%">
      </iframe>
  </div>
</template>

<script>
export default {
  props:{
    pdfFileUrl:{
      type:String,
      default:''
    }
  },
  data(){
    return {
      src:'',
      showPdfBox:false
    }
  },
  watch:{
      pdfFileUrl:{
        handler(newVal,oldVal){
          console.log("newVal",newVal);
          let _this=this;
          this.$nextTick(function () {
            console.log("this.pdfFileUrl",this.pdfFileUrl);
            if(!!newVal){
                _this.showPdfBox = true;
                _this.$nextTick(() => {
                  _this.src=`/pdf/web/viewer.html?file=${this.pdfFileUrl}`;
                });
            }
          })
        },
        deep:true,
        immediate:true
      }
    },
  mounted(){
    console.log("pdfview mounted");
    

    
  }
}
</script>

<style>

</style>