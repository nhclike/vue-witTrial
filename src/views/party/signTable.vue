/* 签到查看页面
 * @Author: Nihc
 * @Date: 2020-11-16 14:27:44
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-16 13:09:41
 */

<template>
  <div class="signTable">
    <el-table
        :data="tableData"
        :height="tableHeight"
        element-loading-text="拼命加载中"
        row-class-name="signRow"
        style="width: 100%;border:none">
        <el-table-column
          prop="index"
          label="序号"
          align="center"
          width="120"
        >
        </el-table-column>
        <el-table-column
          prop="peopleRole"
          label="角色"
          align="center"
          >
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          align="center"
          >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="signTime"
          align="center"
          min-width="150"
          label="时间">
        </el-table-column>
        <el-table-column
          prop="signPic"
          align="center"
          label="照片">
          <template slot-scope="scope">
            <img :src="scope.row.signPic" width="110" height="80" style="margin:2px 0;" alt="">
          </template>
        </el-table-column>
      </el-table>
  </div>

</template>

<script>
import { mapActions } from 'vuex';

export default {
    props: {
        tableHeight: {
            type: String,
            default: ''
        },
        tableAction: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            tableData: []
        };
    },
    watch: {
        tableAction: {
            handler(newVal, oldVal) {
                let action = newVal.split('num')[0];
                if (action == 'refresh') {
                    this.getSignListData();
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        console.log('signTable mounted');
        this.getSignListData();

    },
    methods: {
        ...mapActions({
            querySignInList: 'moduleJudge/querySignInList'
        }),
        getSignListData() {
            let _this = this;
            this.querySignInList({trialId: this.$route.query.trialId}).then((res) => {
                if (res.code == 0) {
                    _this.tableData = _this.formatData(res.data);
                }
            });
        },
        formatData(data) {
            let size = data.length;
            for (let i = 0; i < data.length; i++) {
                data[i].signPic = this.formatUrl(data[i].signPic);
                data[i].index = size;
                size--;
            }
            return data;
        },
        // 格式化地址
        formatUrl(item) {
            let url = '';
            if (item && item !== '') {
                let itemUrl = item.replace(/\\/g, '/');
                url = `${__API__}/trial${itemUrl}`;
            } else {
                url = '/images/icon/icon-face.png';
            }
            return url;
        }

    }
};
</script>
<style scoped lang='less'>

</style>
