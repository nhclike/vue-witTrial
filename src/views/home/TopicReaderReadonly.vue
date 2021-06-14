/* 材料展示---只是查看
 * @Author: ShiHuiJun
 * @Date: 2020-03-19 09:36:04
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-14 10:07:37
 */

<template>
    <div
        class="topicReader full-height box"
     
    >
        <!-- 内容 -->
        <div class="content full-w">
            <!-- 初始化 -->
            <div v-if="showFile === -1" class="noFile">
                <img class src="@/assets/images/topicReader/noFile.png" />
                <p>{{ noFileMsg }}</p>
            </div>
            <!-- 无材料 -->
            <div v-if="showFile === 0" class="noFile">
                <img class src="@/assets/images/topicReader/noFile.png" />
                <p>{{ noFileMsg }}</p>
            </div>
            <!-- 材料 -->
            <div ref="material" class="material">
                <div
                    v-if="showFile === 1"
                    ref="pageBox"
                    class="pageBox"
                    :style="materialStyleObj.pageBoxStyle"
                >
                    <div
                       
                        :id="`page${index + 1}`"
                        :style="materialStyleObj.pageStyle"
                        class="page"
                        v-for="(item, index) in curFile.pngList"
                        :key="index"
                    >
                        <img
                            class="full-width"
                            :style="materialStyleObj.imgStyle"
                            v-lazy="formatImageUrl(item)"
                            alt
                            :key="index"
                        />
                        
                    </div>
                </div>
            </div>

            

            <!-- 底部操作区 -->
            <div
                class="material-operate-box"
                v-if="showFile === 1 && !isProveFile && curFile.pngSize > 1"
            >
                <span class="btn txt-justify" @click="scrollToPage(curPageNum - 1)">上一页</span>
                <span class="txt-justify">
                    &nbsp;{{ curPageNum }}&nbsp;/&nbsp;{{
                    curFile.pngSize
                    }}&nbsp;
                </span>
                <span class="btn txt-justify" @click="scrollToPage(curPageNum + 1)">下一页</span>
                <span class="jumpToNum">
                    跳转至第
                    <el-input v-model="jumpToNum" placeholder />&nbsp;页
                    <span
                        class=""
                        @click="scrollToPage(Number(jumpToNum))"
                    >确定</span>
                </span>
            </div>

        </div>
    </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

export default {
    layout: 'blank',
    components: {
    },
    inject: ['reload', 'userInfo'],
    props: {
      
        // 材料id
        fileId: {
            type: String,
            default: '',
            required: false
        },
        // 材料的动作监听
        fileAction: {
            type: String,
            default: '',
            required: false
        }
    },
    data() {
        return {
            curPage: 'TopicReader',
           
            /* 材料 */
            showFile: -1, // 值可为0 1 -1
          
            materialStyleObj: {
                pageBoxStyle: 'width:8.36rem;',
                pageStyle: 'width:8.36rem;min-height:0.5rem;',
                imgStyle: 'width:8.36rem;min-height:0.5rem;' // 材料区 图片样式
            },
            noFileMsg: '请自行查看左侧电子卷宗和影音证据', // 无材料显示文字
            curFile: {
                fileId: '',
                pngList: [
                    // '/file/123Relese/0.png',
                    // '/file/123Relese/1.png',
                    // '/file/123Relese/2.png',
                    // '/file/123Relese/3.png',
                    // '/file/123Relese/4.png'
                ],
                pngSize: 0,
                pngUrl: '/file/123Relese',
                typeCode: null,
                url: ''
            }, // 当前材料
            curPageNum: 1, // 当前所在页码
           
            /* --------------------toolBar-结束-------------------- */
        };
    },
    computed: {
       
    },
    watch: {
       
       
    },
    created() {
        //
    },
    mounted() {
       this.initFile();
    },
    beforeDestroy() {
      

    },
    methods: {
        ...mapActions({
            getMaterialFile: 'moduleJudge/getMaterialFile',
        }),
        
        // 初始化材料
        initFile() {
          
            /* 材料 */
            this.showFile = -1; // 清空材料显示
           
            // 还原材料区样式
            this.materialStyleObj = {
                pageBoxStyle: 'width:7.36rem;',
                pageStyle: 'width:7.36rem;min-height:0.5rem;',
                imgStyle: 'width:7.36rem;min-height:0.5rem;' // 材料区 图片样式
            };
            this.noFileMsg = ''; // 无材料显示文字
            this.curFile = {}; // 清空当前文件信息
      
            if (this.activeFileId) {
                this.reqGetMaterialFile(
                    {
                        fileId: this.activeFileId,
                        typeCode: this.typeCode
                    },
                    true
                );
            }
        },

        // 查询材料文件
        reqGetMaterialFile(params, isScrollTo0) {
            this.getMaterialFile(params).then((res) => {
                if (res.code === 0) {
                    this.curFile = res.data;
                    this.curFile.fileId = this.activeFileId;
                    this.curFile.typeCode = this.typeCode;
                    if (this.curFile.pngSize < 1) {
                        this.showFile = 0;
                        this.noFileMsg = '暂无电子材料';
                    } else {
                        this.showFile = 1;
                        let noteParams = {
                            fileId: this.curFile.fileId,
                            creator: this.userInfo().id,
                            typeCode: this.curFile.typeCode,
                            caseId: this.$route.query.trialId
                            // pageNo: ''
                        };
                    }
                } else {
                    this.curFile = {};
                    this.noFileMsg = '暂无电子材料';
                }
            });
        },

        // 格式化图片地址
        formatImageUrl(item) {
            let url = `${__API__}/trial${item}`;
            return url;
        },

       
        
        /* --------------------工具栏操作-结束-------------------- */
    }
};
</script>

