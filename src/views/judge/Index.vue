/* 法官首页
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:18:34
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-13 14:10:41
 */

<template>
    <div class="index-judge full-height" @click="activeIndex = -1">
        <HomeHeader></HomeHeader>
        <div class="content">
            <div v-if="showTiral === 1" class="todayToCourt">
                <p>今日待开庭( {{ pageList.length }} )</p>
                <el-row class="a-list">
                    <el-col
                        :span="12"
                        class="a-list-item pos-r"
                        v-for="(item, index) in todayToCourtList"
                        :key="index"
                    >
                        <div class="flag pos-a">
                            <div class="court-flag">{{ item.courtroomName | emptyFilter }}</div>
                            <div
                                :class="[
                                    'status-flag',
                                    item.trialStatus === '1'
                                        ? 'status-flag-1'
                                        : item.trialStatus === '0'
                                        ? 'status-flag-0'
                                        : 'status-flag-2'
                                ]"
                            >{{ commFilter.formatDict(trialStatusList())[item.trialStatus] | emptyFilter }}</div>
                        </div>

                        <el-row class="a-list-box box">
                            <el-col class="caseCode-item" :span="12">
                                <span class="a-list-label">案号：</span>
                                <div
                                    class="a-list-content pos-r"
                                    @click.stop="showCaseCodes(item, index)"
                                >
                                    <span
                                        class="txt-ellipsis caseCode"
                                        :title="item.caseCode"
                                    >{{ item.caseCode | emptyFilter }}</span>
                                    <i
                                        v-if="
                                            item.caseCodes &&
                                            item.caseCodes.length > 1
                                        "
                                        class="i-btn el-icon-caret-bottom font-color-cancel"
                                    ></i>
                                    <div
                                        v-if="
                                            activeIndex === index &&
                                            item.caseCodes &&
                                            item.caseCodes.length > 0
                                        "
                                        class="caseCodeList pos-a"
                                    >
                                        <div
                                            class="c-item txt-ellipsis"
                                            v-for="(caseCode,
                                            caseCodeIdx) in item.caseCodes"
                                            :key="caseCodeIdx"
                                            :title="caseCode"
                                            @click.stop="
                                                changeCaseCode(caseCode, index)
                                            "
                                        >{{ caseCode }}</div>
                                    </div>
                                </div>
                            </el-col>
                            <el-col class="a-list-box-item" :span="12">
                                <span class="a-list-label">开庭时间：</span>
                                <span
                                    class="a-list-content txt-ellipsis"
                                    :title="item.planBeginDate"
                                >
                                    {{
                                    item.planBeginDate | emptyFilter
                                    }}
                                </span>
                            </el-col>
                            <el-col
                                class="a-list-box-item"
                                :span="12"
                                v-for="(people, index) in formatPeopleDTOList(
                                    item.peopleDTOList
                                )"
                                :key="index"
                            >
                                <span class="a-list-label">{{ people.label }}：</span>
                                <span
                                    class="a-list-content txt-ellipsis"
                                    :title="people.name"
                                >{{ people.name }}</span>
                            </el-col>
                            <el-col class="a-list-box-item" :span="24">
                                <span class="a-list-label">案由：</span>
                                <span
                                    class="a-list-content txt-ellipsis"
                                    :title="item.caseCouseName"
                                >
                                    {{
                                    item.caseCouseName | emptyFilter
                                    }}
                                </span>
                            </el-col>
                            <el-col :span="24" class="txt-center">
                                <button
                                    :span="4"
                                    class="shj-btn--primary shj-btn--medium a-list-btn"
                                    @click="
                                        changeRouter('/home/topicReader', item)
                                    "
                                >进入</button>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>

                <div v-if="showPage" class="btn-box full-width txt-center">
                    <button
                        :class="[
                            pageNo > 1
                                ? 'shj-btn--primary'
                                : 'shj-btn--primary_light',
                            'shj-btn--large'
                        ]"
                        :disabled="pageNo > 1 ? false : true"
                        @click="toPage(pageNo - 1)"
                    >上一页</button>
                    <button
                        :class="[
                            pageNo < Math.ceil(pageList.length / pageSize)
                                ? 'shj-btn--primary'
                                : 'shj-btn--primary_light',
                            'shj-btn--large'
                        ]"
                        :disabled="
                            pageNo < Math.ceil(pageList.length / pageSize)
                                ? false
                                : true
                        "
                        @click="toPage(pageNo + 1)"
                    >下一页</button>
                </div>
            </div>
            <div v-if="showTiral === 0" class="noTrial">
                <div class="vertical-horizontal-center">
                    <div>
                        <img src="@/assets/images/workBench/noTrial.png" />
                    </div>
                    <div class="msg">今日暂无庭审案件</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import HomeHeader from '@/components/header/HomeHeader';
