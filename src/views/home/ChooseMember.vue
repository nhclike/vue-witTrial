/* 选择人员
 * @Author: nihc
 * @Date: 2020-09-24 14:57:16
 * @Last Modified by: nihc
 * @Last Modified time: 2020-10-17 17:15:49
 */
<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p v-if="operateBtnName==='view'" class="form-title">人员选择</p>
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
                <el-form-item label="选择人员" prop="addCheckList">
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
                            <el-col :span="8" v-for="check in addCheckList" :key="String(check.id)">
                                <el-checkbox :label="String(check.id)" >{{check.name}}</el-checkbox>
                            </el-col>
                        </el-row>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
        </div>
        <div class="form-bottom">
            <span class="shj-btn--confirm shj-btn--medium" @click="fnSureMember()">确定</span>
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
            viewRules: {}, // 查看模式下表单校验规则
            // 复选框列表-选择人员
            addCheckList: [
                // {
                //     id: '1',
                //     name: '原告/公诉人'
                // },
                // {
                //     id: '2',
                //     name: '原告代理'
                // },
                // {
                //     id: '3',
                //     name: '被告'
                // },
                // {
                //     id: '4',
                //     name: '被告代理'
                // },
                // {
                //     id: '5',
                //     name: '审判长'
                // },
                // {
                //     id: '6',
                //     name: '书记员'
                // },
                // {
                //     id: '7',
                //     name: '陪审员'
                // },
                // {
                //     id: '8',
                //     name: '审判员'
                // }
            ],
            /* checkbox-group */
            checkAll: true, // 全选状态
            // 校验表单
            ruleForm: {
                addCheckList: [] // 复选框选中值
            },
            isIndeterminate: false // 设置 indeterminate 状态，只负责样式控制
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
        ...mapActions('moduleJudge',['queryShareList']),
        init(){
            let _this=this;
            this.queryShareList({trialId:this.$route.query.trialId}).then((res)=>{
                console.log(res);
                if(res.code==0){
                    let data=res.data;
                    let roleList=[];
                    for(var i=0;i<data.length;i++){
                        roleList.push({
                            id:data[i].peopleType,
                            name:data[i].peopleType
                        })
                    }
                    _this.addCheckList=roleList;
                    //默认全选
                    _this.setChooseAll();
                }
            })

        },
        setChooseAll(){
            let allIds=[];
            for(var i=0;i<this.addCheckList.length;i++){
                allIds.push(this.addCheckList[i].id);
            }
            this.ruleForm.addCheckList=allIds;
            this.isIndeterminate = false;

        },

        fnSureMember(){
            console.log('this.ruleForm.addCheckList',this.ruleForm.addCheckList);
            if(this.ruleForm.addCheckList.length>0){
                this.$emit('emitChooseMemberList',this.ruleForm.addCheckList)

            }
            else{
                this.$message.error("请选择人员!");
            }
        },

        /* --------------------checkbox-group事件-开始-------------------- */
        // 点击全选按钮
        handleCheckAllChange(val) {
            this.ruleForm.addCheckList = val
                ? objArr2KeyArr(this.addCheckList, 'id')
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

