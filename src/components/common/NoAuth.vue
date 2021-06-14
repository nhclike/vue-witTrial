/* 组件-公用-无权限
 * @Author: ShiHuiJun
 * @Date: 2020-11-27 17:08:57
 * @Last Modified by: nihc
 * @Last Modified time: 2020-11-30 16:56:54
 */

<template>
  <div class="full-width full-height">
    <div class="errorPage">
        <div class="vertical-horizontal-center">
            <div>
                <img  class="msgIcon" src="@/assets/images/icon/noTrial.png" />
            </div>
            <div class="msg">设备未授权,请联系管理员!</div>
        </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'NoAuth',
    data() {
        return {};
    }
};
</script>
<style lang="less" scoped>
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
