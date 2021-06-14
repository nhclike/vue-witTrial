<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">法庭设备配置</span>
                </div>
                <!-- 列表查询区 -->
                <div class="form-body inquire">
                    <div>
                        <el-form
                            :model="dataForm"
                            :label-position="'right'"
                            label-width="2.6rem"
                            status-icon
                            :rules="dataRule"
                            ref="dataForm"
                        >
                            <div class="form-group-title">法庭信息</div>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="法庭名称" prop="courtroomName">
                                        <el-input
                                            v-model="dataForm.courtroomName"
                                            placeholder="法庭名称"
                                            disabled
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="法庭类型" prop="courtroomType">
                                        <el-select v-model="dataForm.courtroomType" disabled>
                                            <el-option label="标准庭" value="1"></el-option>
                                            <el-option label="简易庭" value="0"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="校验码" prop="randomCode">
                                        <el-input
                                            v-model="dataForm.randomCode"
                                            placeholder="校验码"
                                            disabled
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <div class="form-group-title">视频主机(DVR)配置</div>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="名称" prop="deviceName">
                                        <el-input v-model="dataForm.deviceName" placeholder="名称"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="主机类型" prop="deviceType">
                                        <el-select v-model="dataForm.deviceType">
                                            <el-option label="世通主机" value="1"></el-option>
                                            <el-option label="大华主机" value="2"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="IP" prop="deviceIp">
                                        <el-input v-model="dataForm.deviceIp" placeholder="IP"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="端口号" prop="devicePort">
                                        <el-input
                                            v-model.number="dataForm.devicePort"
                                            type="number"
                                            min="1"
                                            placeholder="端口号"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="用户名" prop="deviceAdmin">
                                        <el-input v-model="dataForm.deviceAdmin" placeholder="用户名"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="密码" prop="devicePassword">
                                        <el-input
                                            v-model="dataForm.devicePassword"
                                            placeholder="密码"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <div class="form-group-title">视频录像、视频切换配置</div>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="录像通道号" prop="deviceChannel">
                                        <el-input
                                            v-model.number="dataForm.deviceChannel"
                                            type="number"
                                            min="1"
                                            placeholder="录像通道号"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="视频分段时间（秒）" prop="videoTime">
                                        <el-input
                                            v-model.number="dataForm.videoTime"
                                            type="number"
                                            min="1"
                                            placeholder="视频分段时间(秒)"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="视频切换输入配置" prop="orderNum">
                                        <a-button type="primary" @click="channelConfig('1')">输入配置</a-button>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="视频切换输出配置" prop="courtroomStatus">
                                        <a-button type="primary" @click="channelConfig('2')">输出配置</a-button>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <div class="form-group-title">增录配置</div>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="NVR录像设备ID" prop="nvrDeviceid">
                                        <el-input
                                            v-model="dataForm.nvrDeviceid"
                                            placeholder="增录NVR录像设备ID"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="增录通道配置" prop="courtroomStatus">
                                        <a-button type="primary" @click="channelConfig('0')">配置</a-button>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <div class="form-group-title">当事人端设备配置</div>
                            <el-row>
                                <el-col
                                    class="people-device"
                                    :span="12"
                                    v-for="(role,index) in roleList"
                                    :key="index"
                                >
                                    <div class="sub-title">
                                        {{role.value}}端
                                        <i
                                            class="el-icon-circle-plus"
                                            @click="addDevice(role.value.includes('原告') ? 'plaintiff' : 'defendant', role,role.row)"
                                        ></i>
                                    </div>
                                    <div class="device-list">
                                        <el-input
                                            v-for="(item, index) in (role.value.includes('原告') ? dataForm.plaintiff : dataForm.defendant)"
                                            :key="'YG'+index"
                                            v-model="item.cpuid"
                                            :placeholder="role.value"
                                        >
                                            <i
                                                slot="suffix"
                                                class="el-input__icon el-icon-delete"
                                                @click="deleteDevice(role.value.includes('原告') ? 'plaintiff' : 'defendant',index)"
                                            ></i>
                                        </el-input>
                                    </div>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </div>
                <div class="form-bottom">
                    <span class="shj-btn--confirm shj-btn--medium" @click="dataFormSubmit()">保存</span>
                    <span class="shj-btn--primary_light shj-btn--medium" @click="$router.go(-1)">返回</span>
                </div>
            </div>
        </div>
        <channel-management v-if="channelListVisible" ref="channelList"></channel-management>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import ChannelManagement from '@/views/judge/workBench/system/courtRoom/ChannelManagement';
