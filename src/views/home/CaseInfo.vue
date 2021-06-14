/* 案件信息
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:19:10
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-06 10:46:07
 */

<template>
    <div class="page-box full-height">
        <div class="page-top">
            <div class="page-title">
                <div class="tab-title">
                    <div
                        class="tab-item"
                        @click="changeTab(0)"
                        :class="[curActiveIndex==0?'active':'']"
                    >案件信息</div>
                    <div
                        v-if="isShowAttendView"
                        class="tab-item"
                        @click="changeTab(1)"
                        :class="[curActiveIndex==1?'active':'']"
                    >签到信息</div>
                </div>
            </div>
        </div>
        <div class="page-content" ref="pageContent">
            <div class="tab-content" v-if="curActiveIndex==0">
                <el-form
                    :model="ruleForm"
                    label-position="left"
                    label-width="1.4rem"
                    status-icon
                    ref="ruleForm"
                >
                    <el-form-item label-width="1.4rem" label="庭审法庭:" prop="courtroomName">
                        <div class="form-view">{{ ruleForm.courtroomName | emptyFilter }}</div>
                    </el-form-item>
                    <el-form-item label="案 号:" prop="caseCode">
                        <div class="form-view">{{ ruleForm.caseCode | emptyFilter }}</div>
                    </el-form-item>
                    <el-form-item label="案件类型:" prop="caseType">
                        <div
                            class="form-view"
                        >{{ commFilter.formatDict(caseTypeList())[ruleForm.caseType] | emptyFilter}}</div>
                    </el-form-item>
                    <el-form-item label="立案时间:" prop="createTime">
                        <div class="form-view">{{ ruleForm.createTime | emptyFilter }}</div>
                    </el-form-item>
                    <el-form-item label="案 由:" prop="caseCouse">
                        <div class="form-view">{{ ruleForm.caseCouseName | emptyFilter }}</div>
                    </el-form-item>
                    <el-form-item label="庭审次数:" prop="trialCount">
                        <div class="form-view">{{ ruleForm.trialCount | emptyFilter }}</div>
                    </el-form-item>
                    <el-form-item
                        v-for="(people, index) in peopleDTOList"
                        :key="index"
                        :label="people.label + ':'"
                        :prop="people.name"
                    >
                        <div class="form-view">{{ people.name | emptyFilter }}</div>
                    </el-form-item>
                    <el-form-item label="承办部门:" prop="deptName">
                        <div class="form-view">{{ ruleForm.deptName | emptyFilter }}</div>
                    </el-form-item>
                    <el-form-item label-width="1.4rem" label="案件描述:" prop="caseDescr">
                        <div class="form-view">{{ ruleForm.caseDescr | emptyFilter }}</div>
                    </el-form-item>
                </el-form>
            </div>
            <div class="tab-content" v-if="curActiveIndex==1 && isShowAttendView">
                <attend-view :tableHeight="tableHeight" :signFlag="signFlag"></attend-view>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { getArrDefValIdx, objArr2KeyArr } from '@/utils/utils';
