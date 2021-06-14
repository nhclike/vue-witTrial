/* 主框架-头部-组件
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:26:01
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-20 10:13:01
 */

<template>
    <div class="header clearfix">
        <div class="logo fl">
            <img src="@/assets/images/logo.png" />
            <span class="sys-name">人民法院智慧庭审系统</span>
        </div>
        <div class="right fr full-height">
            <span class="btn" @click="goBack()">
                <i class="i-goBack--white"></i>返回
            </span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'WorkBenchHeader',
    components: {},
    inject: ['reload'],
    data() {
        return {
        };
    },
    computed: {
    },
    watch: {},
    created() {
        // this.init();
    },
    mounted() {
        // this.init();
    },

    methods: {
        goBack() {
            // this.$router.go(-1);
            this.$router.push({
                path: '/main/judge'
            });
        }
    }
};
</script>

<style scoped lang="less">
.header {
    height: @workBench_top_menu_h;
    background: url('@{base_url}/workBench/header_bg.png') no-repeat center center / 100% 100%;
    padding: 0 40px;
    .logo {
        display: flex;
        align-items: center;
        height: @workBench_top_menu_h;
        img {
            height: 80px;
            margin-top: 15px;
        }
        .sys-name {
            font-size: 40px;
            color: @text_color_white;
        }
    }
    .right {
        display: flex;
        align-items: center;
        color: @text_color_white;
        font-size: @font28px;
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
