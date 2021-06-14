/*无操作项的庭审头部(庭审后页面使用)
 * @Author: nihc
 * @Date: 2020-09-08 11:23:37
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-08 11:08:25
 */


<template>
    <el-row class="header">
        <el-col :span="22" class="logo">
            <img class="caseIcon" src="/images/trial/caseName.png" />
            <span
                v-if="caseCodes.length < 1"
                class="case-name txt-ellipsis"
                :title="caseName"
                >{{ caseName }}</span
            >
            <el-select
                v-else
                class="el-select_transparent_caseCode case-name"
                v-model="caseName"
                placeholder=""
                @change="changeCaseCode"
            >
                <el-option
                    v-for="(item, index) in caseCodes"
                    :key="index"
                    :label="item"
                    :value="item"
                ></el-option>
            </el-select>
            <span class="randomNum">本案随机码:{{randomNum}}</span>
        </el-col>
        <el-col :span="2" class="full-height">
            <div class="goBack-box" @click="goBack()">
                <img src="/images/trial/goBack.png" />
                <span class="goBack">返回</span>
            </div>
        </el-col>
    </el-row>
</template>
<script>
// import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
    name: 'TrialHeader',
    components: {},
    inject: ['reload'],
    props: {
        randomNum: {
            type: String,
            default: '666666'
        },
        caseName: {
            type: String,
            default: 'asdasdad'
        },
        caseCodes: {
            type: Array,
            default: []
        }
    },
    data() {
        return {

        };
    },
    computed: {

    },
    watch: {},
    created() {
        //
    },
    mounted() {
        let _this = this; // 声明一个变量指向Vue实例this，保证作用域一致

        this.timer = setInterval(() => {
            _this.date = new Date().Format('yyyy年MM月dd日 hh:mm'); // 修改数据date
        }, 1000);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
        }
    },
    methods: {
        goBack() {
            this.$router.push({
                path: this.$route.query.fromWorkBench ? '/main/judge/workbench' : '/main/judge'
            });
        },

        // 切换并案案号
        changeCaseCode(caseCode) {
            this.$emit('emitCaseCode', caseCode);
        }
    }
};
</script>

<style scoped lang="less">
.header {
    height: @trial_top_menu_h;
    padding: 40px 40px 30px 40px;
    .logo {
        color: #fff;
        height: 100%;
        display: flex;
        align-items: center;
        vertical-align: middle;

        .caseIcon {
            height: 40px;
        }
        .case-name {
            font-size: @font38px;
            margin-right: 30px;
        }
        .randomNum {
            font-size: @font24px;
            margin-top: 10px;
            opacity: 0.7;
        }
        .opt-box {
            flex: 1;
            text-align: center;
            margin: 0;
            justify-content: center;
            .switchItem{
                /deep/.ant-switch{
                    background: @color_grey;
                    padding: 0 8px;
                    height: 28px;
                    .ant-switch-inner{
                        font-size: @font20px;
                    }
                    &::after{
                        width: 24px;
                        height: 24px;
                    }
                }
                /deep/.ant-switch-checked{
                    background: @color_success;
                }
                span{
                    margin-left: 10px;
                    font-size: @font20px;
                }
                margin-right: 10px;
            }
            .btn-item {
                background-color: @bg_box;
                color: @color_primary;
                font-size: @font24px;
                margin: 0 10px;
                padding: 8px 10px;
                border-radius: 5px;
                border: 1px solid transparent;
                line-height: normal;
                cursor: pointer;
                &.active {
                    background-color: @color_primary;
                    color: @bg_box;
                }
                &.disabled {
                    background-color: @color_info;
                    color: @text_color_white;
                    cursor: not-allowed;
                }
                &.red {
                    color:@color_danger;
                }
                img {
                    height: 30px;
                    width: 30px;
                    margin: 0;
                }
            }
        }
    }
    .goBack-box {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        cursor: pointer;
        img {
            width: 40px;
            height: 40px;
        }
        .goBack {
            font-size: @font28px;
            color: @color_primary;
            margin-left: 10px;
            height: 45px;
            line-height: 45px;
        }
    }
}
</style>
<style lang="less">
</style>

