/* 路由管理 */
import {
    // BasicLayout,
    RouteView
} from '@/layouts';
/* 通用 */
export default [
    // 默认页面
    {
        path: '/',
        component: RouteView,
        redirect: '/login',

        children: [
            {
                path: 'error',
                component: () => import(/* webpackChunkName: "Error" */ '@/components/common/Error')
            },
            {
                path: '404',
                component: () => import(/* webpackChunkName: "Error" */ '@/components/common/404')
            },
            {
                path: '500',
                component: () => import(/* webpackChunkName: "Error" */ '@/components/common/500')
            },
            {
                path: 'building',
                component: () => import(/* webpackChunkName: "Error" */ '@/components/common/Building')
            },
            {
                path: 'noAuth',
                component: () => import(/* webpackChunkName: "Error" */ '@/components/common/NoAuth')
            }
        ]

    }
];
