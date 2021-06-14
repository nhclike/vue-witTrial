/* 开庭弹窗
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:19:27
 * @Last Modified by: nihc
 * @Last Modified time: 2021-03-01 10:45:55
 */

<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p v-if="operateBtnName==='view'" class="form-title">开庭操作</p>
            <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
        </div>
        <div class="form-body">
            <el-form
                :model="ruleForm"
                label-position="right"
                label-width="1.4rem"
                status-icon
                :rules="operateBtnName!=='view'?rules:viewRules"
                ref="ruleForm"
            >
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="录音录像" prop="audioVideo">
                            <el-switch
                                v-model="audioVideo"
                                active-color="#2882FF"
                                inactive-color="#BCBCBC"
                                :active-value="'1'"
                                :inactive-value="'0'"
                                active-text="默认开启"
                                disabled
                            ></el-switch>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="录音备份" prop="recordBackUp">
                            <el-switch
                                v-model="recordBackUp"
                                active-color="#2882FF"
                                inactive-color="#BCBCBC"
                                :active-value="'1'"
                                :inactive-value="'0'"
                                active-text="默认开启"
                                disabled
                            ></el-switch>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="庭审直播" prop="living">
                    <el-switch
                        v-model="living"
                        active-color="#2882FF"
                        inactive-color="#BCBCBC"
                        :active-value="'1'"
                        :inactive-value="'0'"
                        :active-text="living==='1'?'开启':'关闭'"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="增录" prop="addCheckList">
                    <el-checkbox
                        :indeterminate="isIndeterminate"
                        v-model="checkAll"
                        @change="handleCheckAllChange"
                    >全选</el-checkbox>
                    <el-checkbox-group
                        v-model="ruleForm.addCheckList"
                        @change="handleCheckedListChange"
                    >
                        <el-row>
                            <el-col :span="8" v-for="check in addCheckList" :key="check.channelId">
                                <el-checkbox
                                    :title="check.name"
                                    :label="check.channelId"
                                >{{check.name}}</el-checkbox>
                            </el-col>
                        </el-row>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <!-- don't delete-旧-开庭操作多选 -->
            <!-- <div class="check-box">
                <div
                    class="check-box-item"
                    v-for="(check,index) in checkList"
                    :key="index"
                    @click="checkItem(check,index)"
                >
                    <div
                        class="img-box box pos-r"
                        :class="{active:checkedList.indexOf(check.key)>-1}"
                    >
                        <img :src="check.icon" alt />
                        <i v-if="checkedList.indexOf(check.key)>-1" class="el-icon-check pos-a"></i>
                    </div>
                    <div class="name">{{check.value}}</div>
                </div>
            </div>-->
        </div>
        <div class="form-bottom">
            <span class="shj-btn--confirm shj-btn--medium" @click="fnOpenCourt()">确定</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="$emit('emitClose')">取消</span>
        </div>
    </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