import AttendView from '@/views/home/AttendView';
export default {
    name: 'CaseInfo',
    components: {
        AttendView
    },
    inject: ['reload', 'caseTypeList'],
    filters: {},
    props: {
        caseCode: {
            type: String,
            default: null
        },
        caseCodes: {
            type: Array,
            default: []
        },
        signFlag: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            tableHeight: '',
            plaintiffTypeList: [],
            defendantTypeList: [],
            othersTypeList: [],
            peopleDTOList: [],
            peopleMap: [],
            curActiveIndex: 0,
            /* 表单 */
            viewRules: {},
            ruleForm: {
                trialId: '',
                caseCode: '',
                caseCodes: null,
                courtroomId: '',
                courtroomName: '',
                trialCount: null,
                trialStatus: null,
                caseDescr: null,
                trialNotice: null,
                caseType: null,
                deptNo: null,
                deptName: '',
                planBeginDate: null,
                planEndDate: null,
                caseCouse: null,
                caseCouseName: null,
                isPublic: '0',
                isLive: '0',
                isBurn: '0',
                startDate: null,
                endDate: null,
                isDel: '0',
                createTime: null,
                createUser: null,
                updateTime: null,
                updateUser: null,
                randomCode: null,
                noteUrl: null,
                peopleDTOList: [
                    /*  {
                        peopleId: '333',
                        caseCode: '（2020）浙民商0002号',
                        trialCount: 0,
                        name: 'admin',
                        type: 'people_type',
                        code: '1',
                        cardId: null,
                        phone: null
                    },
                    {
                        peopleId: '312',
                        caseCode: '（2020）浙民商0002号',
                        trialCount: 0,
                        name: 'fg1',
                        type: 'people_type',
                        code: '5',
                        cardId: null,
                        phone: null
                    },
                    {
                        peopleId: '1111',
                        caseCode: '（2020）浙民商0002号',
                        trialCount: 0,
                        name: '原告原告',
                        type: 'plaintiff_select',
                        code: '1',
                        cardId: null,
                        phone: null
                    },
                    {
                        peopleId: '2222',
                        caseCode: '（2020）浙民商0002号',
                        trialCount: 0,
                        name: '被告',
                        type: 'defendant_select',
                        code: '1',
                        cardId: null,
                        phone: null
                    } */
                ],
                peopleMap: {
                    // 原告: '123'
                }
            }
        };
    },
    computed: {
        isShowAttendView() {
            return this.comm.isTrialAuthorizeShow('trial:signIn');
        }
    },
    watch: {
        caseCode: {
            handler() {
                this.$nextTick(function() {
                    if (this.caseCode) {
                        this.init();
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        // this.init();
    },
    mounted() {
        // this.init();
        this.tableHeight = this.$refs.pageContent.clientHeight - 40 + 'px';
    },
    methods: {
        ...mapActions({
            toTrialPage: 'moduleCase/toTrialPage',
            getTrialByCodeAndMainId: 'moduleCase/getTrialByCodeAndMainId'
        }),

        // 初始化
        async init() {
            this.plaintiffTypeList = await this.commFilter.queryDictValue({ type: 'plaintiff_select' });
            this.defendantTypeList = await this.commFilter.queryDictValue({ type: 'defendant_select' });
            this.othersTypeList = await this.commFilter.queryDictValue({ type: 'others_select' });
            let _this = this;
            console.log('init---caseInfo');
            if (this.$route.query.trialId) {
                if (this.caseCodes.length > 0 && _this.$route.query.trialId) {
                    this.reqGetTrialByCodeAndMainId({
                        trialId: _this.$route.query.trialId,
                        caseCode: _this.caseCode
                    });
                } else {
                    this.reqToTrialPage({ trialId: _this.$route.query.trialId });
                }
            }

        },

        changeTab(item) {
            this.curActiveIndex = item;
        },

        // 进入庭审获取案件信息
        reqToTrialPage(params) {
            this.toTrialPage(params).then((res) => {
                if (res.code === 0) {
                    this.ruleForm = res.data;
                    this.formatPeopleDTOList(this.ruleForm.peopleDTOList);
                }
            });
        },

        reqGetTrialByCodeAndMainId(params) {
            this.getTrialByCodeAndMainId(params).then((res) => {
                if (res.code === 0) {
                    this.ruleForm = {
                        courtroomName: res.data.courtroomName,
                        caseCode: res.data.caseCode,
                        caseCodes: this.ruleForm.caseCodes,
                        caseType: res.data.caseType,
                        createTime: res.data.createTime,
                        caseCouse: res.data.caseCouse,
                        caseCouseName: res.data.caseCouseName,
                        trialCount: res.data.trialCount,
                        deptName: res.data.deptName,
                        caseDescr: res.data.caseDescr,
                        peopleMap: res.data.peopleMap,
                        peopleDTOList: res.data.peopleDTOList
                    };
                    this.formatPeopleDTOList(this.ruleForm.peopleDTOList);
                }
            });
        },

        formatPeopleDTOList(peopleDTOList) {
            this.peopleDTOList = [];
            let defaultArr = [];
            if (!peopleDTOList) {
                return defaultArr;
            }
            if (peopleDTOList && peopleDTOList.length < 0) {
                return defaultArr;
            }
            let arr = [];
            let undertaker = {
                label: '审判长',
                name: '暂无'
            }; // 审判长
            let clerk = {
                label: '书记员',
                name: '暂无'
            }; // 主审人
            let mainJudge = {
                label: '主审人',
                name: '暂无'
            }; // 书记员
            let judgeArr = []; // 审判员
            let collegialArr = []; // 陪审员
            let plaintiffArr = []; // 原告
            let defendantArr = []; // 被告
            let othersArr = []; // 第三方

            for (let row of peopleDTOList.values()) {
                switch (row.type) {
                    case 'people_type': // 法院人员
                        switch (row.code) {
                            case '1':
                                undertaker = {
                                    label: '审判长',
                                    name: row.name
                                };
                                break;
                            case '2':
                                clerk = {
                                    label: '书记员',
                                    name: row.name
                                };
                                break;
                            case '3':
                                judgeArr.push({
                                    label: '审判员',
                                    name: row.name
                                });
                                break;
                            case '4':
                                collegialArr.push({
                                    label: '陪审员',
                                    name: row.name
                                });
                                break;
                        }
                        break;
                    case 'people_type_zsr':
                        switch (row.code) {
                            case '1':
                                mainJudge = {
                                    label: '主审人',
                                    name: row.name
                                };
                                break;
                        }
                        break;
                    case 'plaintiff_select':
                        plaintiffArr.push({
                            label: this.plaintiffTypeList[getArrDefValIdx(this.plaintiffTypeList, 'key', row.code)]
                                .value,
                            name: row.name
                        });
                        break;
                    case 'defendant_select':
                        defendantArr.push({
                            label: this.defendantTypeList[getArrDefValIdx(this.defendantTypeList, 'key', row.code)]
                                .value,
                            name: row.name
                        });
                        break;
                    case 'others_select':
                        othersArr.push({
                            label: this.othersTypeList[getArrDefValIdx(this.othersTypeList, 'key', row.code)].value,
                            name: row.name
                        });
                        break;
                }
            }
            let judge = {
                label: '审判员',
                name: objArr2KeyArr(judgeArr, 'name').join(',')
            };
            let collegial = {
                label: '陪审员',
                name: objArr2KeyArr(collegialArr, 'name').join(',')
            };
            let plaintiff = {
                label: plaintiffArr.length > 0 ? plaintiffArr[0].label : '原告',
                name: objArr2KeyArr(plaintiffArr, 'name').join(',')
            };
            let defendant = {
                label: defendantArr.length > 0 ? defendantArr[0].label : '被告',
                name: objArr2KeyArr(defendantArr, 'name').join(',')
            };
            // don't delete-WITTRIAL-645
            /* let others = {
                label: othersArr.length > 0 ? othersArr[0].label : '第三方',
                name: objArr2KeyArr(othersArr, 'name').join(',')
            };
            arr.push(others); */
            arr.push(undertaker);
            arr.push(clerk);
            arr.push(judge);
            arr.push(collegial);
            arr.push(mainJudge);
            arr.push(plaintiff);
            arr.push(defendant);
            this.peopleDTOList = arr;
            // console.log(arr);
            return arr;
        },

        // 格式化人员信息
        formatPeopleMap(peopleMap) {
            this.peopleMap = [];
            Object.keys(this.ruleForm.peopleMap).forEach((key, index) => {
                this.peopleMap.push({
                    label: key,
                    name: this.ruleForm.peopleMap[key]
                });
            });
        }
    }
};
</script>

<style lang="less" scoped>
.page-box {
    /deep/.el-form .el-form-item .el-form-item__label {
        color: @text_color_black;
    }
    .form-body .el-form .el-form-item .el-form-item__content .form-view {
        background: none;
        color: @text_color_black_75;
    }
}
.tab-title {
    overflow: hidden;
    .tab-item {
        width: 160px;
        text-align: center;
        float: left;
        cursor: pointer;
        border-bottom: 3px solid transparent;
    }
    .active {
        border-bottom: 3px solid @border_color_area;
    }
}
.tab-content {
    height: 100%;
    padding: 20px;
    .el-form .el-form-item{
        margin: 0 0 15px 0;
    }
}
</style>

<style lang="less">
</style>

