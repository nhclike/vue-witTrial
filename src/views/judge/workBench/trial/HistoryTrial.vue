<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">历史庭审</span>
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
                                            placeholder=""
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
                                            placeholder=""
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
                            </el-row>
                        </el-form>
                    </div>
                </div>
                <div class="opt-box">
                    <div class="title">案件排期列表</div>
                </div>
            </div>
            <!-- 列表内容区 -->
            <div class="tableContent" :style="tableStyle">
                <el-table
                    element-loading-text="拼命加载中"
                    :data="tableData"
                    style="width: 100%"
                    ref="multipleTable"
                    :row-key="getRowKeys"
                >
                    <el-table-column
                        show-overflow-tooltip
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
                            <span>{{
                                formatPeople(scope.row.peopleMap, '审判长')
                            }}</span>
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
                            <span>{{
                                formatPeople(scope.row.peopleMap, '书记员')
                            }}</span>
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
                                >{{ item.conntentText }}</span
                            >
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
                        <i class="font-color-primary">{{
                            tablePaginationData.pages
                        }}</i
                        >页
                        <i class="font-color-primary">{{
                            tablePaginationData.total
                        }}</i
                        >条记录
                    </span>
                </el-pagination>
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import { debounce } from '@/utils/utils';
export default {
    name: 'HistoryTrial',
    components: { },
    inject: ['reload', 'caseTypeList', 'trialStatusList'],
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
            /* 表单 */
            // 查询/过滤条件-用于v-model数据绑定
            inquireForm: {
                caseCode: '', // 案号
                caseType: '', // 案件类型
                courtroomId: '', // 法庭
                keyword: '' // 承办人员
            },
            // 表单验证
            inquireFormRules: {},
            /* 表格 */
            tableStyle: 'height:0px',
            // 设置表格的row-key
            getRowKeys(row) {
                return row.trialId;
            },
            showTableOperate: true, // 是否显示-列[操作]
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
                    prop: 'startDate',
                    label: '开庭时间',
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
                    formatter: this.commFilter.formatBoolean
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
                    conntentText: '庭审记录', // 按钮内容
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'goTrial'
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
    computed: {},
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
            queryTrial: 'moduleCase/queryTrial',
            queryCourtroom: 'moduleCase/queryCourtroom',
            queryHistoryTrial: 'moduleSystem/queryHistoryTrial',
            getMainCaseTrialId: 'moduleSystem/getMainCaseTrialId'
        }),

        // 查询法庭
        reqQueryCourtroom() {
            this.queryCourtroom().then((res) => {
                if (res.code === 0) {
                    this.courtList = res.data;
                }
            });
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
            this.queryList();
        },

        // 设置表格高度
        setTableStyle() {
            let topH = this.$refs.top.clientHeight;
            let bottomH = this.$refs.pagination.clientHeight;
            this.tableStyle = `height:calc(100% - ${topH + bottomH}px)`;
        },

        // 查询-获取列表
        queryList: debounce(function(search) {
            this.tablePaginationData.currentPage = search
                ? 1
                : this.tablePaginationData.currentPage;
            let queryParams = {
                curPage: search ? '1' : String(this.tablePaginationData.currentPage),
                limit: String(this.tablePaginationData.pageSize),
                caseCode: this.inquireForm.caseCode,
                caseType: this.inquireForm.caseType,
                courtroomId: this.inquireForm.courtroomId,
                keyword: this.inquireForm.keyword
            };
            // 请求接口-获取列表
            this.getListData(queryParams);
        }, 500),

        // 接口-获取列表
        getListData(params) {
            this.queryHistoryTrial(params).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.tablePaginationData.total = res.data.totalCount;
                    this.tablePaginationData.pages = res.data.totalPage;
                }
            });
        },

        // 每页数量-pageSize-change事件-表格数据重新渲染
        handleSizeChange(val) {
            this.tablePaginationData.pageSize = val;
            this.queryList();
        },
        // 页码-currentPage-change事件-表格数据重新渲染
        handleCurrentChange(val) {
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
            return item.active;
        },

        // 列【操作】点击事件
        async handleClickOperate(row, item, index) {
            if (item.action) {
                let trialID = row.trialId;
                switch (item.action) {
                    case 'goTrial':
                        if (row.cognate === '1') {  // cognate === 1 并案 获取主案件trialId
                            await this.getMainCase(row.trialId, (data) => {
                                trialID = data;
                            });
                        }
                        sessionStorage.setItem('trialId', trialID);
                        this.changeRouter('/trialCheck/topicReader', {trialId: trialID, fromWorkBench: true});
                        break;
                }
            }
        },
        async getMainCase(trialId, callback) {
            await this.getMainCaseTrialId(trialId).then((res) => {
                if (res.code === 0) {
                    callback(res.data.trialId);
                }
            });
        }

        /* --------------------表格-结束-------------------- */

    }
};
</script>
<style scoped lang='less'>
@import '@/assets/style/table/el-table.less';
</style>
