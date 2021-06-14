/* 用于请求接口时加载
 * @Author: ShiHuiJun
 * @Date: 2020-01-01 13:26:12
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-19 14:50:15
 */
import Vue from 'vue';
import { Loading, Message } from 'element-ui';

let loadingCount = 0;
let loading;

const startLoading = (target) => {
    // 以服务的方式调用的 Loading 需要异步关闭
    loading = Loading.service({
        lock: true,
        text: '加载中……',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
        target: document.querySelector(target)
    });
};

const endLoading = () => {
    loading.close();
};

setTimeout(() => {
    if (loadingCount > 0) {
        Message({
            message: '连接服务器失败，请稍后再试！',
            // position: position,
            type: 'error',
            duration: 3000
        });
        loading.close();
    }
}, 30000);

export const showLoading = (target) => {
    if (loadingCount === 0) {
        let tg = target || 'body';
        startLoading(tg);
    }
    loadingCount += 1;
};

export const hideLoading = () => {
    if (loadingCount <= 0) {
        return;
    }
    loadingCount -= 1;
    if (loadingCount === 0) {
        endLoading();
    }
};

/**
 * 添加全局加载中
 * @example this.$loading.showLoading();/打开
 * @example this.$loading.hideLoading();//关闭
 * @example this._vm.$loading.showLoading();//Vuex中打开
 * @example this._vm.$loading.hideLoading();//Vuex中关闭
 */

const CusLoading = {
    install(Vue) {
        Vue.prototype.$loading = {
            showLoading,
            hideLoading
        };
    }
};
Vue.use(CusLoading); // 注册loading插件
