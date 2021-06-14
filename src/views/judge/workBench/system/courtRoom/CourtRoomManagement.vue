<template>
    <div class="listPage">
        <div class="shjListPage">
            <div ref="top" class="list-top">
                <!-- 列表标题区 -->
                <div class="table-top">
                    <span class="flag">&nbsp;</span>
                    <span class="title">法庭&设备管理</span>
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
                                        <el-input v-model="inquireForm.courtroomName" placeholder clearable
                                                  @input="queryList(true)"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </div>
                <div class="opt-box">
                    <div class="title">法庭列表</div>
                    <div class="opt-btns">
                        <button class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="refreshCourt()"
                        >
                            <i class="el-icon-refresh"></i>同步法庭
                        </button>
                        <button class="shj-btn--primary_workBench shj-btn--medium_workBench"
                                @click="addOrUpdateHandle()"
                        >
                            <i class="i-addCourt"></i>新增法庭
                        </button>
                    </div>
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
                        v-if="showTableSelection"
                        type="selection"
                        width="55"
                        align="center"
                        header-align="center"
                        :reserve-selection="true"
                    ></el-table-column>
                    <el-table-column
                        prop="courtroomName"
                        header-align="center"
                        align="center"
                        label="法庭名称">
                    </el-table-column>
                    <!--<el-table-column
                        prop="courtCode"
                        header-align="center"
                        align="center"
                        label="所属法院">
                    </el-table-column>-->
                    <el-table-column
                        prop="courtroomType"
                        header-align="center"
                        align="center"
                        label="法庭类型">
                        <template slot-scope="scope">
                            <span>{{String(scope.row.courtroomType) | courtroomTypeFilter}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="courtroomSize"
                        header-align="center"
                        align="center"
                        label="容纳人数">
                    </el-table-column>
                    <el-table-column
                        prop="courtroomStatus"
                        header-align="center"
                        align="center"
                        label="法庭状态">
                        <template slot-scope="scope">
                            <el-tag :type="String(scope.row.courtroomStatus) === '1' ? '' : 'danger'">
                                {{String(scope.row.courtroomStatus) | statusFilter}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="deviceName"
                        header-align="center"
                        align="center"
                        label="是否配置设备">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.deviceName" type="success" effect="dark">已配置</el-tag>
                            <el-tag v-else type="info" effect="dark">未配置</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="showTableOperate"
                        label="操作"
                        width
                        min-width="180"
                        align="center"
                        header-align="center"
                    >
                        <template slot-scope="scope">
                            <!-- 操作栏按钮 -->
                            <span
                                v-for="(item,index) in tableOperate"
                                :key="index"
                                v-if="showOperateBtn(scope.row,item,index)"
                                :id="item.id"
                                class="listButton"
                                :class="item.class"
                                @click="handleClickOperate(scope.row,item)"
                            >{{item.contentText}}</span>
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
                        v-if="tablePaginationData.layout.indexOf('->')>-1"
                    >
                        共
                        <i class="font-color-primary">{{tablePaginationData.pages}}</i>页
                        <i class="font-color-primary">{{tablePaginationData.total}}</i>条记录
                    </span>
                </el-pagination>
            </div>
        </div>
        <!-- 弹窗 新增 修改 -->
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="queryList"></add-or-update>
        <!-- 弹窗 语音识别配置 -->
        <config-speech v-if="configSpeechVisible" ref="configSpeech"></config-speech>
        <config-microphone v-if="configMicrophoneVisible" ref="configMicrophone"></config-microphone>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import AddOrUpdate from '@/views/judge/workBench/system/courtRoom/CourtRoomOperate';
import ConfigSpeech from '@/views/judge/workBench/system/courtRoom/SpeechRecognitionConfig';
import ConfigMicrophone from '@/views/judge/workBench/system/courtRoom/MicrophoneConfig';
import { debounce } from '@/utils/utils';
export default {
    name: 'CourtRoomManagement',
    components: {
        AddOrUpdate,
        ConfigSpeech,
        ConfigMicrophone
    },
    inject: ['reload'],
    props: {

    },
    data() {
        return {
            addOrUpdateVisible: false, // 是否显示操作弹窗
            configSpeechVisible: false, // 是否显示语音识别弹窗
            configMicrophoneVisible: false, // 是否显示话筒弹窗
            tableStyle: 'height:0px',
            /* 组件名称 */
            // 查询/过滤条件-用于v-model数据绑定
            inquireForm: {
                courtroomName: ''
            },
            /* 表格 */
            // 设置表格的row-key
            getRowKeys(row) {
                return row.courtroomId;
            },
            showTableSelection: false, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            // 行-数据
            tableData: [],
            // 列[操作-按钮]-数据
            tableOperate: [
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '配置设备', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'configDevice'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '配置语音识别', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'configSpeech'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '配置话筒', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'configMicrophone'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: '', // 样式名称
                    contentText: '编辑', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'edit'
                },
                {
                    id: '', // DOM节点id,用来确定样式或特殊操作
                    class: 'error', // 样式名称
                    contentText: '删除', // 按钮内容
                    module: 'moduleName', // 按钮所属模块
                    status: null, // 根据按钮状态绑定确定是否显示该按钮 当与状态绑定时，将active切换为false 同时在[showOperateBtn]中进行判断，返回true则显示该按钮
                    active: true, // 是否显示按钮
                    action: 'delete'
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
        //
    },
    mounted() {
        this.setTableStyle();
        this.init();
    },
    methods: {
        ...mapActions('moduleSystem', ['queryCourtRoomList', 'deleteCourtRoom', 'synchroRoom']),
        setTableStyle() {
            let topH = this.$refs.top.clientHeight;
            let bottomH = this.$refs.pagination.clientHeight;
            this.tableStyle = `height:calc(100% - ${topH + bottomH}px)`;
        },

        // 同步法庭接口
        reqSynchroRoom() {
            this.synchroRoom().then(res => {
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                }
            });
        },

        // 同步法庭
        refreshCourt() {
            this.reqSynchroRoom();
        },

        // 初始化
        init() {
            this.queryList();
        },

        // 查询-获取列表
        queryList: debounce(function(search) {
            this.tablePaginationData.currentPage = search
                ? 1
                : this.tablePaginationData.currentPage;
            // 请求接口-获取列表
            let params = {
                curPage: search ? '1' : String(this.tablePaginationData.currentPage),
                limit: String(this.tablePaginationData.pageSize),
                courtroomName: this.inquireForm.courtroomName
            };
            this.queryCourtRoomList(params).then((res) => {
                if (res.code === 0) {
                    this.tableData = res.data.list;
                    this.tablePaginationData.total = res.data.totalCount;
                    this.tablePaginationData.pages = res.data.totalPage;
                }
            });
        }, 500),

        // 控制操作栏按钮是否显示
        showOperateBtn(row, item, index) {
            return item.active;
        },

        // 列[选择]-change事件-选中的表格数据发生改变
        /* handleSelectionChange(val) {

        }, */

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

        // 列【操作】点击事件
        handleClickOperate(row, item, index) {
            if (item.action) {
                switch (item.action) {
                    case 'edit':
                        this.addOrUpdateHandle(row.courtroomId);
                        break;
                    case 'delete':
                        this.$confirm(`确定删除吗？`, '系統提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            showCancelButton: true,
                            customClass: 'confirm-success',
                            type: 'warning'
                        }).then(() => {
                            this.deleteHandle(row.courtroomId);
                        })
                            .catch(() => {
                                // this.$message.info('已取消删除');
                            });
                        break;
                    case 'configDevice': // 配置设备
                        this.configDeviceHandle(row.courtroomId);
                        break;
                    case 'configSpeech': // 配置语音识别
                        this.configSpeechHandle(row.courtroomId);
                        break;
                    case 'configMicrophone': // 配置话筒
                        this.configMicrophoneHandle(row.courtroomId);
                        break;
                    default:
                        console.log('error');
                        break;
                }
            }
        },
        // 新增 / 修改
        addOrUpdateHandle(id) {
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.addOrUpdate.init(id);
            });
        },
        // 删除
        deleteHandle(id) {
            this.deleteCourtRoom(id).then((res) => {
                if (res.code === 0) {
                    this.$message.success('删除成功');
                    this.queryList();
                } else {
                    this.$message.error(res.msg);
                }
            });
        },
        // 配置设备
        configDeviceHandle(id) {
            this.$router.push({
                path: '/main/judge/workbench/system/courtRoomConfig',
                query: {courtroomId: id}
            });
        },
        // 配置语音识别
        configSpeechHandle(id) {
            this.configSpeechVisible = true;
            this.$nextTick(() => {
                this.$refs.configSpeech.init(id);
            });
        },
        // 配置话筒
        configMicrophoneHandle(id) {
            this.configMicrophoneVisible = true;
            this.$nextTick(() => {
                this.$refs.configMicrophone.init(id);
            });
        }
    }
};
</script>

<style lang="less" scoped>
    @import '../../../../../assets/style/table/el-table.less';
</style>
