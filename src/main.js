import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@babel/polyfill'; // 兼容ie
import 'default-passive-events';
import './plugins/Antd.js'; // 引入ant-design-vue插件
import './plugins/element.js'; // 引入element-ui插件
// import './plugins/echarts';// 引入echarts
import './plugins/video'; // 引入视频播放插件
import '@/assets/style/common.less'; // 引入公用样式-在element-ui插件之后引入，防止样式被覆盖
import '@/plugins/rem'; // 引入px与rem换算方法
import '@/utils/loading'; // 引入加载中插件,用于接口请求前后加载中
import './mixins/filter';
import CusConfirm from '@/plugins/CusConfirm.js'; // 引入带iframe的确认框
import CusTips from '@/plugins/CusTips.js'; // 引入带iframe的提示框
import VueLazyload from 'vue-lazyload';

let loadingImg = require('@/assets/images/icon/icon-loading.gif');
let errorImg = require('@/assets/images/icon/icon-error.png');
Vue.use(VueLazyload, {
    preLoad: 1.3,
    error: errorImg,
    loading: loadingImg,
    attempt: 1
});
Vue.prototype.$CusConfirm = CusConfirm.install; // 全局注册Confirm
Vue.prototype.$CusTips = CusTips.install; // 全局注册Confirm

const commJs = require('@/utils/comm.js');
let comm = {
    install(Vue) {
        Vue.prototype.comm = commJs;
    }
};
Vue.use(comm); // 注册comm.js为全局js，页面中使用this.comm.方法名即可

const filterJs = require('@/mixins/filter.js');
let commFilter = {
    install(Vue) {
        Vue.prototype.commFilter = filterJs;
    }
};
Vue.use(commFilter); // 注册filter.js为全局js，页面中使用this.commFilter.方法名即可

Vue.config.productionTip = false; // 阻止启动生产消息

// 路由跳转前处理
router.beforeEach((to, from, next) => {
    console.log('isLogin', sessionStorage.getItem('isLogin'));
    console.log('router处理');
    console.log('to', to, 'form', from);

    // 关闭所有消息提示
    if (vm) {
        vm.$message.closeAll();
    }
    // 未匹配的页面到404
    if (to.matched.length === 0) {
        next({ path: '/404' });
    } else if (to.path.indexOf('/login') > -1) {
        // 登录页面拦截
        // 1未登录则不拦截
        // 2已登录跳转到之前保存的页面
        // 3没有之前保存的页面则不拦截
        // if (store.state.isLogin == 1) {
        //     let routerItem = sessionStorage.getItem('router') ? JSON.parse(sessionStorage.getItem('router')) : null;
        //     console.log('routerItem', routerItem);
        //     if (routerItem) {
        //         next({
        //             path: routerItem.path,
        //             query: routerItem.query
        //         });
        //     } else {
        //         next();
        //     }
        // } else {
        //     next();
        // }
        next();
    } else if (to.matched.some((record) => record.meta.requireAuth)) {
        // 需要权限的页面存储
        // let toRouter = {
        //     path: to.path,
        //     query: to.query
        // };
        // let toStr = JSON.stringify(toRouter);
        // 存储当前路由
        // sessionStorage.setItem('router', toStr);
        // 判断用户是否登陆
        // 1已登录直接跳转
        // 2未登录重定向到登录页面
        // if (store.state.isLogin == 1) {
        //     next();
        // } else {
        //     if (store.state.role === 'judge') {
        //         next({ path: '/login/judgeEntry' });
        //     } else if (store.state.role === 'party') {
        //         next({ path: '/partyTrial' });
        //     }
        //     else {
        //         next();
        //     }
        // }
        next();
    } else {
        next();
    }
});

axios.defaults.timeout = 60000;

// 请求拦截器-请求之前
axios.interceptors.request.use(
    (request) => {
        // vm.$loading.showLoading();
        // request.headers['Accept'] = 'application/json;charset=UTF-8';
        // console.log('JSON.parse(sessionStorage.getItem(state))',JSON.parse(sessionStorage.getItem('state')))
        if (sessionStorage.getItem('state') && JSON.parse(sessionStorage.getItem('state')).token) {
            request.headers.token = JSON.parse(sessionStorage.getItem('state')).token;
        }
        return request;
    },
    (err) => {
        // vm.$loading.hideLoading();
        console.log('request---err', err);
        return Promise.reject(err);
    }
);

// 请求拦截器-请求之后
axios.interceptors.response.use(
    (response) => {
        // vm.$loading.hideLoading();
        if (response.data.code === 0) {
            return response;
        } else {
            if (response.data.code === 401) {
                sessionStorage.setItem('isLogin', 0);
                // store.state.isLogin = 0;
                if (sessionStorage.getItem('role') == 'party') {
                    // debugger;
                    vm.$router.push('/partyTrial');
                    // vm.$messageError('验证失效,请重新登录!');
                } else {
                    // debugger;
                    vm.$router.push('/login/judgeEntry');
                    // vm.$messageError('验证失效,请重新登录!');
                }
            } else if (response.data.msg) {
                // debugger;
                vm.$messageError(response.data.msg);
            } else {
                return response;
            }
        }
        return response;
    },
    (error) => {
        // vm.$loading.hideLoading();
        console.log(error.response, 'error.response');
        console.log(error.code, 'error.code');
        if (error && error.response) {
            let status = error.response.status;
            switch (status) {
                case 404:
                    vm.$router.push('/404');
                    window.sessionStorage.clear();
                    break;
                case 500:
                    vm.$router.push('/500');
                    window.sessionStorage.clear();

                    break;
                default:
                    break;
            }
        } else {
            try {
                if (error.message.includes('timeout')) {
                    vm.$messageError('请求超时!');
                } else {
                    vm.$messageError('连接服务器失败，请稍后再试!');
                }
            } catch (err) {
                console.log('err', err);
                vm.$messageError('连接服务器失败，请稍后再试!');
            } finally {
                sessionStorage.setItem('isLogin', 0);
                // if (sessionStorage.getItem('role') == 'party') {
                //     vm.$router.push('/partyTrial');
                // } else {
                //     vm.$router.push('/login/judgeEntry');
                // }
            }
        }
        return Promise.reject(error.response);
    }
);

// 注册vue
const vm = new Vue({
    router,
    store,
    // 全局提供sessionStorage的userInfo信息，需要使用时在export default中注入inject: ["userInfo"],
    provide: {
        userInfo: () => JSON.parse(sessionStorage.getItem('state') || '{"userInfo":"{}"}').userInfo
    },
    render: (h) => h(App)
}).$mount('#app');
