/* 增录弹窗
 * @Author: ShiHuiJun
 * @Date: 2020-09-24 14:57:16
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2020-10-13 10:46:24
 */
<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p v-if="operateBtnName==='view'" class="form-title">增录</p>
            <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
        </div>
        <div class="form-body">
            <el-form
                :model="ruleForm"
                label-position="top"
                status-icon
                :rules="operateBtnName!=='view'?rules:viewRules"
                ref="ruleForm"
            >
                <el-form-item label="选择增录通道" prop="addCheckList">
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
                            <el-col :span="8" v-for="check in addCheckList" :key="String(check.channelId)">
                                <el-checkbox :label="String(check.channelId)" :disabled="hasAddCheckList.indexOf(String(check.channelId))>-1">{{check.name}}</el-checkbox>
                            </el-col>
                        </el-row>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
        </div>
        <div class="form-bottom">
            <span class="shj-btn--confirm shj-btn--medium" @click="fnAddRecord()">确定</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="$emit('emitClose')">取消</span>
        </div>
    </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
import { objArr2KeyArr } from '@/utils/utils';
export default {
    name: 'AddRecord',
    components: { ShjListPage },
    inject: ['reload'],
    filters: {},
    props: {
        operateBtnName: {
            type: String,
            default: 'view',
            required: false
        }
    },
    data() {
        return {
            hasAddCheckList: [], // 已经增录id
            // 复选框列表-增录
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
            viewRules: {}, // 查看模式下表单校验规则
            // 校验表单
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
            addNRURecord: 'moduleJudge/addNRURecord',
            getAddChannelInfo: 'moduleJudge/getAddChannelInfo',
            queryTrialById: 'moduleJudge/queryTrialById'
        }),
        ...mapMutations('moduleJudge', ['recordIdMut']),

        // 初始化
        init() {
            let params = {
                trialId: this.$route.query.trialId
            };
            this.reqGetAddChannelInfo(params);
        },
        // 获取增录通道列表
        reqGetAddChannelInfo(params) {
            this.getAddChannelInfo(params).then((res) => {
                if (res.code === 0) {
                    this.addCheckList = res.data;
                    this.reqQueryTrialById(params);
                }
            });
        },
        // 查询单个庭审信息
        reqQueryTrialById(params) {
            this.queryTrialById(params).then((res) => {
                if (res.code === 0) {
                    if (res.data.nruAddRecord.length > 0) {
                        this.hasAddCheckList = res.data.nruAddRecord.split(',');
                        this.ruleForm.addCheckList = res.data.nruAddRecord.split(',');
                    }
                }
            });
        },
        // 增录
        fnAddRecord() {
            let newAddCheckList = [];
            for (let row of this.ruleForm.addCheckList.values()) {
                if (this.hasAddCheckList.indexOf(row) < 0) {
                    newAddCheckList.push(row);
                }
            }
            let params = {
                trialId: this.$route.query.trialId,
                channelIds: newAddCheckList.join(',')
            };
            this.reqAddNRURecord(params);
            this.$emit('emitClose');
        },
        // 增录NVR录像
        reqAddNRURecord(params) {
            this.addNRURecord(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.$emit('emitClose');
                }
            });
        },

        /* --------------------checkbox-group事件-开始-------------------- */
        // 点击全选按钮
        handleCheckAllChange(val) {
            this.ruleForm.addCheckList = val
                ? objArr2KeyArr(this.addCheckList, 'channelId')
                : []; // 将数组转为只含有指定属性的数组
            this.isIndeterminate = false;
        },

        // 点击复选框选项
        handleCheckedListChange(val) {
            this.checkAll = val.length === this.addCheckList.length;
            this.isIndeterminate =
                val.length > 0 && val.length < this.addCheckList.length;
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
            line-height: 3;
        }
    }
}
.check-box {
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
}
</style>