import { pagination, getArrDefValIdx, objArr2KeyArr } from '@/utils/utils';
export default {
    name: 'NewVuePage',
    components: { HomeHeader },
    inject: ['reload', 'trialStatusList'],
    filters: {},
    data() {
        return {
            plaintiffTypeList: [],
            defendantTypeList: [],
            othersTypeList: [],
            showTiral: -1,
            activeIndex: -1, // 当前并案下拉列表的索引
            date: new Date().Format('yyyy年MM月dd日 hh:mm:ss w'),
            showPage: false, // 是否显示分页
            pageNo: 1,
            pageSize: 4,
            pageList: [
                /* {
                    trialId: 'be3deea30552c9cbe784cad4adf8e8d8',
                    caseCode:
                        '并案案号并案案号并案案号并案案号并案案号1,并案案号2',
                    caseCodes: [],
                    courtroomId: 'O50001',
                    courtroomName: '第一法庭',
                    trialCount: 1,
                    trialStatus: '0',
                    caseDescr: '简单描述一下',
                    trialNotice: null,
                    caseType: '1',
                    deptNo: '123',
                    planBeginDate: '2020-09-10 11:00:00.0',
                    planEndDate: '2020-09-10 11:00:00.0',
                    caseCouse: '0001',
                    isPublic: '0',
                    isLive: '0',
                    isBurn: '0',
                    startDate: null,
                    endDate: null,
                    isDel: '0',
                    createTime: '2020-09-10 13:17:27.0',
                    createUser: 'admin',
                    updateTime: null,
                    updateUser: null,
                    randomCode: '111111',
                    noteUrl: null,
                    peopleDTOList: [
                        {
                            peopleId: '61e3755cf2b07669e5d941c9dfaea62e',
                            caseCode: '（2020）浙民商0001号',
                            trialCount: 0,
                            name: '我是原告',
                            type: 'plaintiff_select',
                            code: '1',
                            cardId: '15042817775015128X',
                            phone: '15721545256'
                        },
                        {
                            peopleId: '111',
                            caseCode: '（2020）浙民商0001号',
                            trialCount: 0,
                            name: '我是被告',
                            type: 'defendant_select',
                            code: '1',
                            cardId: null,
                            phone: null
                        },
                        {
                            peopleId: '222',
                            caseCode: '（2020）浙民商0001号',
                            trialCount: 1,
                            name: 'admin',
                            type: 'people_type',
                            code: '1',
                            cardId: null,
                            phone: null
                        }
                    ],
                    peopleMap: {
                        原告: '123',
                        法官1: '123'
                    }
                } */
            ],
            todayToCourtList: []
        };
    },
    computed: {},
    watch: {},
    created() {
        // this.init();
    },
    async mounted() {
        this.plaintiffTypeList = await this.commFilter.queryDictValue({ type: 'plaintiff_select' });
        this.defendantTypeList = await this.commFilter.queryDictValue({ type: 'defendant_select' });
        this.othersTypeList = await this.commFilter.queryDictValue({ type: 'others_select' });
        this.init();
    },
    methods: {
        ...mapActions({
            queryTodayTrialTop5: 'moduleJudge/queryTodayTrialTop5',
            getTrialByCodeAndMainId: 'moduleCase/getTrialByCodeAndMainId'
        }),

        // 初始化
        init() {
            this.reqQueryTodayTrialTop5();
            /* this.todayToCourtList = pagination(
                this.pageNo,
                this.pageSize,
                this.pageList
            ); */
        },

        // 页面跳转
        changeRouter(path, item) {
            this.$router.push({
                path: path,
                query: {
                    // caseCode: item.caseCode,
                    trialId: item.trialId
                }
            });
        },

        // 获取今日庭审列表
        reqQueryTodayTrialTop5() {
            this.queryTodayTrialTop5().then((res) => {
                if (res.code === 0) {
                    this.pageList = res.data;
                    this.showPage = res.data.length > this.pageSize ? true : false;
                    this.todayToCourtList = pagination(this.pageNo, this.pageSize, this.pageList);
                }
                this.showTiral = this.pageList.length > 0 ? 1 : 0;
            });
        },

        // 跳页
        toPage(pageNo) {
            if (pageNo < 1) {
                this.pageNo = 1;
                return false;
            }
            if (pageNo > Math.ceil(this.pageList.length / this.pageSize)) {
                this.pageNo = Math.ceil(this.pageList.length / this.pageSize);
                return false;
            }
            this.pageNo = pageNo;
            this.todayToCourtList = pagination(this.pageNo, this.pageSize, this.pageList);
        },

        formatPeopleDTOList(peopleDTOList) {
            let defaultArr = [
                {
                    label: '原告',
                    name: '暂无'
                },
                {
                    label: '被告',
                    name: '暂无'
                }
            ];
            if (!peopleDTOList) {
                return defaultArr;
            }
            if (peopleDTOList && peopleDTOList.length < 0) {
                return defaultArr;
            }
            let arr = [];
            let plaintiffArr = [];
            let defendantArr = [];
            for (let row of peopleDTOList.values()) {
                switch (row.type) {
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
                }
            }
            let plaintiff = {
                label: plaintiffArr.length > 0 ? plaintiffArr[0].label : '原告',
                name: objArr2KeyArr(plaintiffArr, 'name').join(',')
            };
            let defendant = {
                label: defendantArr.length > 0 ? defendantArr[0].label : '被告',
                name: objArr2KeyArr(defendantArr, 'name').join(',')
            };
            arr.push(plaintiff);
            arr.push(defendant);
            // console.log(arr);
            return arr;
        },

        showCaseCodes(item, index) {
            if (item.caseCodes && item.caseCodes.length > 1) {
                this.activeIndex = index;
            } else {
                this.activeIndex = -1;
            }
        },

        // 切换并案案号
        changeCaseCode(caseCode, index) {
            this.todayToCourtList[index].caseCode = caseCode;
            this.activeIndex = -1;
            // 查询案号，更新信息
            let params = {
                trialId: this.todayToCourtList[index].trialId,
                caseCode: caseCode
            };
            this.getTrialByCodeAndMainId(params).then((res) => {
                if (res.code === 0) {
                    this.todayToCourtList[index].trialStatus = res.data.trialStatus;
                    this.todayToCourtList[index].planBeginDate = res.data.planBeginDate;
                    this.todayToCourtList[index].peopleMap = res.data.peopleMap;
                    this.todayToCourtList[index].peopleDTOList = res.data.peopleDTOList;
                    this.todayToCourtList[index].caseCouseName = res.data.caseCouseName;
                }
            });
        }
    }
};
</script>

