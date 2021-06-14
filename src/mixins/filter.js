/* 过滤
 * @Author: ShiHuiJun
 * @Date: 2020-12-25 15:37:29
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-14 16:02:42
 */
import Vue from 'vue';
import axios from 'axios';
import store from '../store';
const vfilter = {
    statusFilter: function(type) {
        return (
            {
                '0': '已禁用',
                '1': '已启用'
            }[type] || ''
        );
    },
    dictStatusFilter: function(type) {
        return (
            {
                '-1': '已禁用',
                '0': '已启用'
            }[type] || ''
        );
    },
    emptyFilter: function(type) {
        return type ? type : '暂无';
    },
    courtroomTypeFilter: function(type) {
        return (
            {
                '0': '简易庭',
                '1': '标准庭'
            }[type] || ''
        );
    }
};

// 注册filter
for (let key in vfilter) {
    if ({}.hasOwnProperty.call(vfilter, key)) {
        Vue.filter(key, vfilter[key]);
    }
}

let querySystemConfig = async (paramKey) => {
    let res = await axios.get(`${__API__}/trial/sys/config/getByKey/${paramKey}?t=${Date.now()}`, {'headers': {'token': store.state.token}}).then(res => {
        let obj = {};
        if (res.data.code === 0) {
            obj[`${paramKey}`] = res.data.data;
        }
        return obj;
    });
    return res;
};

/**
 * 根据code和type查询value
 * @method queryDictValue
 * @param {Object} params 接口传参
 * @returns {Array} [{'key1':'value1'},{'key2':'value2'}]
 * @example queryDictValue({type: 'case_type'})
 */
let queryDictValue = async (params) => {
    let res = await axios
        .post(`${__API__}/trial/sys/dict/queryDictValue`, params, { headers: { token: store.state.token } })
        .then((res) => {
            let arr = [];
            if (res.data.code === 0) {
                for (let row of res.data.data.values()) {
                    arr.push({
                        key: row.code,
                        value: row.value,
                        row: row
                    });
                }
            }
            return arr;
        });
    console.log('[filter] geted', params.type);
    return res;
};

/**
 *
 * @param {Array} dict [{'key1':'value1'},{'key2':'value2'}]
 * @returns {Object} {'key':'value'}
 */
let formatDict = (dict) => {
    let obj = {};
    for (let row of dict.values()) {
        obj[row.key] = row.value;
    }
    return obj;
};

/**
 *
 * @param {String} params type值
 * @returns {Object} {'key':'value'}
 */
let getDictFilter = async (params) => {
    let dictList = await queryDictValue({type: params});
    return formatDict(dictList);
};

/**
 * 用于el-tablel列格式化
 * @param {*} row
 * @param {*} column
 * @param {*} cellValue
 * @param {*} index
 */
let formatBoolean = (row, column, cellValue, index) => {
    return (
        {
            '0': '否',
            '1': '是'
        }[cellValue] || ''
    );
};

/**
 * 用于el-tablel列格式化
 * @param {*} row
 * @param {*} column
 * @param {*} cellValue
 * @param {*} index
 */
let formatEmpty = (row, column, cellValue, index) => {
    return cellValue ? cellValue : '暂无';
};



export {
    vfilter,
    querySystemConfig, // 获取系统配置信息
    queryDictValue, // 返回格式化后的字典信息
    formatDict, // 格式化字典信息
    getDictFilter, // 获取格式化字典信息
    formatEmpty, // 格式化空值
    formatBoolean // 格式化boolean值
};
