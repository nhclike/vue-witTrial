/* canvas涂鸦组件
 * @Author: ShiHuiJun
 * @Date: 2020-04-03 09:40:03
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-07 17:17:00
 */
<template>
    <div class="drawCanvas" :style="canvasStyle">
        <!-- 画板 -->
        <canvas
            ref="canvas"
            :class="{
                canvas: true,
                cursorPen: isWrite && config.shape === 'line',
                cursorEraser: isWrite && config.shape === 'eraser',
                cursorCrosshair:
                    isWrite &&
                    config.shape !== 'line' &&
                    config.shape !== 'eraser'
            }"
            :style="canvasStyle"
            @mousedown="canvasDown($event)"
            @mousemove="canvasMove($event)"
            @mouseup="canvasUp($event)"
            @touchmove="canvasMove($event)"
            @touchstart="canvasDown($event)"
            @touchend="canvasUp($event)"
        ></canvas>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    inject: ['reload', 'userInfo'],
    props: {
        // 批注图片信息列表
        curFileNotationURL: {
            type: Array,
            default: () => []
        },
        // 截图分享的背景图地址
        shareBgUrl: {
            type: String,
            default: ''
        },
        // 当前是第几个canvas
        index: {
            type: Number,
            default: 0
        },
        // 目前动作所涉及的时那个canvas,用于动作相应
        activeIndex: {
            type: Number,
            default: 0
        },
        // 材料id
        fileId: {
            type: String,
            default: ''
        },
        // 类型 1-电子卷宗 2-影音证据
        typeCode: {
            type: Number,
            default: 1
        },
        // canvas样式,用于放大或缩小时尺寸改变
        canvasStyle: {
            default: 'width:6.36rem;min-height:0.5rem'
        },
        // canvas尺寸
        canvasSize: {
            default: {
                width: 960,
                height: 1367,
                scale: 1
            }
        },
        // canvas配置
        config: {
            default: {
                lineWidth: 3,
                lineColor: '#ff0000',
                shadowBlur: 2,
                shape: 'line'
            }
        },
        // 是否可以涂鸦
        isWrite: {
            type: Boolean,
            default: false
        },
        // 是否在可涂鸦区域
        isArea: {
            type: Boolean,
            default: false
        },
        // 鼠标是否已抬起
        isMouseUp: {
            type: Boolean,
            default: false
        },
        // 动作
        action: {
            type: String,
            default: '' // fnScale 放大缩小|prev上一步|next下一步|clear清除
        },
        // 父组件所存储的所有涂鸦信息
        actionStepObjFather: {
            default: {
                preDrawAry: [
                    // {
                    //   index:null,
                    //   preData:preData
                    // }
                ],
                nextDrawAry: [
                    // {
                    //   index:null,
                    //   preData:preData
                    // }
                ],
                middleAry: []
            }
        },
        pagination: {
            default: () => ({
                total: 0,
                curPage: 1,
                pageSize: 10
            })
        }
    },
    data() {
        return {
            curPage: 'DrawCanvas',
            // 批注图片信息
            canvasBgInfo: {
                /* bookScale: null,
                caseId: '11',
                creator: '00c7d8ffae6aa409175879851f7d7f97',
                creatorTime: '2020-09-17 11:47:56',
                fileId: '1301201902010001340001',
                imgData: null,
                imgUrl:
                    '/file/annotate/1/11/00c7d8ffae6aa409175879851f7d7f97/1301201902010001340001/1.png',
                pageNo: '1',
                typeCode: '1' */
            },
            context: {}, // canvas上下文
            canvasMoveUse: false, // 是否处于绘制状态
            // 子组件(当前canvas)所存储的所有涂鸦信息
            actionStepObj: {
                // 存储当前表面状态数组-上一步
                preDrawAry: [],
                // 存储当前表面状态数组-下一步
                nextDrawAry: [],
                // 中间数组
                middleAry: []
            },
            //  鼠标在当前canvas move后的在当前canvas中的位置信息
            canvasPosition: {
                canvasX: 0,
                canvasY: 0
            },
            // 绘制矩形和椭圆时用来保存起始点信息
            beginRec: {
                x: '',
                y: '',
                imageData: ''
            }
        };
    },
    watch: {
        // 监听-操作名称
        action: {
            handler() {
                this.$nextTick(() => {
                    // let _this = this;
                    let action = this.action.split('num')[0];
                    switch (action) {
                        case 'init':
                            this.init();
                            break;
                        case 'fnScale': // 放大或缩小
                            if (this.context.canvas) {
                                this.resetDraw(this.context.canvas.toDataURL(), this.canvasSize.scale);
                                this.context.canvas.width = this.canvasSize.width;
                                this.context.canvas.height = this.canvasSize.height;
                            }
                            break;
                        case 'prev': // 上一步
                            if (
                                (this.activeIndex === this.index || this.activeIndex === -1) &&
                                this.actionStepObj.preDrawAry.length
                            ) {
                                // popData当前绘图表面
                                const popData = this.actionStepObj.preDrawAry.pop(); // 上一步数组 删除最后一步
                                const midData = this.actionStepObj.middleAry[this.actionStepObj.preDrawAry.length + 1]; // 中间数组 取上一步数组的最后一步
                                this.actionStepObj.nextDrawAry.push(midData); // 下一步数组 加入上一步数组的最后一步
                                this.context.putImageData(popData, 0, 0);
                                this.$emit('emitActionStep', 'prev');
                                /* console.log(
                                    `[${this.curPage}]`,
                                    `prev action 第${this.index + 1}页`,
                                    this.actionStepObj
                                ); */
                            }
                            break;
                        case 'next': // 下一步
                            if (
                                (this.activeIndex === this.index || this.activeIndex === -1) &&
                                this.actionStepObj.nextDrawAry.length
                            ) {
                                // 子组件 当前绘图表面
                                const popData = this.actionStepObj.nextDrawAry.pop(); // 下一步数组 删除最后一步
                                const midData = this.actionStepObj.middleAry[
                                    this.actionStepObj.middleAry.length - this.actionStepObj.nextDrawAry.length - 2
                                ]; // 中间数组 取下一步数组的最后一步
                                this.actionStepObj.preDrawAry.push(midData); // 上一步数组 加入下一步数组的最后一步
                                this.context.putImageData(popData, 0, 0);
                                this.$emit('emitActionStep', 'next');
                                /* console.log(
                                    `[${this.curPage}]`,
                                    `next action 第${this.index + 1}页`,
                                    this.actionStepObj
                                ); */
                            }
                            break;
                        case 'clear': // 清除
                            if (String(this.activeIndex) === String(this.index)) {
                                this.removeDraw();
                            }
                            break;
                        case 'save': // 保存
                            this.saveDraw(false, false);
                            break;
                        case 'autoSave': // 自动保存
                            this.saveDraw(true, false);
                            break;
                        case 'stopAutoSave': // 关闭自动保存
                            this.saveDraw(true, true);
                            break;
                        case 'screenshotToShare': // 截图分享
                            if (String(this.activeIndex) === String(this.index)) {
                                this.getScreenshot();
                            }
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        // this.initDraw();
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions({
            saveAnnotate: 'moduleJudge/saveAnnotate',
            deleteAnnotate: 'moduleJudge/deleteAnnotate'
        }),

        init() {
            this.getCanvasBgInfo(); // 获取批注信息
        },

        // 获取批注信息
        getCanvasBgInfo() {
            this.canvasBgInfo = {};
            // 匹配当前页的批注图片信息
            for (let row of this.curFileNotationURL.values()) {
                if (String(row.pageNo) === String(this.index + 1)) {
                    this.canvasBgInfo = row;
                    break;
                }
            }
            this.initDraw(); // 初始化 画板
        },

        // 初始化 画板
        initDraw() {
            // console.log(`[${this.curPage}]`,'initDraw');
            // 设置画笔样式
            this.setCanvasBrush();
            // 初始化 canvas样式
            let img = this.$refs.canvas.parentNode.parentNode.children[0];
            let width = img.offsetWidth;
            // let height = img.offsetHeight;
            // console.log(`[${this.curPage}]`,'initDraw imgH', height);
            let _this = this;
            let imgObject = new Image();
            imgObject.crossOrigin = 'Anonymous';
            imgObject.onload = function() {
                console.log(`[${_this.curPage}]`, 'initDraw shareBgUrl Loaded');
                let height = (width * this.height) / this.width;
                // 存储当前canvas宽高
                _this.$emit('emitCanvasStyle', width, height);
                // 初始化canvas
                _this.initCanvas();
            };
            imgObject.onerror = () => {
                // 存储当前canvas宽高
                _this.$emit('emitCanvasStyle', width, 800);
            };
            imgObject.src = this.shareBgUrl;
        },

        // 初始化canvas
        initCanvas(width, height) {
            // console.log(`[${this.curPage}]`,'initCanvas');
            let canvas = this.$refs.canvas;
            if (!canvas) {
                return false;
            }
            this.context = canvas.getContext('2d');
            this.context.canvas.width = this.canvasSize.width;
            this.context.canvas.height = this.canvasSize.height;
            // 清除画布
            this.clearDraw();
            // 获取到批注图片，重置绘制信息
            if (this.canvasBgInfo.imgUrl) {
                let bookScale = this.canvasBgInfo.bookScale || this.context.canvas.width;
                let scale = this.context.canvas.width / bookScale;
                // 解决canvas跨域问题
                let url = `${__API__}/trial${this.canvasBgInfo.imgUrl}?t=${new Date().getTime()}`;
                // console.log(`[${this.curPage}]`,'initCanvas 批注url', url);
                // 重新绘制
                this.resetDraw(url, scale);
            }
        },

        // 设置画笔样式
        setCanvasBrush() {
            this.context.lineWidth = this.config.lineWidth;
            this.context.shadowBlur = this.config.shadowBlur;
            this.context.strokeStyle = this.config.lineColor;
        },

        // 重新绘制
        resetDraw(src, scale) {
            console.log(`[${this.curPage}]`, 'resetDraw');
            let _this = this;
            let imgObject = new Image();
            imgObject.onload = function() {
                _this.context.save();
                _this.context.clearRect(0, 0, _this.context.canvas.width, _this.context.canvas.height);
                _this.context.scale(scale, scale);
                _this.context.drawImage(imgObject, 0, 0);
                _this.context.restore();
            };
            // imgObject.onerror=function(){alert("error!")};
            // let url=src.replace(/\\/g,"/");
            imgObject.src = src;
        },

        // 清除绘制信息
        clearDraw() {
            // console.log(`[${this.curPage}]`,'clearDraw');
            // 清除 当前绘图表面
            this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); // 清除指定的矩形区域，然后这块区域会变的完全透明
            // 获取当前绘制信息
            let preData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
            this.actionStepObj.preDrawAry = [];
            this.actionStepObj.middleAry = [preData]; // 空绘图表面进栈
            this.actionStepObj.nextDrawAry = [];
            // 子传父
            this.$emit('emitActionStep', 'clearDraw', {}, { index: -1, preData: preData }, {});
        },

        // 保存绘制信息
        saveDraw(isAuto, isStop) {
            if (isStop) {
                return false;
            }
            // console.log(`[${this.curPage}]`,'saveDraw');
            if (this.actionStepObj.preDrawAry.length > 0) {
                let src = this.$refs.canvas.toDataURL('image/png');
                let params = {
                    fileId: this.fileId,
                    pageNo: this.index + 1,
                    imgData: src,
                    creator: this.userInfo().id,
                    typeCode: this.typeCode,
                    caseId: this.$route.query.trialId,
                    bookScale: this.context.canvas.width
                };
                this.reqSaveAnnotate(params);
            }
            // console.log(`[${this.curPage}]`,'saveDraw pagination', this.pagination);
            if (this.pagination.total < this.pagination.pageSize) {
                // 页码总数小于每页数量
                if (this.index + 1 === this.pagination.total) {
                    this.$emit('emitReloadNotation', this.index + 1, isAuto);
                }
            } else {
                // 页码总数大于等于每页数量
                let max = Math.floor((this.index + 1) / this.pagination.pageSize) * 10; // 如保存第11至20页，当index为19时级第20页时，max为20
                // console.log(`[${this.curPage}]`,'saveDraw max', max);
                if (this.index + 1 === max || this.index + 1 === this.pagination.total) {
                    this.$emit('emitReloadNotation', this.index + 1, isAuto);
                }
            }
        },

        // 接口-保存批注
        async reqSaveAnnotate(params) {
            await this.saveAnnotate(params).then((res) => {
                // console.log(`[${this.curPage}]`,'saveAnnotate', res);
                if (res.code === 0) {
                    this.$message.success(`第${this.index + 1}页批注保存成功!`);
                }
                return res;
            });
        },

        // 删除绘制信息
        removeDraw() {
            // console.log(`[${this.curPage}]`,'removeDraw');
            this.clearDraw();
            if (this.canvasBgInfo.pageNo) {
                let params = {
                    fileId: this.fileId,
                    pageNo: this.index + 1,
                    creator: this.userInfo().id,
                    typeCode: this.typeCode,
                    caseId: this.$route.query.trialId
                };
                this.reqDeleteAnnotate(params);
            } else {
                this.initDraw();
            }
        },

        // 接口-删除批注
        reqDeleteAnnotate(params) {
            this.deleteAnnotate(params).then((res) => {
                // console.log(`[${this.curPage}]`,'deleteAnnotate', res);
                if (res.code === 0) {
                    this.$emit('emitReloadNotation', this.index + 1);
                    this.$message.success(`第${this.index + 1}页批注清除成功!`);
                } else {
                    this.$message.error(`第${this.index + 1}页批注清除失败!`);
                }
            });
        },

        /* --------------------canvas鼠标监听-开始-------------------- */

        // canvas区域 mousedown 用于画笔组表移动以及上一步数据存储
        canvasDown(e) {
            if (!this.context.canvas) {
                return false;
            }
            if (this.isWrite) {
                // console.log(`[${this.curPage}]`,'canvasDown');
                this.$emit('emitDrawStatus', true, false);
                this.canvasMoveUse = true;
                // client是基于整个页面的坐标,offset是cavas距离顶部以及左边的距离
                let canvasX = this.getCanvasPosition().canvasX;
                let canvasY = this.getCanvasPosition().canvasY;
                let preData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height); // 当前绘图表面状态
                this.actionStepObj.preDrawAry.push(preData); // 当前绘图表面进栈
                this.$emit('emitActionStep', 'canvasDown', { index: this.index, preData: preData }, {}, {});
                // 存储本次绘制坐标信息
                // 记录起始点和起始状态
                this.beginRec.x = canvasX;
                this.beginRec.y = canvasY;
                this.beginRec.imageData = preData;
                this.canvasPosition.canvasX = canvasX;
                this.canvasPosition.canvasY = canvasY;
            }
        },

        // canvas区域 mousemove 用于画笔线条绘制
        canvasMove(e) {
            if (!this.isWrite) {
                return false;
            }
            // client是基于整个页面的坐标,offset是cavas距离顶部以及左边的距离
            let canvasX = this.getCanvasPosition().canvasX;
            let canvasY = this.getCanvasPosition().canvasY;
            if (this.canvasMoveUse && this.isArea && !this.isMouseUp) {
                // console.log(`[${this.curPage}]`,'canvasMove');
                this.setCanvasBrush();
                let width = canvasX - this.beginRec.x;
                let height = canvasY - this.beginRec.y;
                let a = (canvasX - this.beginRec.x) / 2;
                let b = (canvasY - this.beginRec.y) / 2;
                switch (this.config.shape) {
                    case 'line':
                        // 清除子路径
                        this.context.beginPath();
                        this.context.moveTo(this.canvasPosition.canvasX, this.canvasPosition.canvasY); // 把画笔移动到指定的坐标(x, y)。相当于设置路径的起始点坐标。
                        // console.log(`[${this.curPage}]`,'canvasMove line moveTo', canvasX, canvasY);
                        this.context.lineTo(canvasX, canvasY); // 添加一个新点，然后在画布中创建从该点到最后指定点的线条
                        this.context.closePath();
                        this.context.stroke(); // 通过线条来绘制图形轮廓
                        this.canvasPosition.canvasX = canvasX;
                        this.canvasPosition.canvasY = canvasY;
                        break;
                    case 'rect':
                        // 绘制矩形时恢复起始点状态再重新绘制
                        this.context.putImageData(this.beginRec.imageData, 0, 0);
                        // 清除子路径
                        this.context.beginPath();
                        this.context.rect(this.beginRec.x, this.beginRec.y, width, height);
                        // this.context.closePath();
                        // this.context.fillStyle = 'rgba(255,255,255,1)';
                        // this.context.fill();
                        this.context.stroke(); // 通过线条来绘制图形轮廓
                        break;
                    case 'circle':
                        // 绘制椭圆时恢复起始点状态再重新绘制
                        this.context.putImageData(this.beginRec.imageData, 0, 0);
                        this.context.beginPath();
                        this.drawEllipse(
                            this.context,
                            this.beginRec.x + a,
                            this.beginRec.y + b,
                            a > 0 ? a : -a,
                            b > 0 ? b : -b
                        );
                        break;
                    case 'eraser':
                        // globalCompositeOperation 属性设置或返回如何将一个源（新的）图像绘制到目标（已有）的图像上。 source-over 默认,在目标图像上显示源图像; destination-out 在源图像外显示目标图像。只有源图像外的目标图像部分会被显示，源图像是透明的。
                        this.context.globalCompositeOperation = 'destination-out';
                        this.context.beginPath();
                        this.context.arc(canvasX, canvasY, 10, 0, Math.PI * 2);
                        this.context.fill();
                        this.context.globalCompositeOperation = 'source-over';
                        this.canvasPosition.canvasX = canvasX;
                        this.canvasPosition.canvasY = canvasY;
                        break;
                        // don't delete-框选型马赛克
                    /* case 'mosaic':
                        // 绘制矩形时恢复起始点状态再重新绘制
                        this.context.putImageData(this.beginRec.imageData, 0, 0);
                        // 清除子路径
                        this.context.beginPath();
                        this.context.rect(this.beginRec.x, this.beginRec.y, width, height);
                        // this.context.closePath();
                        this.context.fillStyle = 'rgba(255,255,255,1)';
                        this.context.fill();
                        // this.context.stroke(); // 通过线条来绘制图形轮廓
                        break; */
                    case 'mosaic':
                        // globalCompositeOperation 属性设置或返回如何将一个源（新的）图像绘制到目标（已有）的图像上。 source-over 默认,在目标图像上显示源图像; destination-out 在源图像外显示目标图像。只有源图像外的目标图像部分会被显示，源图像是透明的。
                        this.context.globalCompositeOperation = 'source-over';
                        this.context.beginPath();
                        this.context.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
                        this.context.fillStyle = 'rgba(102,102,102,1)';
                        this.context.fill();
                        this.context.globalCompositeOperation = 'source-over';
                        this.canvasPosition.canvasX = canvasX;
                        this.canvasPosition.canvasY = canvasY;
                        break;
                }
            }
        },

        // canvas区域 mouseup 主要用于存储绘图数据
        canvasUp(e) {
            if (!this.context.canvas) {
                return false;
            }
            if (this.isWrite) {
                // console.log(`[${this.curPage}]`,'canvasUp');
                this.setActionStepObj();
                this.canvasMoveUse = false;
            }
        },

        // 绘制椭圆
        drawEllipse(context, x, y, a, b) {
            context.save();
            let r = a > b ? a : b;
            let ratioX = a / r;
            let ratioY = b / r;
            context.scale(ratioX, ratioY);
            context.beginPath();
            context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false);
            this.context.stroke(); // 通过线条来绘制图形轮廓
            context.closePath();
            context.restore();
        },

        // 保存操作步骤
        setActionStepObj() {
            const preData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height); // 返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据
            if (!this.actionStepObj.nextDrawAry.length) {
                // 在没有撤销过的情况下，将当前数据放入prev
                this.actionStepObj.middleAry.push(preData); // 当前绘图表面进栈
                this.$emit('emitActionStep', 'canvasUp', {}, { index: this.index, preData: preData }, {});
            } else {
                // 在撤销过的情况下，将在后面步骤的数据情况记录
                this.actionStepObj.middleAry = [];
                this.actionStepObj.middleAry = this.actionStepObj.middleAry.concat(this.actionStepObj.preDrawAry);
                this.actionStepObj.middleAry.push(preData); // 当前绘图表面进栈
                this.actionStepObj.nextDrawAry = [];
                this.$emit('emitActionStep', 'resetAllArr', {}, { index: this.index, preData: preData }, {});
            }
        },

        // 是否是PC
        isPc() {
            let userAgentInfo = navigator.userAgent;
            let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
            let flag = true;
            for (let v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        },

        // 获取鼠标在canvas 中位置
        getCanvasPosition() {
            // let position = {};
            let touch = event.touches&&event.touches.length===1? event.touches[0] :event; // 检测触摸屏设备
            let material =
                touch.target.parentNode.parentNode.parentNode.parentNode ||
                this.$refs.canvas.parentNode.parentNode.parentNode.parentNode;
            let page = touch.target.parentNode.parentNode || this.$refs.material.children[0].children[0];
                        let rectObject = page.getBoundingClientRect();

            let scrollTop = material.scrollTop;
            let scrollLeft = material.scrollLeft;
            // console.log(`[${this.curPage}]`,'getCanvasPosition scrollTop', scrollTop, 'pageY', touch.pageY, 'scrollLeft', scrollLeft, 'pageX', touch.pageX, 'materialTop', this.getOffset(material).top, 'pageH', page.offsetHeight);
            let canvasPosition = {
                canvasX: touch.pageX - this.getOffset(material).left + scrollLeft,
                canvasY: touch.pageY -rectObject.top
            };
            return canvasPosition;
        },

        // 获取当前元素距离body元素的距离
        getOffset(Node, offset) {
            if (!offset) {
                offset = {};
                offset.top = 0;
                offset.left = 0;
            }
            if (Node == document.body) {
                // 当该节点为body节点时，结束递归
                return offset;
            }
            offset.top += Node.offsetTop;
            offset.left += Node.offsetLeft;
            return this.getOffset(Node.offsetParent, offset); // 向上累加offset里的值
        },

        /* --------------------canvas鼠标监听-结束-------------------- */

        // 获取截图图片
        getScreenshot() {
            if (this.activeIndex === this.index) {
                let canvasNew = document.createElement('canvas');
                let contextNew = canvasNew.getContext('2d');
                contextNew.canvas.width = 1654;
                contextNew.canvas.height = 2339;
                let _this = this;
                let imgsrcArray = [this.shareBgUrl, this.$refs.canvas.toDataURL('image/png')];
                let imglen = imgsrcArray.length;
                // eslint-disable-next-line no-unused-vars
                let drawimg = (function f(n) {
                    if (n < imglen) {
                        let img = new Image();
                        img.crossOrigin = 'Anonymous'; // 解决跨域问题
                        img.onload = function() {
                            contextNew.drawImage(img, 0, 0, contextNew.canvas.width, contextNew.canvas.height);
                            f(n + 1);
                        };
                        img.src = imgsrcArray[n];
                    } else {
                        let screnShoot = canvasNew.toDataURL('image/png');
                        _this.$emit('emitScreenshotToShare', screnShoot);
                    }
                })(0);
            }
        }
    }
};
</script>
<style lang="less">
.drawCanvas {
    position: absolute;
    top: 0;
    left: 0;
}
.cursorCrosshair {
    cursor: crosshair;
}
.cursorPen {
    cursor: url('/images/icon/mouse_pen.ico'), crosshair;
}
.cursorEraser {
    cursor: url('/images/icon/mouse_eraser.ico'), default;
}
</style>
