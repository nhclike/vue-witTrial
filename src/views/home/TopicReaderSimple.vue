/* 材料展示
 * @Author: ShiHuiJun
 * @Date: 2020-03-19 09:36:04
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-04-28 10:55:19
 */

<template>
    <div
        class="topicReader full-height box"
        @selectstart="handleSelectStart($event)"
        @mouseup="
            isArea = false;
            isMouseUp = true;
        "
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
            <div ref="material" class="material" @scroll="handleScroll()">
                <div
                    v-if="showFile === 1"
                    ref="pageBox"
                    class="pageBox"
                    :style="materialStyleObj.pageBoxStyle"
                >
                    <div
                        @mouseenter="isArea = true"
                        @mouseout="isArea = false"
                        @click="handleClick()"
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
                        <!-- 画板 -->
                        <DrawCanvas
                            v-if="
                                index + 1 >
                                    Math.floor(
                                        (curPageNum - 1) / canvasPageSize
                                    ) *
                                        10 &&
                                index + 1 <=
                                    Math.ceil(curPageNum / canvasPageSize) * 10
                            "
                            :pagination="{
                                total: curFile.pngList.length,
                                curPage: curPageNum,
                                pageSize: canvasPageSize
                            }"
                            :index="index"
                            :activeIndex="activeIndex"
                            :fileId="curFile.fileId || ''"
                            :typeCode="curFile.typeCode"
                            :shareBgUrl="formatImageUrl(item)"
                            :curFileNotationURL="curFileNotationURL"
                            :canvasStyle="canvasStyle"
                            :canvasSize="canvasSize"
                            :config="brushOptions.config"
                            :isWrite="isWrite"
                            :isArea="isArea"
                            :isMouseUp="isMouseUp"
                            :action="action"
                            :actionStepObjFather="actionStepObjFather"
                            @emitActionStep="emitActionStep"
                            @emitCanvasStyle="emitCanvasStyle"
                            @emitReloadNotation="emitReloadNotation"
                            @emitDrawStatus="emitDrawStatus"
                            @emitScreenshotToShare="emitScreenshotToShare"
                        ></DrawCanvas>
                    </div>
                </div>
            </div>

            <!-- 右侧功能区 -->
            <div
                class="material-func-box"
                @click="
                    showAnnotationList = false;
                    showBrushSetting = false;
                "
            >
                <div>
                    <!-- 批注列表 -->
                    <span
                        v-if="!isProveFile&&showFile===1"
                        class="btn txt-justify annotation_list"
                        @click.stop="getAnnotateList(false)"
                    >批注列表</span>
                    <!-- 保存批注 -->
                    <span
                        v-if="!isProveFile&&showFile==1"
                        class="btn txt-justify annotation_exit"
                        @click="saveAnnotation()"
                    >批注保存</span>
                    <!-- 质证列表一直显示跟有无材料无关 -->
                    <!-- 质证分享(对于当事人只有允许质证才有) -->
                    <span
                        v-if="isProveShareShow&&showFile==1"
                        class="btn txt-justify prove_share"
                        @click.stop="proveShareScreenShot()"
                    >质证分享</span>
                    <!-- 质证列表 -->
                    <span
                        v-if="isShowProveList"
                        class="btn txt-justify prove_list"
                        @click.stop="getProveList()"
                    >质证列表</span>
                </div>
            </div>

            <!-- 批注列表 (靠下方)-->
            <transition name="transition-setting">
                <div v-if="showAnnotationList" class="setting-box">
                    <div class="annotation-list list-box">
                        <h5 class="list-title">批注列表</h5>
                        <div class="list-content">
                            <p
                                v-for="(item, index) in curFileNotationURL"
                                :key="index"
                                :class="{
                                    active:
                                        String(curPageNum) ===
                                        String(item.pageNo)
                                }"
                                @click.stop="
                                    curPageNum = Number(item.pageNo);
                                    scrollToPage(Number(item.pageNo));
                                "
                            >P{{ item.pageNo }}</p>
                        </div>
                    </div>
                    <iframe
                        src="about:blank"
                        frameborder="0"
                        marginheight="0"
                        marginwidth="0"
                        style="
                            position: absolute;
                            visibility: inherit;
                            top: 0px;
                            left: 0px;
                            width: 100%;
                            height: 100%;
                            z-index: -1;
                        "
                    ></iframe>
                </div>
            </transition>

            <!-- 质证列表 (靠上方)-->
            <transition name="transition-setting">
                <div v-if="showProveList" class="setting-box" style="bottom: auto; top: 0">
                    <div class="prove-list list-box">
                        <h5 class="list-title">质证列表</h5>
                        <div class="prove-content list-content">
                            <ul>
                                <li
                                    v-for="(item, index) in proveListData"
                                    :key="index"
                                    @click="checkImg(item)"
                                >
                                    <div class="prove-item">
                                        <div class="green tag" v-if="item.status == 3">
                                            <span>已传阅</span>
                                        </div>
                                        <div class="red tag" v-if="item.status == 4">
                                            <span>已拒绝</span>
                                        </div>
                                        <p>
                                            <span class="txt-ellipsis" :title="item.senderType">来自:{{ item.senderType }}</span>
                                            <br />
                                            <span>{{ item.proveTime }}</span>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <iframe
                        src="about:blank"
                        frameborder="0"
                        marginheight="0"
                        marginwidth="0"
                        style="
                            position: absolute;
                            visibility: inherit;
                            top: 0px;
                            left: 0px;
                            width: 100%;
                            height: 100%;
                            z-index: -1;
                        "
                    ></iframe>
                </div>
            </transition>

            <!-- don't delete-画笔设置 -->
            <!-- <transition name="transition-setting">
                <div class="setting-box">
                    <h5>画笔颜色</h5>
                    <div class="brush-color">
                        <span
                            v-for="(item, index) in brushOptions.colors"
                            :key="index"
                            :class="{
                                active: brushOptions.config.lineColor === item
                            }"
                            :style="{ background: item }"
                            @click.stop="setBrushColor(item)"
                        ></span>
                    </div>
                    <h5>画笔粗细</h5>
                    <div class="brush-thickness">
                        <span
                            v-for="(pen, index) in brushOptions.brushs"
                            :key="index"
                            :class="[
                                pen.className,
                                {
                                    active:
                                        brushOptions.config.lineWidth ===
                                        pen.lineWidth
                                }
                            ]"
                            @click.stop="setBrushThickness(pen.lineWidth)"
                            >{{ pen.name }}</span
                        >
                    </div>
                    <h5>画笔操作</h5>
                    <div class="brush-control">
                        <span
                            v-for="(control, index) in brushControls"
                            :key="index"
                            :title="control.title"
                            :class="control.className"
                            @click.stop="brushControl(control.action)"
                        ></span>
                    </div>
                </div>
            </transition>-->

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

            <!-- 左侧工具栏 -->
            <div v-if="showFile===1" class="toolbar">
                <span
                    :class="[
                        tool.className,
                        activeTool === index ? 'activeTool' : ''
                    ]"
                    v-for="(tool, index) in toolList"
                    :key="index"
                    :title="tool.name"
                    @click="clickTool(tool.func, tool, index)"
                ></span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
