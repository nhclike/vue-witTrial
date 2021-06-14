/*打点列表弹框
 * @Author: nihc
 * @Date: 2020-09-21 16:59:59
 * @Last Modified by: nihc
 * @Last Modified time: 2020-09-25 17:21:19
 */

<template>
    <div class="alert-box-body">
        <div class="form-top">
            <p class="form-title">打点列表</p>
            <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
        </div>
        <div class="form-body">
            <div ref="table" class="full-height">
                <div :style="tableStyle">
                    <el-table
                        :data="listData"
                        style="width: 100%"
                        :height="tableHeight"
                        v-if="showTable"
                        >
                        <el-table-column
                            prop="descr"
                            align="center"
                            label="打点描述"
                            width="300"
                            >
                            <template slot-scope="scope">
                                {{scope.row.descr.substring(0,10)}}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="createTime"
                            align="center"
                            label="打点时间"
                            width="320"
                            >
                        </el-table-column>
                        <el-table-column label="操作"
                            align="center"
                            width="180"
                        >
                            <template slot-scope="scope">
                                <a-button
                                type="danger"
                                @click="handleDelete(scope.$index, scope.row)">删除</a-button >
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import {getParameter} from '@/utils/utils';

export default {
    name: 'DotList',
    inject: ['reload'],
    filters: {},
    props: {

    },
    data() {
        return {
            /* 表格 */
            tableStyle: 'height:0px', // 表格样式 主要设置表格高度自适应
            tableHeight: '200',
            showTable: false,
            listData: [
                {
                    'id': 1,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                },
                {
                    'id': 2,
                    'trialId': '12',
                    'createTime': '2020-09-07 13:20:14',
                    'recordFile': '222',
                    'timeStamp': '123',
                    'descr': '123435345'
                }
            ]
        };
    },
    computed: {},
    watch: {},
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions('moduleJudge', ['findListDot', 'deleteDot']),

        // 初始化
        init() {
            this.setTableStyle();

            let params = {
                trialId: this.$route.query.trialId
            };
            let _this = this;
            // 获取打点列表数据
            this.findListDot(params).then((res) => {
                if (res.code == 0) {
                    console.log('获取打点列表数据', res.data);
                    _this.listData = res.data;
                }
            });
        },
        handleDelete(index, row) {
            this.deleteDot({id: row.id}).then(res => {
                this.$message.success('删除成功');
                this.init();
            });

        },
        // 设置表格高度自适应
        setTableStyle() {
            let tableH = this.$refs.table.clientHeight;
            this.tableStyle = `height:${
                tableH
            }px;overflow-y:auto;`;
            this.tableHeight = tableH;
            this.showTable = true;
        }
    }
};
</script>

<style lang="less" scoped>
.alert-box {
    border-radius: @border_radius_middle;
    .alert-box-body {
        width: auto;
    }
}
@import '../../assets/style/table/shj-el-table.less'; // 引入less定义变量
.table-box{
    height: 600px;
    width: 100%;
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
</style>

<style lang="less">
</style>

