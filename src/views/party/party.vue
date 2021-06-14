/* 当事人登录主页
 * @Author: nihc
 * @Date: 2020-11-25 17:36:20
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-08 15:39:03
 */
<template>
    <div class="login">
        <!-- <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>

        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view> -->
        <router-view ref="partyRouter"></router-view>

    </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
// eslint-disable-next-line no-unused-vars
import {stompClient, disconnectSocket, connectSocket,  startSubscribeFn, sendMsgFn,  cancelSubscribeFn} from '@/utils/SocketJS';

import { requestFullScreen, isIE, getCpu, getDisk, IsF11Fullscreen } from '@/utils/utils.js';
export default {
    data() {
        return {
            trialId: '',
            currentUser: {
                id: ''
            },
            dossierView: false,
            signInStatus: false
        };
    },
    inject: ['reload'],
    computed: {
        ...mapGetters({
            peoplekeyGet: 'peoplekeyGet',
            tokenGet: 'tokenGet'
        })
    },
    created() {
        console.log('party----created');
        this.roleMut('party'); // 页面进入就记录入口---否则人脸登录失败会跳转到法官登录页
        //this.getPeopleKey(); // 获取pc设备id
        this.login();
        // 必须先设备登录并且消息监听再进入主页,否则会导致主页获取权限的接口拿到旧的token
        // 从而导致401,再次重定向到partyTrial
    },
    mounted() {
        console.log('party----mounted');
        let isFull = IsF11Fullscreen();
        console.log('isFull' + isFull);
        if (!isFull) {
            // debugger;
            try {
            // this.$message.success("party---mounted全屏!");
                requestFullScreen();

            } catch (error) {
                console.log(error);
            }
        }
        // 刷新取消订阅,跳转不取消订阅
        window.addEventListener('beforeunload', this.handleBeforeUnload, false);
    },
    updated() {
        console.log('party---updated');
    },
    beforeDestroy: function() {
        console.log('party --- beforeDestroy');
        this.handleBeforeUnload();
        window.removeEventListener('beforeunload', this.handleBeforeUnload, false);
    },
    methods: {
        ...mapMutations(['isLoginMut', 'userInfoMut', 'tokenMut', 'roleMut', 'peoplekeyMut', 'clearStateMut']),

        ...mapActions({
            getCurUserInfo: 'moduleLogin/getCurUserInfo',
            peopleIpLogin: 'moduleParty/peopleIpLogin'
        }),
        handleBeforeUnload() {
            console.log('party---handleBeforeUnload');
            // debugger;
            this.socketJSCancelSubscribe(stompClient);

        },
        // getPeopleKey() {
        //     if (this.peoplekeyGet) { // 已经登录过,页面刷新,id从vuex中取,直接登录
        //         console.log(`[Party]`, 'peoplekey load', this.peoplekeyGet);
        //         this.login();
        //     } else if (isIE()) { // vuex已经被注销,或者第一次登录页面,获取id后登录前先处理之前的数据
        //         let cpuInfo = getCpu();
        //         let diskInfo = getDisk();
        //         // console.log(`[App]`, 'cpuInfo', cpuInfo, 'diskInfo', diskInfo);
        //         let value = `CPU:${cpuInfo.ProcessorID}-HD:${diskInfo.SerialNumber}`;
        //         this.peoplekeyMut(value);
        //         console.log(`[Party]`, 'peoplekey get', this.peoplekeyGet);
        //         this.login();
        //     } else {
        //         console.log(`[Party]`, '无法获取peoplekey');
        //         this.$confirm(`浏览器不支持设备绑定，请使用IE浏览器`, '系統提示', {
        //             confirmButtonText: '确定',
        //             cancelButtonText: '取消',
        //             showCancelButton: false,
        //             customClass: 'confirm-success',
        //             type: 'error'
        //         });

        //     }
        // },
        async login() {
            let _this = this;
            let res = await this.peopleIpLogin();
            console.log('peopleIpLogin', res);
            if (res.code == 0) {
                let rdata = res.data;
                // 1存储token
                // 2更新当事人登录状态
                // 3更新角色存储
                // 4建立消息监听
                // 5根据状态跳转
                // 登录后更新token触发App.vue中数据字典及配置的更新
                await _this.tokenMut(rdata.token.token);

                await _this.isLoginMut(1);
                await _this.roleMut('party');
                let userInfoRes = await _this.getCurUserInfo();
                console.log('getCurUserInfo', userInfoRes);
                if (userInfoRes.code == 0) {
                    await _this.userInfoMut(userInfoRes.data);
                    // global.aaa = userInfoRes.data.id;
                }
                // _this.userInfoMut({id: rdata.token.userId});
                _this.trialId = rdata.trial.trialId;
                _this.dossierView = rdata.dossierView;
                _this.currentUser = {
                    id: rdata.token.userId
                };
                _this.signInStatus = rdata.trial.signStatus;
                _this.$nextTick(async () => {
                    console.log('party---tokenGet', this.tokenGet);
                    await _this.initSocketJS();
                });
            } else if (res.code === 10115) {
                this.$router.push('/noAuth');
            } else if (res.code === 10114) {
                this.$router.push('/partyTrial/noTrial');
            } else {
                this.$router.push('/error');
            }
        },
        // 根据签名状态进行跳转
        linkToPage(signStatus) {
            let _this = this;
            console.log('party---linkToPage', this.$route.path);

            if (_this.dossierView) {
                console.log('进入当事人庭审页面---_this.dossierView', _this.dossierView);
                if (this.$route.path != '/partyTrial/index/topicReader') {
                    this.$router.push({
                        path: '/partyTrial/index/topicReader',
                        query: {
                            trialId: _this.trialId
                        }
                    });
                }

            }
            else {
                if (signStatus == 1) { // 0结束签名1发起签名
                    console.log('进入当事人签名页面---signStatus', signStatus);
                    if (this.$route.path != '/partyTrial/signIn') {
                        this.$router.push({
                            path: '/partyTrial/signIn',
                            query: {
                                trialId: _this.trialId
                            }
                        });
                    }

                }
                else if (signStatus == 0) {
                    console.log('进入当事人庭审页面---signStatus', signStatus);
                    if (this.$route.path != '/partyTrial/index/topicReader') {
                        this.$router.push({
                            path: '/partyTrial/index/topicReader',
                            query: {
                                trialId: _this.trialId
                            }
                        });
                    }
                }
            }

        },
        // 取消消息订阅
        socketJSCancelSubscribe(stompClient) {
            if (!stompClient || !stompClient.connected) {
                return false;
            }
            cancelSubscribeFn(101, stompClient);
            cancelSubscribeFn(102, stompClient);
            disconnectSocket(stompClient);
        },
        /** *************************消息通信start***************************/
        async initSocketJS() {
            let _this = this;
            if (stompClient && stompClient.connected) {
                await this.socketJSSubscribeMsg(stompClient);

            }
            else {
                try {
                    let res = await connectSocket(this.tokenGet);
                    console.log('party---stompClient--resolve', res);
                    if (res && res.connected) {
                        await _this.socketJSSubscribeMsg(stompClient);
                    }
                    else {
                        setTimeout(() => {
                            _this.initSocketJS();
                        }, 500);
                    }
                } catch (res) {
                    console.log('party---stompClient-reject', res);
                    // _this.$message.error('通信连接失败,请重新登录!');
                    setTimeout(() => {
                        _this.initSocketJS();
                    }, 500);
                }

            }


        },
        socketJSSubscribeMsg(stompClient) {
            let _this = this;

            startSubscribeFn(`/dossierView/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅法官允许阅卷', data);
                if (data.optType == 1) {
                    console.log('法官允许阅卷');
                    _this.$router.push({
                        path: '/partyTrial/index/topicReader',
                        query: {
                            trialId: _this.trialId
                        }
                    });
                }
            }, {id: 101, token: _this.tokenGet}, stompClient);
            startSubscribeFn(`/signInStatus/${_this.trialId}/${_this.currentUser.id}/message`, function(params) {
                let data = JSON.parse(params.body);
                console.log('订阅法官签到', data);
                if (data.optType == 1) {
                    console.log('法官发起签到');
                    _this.$router.push({
                        path: '/partyTrial/signIn',
                        query: {
                            trialId: _this.trialId
                        }
                    });
                } else if (data.optType == 0) {
                    console.log('法官结束签到');
                    if (_this.$refs.partyRouter.$refs.nbVideo) {
                        _this.$refs.partyRouter.$refs.nbVideo.handleBeforeUnload();

                    }

                    _this.$router.push({
                        path: '/partyTrial/index/topicReader',
                        query: {
                            trialId: _this.trialId
                        }
                    });
                }
            }, {id: 102, token: _this.tokenGet}, stompClient);

            console.log('订阅完成', stompClient);
            // 先订阅party的消息,否则可能会有签名消息监听失败
            _this.linkToPage(_this.signInStatus);
        }
    }
};
</script>

<style scoped lang='less'>
.login {
    width: 100%;
    height: 100%;
    background-color: rgb(228, 231, 237);
}
</style>
