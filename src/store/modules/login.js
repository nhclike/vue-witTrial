/* 登录-模块接口 */

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
        /* sys 登录 */
        async sysLogin({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/userLogin/login?t=${Math.random()}`, params);
            return res.data;
        },
        /* 获取用户信息(需要传userId用于用户更新) */
        async getUserInfo({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/sys/user/info?t=${Math.random()}`, params);
            return res.data;
        },
        /* 获取当前用户信息(不需要传参数) */
        async getCurUserInfo({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/sys/user/info?t=${Math.random()}`, params);
            return res.data;
        },
        /* 当事人AI登录 */
        async AILogin({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/userLogin/AILogin?t=${Math.random()}`, params);
            return res.data;
        },
        /* 人脸图片检测 */
        async faceDetection({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/userLogin/faceDetection?t=${Math.random()}`, params,configJson);
            return res.data;
        },
        /* 当事人 登录 */
        async casePeopleLogin({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/userLogin/casePeopleLogin?t=${Math.random()}`, params);
            return res.data;
        },
        /* 退出 */
        async logOut({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/sys/userLogin/logout?t=${Date.now()}`, params);
            return res.data;
        },
        /* 让token失效 */
        async tokenExpires({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/base/token/expires?t=${Math.random()}`, params,configJson);
            return res.data;
        },
        /* 校验token*/
        async tokenVerify({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/base/token/verify?t=${Math.random()}`, params,configJson);
            return res.data;
        },
        /* 获取当前案件所有登录用户 */
        async getAllLoginUsersInfo({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/noteViewNotice/getNoteViewConcurrentUser/${params}?t=${Date.now()}`);
            return res.data;
        }
    }
};
