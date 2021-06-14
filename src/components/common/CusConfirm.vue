/*带iframe的确认框
 * @Author: nihc
 * @Date: 2020-09-27 11:04:12
 * @Last Modified by: nihc
 * @Last Modified time: 2021-03-03 13:23:05
 */

<template>
    <transition name="fade">
        <div class="cus-confirm-mask" v-if="flag" @click="cancel">
            <div class="cus-confirm" @click.stop>
                <div class="confirm-title">系统提示：</div>
                <div class="confirm-body">{{title}}</div>
                <div class="confirm-btns">
                    <button class="cancel-btn" @click="no">取消</button>
                    <button class="ok-btn" @click="sure">确认</button>
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
            title: '',
            autoClose: false

        };
    },
    watch: {
        autoClose: {
            handler(newVal) {
                if (newVal) {
                    setTimeout(() => {
                        this.flag = false;
                    }, 5000);
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        no() {
            this.flag = false;
            this.cancel();
        },
        sure() {
            this.flag = false;
            this.ok();
        }
    }
};
</script>

<style lang="less" scoped>
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
    .cus-confirm {
        width: 480px;
        height: 260px;
        box-shadow: 0px 10px 30px 0px rgba(0, 0, 0, 0.2);
        position: absolute;
        top: calc(50% - 130px);
        left: calc(50% - 240px);
        border-radius: 12px;
        padding: 15px;
        z-index: 999;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #ffffff;
        .confirm-title {
            font-size: @font28px;
        }
        .confirm-body {
            text-align: center;
            font-size: @font24px;
        }
        .confirm-btns {
            text-align: right;
            button {
                border: 0;
                outline: none;
                padding: 6px 18px;
                border-radius: 6px;
                margin: 0 12px;
                font-size: @font24px;
                cursor: pointer;
            }
            .ok-btn {
                background: @color_primary;
                color: #fff;
            }
            .cancel-btn {
                background: #fff;
                color: #333;
            }
            .ok-btn:active {
                opacity: .7;
            }
            .cancel-btn:active {
                opacity: .7;
            }
        }
    }
}
</style>
