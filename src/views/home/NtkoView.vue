/* 文档查看
 * @Author: Nihc 
 * @Date: 2020-11-16 13:41:43 
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-11 14:50:38
 */

<template>
  <div class="full-height" ref="ntkoBox">
    <ntko
    v-if="ntkoShow"
    :ntkoFilePath="ntkoFilePath"
    :ntkoHeight="ntkoHeight"

    >
    </ntko>
  </div>
</template>

<script>
import Ntko from '@/views/plugins/Ntko';

export default {
  components: {
    Ntko
  },
  props:{
    ntkoFilePath:{
      type:String,
      default:''
    }
  },
  data(){
    return {
      ntkoShow:false,
      ntkoHeight:500
    }
  },
  mounted(){
    console.log('ntkoView---mounted');
    this.ntkoShow=false;
    let _this=this;
    this.$nextTick(()=>{
      _this.ntkoHeight=_this.$refs.ntkoBox.clientHeight;
      _this.ntkoShow=true;
    })
  }

}
</script>

<style>

</style>