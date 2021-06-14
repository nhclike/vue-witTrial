
<template>
    <div class="case-info full-height">
        <div class="page-title">
            <div class="fl">
                警务记录
            </div>
            <div class="opt-box fr margin-right20" style="display:block">
                <a-button type="primary" class="margin-right20"
                          v-if="isShowCallPolice"
                          @click.stop="handleCallPolice()"
                >带被告</a-button>
            </div>
        </div>
        <div class="form-body">
            <el-form
                label-position="left"
                label-width="2rem"
                status-icon
            >
                <el-form-item v-for="item in msgList"
                              :key="item.id"
                              :label="subStringTime(item.sendTime)"
                >
                    <div class="form-view">
                        <span class="content">{{ item.content }}  {{ item.otherExplain }}</span>
                        <a-button type="primary" v-if="item.status && item.status == 1" disabled>
                            已处理
                        </a-button>
                        <a-button type="primary" v-else @click="handleMsg(item.id,index)">
                            未处理
                        </a-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
    name: 'PoliceHistory',
    inject: ['reload'],
    filters: {},
    props: {
        trialStatus:{
            type:String,
            default:''
        }
    },
    data() {
        return {
            msgList: [],
            isShowCallPolice: false // 是否显示带被告
        };
    },
    computed: {},
    watch: {
        trialStatus:{
            handler(newVal){
                this.isShowCallPolice = (newVal !== '4' && newVal !== '5');
            },
            deep:true,
            immediate:true
        }
    },
    created() {
        // this.init();
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions('modulePolice', ['getHistoryMsgDataByTrailId']),

        // 初始化
        init() {
            this.getMsgList();
        },
        getMsgList() {
            this.getHistoryMsgDataByTrailId(this.$route.query.trialId).then(res => {
                if (res.code === 0) {
                    this.msgList = res.data;
                }
            });
        },
        subStringTime(value) {
            let moment = value.indexOf('-');
            return value.substring(moment+1,value.lastIndexOf(':'));
        },
        handleCallPolice() {
            this.$emit('emitPolice')
        }
    }
};
</script>

<style lang="less" scoped type="text/less">
.case-info {
    overflow-y: auto;
    .page-title{
        padding:0 40px 20px 40px;
        height: 60px;
        line-height: 60px;
        font-size: @font28px;
        color:@text_color_black;
        border-bottom: 1px solid @text_color_white_4;
    }
    /deep/.el-form .el-form-item .el-form-item__label {
        color: @text_color_black;
    }
    .form-body .el-form .el-form-item .el-form-item__content .form-view {
        background: none;
        color: @text_color_black_75;
        display: flex;
        & > span.content{
            flex: 1;
         }
    }
    .form-view button {
        background-color: @bg_box;
        color: @color_primary;
        cursor: default;
        border: 0;
        margin-left: 10px;
        &[disabled] {
            background-color: #909399;
            color: #fff;
        }
    }
}
</style>

<style lang="less">
</style>