<style scoped lang="less">
/*// 一、必须增加，设置滚动条样式*/
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  display: none;
}
 ::-webkit-scrollbar:hover{
     display: block;
 }
/*// 二、置底的滑动槽，可以选择不写，默认*/
::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: @color_primary_light;
}
 
/*//三、滚动条滑块和第一条必须书写，不写的话，无法实现*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: @color_primary_light;
}

@spacing: 20px;
.topicReader {
    .content {
        color: @text_color_white;
        padding-left: 130px;
        height: 100%;
        font-size: @font20px;
        display: flex;
        justify-content: space-between;
        position: relative;
        // 无材料
        .noFile {
            position: absolute;
            top: 50%;
            left: 50%;
            text-align: center;
            transform: translate(-50%, -50%);
            width: 100%;
            img {
                width: 264px;
                height: 174px;
            }
            p {
                font-size: 0.4rem;
                color: @text_color_white;
            }
        }
        // 材料区
        .material {
            overflow: auto;
            height: 100%;
            margin: 0 auto;
            position: relative;
            scrollbar-arrow-color: @color_primary_light; /**//*三角箭头的颜色*/   
            scrollbar-face-color: @color_primary_light; /**//*立体滚动条的颜色*/   
            scrollbar-3dlight-color: @color_primary_light; /**//*立体滚动条亮边的颜色*/   
            scrollbar-highlight-color: @color_primary_light; /**//*滚动条空白部分的颜色*/   
            scrollbar-shadow-color: @color_primary_light; /**//*立体滚动条阴影的颜色*/   
            scrollbar-darkshadow-color: @color_primary_light; /**//*立体滚动条强阴影的颜色*/   
            scrollbar-track-color: @color_primary_light; /**//*立体滚动条背景颜色*/   
            scrollbar-base-color:@color_primary_light; /**//*滚动条的基本颜色*/
            // background: @text_color_white;
            // border: 1px solid @border_color;
            padding-right: 40px;
            .pageBox {
                border-top: 0;
                background-color: rgb(245, 247, 250);
                margin: 0 auto;
                .page {
                    position: relative;
                    border-bottom: 2px solid #eee;
                    margin: 0 auto;
                    .myCanvas {
                        position: absolute;
                        top: 0;
                        left: 0;
                        cursor: crosshair;
                    }
                }
            }
        }
        //质证列表
        .prove-content {
            // min-height: 180px;
            // max-height: 300px;
            color: @text_color_black;
            .prove-item {
                display: flex;
                // align-items: flex-start;
                div.tag {
                    width: 26px;
                    height: 60px;
                    &.red {
                        background: url('@{base_url}/icon/icon-red.png') no-repeat center center / 26px 60px;
                    }
                    &.green {
                        background: url('@{base_url}/icon/icon-green.png') no-repeat center center / 26px 60px;
                    }
                    span {
                        display: block;
                        writing-mode: vertical-lr;
                        writing-mode: tb-rl; //ie
                        color: #fff;
                        font-size: @font16px;
                        margin-top: 3px;
                    }
                }
                p {
                    margin-left: 5px;
                    span{
                        display: inline-block;
                        width: 200px;

                    }
                }
            }
        }
        .list-box {
            height: 400px;
            .list-title {
                height: 40px;
                font-size: @font20px;
            }
            .list-content {
                height: 360px;
                overflow-y: auto;
                color: @text_color_black;
                font-size: @font20px;
                p {
                    cursor: pointer;
                }
            }
        }
        // 画笔设置
        .setting-box {
            overflow-y: auto;
            z-index: 1001;
            font-size: @font22px;
            width: 300px;
            padding: 20px;
            position: absolute;
            bottom: 0;
            right: 0;
            background: #fff;
            border-radius: @border_radius_small;
            box-shadow: 0px 0px 5px 0px #666;
            h5 {
                font-weight: bold;
                color: #777;
            }
            .brush-color {
                display: block;
                .active {
                    border: @border_large solid #00cc00;
                }
                span {
                    display: inline-block;
                    vertical-align: middle;
                    width: 70px;
                    height: 60px;
                    border-radius: @border_radius_middle;
                    border: @border_large solid #fff;
                    margin: 5px;
                    cursor: pointer;
                }
            }
            .brush-thickness {
                .active {
                    background: #f5606f;
                    color: @text_color_white;
                }
                span {
                    display: inline-block;
                    width: 60px;
                    height: 50px;
                    line-height: 50px;
                    text-align: center;
                    border-radius: @border_radius_middle;
                    margin: 3;
                    background: #ddd;
                    cursor: pointer;
                }
                .thin {
                    font-weight: 500;
                }
                .middle {
                    font-weight: 700;
                }
                .thick {
                    font-weight: 900;
                }
            }
            .brush-control {
                .active {
                    background: #f5606f;
                    color: @text_color_white;
                }
                span {
                    display: inline-block;
                    width: 60px;
                    height: 50px;
                    line-height: 50px;
                    text-align: center;
                    border-radius: @border_radius_middle;
                    margin: 10px;
                    background: #ddd;
                    vertical-align: middle;
                    cursor: pointer;
                }
                .i-prev::before {
                    content: '\21BA';
                }
                .i-next::before {
                    content: '\21BB';
                }
            }
            .annotation-list {
                height: 400px;
                .active {
                    color: #fa4c4c;
                }
            }
        }
        // 右侧功能区
        .material-func-box {
            position: absolute;
            top: 0;
            right: -40px;
            span {
                cursor: pointer;
                display: block;
                writing-mode: vertical-lr; /* Webkit */
                writing-mode: tb-lr;
                padding: 5px;
                height: 120px;
                background-color: #fa4c4c;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                &:not(:first-child) {
                    margin-top: 5px;
                }
            }
        }
        // 底部操作区
        .material-operate-box {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            // width: 100%;
            text-align: center;
            border-radius: @border_radius_middle;
            background: @bg_maskLayer_black5;
            font-size: @font24px;
            white-space: nowrap;
            .btn {
                // width: 110px;
                line-height: 60px;
                background: none;
                border-radius: 0;
                cursor: pointer;
            }
            span {
                padding: 0 10px;
                &:not(:first-child) {
                    border-left: 1px solid #666;
                }
            }
            .jumpToNum {
                /deep/.el-input {
                    width: 70px;
                    .el-input__inner {
                        padding: 0 10px;
                        text-align: center;
                        color: @text_color_black;
                    }
                }
                span {
                    // color: rgb(0, 255, 221);
                    // font-weight: bold;
                    cursor: pointer;
                }
            }

        }
        // 工具栏
        .toolbar {
            position: absolute;
            top: 30px;
            left: 30px;
            background: @text_color_white;
            border: @border_small solid @text_color_black_25;
            border-radius: @border_radius_middle;
            width: 70px;
            span {
                cursor: pointer;
                display: block;
                width: 100%;
                height: 60px;
                padding: 15px;
                &:not(:first-child) {
                    border-top: @border_small solid @text_color_black_25;
                }
            }
            .line {
                background: url('@{base_url}/topicReader/icon_line.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_line_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
            .circle {
                background: url('@{base_url}/topicReader/icon_circle.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_circle_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
            .rect {
                background: url('@{base_url}/topicReader/icon_rect.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_rect_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
            .eraser {
                background: url('@{base_url}/topicReader/icon_eraser.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_eraser_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
            .clear {
                background: url('@{base_url}/topicReader/icon_clear.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_clear_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
            .bigger {
                background: url('@{base_url}/topicReader/icon_bigger.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_bigger_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
            .smaller {
                background: url('@{base_url}/topicReader/icon_smaller.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_smaller_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
            .mosaic {
                background: url('@{base_url}/topicReader/icon_mosaic.png') no-repeat center center / 34px 34px;
                &.activeTool {
                    background: @color_primary url('@{base_url}/topicReader/icon_mosaic_active.png') no-repeat center
                        center / 34px 34px;
                }
            }
        }
    }
}

/* 画笔设置过渡效果 */
.transition-setting-enter-active {
    transition: opacity 0.5s;
}
.transition-setting-enter {
    opacity: 0;
}
.transition-setting-leave-active {
    transition: opacity 0.5s;
}
.transition-setting-leave-to {
    opacity: 0;
}
</style>
