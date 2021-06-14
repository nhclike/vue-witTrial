/* 开庭播报
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:19:27
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2020-12-28 10:05:36
 */

<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p v-if="operateBtnName === 'view'" class="form-title">开庭播报</p>
            <i
                type="primary"
                class="el-icon-close form-top-icon"
                @click="$emit('emitClose')"
            ></i>
        </div>
        <div ref="formBody" class="form-body">
            <div ref="table" class="full-height">
                <div :style="tableStyle">
                    <el-table :data="tableData" stripe>
                        <el-table-column
                            type="index"
                            label="序号"
                            align="center"
                            width="150"
                            :formatter="commFilter.formatEmpty"
                        ></el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            prop="name"
                            label="文件名称"
                            align="center"
                            min-width="175"
                        ></el-table-column>
                        <!-- <el-table-column prop="time" label="播放进度" align="center">
                            <template slot-scope="scope">
                                <div class="progress-box">
                                    <div class="progress" :style="{width:scope.row.progress}"></div>
                                </div>
                            </template>
                        </el-table-column>-->
                        <el-table-column
                            prop
                            label="操作"
                            align="center"
                            width="100"
                        >
                            <template slot-scope="scope">
                                <audio
                                    v-show="false"
                                    :ref="`musicMp3${scope.row.id}`"
                                    :src="formatUrl(scope.row.url)"
                                    preload="auto"
                                    :controls="controls"
                                ></audio>
                                <div class="btn-box">
                                    <span
                                        v-if="!scope.row.isPlay"
                                        class="i-play"
                                        title="播放"
                                        @click="
                                            playOrPauseAudio(scope.row, true)
                                        "
                                    ></span>
                                    <span
                                        v-if="scope.row.isPlay"
                                        class="i-pause"
                                        title="暂停"
                                        @click="
                                            playOrPauseAudio(scope.row, false)
                                        "
                                    ></span>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div ref="pagination" class="tablePagination block"></div>
            </div>
        </div>
        <!-- <div class="form-bottom">
            <span class="shj-btn--primary shj-btn--medium" @click="$emit('emitClose')">关闭</span>
        </div>-->
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
export default {
    name: 'VoiceBroadcast',
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
            controls: {},
            url: 'video/0.mp3',
            /* 表格 */
            tableStyle: 'height:0px', // 表格样式 主要设置表格高度自适应
            // 行-数据
            tableData: [
                {
                    filePath: '',
                    id: 1,
                    name: 'download_help',
                    type: 'mp4',
                    url: '/file/video/download_help.mp4',
                    progress: '0%',
                    isPlay: false
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
        // this.init();
    },
    mounted() {
        this.initTable();
    },
    methods: {
        ...mapActions({
            queryCourtVideoList: 'moduleJudge/queryCourtVideoList'
        }),

        playOrPauseAudio(row, play) {
            row.isPlay = play;
            const musicMp3 = this.$refs[`musicMp3${row.id}`];
            if (play) {
                musicMp3.play();
                /* const timer = setInterval(() => {
                    const numbers = musicMp3.currentTime / musicMp3.duration;
                    let perNumber = (numbers * 100).toFixed(2);
                    if (perNumber >= 100) {
                        row.isPlay = false;
                        this.progress = 0;
                        clearInterval(timer);
                    }
                    if (!play) {
                        clearInterval(timer);
                    }
                    perNumber += '%';
                    row.progress = perNumber;
                }, 30); */
                for (let item of this.tableData.values()) {
                    if (item.id !== row.id) {
                        item.isPlay = false;
                        this.$refs[`musicMp3${item.id}`].pause();
                    }
                }
            } else {
                musicMp3.pause();
            }
        },

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
            this.queryCourtVideoList(params).then((res) => {
                // console.log('queryCourtVideoList', res);
                if (res.code === 0) {
                    this.tableData = res.data;
                    this.tablePaginationData.total = res.data.length;
                    this.tablePaginationData.pages = Math.ceil(
                        res.data.length / this.tablePaginationData.pageSize
                    );
                }
            });
        },

        // 页码-currentPage-change事件-表格数据重新渲染
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
            this.tablePaginationData.currentPage = val;
            this.queryList();
        },

        // 格式化列-地址
        formatUrl(url) {
            return `${__API__}/trial${url}`;
        }
        // --------------------表格-结束-------------------- */
    }
};
</script>

<style lang="less" scoped>
@import '@/assets/style/table/shj-el-table.less'; // 引入less定义变量
.alert-box .alert-box-body {
    width: 900px;
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
