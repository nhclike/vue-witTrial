<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">庭审管理</span>
                </div>
                <!-- 列表查询区 -->
                <div class="form-body inquire">
                    <div>
                        <el-form
                            :model="inquireForm"
                            :label-position="'right'"
                            label-width="1.8rem"
                            status-icon
                            ref="inquireForm"
                            @submit.native.prevent
                        >
                            <el-row>
                                <el-col :span="8">
                                    <el-form-item label="法庭名称">
                                        <el-input v-model="inquireForm.keyword"
                                                  placeholder="输入法庭名称搜索"
                                                  clearable
                                                  @input="queryList()"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </div>
            </div>
            <!-- 列表内容区 -->
            <div class="tableContent courtrooom-list">
                <el-row :gutter="20">
                    <el-col :xs="8" :md="8" :lg="6" :xl="6"
                            v-for="item in courtroomList"
                            :key="item.courtroomId"
                    >
                        <el-container>
                            <el-header>
                                <div class="title"><i class="i-courtroom"></i>{{item.courtroomName}}</div>
                                <div class="opt"
                                     v-if="item.trialDTOList && item.trialDTOList.length > 0"
                                     @click="handleClick(item.courtroomId)"
                                >
                                    排期列表
                                </div>
                            </el-header>
                            <el-main>
                                <template v-if="item.trialDTOList && item.trialDTOList.length > 0">
                                    <ul class="scheduling-list">
                                        <li v-for="list in item.trialDTOList"
                                            :key="list.trialId"
                                            :title="list.caseCode"
                                            class="overflow"
                                        >
                                            {{list.caseCode}}
                                        </li>
                                    </ul>
                                    <div :title="item.trialDTOList[0].planBeginDate">
                                        {{item.trialDTOList[0].planBeginDate}}
                                    </div>
                                    <div class="status" :class="`status${item.trialDTOList[0].trialStatus}`">
                                        {{trialStatusFormat(item.trialDTOList[0].trialStatus)}}
                                    </div>
                                </template>
                                <div class="empty" v-else>空闲</div>
                            </el-main>
                            <el-footer>
                                <span v-if="item.trialDTOList && item.trialDTOList.length > 0 && item.trialDTOList[0].trialFlag == 1"
                                      class="shj-btn--danger shj-btn--medium"
                                      @click="handleEnterTrialClick(item.trialDTOList[0].trialId)">
                                    进入庭审
                                </span>
                                <span v-else
                                      class="shj-btn--confirm shj-btn--medium"
                                      @click="handleSchedulingClick(item.courtroomId)"
                                >
                                    案件排期
                                </span>
                            </el-footer>
                        </el-container>
                    </el-col>
                </el-row>
            </div>
        </div>
        <!-- 弹窗 排期列表 -->
        <scheduling-list v-if="listVisible"
                         ref="schedulingList"
                         :courtroomId="courtroomId"
                         @emitClose="listVisible=false"
                         @enterTrial="handleEnterTrialClick"
        ></scheduling-list>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import SchedulingList from '@/views/judge/workBench/trial/SchedulingList';
import { debounce } from '@/utils/utils';
export default {
    name: 'TrialManagement',
    components: {
        SchedulingList
    },
    inject: ['reload', 'trialStatusList'],
    props: {

    },
    data() {
        return {
            // 查询/过滤条件-用于v-model数据绑定
            inquireForm: {
                keyword: ''  // 法庭名称
            },
            listVisible: false, // 是否显示操作弹窗
            courtroomList: []     // 法庭列表
        };
    },
    computed: {},
    watch: {},
    created() {
        //
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions('moduleCase', ['queryAllTrial']),
        // 初始化
        init() {
            this.queryList();
        },

        // 查询-获取列表
        queryList: debounce(function() {
            // 请求接口-获取列表
            this.queryAllTrial({keyword: this.inquireForm.keyword.trim()}).then((res) => {
                if (res.code === 0) {
                    this.courtroomList = res.data;
                }
            });
        }, 500),
        trialStatusFormat(value) {
            let obj = this.commFilter.formatDict(this.trialStatusList());
            return obj[value] || '';
        },
        handleClick(courtroomId) {
            this.courtroomId = courtroomId;
            this.listVisible = true;
        },
        handleEnterTrialClick(trialId) {
            this.$router.push({
                path: '/home/topicReader',
                query: {trialId: trialId, fromWorkBench: true}
            });
        },
        handleSchedulingClick(courtroomId) {
            this.$router.push({
                path: '/main/judge/workbench/case/caseScheduling',
                query: {formAction: '1', courtroomId: courtroomId}
            });
        }
    }
};
</script>

<style lang="less" type="text/less" scoped>
    @import '../../../../assets/style/table/el-table.less';
    @bg_blue: #1677ff;
    @bg_red:  #EA1C26;
    .overflow{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .listPage {
        .shjListPage {
            display: flex;
            flex-direction: column;
            .tableContent {
                flex: 1;
                border: 0;
            }
        }
    }
    .courtrooom-list {
        /deep/ .el-row {
            margin: 0 !important;
            .el-col {
                padding: 0.3rem !important;
            }
        }
        /deep/ .el-container {
            border: 1px solid @border_color;
            .el-header {
                display: flex;
                height: 60px !important;
                line-height: 60px;
                background-color: @bg_blue;
                color: #fff;
                .title {
                    flex: 1;
                    padding-right: 15px;
                    .overflow
                }
                .opt {
                    cursor: pointer;
                }
            }
            .el-main {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 220px;
                .scheduling-list{
                    flex: 1;
                    width: 100%;
                    overflow-y: auto;
                    font-size: @font22px;
                    margin-bottom: 10px;
                }
                .empty {
                    align-self: center;
                }
                .status {
                    &:before {
                        content: '';
                        display: inline-block;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        vertical-align: middle;
                    }
                    &.status0 {  // 待庭审
                        color: @bg_blue;
                        &:before {
                            background-color: @bg_blue;
                        }
                    }
                    &.status1,&.status2,&.status3 {  // 庭审中、暂停、待校对
                        color: @bg_red;
                        &:before {
                            background-color: @bg_red;
                        }
                    }
                }
            }
            .el-footer {
                height: auto !important;
                text-align: center;
                padding-bottom: 20px;
            }
        }
    }
</style>
