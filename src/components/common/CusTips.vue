/*带iframe的提示框
 * @Author: zhangt
 * @Date: 2020-11-05 17:51:12
 * @Last Modified by:   zhangt
 * @Last Modified time: 2020-11-05 17:51:12
 */

<template>
    <transition name="fade">
        <div class="cus-confirm-mask" v-if="flag">
            <div class="box-bg">
                <div class="box-body">
                    <img ref="msgType" class="msgIcon" :src="type == 1 ? imgUrl[0] : imgUrl[1]" alt="">
                    <div class="content-type">提醒</div>
                    <div class="content-msg">{{content}}</div>
                    <div class="footer">
                        <span class="shj-btn--confirm shj-btn--medium" @click="layerBoxClick">确定</span>
                    </div>
                </div>
            </div>
            <iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position: absolute; visibility: inherit; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -1; "></iframe>
        </div>
    </transition>
</template>

<script>
export default {
    data() {
        return {
            flag: false,
            imgUrl: [
                require("../../assets/images/icon/icon-speaker.png"),
                require("./../../assets/images/icon/icon-alarm.png")
            ],
            content: '',
            type: 0,
            autoClose: false
        };
    },
    watch: {
    autoClose: {
        handler(newVal) {
            if (newVal) {
                setTimeout(() => {
                    this.flag = false;
                }, 3000);
            }
        },
        deep: true,
        immediate: true
    }
    },
    methods: {
        layerBoxClick() {
            this.flag = false;
            this.ok();
        }
    }
};
</script>

<style lang="less" type="text/less" scoped>
    @msgBox_width: 600px;
    @msgBox_height: 400px;
// 渐变过渡
.fade-enter,
.fade-leave-active {
    opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.35s;
}
.cus-confirm-mask {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    .box-bg {
        width: @msgBox_width;
        height: @msgBox_height;
        position: absolute;
        top: calc(50% - @msgBox_height / 2);
        left: calc(50% - @msgBox_width / 2);
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 15px #ccc;
        .box-body {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            padding: 20px;
            .msgIcon {
                display: block;
                width: 160px;
                height: 160px;
                position: absolute;
                top: -80px;
                left: 38%;
            }
            .content-type {
                text-align: center;
                font-size: @font34px;
                font-weight: 600;
                margin-top: 40px;
            }
            .content-msg {
                flex: 1;
                font-size: @font28px;
                padding: 20px 30px;
            }
            .footer {
                text-align: center;
            }
        }
    }
}
</style>
