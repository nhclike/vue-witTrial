/* 法官工作台左边电子卷宗和音影证据tree结构切换页面
 * @Author: nihc
 * @Date: 2020-09-03 17:48:39
 * @Last Modified by: nihc
 * @Last Modified time: 2020-12-30 10:40:46
 */
<template>
    <div class="tab-page" ref="tabPageBox">
        <a-tabs default-active-key="1" @change="callback">
            <a-tab-pane key="1">
                <span slot="tab" class="tab-title" ref="tabTitleBox">
                    电子卷宗
                </span>
                <div class="tab-box" :style="treeStyle">
                    <search-tree
                        v-if="ElectronicFileTreeShow"
                        :treeData="ElectronicFileTreeData"
                        :selectedKeys="selectedKeys"
                        @emitNodeSelect="emitNodeSelect"
                    ></search-tree>
                </div>
            </a-tab-pane>
            <a-tab-pane key="2">
                <span slot="tab" class="tab-title"> 影音证据 </span>
                <div class="tab-box" :style="treeStyle">
                    <search-tree
                        v-if="proofTreeShow"
                        :treeData="proofTreeData"
                        :selectedKeys="selectedKeys"
                        @emitNodeSelect="emitNodeSelect"
                    ></search-tree>
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
<script>
import SearchTree from '@/components/tree/searchTree';
import { mapActions } from 'vuex';
export default {
    components: {
        SearchTree
    },
    props: {
        treeAction: {
            type: String,
            default: ''
        },
        selectedKeys: {
            type: Array,
            default: () => [],
            required: false
        },
        ahdm: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            proofTreeData: [], // 影音证据数据
            ElectronicFileTreeData: [],
            treeStyle: {
                height: 0
            },
            typeCode: 1, // 区分电子卷宗和影音证据1电子卷宗2影音证据
            proofTreeShow: false,
            ElectronicFileTreeShow: false
        };
    },
    watch: {
        treeAction: {
            handler() {
                let _this = this;
                this.$nextTick(() => {
                    let action = _this.treeAction.split('num')[0];
                    if (action == 'updateProofTree') {
                        _this.proofTreeShow = false;
                        _this.getProofTreeData();
                        _this.proofTreeShow = true;
                    }
                });
            },
            deep: true,
            immediate: true
        },
        ahdm: { // 案件切换时切换电子卷宗
            handler(newVal, oldVal) {
                if (newVal) {
                    let _this = this;
                    this.$nextTick(() => {
                        _this.init();
                    });
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {

        console.log('TreeTab---mounted');
        this.init();
    },
    beforeDestroy() {
        console.log('TreeTab---beforeDestroy');
    },
    methods: {
        ...mapActions('moduleJudge', ['getDossier', 'getTrialFileTree']),
        init() {
            let treeHeight =
                this.$refs.tabPageBox.clientHeight -
                this.$refs.tabTitleBox.clientHeight -
                40;
            console.log(treeHeight + 'treeHeight');
            this.treeStyle = { height: treeHeight + 'px' };
            this.getElectronicFileTreeData();
        },
        resetTree() {
            this.ElectronicFileTreeShow = false;

            this.proofTreeShow = false;

            this.$nextTick(() => {
                this.init();
            });
        },
        callback(key) {
            // console.log(key);
            // 控制上传权限
            if (key == 2) {
                // 切换成影音证据
                this.typeCode = 2;
                if (this.comm.isTrialAuthorizeShow('trial:evidence:upload')) {
                    this.$emit('changeRightRouter');
                }
                this.proofTreeShow = false;
                this.getProofTreeData();

            } else {
                this.typeCode = 1;
            }
        },
        emitNodeSelect(item) {
            let params = {
                fileId: item.key,
                type: this.typeCode,
                fileType: item.slots.switcherIcon,
                url: item.url,
                readType: item.readType
            };
            this.$emit('emitNodeSelect', params);
        },
        getElectronicFileTreeData() {
            if (!this.ahdm) {
                return false;
            }
            let params = {
                ahdm: this.ahdm
            };
            let _this = this;
            this.getDossier(params).then((res) => {
                // console.log(res);
                if (res.code == 0) {
                    _this.ElectronicFileTreeData = res.data;
                    _this.$nextTick(() => {
                        _this.ElectronicFileTreeShow = true;
                    });
                }
            });
        },
        getProofTreeData() {
            let params = {
                trialId: this.$route.query.trialId
            };
            let _this = this;
            this.getTrialFileTree(params).then((res) => {
                if (res.code == 0) {
                    _this.proofTreeData = res.data;
                    _this.$nextTick(() => {
                        _this.proofTreeShow = true;
                    });
                }
            });
        }
    }
};
</script>
<style lang="less" scoped type="text/less">
.tab-page {
    height: 100%;
    .tab-title {
        //width:200px;
        display: inline-block;
    }
    /deep/.ant-tabs {
        height: 100%;
        .ant-tabs-bar {
            height: 60px;
        }
        .ant-tabs-top-content {
            height: calc(100% - 80px);
        }
    }
    .tab-box {
        height: 100%;
    }
}
/deep/.ant-tabs-nav .ant-tabs-tab {
    font-size: @font24px;
    margin: 0 40px 0 20px;
    padding: 12px;
}
</style>
