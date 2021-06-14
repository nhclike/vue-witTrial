/* 远程设备
 * @Author: ShiHuiJun
 * @Date: 2020-12-01 09:36:09
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-15 15:19:04
 */

<template>
    <div class="trialDevice alert-box-body">
        <div class="form-top">
            <p class="form-title">远程设备</p>
            <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
        </div>
        <div ref="formBody" class="form-body">
            <div ref="table" class="full-height">
                <div ref="opt">
                    <div class="opt-box">
                        <div class="opt-btns">
                            <button
                                class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="showAlertBoxDeviceListItem = true"
                            >
                                <i class="el-icon-plus"></i>
                                <span>邀请设备</span>
                            </button>
                        </div>
                        <div class="opt-btns">
                            <button class="shj-btn--primary_workBench shj-btn--medium_workBench">
                                <i class="el-icon-video-play"></i>
                                <span>会议录制</span>
                            </button>
                            <button class="shj-btn--primary_workBench shj-btn--medium_workBench">
                                <i class="el-icon-video-pause"></i>
                                <span>停止录制</span>
                            </button>
                            <button class="shj-btn--primary_workBench shj-btn--medium_workBench">
                                <i class="el-icon-microphone"></i>
                                <span>全部静音</span>
                            </button>
                        </div>
                    </div>
                    <div class="opt-box">
                        <div class="title">
                            视频在线：
                            <span class="font-color-error">5</span>人 视频离线：
                            <span class="font-color-success">6</span>人
                        </div>
                        <div class="opt-btns">
                            <button class="shj-btn--primary_workBench shj-btn--medium_workBench" @click="queryList()">
                                <i class="el-icon-refresh"></i>
                                <span>刷新</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div :style="tableStyle">
                    <el-table
                        element-loading-text="拼命加载中"
                        :data="tableData"
                        ref="multipleTable"
                        @selection-change="handleSelectionChange"
                        :row-key="getRowKeys"
                        stripe
                    >
                        <el-table-column
                            v-if="showTableSelection"
                            type="selection"
                            width="75"
                            align="center"
                            header-align="center"
                            :reserve-selection="true"
                            :selectable="selectInit"
                        ></el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            prop="name"
                            label="设备名称"
                            min-width="150"
                            align="center"
                        ></el-table-column>
                        <el-table-column
                            prop="isOnline"
                            label="是否在线"
                            min-width="100"
                            align="center"
                            :formatter="commFilter.formatEmpty"
                        ></el-table-column>
                        <el-table-column prop label="操作" min-width="200" align="center">
                            <template slot-scope="scope">
                                <!-- 操作栏按钮 -->
                                <span
                                    v-for="(item, index) in tableOperate"
                                    :key="index"
                                    v-if="showOperateBtn(scope.row, item, index)"
                                    :id="item.id"
                                    class="listButton"
                                    :class="item.class"
                                    @click="
                                    handleClickOperate(scope.row, item, index)
                                "
                                ><i :class="item.iconClass"></i>{{ item.conntentText }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div ref="pagination" class="tablePagination block"></div>
            </div>
        </div>
        <div class="form-bottom">
            <span
                class="shj-btn--confirm shj-btn--medium"
                @click="$emit('emitSubmit', multipleSelection)"
            >确定</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="$emit('emitClose')">关闭</span>
        </div>
        <!-- 弹窗-设备列表-->
        <div class="alert-box" v-if="showAlertBoxDeviceListItem">
            <device-list-item
                :operateBtnName="operateBtnName"
                :selection="tableData"
                @emitClose="showAlertBoxDeviceListItem = false"
                @emitSubmit="emitSubmit"
            ></device-list-item>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
import DeviceListItem from '@/views/judge/workBench/case/DeviceListItem';
export default {
    name: 'TrialDevice',
    components: { ShjListPage, DeviceListItem },
    inject: ['reload'],
    filters: {},
    props: {
        // 列[选择]-回显列表
        selection: {
            type: Array,
            default: () => [],
            required: false
        },
        // 庭审状态 '0'-待庭审 '1'-庭审中 '2'-休庭中 '3'-复庭（弃用） '4'-闭庭（待校对） '5'-已结束（已校对）
        trialStatus: {
            type: String,
            default: '0'
        }
    },
    data() {
        return {
            controls: {},
            url: 'video/0.mp3',
            /* 表格 */
            tableStyle: 'height:0px', // 表格样式 主要设置表格高度自适应
            validSelect: true, // 为false时分页selectionchange事件不赋值
            // 设置表格的row-key
            getRowKeys(row) {
                return row.number;
            },
            showTableSelection: false, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            multipleSelection: [], // 列[选择]-选中列表
            // 行-数据
            tableData: [
                /* {
                    callState: null,
                    category: 'AE20',
                    clientVersion: '',
                    courtCode: '1300B00',
                    courtName: '浙江省高级人民法院',
                    description: null,
                    disabled: false,
                    extendTime: '2021-06-09 13:25:47',
                    firstBindTime: '2020-06-09 13:25:47',
                    isOnline: '不在线',
                    name: '高院会议室',
                    number: '22609717',
                    portExpireTime: '2021-06-09 13:25:47',
                    sn: '5A191116A940C0B7'
                } */
            ],
            // 列[操作-按钮]-数据
            tableOperate: [
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '静音', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'mute',
                    iconClass: 'el-icon-microphone'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '取消静音', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'unmute',
                    iconClass: 'el-icon-turn-off-microphone'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '邀请', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'invite',
                    iconClass: 'el-icon-plus'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '剔除', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'disconnect',
                    iconClass: 'el-icon-close'
                }
            ],
            // 分页-数据
            tablePaginationData: {
                pageSizes: [10, 20, 50, 100],
                currentPage: 1,
                pageSize: 10,
                total: 0,
                pages: 0,
                layout: 'slot,->, prev, pager, next, jumper'
            },
            /* 弹窗 */
            operateBtnName: 'view', // 父传子>表单当前操作模式-add|edit|view
            showAlertBoxDeviceListItem: false, // 是否显示-弹窗-设备列表
            trialDeviceList: [] // 已邀请设备列表
        };
    },
    computed: {},
    watch: {},
    created() {
        // this.init();
    },
    mounted() {
        // shjTodo-默认进行录像
        if (this.trialStatus === '1') {
            this.reqStartRecord({ meetingNumber: '' });
        }
        this.reqGetMeeting({ trialId: this.$route.query.trialId });
        this.initTable();
    },
    methods: {
        ...mapActions({
            queryTrialDevice: 'moduleJudge/queryTrialDevice',
            getMeeting: 'moduleXyDevice/getMeeting', // 查询远程庭审（会议）
            disconnect: 'moduleXyDevice/disconnect', // 剔除设备
            invitation: 'moduleXyDevice/invitation', // 邀请设备
            mute: 'moduleXyDevice/mute', // 静音
            startRecord: 'moduleXyDevice/startRecord', // 开始录制
            stopRecord: 'moduleXyDevice/stopRecord', // 停止录制
            unmute: 'moduleXyDevice/unmute' // 取消静音
        }),

        // 查询远程庭审（会议）
        reqGetMeeting(params) {
            this.getMeeting(params).then((res) => {
                // console.log('getMeeting', res);
            });
        },

        // 开始录制
        reqStartRecord(params) {
            this.startRecord(params).then((res) => {
                // console.log('startRecord', res);
            });
        },

        // 停止录制
        reqStopRecord(params) {
            this.stopRecord(params).then((res) => {
                // console.log('stopRecord', res);
            });
        },

        // 邀请设备
        reqInvitation(params) {
            this.invitation(params).then((res) => {
                // console.log('invitation', res);
            });
        },

        // 剔除设备
        reqDisconnect(params) {
            this.disconnect(params).then((res) => {
                // console.log('disconnect', res);
            });
        },

        // 取消静音
        reqMute(params) {
            this.mute(params).then((res) => {
                // console.log('mute', res);
            });
        },

        // 静音
        reqUnmute(params) {
            this.unmute(params).then((res) => {
                // console.log('unmute', res);
            });
        },

        // 确定选择设备
        emitSubmit(multipleSelection) {
            // shjTodo-确定邀请设备接口
            // this.tableData = multipleSelection;
            this.showAlertBoxDeviceListItem = false;
        },


        // --------------------表格-开始-------------------- */

        // 初始化表格
        initTable() {
            this.setTableStyle();
            this.queryList();
        },

        // 设置表格高度自适应
        setTableStyle() {
            let optH = this.$refs.opt.clientHeight;
            let tableH = this.$refs.table.clientHeight;
            let paginationH = this.$refs.pagination.clientHeight;
            this.tableStyle = `height:${tableH - optH - paginationH}px;overflow-y:auto;`;
        },

        // 查询-获取列表
        queryList() {
            let queryParams = {
                trialId: this.$route.query.trialId
                // pageNum: this.tablePaginationData.currentPage,
                // pageSize: this.tablePaginationData.pageSize
            };
            // 请求接口-获取列表
            this.getListData(queryParams);
        },

        // 接口-获取列表
        getListData(params) {
            this.queryTrialDevice(params).then((res) => {
                // console.log('queryTrialDevice', res);
                if (res.code === 0) {
                    this.tableData = res.data;
                    // shjTodo-接口返回中没有 是否在线状态、是否静音
                    this.resetNoPageSelection();
                }
            });
        },

        // 不分页-勾选回显
        resetNoPageSelection() {
            this.selection.forEach((selectRow) => {
                this.$refs.multipleTable.toggleRowSelection(selectRow, true);
            });
        },

        // 是否可选 true-可勾选 false-不可勾选
        selectInit(row, index) {
            return !row.disabled;
        },

        // 页码-currentPage-change事件-表格数据重新渲染
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
            this.tablePaginationData.currentPage = val;
            this.queryList();
        },

        // 控制操作栏按钮是否显示
        showOperateBtn(row, item, index) {
            if (item.active) {
                return true;
            }
            switch (item.action) {
                case 'mute':
                    return true;
                case 'unmute':
                    return true;
                case 'invite':
                    return true;
                case 'disconnect':
                    return true;
            }
        },

        // 列【操作】点击事件
        handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    // 静音
                    case 'mute':
                        this.reqMute({});
                        break;
                    // 取消静音
                    case 'unmute':
                        this.reqUnmute({});
                        break;
                    // 邀请
                    case 'invite':
                        this.reqInvitation({ deviceNumbers: row.number, meetingNumber: '' });
                        break;
                    // 剔除
                    case 'disconnect':
                        this.$confirm(`确定剔除该设备吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        })
                            .then(() => {
                                this.reqDisconnect({ deviceNumbers: row.number, meetingNumber: '' });
                            })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                }
            }
        },

        // 列[选择]-change事件-选中的表格数据发生改变
        handleSelectionChange(val) {
            if (this.validSelect) {
                this.multipleSelection = val;
                console.log('multipleSelection', this.multipleSelection);
            }
        },

        // 格式化列-地址
        formatUrl(url) {
            return `${__API__}/trial${url}`;
        }

        // --------------------表格-结束-------------------- */
    }
};
</script>

<style lang="less" scoped>
@import '@/assets/style/table/shj-el-table.less'; // 引入less定义变量
.trialDevice.alert-box-body {
    width: 1500px;
}
/deep/.form-body {
    height: 600px;
    /* el-table-theme 参数说明
    * @color 表格文字颜色
    * @color_thead 表头文字颜色
    * @bg_thead 表头背景颜色
    * @bg_td_striped 单元格斑马纹颜色
    * @border_bottom 底部分割线大小
    * @border_color_divider 单元格底部线颜色
    */
    .el-table-theme(
    @text_color_black_5,
    @text_color_black_5,
    #E5E5E5,
    #F6F6F6,
    0,
    @border_color_divider
  );
    .el-table-size(@font28px, 80px, 80px);
}
.progress-box {
    background: @color_primary_light;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    .progress {
        height: 100%;
        background: @color_primary;
    }
}
</style>
