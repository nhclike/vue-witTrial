/* 组件-公用-404
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:23:59
 * @Last Modified by: nihc
 * @Last Modified time: 2020-11-30 16:57:55
 */
<template>
  <div class="full-width full-height errorPage">
    <img src="" alt="">
    <span>抱歉，页面丢失了</span>
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
  .error{
    font-size: @font24px;
    color: @color_info;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    img{
      width: 174px;
      margin-bottom: 20px;
    }
  }
</style>
