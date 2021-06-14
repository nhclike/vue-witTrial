/* 手动立案
 * @Author: ShiHuiJun
 * @Date: 2020-10-10 09:33:28
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-07 10:39:36
 */
<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p class="form-title">
                {{
                operateBtnName === 'add'
                ? '手动立案'
                : operateBtnName === 'edit'
                ? '编辑案件'
                : '查看案件'
                }}
            </p>
            <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
        </div>
        <div class="form-body">
            <el-form
                :model="ruleForm"
                label-position="right"
                label-width="1.5rem"
                status-icon
                :rules="operateBtnName !== 'view' ? rules : viewRules"
                ref="ruleForm"
            >
                <el-row v-if="operateBtnName === 'add'">
                    <el-col :span="18">
                        <el-form-item label="案件编号" prop="ahdm">
                            <el-input
                                v-model="ahdm"
                                placeholder="请输入案件编号"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <button
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            type="button"
                            :disabled="searchBtnDisabled"
                            @click="searchCaseByAhdm()"
                        >查询案件</button>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="18">
                        <el-form-item label="案号" prop="caseCode">
                            <el-input
                                v-model="ruleForm.caseCode"
                                placeholder
                                clearable
                                :disabled="String(ruleForm.editable) === '1'"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <button
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            type="button"
                            @click="addBurnCaseCode()"
                        >新增并案案号</button>
                    </el-col>
                </el-row>
                <el-form-item v-if="burnCaseCodeList.length > 0" label="并案案号">
                    <el-tag
                        class="myTag"
                        v-for="(tag, index) in burnCaseCodeList"
                        :key="index"
                        closable
                        :disable-transitions="false"
                        @close="handleCloseTag(tag)"
                    >{{ tag }}</el-tag>
                </el-form-item>
                <el-row>
                    <el-col :span="18">
                        <el-form-item label="案由" prop="caseCouse">
                            <el-select
                                class="remoteSelect"
                                v-if="ruleForm.caseCouseType === '0'"
                                v-model="ruleForm.caseCouse"
                                filterable
                                remote
                                placeholder="请输入案由进行查找..."
                                :remote-method="remoteSelectMethod"
                                :loading="remoteSelectLoading"
                                clearable
                            >
                                <el-option
                                    :title="item.value"
                                    v-for="item in remoteSelectOptions"
                                    :key="item.code"
                                    :label="item.value"
                                    :value="item.code"
                                ></el-option>
                            </el-select>
                            <el-input
                                v-if="ruleForm.caseCouseType === '1'"
                                v-model="ruleForm.caseCouse"
                                placeholder
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <button
                            v-if="ruleForm.caseCouseType === '0'"
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            type="button"
                            @click="
                                ruleForm.caseCouseType = '1';
                                ruleForm.caseCouse = '';
                                $refs.ruleForm.validateField('caseCouse');
                            "
                        >自定义案由</button>
                        <button
                            v-if="ruleForm.caseCouseType === '1'"
                            class="shj-btn--primary_workBench shj-btn--medium_workBench"
                            type="button"
                            @click="
                                ruleForm.caseCouseType = '0';
                                ruleForm.caseCouse = '';
                                $refs.ruleForm.validateField('caseCouse');
                                remoteSelectMethod('');
                            "
                        >查询案由</button>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="案件类型" prop="caseType">
                            <el-select
                                filterable
                                v-model="ruleForm.caseType"
                                placeholder
                                clearable
                                @change="handleSelectChange_caseType"
                            >
                                <el-option
                                    v-for="(item, index) in caseTypeList()"
                                    :key="index"
                                    :label="item.value"
                                    :value="item.key"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="立案时间" prop="createTime">
                            <el-date-picker
                                v-model="ruleForm.createTime"
                                placeholder
                                clearable
                                type="datetime"
                                format="yyyy-MM-dd HH:mm:ss"
                                value-format="yyyy-MM-dd HH:mm:ss"
                            ></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-form-item :label="plaintiffLabel" prop="plaintiff">
                        <el-col :span="10">
                            <el-select
                                filterable
                                v-model="plaintiff.code"
                                placeholder
                                @change="
                                    (val) => {
                                        handleSelectChange(val, 'plaintiff');
                                    }
                                "
                            >
                                <el-option
                                    v-for="(item, index) in plaintiffTypeList"
                                    :key="index"
                                    :label="item.value"
                                    :value="item.key"
                                ></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="1">&nbsp;</el-col>
                        <el-col :span="13">
                            <el-input v-model="plaintiff.name" placeholder clearable></el-input>
                        </el-col>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item :label="defendantLabel" prop="defendant">
                        <el-col :span="10">
                            <el-select
                                filterable
                                v-model="defendant.code"
                                placeholder
                                @change="
                                    (val) => {
                                        handleSelectChange(val, 'defendant');
                                    }
                                "
                            >
                                <el-option
                                    v-for="(item, index) in defendantTypeList"
                                    :key="index"
                                    :label="item.value"
                                    :value="item.key"
                                ></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="1">&nbsp;</el-col>
                        <el-col :span="13">
                            <el-input v-model="defendant.name" placeholder clearable></el-input>
                        </el-col>
                    </el-form-item>
                </el-row>
                <!-- don't delete-WITTRIAL-645 -->
                <!-- <el-row>
                    <el-form-item label="第三方">
                        <el-col :span="10">
                            <el-select
                                filterable
                                v-model="others.code"
                                placeholder=""
                                clearable
                                @change="
                                    (val) => {
                                        others.name = !val ? '' : others.name;
                                    }
                                "
                            >
                                <el-option
                                    v-for="(item, index) in othersTypeList"
                                    :key="index"
                                    :label="item.value"
                                    :value="item.key"
                                ></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="1">&nbsp;</el-col>
                        <el-col :span="13">
                            <el-input
                                v-model="others.name"
                                placeholder
                                clearable
                                :disabled="!others.code"
                            ></el-input>
                        </el-col>
                    </el-form-item>
                </el-row>-->
                <el-form-item label="案件描述" prop="caseDescr">
                    <el-input
                        type="textarea"
                        :rows="2"
                        placeholder="民事……"
                        v-model="ruleForm.caseDescr"
                    ></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div class="form-bottom">
            <span
                v-if="operateBtnName === 'add'"
                class="shj-btn--danger shj-btn--medium"
                @click="submitForm('trial')"
            >排期</span>
            <span class="shj-btn--confirm shj-btn--medium" @click="submitForm('save')">保存</span>
            <span class="shj-btn--info shj-btn--medium" @click="resetForm('ruleForm')">重置</span>
            <span class="shj-btn--primary_light shj-btn--medium" @click="$emit('emitClose')">取消</span>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
