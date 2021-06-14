/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
<template>
    <div id="app">
        <a-config-provider :locale="locale">
            <router-view v-if="isRouterAlive"></router-view>
        </a-config-provider>
    </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import { mapMutations, mapGetters, mapActions } from 'vuex';

import { global, requestFullScreen, isFullscreen  } from '@/utils/utils.js';
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

let beforeUnloadTime,
    gapTime;
let hidden,
    visibilityChange;
if (typeof document.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
} else if (typeof document.mozHidden !== 'undefined') {
    hidden = 'mozHidden';
    visibilityChange = 'mozvisibilitychange';
} else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
} else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
}
export default {
    // 刷新当前页方法
    provide() {
        return {
            reload: this.reload,
            caseTypeList: () => this.caseTypeList || [],
            systemConfigList: () => this.systemConfigList || [],
            trialStatusList: () => this.trialStatusList || [],
            systemConfig: () => this.systemConfig || {}
        };
    },
    data() {
        return {
            gap_time: '',
            isRouterAlive: true,
            systemConfigObj: {},
            locale: zhCN
        };
    },
    computed: {
        ...mapGetters(['userInfoGet', 'tokenGet'])
    },
    watch: {
        tokenGet: {
            handler() {
                let _this = this;
                this.$nextTick(async () => {
                    if (_this.tokenGet) {
                        // debugger;
                        _this.vToken().then(async (res) => {
                            if (res) {
                                _this.caseTypeList = await _this.commFilter.queryDictValue({ type: 'case_type' });
                                _this.trialStatusList = await _this.commFilter.queryDictValue({ type: 'trial_status' });
                                await _this.getSystemConfig('fxpt');
                                await _this.getSystemConfig('courtName');
                            }

                        });
                    }
                });
            },
            deep: true,
            immediate: true
        },
        global: {
            handler(newVal, oldVal) {
                console.log('global', newVal, oldVal);
                // this.reload();
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        // app created 只会在初次加载和浏览器刷新执行,全屏切换只是执行app update
        console.log('app created', JSON.parse(sessionStorage.getItem('state')));

    },
    mounted() {
        // 对于ie|谷歌|360：
        // 页面加载时只执行onload
        // 页面刷新时，刷新之前执行onbeforeunload事件，在新页面即将替换旧页面时onunload事件，最后onload事件。
        // 页面关闭时，先onbeforeunload事件，再onunload事件。
        // 对于火狐:
        // 页面刷新时，只执行onunload；页面关闭时，只执行onbeforeunload事件
        console.log('app mounted', JSON.parse(sessionStorage.getItem('state')));
        let _this = this;

        // window.onbeforeunload = function(e) {
        //     console.log('onbeforeunload');
        //     beforeUnloadTime = new Date().getTime();
        //     console.log('onbeforeunload', beforeUnloadTime);
        // };
        // window.addEventListener('unload', this.saveState);
        // 找到当前浏览器支持的hidden属性名和visibilitychange事件名
        // 使用sessionStroage后不做路由记录存储跳转
        // window.addEventListener(visibilityChange, this.visibilityChangeEvent(hidden));
    },
    beforeDestroy() {
        console.log('app beforeDestroy');
        // window.removeEventListener(visibilityChange, this.visibilityChangeEvent(hidden));
        // window.sessionStorage.clear();
    },
    updated() {
        console.log('app updated', JSON.parse(sessionStorage.getItem('state')));
    },
    methods: {
        ...mapActions('moduleLogin', ['tokenVerify']),

        saveState() {
            gapTime = new Date().getTime() - beforeUnloadTime;
            if (gapTime <= 5) {
                // 浏览器关闭
                console.log('浏览器关闭');
            } else {
                // 浏览器刷新
                console.log('浏览器刷新');
            }
        },
        visibilityChangeEvent(hidden) {
            let data = sessionStorage.getItem('state')
                ? JSON.parse(sessionStorage.getItem('state'))
                : { userInfo: { id: '' } };
            console.log('visibilitychange', 'global.aaa\n' + global.aaa, 'data.userInfo.id\n' + data.userInfo.id);
            // this.$message.success(`visibilitychange,global.aaa${global.aaa},data.userInfo.id${data.userInfo.id}`);
            if (document[hidden] == false && global.aaa != data.userInfo.id) {
                // this.$message.success('visibilitychange show')
                // window.location.reload();
                // debugger;
                // if (window.location.href.indexOf('signature') > -1) {
                //     this.$router.push({
                //         path: '/signature',
                //         query: { trialId: sessionStorage.getItem('trialId') }
                //     });
                // } else if (window.location.href.indexOf('partyTrial') > -1) {
                //     console.log('party page router');
                // } else {
                //     this.linkToCurPage();
                // }
                // global.aaa = data.userInfo.id; // 只有当初始创建的aaa不等于sessionStorage里面的userId的时候去覆盖掉这个aaa

            }
            if (document[hidden] == true) {
                // this.$message.success('visibilitychange hide')
            }
        },
        linkToCurPage() {
            let routerItem = sessionStorage.getItem('router') ? JSON.parse(sessionStorage.getItem('router')) : null;
            console.log('routerItem', routerItem);
            if (routerItem) {
                this.$router.push({
                    path: routerItem.path,
                    query: routerItem.query
                });
            }
            // else {
            //     window.sessionStorage.clear();
            // }
        },
        vToken() {
            // eslint-disable-next-line no-unused-vars
            let _this = this;
            return this.tokenVerify(this.tokenGet).then((res) => {
                if (res.code == 0) {
                    // debugger;
                    return Promise.resolve(true);
                } else if (res.code == 10401) {
                    // debugger;
                    return Promise.resolve(false);
                } else {
                    // return  Promise.resolve(res.code);
                    // this.$message.error('验证失败,请联系管理员!');
                }
            });
        },
        reload() {
            this.isRouterAlive = false;
            this.$nextTick(function() {
                this.isRouterAlive = true;
            });
        },
        goBack() {
            this.$router.go(-1);
        },
        getSystemConfig(keyCode) {
            this.commFilter.querySystemConfig(keyCode).then((res) => {
                this.systemConfigObj = Object.assign(this.systemConfigObj, res);
                console.log('getSystemConfig', this.systemConfigObj);
                this.systemConfig = this.systemConfigObj;
            });
        }
    }
};
</script>
<style lang="less">
/* 定义滚动条 */

//  滚动条整体部分
::-webkit-scrollbar {
    width: 15px;
    height: 15px;
}

// 滚动条里面的小方块，能向上向下移动（或往左往右移动，取决于是垂直滚动条还是水平滚动条
::-webkit-scrollbar-thumb {
    background: #aaa;
    min-width: 150px;
    border-radius: @border_radius_large;
    //   background-color: #0ae;
    //   background-image: -webkit-gradient(
    //     linear,
    //     0 0,
    //     0 100%,
    //     color-stop(0.5, rgba(255, 255, 255, 0.2)),
    //     color-stop(0.5, transparent),
    //     to(transparent)
    //   );
}

::-webkit-scrollbar-thumb:vertical:hover {
    background: #555555;
}

::-webkit-scrollbar-thumb:horizontal:hover {
    background: #555555;
}

// 滚动条的轨道（里面装有Thumb）
// ::-webkit-scrollbar-track
// {
//     -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
//     border-radius: @border_radius_large;
//     background-color: #F5F5F5;
// }

// 滚动条的轨道的两端按钮，允许通过点击微调小方块的位置。
// ::-webkit-scrollbar-button {
//   width: 10px;
//   height: 20px;
//   background: aquamarine;
// }

// 内层轨道，滚动条中间部分（除去）
::-webkit-scrollbar-track-piece {
    background-color: #eee;
    border-radius: @border_radius_middle;
}

// ::-webkit-scrollbar-corner 边角，即两个滚动条的交汇处

// :-webkit-resizer 两个滚动条的交汇处上用于通过拖动调整元素大小的小控件

#app {
    //   scrollbar-arrow-color: aqua;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: @text_color_black;
    min-width: 1024px;
    min-height: 600px;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-size: @font28px;
}
// #nav {
//   padding: 30px;
//   a {
//     font-weight: bold;
//     color: #2c3e50;
//     &.router-link-exact-active {
//       color: #42b983;
//     }
//   }
// }
</style>