<style lang="less" scoped type="text/less">
.noTrial {
    width: 100%;
    height: 100%;
    text-align: center;
    background: @color_primary_light;
    img {
        width: 400px;
        height: 308px;
    }
    .msg {
        font-size: 48px;
        color: @text_color_black_75;
    }
}
.index-judge {
    // width: 2560px;
    // height: 1080px;
    background: url('@{base_url}/bg.png') no-repeat top center;
    background-size: 100% 100%;
    .content {
        height: calc(100% - @top_menu_h);
        overflow-y: auto;
    }
    .todayToCourt {
        height: 100%;
        width: 2250px;
        margin: 0 auto;
        p {
            font-size: @font28px;
            margin-bottom: 30px;
            color: @text_color_white_8;
            font-weight: bold;
        }
    }
    .a-list {
        font-size: @font26px;
        margin: -20px -25px;
        // height: calc(~'100% - 160px');
        .flag {
            text-align: center;
            top: 20px;
            left: -10px;
            line-height: 40px;
            z-index: 1999;
            color: @text_color_white;
            display: flex;
        }
        .court-flag {
            padding: 0 20px;
            background: @color_danger;
            margin-right: 20px;
            &::after {
                content: ' ';
                display: inline-block;
                border-color: transparent @color_danger transparent transparent;
                border-width: 0 10px 10px 0;
                border-style: solid;
                position: absolute;
                bottom: -10px;
                left: 0;
            }
        }
        .status-flag {
            color: @text_color_white;
            line-height: 40px;
            padding: 0 20px;
            &.status-flag-0 {
                background: #f0d463;
            }
            &.status-flag-1 {
                background: #27c742;
            }
            &.status-flag-2 {
                background: @color_info;
            }
        }
        .a-list-item {
            margin: 20px 25px;
            width: 1100px;
        }
        .a-list-box {
            height: 330px;
            overflow-y: auto;
            border-radius: @border_large;
            padding: 70px 40px 30px;
            line-height: 50px;
            color: @text_color_black_75;
            .caseCode-item {
                height: 0.5rem;
                line-height: 0.5rem;
                .a-list-label {
                    color: @text_color_black;
                }
                .a-list-content {
                    display: inline-block;
                    width: calc(100% - @label_w);
                    span.caseCode {
                        width: calc(100% - 40px);
                    }
                }
            }
            .a-list-box-item {
                display: flex;
                height: 50px;
                line-height: 50px;
                .a-list-label {
                    // width: @label_w;
                    color: @text_color_black;
                }
                .a-list-content {
                    flex: 1;
                    display: inline-block;
                    span.caseCode {
                        width: calc(100% - 40px);
                    }
                }
            }
            @label_w: 130px;
            span {
                vertical-align: middle;
                display: inline-block;
            }
        }
        .a-list-btn {
            // width: 200px;
            // height: 60px;
            padding: 18px 40px;
            margin-top: 10px;
            &:not(:first-child) {
                margin-left: 20px;
            }
        }
    }
    .btn-box {
        margin-top: 20px;
        button {
            width: 200px;
            &:disabled {
                cursor: not-allowed;
            }
        }
    }
    .caseCodeList {
        z-index: 1999;
        top: 100%;
        left: 0;
        width: 100%;
        max-height: 200px;
        overflow: auto;
        padding: 10px;
        background: @text_color_white;
        border: 1px solid @border_color_form;
        .c-item {
            line-height: @form_item_h;
            cursor: pointer;
            &:hover {
                color: @color_primary;
            }
        }
    }
}
</style>