export default {
    name: 'CourtRoomConfig',
    components: {
        ChannelManagement
    },
    data() {
        return {
            channelListVisible: false, // 是否显示操作弹窗
            roleList: [], // 角色列表
            dataForm: {
                id: 0,
                courtroomName: '',
                courtroomType: '',
                deviceName: '',
                deviceType: '1',
                deviceIp: '',
                devicePort: 8000,
                deviceAdmin: '',
                devicePassword: '',
                deviceChannel: null,
                videoTime: '',
                nvrDeviceid: '',
                randomCode: '',
                plaintiff: [
                    {
                        // 法庭当事人设备-原告
                        cpuid: '',
                        roleCode: '0',
                        roleName: '原告/公诉人'
                    }
                ],
                defendant: [
                    {
                        // 法庭当事人设备-被告
                        cpuid: '12345',
                        roleCode: '1',
                        roleName: '被告/辩护人'
                    },
                    {
                        cpuid: '12',
                        roleCode: '1',
                        roleName: '被告/辩护人'
                    }
                ]
            },
            dataRule: {
                deviceName: [{ required: true, message: '主机名称不能为空', trigger: 'blur' }],
                deviceType: [{ required: true, message: '主机类型不能为空', trigger: 'blur' }],
                deviceIp: [{ required: true, message: '主机IP不能为空', trigger: 'blur' }],
                devicePort: [{ required: true, message: '主机端口不能为空', trigger: 'blur' }],
                deviceAdmin: [{ required: true, message: '主机用户名不能为空', trigger: 'blur' }],
                devicePassword: [{ required: true, message: '主机密码不能为空', trigger: 'blur' }],
                deviceChannel: [{ required: true, message: '通道号不能为空', trigger: 'blur' }],
                videoTime: [{ required: true, message: '视频分段时间不能为空', trigger: 'blur' }],
                nvrDeviceid: [{ required: true, message: '增录设备ID不能为空', trigger: 'blur' }]
            }
        };
    },
    created() {
        //
    },
    async mounted() {
        this.roleList = await this.commFilter.queryDictValue({ type: 'pc_role' });
        this.init();
    },
    methods: {
        ...mapActions('moduleSystem', ['getCourtRoomDetail', 'addOrUpdateCourtRoom']),

        init() {
            const courtroomId = this.$route.query.courtroomId;
            if (courtroomId) {
                // 修改
                this.getCourtRoomDetail(courtroomId).then((res) => {
                    if (res.code === 0) {
                        this.dataForm = res.data;
                        this.dataForm.deviceType = res.data.deviceType ? res.data.deviceType : '1';
                        this.dataForm.devicePort = res.data.devicePort ? res.data.devicePort : 8000;
                    }
                });
            }
        },
        // 表单提交
        dataFormSubmit() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    let yg = this.dataForm.plaintiff.filter((item) => item.cpuid.trim() !== '');
                    let bg = this.dataForm.defendant.filter((item) => item.cpuid.trim() !== ''); // 原告 被告
                    let { plaintiff, defendant, ...params } = this.dataForm; // 删除字段
                    params.roomPcList = [...yg, ...bg];
                    this.addOrUpdate(params);
                }
            });
        },
        addOrUpdate(params) {
            let _this = this;
            _this.addOrUpdateCourtRoom(params).then((res) => {
                if (res.code === 0) {
                    _this.$message({
                        message: '操作成功',
                        type: 'success',
                        duration: 1000,
                        onClose: () => {
                            // 调用go(-1)出错
                        }
                    });
                    setTimeout(() => {
                        _this.$router.go(-1);
                    }, 1000);
                }
            });
        },
        // 通道配置
        channelConfig(flag) {
            // flag 通道区分:0=增录通道，1=输入通道，2=输出通道
            // deviceType 主机类型 '1'-世通主机 '2'-大华主机
            this.channelListVisible = true;
            this.$nextTick(() => {
                this.$refs.channelList.init(flag, this.dataForm.deviceType, this.dataForm.courtroomId);
            });
        },
        // 添加当事人端设备
        addDevice(type, role, row) {
            this.dataForm[type].push({
                cpuid: '',
                roleCode: role.key,
                roleName: role.value,
                roleId: row.id
            });
        },
        // 删除当事人端设备
        deleteDevice(type, index) {
            this.dataForm[type].splice(index, 1);
        }
    }
};
</script>

<style lang='less' scoped type="text/less">
.form-group-title {
    font-size: @font24px;
    line-height: 40px;
    border-bottom: 1px solid #ccc;
    margin: 0 15px 25px;
    font-weight: bolder;
}
.people-device {
    font-size: @font28px;
    padding: 0 40px;
    .sub-title {
        & > i {
            margin-left: 20px;
            color: #3874ff;
            cursor: pointer;
        }
    }
}
/deep/ .device-list .el-input {
    margin: 10px 0;
}
/deep/ .el-input__suffix {
    cursor: pointer;
    pointer-events: all;
}
</style>
