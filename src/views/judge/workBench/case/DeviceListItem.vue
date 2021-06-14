/* 设备选择弹窗
 * @Author: ShiHuiJun
 * @Date: 2020-11-17 10:19:27
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-15 15:14:04
 */

<template>
    <div class="deviceList alert-box-body">
        <div class="form-top">
            <p v-if="operateBtnName === 'view'" class="form-title">选择设备</p>
            <i
                type="primary"
                class="el-icon-close form-top-icon"
                @click="$emit('emitClose')"
            ></i>
        </div>
        <div ref="formBody" class="form-body">
            <div ref="table" class="full-height">
                <div :style="tableStyle">
                    <el-table
                        element-loading-text="拼命加载中"
                        :data="tableData"
                        ref="multipleTable"
                        @selection-change="handleSelectionChange"
                        :row-key="getRowKeys"
                        stripe
                    >
                        <el-table-column
                            v-if="showTableSelection"
                            type="selection"
                            width="75"
                            align="center"
                            header-align="center"
                            :reserve-selection="true"
                            :selectable="selectInit"
                        ></el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            prop="name"
                            label="设备名称"
                            align="center"
                            min-width="175"
                        ></el-table-column>
                        <el-table-column
                            prop="isOnline"
                            label="设备状态"
                            align="center"
                            width="150"
                            :formatter="commFilter.formatEmpty"
                        ></el-table-column>
                        <el-table-column
                            prop="number"
                            label="设备编号"
                            align="center"
                            width="150"
                            :formatter="commFilter.formatEmpty"
                        ></el-table-column>
                        <!--  <el-table-column
                            prop
                            label="操作"
                            align="center"
                            width="100"
                        >
                            <template slot-scope="scope">
                            </template>
                        </el-table-column> -->
                    </el-table>
                </div>
                <div ref="pagination" class="tablePagination block"></div>
            </div>
        </div>
        <div class="form-bottom">
            <span
                class="shj-btn--confirm shj-btn--medium"
                @click="$emit('emitSubmit', multipleSelection)"
                >确定</span
            >
            <span
                class="shj-btn--primary_light shj-btn--medium"
                @click="$emit('emitClose')"
                >关闭</span
            >
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
export default {
    name: 'DeviceListItem',
    components: { ShjListPage },
    inject: ['reload'],
    filters: {},
    props: {
        operateBtnName: {
            type: String,
            default: 'view',
            required: false
        },
        // 列[选择]-回显列表
        selection: {
            type: Array,
            default: () => [],
            required: false
        }
    },
    data() {
        return {
            /* 表格 */
            tableStyle: 'height:0px', // 表格样式 主要设置表格高度自适应
            validSelect: true, // 为false时分页selectionchange事件不赋值
            // 设置表格的row-key
            getRowKeys(row) {
                return row.number;
            },
            showTableSelection: true, // 是否显示-列[选择]
            showTableOperate: true, // 是否显示-列[操作]
            multipleSelection: [], // 列[选择]-选中列表
            // 行-数据
            tableData: [
                /* {
                    callState: null,
                    category: 'AE20',
                    clientVersion: '',
                    courtCode: '1300B00',
                    courtName: '浙江省高级人民法院',
                    description: null,
                    disabled: false,
                    extendTime: '2021-06-09 13:25:47',
                    firstBindTime: '2020-06-09 13:25:47',
                    isOnline: '不在线',
                    name: '高院会议室',
                    number: '22609717',
                    portExpireTime: '2021-06-09 13:25:47',
                    sn: '5A191116A940C0B7'
                } */
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
        // this.init();
    },
    mounted() {
        this.initTable();
    },
    methods: {
        ...mapActions({
            getCourtDevice: 'moduleXyDevice/getCourtDevice'
        }),

        // --------------------表格-开始-------------------- */

        // 初始化表格
        initTable() {
            this.setTableStyle();
            this.queryList();
        },

        // 设置表格高度自适应
        setTableStyle() {
            let tableH = this.$refs.table.clientHeight;
            let paginationH = this.$refs.pagination.clientHeight;
            this.tableStyle = `height:${
                tableH - paginationH
            }px;overflow-y:auto;`;
        },

        // 查询-获取列表
        queryList() {
            let queryParams = {
                // pageNum: this.tablePaginationData.currentPage,
                // pageSize: this.tablePaginationData.pageSize
            };
            // 请求接口-获取列表
            this.getListData(queryParams);
        },

        // 接口-获取列表
        getListData(params) {
            this.getCourtDevice(params).then((res) => {
                // console.log('getCourtDevice', res);
                if (res.code === 0) {
                    this.tableData = res.data;
                    this.resetNoPageSelection();
                }
            });
        },

        // 不分页-勾选回显
        resetNoPageSelection() {
            this.selection.forEach((selectRow) => {
                this.$refs.multipleTable.toggleRowSelection(selectRow, true);
            });
            this.validSelect = true;
        },


        // 是否可选 true-可勾选 false-不可勾选
        selectInit(row, index) {
            return !row.disabled;
        },

        // 页码-currentPage-change事件-表格数据重新渲染
        handleCurrentChange(val) {
            this.validSelect = false;
            this.tablePaginationData.currentPage = val;
            this.queryList();
        },

        // 列[选择]-change事件-选中的表格数据发生改变
        handleSelectionChange(val) {
            if (this.validSelect) {
                this.multipleSelection = val;
                console.log('multipleSelection', this.multipleSelection);
            }
        }
        // --------------------表格-结束-------------------- */
    }
};
</script>

<style lang="less" scoped>
@import '@/assets/style/table/shj-el-table.less'; // 引入less定义变量
.deviceList.alert-box-body {
    width: 1200px;
}
/deep/.form-body {
    height: 600px;
    /* el-table-theme 参数说明
    * @color 表格文字颜色
    * @color_thead 表头文字颜色
    * @bg_thead 表头背景颜色
    * @bg_td_striped 单元格斑马纹颜色
    * @border_bottom 底部分割线大小
    * @border_color_divider 单元格底部线颜色
    */
    .el-table-theme(
    @text_color_black_5,
    @text_color_black_5,
    #E5E5E5,
    #F6F6F6,
    0,
    @border_color_divider
  );
    .el-table-size(@font28px, 80px, 80px);
}
.progress-box {
    background: @color_primary_light;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    .progress {
        height: 100%;
        background: @color_primary;
    }
}
</style>