import { objArr2KeyArr, checkXyClient, pullClient,debounce } from '@/utils/utils';
export default {
    name: 'OpenCourt',
    components: { ShjListPage },
    inject: ['reload'],
    filters: {},
    props: {
        operateBtnName: {
            type: String,
            default: 'view',
            required: false
        },
        // '0'-非远程庭审 '1'-远程庭审
        remoteVideo: {
            type: String,
            default: '0'
        }
    },
    data() {
        return {
            audioVideo: '1',
            recordBackUp: '1',
            living: '0', // '1'-开启 '0'-关闭
            // 已选列表
            checkedList: [],
            // 复选框列表
            checkList: [
                {
                    key: '1',
                    value: '录音录像',
                    icon: require('@/assets/images/openCourt/icon_audioVideo.png')
                },
                {
                    key: 'recordBackUp',
                    value: '录音备份',
                    icon: require('@/assets/images/openCourt/icon_videoBackup.png')
                },
                {
                    key: 'speechRecognition',
                    value: '语音识别系统',
                    icon: require('@/assets/images/openCourt/icon_audioIdentify.png')
                },
                {
                    key: 'living',
                    value: '庭审直播',
                    icon: require('@/assets/images/openCourt/icon_tiralLive.png')
                },
                {
                    key: 'remoteTrial',
                    value: '远程庭审',
                    icon: require('@/assets/images/openCourt/icon_tiralRemote.png')
                }
            ],
            // 增录
            addCheckList: [
                /* {
                    channelId: '1',
                    name: '原告/公诉人'
                },
                {
                    channelId: '2',
                    name: '原告代理'
                },
                {
                    channelId: '3',
                    name: '被告'
                },
                {
                    channelId: '4',
                    name: '被告代理'
                },
                {
                    channelId: '5',
                    name: '审判长'
                },
                {
                    channelId: '6',
                    name: '书记员'
                },
                {
                    channelId: '7',
                    name: '陪审员'
                },
                {
                    channelId: '8',
                    name: '审判员'
                } */
            ],
            /* checkbox-group */
            checkAll: false, // 全选状态
            isIndeterminate: false, // 设置 indeterminate 状态，只负责样式控制
            /* 表单 */
            // 校验表单
            viewRules: {}, // 查看模式下表单校验规则
            ruleForm: {
                addCheckList: [] // 复选框选中值
            }
        };
    },
    computed: {},
    watch: {},
    created() {
        // this.init();
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions({
            openCourt: 'moduleJudge/openCourt',
            getAddChannelInfo: 'moduleJudge/getAddChannelInfo',
            createMeeting: 'moduleXyDevice/createMeeting', // 创建远程庭审（会议）
            startRecord: 'moduleXyDevice/startRecord' // 开始录制
        }),
        ...mapMutations('moduleJudge', ['recordIdMut']),

        // 初始化
        init() {
            let params = {
                trialId: this.$route.query.trialId
            };
            this.reqGetAddChannelInfo(params);
        },

        reqGetAddChannelInfo(params) {
            this.getAddChannelInfo(params).then((res) => {
                if (res.code === 0) {
                    this.addCheckList = res.data;
                }
            });
        },

        // don't delete-旧-开庭操作多选
        /* checkItem(item, index) {
            if (this.checkedList.indexOf(item.key) > -1) {
                removeArrDefVal(this.checkedList, null, item.key);
            } else {
                this.checkedList.push(item.key);
            }
        }, */

        // 开庭
        fnOpenCourt:debounce(function() {
            this.$confirm(`确定开庭吗？`, '系統提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                showCancelButton: true,
                customClass: 'confirm-success',
                type: 'info'
            })
                .then(() => {
                    // don't delete-旧-开庭操作多选
                    // console.log(this.checkedList);
                    /* for (let row of this.checkedList.values()) {
                        params[row] = true;
                    } */
                    let params = {
                        living: this.living,
                        trialId: this.$route.query.trialId,
                        channelIds: this.ruleForm.addCheckList.join(',')
                    };
                    // console.log(params);
                    console.log(this.ruleForm.addCheckList);
                    this.reqOpenCourt(params);
                })
                .catch(() => {
                    // this.$message.info(`操作取消`);
                });
        },500),

        reqOpenCourt(params) {
            this.openCourt(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.recordIdMut(res.data);
                    this.$emit('emitTrialStatus', '1');
                    this.$emit('emitClose');
                    /* if (this.remoteVideo === '1') {
                        // shjTodo-如果是远程庭审，默认拉起审判长本地软终端
                        this.reqCreateMeeting({ trialId: this.$route.query.trialId });
                    } */
                }else{
                	if(res.code === 555){
                		this.$confirm(`磁盘空间不足，是否继续开庭？`, '系統提示', {
			                confirmButtonText: '确定',
			                cancelButtonText: '取消',
			                showCancelButton: true,
			                customClass: 'confirm-success',
			                type: 'info'
			            })
			                .then(() => {
			                    params.isRecord = 0;
			                    this.reqOpenCourt(params);
			                })
			                .catch(() => {
			                    // this.$message.info(`操作取消`);
			                });
                	}
               	}
            });
        },

        // 创建远程庭审（会议）
        reqCreateMeeting(params) {
            this.createMeeting(params).then((res) => {
                console.log('createMeeting', res);
                // if (res.code === 0) {
                let hasXyClient = checkXyClient(res.data.meetingNumber);
                if (!hasXyClient) {
                    this.$CusConfirm({
                        title: '未安装视频会议插件',
                        cancel: () => {
                            // console.log('点取消调用');
                        },
                        ok: () => {
                            //
                        }
                    });
                } else {
                    pullClient(hasXyClient, res.data.joinmeetingUrl, 'xyIframe');
                    this.reqStartRecord({ meetingNumber: res.data.meetingNumber });
                }
                // }
            });
        },

        // 开始录制
        reqStartRecord(params) {
            this.startRecord(params).then((res) => {
                // console.log('startRecord', res);
            });
        },

        /* --------------------checkbox-group事件-开始-------------------- */
        // 点击全选按钮
        handleCheckAllChange(val) {
            this.ruleForm.addCheckList = val ? objArr2KeyArr(this.addCheckList, 'channelId') : []; // 将数组转为只含有指定属性的数组
            this.isIndeterminate = false;
        },

        // 点击复选框选项
        handleCheckedListChange(val) {
            this.checkAll = val.length === this.addCheckList.length;
            this.isIndeterminate = val.length > 0 && val.length < this.addCheckList.length;
        }
        /* --------------------checkbox-group事件-结束-------------------- */
    }
};
</script>

<style lang="less" scoped>
.alert-box {
    .alert-box-body {
        width: 900px;
        /deep/.el-checkbox .el-checkbox__label {
            width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: @font28px;
            line-height: @form_item_h;
            vertical-align: top;
        }
    }
}
// don't delete-旧-开庭操作多选
/* .check-box {
    display: flex;
    justify-content: space-between;
    font-size: @font28px;
    text-align: center;
    .check-box-item {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 130px;
        .img-box {
            padding: 20px;
            border: 1px solid @color_primary;
            &.active {
                background: @bg_maskLayer_primary7;
            }
            img {
                width: 90px;
                height: 90px;
            }
            .el-icon-check {
                font-size: 80px;
                color: @text_color_white;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-weight: bold;
            }
        }
        .name {
            width: 170px;
            margin: 20px 0;
        }
    }
} */
</style>

<style lang="less">
</style>

