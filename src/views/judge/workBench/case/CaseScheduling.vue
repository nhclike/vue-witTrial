/* 排期
 * @Author: ShiHuiJun
 * @Date: 2020-09-07 10:00:20
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-06 16:04:39
 */

<template>
    <div class="listPage" @click="showMyTree = ''">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">
                        {{
                        ['1'].indexOf($route.query.formAction) > -1
                        ? '手动排期'
                        : '案件排期'
                        }}
                    </span>
                    <i
                        class="vertical-middle-right font-color-primary"
                        @click="$router.go(-1)"
                    >返回上一页</i>
                </div>
                <!-- 列表查询区 -->
                <div class="form-body inquire">
                    <div>
                        <el-form
                            :model="ruleForm"
                            :label-position="'right'"
                            label-width="2rem"
                            status-icon
                            :rules="rules"
                            ref="ruleForm"
                        >
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item label="案号" prop="caseCode">
                                        <el-autocomplete
                                            v-if="
                                                ['1', '3', '5'].indexOf(
                                                    $route.query.formAction
                                                ) > -1
                                            "
                                            v-model="caseCode"
                                            :fetch-suggestions="
                                                querySearchAsync
                                            "
                                            placeholder="请输入案号进行查找..."
                                            @select="handleAutocompleteSelect"
                                            @blur="handleAutocompleteBlur"
                                            :disabled="
                                                ['3', '5'].indexOf(
                                                    $route.query.formAction
                                                ) > -1
                                            "
                                            clearable
                                        ></el-autocomplete>
                                        <el-select v-else filterable v-model="caseCode" placeholder>
                                            <el-option
                                                v-for="(item, index) in $route
                                                    .query.combinedCaseCodeList"
                                                :key="index"
                                                :label="item.caseCode"
                                                :value="item.caseCode"
                                                @click.native="
                                                    changeCaseCode(item)
                                                "
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item label="案件类型">
                                        <el-select
                                            v-model="ruleForm.caseType"
                                            placeholder
                                            clearable
                                            disabled
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
                                <el-col :span="10">
                                    <el-form-item label="案由" prop="caseCouse">
                                        <el-input
                                            v-if="
                                                ruleForm.caseCouseType === '1'
                                            "
                                            v-model="ruleForm.caseCouse"
                                            placeholder
                                            clearable
                                            disabled
                                        ></el-input>
                                        <el-input
                                            v-else
                                            v-model="ruleForm.caseCouseName"
                                            placeholder
                                            clearable
                                            disabled
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item label="庭审次数">
                                        <el-input
                                            v-model="ruleForm.trialCount"
                                            placeholder
                                            clearable
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item :label="plaintiffLabel" prop="plaintiff">
                                        <el-col :span="10">
                                            <el-select
                                                filterable
                                                v-model="plaintiff.code"
                                                placeholder
                                                clearable
                                                disabled
                                                @change="
                                                    (val) => {
                                                        handleSelectChange(
                                                            val,
                                                            'plaintiff'
                                                        );
                                                    }
                                                "
                                            >
                                                <el-option
                                                    v-for="(item,
                                                    index) in plaintiffTypeList"
                                                    :key="index"
                                                    :label="item.value"
                                                    :value="item.key"
                                                ></el-option>
                                            </el-select>
                                        </el-col>
                                        <el-col :span="1">&nbsp;</el-col>
                                        <el-col :span="13">
                                            <el-input
                                                v-model="plaintiff.name"
                                                placeholder
                                                clearable
                                                disabled
                                            ></el-input>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item :label="defendantLabel" prop="defendant">
                                        <el-col :span="10">
                                            <el-select
                                                filterable
                                                v-model="defendant.code"
                                                placeholder
                                                clearable
                                                disabled
                                                @change="
                                                    (val) => {
                                                        handleSelectChange(
                                                            val,
                                                            'defendant'
                                                        );
                                                    }
                                                "
                                            >
                                                <el-option
                                                    v-for="(item,
                                                    index) in defendantTypeList"
                                                    :key="index"
                                                    :label="item.value"
                                                    :value="item.key"
                                                ></el-option>
                                            </el-select>
                                        </el-col>
                                        <el-col :span="1">&nbsp;</el-col>
                                        <el-col :span="13">
                                            <el-input
                                                v-model="defendant.name"
                                                placeholder
                                                clearable
                                                disabled
                                            ></el-input>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <!-- don't delete-WITTRIAL-645 -->
                            <!-- <el-row>
                                <el-col :span="10">
                                    <el-form-item label="第三方">
                                        <el-col :span="10">
                                            <el-select
                                                filterable
                                                v-model="others.code"
                                                placeholder=""
                                                clearable
                                                disabled
                                                @change="
                                                    (val) => {
                                                        others.name = !val
                                                            ? ''
                                                            : others.name;
                                                    }
                                                "
                                            >
                                                <el-option
                                                    v-for="(item,
                                                    index) in othersTypeList"
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
                                                disabled
                                            ></el-input>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                            </el-row>-->
                            <el-row>
                                <el-col :span="24">
                                    <el-form-item label="案件描述" prop="caseDescr">
                                        <el-input
                                            type="textarea"
                                            :rows="2"
                                            placeholder
                                            v-model="ruleForm.caseDescr"
                                            disabled
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item label="庭审法庭" prop="courtroomId">
                                        <el-select
                                            ref="courtroomId"
                                            filterable
                                            v-model="ruleForm.courtroomId"
                                            placeholder
                                            clearable
                                            @change="handleCourtroomChange"
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
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item label="开庭事项" prop="trialNotice">
                                        <el-input
                                            v-model="ruleForm.trialNotice"
                                            placeholder
                                            clearable
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item label="承办部门" prop="deptNo">
                                        <el-select
                                            filterable
                                            v-model="ruleForm.deptNo"
                                            placeholder
                                            clearable
                                            @change="(val)=>handleSelectChange_Dept(val,false,[])"
                                        >
                                            <el-option
                                                v-for="(item,
                                                index) in deptList"
                                                :key="index"
                                                :label="item.name"
                                                :value="item.id"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item label="审判长" prop="undertaker">
                                        <div class="pos-r">
                                            <el-input
                                                v-model="undertaker.name"
                                                placeholder
                                                clearable
                                                @click.native.stop="
                                                    initTree(
                                                        'undertaker',
                                                        false,
                                                        false
                                                    )
                                                "
                                            ></el-input>
                                            <div
                                                class="myTree"
                                                v-if="
                                                    showMyTree === 'undertaker'
                                                "
                                            >
                                                <el-tree
                                                    ref="undertakerTree"
                                                    class="filter-tree"
                                                    :data="
                                                        userGroupTreeData_enable
                                                    "
                                                    :props="treeProps"
                                                    accordion
                                                    @node-click="
                                                        (data) =>
                                                            handleNodeClick(
                                                                data,
                                                                'undertaker',
                                                                false
                                                            )
                                                    "
                                                    :filter-node-method="
                                                        filterNode
                                                    "
                                                ></el-tree>
                                            </div>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item label="书记员" prop="clerk">
                                        <div class="pos-r">
                                            <el-input
                                                v-model="clerk.name"
                                                placeholder
                                                clearable
                                                @click.native.stop="
                                                    initTree('clerk',false, false)
                                                "
                                            ></el-input>
                                            <div class="myTree" v-if="showMyTree === 'clerk'">
                                                <el-tree
                                                    ref="clerkTree"
                                                    class="filter-tree"
                                                    :data="
                                                        userGroupTreeData_enable
                                                    "
                                                    :props="treeProps"
                                                    accordion
                                                    @node-click="
                                                        (data) =>
                                                            handleNodeClick(
                                                                data,
                                                                'clerk',
                                                                false
                                                            )
                                                    "
                                                    :filter-node-method="
                                                        filterNode
                                                    "
                                                ></el-tree>
                                            </div>
                                        </div>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item label="陪审员">
                                        <div class="pos-r">
                                            <el-input
                                                v-if="
                                                    showMyTree !== 'collegial'
                                                "
                                                v-model="collegialNames"
                                                placeholder
                                                @click.native.stop="
                                                    initTree('collegial', true, false)
                                                "
                                            ></el-input>
                                            <el-input
                                                v-if="
                                                    showMyTree === 'collegial'
                                                "
                                                v-model="collegialNames_filter"
                                                placeholder
                                                clearable
                                                @click.native.stop
                                            ></el-input>
                                            <div
                                                class="myTree"
                                                v-if="
                                                    showMyTree === 'collegial'
                                                "
                                            >
                                                <el-tree
                                                    ref="collegialTree"
                                                    class="filter-tree"
                                                    :data="userGroupTreeData_enable"
                                                    :props="treeProps"
                                                    accordion
                                                    show-checkbox
                                                    node-key="id"
                                                    @check="(data,checked)=>handleCheckClick(data,checked,'collegial',false)"
                                                    :filter-node-method="
                                                        filterNode
                                                    "
                                                ></el-tree>
                                            </div>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item label="审判员" prop="judge">
                                        <div class="pos-r">
                                            <el-input
                                                v-if="showMyTree !== 'judge'"
                                                v-model="judgeNames"
                                                placeholder
                                                @click.native.stop="
                                                    initTree('judge', true, false)
                                                "
                                            ></el-input>
                                            <el-input
                                                v-if="showMyTree === 'judge'"
                                                v-model="judgeNames_filter"
                                                placeholder
                                                clearable
                                                @click.native.stop
                                            ></el-input>
                                            <div class="myTree" v-if="showMyTree === 'judge'">
                                                <el-tree
                                                    ref="judgeTree"
                                                    class="filter-tree"
                                                    :data="userGroupTreeData_enable"
                                                    :props="treeProps"
                                                    accordion
                                                    show-checkbox
                                                    node-key="id"
                                                    @check="(data,checked)=>handleCheckClick(data,checked,'judge',false)"
                                                    :filter-node-method="
                                                        filterNode
                                                    "
                                                ></el-tree>
                                            </div>
                                        </div>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item label="主审人" prop="mainJudge">
                                        <div class="pos-r">
                                            <el-input
                                                v-model="mainJudge.name"
                                                placeholder
                                                clearable
                                                @click.native.stop="
                                                    initTree('mainJudge', false, false)
                                                "
                                            ></el-input>
                                            <div class="myTree" v-if="showMyTree === 'mainJudge'">
                                                <el-tree
                                                    ref="mainJudgeTree"
                                                    class="filter-tree"
                                                    :data="
                                                        userGroupTreeData_enable
                                                    "
                                                    :props="treeProps"
                                                    accordion
                                                    @node-click="
                                                        (data) =>
                                                            handleNodeClick(
                                                                data,
                                                                'mainJudge',
                                                                false
                                                            )
                                                    "
                                                    :filter-node-method="
                                                        filterNode
                                                    "
                                                ></el-tree>
                                            </div>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item label="开庭时间" prop="planBeginDate">
                                        <!-- <el-date-picker
                                            v-model="ruleForm.planBeginDate"
                                            placeholder=""
                                            clearable
                                            type="date"
                                            format="yyyy-MM-dd"
                                            value-format="yyyy-MM-dd"
                                        >
                                        </el-date-picker>-->
                                        <el-date-picker
                                            v-model="ruleForm.planBeginDate"
                                            placeholder
                                            clearable
                                            type="datetime"
                                            format="yyyy-MM-dd HH:mm:ss"
                                            value-format="yyyy-MM-dd HH:mm:ss"
                                            @change="handleDataPickerChange"
                                        ></el-date-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="10">
                                    <el-form-item label="公开庭审" prop="isPublic">
                                        <el-radio-group v-model="ruleForm.isPublic">
                                            <el-radio :label="'0'">是</el-radio>
                                            <el-radio :label="'1'">否</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="10">
                                    <el-form-item label="远程庭审" prop="remoteVideo">
                                        <el-radio-group v-model="ruleForm.remoteVideo">
                                            <el-radio
                                                :label="'1'"
                                                @click.native="
                                                    showAlertBoxDeviceListItem = true
                                                "
                                            >是</el-radio>
                                            <el-radio :label="'0'">否</el-radio>
                                        </el-radio-group>
                                        <div v-if="ruleForm.remoteVideo === '1'">
                                            <el-tag
                                                class="myTag"
                                                v-for="(tag,
                                                index) in ruleForm.trialDeviceList"
                                                :key="index"
                                                closable
                                                :disable-transitions="false"
                                                @close="
                                                    handleCloseTag(tag, index)
                                                "
                                            >{{ tag.name }}</el-tag>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </div>
                <div class="form-bottom">
                    <span
                        v-if="
                            isShowGoTrial(
                                undertaker,
                                clerk,
                                judgeArr,
                                collegialArr
                            )
                        "
                        class="shj-btn--danger shj-btn--medium"
                        @click="submitForm('trial')"
                    >进入庭审</span>
                    <span class="shj-btn--confirm shj-btn--medium" @click="submitForm('save')">保存</span>
                    <span class="shj-btn--primary_light shj-btn--medium" @click="$router.go(-1)">返回</span>
                </div>
            </div>
        </div>
        <!-- 弹窗-设备列表-->
        <div class="alert-box" v-if="showAlertBoxDeviceListItem">
            <device-list-item
                :operateBtnName="operateBtnName"
                :selection="ruleForm.trialDeviceList"
                @emitClose="showAlertBoxDeviceListItem = false"
                @emitSubmit="emitSubmit"
            ></device-list-item>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import DeviceListItem from '@/views/judge/workBench/case/DeviceListItem';
