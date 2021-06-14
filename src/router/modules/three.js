/* 庭审主页面-路由管理 */
import {
    ThreePageLayout
    // RouteView
} from '@/layouts';

/* 庭审功能页面 */
// 材料展示
const TopicReader = () => import(/* webpackChunkName: "TopicReader" */ '@/views/home/TopicReaderSimple');

export default [
    {
        path: '/three',  // 庭审主页面
        name: 'three',
        component: ThreePageLayout,
        redirect: '/three/topicReader',
        meta: {
            requireAuth: true  // 添加该字段，表示进入这个路由是需要登录的
        },
        children: [
            {
                path: 'topicReader',
                components: {
                    TopicReader: TopicReader
                 
                }
            }
        ]
    }
];
