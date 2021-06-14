/* 带搜索功能并且可以动态追加节点的树组件 */
<template>
    <div class="tree-box">
        <a-input-search
            style="margin-bottom: 8px"
            placeholder="搜索"
            @change="onChange"
            v-if="isSearch"
        />
        <div class="tree-content">
            <a-tree
                :tree-data="treeData"
                @expand="onExpand"
                @select="onSelect"
                show-icon
                :default-expanded-keys="expandedKeys"
                :expanded-keys="expandedKeys"
                :auto-expand-parent="autoExpandParent"
                :selected-keys="selectedKeys"
            >
                <a-icon
                    slot="switcherIcon"
                    style="font-size: 22px"
                    type="down"
                />
                <!-- <a-icon slot="smile" type="smile-o" /> -->
                <img
                    src="@/assets/images/icon/icon_text.png"
                    slot="text"
                    alt=""
                />
                <img
                    src="@/assets/images/icon/icon_audio.png"
                    slot="audio"
                    alt=""
                />
                <img
                    src="@/assets/images/icon/icon_video.png"
                    slot="video"
                    alt=""
                />
                <img
                    src="@/assets/images/icon/icon_img.png"
                    slot="img"
                    alt=""
                />

                <template slot="title" slot-scope="{ title }">
                    <div :title="title">
                        <span v-if="title.indexOf(searchValue) > -1">
                            {{ title.substr(0, title.indexOf(searchValue)) }}
                            <span style="color: #f50">{{ searchValue }}</span>
                            {{
                                title.substr(
                                    title.indexOf(searchValue) +
                                        searchValue.length
                                )
                            }}
                        </span>
                        <span v-else >{{ title }}</span>
                    </div>
                </template>
            </a-tree>
        </div>
    </div>
</template>

<script>
const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some((item) => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    // console.log(parentKey);
    return parentKey;
};
import { getArrDefValIdx  } from '@/utils/utils.js';

export default {
    name: 'searchTree',
    props: {
        treeData: {
            default: () => [],
            required: false
        },
        isSearch: {
            type: Boolean,
            default: true,
            required: false
        },
        selectedKeys: {
            type: Array,
            default: () => [],
            required: false
        }
    },
    data() {
        return {
            expandedKeys: [], // 展开项
            searchValue: '',
            autoExpandParent: true,
            defaultExpandAll: true,
            dataList: [] // 用于搜索时遍历筛选
        };
    },
    watch: {
        treeData: {
            handler(newVal, oldVal) {
                console.log('treeData', newVal, oldVal);
                let _this = this;
                this.$nextTick(function() {
                    if (newVal && newVal.length > 0) {
                        _this.expandedKeys = [newVal[0].key];
                        console.log('this.expandedKeys', _this.expandedKeys);
                        _this.dataList = [];
                        _this.generateList(_this.treeData);
                        console.log('_this.dataList', _this.dataList);
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        onExpand(expandedKeys) {
             console.log('expandedKeys', expandedKeys);
            this.expandedKeys = expandedKeys;
            this.autoExpandParent = false;
        },
        onChange(e) {
            let _this = this;
            const value = e.target.value;
            // console.log('onChange', this.dataList);
            const expandedKeys = this.dataList
                .map((item) => {
                    if (item.title.indexOf(value) > -1) {
                        return getParentKey(item.key, _this.treeData);
                    }
                    return null;
                })
                .filter((item, i, self) => item && self.indexOf(item) === i);
            // console.log(expandedKeys);
            Object.assign(this, {
                expandedKeys,
                searchValue: value,
                autoExpandParent: true
            });
        },
        onSelect(selectedKeys, e) {
            let data = e.node.dataRef;
            console.log('onSelect', selectedKeys, e.node, data);
            //选中节点展开
            if(selectedKeys.length>0){
                let index=getArrDefValIdx(this.expandedKeys,'',selectedKeys[0]);
                if(index>-1){
                    this.expandedKeys.splice(index,1);
                }else{
                    this.expandedKeys.push(selectedKeys[0]);

                }
            }
            
            // 点击文件才触发
            if (data.itemType == 'electronic') {
                this.$emit('emitNodeSelect', data);
            }

        },
        generateList(data) {
            for (let i = 0; i < data.length; i++) {
                const node = data[i];
                const key = node.key;
                this.dataList.push({ key, title: node.title });
                if (node.children) {
                    this.generateList(node.children);
                }
            }
        }
    }
};
</script>
<style scoped lang="less">
.tree-box {
    height: 100%;
    .tree-content {
        height: calc(100% - 50px);
        overflow-y: hidden;
    }
}
/deep/.ant-tree {
    font-size: @font24px;
}
/deep/.ant-tree li ul {
    padding: 0 0 0 24px;
}
/deep/.ant-input-affix-wrapper {
    font-size: @font24px;
    input {
        height: 40px;
        font-size: @font22px;
        vertical-align: middle;
        line-height: 40px;
        border-radius: 20px;
        padding: 0 20px;
    }
}
/deep/.ant-tree
    li
    span.ant-tree-switcher.ant-tree-switcher_close
    .ant-tree-switcher-icon {
    font-size: 30px;
}
/deep/.ant-tree li span.ant-tree-switcher,
.ant-tree li span.ant-tree-iconEle {
    height: 40px;
    width: 40px;
    background: transparent !important;
}
/deep/.ant-tree li .ant-tree-node-content-wrapper {
    height: 40px;
    line-height: 40px;
    width:calc(100% - 40px);
    .ant-tree-title{
        div{
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
}
/deep/.ant-tree.ant-tree-show-line li span.ant-tree-switcher > img {
    width: 35px;
    height: 40px;
}
/deep/.ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop > img {
    width: 35px;
    height: 40px;
}
/deep/.ant-tree.ant-tree-show-line li:not(:last-child)::before {
    border-left: 2px solid @color_primary;
    border-top: 2px solid @color_primary;
}
/deep/.ant-tree li {
    padding: 10px 0;
}
</style>
