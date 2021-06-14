/*笔录签名
 * @Author: nihc
 * @Date: 2020-09-25 17:04:10
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-18 15:45:34
 */

<template>
    <div class="main-content">
<!--        <div class="btns">-->
<!--            <button ref="" :disabled="mode === 1" class="ant-btn ant-btn-primary btn-big" type="button"-->
<!--                    @click="switchMode(1)">-->
<!--                当事人签名-->
<!--            </button>-->
<!--            &nbsp; &nbsp; &nbsp;-->
<!--            <button ref="" :disabled="mode === 0"-->
<!--                    class="ant-btn ant-btn-primary btn-big" type="button"-->
<!--                    @click="switchMode(0)">-->
<!--                法官签名-->
<!--            </button>-->
<!--        </div>-->
        <!--笔录签名-->
        <div class="sign">
            <div class="sign-tip">签名区域</div>
            <div class="sign-area">
                <div class="sign-object" ref="signObject">
                    <object id="HWPenSign"
                            name="HWPenSign"
                            classid="clsid:62A72563-6CB4-4192-99CE-7F7418A36023"
                            width="100%"
                            height="100%"
                    >
                    </object>
                </div>
                <div class="sign-operate">
                    <button id="clear" ref="clear" class="ant-btn ant-btn-primary btn-big" type="button" @click="clearSign">
                        清除签名
                    </button>
                    &nbsp; &nbsp; &nbsp;
                    <button id="signature" v-if="mode === 0 || mode === 1" ref="signature" :disabled="btnDisabled"
                            class="ant-btn ant-btn-primary btn-big" type="button" @click="signature">
                        确认签名
                    </button>
                    &nbsp; &nbsp; &nbsp;
                    <button id="fingerprint" v-if="mode === 1 || mode === 2" ref="fingerprint" :disabled="!btnDisabled"
                            class="ant-btn ant-btn-primary btn-big" type="button" @click="fingerprint">
                        确认指纹
                    </button>
                </div>
            </div>
            <div id="" class="operate-tips" ref="operateTips">{{ tips }}</div>
        </div>
    </div>
</template>

<script>

