/* 接口总入口 */
import Vue from 'vue';
import Vuex from 'vuex';
import state from './state';
import mutations from './mutations';
import getters from './getters';
import actions from './actions';

/* XXX模块 */
// import moduleName from './modules/目录';
import moduleLogin from './modules/login';
import moduleJudge from './modules/judge';
import moduleCase from './modules/case';
import moduleSystem from './modules/system';
import modulePolice from './modules/police';
import moduleXyDevice from './modules/xyDevice';
import moduleParty from './modules/party';

// 启用Vuex
Vue.use(Vuex);

export default new Vuex.Store({
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions,
    modules: {
        // moduleName,
        moduleLogin,
        moduleJudge,
        moduleCase,
        moduleSystem,
        modulePolice,
        moduleXyDevice,
        moduleParty
    }
});
