
/* 警务助手相关接口 */

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

        /* 获取当天消息列表 */
        async getTodayMsgData({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/bailiffHelper/list?t=${Date.now()}`, params);
            return res.data;
        },

        /* 获取某庭审历史消息列表 */
        async getHistoryMsgDataByTrailId({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/bailiffHelper/history/`+params+`?t=${Date.now()}`);
            return res.data;
        },

        /* 获取被告列表 */
        async getDefendantData({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/bailiffHelper/defendantList/${params}?t=${Math.random()}`);
            return res.data;
        },

        /* 处理某消息 */
        async handleMsgById({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/bailiffHelper/handle/${params}?t=${Math.random()}`);
            return res.data;
        },

        /* 获取法庭列表 */
        async getCourtListWithLiveUrl({ commit }) {
            let res = await axios.get(`${__API__}/trial/roomAndDevices/queryCourtroomAndStream?t=${Math.random()}`);
            return res.data;
        }

    }
};