import { getArrDefValIdx, objArr2KeyArr, getByteLen } from '@/utils/utils';
export default {
    name: 'CaseOperate',
    components: { ShjListPage },
    inject: ['reload', 'userInfo', 'caseTypeList'],
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
            ahdm: '', // 案件编号
            searchBtnDisabled: false,
            burnCaseCodeList: [], // 并案案号
            plaintiffTypeList: [],
            defendantTypeList: [],
            othersTypeList: [],
            plaintiff: {
                code: '1',
                name: '',
                type: 'plaintiff_select',
                peopleId: ''
            },
            defendant: {
                code: '1',
                name: '',
                type: 'defendant_select',
                peopleId: ''
            },
            others: {
                code: '',
                name: '',
                type: 'others_select',
                peopleId: ''
            },
            /* select 远程搜索 */
            remoteSelectLoading: false,
            remoteSelectOptions: [],
            /* 表单 */
            rules: {
                caseCode: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.ruleForm.caseCode) {
                                callback(new Error(`案号不能为空！`));
                            } else if (this.burnCaseCodeList.indexOf(this.ruleForm.caseCode) > -1) {
                                callback(new Error(`该案号已加入并案案号！`));
                            } else if (getByteLen(value) > 100) {
                                callback(new Error(`案号长度不能超过50个中文字符`));
                            } else {
                                callback();
                            }
                        }
                    }
                ],
                caseCouse: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (this.ruleForm.caseCouseType === '0') {
                                if (!this.ruleForm.caseCouse) {
                                    callback(new Error(`请输入案由进行查找`));
                                } else {
                                    callback();
                                }
                            } else if (!this.ruleForm.caseCouse) {
                                callback(new Error(`请输入自定义案由`));
                            } else {
                                callback();
                            }
                        }
                    }
                ],
                caseType: [
                    {
                        required: true,
                        message: '案件类型不能为空',
                        trigger: ['blur', 'change']
                    }
                ],
                createTime: [
                    {
                        required: true,
                        message: '立案时间不能为空',
                        trigger: ['blur', 'change']
                    }
                ],
                plaintiff: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.plaintiff.name) {
                                callback(new Error(`请填写${this.plaintiffLabel}`));
                            } else {
                                callback();
                            }
                        }
                    }
                ],
                defendant: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.defendant.name) {
                                callback(new Error(`请填写${this.defendantLabel}`));
                            } else {
                                callback();
                            }
                        }
                    }
                ]
            },
            viewRules: {}, // 查看模式下表单校验规则
            // 校验表单
            ruleForm: {
                // ahdm: "130120190201000134",
                caseId: '',
                caseCode: '',
                caseCouse: '',
                caseCouseType: '0',
                caseType: '',
                createTime: '',
                caseDescr: '',
                trialCount: '',
                peopleDTOList: [
                    /* {
                        code: '1',
                        name: 'shj',
                        peopleId: 'a22723d7372d83630977b0119794a9ac',
                        type: 'people_type'
                    } */
                ],
                cognate: '0' // 是否并案
            }
        };
    },
    computed: {
        plaintiffLabel() {
            console.log('caseOperate---computed', 'plaintiffLabel');
            if (this.plaintiffTypeList.length > 0) {
                return this.plaintiffTypeList[
                    getArrDefValIdx(this.plaintiffTypeList, 'key', this.plaintiff.code)
                ].value;
            }
            return '原告';
        },
        defendantLabel() {
            console.log('caseOperate---computed', 'defendantLabel');
            if (this.defendantTypeList.length > 0) {
                return this.defendantTypeList[getArrDefValIdx(this.defendantTypeList, 'key', this.defendant.code)].value;
            }
            return '被告';
        }
    },
    watch: {
        /* 'plaintiff.code': {
            handler() {
                console.log('caseOperate---watch');
            },
            deep: true,
            immediate: true
        } */
    },
    created() {
        console.log('caseOperate---created');
    },
    async mounted() {
        console.log('caseOperate---mounted');
        this.plaintiffTypeList = await this.commFilter.queryDictValue({ type: 'plaintiff_select' });
        this.defendantTypeList = await this.commFilter.queryDictValue({ type: 'defendant_select' });
        this.othersTypeList = await this.commFilter.queryDictValue({ type: 'others_select' });
    },
    methods: {
        ...mapActions({
            detail: 'moduleCase/queryOneCase',
            add: 'moduleCase/insertCase',
            update: 'moduleCase/updateCase',
            queryCaseCouseByKeyword: 'queryCaseCouseByKeyword',
            getCaseInfo: 'moduleCase/queryCaseInfoByAhdm'
        }),

        // 初始化
        async init(id) {
            console.log('CaseOperate----init');
            this.ruleForm.caseId = id;
            this.reqDetail({ caseId: id });
        },

        // 详情
        reqDetail(params) {
            this.detail(params).then((res) => {
                if (res.code === 0) {
                    this.remoteSelectOptions = [
                        {
                            code: res.data.caseCouse,
                            value: res.data.caseCouseName
                        }
                    ];
                    this.ruleForm = res.data;
                    this.formatterPeopleDTOList();
                }
            });
        },

        // 新增
        reqAdd(params, action) {
            this.add(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    if (action === 'trial') {
                        let caseCodes = params.caseCode.split(',');
                        if (caseCodes.length > 1) {
                            this.$router.push({
                                path: '/main/judge/workbench/case/caseScheduling',
                                query: {
                                    formAction: '4',
                                    caseId: res.data[0].caseId,
                                    combinedCaseCodeList: res.data
                                }
                            });
                        } else {
                            this.$router.push({
                                path: '/main/judge/workbench/case/caseScheduling',
                                query: {
                                    formAction: '3',
                                    caseId: res.data[0].caseId
                                }
                            });
                        }
                    } else {
                        this.$emit('emitClose');
                    }
                }
            });
        },

        // 修改
        reqUpdate(params) {
            this.update(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    this.$emit('emitClose');
                }
            });
        },

        // 重置
        resetForm(formName) {
            // this.$refs[formName].resetFields();
            if (!this.ruleForm.caseId) {
                this[formName].caseCode = null;
            }
            this.burnCaseCodeList = [];
            this[formName].caseCouseType = '0';
            this[formName].caseCouse = null;
            this.remoteSelectOptions = [];
            this[formName].caseType = null;
            this[formName].createTime = null;
            this.plaintiff = {
                code: '1',
                name: '',
                type: 'plaintiff_select',
                peopleId: ''
            };
            this.defendant = {
                code: '1',
                name: '',
                type: 'defendant_select',
                peopleId: ''
            };
            this.others = {
                code: '',
                name: '',
                type: 'others_select',
                peopleId: ''
            };
            this[formName].caseDescr = null;
        },

        // 确定
        submitForm(action) {
            // console.log('ruleForm', this.ruleForm);
            this.$refs['ruleForm'].validate((valid) => {
                if (valid) {
                    let msg = '';
                    if (action === 'trial') {
                        msg = '新增案件后进行排期';
                    } else {
                        msg = this.operateBtnName === 'add' ? '新增' : '修改';
                    }
                    this.$confirm(`确定${msg}吗？`, '系統提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        showCancelButton: true,
                        customClass: 'confirm-success',
                        type: 'info'
                    })
                        .then(() => {
                            this.ruleForm.peopleDTOList = [];
                            // 原告
                            this.plaintiff.name = this.plaintiff.name.replace(/，/gi, ',');
                            this.ruleForm.peopleDTOList.push(this.plaintiff);
                            // 被告
                            this.defendant.name = this.defendant.name.replace(/，/gi, ',');
                            this.ruleForm.peopleDTOList.push(this.defendant);
                            // 第三方
                            if (this.others.code && this.others.name) {
                                this.others.name = this.others.name.replace(/，/gi, ',');
                                this.ruleForm.peopleDTOList.push(this.others);
                            }
                            let params = {
                                caseCode:
                                    this.burnCaseCodeList.length > 0
                                        ? `${this.burnCaseCodeList.join(',')},${this.ruleForm.caseCode}`
                                        : this.ruleForm.caseCode, // req-required
                                caseCouse: this.ruleForm.caseCouse, // req-required
                                caseCouseType: this.ruleForm.caseCouseType,
                                caseType: this.ruleForm.caseType, // req-required
                                createTime: this.ruleForm.createTime,
                                caseDescr: this.ruleForm.caseDescr,
                                trialCount: 0,
                                peopleDTOList: this.ruleForm.peopleDTOList, // req-required
                                cognate: this.ruleForm.cognate,
                                ahdm: this.ruleForm.ahdm
                            };
                            // console.log(params);
                            // return false;
                            if (this.operateBtnName !== 'add') {
                                params.caseId = this.ruleForm.caseId;
                                this.reqUpdate(params);
                            } else {
                                this.reqAdd(params, action);
                            }
                        })
                        .catch(() => {
                            // this.$message.info(`操作取消`);
                        });
                }
            });
        },

        // 案件类型下拉框选择事件
        handleSelectChange_caseType(val) {
            if (val === '1') {
                this.plaintiff.code = '2';
                this.defendant.code = '2';
            }
            if (val === '2') {
                this.plaintiff.code = '1';
                this.defendant.code = '1';
            }
        },

        // 原告、被告下拉框选择事件
        handleSelectChange(val, role) {
            this.plaintiff.code = val;
            this.defendant.code = val;
        },

        // 新增并案案号
        addBurnCaseCode() {
            if (!this.ruleForm.caseCode.trim()) {
                this.$message.error(`并案案号不能为空值！`);
                return false;
            }
            if (this.burnCaseCodeList.indexOf(this.ruleForm.caseCode) > -1) {
                this.$message.error(`该案号已加入并案案号！`);
            } else {
                this.burnCaseCodeList.push(this.ruleForm.caseCode);
                this.ruleForm.caseCode = '';
            }
            this.ruleForm.cognate = this.burnCaseCodeList.length > 0 ? '1' : '0';
        },

        // 删除并案案号
        handleCloseTag(tag) {
            this.burnCaseCodeList.splice(this.burnCaseCodeList.indexOf(tag), 1);
            this.ruleForm.cognate = this.burnCaseCodeList.length > 0 ? '1' : '0';
        },

        // 根据案件编号查询案件信息
        searchCaseByAhdm() {
            if(this.searchBtnDisabled) {
                this.$message.success(`正在查询，请稍等`);
                return;
            }
            if(this.ahdm.trim() === '') {
                this.$message.error(`请输入案件编号`);
                return;
            }
            this.searchBtnDisabled = true;
            this.getCaseInfo({ahdm: this.ahdm.trim()}).then(res => {
                if(res.code === 0) {
                    this.ruleForm = res.data
                    this.formatterPeopleDTOList();
                }
                this.searchBtnDisabled = false;
            })
        },

        // 格式化原告、被告等
        formatterPeopleDTOList() {
            let plaintiffArr = [];
            let defendantArr = [];
            let othersArr = [];
            for (let row of this.ruleForm.peopleDTOList.values()) {
                switch (row.type) {
                    case 'people_type': // 法院人员
                        break;
                    case 'plaintiff_select':
                        plaintiffArr.push(row);
                        break;
                    case 'defendant_select':
                        defendantArr.push(row);
                        break;
                    case 'others_select':
                        othersArr.push(row);
                        break;
                }
            }
            this.plaintiff = {
                code:
                    plaintiffArr.length > 0
                        ? plaintiffArr[0].code
                        : '1',
                name: objArr2KeyArr(plaintiffArr, 'name').join(','),
                type: 'plaintiff_select',
                peopleId: ''
            };
            this.defendant = {
                code:
                    defendantArr.length > 0
                        ? defendantArr[0].code
                        : '1',
                name: objArr2KeyArr(defendantArr, 'name').join(','),
                type: 'defendant_select',
                peopleId: ''
            };
            this.others = {
                code: othersArr.length > 0 ? othersArr[0].code : '',
                name: objArr2KeyArr(othersArr, 'name').join(','),
                type: 'others_select',
                peopleId: ''
            };
        },

        /* --------------------el-select 远程搜索-开始-------------------- */
        remoteSelectMethod(query) {
            if (query !== '') {
                this.remoteSelectLoading = true;
                this.queryCaseCouseByKeyword({ keyword: query }).then((res) => {
                    if (res.code === 0) {
                        this.remoteSelectLoading = false;
                        this.remoteSelectOptions = res.data;
                    }
                });
            } else {
                this.remoteSelectOptions = [];
            }
        }
        /* --------------------el-select 远程搜索-结束-------------------- */
    }
};
</script>

<style lang="less" scoped>
.alert-box {
    .alert-box-body {
        width: 50%;
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
.el-select-dropdown {
    width: 200px;
}
</style>
