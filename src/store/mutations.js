/* mutation处理总入口 */
export default {
    isLoginMut(state, isLogin) {
        state.isLogin = isLogin;
        sessionStorage.setItem('state', JSON.stringify(state));
        sessionStorage.setItem('isLogin', isLogin);
    },
    userInfoMut(state, userInfo) {
        state.userInfo = userInfo;
        sessionStorage.setItem('state', JSON.stringify(state));
    },
    clearStateMut(state, userInfo) {
        state = {};
        sessionStorage.removeItem('state');
    },
    tokenMut(state, token) {
        state.token = token;
        sessionStorage.setItem('state', JSON.stringify(state));
    },
    trialRoleMut(state, trialRole) {
        state.trialRole = trialRole;
        sessionStorage.setItem('state', JSON.stringify(state));
    },
    trialPermsListMut(state, trialPermsList) {
        state.trialPermsList = trialPermsList;
        sessionStorage.setItem('state', JSON.stringify(state));
    },
    roleMut(state, role) {
        // 登录的时候设置区分登录入口
        state.role = role;
        sessionStorage.setItem('state', JSON.stringify(state));
        // 登录入口单独存储,只有再次登录成功才会变---token过期会清除state但是不清除role,根据原来入口决定返回到那个登录页面
        sessionStorage.setItem('role', role);
    },
    peoplekeyMut(state, peoplekey) {
        state.peoplekey = peoplekey;
        sessionStorage.setItem('state', JSON.stringify(state));
        sessionStorage.setItem('peoplekey', peoplekey);
    }
};
