/* 签名页路由配置 */

// 签名页路由
const InitiateSignature = () => import(/* webpackChunkName: "InitiateSignature" */ '@/views/home/InitiateSignature');// 发起签名
const WebPlayer = () => import(/* webpackChunkName: "WebPlayer" */ '@/views/home/WebPlayer');// web播放器

export default [
    { // 签名页
        path: '/signature',
        name: 'InitiateSignature',
        component: InitiateSignature
    },
    { // 签名页
        path: '/WebPlayer',
        name: 'WebPlayer',
        component: WebPlayer
    }
];
