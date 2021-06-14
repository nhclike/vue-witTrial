
/* 系统管理相关接口 */

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
        /* --------------------历史庭审-开始-------------------- */
        /* 按条件查询历史庭审信息 */
        async queryHistoryTrial({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/queryHistoryTrial?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取主案trialId */
        async getMainCaseTrialId({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/getMainCaseTrialId/${params}?t=${Date.now()}`);
            return res.data;
        },

        /* --------------------历史庭审-结束-------------------- */

        /** **********************权限相关start************************/

        /* 获取权限列表 */
        async queryPermList({ commit }) {
            let res = await axios.get(`${__API__}/trial/sys/menu/list?t=${Date.now()}`);
            return res.data;
        },
        /* 获取权限列表 - 左侧菜单 */
        async getLeftPermList({ commit }) {
            let res = await axios.get(`${__API__}/trial/sys/menu/workbenchMenuList?t=${Date.now()}`);
            return res.data;
        },
        /* 获取权限详情 */
        async getPermDetail({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/sys/menu/info/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 新增/修改权限 */
        async addOrUpdatePerm({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/menu/${!params.menuId ? 'save' : 'update'}`, params);
            return res.data;
        },
        /* 删除权限 */
        async deletePerm({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/menu/delete/${params}?t=${Date.now()}`);
            return res.data;
        },

        /** ***********************权限相关end************************/

        /** **********************角色相关start************************/

        /* 获取角色列表 - table格式 */
        async queryRoleList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/role/list?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取角色列表 - 常规格式 */
        async getRoleList({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/sys/role/select?t=${Date.now()}&${params}`);
            return res.data;
        },
        /* 获取角色详情 */
        async getRoleDetail({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/sys/role/info/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 新增/修改角色 */
        async addOrUpdateRole({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/role/${!params.roleId ? 'save' : 'update'}`, params);
            return res.data;
        },
        /* 删除角色 */
        async deleteRole({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/role/delete?t=${Date.now()}`, params);
            return res.data;
        },

        /** ***********************角色相关end************************/

        /* --------------------用户管理-开始-------------------- */
        /* 用户列表 */
        async userList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/user/list?t=${Date.now()}`, params);
            return res.data;
        },
        /* 分部门查询用户 */
        async getUserGroupByDept({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/user/getUserGroupByDept?t=${Date.now()}`, params);
            return res.data;
        },
        /* 新增、修改用户 */
        async addOrUpdateUser({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/user/${!params.id ? 'save' : 'update'}`, params);
            return res.data;
        },
        /* 删除用户 */
        async deleteUser({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/user/delete?t=${Date.now()}`, params);
            return res.data;
        },
        /* 同步用户 */
        async syncUser({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/user/synchroUser?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取用户权限列表 */
        async queryUserPermissionList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/user/dataPrivilege/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 用户权限设置 */
        async saveUserPermission({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/user/allotDataPrivilege?t=${Date.now()}`, params);
            return res.data;
        },
        /* --------------------用户管理-结束-------------------- */

        /** **********************法庭、设备、通道相关start************************/

        /* 获取法庭列表 */
        async queryCourtRoomList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/roomAndDevices/selectAll?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取法庭详情 */
        async getCourtRoomDetail({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/roomAndDevices/selectOne/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 新增/修改法庭 */
        async addOrUpdateCourtRoom({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/roomAndDevices/${!params.courtroomId ? 'save' : 'update'}`, params);
            return res.data;
        },
        /* 删除法庭 */
        async deleteCourtRoom({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/roomAndDevices/delete/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 同步通道 */
        async syncChannelData({ commit }, params) {
            const url = params.flag === '0' ? 'saveAddChannelInfo' : 'getSwitchChannelInfo';
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/` + url, params);
            return res.data;
        },
        /* 获取通道列表 */
        async queryChannelList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/queryChannelList?t=${Date.now()}`, params);
            return res.data;
        },
        /* 修改通道 */
        async updateChannelInfo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/updateChannelInfo?t=${Date.now()}`, params);
            return res.data;
        },
        /* 删除通道 */
        async deleteChannel({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/videoSwitch/deleteChannel/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 获取通道详情 */
        async getChannelDetail({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/videoSwitch/queryChannelDetail/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 保存通道信息 */
        async saveChannelInfo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/saveChannelInfo?t=${Date.now()}`, params);
            return res.data;
        },
        /* 查询语音识别配置 */
        async getSpeechRecogInfo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/roomVoice/getRoomVoice?t=${Date.now()}`, params);
            return res.data;
        },
        /* 保存、修改语音识别配置 */
        async updateSpeechRecog({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/roomVoice/saveOrUpdate?t=${Date.now()}`, params);
            return res.data;
        },
        /* 查询话筒配置 */
        async getMicrophoneInfo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/roomVoice/getMicrophonePerson?t=${Date.now()}`, params);
            return res.data;
        },
        /* 保存、修改话筒配置 */
        async updateMicrophone({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/roomVoice/saveMicrophonePerson?t=${Date.now()}`, params, configJson);
            return res.data;
        },

        /* 验证电脑是否绑定了角色 */
        async checkRoomPcBind({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/roomAndDevices/anon/checkRoomPcBind?t=${Date.now()}`, params);
            return res.data;
        },

        /* 保存法庭电脑绑定角色信息 */
        async saveRoomPc({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/roomAndDevices/anon/saveRoomPc?t=${Date.now()}`, params);
            return res.data;
        },

        /* 同步法庭 */
        async synchroRoom({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/roomAndDevices/synchroRoom?t=${Date.now()}`, params);
            return res.data;
        },

        /** ***********************法庭设备相关end************************/

        /* --------------------部门管理-开始-------------------- */
        /* 部门列表 - table格式 */
        async deptList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/dept/list?t=${Date.now()}`, params);
            return res.data;
        },
        /* 部门列表 - 常规格式 */
        async getDeptListNormal({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/dept/getDept?t=${Date.now()}`, params);
            return res.data;
        },
        /* --------------------部门管理-结束-------------------- */

        /* 系统配置 */

        async systemConfigList({commit}, params) {
            let res = await axios.post(`${__API__}/trial/sys/config/list?t=${Date.now()}`, params);
            return res.data;
        },
        async systemConfigSave({commit}, params) {
            let res = await axios.post(`${__API__}/trial/sys/config/save?t=${Date.now()}`, params);
            return res.data;
        },
        async systemConfigUpdate({commit}, params) {
            let res = await axios.post(`${__API__}/trial/sys/config/update?t=${Date.now()}`, params);
            return res.data;
        },
        async systemConfigDelete({commit}, params) {
            let res = await axios.post(`${__API__}/trial/sys/config/delete?t=${Date.now()}`, params);
            return res.data;
        },
        /** ***********************系统配置相关end************************/

        /* --------------------数据字典-开始-------------------- */
        /* 数据字典列表 - table格式 */
        async dictList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/dict/list?t=${Date.now()}`, params);
            return res.data;
        },
        /* 数据字典详情*/
        async getDictDetailById({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/dict/info/${params}?t=${Date.now()}`);
            return res.data;
        },
        /* 新增修改数据字典*/
        async addOrUpdateDict({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/dict/${!params.id ? 'save' : 'update'}`, params);
            return res.data;
        },
        /* 删除字典 */
        async deleteDict({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/sys/dict/delete?t=${Date.now()}`, params, configJson);
            return res.data;
        }
        /* --------------------数据字典-结束-------------------- */

    }


};
