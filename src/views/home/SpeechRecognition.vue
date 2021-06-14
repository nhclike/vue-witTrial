/*语音识别
 * @Author: nihc
 * @Date: 2020-09-09 17:01:55
 * @Last Modified by: nihc
 * @Last Modified time: 2021-02-03 15:16:10
 */

<template>
  <div class="page-box full-height">
        <div class="page-title">
            <div class="fl">
                语音识别
            </div>
            <div class="fr">
                <!-- <a-button type="primary" class="margin-right20" @click="addResult()">追加识别结果</a-button> -->
                <a-button v-if="!isStartRecog" type="primary" class="margin-right20" @click="startRecog()">开启识别</a-button>
                <a-button v-else type="primary" class="margin-right20" @click="stopRecog()">结束识别</a-button>
                <!-- <a-button type="primary" class="margin-right20" @click="clearRecog()">清空识别</a-button> -->
            </div>
        </div>
        <div class="page-content" ref="ueditorBox">
          <ueditor v-if="showUeditor"
          :typeCode="typeCode"
          :action="action"
          :addTextStr="addTextStr"
          :ueditorHeight="ueditorHeight">
          </ueditor>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

import Ueditor from '@/views/plugins/Ueditor';
export default {
    components: {
        Ueditor
    },
    props: {
        addTextStr: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            action: '',
            ueditorHeight: 400,
            showUeditor: false,
            isStartRecog: false,
            typeCode: 1// ueditor中定义的语音识别模块为1
        };
    },
    mounted() {
        let _this = this;
        this.$nextTick(function() {
            _this.ueditorHeight = _this.$refs.ueditorBox.clientHeight - 100;
            console.log('ueditorHeight', _this.ueditorHeight);
            _this.showUeditor = true;
        });
        this.initRecog();
    },
    methods: {
        // 接口引入
        ...mapActions('moduleJudge', [
            'startAsr',
            'stopAsr',
            'initAsr'
        ]),
        addResult() {
            this.action = `addTextnum${new Date().getTime()}`;
        },
        clearRecog() {
            this.action = `clearRecognum${new Date().getTime()}`;
        },
        initRecog() {
            let params = {
                'trialId': this.$route.query.trialId
            };
            let _this = this;
            this.initAsr(params).then(res => {
                if (res.code == 0) {
                	this.addTextStr = res.data.record;
                	this.addResult();
                }
            });
        },
        startRecog() {
            let params = {
                'asrType': '',
                'message': '',
                'roomId': '',
                'trialId': this.$route.query.trialId
            };
            let _this = this;
            this.startAsr(params).then(res => {
                if (res.code == 0) {
                    this.$message.success(res.msg);
                    _this.isStartRecog = true;
                }
            });
        },
        stopRecog() {
            let params = {
                'asrType': '',
                'message': '',
                'roomId': '',
                'trialId': this.$route.query.trialId
            };
            let _this = this;
            this.stopAsr(params).then(res => {
                if (res.code == 0) {
                    this.$message.success(res.msg);
                    _this.isStartRecog = false;

                }
            });
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
