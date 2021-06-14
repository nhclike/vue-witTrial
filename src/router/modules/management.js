/* 路由管理 */
import {
    // BasicLayout,
    RouteView
} from '@/layouts';
const JudgeIndex = () => import(/* webpackChunkName: "JudgeIndex" */ '@/views/judge/Index');// 今日庭审

const WorkBench = () => import(/* webpackChunkName: "WorkBench" */ '@/views/judge/workBench/WorkBench');

const CaseScheduling = () =>
    import(/* webpackChunkName: "CaseScheduling" */ '@/views/judge/workBench/case/CaseScheduling');

const CaseManagement = () =>
    import(/* webpackChunkName: "CaseManagement" */ '@/views/judge/workBench/case/CaseManagement');

const PermissionManagement = () =>
    import(/* webpackChunkName: "PermissionManagement" */ '@/views/judge/workBench/system/permission/PermissionManagement'); // 权限页面

const RoleManagement = () =>
    import(/* webpackChunkName: "RoleManagement" */ '@/views/judge/workBench/system/role/RoleManagement'); // 角色页面

const UserMangement = () =>
    import(/* webpackChunkName: "UserMangement" */ '@/views/judge/workBench/system/user/UserMangement'); // 用户管理

const CourtRoomManagement = () =>
    import(/* webpackChunkName: "CourtRoomManagement" */ '@/views/judge/workBench/system/courtRoom/CourtRoomManagement'); // 法庭页面

const CourtRoomConfig = () =>
    import(/* webpackChunkName: "CourtRoomConfig" */ '@/views/judge/workBench/system/courtRoom/DeviceConfig'); // 法庭设备页面

const TrialManagement = () =>
    import(/* webpackChunkName: "TrialManagement" */ '@/views/judge/workBench/trial/TrialManagement'); // 庭审管理页面

const HistoryTrial = () => import(/* webpackChunkName: "HistoryTrial" */ '@/views/judge/workBench/trial/HistoryTrial'); // 历史庭审

const SystemConfig = () =>
    import(/* webpackChunkName: "SystemConfig" */ '@/views/judge/workBench/system/systemConfig/SystemConfig'); // 系统配置页面

const DataDict = () =>
    import(/* webpackChunkName: "DataDict" */ '@/views/judge/workBench/system/dict/DataDict'); // 数据字典页面

const TrialLiving = () => import(/* webpackChunkName: "TrialLiving" */ '@/views/judge/TrialLiving'); // 庭审直播

export default [
    {
        path: '/main',
        name: 'main',
        component: RouteView,
        meta: {
            requireAuth: true // 添加该字段，表示进入这个路由是需要登录的
        },
        children: [
            {
                path: 'judge',
                component: RouteView,
                redirect: 'judge/index',
                children: [
                    {
                        path: 'index',
                        name: 'index',
                        component: JudgeIndex
                    },
                    {
                        path: 'workbench',
                        name: 'workbench',
                        component: WorkBench,
                        redirect: 'workbench/trial',
                        children: [
                            // {
                            //     path: 'error',
                            //     meta: {
                            //         title: '页面不存在',
                            //         requiresAuth: false
                            //     },
                            //     name: 'error',
                            //     component: () =>
                            //     import(/* webpackChunkName: "Error" */ '@/components/common/Error')
                            // },
                            {
                                path: 'system',
                                name: 'system',
                                component: RouteView,
                                redirect: 'system/userMangement',
                                children: [
                                    {
                                        path: 'permissionManagement',
                                        name: 'permissionManagement',
                                        component: PermissionManagement
                                    },
                                    {
                                        path: 'roleManagement',
                                        name: 'roleManagement',
                                        component: RoleManagement
                                    },
                                    {
                                        path: 'userMangement',
                                        name: 'userMangement',
                                        component: UserMangement
                                    },
                                    {
                                        path: 'courtRoomManagement',
                                        name: 'courtRoomManagement',
                                        component: CourtRoomManagement
                                    },
                                    {
                                        path: 'courtRoomConfig',
                                        name: 'courtRoomConfig',
                                        component: CourtRoomConfig
                                    },
                                    {
                                        path: 'dataDict',
                                        name: 'dataDict',
                                        component: DataDict
                                    },
                                    {
                                        path: 'systemConfig',
                                        name: 'systemConfig',
                                        component: SystemConfig
                                    }
                                ]
                            },
                            {
                                path: 'case',
                                name: 'case',
                                component: RouteView,
                                redirect: 'case/caseManagement',
                                children: [
                                    {
                                        path: 'caseManagement',
                                        name: 'caseManagement',
                                        component: CaseManagement
                                    },
                                    {
                                        path: 'caseScheduling',
                                        name: 'caseScheduling',
                                        component: CaseScheduling
                                    }
                                ]
                            },
                            {
                                path: 'trial',
                                name: 'trial',
                                component: RouteView,
                                redirect: 'trial/trialManagement',
                                children: [
                                    {
                                        path: 'trialManagement',
                                        name: 'trialManagement',
                                        component: TrialManagement
                                    },
                                    {
                                        path: 'historyTrial',
                                        name: 'historyTrial',
                                        component: HistoryTrial
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: 'trialliving',
                        name: 'trialliving',
                        component: TrialLiving
                        // redirect: 'trialliving/index'
                    }
                ]
            }
        ]
    }
];
