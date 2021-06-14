/* 系统管理相关接口
 * @Author: ShiHuiJun
 * @Date: 2020-10-13 10:06:08
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2020-12-01 09:20:44
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
        /* --------------------xy设备-开始-------------------- */
        /* 查询本法院设备 */
        async getCourtDevice({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/device/getCourtDevice`, params);
            return res.data;
        },
        /* 设备列表 */
        async deviceList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/device/list`, params);
            return res.data;
        },
        /* 同步设备 */
        async refreshDevice({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/device/refreshDevice`, params);
            return res.data;
        },
        /* 修改设备名称 */
        async updateDevice({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/device/updateDevice`, params);
            return res.data;
        },
        /* --------------------xy设备-结束-------------------- */

        /* --------------------远程庭审 xy视频会议-开始-------------------- */
        /* 创建远程庭审（会议） */
        async createMeeting({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/createMeeting`, params);
            return res.data;
        },
        /* 剔除设备 */
        async disconnect({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/disconnect`, params);
            return res.data;
        },
        /* 查询远程庭审（会议） */
        async getMeeting({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/getMeeting`, params);
            return res.data;
        },
        /* 邀请设备 */
        async invitation({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/invitation`, params);
            return res.data;
        },
        /* 静音 */
        async mute({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/mute`, params);
            return res.data;
        },
        /* 开始录制 */
        async startRecord({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/startRecord`, params);
            return res.data;
        },
        /* 停止录制 */
        async stopRecord({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/startRecord`, params);
            return res.data;
        },
        /* 取消静音 */
        async unmute({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/xy/meeting/unmute`, params);
            return res.data;
        }
        /* --------------------远程庭审 xy视频会议-结束-------------------- */
    }
};