import { mapActions } from 'vuex';
export default {
    name: 'InitiateSignature',
    data() {
        return {
            HWObj: null,  // 签名控件对象
            signStatus: false,  // 签名确认状态
            btnDisabled: false, // 按钮状态 false 可确认签名 不可确认指纹
            mode: 1, // 签名模式
            tips: '请在签名区域签名,完成后点击确认!'
        };
    },
    created() {
        this.mode = Number(this.$route.query.mode);
        window.addEventListener('beforeunload', this.closeDevice, false);
    },
    mounted() {
        let _this = this;
        _this.init();
    },
    destroyed() {
        window.removeEventListener('beforeunload', this.closeDevice, false);
    },
    methods: {
        // 接口引入
        ...mapActions('moduleJudge', ['uploadSignPic']),
        init() {
            this.HWObj = document.getElementById('HWPenSign');
            this.HWObj.HWSetBkColor(0xE0F8E0);   // 设置签名区域背景颜色,不设置默认白色
            this.HWObj.HWSetCtlFrame(2, 0x000000); // 设置签名区域边框宽度和颜色 参数1:边框宽度 参数2:边框颜色,不设置默认白色
            this.startHWDevice(); // 打开设备
        },
        // 切换签名模式
        switchMode(mode) {
            this.mode = mode;
            if(this.HWObj) {
                this.HWObj.HWCloseDevice();  // 手写模块卸载
                this.startHWDevice(); // 打开设备
            }
        },
        startHWDevice() {
            // 注册页面按钮，当手写笔点击至按钮上时，可触发对应的JS函数
            // 在vue项目中无效
            this.HWObj.HWRegisterJSButtonCall(3, 'clear;signature;fingerprint;', 'clearSign;signature;fingerprint;');
            //            this.HWObj.HWShowMonitor(300, 300, 800, 600);  // 在主屏显示监视窗口。调用此函数后，在主显示器的参数指定位置会弹出窗口同步显示手写屏上的内容
            this.HWObj.HWSetFingerEnable(this.mode);  // 设置采集模式  0:只手写签名 1. 先手写后采集指纹  2. 只采集指纹
            this.HWObj.HWSetPenWidth(3);  // 设置笔宽默认3,取值范围(1-5)

            // 手写模块初始化
            let res = this.HWObj.HWOpenDevice();
            if (res !== 0) {
                alert('打开设备失败，错误码为：' + res);
            } else {
                // 切到扩展屏显示 -- 汉王手写屏
                this.HWObj.HWSwitchMonitor(1, 1);
                this.HWObj.HWMouseEnable(1);
            }
        },
        // 清除笔迹
        clearSign() {
            this.HWObj.HWClearPenSign();
            this.tips = '请在签名区域签名,完成后点击确认!';
            this.btnDisabled = false;
        },
        // 确认签名
        signature() {
            let check_res = this.checkSign();
            if (check_res !== -5) {
                // 设置指纹采集超时时间
                this.HWObj.HWSetCapFingerTimeOut(60 * 60 * 8);
                if(this.mode === 1) {
                    // 开启指纹采集
                    this.HWObj.HWCapFinger();
                    this.tips = '签名成功,请录入指纹后点击确认!';
                    this.btnDisabled = true;
                } else {
                    this.fingerprint();
                }
            }
        },
        // 确认指纹
        fingerprint() {
            let check_res = this.checkSign();
            if (check_res === 1) {
                let stream = this.HWObj.HWGetBase64ForCroppedImg(2);
                this.uploadBase64File(stream);// 向服务器发送签名图片的base64数据流
                this.clearSign();
                //                this.HWObj.HWCloseDevice();  //手写模块卸载
                this.btnDisabled = false;
            } else {
                this.tips = '指纹数据获取失败!';
            }
        },
        // 是否符合签名规则
        checkSign() {
            let res = this.HWObj.HWIsNeedSave(); // 判断是否有需要保持的笔迹
            if (res === -5) {  // -5  没有签名笔迹存在
                this.tips = '获取签名失败,请先签名!';
                return res;
            }
            if (res === -10) { // -10  没有指纹图片
                this.tips = '未获取到指纹,请先录入指纹!';
                return res;
            }
            if (res === 1) {
                //                this.HWObj.HWMouseEnable(0);
                this.tips = '请在签名区域签名,完成后点击确认!';
            }
            return res;
        },
        // 上传签名图片
        uploadBase64File(base64Data) {
            let params = {
                trialId: this.$route.query.trialId,
                picBase64: base64Data
            };
            this.uploadSignPic(params).then((res) => {
                if (res.code !== 0) {
                    this.$message.error('上传签名图片失败，请重试！');
                }
            });
        },
        // 关闭设备
        closeDevice() {
            this.HWObj.HWMouseEnable(0);
            this.HWObj.HWSwitchMonitor(0, 0);// 切换到主显示器显示
            this.HWObj.HWCloseDevice();  // 手写模块卸载
        }
    }
};

</script>

<style lang="less" scoped type="text/less">
    @label-width: 170px;
    @tip-height: 100px;
.main-content {
    height: 100%;
    padding: 30px 0 30px 30px;
    font-size: @font26px;
    letter-spacing: 2px;
    .sign{
        width: 100%;
        margin: 0 auto;
        height: 100%;
        //height: calc(100% - 200px);
        .sign-tip {
            width: @label-width;
            float: left;
            font-size: 40px;
        }
        .sign-area {
            margin-left: @label-width;
            height: calc(100% - @tip-height);
            .sign-object {
                float: left;
                width: calc(100% - 300px);
                height: 100%;
            }
            .sign-operate {
                float: left;
                width: 300px;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                button {
                    display: block;
                }
            }
        }
        .operate-tips {
            margin: 10px 0 0 @label-width;
            color: #ff0000;
            font-size: 40px;
            height: @tip-height;
        }
    }
    button.btn-big {
        width: 250px;
        height: 150px;
        font-size: 48px;
        margin: 20px auto;
        border-radius: 3px;
        &[disabled] {
            background-color: #909399;
            color: #fff;
        }
    }
}
</style>
