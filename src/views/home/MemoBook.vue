/*备忘录
 * @Author: nihc
 * @Date: 2020-09-09 17:01:55
 * @Last Modified by: Nihc
 * @Last Modified time: 2020-11-05 17:17:30
 */

<template>
  <div class="page-box full-height">
        <div class="page-title">
            <div class="fl">
                备忘录
            </div>
            <div class="fr">
                <a-button type="primary" class="margin-right20" @click="saveMemo()">保存</a-button>

            </div>
        </div>
        <div class="page-content" ref="ueditorBox">
          <ueditor v-if="showUeditor" :action="action" :ueditorHeight="ueditorHeight"></ueditor>
        </div>
    </div>
</template>

<script>
import Ueditor from '@/views/plugins/Ueditor';
export default {
    components: {
        Ueditor
    },
    data() {
        return {
            action: '',
            ueditorHeight: 400,
            showUeditor: false
        };
    },
    mounted() {
        let _this = this;
        this.$nextTick(function() {
            _this.ueditorHeight = _this.$refs.ueditorBox.clientHeight - 100;
            console.log('ueditorHeight', _this.ueditorHeight);
            _this.showUeditor = true;
        });
    },
    methods: {
        saveMemo() {
            this.action = `saveMemonum${new Date().getTime()}`;

        }
    }
};
</script>
<style lang="less" scoped>
.page-box{
    padding:0 40px 20px 40px;
    .page-title{
        height: 60px;
        line-height: 60px;
        font-size: @font28px;
        color:@text_color_black;
        border-bottom: 1px solid @text_color_white_4;
    }
    .page-content{
        height: calc(100% - 60px);
        position: relative;
        padding: 10px 0;
    }
}
</style>