import { getArrDefValIdx, objArr2KeyArr } from '@/utils/utils';
export default {
    name: 'caseScheduling',
    components: { DeviceListItem },
    inject: ['reload', 'userInfo', 'caseTypeList'],
    filters: {},
    props: {},
    data() {
        return {
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
            // 审判长
            undertaker: {
                code: '1',
                name: '',
                type: 'people_type',
                peopleId: ''
            },
            // 书记员
            clerk: {
                code: '2',
                name: '',
                type: 'people_type',
                peopleId: ''
            },
            // 主审人
            mainJudge: {
                code: '1',
                name: '',
                type: 'people_type_zsr',
                peopleId: ''
            },
            // 审判员
            judgeArr: [
                /* {
                    children: [],
                    id: '临时部门',
                    label: '临时部门'
                },
                {
                    id: '1c6c5583bbc91c0652a4c344ae1b0cd7',
                    label: '李雪斌'
                } */
            ],
            judgeNames_filter: '',
            judgeNames: '',
            /* judge: {
                code: '3',
                name: '',
                type: 'people_type',
                peopleId: ''
            }, */
            collegialArr: [
                /* {
                    children: [],
                    id: '临时部门',
                    label: '临时部门'
                },
                {
                    id: '1c6c5583bbc91c0652a4c344ae1b0cd7',
                    label: '李雪斌'
                } */
            ],
            // 陪审员
            collegialNames_filter: '',
            collegialNames: '',
            /* collegial: {
                code: '4',
                name: '',
                type: 'people_type',
                peopleId: ''
            }, */
            deptList: [], // 部门下拉列表
            courtList: [
                /*  {
                    courtroomId: '1',
                    courtroomName: '第一法庭'
                } */
            ], // 法庭下拉列表
            showMyTree: '',
            treeProps: {
                children: 'children',
                label: 'label'
            },
            userGroupTreeData_enable: [],
            userGroupTreeData: [
                /* {
                    id: '1',
                    label: '部门名称',
                    children: [{
                        id: '4',
                        label: '用户名'
                    }]
                },
                {
                    id: '2',
                    label: '部门名称',
                    children: [{
                        id: '4',
                        label: '用户名'
                    }]
                } */
            ],
            /* autocomplete 远程搜索 */
            caseCode: null,
            timeout: null,
            /* 表单 */
            // 表单验证
            rules: {
                caseCode: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.caseCode) {
                                // this.$refs.ruleForm.resetFields();
                                this.resetForm();
                                callback(new Error(`请输入案号进行查询`));
                            } else if (!this.ruleForm.caseCode) {
                                callback(new Error(`请选择案号`));
                            } else {
                                callback();
                            }
                        }
                    }
                ],
                caseCouse: [
                    {
                        required: true,
                        message: '案由不能为空',
                        trigger: ['blur', 'change']
                    }
                ],
                plaintiff: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.plaintiff.code || !this.plaintiff.name) {
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
                            if (!this.defendant.code || !this.defendant.name) {
                                callback(new Error(`请填写${this.defendantLabel}`));
                            } else {
                                callback();
                            }
                        }
                    }
                ],
                courtroomId: [
                    {
                        required: true,
                        message: '请选择庭审法庭',
                        trigger: ['blur', 'change']
                    }
                ],
                deptNo: [
                    {
                        required: true,
                        message: '请选择承办部门',
                        trigger: ['blur', 'change']
                    }
                ],
                undertaker: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.undertaker.name) {
                                this.undertaker.peopleId = '';
                                callback(new Error(`请选择审判长`));
                            } else if (!this.undertaker.peopleId) {
                                callback(new Error(`请选择审判长`));
                            } else {
                                callback();
                            }
                        }
                    }
                ],
                clerk: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.clerk.name) {
                                this.clerk.peopleId = '';
                                callback(new Error(`请选择书记员`));
                            } else if (!this.clerk.peopleId) {
                                callback(new Error(`请选择书记员`));
                            } else {
                                callback();
                            }
                        }
                    }
                ],
                /* mainJudge: [
                    {
                        required: true,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (!this.mainJudge.name) {
                                this.mainJudge.peopleId = '';
                                callback(new Error(`请选择主审人`));
                            } else if (!this.mainJudge.peopleId) {
                                callback(new Error(`请选择主审人`));
                            } else {
                                callback();
                            }
                        }
                    }
                ], */
                planBeginDate: [
                    {
                        required: true,
                        message: '请选择开庭时间',
                        trigger: ['blur', 'change']
                    }
                ],
                remoteVideo: [
                    {
                        required: false,
                        trigger: ['blur', 'change'],
                        validator: (rule, value, callback) => {
                            if (String(this.ruleForm.remoteVideo) === '1' && this.ruleForm.trialDeviceList.length < 1) {
                                callback(new Error(`请选择远程设备`));
                            } else {
                                callback();
                            }
                        }
                    }
                ]
            },
            // 查询/过滤条件-用于v-model数据绑定
            ruleForm: {
                caseCode: '', // 案号
                caseCouse: '',
                caseCouseName: '',
                caseCouseType: '',
                caseDescr: '',
                caseType: '', // 案件类型
                trialCount: null,
                peopleDTOList: [],
                courtroomId: this.$route.query.courtroomId, // 法庭
                courtroomName: '',
                deptNo: '',
                planBeginDate: '', // 计划开庭时间
                trialNotice: '', // 开庭事项
                remoteVideo: '0',
                isPublic: '0',
                trialDeviceList: []
            },
            /* 弹窗 */
            operateBtnName: 'view', // 父传子>表单当前操作模式-add|edit|view
            showAlertBoxDeviceListItem: false // 是否显示-弹窗-设备列表
        };
    },
    computed: {
        plaintiffLabel() {
            console.log('caseOperate---computed', 'plaintiffLabel');
            if (this.plaintiffTypeList.length > 0) {
                return this.plaintiffTypeList[getArrDefValIdx(this.plaintiffTypeList, 'key', this.plaintiff.code)]
                    .value;
            }
            return '原告';
        },
        defendantLabel() {
            console.log('caseOperate---computed', 'defendantLabel');
            if (this.defendantTypeList.length > 0) {
                return this.defendantTypeList[getArrDefValIdx(this.defendantTypeList, 'key', this.defendant.code)]
                    .value;
            }
            return '被告';
        },
        isShowGoTrial() {
            return (undertaker, clerk, judgeArr, collegialArr) => {
                let judgeIdx = getArrDefValIdx(this.judgeArr, 'id', this.userInfo().id);
                let collegialIdx = getArrDefValIdx(this.collegialArr, 'id', this.userInfo().id);
                if (
                    undertaker.peopleId === this.userInfo().id ||
                    clerk.peopleId === this.userInfo().id ||
                    judgeIdx > -1 ||
                    collegialIdx > -1
                ) {
                    return true;
                }
                return false;
            };
        }
    },
    watch: {
        'undertaker.name'(val) {
            if (this.showMyTree === 'undertaker') {
                this.$refs.undertakerTree.filter(val);
            }
        },
        'clerk.name'(val) {
            if (this.showMyTree === 'clerk') {
                this.$refs.clerkTree.filter(val);
            }
        },
        'mainJudge.name'(val) {
            if (this.showMyTree === 'mainJudge') {
                this.$refs.mainJudgeTree.filter(val);
            }
        },
        judgeNames_filter(val) {
            if (this.showMyTree === 'judge') {
                this.$refs.judgeTree.filter(val);
            }
        },
        collegialNames_filter(val) {
            if (this.showMyTree === 'collegial') {
                this.$refs.collegialTree.filter(val);
            }
        }
    },
    created() {
        //
    },
    async mounted() {
        this.plaintiffTypeList = await this.commFilter.queryDictValue({ type: 'plaintiff_select' });
        this.defendantTypeList = await this.commFilter.queryDictValue({ type: 'defendant_select' });
        this.othersTypeList = await this.commFilter.queryDictValue({ type: 'others_select' });
        await this.reqQueryCourtroom();
        await this.reqGetDeptListNormal({});
        // 书记员默认自己
        this.clerk = {
            code: '2',
            name: this.userInfo().name,
            type: 'people_type',
            peopleId: this.userInfo().id
        };
        this.init();
    },
    methods: {
        ...mapActions({
            queryCourtroom: 'moduleCase/queryCourtroom',
            queryCaseByKeyword: 'moduleCase/queryCaseByKeyword',
            add: 'moduleCase/insertTrial',
            update: 'moduleCase/updateTrial',
            detail: 'moduleCase/queryOneCase', // 查询单个案件信息
            getUserGroupByDept: 'moduleSystem/getUserGroupByDept', // 分部门查询用户
            getDeptListNormal: 'moduleSystem/getDeptListNormal',
            queryTrialById: 'moduleCase/queryTrialById', // 查询单个排期信息,编辑排期调用
            queryTrialInfoById: 'moduleCase/queryTrialInfoById',
            isExistTrial: 'moduleCase/isExistTrial'
        }),

        // 查询法庭
        async reqQueryCourtroom() {
            await this.queryCourtroom().then((res) => {
                if (res.code === 0) {
                    this.courtList = res.data;
                }
                return res;
            });
        },

        // 部门列表
        async reqGetDeptListNormal(params) {
            await this.getDeptListNormal(params).then((res) => {
                if (res.code === 0) {
                    this.deptList = res.data;
                }
                return res;
            });
        },

        // 初始化
        init() {
            console.log('init');
            if (this.$route.query.courtroomId) {
                // 庭审管理-案件排期
                this.ruleForm.courtroomId = this.$route.query.courtroomId;
            }
            // this.$route.query.formAction '1'-手动排期 '2'-排期不同combinedCase并案 '3'-caseScheduling单个案件排期 '4'-caseScheduling并案排期 '5'-editTrial编辑排期 '6'-editCombinedTrial编辑并案排期
            if (['2', '3', '4'].indexOf(this.$route.query.formAction) > -1) {
                // 案件管理-案件排期
                this.reqDetail({ caseId: this.$route.query.caseId });
            }
            if (['5'].indexOf(this.$route.query.formAction) > -1) {
                this.reqQueryTrialById({
                    trialId: this.$route.query.trialId
                });
            }
            if (['6'].indexOf(this.$route.query.formAction) > -1) {
                this.reqQueryTrialInfoById({
                    trialId: this.$route.query.trialId
                });
            }
        },

        /**
         * 进入庭审
         * 以下后台校验，前端暂不做校验
         * 1-checkCrState法庭空闲中，可以 进入
         * 2-saveCaseTimeAdd保存排期
         * 3-selectOneForTrial排期上报
         * 4-IsContainSPYRole未选择审判员，该案件审判员无法看到，是否进入庭审？进入庭审 返回修改
         * 5-IsSPZRole是否是审判长角色
         * 6-角色选择 审判长页面 书记员页面
         */

        // 新增
        reqAdd(params, action) {
            this.add(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    if (action === 'trial') {
                        // 进入庭审
                        this.$router.push({
                            path: '/home/topicReader',
                            query: {
                                trialId: this.$route.query.trialId ? this.$route.query.trialId : res.data,
                                fromWorkBench: true
                            }
                        });
                    } else {
                        this.$router.push({
                            path: '/main/judge/workbench/case'
                        });
                    }
                }
            });
        },

        // 修改
        reqUpdate(params, action) {
            this.update(params).then((res) => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    if (action === 'trial') {
                        // 进入庭审
                        this.$router.push({
                            path: '/home/topicReader',
                            query: {
                                trialId: this.$route.query.trialId,
                                fromWorkBench: true
                            }
                        });
                    } else {
                        this.$router.push({
                            path: '/main/judge/workbench/case'
                        });
                    }
                }
            });
        },

        // 详情
        reqDetail(params) {
            this.detail(params).then((res) => {
                if (res.code === 0) {
                    this.ruleForm.caseCode = res.data.caseCode;
                    this.caseCode = this.ruleForm.caseCode;
                    this.ruleForm.caseCouse = res.data.caseCouse;
                    this.ruleForm.caseCouseName = res.data.caseCouseName;
                    this.ruleForm.caseCouseType = res.data.caseCouseType;
                    this.ruleForm.caseDescr = res.data.caseDescr;
                    this.ruleForm.caseType = res.data.caseType;
                    this.ruleForm.trialCount = res.data.trialCount;
                    this.ruleForm.isPublic = res.data.isPublic;
                    if (this.$route.query.formAction === '2') {
                        this.ruleForm.trialCount = Number(this.ruleForm.trialCount) - 1;
                    }
                    this.formatPeople_Case(res.data.peopleDTOList);
                }
            });
        },

        // 查询单个排期信息
        reqQueryTrialById(params) {
            this.queryTrialById(params).then((res) => {
                if (res.code === 0) {
                    this.ruleForm = res.data;
                    this.ruleForm.trialDeviceList = res.data.trialDeviceList || [];
                    this.caseCode = this.ruleForm.caseCode;
                    this.formatPeople(res.data.peopleDTOList);
                }
            });
        },

        // 用于并案编辑时查询排期信息
        reqQueryTrialInfoById(params) {
            this.queryTrialInfoById(params).then((res) => {
                if (res.code === 0) {
                    // res.data.remoteVideo = '0';
                    this.ruleForm = res.data;
                    this.ruleForm.trialDeviceList = res.data.trialDeviceList || [];
                    this.caseCode = this.ruleForm.caseCode;
                    this.formatPeople(res.data.peopleDTOList);
                }
            });
        },

        // 用于新增和编辑排期时，判断选中时间段是否有案件
        reqIsExistTrial(params) {
            this.isExistTrial(params).then((res) => {
                if (res.data.code === 0) {
                    console.log('当前排期无冲突');
                } else {
                    this.$confirm(`当前时间段该法庭已经有庭审排期，请确认是否进行排期`, '系統提示', {
                        confirmButtonText: '继续排期',
                        cancelButtonText: '取消',
                        showCancelButton: true,
                        customClass: 'confirm-success',
                        type: 'warning'
                    })
                        .then(() => {
                            this.$refs.courtroomId.blur();
                        })
                        .catch(() => {
                            this.ruleForm.planBeginDate = null;
                        });
                }
            });
        },

        // 重置表单
        resetForm() {
            this.ruleForm.caseCode = ''; // 案号
            this.ruleForm.caseCouse = ''; // 案由
            this.ruleForm.caseCouseName = ''; // 案由名称
            this.ruleForm.caseCouseType = ''; // 案由类型
            this.ruleForm.caseDescr = ''; // 案件描述
            this.ruleForm.caseType = ''; // 案件类型
            this.ruleForm.trialCount = null; // 庭审次数
            this.ruleForm.isPublic = '0'; // 庭审次数
            // this.ruleForm.peopleDTOList = [];// 人员列表
            // this.ruleForm.courtroomId = this.$route.query.courtroomId;// 庭审法庭
            // this.ruleForm.deptNo = '';// 承办部门
            // this.ruleForm.planBeginDate = '';// 计划开庭时间
            // this.ruleForm.trialNotice = '';// 开庭事项
            this.ruleForm.remoteVideo = '0'; // 远程庭审
            this.ruleForm.trialDeviceList = []; // 远程庭审设备
            this.formatPeople_resetCase(this.ruleForm.peopleDTOList);
        },

        /**
         * @method submitForm 提交表单
         * @param {String} action 提交表单后进行的操作
         */
        submitForm(action) {
            // console.log('ruleForm', this.ruleForm);
            this.$refs['ruleForm'].validate((valid) => {
                if (valid) {
                    let msg = '';
                    if (action === 'trial') {
                        msg = '排期后进入庭审页面';
                    } else {
                        msg = this.$route.query.trialId ? '修改' : '新增';
                    }
                    this.$confirm(`确定${msg}吗？`, '系統提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        showCancelButton: true,
                        customClass: 'confirm-success',
                        type: 'info'
                    })
                        .then(() => {
                            // 人员列表
                            this.ruleForm.peopleDTOList = [];
                            // 原告
                            this.plaintiff.name = this.plaintiff.name.replace(/，/gi, ',');
                            this.ruleForm.peopleDTOList.push(this.plaintiff);
                            // 被告
                            this.ruleForm.peopleDTOList.push(this.defendant);
                            this.defendant.name = this.defendant.name.replace(/，/gi, ',');
                            // 第三方
                            if (this.others.code && this.others.name) {
                                this.others.name = this.others.name.replace(/，/gi, ',');
                                this.ruleForm.peopleDTOList.push(this.others);
                            }
                            // 审判长
                            this.ruleForm.peopleDTOList.push(this.undertaker);
                            // 书记员
                            this.ruleForm.peopleDTOList.push(this.clerk);
                            // 主审人
                            if (this.mainJudge.name && this.mainJudge.peopleId) {
                                this.ruleForm.peopleDTOList.push(this.mainJudge);
                            }
                            // 审判员
                            if (this.judgeArr.length > 0) {
                                let arr = this.formatNode2People(this.judgeArr, '3');
                                arr.forEach((people) => {
                                    this.ruleForm.peopleDTOList.push(people);
                                });
                            }
                            // 陪审员
                            if (this.collegialArr.length > 0) {
                                let arr = this.formatNode2People(this.collegialArr, '4');
                                arr.forEach((people) => {
                                    this.ruleForm.peopleDTOList.push(people);
                                });
                            }
                            // 法庭名称
                            this.ruleForm.courtroomName = this.courtList[
                                getArrDefValIdx(this.courtList, 'courtroomId', this.ruleForm.courtroomId)
                            ].courtroomName;
                            // 传参
                            let params = {
                                caseCode: this.ruleForm.caseCode,
                                caseCouse: this.ruleForm.caseCouse,
                                caseCouseType: this.ruleForm.caseCouseType,
                                caseDescr: this.ruleForm.caseDescr,
                                caseType: this.ruleForm.caseType,
                                trialCount: this.ruleForm.trialCount || 0,
                                peopleDTOList: this.ruleForm.peopleDTOList,
                                courtroomId: this.ruleForm.courtroomId,
                                courtroomName: this.ruleForm.courtroomName,
                                deptNo: this.ruleForm.deptNo,
                                planBeginDate: this.ruleForm.planBeginDate,
                                trialNotice: this.ruleForm.trialNotice,
                                cognate: ['2', '4', '6'].indexOf(this.$route.query.formAction) > -1 ? '1' : '0',
                                remoteVideo: this.ruleForm.remoteVideo,
                                isPublic: this.ruleForm.isPublic,
                                trialDeviceList: []
                            };
                            if (this.ruleForm.remoteVideo === '1') {
                                if (['5', '6'].indexOf(this.$route.query.formAction) > -1) {
                                    for (let row of this.ruleForm.trialDeviceList.values()) {
                                        params.trialDeviceList.push({
                                            trialId: this.$route.query.trialId,
                                            number: row.number
                                        });
                                    }
                                } else {
                                    for (let row of this.ruleForm.trialDeviceList.values()) {
                                        params.trialDeviceList.push({
                                            number: row.number
                                        });
                                    }
                                }
                            }

                            // console.log('params', params);

                            switch (this.$route.query.formAction) {
                                case '1': // 案件管理-手动排期
                                    this.reqAdd(params, action);
                                    break;
                                case '2': // 案件管理-排期不同combinedCase并案
                                    params.caseCode = objArr2KeyArr(
                                        this.$route.query.combinedCaseCodeList,
                                        'caseCode'
                                    ).join(',');
                                    params.trialId = this.$route.query.trialIds.join(',');
                                    this.reqAdd(params, action);
                                    break;
                                case '3': // 案件管理-caseScheduling单个案件排期
                                    this.reqAdd(params, action);
                                    break;
                                case '4': // 案件管理-caseScheduling并案案件排期
                                    params.caseCode = objArr2KeyArr(
                                        this.$route.query.combinedCaseCodeList,
                                        'caseCode'
                                    ).join(',');
                                    this.reqAdd(params, action);
                                    break;
                                case '5': // 案件管理-editTrial
                                    params.trialId = this.$route.query.trialId;
                                    this.reqUpdate(params, action);
                                    break;
                                case '6': // 案件管理-editCombinedTrial编辑并案排期
                                    params.trialId = this.$route.query.trialId;
                                    params.cognateCode = this.ruleForm.cognateCode;
                                    this.reqUpdate(params, action);
                                    break;
                            }
                        })
                        .catch(() => {
                            // this.$message.info(`操作取消`);
                        });
                }
            });
        },

        // 切换并案案件
        changeCaseCode(item) {
            // console.log('changeCaseCode');
            if (['2', '4'].indexOf(this.$route.query.formAction) > -1) {
                this.reqDetail({ caseId: item.caseId });
            }
            if (['6'].indexOf(this.$route.query.formAction) > -1) {
                this.reqQueryTrialInfoById({ trialId: item.trialId });
            }
        },

        // 原告、被告下拉框选择事件
        handleSelectChange(val, role) {
            if (this.ruleForm.caseType && this.ruleForm.caseType === '1') {
                val = '1';
            }
            this.plaintiff.code = val;
            this.defendant.code = val;
        },

        // 审判长、书记员下拉列表根据部门过滤
        filterUserGroup() {
            if (this.ruleForm.deptNo) {
                let idx = getArrDefValIdx(this.userGroupTreeData, 'id', this.ruleForm.deptNo);
                this.userGroupTreeData_enable = idx > -1 ? [this.userGroupTreeData[idx]] : [];
            } else {
                this.userGroupTreeData_enable = this.userGroupTreeData;
            }
        },

        // 部门下拉框选择事件
        handleSelectChange_Dept(val, validDept, validPeopleTypeArr) {
            if (validDept) {
                this.filterUserGroup();
                // console.log(this.userInfo());
                if (validPeopleTypeArr.includes('undertaker')) {
                    this.undertaker = {
                        code: '1',
                        name: '',
                        type: 'people_type',
                        peopleId: ''
                    };
                }

                if (validPeopleTypeArr.includes('clerk')) {
                    if (!this.clerk.peopleId) {
                        if (val === this.userInfo().deptId) {
                            this.clerk = {
                                code: '2',
                                name: this.userInfo().name,
                                type: 'people_type',
                                peopleId: this.userInfo().id
                            };
                        }
                    } else {
                        if (this.clerk.peopleId === this.userInfo().id) {
                            if (val !== this.userInfo().deptId) {
                                this.clerk = {
                                    code: '2',
                                    name: '',
                                    type: 'people_type',
                                    peopleId: ''
                                };
                            }
                        } else {
                            this.clerk = {
                                code: '2',
                                name: '',
                                type: 'people_type',
                                peopleId: ''
                            };
                        }
                    }
                }

                if (validPeopleTypeArr.includes('mainJudge')) {
                    this.mainJudge = {
                        code: '1',
                        name: '',
                        type: 'people_type_zsr',
                        peopleId: ''
                    };
                }

                if (validPeopleTypeArr.includes('judge')) {
                    this.judgeArr = [];
                    this.formatNode2PeopleName(this.judgeArr, 'judge');
                }

                if (validPeopleTypeArr.includes('collegial')) {
                    this.collegialArr = [];
                    this.formatNode2PeopleName(this.collegialArr, 'collegial');
                }
            }
        },

        // 法庭下拉框选择事件
        handleCourtroomChange(courtroomId) {
            if (this.ruleForm.planBeginDate) {
                this.reqIsExistTrial({
                    courtroomId: courtroomId,
                    planBeginTime: this.ruleForm.planBeginDate
                });
            }
        },

        // 开庭时间下拉框选择事件
        handleDataPickerChange(dateTime) {
            if (this.ruleForm.courtroomId) {
                this.reqIsExistTrial({
                    courtroomId: this.ruleForm.courtroomId,
                    planBeginTime: dateTime
                });
            }
        },

        // 获取排期信息后-将接口中的人员列表转为表单需要的格式
        // eslint-disable-next-line complexity
        formatPeople(peopleDTOList) {
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
            // 审判长
            this.undertaker = {
                code: '1',
                name: '',
                type: 'people_type',
                peopleId: ''
            };
            // 书记员
            this.clerk = {
                code: '2',
                name: this.userInfo().name,
                type: 'people_type',
                peopleId: this.userInfo().id
            };
            // 主审人
            this.mainJudge = {
                code: '1',
                name: '',
                type: 'people_type_zsr',
                peopleId: ''
            };
            // 审判员
            this.judgeArr = [];
            // 陪审员
            this.collegialArr = [];
            if (peopleDTOList && peopleDTOList.length > 0) {
                let plaintiffArr = [];
                let defendantArr = [];
                let othersArr = [];
                for (let row of peopleDTOList.values()) {
                    switch (row.type) {
                        case 'people_type': // 法院人员
                            switch (row.code) {
                                case '1':
                                    this.undertaker = row;
                                    break;
                                case '2':
                                    this.clerk = row;
                                    break;
                                case '3':
                                    this.judgeArr.push({
                                        id: row.peopleId,
                                        label: row.name
                                    });
                                    break;
                                case '4':
                                    this.collegialArr.push({
                                        id: row.peopleId,
                                        label: row.name
                                    });
                                    break;
                            }
                            break;
                        case 'people_type_zsr':
                            switch (row.code) {
                                case '1':
                                    this.mainJudge = row;
                                    break;
                            }
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
                    code: plaintiffArr.length > 0 ? (this.ruleForm.caseType === '1' ? '2' : plaintiffArr[0].code) : '1',
                    name: objArr2KeyArr(plaintiffArr, 'name').join(','),
                    type: 'plaintiff_select',
                    peopleId: ''
                };
                this.defendant = {
                    code: defendantArr.length > 0 ? (this.ruleForm.caseType === '1' ? '2' : defendantArr[0].code) : '1',
                    name: objArr2KeyArr(defendantArr, 'name').join(','),
                    type: 'defendant_select',
                    peopleId: ''
                };
                this.others = {
                    code: othersArr.length > 0 ? (this.ruleForm.caseType === '1' ? '2' : othersArr[0].code) : '',
                    name: objArr2KeyArr(othersArr, 'name').join(','),
                    type: 'others_select',
                    peopleId: ''
                };
            }
            this.formatNode2PeopleName(this.judgeArr, 'judge');
            this.formatNode2PeopleName(this.collegialArr, 'collegial');
        },

        // 重置表单时-将接口中的人员列表转为表单需要的格式
        formatPeople_resetCase(peopleDTOList) {
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
        },

        // 切换并案案号时-将接口中的人员列表转为表单需要的格式
        formatPeople_Case(peopleDTOList) {
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
            if (peopleDTOList && peopleDTOList.length > 0) {
                let plaintiffArr = [];
                let defendantArr = [];
                let othersArr = [];
                for (let row of peopleDTOList.values()) {
                    switch (row.type) {
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
                    code: plaintiffArr.length > 0 ? plaintiffArr[0].code : '1',
                    name: objArr2KeyArr(plaintiffArr, 'name').join(','),
                    type: 'plaintiff_select',
                    peopleId: ''
                };
                this.defendant = {
                    code: defendantArr.length > 0 ? defendantArr[0].code : '1',
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
            }
        },

        // 将树组件中选中的选项转为指定的人员格式
        formatNode2People(arr, code) {
            let newArr = [];
            for (let row of arr.values()) {
                if (!row.children) {
                    let people = {
                        code: code,
                        name: row.label,
                        type: 'people_type',
                        peopleId: row.id
                    };
                    newArr.push(people);
                }
            }
            return newArr;
        },

        // 将树组件中选中的人员转为以逗号分隔的人员名称
        formatNode2PeopleName(arr, people) {
            let newArr = [];
            for (let row of arr.values()) {
                if (!row.children) {
                    newArr.push(row.label);
                }
            }
            this[`${people}Names`] = newArr.join(',');
        },

        // 确定选择设备
        emitSubmit(multipleSelection) {
            this.ruleForm.trialDeviceList = multipleSelection;
            this.showAlertBoxDeviceListItem = false;
            this.$refs['ruleForm'].validateField('remoteVideo');
        },

        // 删除设备
        handleCloseTag(tag, index) {
            this.ruleForm.trialDeviceList.splice(index, 1);
            this.$refs['ruleForm'].validateField('remoteVideo');
        },

        /* --------------------el-autocomplete 远程搜索-开始-------------------- */
        querySearchAsync(queryString, cb) {
            let list = [];
            this.queryCaseByKeyword({ caseCode: queryString }).then((res) => {
                if (res.code === 0) {
                    for (let i of res.data) {
                        i.value = i.caseCode;
                    }
                    list = res.data;
                    let results = queryString ? list.filter(this.createItemFilter(queryString)) : list;

                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        cb(results);
                    }, 3000 * Math.random());
                }
            });
        },

        createItemFilter(queryString) {
            return (item) => {
                return item.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1;
            };
        },

        handleAutocompleteSelect(item) {
            // console.log('handleAutocompleteSelect', item);
            if (String(item.cognate) === '1') {
                this.$confirm(`并案案件无法进行手动排期，请先解除并案或者在并案案件列表中点击案件排期。`, '系統提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    showCancelButton: false,
                    customClass: 'confirm-success',
                    type: 'warning'
                })
                    .then(() => {
                        this.caseCode = '';
                        this.ruleForm.caseCode = '';
                    })
                    .catch(() => {
                        this.caseCode = '';
                        this.ruleForm.caseCode = '';
                        // this.$message.info('操作取消');
                    });
            } else {
                this.ruleForm.caseCode = item.caseCode;
                this.caseCode = this.ruleForm.caseCode;
                this.ruleForm.caseCouse = item.caseCouse;
                this.ruleForm.caseCouseName = item.caseCouseName;
                this.ruleForm.caseCouseType = item.caseCouseType;
                this.ruleForm.caseDescr = item.caseDescr;
                this.ruleForm.caseType = item.caseType;
                this.ruleForm.trialCount = item.trialCount;
                // this.ruleForm = item;
                if (this.$route.query.courtroomId) {
                    this.ruleForm.courtroomId = this.$route.query.courtroomId;
                }
                this.formatPeople_Case(item.peopleDTOList);
            }
        },

        handleAutocompleteBlur() {
            if (this.ruleForm.caseCode !== this.caseCode) {
                this.resetForm();
            }
        },

        /* --------------------el-autocomplete 远程搜索-结束-------------------- */

        /* --------------------el-tree -开始-------------------- */
        initTree(people, showCheckbox, validDept) {
            let params = {};
            switch (people) {
                case 'undertaker': // 审判长
                    params = {
                        roleCode: 'presidingJudge'
                    };
                    break;
                case 'clerk': // 书记员
                    params = {
                        roleCode: 'recorder'
                    };
                    break;
                case 'mainJudge': // 主审人
                    params = {
                        roleCode: 'mainJudge'
                    };
                    break;
                case 'collegial': // 陪审员
                    params = {
                        roleCode: 'juror'
                    };
                    break;
                case 'judge': // 审判员
                    params = {
                        roleCode: 'judge'
                    };
                    break;
            }
            this.showMyTree = people;
            this.userGroupTreeData = [];
            this.userGroupTreeData_enable = [];
            this.getUserGroupByDept(params).then((res) => {
                if (res.code === 0) {
                    this.userGroupTreeData = res.data;
                    this.userGroupTreeData_enable = this.userGroupTreeData;
                    if (validDept) {
                        this.filterUserGroup();
                    }
                    if (showCheckbox) {
                        this.$nextTick(() => {
                            // console.log('setCheckedNodes', this.$refs[`${people}Tree`]);
                            this.$refs[`${people}Tree`].setCheckedNodes(this[`${people}Arr`]);
                            this[`${people}Names_filter`] = '';
                        });
                    }
                }
            });
        },

        filterChange(val, people) {
            if (this.showMyTree === people) {
                this.$refs[`${people}Tree`].filter(val);
            }
        },

        filterNode(value, data) {
            if (!value) {
                return true;
            }
            return data.label.indexOf(value) !== -1;
        },

        handleNodeClick(data, people, validDept) {
            // console.log('NodeClick', data);
            if (!this.ruleForm.deptNo && validDept) {
                this.$message.error(`请先选择承办部门`);
                return false;
            }
            if (!data.children) {
                this[people].peopleId = data.id;
                this[people].name = data.label;
                this.showMyTree = '';
            }
        },

        handleCheckClick(data, checkObj, people, validDept) {
            // console.log('handleCheckClick', data, checkObj);
            if (!this.ruleForm.deptNo && validDept) {
                this.$message.error(`请先选择承办部门`);
                this.$refs[`${people}Tree`].setCheckedNodes([]);
                return false;
            }
            // console.log('getCheckedNodes', this.$refs[`${people}Tree`].getCheckedNodes());
            this[`${people}Arr`] = this.$refs[`${people}Tree`].getCheckedNodes();
            this.formatNode2PeopleName(this[`${people}Arr`], people);
            this.showMyTree = people;
        },

        handleCheckChange(data, checked, indeterminate, people) {
            // console.log('handleCheckChange', data, checked, indeterminate, people);
            // console.log('getCheckedNodes', this.$refs[`${people}Tree`].getCheckedNodes());
            this[`${people}Arr`] = this.$refs[`${people}Tree`].getCheckedNodes();
            this.formatNode2PeopleName(this[`${people}Arr`], people);
            this.showMyTree = people;
        }
        /* --------------------el-tree -结束-------------------- */
    }
};
</script>

<style lang="less" scoped>
@import '@/assets/style/table/el-table.less';
.schedule-item {
    button {
        width: 200px;
        line-height: 40px;
        margin-right: 20px;
        margin-bottom: 20px;
    }
}
.myTree {
    z-index: 1999;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 300px;
    overflow: auto;
    padding: 10px;
    background: @text_color_white;
    border: 1px solid @border_color_form;
    /deep/.el-tree {
        .el-tree-node__content {
            line-height: @form_item_h;
            height: @form_item_h;
        }
        .el-tree-node__expand-icon {
            font-size: @font24px;
        }
        .el-tree-node__label {
            font-size: @font28px;
        }
    }
}
</style>
