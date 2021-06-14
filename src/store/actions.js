/* 公用-接口 */

/* eslint-disable no-unused-vars */
// application/json默认格式，无需添加请求头
const configFormURL = {'headers': {'Content-Type': 'application/x-www-form-urlencodeed'}};
const configFormData = {'headers': {'Content-Type': 'multipart/form-data'}};
const configFormText = {'headers': {'Content-Type': 'text/xml'}};

export default {
    /* --------------------字典-开始-------------------- */
    // 根据code和type查询value
    async queryDictValue({ commit }, params) {
        let res = await axios.post(`${__API__}/trial/sys/dict/queryDictValue`, params);
        return res.data;
    },
    // 模糊查询案由
    async queryCaseCouseByKeyword({ commit }, params) {
        let res = await axios.post(`${__API__}/trial/sys/dict/queryCaseCouseByKeyword`, params);
        return res.data;
    }
    /* --------------------字典-结束-------------------- */
};

