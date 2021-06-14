/* 登录页路由配置 */

// 登录路由
const Login = () => import(/* webpackChunkName: "Login" */ '@/views/login/Login');

// 登录
const JudgeEntry = () => import(/* webpackChunkName: "JudgeEntry" */ '@/views/login/JudgeEntry');
const PartyEntry = () => import(/* webpackChunkName: "PartyEntry" */ '@/views/login/PartyEntry');


export default [
    { // 登录页
        path: '/login',
        component: Login,
        // redirect: 'login/judgeEntry',
        children: [
            { // 登录
                path: 'judgeEntry',
                name: 'judgeEntry',
                component: JudgeEntry
            }
            // { // 当事人登录
            //     path: 'partyEntry',
            //     name: 'partyEntry',
            //     component: PartyEntry
            // }
        ]
    }
];
