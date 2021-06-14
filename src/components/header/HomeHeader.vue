/* 主框架-头部-组件
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:26:01
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-20 10:12:23
 */

<template>
    <div class="header clearfix">
        <div class="logo fl">
            <img src="@/assets/images/logo.png" />
            <span class="sys-name">人民法院智慧庭审系统</span>
        </div>
        <div class="right fr full-height">
            <span>欢迎您,{{userInfoGet.name}}</span>
            <span>{{date}}</span>
            <span class="btn" v-show="isShowWorkBench" @click="changeRouter('/main/judge/workbench')">
                <i class="i-workBench"></i>工作台
            </span>
            <!-- <span class="btn" v-show="isShowTrialLiving" @click="changeRouter('/main/judge/trialliving')">
                <i class="i-trialLiving"></i>庭审直播
            </span> -->
            <span class="btn" @click="logOutSys()">
                <i class="i-exit"></i>退出
            </span>
        </div>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'HomeHeader',
    components: {},
    inject: ['reload'],
    data() {
        return {
            date: new Date().Format('yyyy年MM月dd日 hh:mm')
        };
    },
    computed: {
        ...mapGetters(['userInfoGet']),
        isShowWorkBench() {
            return this.comm.isAuthorizeShow('workbench');
        },
        isShowTrialLiving() {
            // return true;
            return this.comm.isAuthorizeShow('trialLiving');
        }

    },
    watch: {},
    created() {
        // this.init();
    },
    mounted() {
        let _this = this; // 声明一个变量指向Vue实例this，保证作用域一致
        this.timer = setInterval(() => {
            _this.date = new Date().Format('yyyy年MM月dd日 hh:mm'); // 修改数据date
        }, 1000);
        // this.init();
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
        }
    },
    methods: {
        ...mapActions('moduleLogin', ['logOut']),
        logOutSys() {
            window.sessionStorage.clear();
            window.opener = null;
            window.open('', '_self');
            window.location.href = 'about:blank';
            window.close();
        },
        changeRouter(path) {
            this.$router.push({
                path: path
                // query: { caseNo: item.caseNo }
            });
        }
    }
};
</script>

<style scoped lang="less">
.header {
    height: @top_menu_h;
    padding: 0 40px;
    .logo {
        display: flex;
        align-items: center;
        height: @top_menu_h;
        img {
            width: 106px;
            height: 114px;
            margin-top: 15px;
        }
        .sys-name {
            font-size: 56px;
            color: @text_color_white;
        }
    }
    .right {
        display: flex;
        align-items: center;
        color: @color_primary;
        font-size: @font34px;
        span {
            &:not(:first-child) {
                margin-left: 50px;
            }
            &.btn {
                cursor: pointer;
            }
        }
    }
}
</style>
<style lang="less">
</style>

