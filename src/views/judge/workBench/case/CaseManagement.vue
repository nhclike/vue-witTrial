/* 案件管理
 * @Author: ShiHuiJun
 * @Date: 2020-09-07 10:00:20
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-19 11:01:14
 */

/* 模版-弹框-列表 */
<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">案件排期管理</span>
                </div>
                <!-- 列表查询区 -->
                <div class="form-body inquire">
                    <div>
                        <el-form
                            :model="inquireForm"
                            :label-position="'right'"
                            label-width="1.9rem"
                            status-icon
                            :rules="inquireFormRules"
                            ref="inquireForm"
                            @submit.native.prevent
                        >
                            <el-row>
                                <el-col :span="8">
                                    <el-form-item label="案号">
                                        <el-input
                                            v-model="inquireForm.caseCode"
                                            placeholder
                                            clearable
                                            @input="queryList(true)"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="法庭">
                                        <el-select
                                            filterable
                                            v-model="inquireForm.courtroomId"
                                            placeholder
                                            clearable
                                            @change="queryList(true)"
                                        >
                                            <el-option
                                                v-for="(item,
                                                index) in courtList"
                                                :key="index"
                                                :label="item.courtroomName"
                                                :value="item.courtroomId"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="案件类型">
                                        <el-select
                                            v-model="inquireForm.caseType"
                                            placeholder
                                            clearable
                                            @change="queryList(true)"
                                        >
                                            <el-option
                                                v-for="(item,
                                                index) in caseTypeList()"
                                                :key="index"
                                                :label="item.value"
                                                :value="item.key"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="8">
                                    <el-form-item label="承办人员">
                                        <el-input
                                            v-model="inquireForm.keyword"
                                            placeholder
                                            clearable
                                            @input="queryList(true)"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="计划开庭时间">
                                        <el-date-picker
                                            v-model="inquireForm.planBeginDate"
                                            placeholder
                                            clearable
                                            type="date"
                                            format="yyyy-MM-dd"
                                            value-format="yyyy-MM-dd"
                                            @change="queryList(true)"
                                        ></el-date-picker>
                                        <!-- <el-date-picker
                                            v-model="inquireForm.planBeginDate"
                                            placeholder=""
                                            clearable
                                            type="datetime"
                                            format="yyyy-MM-dd"
                                            value-format="yyyy-MM-dd"
                                            @change="queryList"
                                        ></el-date-picker>-->
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="庭审状态">
                                        <el-select
                                            v-model="inquireForm.trialStatus"
                                            placeholder
                                            clearable
                                            @change="queryList(true)"
                                        >
                                            <el-option
                                                v-if="String(item.key) < 4"
                                                v-for="(item,
                                                index) in trialStatusList()"
                                                :key="index"
                                                :label="item.value"
                                                :value="item.key"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </div>
                <div class="opt-box">
                    <div class="title">案件排期列表</div>
                    <div class="opt-btns">
                        <button
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            @click="combinedCase()"
                        >
                            <i class="i-combinedCase"></i>并&nbsp;&nbsp;&nbsp;&nbsp;案
                        </button>
                        <button
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            @click="
                                showAlertBoxCaseOperate = true;
                                operateBtnName = 'add';
                            "
                        >
                            <i class="i-addCourt"></i>手动立案
                        </button>
                        <button
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            @click="
                                changeRouter(
                                    '/main/judge/workbench/case/caseScheduling',
                                    { formAction: '1' }
                                )
                            "
                        >
                            <i class="i-manualScheduling"></i>手动排期
                        </button>
                        <button
                            v-if="isShowSyncTrial"
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            @click="loadTiral()"
                        >
                            <i class="el-icon-refresh"></i>同步排期
                        </button>
                    </div>
                </div>
            </div>
            <!-- 列表内容区 -->
            <div class="tableContent" :style="tableStyle">
                <el-table
                    :data="tableData"
                    style="width: 100%;"
                    ref="multipleTable"
                    @selection-change="handleSelectionChange"
                    :row-key="getRowKeys"
                >
                    <el-table-column
                        v-if="showTableSelection"
                        type="selection"
                        width="75"
                        align="center"
                        header-align="center"
                        :reserve-selection="true"
                    ></el-table-column>
                    <el-table-column
                        v-for="item in tableColumnData"
                        :key="item.prop"
                        :prop="item.prop"
                        :label="item.label"
                        :width="item.width"
                        :min-width="item.minWidth"
                        :formatter="item.formatter"
                        align="center"
                        header-align="center"
                    ></el-table-column>
                    <el-table-column
                        label="审判长"
                        width
                        min-width="50"
                        align="center"
                        header-align="center"
                    >
                        <template slot-scope="scope">
                            <!-- 操作栏按钮 -->
                            <span>
                                {{
                                formatPeople(scope.row.peopleMap, '审判长')
                                }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="书记员"
                        width
                        min-width="50"
                        align="center"
                        header-align="center"
                    >
                        <template slot-scope="scope">
                            <!-- 操作栏按钮 -->
                            <span>
                                {{
                                formatPeople(scope.row.peopleMap, '书记员')
                                }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="showTableOperate"
                        label="操作"
                        width
                        min-width="125"
                        align="center"
                        header-align="center"
                    >
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
                            >{{ item.conntentText }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!-- 列表分页区 -->
            <div ref="pagination" class="tablePagination block">
                <el-pagination
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="tablePaginationData.currentPage"
                    :page-sizes="tablePaginationData.pageSizes"
                    :page-size="tablePaginationData.pageSize"
                    :layout="tablePaginationData.layout"
                    :total="tablePaginationData.total"
                >
                    <span
                        class="pagination_slot"
                        v-if="tablePaginationData.layout.indexOf('->') > -1"
                    >
                        共
                        <i class="font-color-primary">
                            {{
                            tablePaginationData.pages
                            }}
                        </i>页
                        <i class="font-color-primary">
                            {{
                            tablePaginationData.total
                            }}
                        </i>条记录
                    </span>
                </el-pagination>
            </div>
        </div>
        <!-- 弹窗-案件操作-->
        <div class="alert-box" v-if="showAlertBoxCaseOperate">
            <case-operate
                ref="caseOperate"
                :operateBtnName="operateBtnName"
                @emitClose="
                    showAlertBoxCaseOperate = false;
                    queryList();
                "
            ></case-operate>
        </div>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import CaseOperate from '@/views/judge/workBench/case/CaseOperate';
import { objArr2KeyArr, debounce } from '@/utils/utils';
export default {
    name: 'CaseManagement',
    components: { CaseOperate },
    inject: ['reload', 'caseTypeList', 'trialStatusList', 'userInfo'],
    props: {},
    data() {
        return {
            // 法庭下拉列表
            courtList: [
                /*  {
                    courtroomId: '1',
                    courtroomName: '第一法庭'
                } */
            ],
            /* 弹窗 */
            operateBtnName: 'add', // 父传子>表单当前操作模式-add|edit|view
            showAlertBoxCaseOperate: false, // 是否显示-弹窗-用户操作
            /* 表单 */
            // 查询/过滤条件-用于v-model数据绑定
            inquireForm: {
                caseCode: '', // 案号
                caseType: '', // 案件类型
                courtroomId: '', // 法庭
                trialStatus: '', // 庭审状态
                keyword: '', // 承办人员
                planBeginDate: '' // 计划开庭时间
            },
            // 表单验证
            inquireFormRules: {},
            /* 表格 */
            tableStyle: 'height:0px',
            validSelect: true, // 为false时分页selectionchange事件不赋值
            // 设置表格的row-key
            getRowKeys(row) {
                return row.uuid;
            },
            showTableSelection: true, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            // 所有页选中的数据列表
            selectionList: [
                // {
                //     page: '1',
                //     selection: []
                // }
            ],
            multipleSelection: [], // 列[选择]-选中列表
            // 列[基本]-参数配置
            tableColumnData: [
                {
                    prop: 'caseCode',
                    label: '案号',
                    width: '',
                    minWidth: '100',
                    formatter: this.commFilter.formatEmpty
                },
                {
                    prop: 'caseType',
                    label: '案件类型',
                    width: '',
                    minWidth: '50',
                    formatter: (row, column, cellValue, index) => {
                        let obj = this.commFilter.formatDict(this.caseTypeList());
                        return obj[cellValue] || '';
                    }
                },
                {
                    prop: 'courtroomName',
                    label: '法庭名称',
                    width: '',
                    minWidth: '50',
                    formatter: this.commFilter.formatEmpty
                },
                {
                    prop: 'trialCount',
                    label: '庭审次数',
                    width: '',
                    minWidth: '50',
                    formatter: this.commFilter.formatEmpty
                },
                {
                    prop: 'planBeginDate',
                    label: '计划开庭时间',
                    width: '',
                    minWidth: '75',
                    formatter: this.commFilter.formatEmpty
                },
                {
                    prop: 'trialStatus',
                    label: '庭审状态',
                    width: '',
                    minWidth: '50',
                    formatter: (row, column, cellValue, index) => {
                        let obj = this.commFilter.formatDict(this.trialStatusList());
                        return obj[cellValue] || '';
                    }
                },
                {
                    prop: 'cognate',
                    label: '并案庭审',
                    width: '',
                    minWidth: '50',
                    formatter: (row, column, cellValue, index) => {
                        if (cellValue) {
                            return String(cellValue) === '1' ? '是' : '否';
                        } else {
                            return String(row.caseCognate) === '1' ? '是' : '否';
                        }
                    }
                }
            ],
            // 行-数据
            tableData: [
                /* {
                    caseCode: '（2020）浙民商0002号',
                    caseCouse: '工伤保险待遇纠纷',
                    caseDescr: null,
                    caseId: '1231',
                    caseType: '1',
                    cognate: null,
                    cognateCode: null,
                    courtroomId: 'O50001',
                    courtroomName: '第一法庭',
                    createTime: null,
                    createUser: null,
                    defendantView: null,
                    deptNo: '123',
                    endDate: '2020-10-30 09:52:43',
                    isBurn: '0',
                    isDel: '0',
                    isLive: '0',
                    isPublic: '0',
                    mainCase: null,
                    noteUrl: '',
                    nruAddRecord: null,
                    nruSessionid: null,
                    peopleDTOList: null,
                    peopleMap: {原告: '原告', 审判员: 'fg1', 人民陪审员: 'qxl', 审判长: 'fg002', 被告: '被告'},
                    plaintiffView: null,
                    planBeginDate: '2020-10-16 12:05:59',
                    planEndDate: '2020-10-09 20:31:23',
                    proveControl: null,
                    randomCode: null,
                    recordId: null,
                    startDate: '2020-10-13 10:02:11',
                    trialCount: 1,
                    trialId: '13133131',
                    trialNotice: null,
                    trialStatus: '1',
                    updateTime: null,
                    updateUser: null
                } */
            ],
            // 列[操作-按钮]-数据
            tableOperate: [
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '解除并案', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'delCognate'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '案件排期', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'caseScheduling'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '并案排期', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'combinedCaseScheduling'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '进入庭审', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'goTrial'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '编辑排期', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'editTrial'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '编辑排期', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'editCombinedTrial'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '编辑案件', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'editCase'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: 'error', // 样式名称
                    conntentText: '删除排期', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'deleteTrial'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: 'error', // 样式名称
                    conntentText: '删除案件', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'deleteCase'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    conntentText: '同步卷宗', // 按钮内容
                    active: false, // 是否显示按钮
                    action: 'syncFile'
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
            }
        };
    },
    computed: {
        isShowSyncTrial() {
            return this.$store.state.userInfo.permsList.includes('schedule:sysTrial');
        },
        isShowSyncDossier() {
            return this.$store.state.userInfo.permsList.includes('schedule:sysDossier');
        }
    },
    watch: {},
    created() {
        // this.init();
    },
    mounted() {
        this.reqQueryCourtroom();
        this.initTable();
    },
    methods: {
        ...mapActions({
            getTableData: 'moduleCase/queryTrial',
            queryCourtroom: 'moduleCase/queryCourtroom',
            deleteTiral: 'moduleCase/removeTrial',
            deleteCase: 'moduleCase/removeCase',
            inCorporate: 'moduleCase/inCorporate',
            toSpell: 'moduleCase/toSpell',
            queryCorporateCase: 'moduleCase/queryCorporateCase',
            synchroTrial: 'moduleCase/synchroTrial',
            synchroDossier: 'moduleCase/synchroDossier'
        }),

        // 查询法庭
        reqQueryCourtroom() {
            this.queryCourtroom().then((res) => {
                if (res.code === 0) {
                    this.courtList = res.data;
                }
            });
        },

        // 删除排期
        reqDeleteTiral(params) {
            this.deleteTiral(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.queryList();
                }
            });
        },

        // 删除案件
        reqDeleteCase(params) {
            this.deleteCase(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.queryList();
                }
            });
        },

        // 解除并案
        reqToSpell(params) {
            this.toSpell(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.selectionList = [];
                    this.queryList();
                }
            });
        },

        // 并案庭审
        reqInCorporate(params) {
            this.inCorporate(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.queryList();
                }
            });
        },

        // 同步排期
        reqSynchroTrial() {
            this.$message.success(`同步排期中……`);
            this.synchroTrial().then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.queryList(true);
                }
            });
        },

        // 同步卷宗
        reqSynchroDossier(params) {
            this.$message.success(`同步卷宗中……`);
            this.synchroDossier(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                }
            });
        },

        // 并案
        combinedCase() {
            let arr = [];
            for (let pageSelection of this.selectionList.values()) {
                arr = arr.concat(pageSelection.selection);
            }
            if (arr.length < 2) {
                this.$confirm(`请选择至少2个非并案案件！`, '系統提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    showCancelButton: false,
                    customClass: 'confirm-success',
                    type: 'warning'
                })
                    .then(() => {})
                    .catch(() => {});
                return false;
            }
            let isHybrid = '0'; // 混合案件（排期案件与非排期案件同时存在）
            let hasTrialArr = []; // 选择案件的排期信息列表
            let trialIdArr = []; // 选择案件的trialId列表
            let caseIdArr = []; // 选择案件的caseId列表
            let toCaseSchedulingArr = []; // 选择案件的排期信息不同
            for (let [i, row] of arr.entries()) {
                // 已并案案件 不允许再次并案
                if (this.isCognate(row)) {
                    this.queryCorporateCase(this.isTrial(row) ? { trialId: row.trialId } : { caseId: row.caseId }).then(
                        (res) => {
                            let msg = `<p><span class="font-color-primary">${row.caseCode}</span>是并案案件，并案信息如下：</p>`;
                            if (res.code === 0) {
                                for (let row of res.data.values()) {
                                    msg = `${msg}<p>并案案号：${row.caseCode}</p>`;
                                }
                            }
                            msg = `${msg}<p>请先解除并案后再进行并案操作！</p>`;
                            this.$confirm(`${msg}`, '系統提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                showCancelButton: false,
                                customClass: 'confirm-success',
                                type: 'error',
                                dangerouslyUseHTMLString: true
                            })
                                .then(() => {})
                                .catch(() => {});
                        }
                    );
                    return false;
                }
                // 同一案件的不同排期 不允许并案
                for (let j = i + 1; j < arr.length; j++) {
                    if (arr[i].caseCode === arr[j].caseCode) {
                        this.$confirm(
                            `<p>同一案件的不同排期不允许并案，请重新选择！</p><p>错误案号为：${arr[i].caseCode}</p>`,
                            '系統提示',
                            {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                showCancelButton: false,
                                customClass: 'confirm-success',
                                type: 'error',
                                dangerouslyUseHTMLString: true
                            }
                        )
                            .then(() => {})
                            .catch(() => {});
                        return false;
                    }
                }
                // 区分所选择是否为混合案件
                if (this.isTrial(row)) {
                    hasTrialArr.push('1'); // 已排期
                    trialIdArr.push(row.trialId);
                } else {
                    hasTrialArr.push('0'); // 未排期
                    caseIdArr.push(row.caseId);
                }
                // 区分所选择是否排期信息不同（全部未排期案件时不存在排期信息不同）
                if (i > 0 && this.isTrial(row)) {
                    let isSameTrial =
                        row.courtroomId === arr[0].courtroomId &&
                        row.peopleMap['审判长'] === arr[0].peopleMap['审判长'] &&
                        row.peopleMap['书记员'] === arr[0].peopleMap['书记员'];
                    if (!isSameTrial) {
                        toCaseSchedulingArr.push('1');
                    }
                }
            }
            // 混合案件-既有已排期案件又有未排期案件
            if (hasTrialArr.indexOf('0') > -1 && hasTrialArr.indexOf('1') > -1) {
                isHybrid = '1';
                // console.log(hasTrialArr);
            }
            // 全部已排期案件 排期信息不同跳转至排期页面
            if (isHybrid === '0' && toCaseSchedulingArr.indexOf('1') > -1) {
                this.$confirm(`并案排期信息不同，将要进入排期编辑界面，是否并案？`, '系統提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    showCancelButton: false,
                    customClass: 'confirm-success',
                    type: 'warning'
                })
                    .then(() => {
                        let trialIds = objArr2KeyArr(arr, 'trialId');
                        this.changeRouter('/main/judge/workbench/case/caseScheduling', {
                            formAction: '2',
                            caseId: arr[0].caseId,
                            combinedCaseCodeList: arr,
                            trialIds: trialIds
                        });
                    })
                    .catch(() => {});
            } else {
                let trialIds = objArr2KeyArr(arr, 'trialId');
                let caseIds = objArr2KeyArr(arr, 'caseId');
                this.$confirm(`确定并案吗？`, '系統提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    showCancelButton: true,
                    customClass: 'confirm-success',
                    type: 'warning'
                })
                    .then(() => {
                        let params;
                        if (isHybrid === '1') {
                            // 混合案件
                            params = {
                                trialIds: trialIdArr.join(','),
                                caseIds: caseIdArr.join(','),
                                isHybrid: '1'
                            };
                        } else {
                            // 非混合案件
                            if (hasTrialArr.indexOf('1') < 0) {
                                // 全部未排期案件
                                params = {
                                    caseIds: caseIds.join(','),
                                    isHybrid: '0'
                                };
                            } else {
                                // 全部已排期案件
                                params = {
                                    trialIds: trialIds.join(','),
                                    isHybrid: '0'
                                };
                            }
                        }
                        this.reqInCorporate(params);
                    })
                    .catch(() => {
                        // this.$message.info('已取消删除');
                    });
            }
        },

        // 同步排期
        loadTiral() {
            this.reqSynchroTrial();
            // this.$message.error('暂未开放此功能，敬请期待中！');
        },

        // 页面跳转
        changeRouter(path, query) {
            this.$router.push({
                path: path,
                query: query ? query : {}
            });
        },

        /* --------------------表格-开始-------------------- */
        // 初始化表格
        initTable() {
            this.setTableStyle();
            this.queryList(true);
        },

        // 设置表格高度
        setTableStyle() {
            let topH = this.$refs.top.clientHeight;
            let bottomH = this.$refs.pagination.clientHeight;
            this.tableStyle = `height:calc(100% - ${topH + bottomH}px)`;
        },

        // 查询-获取列表
        queryList: debounce(function(search) {
            this.tablePaginationData.currentPage = search ? 1 : this.tablePaginationData.currentPage;
            let queryParams = {
                curPage: search ? '1' : String(this.tablePaginationData.currentPage),
                limit: String(this.tablePaginationData.pageSize),
                caseCode: this.inquireForm.caseCode,
                caseType: this.inquireForm.caseType,
                courtroomId: this.inquireForm.courtroomId,
                trialStatus: this.inquireForm.trialStatus,
                keyword: this.inquireForm.keyword,
                planBeginDate: this.inquireForm.planBeginDate
            };
            // 接口-获取列表
            this.getTableData(queryParams).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.setTablePagination(res.data);
                    this.resetPageSelection(res.data);
                }
            });
        }, 500),

        // 分页显示
        setTablePagination(data) {
            this.tablePaginationData.total = data.totalCount;
            this.tablePaginationData.pages = Math.ceil(data.totalCount / this.tablePaginationData.pageSize);
        },

        // 分页-勾选回显
        resetPageSelection(data) {
            if (this.tablePaginationData.pages < 1) {
                return false;
            }
            // shjTodo-存在问题：已排期与未排期并案后，未排期的uuid值会改变，所以无法回显，考虑并案后不回显
            if (this.selectionList.length < 1) {
                for (let i = 0; i < this.tablePaginationData.pages; i++) {
                    this.selectionList.push({
                        page: i + 1,
                        selection: []
                    });
                }
            }
            // console.log('resetPageSelection selectionList', this.selectionList);
            this.multipleSelection = [];
            this.selectionList[this.tablePaginationData.currentPage - 1].selection.forEach((row) => {
                this.multipleSelection.push(row);
            });
            if (this.multipleSelection.length > 0) {
                this.multipleSelection.forEach((selectRow) => {
                    this.$refs.multipleTable.toggleRowSelection(selectRow, true);
                });
            } else {
                this.$refs.multipleTable.clearSelection();
            }
            // console.log('resetSelections multipleSelection', this.multipleSelection);
            this.validSelect = true;
        },

        // 每页数量-pageSize-change事件-表格数据重新渲染
        handleSizeChange(val) {
            this.tablePaginationData.pageSize = val;
            this.queryList();
        },
        // 页码-currentPage-change事件-表格数据重新渲染
        handleCurrentChange(val) {
            this.validSelect = false;
            this.tablePaginationData.currentPage = val;
            this.queryList();
        },

        // 格式化列-人员
        formatPeople(peopleMap, role) {
            if (peopleMap && peopleMap[role]) {
                return peopleMap[role];
            }
        },

        // 控制操作栏按钮是否显示
        showOperateBtn(row, item, index) {
            if (item.active) {
                return true;
            }
            switch (item.action) {
                case 'goTrial':
                    return this.isTrial(row) && Number(row.trialStatus) < 4 && this.isOneSelfTrial(row);
                case 'editTrial':
                    return this.isOneSelfTrial(row);
                case 'deleteTrial':
                    return !this.isCognate(row) && this.isTrial(row) && Number(row.trialStatus) < 1 && this.isOneSelfTrial(row);
                case 'editCombinedTrial':
                    return this.isCognate(row) && this.isTrial(row) && Number(row.trialStatus) < 1;

                case 'caseScheduling':
                case 'editCase':
                case 'deleteCase':
                    return !this.isCognate(row) && !this.isTrial(row);
                case 'combinedCaseScheduling':
                    return this.isCognate(row) && !this.isTrial(row);
                case 'delCognate':
                    return this.isCognate(row);
                case 'syncFile':
                    return this.isShowSyncDossier;
            }
        },

        // 判断是否是自己案件
        isOneSelfTrial(row) {
            if(row.peopleMap['审判长'] === this.$store.state.userInfo.name || row.peopleMap['书记员'] === this.$store.state.userInfo.name){
                return true;
            }else{
                return false;
            }
        },

        // 判断是否排期
        isTrial(row) {
            return row.planBeginDate || row.courtroomId;
        },

        // 判断是否为并案
        isCognate(row) {
            if (row.cognate) {
                return String(row.cognate) === '1' ? true : false;
            } else {
                return String(row.caseCognate) === '1' ? true : false;
            }
        },

        // 列【操作】点击事件
        handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    // 案件排期
                    case 'caseScheduling':
                        this.$router.push({
                            path: '/main/judge/workbench/case/caseScheduling',
                            query: { formAction: '3', caseId: row.caseId }
                        });
                        break;
                    // 编辑并案排期|并案排期
                    case 'editCombinedTrial':
                    case 'combinedCaseScheduling':
                        this.queryCorporateCase(
                            this.isTrial(row) ? { trialId: row.trialId } : { caseId: row.caseId }
                        ).then((res) => {
                            let msg = '<p>此案件是并案案件，排期为并案案件的共同排期！</p>';
                            if (res.code === 0) {
                                for (let row of res.data.values()) {
                                    msg = `${msg}<p>并案案号：${row.caseCode}</p>`;
                                }
                            }
                            this.$confirm(`${msg}`, '系統提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                showCancelButton: true,
                                customClass: 'confirm-success',
                                type: 'warning',
                                dangerouslyUseHTMLString: true
                            })
                                .then(() => {
                                    this.$router.push({
                                        path: '/main/judge/workbench/case/caseScheduling',
                                        query: {
                                            formAction: item.action === 'combinedCaseScheduling' ? '4' : '6',
                                            trialId: row.trialId,
                                            caseId: row.caseId,
                                            combinedCaseCodeList: res.data
                                        }
                                    });
                                })
                                .catch(() => {
                                    // this.$message.info('操作取消');
                                });
                        });
                        break;
                    // 编辑案件
                    case 'editCase':
                        this.operateBtnName = 'edit';
                        this.showAlertBoxCaseOperate = true;
                        this.$nextTick(() => {
                            this.$refs.caseOperate.init(row.caseId);
                        });
                        break;
                    // 编辑排期
                    case 'editTrial':
                        this.$router.push({
                            path: '/main/judge/workbench/case/caseScheduling',
                            query: {
                                formAction: '5',
                                caseId: row.caseId,
                                trialId: row.trialId
                            }
                        });
                        break;
                    // 删除排期
                    case 'deleteTrial':
                        this.$confirm(`确定删除排期吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        })
                            .then(() => {
                                this.reqDeleteTiral({ trialId: row.trialId });
                            })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                    // 删除案件
                    case 'deleteCase':
                        this.$confirm(`确定删除案件吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        })
                            .then(() => {
                                this.reqDeleteCase({ caseId: row.caseId });
                            })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                    // 解除并案
                    case 'delCognate':
                        this.$confirm(`确定解除并案庭审吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        })
                            .then(() => {
                                if (this.isTrial(row)) {
                                    // 排期解除并案传trialId
                                    this.reqToSpell({ trialId: row.trialId });
                                } else {
                                    // 案件解除并案传caseId
                                    this.reqToSpell({ caseId: row.caseId });
                                }
                            })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                    // 进入庭审
                    case 'goTrial':
                        this.$router.push({
                            path: '/home/topicReader',
                            query: { trialId: row.trialId, fromWorkBench: true }
                        });
                        break;
                    // 同步卷宗
                    case 'syncFile':
                        this.reqSynchroDossier({ caseCode: row.caseCode });
                        break;
                }
            }
        },

        // 列[选择]-change事件-选中的表格数据发生改变
        handleSelectionChange(val) {
            if (this.validSelect) {
                this.multipleSelection = val;
                console.log('handleSelectionChange multipleSelection', this.multipleSelection);
                this.selectionList[this.tablePaginationData.currentPage - 1].selection = val;
            }
            console.log('handleSelectionChange selectionList', this.selectionList);
        }

        /* --------------------表格-结束-------------------- */
    }
};
</script>
<style scoped lang='less'>
@import '@/assets/style/table/el-table.less';
</style>
