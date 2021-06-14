/* 庭审-模块接口 */
const configJson = {'headers': {'Content-Type': 'application/json'}};
export default {
    namespaced: true,
    state: {
        proveInfo: {}, // 质证消息通信中使用的参数
        recordId: '' // 庭审记录id---每个庭审只会有一个(在庭审操作的时候会改变)

    },
    getters: {
        proveInfoGet: (state, getters, rootState) => {
            return state.proveInfo;
        },

        recordIdGet: (state, getters, rootState) => {
            return state.recordId;
        }
    },
    mutations: {
        proveInfoMut(state, proveInfo) {
            state.proveInfo = proveInfo;
        },

        recordIdMut(state, recordId) {
            state.recordId = recordId;
        }
    },
    actions: {
        /** **********************庭审相关start************************/
        /* 获取今日庭审列表 */
        async queryTodayTrialTop5({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/queryTodayTrialTop5?t=${Date.now()}`, params);
            return res.data;
        },
        /* 查询单个庭审信息 */
        async queryTrialById({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/queryTrialById/${params.trialId}?t=${Date.now()}`, params);
            return res.data;
        },
        /* 案件基本信息 */
        async queryTrialDetail({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/queryTrialDetail?t=${Date.now()}`, params, configJson);
            return res.data;
        },
        /* 得到当前用户庭审角色权限 */
        async getTrialRolePerm({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/getTrialRolePerm?t=${Date.now()}`, params, configJson);
            return res.data;
        },
        /* 获取庭审消息数据 */
        async getMessageData({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/im/message/${params.trialId}?t=${Date.now()}`, params, configJson);
            return res.data;
        },
        /* 校验当前登录当事人是否可以阅卷 */
        async dossierViewVerify({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/dossierViewVerify?t=${Date.now()}`, params, configJson);
            return res.data;
        },
        /* 获取庭审的原被告类型 */
        async peopleTypes({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/peopleTypes?t=${Date.now()}`, params, configJson);
            return res.data;
        },
        /** **********************庭审相关end************************/

        /** **********************庭审操作相关start************************/
        /* 开庭/恢复庭审 */
        async openCourt({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/trialCourt/openCourt?t=${Date.now()}`, params);
            return res.data;
        },
        /* 闭庭 */
        async closeCourt({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/trialCourt/closeCourt/${params.trialId}?t=${Date.now()}`);
            return res.data;
        },
        /* 暂停庭审 */
        async pauseCourt({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/trialCourt/pauseCourt/${params.trialId}?t=${Date.now()}`);
            return res.data;
        },
        /* 增录NVR录像 */
        async addNRURecord({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/trialCourt/addNRURecord?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取庭审状态 */
        async getTrialStatus({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/trialCourt/getTrialStatus/${params.trialId}?t=${Math.random()}`);
            return res.data;
        },
        /* 获取增录通道列表 */
        async getAddChannelInfo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/getAddChannelInfo?t=${Date.now()}`, params);
            return res.data;
        },
        /* 开庭播报 */
        async queryCourtVideoList({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/openCourtVideo/queryAll?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取远程庭审关联设备 */
        async queryTrialDevice({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/queryTrialDevice/${params.trialId}?t=${Date.now()}`, params);
            return res.data;
        },

        /** **********************庭审操作相关end************************/
        /* --------------------庭审画面-开始-------------------- */
        /* 获取庭审直播流地址 */
        async getLiveAddress({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/trialCourt/getLiveAddress/${params.trialId}?t=${Date.now()}`);
            return res.data;
        },
        /* 获取庭审输入通道列表 */
        async getTrailInputChannelList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/getInputChannelInfo?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取庭审输出通道列表 */
        async getTrailOutChannelList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/getOutputChannelInfo?t=${Date.now()}`, params);
            return res.data;
        },
        /* 视频切换 */
        async changeVideo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/changeVideo?t=${Date.now()}`, params);
            return res.data;
        },
        /* 闭庭后大屏切回合成画面 */
        async backToSynthesis({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/backToSynthesis?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取本地直播流地址 */
        async getLiveAddressOnlyLocal({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/trialCourt/getLiveAddressOnlyLocal?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取直播流原被告屏幕 */
        async getLiveAddressForYBG({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/trialCourt/getLiveAddressForYBG?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取当事人视频切换列表 */
        async getDsrChannel({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/videoSwitch/getDsrChannel?t=${Date.now()}`, params);
            return res.data;
        },
        /* 获取所有启用法庭的直播地址 */
        async getLiveGroupByRoom({ commit }, params) {
            this._vm.$loading.showLoading('.courtList');
            let res = await axios.post(`${__API__}/trial/trial/getLiveGroupByRoom?t=${Date.now()}`, params);
            this._vm.$loading.hideLoading();
            return res.data;
        },
        /* 根据法庭id获取庭审中的案件以及直播地址 */
        async getLiveByRoomId({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/getLiveByRoomId/${params.courtroomId}?t=${Date.now()}`);
            return res.data;
        },
        /* --------------------庭审画面-结束-------------------- */

        /** **********************质证start************************/
        /* 质证列表 */
        async queryProveList({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/prove/list?t=${Date.now()}`, params, configJson);
            return res.data;
        },
        /* 查看当前用户在庭审中正在质证的质证信息 */
        async viewProvingPic({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/prove/viewProvingPic/${params.trialId}?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /* 质证分享人员类型选择 */
        async queryShareList({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/prove/shareList/${params.trialId}?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /* 保存质证图片 */
        async saveProvePhotoToURL({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/prove/save?t=${Date.now()}`, params, configJson);
            return res.data;
        },
        /* 校验质证操作 */
        async proveVerify({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/prove/proveVerify/${params.trialId}?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /** ***********************质证end************************/
        /** ***********************电子卷宗和影音证据start************************/
        /* 获取电子卷宗数据 */
        async getDossier({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/cases/dossier/getDossier?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /* 查询影音证据树 */
        async getTrialFileTree({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/trialFile/getTrialFileTree?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /* 查询影音证据 */
        async getTrialFile({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/trialFile/getTrialFile?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /* 刪除影音证据 */
        async deleteTrialFile({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/trialFile/deleteTrialFile?t=${Math.random()}`, params, configJson);
            return res.data;
        },
        /** ***********************电子卷宗和影音证据end************************/

        /** ***********************材料相关start************************/


        /* 查询材料文件 */
        async getMaterialFile({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/cases/dossier/getMaterialFile?t=${Math.random()}`, params);
            return res.data;
        },
        /* 查询标注 */
        async getAnnotate({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/annotate/getAnnotate?t=${Math.random()}`, params);
            return res.data;
        },
        /* 保存标注 */
        async saveAnnotate({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/annotate/saveAnnotate?t=${Math.random()}`, params);
            return res.data;
        },
        /* 删除标注 */
        async deleteAnnotate({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/annotate/deleteAnnotate?t=${Math.random()}`, params);
            return res.data;
        },
        /** ***********************材料相关end************************/
        /** ***********************备忘录start************************/

        /* 查询备忘录 */
        async getMemo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/memo/getMemo?t=${Math.random()}`, params);
            return res.data;
        },
        /* 保存备忘录 */
        async saveMemo({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/memo/saveMemo?t=${Math.random()}`, params);
            return res.data;
        },
        /** ***********************备忘录end************************/
        /** ***********************笔录打点相关start************************/
        /* 获取打点列表 */
        async findListDot({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/dot/findListDot?t=${Math.random()}`, params);
            return res.data;
        },
        /* 保存打点 */
        async saveDot({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/dot/saveDot?t=${Math.random()}`, params);
            return res.data;
        },
        /* 更新打点 */
        async updateDot({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/dot/updateDot?t=${Math.random()}`, params);
            return res.data;
        },
        /* 更新打点 */
        async deleteDot({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/dot/deleteDot/${params.id}?t=${Date.now()}`, params);
            return res.data;
        },
        /* 上传签名图片 */
        async uploadSignPic({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/noteViewNotice/noteSignIMGSave?t=${Math.random()}`, params);
            return res.data;
        },
        /* 更新签名状态 */
        async updateSignStatus({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/trial/noteViewNotice/noteSignStatusSave?t=${Math.random()}`, params);
            return res.data;
        },
        /* 获取笔录传阅状态 */
        async getNoteCirculationStatus({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/getNoteviewStatus/${params}?t=${Math.random()}`);
            return res.data;
        },
        /** ***********************笔录相关end************************/
        /** ***********************语音识别相关start************************/
        // 开始语音识别
        async startAsr({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/start?t=${Math.random()}`, params);
            return res.data;
        },
        // 结束语音识别
        async stopAsr({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/stop?t=${Math.random()}`, params);
            return res.data;
        },
        // 初始化语音识别数据
        async initAsr({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/init?t=${Math.random()}`, params);
            return res.data;
        },
        // 修改语音识别
        async editAsr({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/edit/?t=${Math.random()}`, params);
            return res.data;
        },
        // 清空语音识别
        async clearAsr({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/clear/?t=${Math.random()}`, params);
            return res.data;
        },
        // 语音识别切换
        async transfAsr({ commit }, params) {
            let res = await axios.post(`${__API__}/trial/asr/transfAsr/?t=${Math.random()}`, params);
            return res.data;
        },
        /** ***********************语音识别相关end************************/

        /** **********************签到start************************/

        /* 获取录像视频列表 */
        async querySignInList({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/trial/signIn/list/${params.trialId}?t=${Math.random()}`, params);
            return res.data;
        },
        /** **********************签到start************************/
        /** **********************打点记录回放start************************/

        /* 获取录像视频列表 */
        async queryRecordList({ commit }, params) {
            let res = await axios.get(`${__API__}/trial/video/queryRecordList/${params.trialId}?t=${Math.random()}`, params);
            return res.data;
        }
        /** **********************打点记录回放start************************/
    }
};
