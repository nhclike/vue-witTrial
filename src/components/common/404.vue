/* 组件-公用-404
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:23:59
 * @Last Modified by: nihc
 * @Last Modified time: 2020-11-30 17:42:50
 */
<template>
  <div class="full-width full-height error">
    <div class="errorPage">
      <div class="vertical-horizontal-center">
          <div>
              <img class="msgIcon" src="@/assets/images/icon/404.png" />
          </div>
          <div class="msg">抱歉页面丢失了,404</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'Error',
    data() {
        return {};
    }
};
</script>
<style scoped lang="less">
 .errorPage{
   div{
     img{
       width: 394px;
       height: 348px;
     }
   }
 }
</style>
