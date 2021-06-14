/* 系统管理相关接口
 * @Author: ShiHuiJun
 * @Date: 2020-10-13 10:06:08
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-19 11:01:32
 */
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
        /* --------------------排期信息-开始-------------------- */
        /* 并案庭审 */
        async inCorporate({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/inCorporate?t=${Date.now()}`, params);
            return res.data;
        },
        /* 新增排期 */
        async insertTrial({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/insertTrial?t=${Date.now()}`, params);
            return res.data;
        },
        /* 查询并案的所有案号 */
        async queryCorporateCase({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/queryCorporateCase?t=${Date.now()}`, params);
            return res.data;
        },
        /* 按条件查询排期信息 */
        async queryTrial({ commit }, params) {
            this._vm.$loading.showLoading();
            let res = await axios.post(`${__API__}/trial/trial/queryTrial?t=${Date.now()}`, params);
            this._vm.$loading.hideLoading();
            return res.data;
        },
        /* 查询单个排期信息 */
        async queryTrialById({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/queryTrialById/${params.trialId}?t=${Date.now()}`, params);
            return res.data;
        },
        /* 用于并案编辑时查询排期信息 */
        async queryTrialInfoById({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/queryTrialInfoById/${params.trialId}?t=${Date.now()}`, params);
            return res.data;
        },
        /* 删除排期 */
        async removeTrial({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/removeTrial/${params.trialId}?t=${Date.now()}`, params);
            return res.data;
        },
        /* 解除并案 */
        async toSpell({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/toSpell?t=${Date.now()}`, params);
            return res.data;
        },
        /* 更新排期信息 */
        async updateTrial({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/updateTrial?t=${Date.now()}`, params);
            return res.data;
        },
        /* 查询所有法庭的排期信息 */
        async queryAllTrial({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/getTrialGroupByRoom?t=${Date.now()}`, params);
            return res.data;
        },
        /* 查询单个法庭的排期信息 */
        async queryTrialByRoomId({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/queryTrialByRoomId?t=${Date.now()}`, params);
            return res.data;
        },
        /* 用于并案下拉框查询案件信息 */
        async getTrialByCodeAndMainId({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/getTrialByCodeAndMainId?t=${Date.now()}`, params);
            return res.data;
        },

        /* 进入庭审获取案件信息 */
        async toTrialPage({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/toTrialPage/${params.trialId}?t=${Date.now()}`, params);
            return res.data;
        },

        /* 用于新增和编辑排期时，判断选中时间段是否有案件 */
        async isExistTrial({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/isExistTrial`, params);
            return res;
        },

        /* 同步排期 */
        async synchroTrial({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/synchroTrial?t=${Date.now()}`, params);
            return res.data;
        },

        /* 同步卷宗 */
        async synchroDossier({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/cases/dossier/synchroDossier?t=${Date.now()}`, params, configJson);
            return res.data;
        },

        /* --------------------排期信息-结束-------------------- */

        /* --------------------案件信息-开始-------------------- */
        /* 新增案件 */
        async insertCase({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/case/insertCase?t=${Date.now()}`, params);
            return res.data;
        },
        /* 删除案件 */
        async removeCase({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/case/removeCase/${params.caseId}?t=${Date.now()}`, params);
            return res.data;
        },
        /* 按条件查询案件信息 */
        async queryCase({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/case/queryCase?t=${Date.now()}`, params);
            return res.data;
        },
        /* 模糊查询案件信息 */
        async queryCaseByKeyword({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/case/queryCaseByKeyword?t=${Date.now()}`, params);
            return res.data;
        },
        /* 查询单个案件信息 */
        async queryOneCase({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/case/queryOneCase/${params.caseId}?t=${Date.now()}`, params);
            return res.data;
        },
        /* 更新案件信息 */
        async updateCase({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/case/updateCase?t=${Date.now()}`, params);
            return res.data;
        },
        /* 根据案件编号获取案件信息 */
        async queryCaseInfoByAhdm({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/case/queryCaseByAhdm?t=${Date.now()}`, params);
            return res.data;
        },
        /* --------------------案件信息-结束-------------------- */

        /* --------------------法庭与设备信息-开始-------------------- */
        /* 查询法庭 */
        async queryCourtroom({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/roomAndDevices/queryCourtroom?t=${Date.now()}`, params);
            return res.data;
        }
        /* --------------------法庭与设备信息-结束-------------------- */
    }
};
