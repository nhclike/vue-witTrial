export default {
    userInfoGet: (state, getters, rootState) => {
        return state.userInfo;
    },
    tokenGet: (state, getters, rootState) => {
        return state.token;
    },
    trialRoleGet: (state, getters, rootState) => {
        return state.trialRole;
    },
    trialPermsListGet: (state, getters, rootState) => {
        return state.trialPermsList;
    },
    roleGet: (state, getters, rootState) => { // 登录的时候设置区分登录入口
        return state.role;
    },
    loginGet: (state, getters, rootState) => { // 登录的时候设置区分登录入口
        return state.isLogin;
    },
    peoplekeyGet: (state, getters, rootState) => {
        return state.peoplekey;
    }
};
