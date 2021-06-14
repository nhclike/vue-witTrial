/* 签名页路由配置 */

// 警务助手页路由
const MsgList = () => import(/* webpackChunkName: "MsgList" */ '@/views/police/MsgList');

export default [
    { // 签名页
        path: '/police',
        name: 'MsgList',
        component: MsgList
    }
];