import DrawCanvas from '@/components/common/DrawCanvas';
import { objArr2KeyArr, debounce } from '@/utils/utils';

export default {
    layout: 'blank',
    components: {
        DrawCanvas
    },
    inject: ['reload', 'userInfo'],
    props: {
        // 质证状态---决定是否显示质证按钮
        crossExaminationStatus: {
            type: Boolean,
            default: false,
            required: false
        },
        trialStatus: {
            type: String,
            default: ''
        },
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
        },
        // 1-电子卷宗 2-影音证据
        typeCode: {
            type: Number,
            default: 1,
            required: false
        },
        fileNodeInfo: {
            type: Object,
            default: () => ({}),
            required: false
        }
    },
    data() {
        return {
            curPage: 'TopicReader',
            curEvent:'click',//当前截图事件触发click查看或者prove查看
            /* 质证 */
            isProveFile: false, // 是否为质证文件
            showProveList: false, // 是否显示-质证列表
            proveListData: [], // 质证列表数据
            /* 材料 */
            showFile: -1, // 值可为0 1 -1
            showAnnotationList: false, // 是否显示-批注列表
            materialStyleObj: {
                pageBoxStyle: 'width:8.36rem;',
                pageStyle: 'width:8.36rem;min-height:0.5rem;',
                imgStyle: 'width:8.36rem;min-height:0.5rem;' // 材料区 图片样式
            },
            noFileMsg: '请自行查看左侧电子卷宗和影音证据', // 无材料显示文字
            activeFileId: '', // 当前材料id
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
            canvasPageSize: 10, // 每次加载canvas数量
            jumpToNum: null, // 跳转页码
            jumpToNum_temp: 0, // 用于跳转页码
            scrollTop: 0, // 滚动的值
            lastScrollTop: 0, // 上次滚动的距离,判断滚动是否停止

            /* --------------------DrawCanvas-props-开始-------------------- */
            curFileNotationURL: [
                /* {
                    bookScale: null,
                    conferenceId: '7c54efed-fbc0-49c0-8568-62b07b5c1816',
                    courtCode: null,
                    createTime: '2020-04-13 11:12:16',
                    fileId: null,
                    id: '21ee804d53-3b21-ce2b-603e-39c96f3014f8',
                    notationId: '',
                    notationName: null,
                    sort: '1',
                    status: null,
                    type: '2',
                    url: 'http://172.19.82.130:8080/uploadfiles/topicNote/7c54efed-fbc0-49c0-8568-62b07b5c1816/ee804d53-3b21-ce2b-603e-39c96f3014f8/notation/1.png'
                } */
            ], // 当前材料的批注列表
            activeIndex: 0, // 当前批注上一步或者下一步的图像所在的页面
            canvasStyle: 'width:6.36rem;min-height:0.5rem;', // 父传子 每页canvas样式
            // 父传子 canvas大小
            canvasSize: {
                width: 0,
                height: 0,
                scale: 1
            },
            isWrite: false, // 是否开启批注
            isArea: false, // 是否在可涂鸦区域
            isMouseUp: true, // 鼠标是否已抬起
            action: '', // 父传子 fnScale|prev|next|clear|save
            // canvas所有操作步骤
            actionStepObjFather: {
                preDrawAry: [], // 存储当前表面状态数组-上一步
                nextDrawAry: [], // 存储当前表面状态数组-下一步
                middleAry: [] // 中间数组
            },
            /* --------------------DrawCanvas-props-结束-------------------- */

            /* --------------------toolBar-开始-------------------- */
            // 画笔
            showBrushSetting: false, // 是否显示-画笔设置
            // 画笔设置-参数
            brushOptions: {
                // 父传子 配置参数
                config: {
                    lineWidth: 3,
                    lineColor: '#ff0000',
                    shadowBlur: 2,
                    shape: 'line'
                },
                // 画笔颜色
                colors: ['#000000', '#ff0000', '#80ff00', '#00ffff', '#ff8000', '#408080', '#8000ff', '#cccc00'],
                // 画笔粗细
                brushs: [
                    {
                        className: 'thin',
                        lineWidth: 3,
                        name: '细'
                    },
                    {
                        className: 'middle',
                        lineWidth: 6,
                        name: '中'
                    },
                    {
                        className: 'thick',
                        lineWidth: 12,
                        name: '粗'
                    }
                ],
                // 画笔操作样式
                brushControlClass: {
                    prevClass: 'i-prev',
                    nextClass: 'i-next',
                    clearClass: 'el-icon-delete'
                }
            },
            activeTool: -1,
            toolList: [
                {
                    className: 'line',
                    shape: 'line',
                    name: '线条',
                    func: 'drawShape'
                },
                {
                    className: 'circle',
                    shape: 'circle',
                    name: '圆形',
                    func: 'drawShape'
                },
                {
                    className: 'rect',
                    shape: 'rect',
                    name: '矩形',
                    func: 'drawShape'
                },
                {
                    className: 'eraser',
                    shape: 'eraser',
                    func: 'drawShape',
                    name: '橡皮擦'
                },
                {
                    className: 'mosaic',
                    shape: 'mosaic',
                    name: '马赛克',
                    func: 'drawShape'
                },
                {
                    className: 'clear',
                    shape: 'clear',
                    func: 'clearDraw',
                    name: '清除整页'
                },
                {
                    className: 'bigger',
                    shape: null,
                    name: '放大',
                    func: 'scaleBigger',
                    zoom: 1.5,
                    maxRem: 49
                },
                {
                    className: 'smaller',
                    shape: null,
                    name: '缩小',
                    func: 'scaleSmaller',
                    zoom: 1.5,
                    minRem: 6.2
                }
            ]
            /* --------------------toolBar-结束-------------------- */
        };
    },
    computed: {
        brushControls() {
            return [
                {
                    title: '上一步',
                    action: 'prev',
                    className: this.brushOptions.brushControlClass.prevClass
                },
                {
                    title: '下一步',
                    action: 'next',
                    className: this.brushOptions.brushControlClass.nextClass
                },
                {
                    title: '清除',
                    action: 'clear',
                    className: this.brushOptions.brushControlClass.clearClass
                }
            ];
        },
        
        // eslint-disable-next-line vue/return-in-computed-property
        // 质证分享按钮显示控制
        isProveShareShow() {
            console.log(`[${this.curPage}]`, 'isProveShareShow');
            if (this.trialStatus != 1) {
                // 非庭审状态不显示
                return false;
            }
            // 庭审后查看页面不显示
            if (window.location.href.indexOf('trialCheck') > -1) {
                return false;
            }
            if (this.comm.isTrialAuthorizeShow('trial:judgeProveShare')) {
                // 法官一直显示
                return true;
            }
            if (this.comm.isTrialAuthorizeShow('trial:otherProveShare')) {
                // 当事人被允许质证显示否则不显示
                if (this.crossExaminationStatus) {
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        },
        isShowProveList() {
            // 庭审后查看页面显示
            // if (window.location.href.indexOf('trialCheck') > -1) {
            //     return true;
            // } else {
            //     return this.comm.isTrialAuthorizeShow('trial:proveList');
            // }
            return true;
        }
    },
    watch: {
        scrollTop(newValue, oldValue) {
            setTimeout(() => {
                if (newValue == this.$refs.material.scrollTop) {
                    // 延时执行后当 newValue 等于新的scrollTop，代表滚动结束
                    // console.log(`[${this.curPage}]`,'滚动结束');
                    this.lastScrollTop = newValue; // 每次滚动结束后都要给 lastScrollTop 赋值
                    // this.isScrollEnd(); // 滚动结束提示批注保存
                }
            }, 500); // 必须使用延时器，否则每次newValue和window.scrollY都相等，无法判断，watch的侦听周期大于20ms
            if (this.lastScrollTop == oldValue) {
                // 每次滚动开始时 lastScrollTop 与 oldValue相等
                // console.log(`[${this.curPage}]`,'滚动开始');
            }
        },
        fileAction: {
            handler() {
                this.$nextTick(() => {
                    this.isProveFile = false;
                    let fileAction = this.fileAction.split('num')[0];
                    switch (fileAction) {
                        case 'init':
                            console.log(
                                `[${this.curPage}]`,
                                'fileAction init preDrawAry',
                                this.actionStepObjFather.preDrawAry
                            );
                            if (this.actionStepObjFather.preDrawAry.length > 0) {
                                this.$CusConfirm({
                                    title: '当前有批注未保存，确定跳转吗？',
                                    cancel: () => {
                                        // console.log('点取消调用');
                                        this.$emit('emitCancelFileChange', this.activeFileId);
                                    },
                                    ok: () => {
                                        // console.log('点确定调用');
                                        this.activeFileId = this.fileId;
                                        this.initFile();
                                    }
                                });
                            } else {
                                this.activeFileId = this.fileId;
                                this.initFile();
                            }

                            break;
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        //
    },
    mounted() {
        // window.addEventListener('resize', this.reload);
        window.addEventListener('click', this.clickOther);
    },
    beforeDestroy() {
        // window.removeEventListener('resize', this.reload);
        window.removeEventListener('click', this.clickOther);

    },
    methods: {
        ...mapActions({
            queryProveList: 'moduleJudge/queryProveList',
            getMaterialFile: 'moduleJudge/getMaterialFile',
            getAnnotate: 'moduleJudge/getAnnotate',
            proveVerify: 'moduleJudge/proveVerify'
        }),
        ...mapMutations('moduleJudge', ['proveInfoMut']),
        clickOther() {
            if (this.showProveList) {
                this.showProveList = false;
            }
            if (this.showAnnotationList) {
                this.showAnnotationList = false;
            }
        },
        // 初始化材料
        initFile() {
            /* 质证 */
            this.showProveList = false; // 隐藏质证设置
            /* 材料 */
            this.showFile = -1; // 清空材料显示
            this.showAnnotationList = false; // 隐藏批注列表
            // 还原材料区样式
            this.materialStyleObj = {
                pageBoxStyle: 'width:7.36rem;',
                pageStyle: 'width:7.36rem;min-height:0.5rem;',
                imgStyle: 'width:7.36rem;min-height:0.5rem;' // 材料区 图片样式
            };
            this.noFileMsg = ''; // 无材料显示文字
            this.curFile = {}; // 清空当前文件信息
            /* DrawCanvas-props */
            this.curFileNotationURL = []; // 清空当前批注图片信息
            this.isWrite = false; // 关闭批注
            this.action = ''; // 清除之前的操作
            // 清除canvas所有操作步骤
            this.actionStepObjFather = {
                preDrawAry: [], // 存储当前表面状态数组-上一步
                nextDrawAry: [], // 存储当前表面状态数组-下一步
                middleAry: [] // 中间数组
            };
            /* toolBar */
            this.showBrushSetting = false; // 隐藏画笔设置
            this.activeTool = -1; // 不选中任何工具
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
                        this.reqGetAnnotate(noteParams, isScrollTo0, 'init'); // 获取批注图片地址
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

        // 获取批注图片列表
        getAnnotateList(isScrollTo0) {
            let noteParams = {
                fileId: this.curFile.fileId,
                creator: this.userInfo().id,
                typeCode: this.curFile.typeCode,
                caseId: this.$route.query.trialId
                // pageNo: ''
            };
            this.showAnnotationList = !this.showAnnotationList;
            if (this.showAnnotationList) {
                this.reqGetAnnotate(noteParams, isScrollTo0, null); // 获取批注图片地址
            }
        },

        // 获取批注图片地址
        reqGetAnnotate(params, isScrollTo0, canvasAction) {
            this.getAnnotate(params).then((res) => {
                // console.log(`[${this.curPage}]`, 'getAnnotate', res);
                if (res.code === 0) {
                    this.curFileNotationURL = res.data;
                    this.action = `${canvasAction}num${Date.now()}`;
                } else {
                    this.curFileNotationURL = [];
                }
                if (isScrollTo0 && this.$refs.material) {
                    this.curPageNum = 1;
                    this.scrollToPage(0);
                }
            });
        },

        // 保存批注
        saveAnnotation() {
            this.$CusConfirm({
                title: '确定保存当前批注吗？',
                cancel: () => {
                    // console.log('点取消调用');
                },
                ok: () => {
                    // console.log('点确定调用');
                    this.action = `savenum${Date.now()}`;
                }
            });
        },

        /* --------------------DrawCanvas-emit事件-开始-------------------- */

        // 改变绘图状态
        emitDrawStatus(isArea, isMouseUp) {
            this.isArea = isArea;
            this.isMouseUp = isMouseUp;
        },

        // 重新加载批注
        emitReloadNotation(canvasNo, isAuto) {
            if (isAuto) {
                console.log(`[${this.curPage}]`, 'emitAutoSave');
                let materialH = this.$refs.material.offsetHeight;
                let pageH = this.$refs.material.children[0].children[0].offsetHeight;
                let maxScrollTop = this.$refs.pageBox.offsetHeight - materialH;
                /* console.log(
                    `[${this.curPage}]`,
                    'emitAutoSave scrollTop',
                    this.scrollTop,
                    'materialH',
                    materialH,
                    'pageH',
                    pageH,
                    'maxScrollTop',
                    maxScrollTop
                ); */
                let pageNum;
                if (materialH - pageH >= 0) {
                    if (this.scrollTop < maxScrollTop) {
                        pageNum = Math.round(this.scrollTop / pageH) + 1;
                    } else { // 针对图片高度很小的情况下，一个materialH会占好几个pageH
                        pageNum = this.jumpToNum_temp > 1 ? this.jumpToNum_temp : this.curFile.pngSize;
                    }
                } else { // 针对图片高度很大的情况下，一个materialH不够放1个pageH
                    pageNum = Math.floor((this.scrollTop + pageH / 100) / pageH) + 1;
                }
                this.reqGetMaterialFile(
                    {
                        fileId: this.activeFileId,
                        typeCode: this.typeCode
                    },
                    false
                );
                this.curPageNum = pageNum;
                this.jumpToNum_temp = 0;
                this.action = `stopAutoSavenum${Date.now()}`;
                console.log(`[${this.curPage}]`, 'emitAutoSave curPageNum', this.curPageNum);
            } else {
                if (
                    canvasNo > Math.floor((this.curPageNum - 1) / this.canvasPageSize) * 10 &&
                    canvasNo <= Math.ceil(this.curPageNum / this.canvasPageSize) * 10
                ) {
                    console.log(`[${this.curPage}]`, 'emitSaveOrRemove');
                    this.reqGetMaterialFile(
                        {
                            fileId: this.activeFileId,
                            typeCode: this.typeCode
                        },
                        false
                    );
                }
            }
        },

        // 设置canvas样式
        emitCanvasStyle(width, height) {
            let rem2px = Number(getComputedStyle(window.document.documentElement)['font-size'].split('px')[0]);
            this.canvasSize.width = width;
            this.canvasSize.height = height;
            this.materialStyleObj = {
                pageBoxStyle: `width:${(width / rem2px).toFixed(2)}rem;`,
                pageStyle: `width:${(width / rem2px).toFixed(2)}rem;height:${(height / rem2px + 0.02).toFixed(
                    2
                )}rem;min-height:0.5rem;`,
                imgStyle: `width:${(width / rem2px).toFixed(2)}rem;height:${(height / rem2px).toFixed(
                    2
                )}rem;min-height:0.5rem;`
            };
            this.canvasStyle = this.materialStyleObj.imgStyle;
        },

        // 子传父 设置 上一步|下一步|清除 样式
        emitActionStep(action, pObj, mObj, nObj) {
            switch (action) {
                case 'clearDraw':
                    // 父组件 空绘图表面进栈
                    this.actionStepObjFather.preDrawAry = [];
                    this.actionStepObjFather.middleAry = [
                        {
                            index: mObj.index,
                            preData: mObj.preData
                        }
                    ];
                    this.actionStepObjFather.nextDrawAry = [];
                    break;
                case 'canvasDown':
                    // 父组件 当前绘图表面
                    this.actionStepObjFather.preDrawAry.push({
                        index: pObj.index,
                        preData: pObj.preData
                    });
                    break;
                case 'canvasUp':
                    // 父组件 当前绘图表面
                    this.actionStepObjFather.middleAry.push({
                        index: mObj.index,
                        preData: mObj.preData
                    });
                    break;
                case 'resetAllArr':
                    // 父组件 当前绘图表面
                    this.actionStepObjFather.middleAry = [];
                    this.actionStepObjFather.middleAry = this.actionStepObjFather.middleAry.concat(
                        this.actionStepObjFather.preDrawAry
                    );
                    this.actionStepObjFather.middleAry.push({
                        index: mObj.index,
                        preData: mObj.preData
                    });
                    this.actionStepObjFather.nextDrawAry = [];
                    break;
            }
            let prevClass = 'i-prev';
            let nextClass = 'i-next';
            let clearClass = 'el-icon-delete';
            if (this.actionStepObjFather.preDrawAry.length) {
                prevClass = 'active i-prev';
            } else {
                prevClass = 'i-prev';
            }
            if (this.actionStepObjFather.nextDrawAry.length) {
                nextClass = 'active i-next';
            } else {
                nextClass = 'i-next';
            }
            if (prevClass === 'active i-prev' || nextClass === 'active i-next') {
                clearClass = 'active el-icon-delete';
            } else {
                clearClass = 'el-icon-delete';
            }
            this.brushOptions.brushControlClass.prevClass = prevClass;
            this.brushOptions.brushControlClass.nextClass = nextClass;
            this.brushOptions.brushControlClass.clearClass = clearClass;
            /* console.log(
                `[${this.curPage}]`,
                'emitActionStep actionStepObjFather',
                this.actionStepObjFather
            ); */
        },
        /* --------------------DrawCanvas-emit事件-结束-------------------- */

        /* --------------------画笔设置-开始-------------------- */
        // 设置画笔颜色
        setBrushColor(color) {
            this.brushOptions.config.lineColor = color;
        },

        // 设置画笔粗细
        setBrushThickness(type) {
            this.brushOptions.config.lineWidth = type;
        },

        // 设置画笔粗细
        setBrushShape(shape) {
            this.brushOptions.config.shape = shape;
        },

        // 画笔操作
        brushControl(action) {
            switch (action) {
                case 'prev':
                    this.activeIndex =
                        this.actionStepObjFather.preDrawAry.length > 0
                            ? this.actionStepObjFather.preDrawAry[this.actionStepObjFather.preDrawAry.length - 1].index
                            : -2;
                    if (this.actionStepObjFather.preDrawAry.length) {
                        this.action = `${action}num${Date.now()}`;
                        // 父组件 当前绘图表面
                        this.actionStepObjFather.preDrawAry.pop(); // 上一步数组 删除最后一步
                        let midDataFather = this.actionStepObjFather.middleAry[
                            this.actionStepObjFather.preDrawAry.length + 1
                        ]; // 中间数组 取上一步数组的最后一步

                        this.actionStepObjFather.nextDrawAry.push(midDataFather); // 下一步数组 加入上一步数组的最后一步
                    }
                    break;
                case 'next':
                    this.activeIndex =
                        this.actionStepObjFather.nextDrawAry.length > 0
                            ? this.actionStepObjFather.nextDrawAry[this.actionStepObjFather.nextDrawAry.length - 1]
                                .index
                            : -2;
                    if (this.actionStepObjFather.nextDrawAry.length) {
                        this.action = `${action}num${Date.now()}`;
                        // 父组件 当前绘图表面
                        this.actionStepObjFather.nextDrawAry.pop(); // 下一步数组 删除最后一步
                        let midDataFather = this.actionStepObjFather.middleAry[
                            this.actionStepObjFather.middleAry.length - this.actionStepObjFather.nextDrawAry.length - 2
                        ]; // 中间数组 取下一步数组的最后一步
                        this.actionStepObjFather.preDrawAry.push(midDataFather); // 上一步数组 加入下一步数组的最后一步
                    }
                    break;
            }
        },
        /* --------------------画笔设置-结束-------------------- */

        /* --------------------下方操作区-开始-------------------- */
        // 禁止批注时鼠标移动选择事件
        handleSelectStart(event) {
            console.log(`[${this.curPage}]`, 'handleSelectStart', event);
            if (this.isWrite) {
                if (window.event.preventDefault) {
                    window.event.preventDefault();
                } else {
                    event.returnValue = true;
                }
            }
        },

        // 材料区滚动时当前页显示
        handleScroll() {
            if (this.$refs.material && this.curFile && this.curFile.pngSize > 0) {
                let scrollTop = Math.ceil(this.$refs.material.scrollTop);
                let materialH = this.$refs.material.offsetHeight;
                let pageH = this.$refs.material.children[0].children[0].offsetHeight;
                let maxScrollTop = this.$refs.pageBox.offsetHeight - materialH;
                /* console.log(
                    `[${this.curPage}]`,
                    'handleScroll scrollTop',
                    scrollTop,
                    'materialH',
                    materialH,
                    'pageH',
                    pageH,
                    'maxScrollTop',
                    maxScrollTop
                ); */
                let pageNum;
                if (scrollTop <= 0) {
                    pageNum = 1;
                } else if (materialH - pageH >= 0) {
                    if (scrollTop < maxScrollTop) {
                        pageNum = Math.round(scrollTop / pageH) + 1;
                    } else { // 针对图片高度很小的情况下，一个materialH会占好几个pageH
                        pageNum = this.jumpToNum_temp > 1 ? this.jumpToNum_temp : this.curFile.pngSize;
                    }
                } else { // 针对图片高度很大的情况下，一个materialH不够放1个pageH
                    pageNum = Math.floor((scrollTop + pageH / 100) / pageH) + 1;
                }
                if (
                    this.actionStepObjFather.preDrawAry.length > 0 &&
                    (pageNum <= Math.floor((this.curPageNum - 1) / this.canvasPageSize) * 10 ||
                        pageNum > Math.ceil(this.curPageNum / this.canvasPageSize) * 10)
                ) {
                    /* console.log(
                        `[${this.curPage}]`,
                        `handleScroll 超出当前页码10页范围 preDrawAry`,
                        this.actionStepObjFather.preDrawAry
                    ); */
                    // 批注状态时，滚动至页码不在当前页码的10页范围内，如当前页码15页，加载的canvas为11至20页的canvas，滚动至至第21页或滚动至10页都不再该范围内应提示保存批注
                    this.scrollTop = scrollTop; // 给this.scrollTop赋值，监听this.scrollTop
                    this.isScrollEnd();
                } else {
                    this.curPageNum = pageNum;
                    this.jumpToNum_temp = 0;
                }
            }
            // console.log(`[${this.curPage}]`, 'handleScroll scrollTop', scrollTop)
        },
       
        // 滚动结束提示批注保存
        isScrollEnd() {
            this.action = `autoSavenum${Date.now()}`;
            console.log(`[${this.curPage}]`, 'isScrollEnd autoSave');
            // don't delete-有批注翻页提示
            /* let materialH = this.$refs.material.offsetHeight;
            // console.log(`[${this.curPage}]`, 'isScrollEnd materialH', materialH);
            let pageH = this.$refs.material.children[0].children[0].offsetHeight;
            let pageNum =
                Math.floor((this.scrollTop + materialH - pageH) / pageH) + 1;
            this.$CusConfirm({
                title: `第${
                    Math.floor((this.curPageNum - 1) / this.canvasPageSize) *
                        10 +
                    1
                }页至第${
                    Math.ceil(this.curPageNum / this.canvasPageSize) * 10
                }页正在批注,点击确定后不会保存,确定继续吗?`,
                cancel: () => {
                    this.scrollToPage(this.curPageNum);
                    this.scrollTop = 0;
                    this.lastScrollTop = 0;
                },
                ok: () => {
                    this.reqGetMaterialFile(
                        {
                            fileId: this.activeFileId,
                            typeCode: this.typeCode
                        },
                        false
                    );
                    this.curPageNum = pageNum;
                }
            }); */
        },

        // 材料区跳转至某页
        scrollToPage(pageNum) {
            this.jumpToNum = null;

            if (!this.comm.IsChkStrNonNegativeInteger(pageNum)) {
                this.$message.error('请输入正确的页码');
                return false;
            }

            if (pageNum <= 0) {
                this.$refs.material.scrollTop = 0; // 兼容ie
                // this.$refs.material.scrollTo(0, 0);//不兼容ie
                return false;
            }

            this.jumpToNum_temp = pageNum;
            let materialH = this.$refs.material.offsetHeight;
            let pageH = this.$refs.material.children[0].children[0].offsetHeight;
            let maxScrollTop = this.$refs.pageBox.offsetHeight - materialH;
            // console.log(`[${this.curPage}]`, 'scrollToPage pageH', pageH);

            if (pageNum > this.curFile.pngSize) {
                this.$refs.material.scrollTop = maxScrollTop;
                this.jumpToNum_temp = 0;
                return false;
            }

            let newScrollTop = pageH * (pageNum - 1);

            if (newScrollTop < maxScrollTop) { // 针对图片高度很小的情况下，一个materialH会占好几个pageH
                this.$refs.material.scrollTop = newScrollTop; // 兼容ie
            } else {
                if (this.$refs.material.scrollTop === maxScrollTop) {
                    this.curPageNum = pageNum;
                    this.jumpToNum_temp = 0;
                } else {
                    this.$refs.material.scrollTop = maxScrollTop;
                }
            }
        },

        /* --------------------操作区-结束-------------------- */
        //点击查看图片
        handleClick(){
            if(this.isWrite){
                return false;
            }
            this.curEvent='click';
            //截图
            this.activeIndex = this.curPageNum - 1;
            
            this.action = `screenshotToSharenum${Date.now()}`; // 传到DrawCanvas页面做监听处理---生成截图
            console.log("click")
        },
        /* --------------------质证操作-开始-------------------- */
        // 质证分享(点击质证分享的时候判断当前是否有质证,是否能发送质证消息)
        proveShareScreenShot:debounce(function() {
            console.log(`[${this.curPage}]`, 'proveShareScreenShot', this.curPageNum);
            let _this = this;
            this.trialId = this.$route.query.trialId;
            this.curEvent='prove';
            // 质证校验(校验当前是否有质证)
            this.proveVerify({ trialId: this.trialId }).then((res) => {
                if (res.code == 0) {
                    // 1生成质证图片
                    _this.activeIndex = this.curPageNum - 1;
                    _this.action = `screenshotToSharenum${Date.now()}`; // 传到DrawCanvas页面做监听处理---生成质证图片
                } else {
                    _this.openNotification('系统提示', res.msg);
                }
            });
        }, 500),

        // canvas中生成质证分享图片后将图片传递过来
        emitScreenshotToShare(screnShoot) {
            if(this.curEvent=='click'){
                //点击查看
                this.$emit('emitClickCheck', screnShoot);
            }
            else{
                // 保存截图返回质证信息存储在vuex,将质证分享的消息发送放在主页面处理
                this.$emit('emitProveShareClick', screnShoot);
            }
            
        },

        // 获取质证历史列表数据
        getProveList() {
            let params = {
                trialId: this.$route.query.trialId
            };
            this.showProveList = !this.showProveList;
            let _this = this;
            this.queryProveList(params)
                .then((res) => {
                    console.log(`[${_this.curPage}]`, 'queryProveList', res);
                    _this.proveListData = res.data;
                })
                .catch((err) => {
                    console.log(`[${_this.curPage}]`, 'queryProveList', err);
                });
        },

        // 查看质证图片
        checkImg(item) {
            this.isProveFile = true;
            let picUrl = item.picUrl.replace(/\\/g, '/');
            // 关闭批注列表
            this.showAnnotationList = false;
            // 重置文件
            this.curFile = {
                fileId: '',
                pngList: [picUrl],
                pngSize: 1,
                pngUrl: '',
                typeCode: null,
                url: ''
            };
            // 重置批注图片
            this.curFileNotationURL = [];
            this.showFile = 1;
            // canvas初始化
            this.action = `initnum${Date.now()}`;
        },

        // 右上方消息推送
        openNotification(title, desc) {
            this.$notification.open({
                message: title,
                description: desc
            });
        },
        /* --------------------质证操作-结束-------------------- */

        /* --------------------工具栏操作-开始-------------------- */
        clickTool(func, item, index) {
            if (this.showFile !== 1) {
                return false;
            }
            this.isWrite = false;
            if (this.activeTool === index && func === 'drawShape') {
                this.activeTool = -1;
            } else {
                this.activeTool = index;
                if (this[func]) {
                    this[func](item);
                }
            }
        },

        drawShape(item) {
            this.brushOptions.config.shape = item.shape;
            this.isWrite = true;
        },

        clearDraw(item) {
            this.$CusConfirm({
                title: `确定清除 第${this.curPageNum}页 的批注吗？`,
                cancel: () => {
                    // console.log('点取消调用');
                    this.$message.info(`取消删除`);
                },
                ok: () => {
                    // console.log('点确定调用');
                    // 父组件 清除 当前绘图表面
                    this.activeIndex = this.curPageNum - 1;
                    let preDrawAry = this.actionStepObjFather.preDrawAry;
                    let nextDrawAry = this.actionStepObjFather.nextDrawAry;
                    let middleAry = this.actionStepObjFather.middleAry;
                    this.actionStepObjFather.preDrawAry = [];
                    this.actionStepObjFather.nextDrawAry = [];
                    this.actionStepObjFather.middleAry = [];
                    preDrawAry.forEach((element, i) => {
                        if (element.index !== this.activeIndex) {
                            this.actionStepObjFather.preDrawAry.push(element);
                        }
                    });
                    console.log(`[${this.curPage}]`, `clearDraw preDrawAry`, this.actionStepObjFather.preDrawAry);
                    nextDrawAry.forEach((element, i) => {
                        if (element.index !== this.activeIndex) {
                            this.actionStepObjFather.nextDrawAry.push(element);
                        }
                    });
                    // console.log(`[${this.curPage}]`, `clearDraw nextDrawAry`, this.actionStepObjFather.nextDrawAry);
                    middleAry.forEach((element, i) => {
                        if (element.index !== this.activeIndex) {
                            this.actionStepObjFather.middleAry.push(element);
                        }
                    });
                    // console.log(`[${this.curPage}]`,`clearDraw middleAry`, this.actionStepObjFather.middleAry);
                    this.action = `clearnum${Date.now()}`;
                }
            });
        },

        scaleBigger(item) {
            let rem2px = Number(getComputedStyle(window.document.documentElement)['font-size'].split('px')[0]);
            let img = this.$refs.pageBox.children[0].children[0];
            let imgW = img.offsetWidth;
            let imgH = img.offsetHeight;
            if (imgW * item.zoom >= item.maxRem * rem2px) {
                return false;
            }
            this.materialStyleObj = {
                pageBoxStyle: `width:${((imgW * item.zoom) / rem2px).toFixed(2)}rem;`,
                pageStyle: `width:${((imgW * item.zoom) / rem2px).toFixed(2)}rem;height:${(
                    (imgH * item.zoom) / rem2px +
                    0.02
                ).toFixed(2)}rem;min-height:0.5rem;`,
                imgStyle: `width:${((imgW * item.zoom) / rem2px).toFixed(2)}rem;height:${((imgH * item.zoom) / rem2px).toFixed(
                    2
                )}rem;min-height:0.5rem;`
            };
            this.canvasStyle = this.materialStyleObj.imgStyle; // 重新设置canvas画布尺寸
            this.canvasSize.width = imgW * item.zoom;
            this.canvasSize.height = imgH * item.zoom;
            this.canvasSize.scale = item.zoom;
            this.action = `fnScalenum${Date.now()}`; // 传到DrawCanvas页面做监听处理
        },

        scaleSmaller(item) {
            let rem2px = Number(getComputedStyle(window.document.documentElement)['font-size'].split('px')[0]);
            let img = this.$refs.pageBox.children[0].children[0];
            let imgW = img.offsetWidth;
            let imgH = img.offsetHeight;
            if (imgW / item.zoom < item.minRem * rem2px) {
                this.canvasSize.scale = 1;
                return false;
            }
            this.materialStyleObj = {
                pageBoxStyle: `width:${(imgW / item.zoom / rem2px).toFixed(2)}rem;`,
                pageStyle: `width:${(imgW / item.zoom / rem2px).toFixed(2)}rem;height:${(imgH / item.zoom / rem2px + 0.02).toFixed(
                    2
                )}rem;min-height:0.5rem;`,
                imgStyle: `width:${(imgW / item.zoom / rem2px).toFixed(2)}rem;height:${(imgH / item.zoom / rem2px).toFixed(
                    2
                )}rem;min-height:0.5rem;`
            };

            this.canvasStyle = this.materialStyleObj.imgStyle; // 重新设置canvas画布尺寸
            this.canvasSize.width = imgW / item.zoom;
            this.canvasSize.height = imgH / item.zoom;
            this.canvasSize.scale = 1 / item.zoom;
            this.action = `fnScalenum${Date.now()}`; // 传到DrawCanvas页面做监听处理
        }
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
