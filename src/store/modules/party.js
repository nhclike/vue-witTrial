/* 当事人-模块接口 */

/* eslint-disable no-unused-vars */

// application/json默认格式，无需添加请求头
const configFormURL = {
    headers: { 'Content-Type': 'application/x-www-form-urlencodeed' }
};
const configFormData = { headers: { 'Content-Type': 'multipart/form-data' } };
const configFormText = { headers: { 'Content-Type': 'text/xml' } };
const configJson = {'headers': {'Content-Type': 'application/json'}};

export default {
    namespaced: true,
    state: {
    },
    getters: {
    },
    mutations: {
    },
    actions: {
        /** ***********************当事人签到start******************************/
        /* 当事人peopleKey登录 */
        async peopleIpLogin({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/userLogin/peopleIpLogin?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /* 保存签到信息 */
        async saveSignIn({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/signIn/save?t=${Math.random()}`, params, configJson);
            return res.data;
        }
        /** ***********************当事人签到end******************************/

    }
};
