/* 组件-公用-无庭审
 * @Author: ShiHuiJun
 * @Date: 2020-11-27 17:08:57
 * @Last Modified by: nihc
 * @Last Modified time: 2020-11-30 16:56:58
 */

<template>
  <div class="full-width full-height">
    <div class="errorPage">
      <div class="vertical-horizontal-center">
          <div>
              <img class="msgIcon" src="@/assets/images/icon/noTrial.png" />
          </div>
          <div class="msg">今日暂无庭审案件</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'NoTrial',
    data() {
        return {};
    }
};
</script>
<style lang="less" scoped>

</style>
