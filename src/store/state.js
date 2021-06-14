export default () =>
    (sessionStorage.getItem('state')
        ? JSON.parse(sessionStorage.getItem('state'))
        : {
            isLogin: sessionStorage.getItem('isLogin') ? sessionStorage.getItem('isLogin') : '0', // 登录状态0未登录1登录
            userInfo: {
                // 用户登录后获取的用户信息
                name: '',
                password: '',
                id: '',
                permsList: [], // 用户在整个系统中的权限控制---比如首页的工作台入口用此字段判断是否显示
                roleCodeList: [] // 用户在整个系统中的角色
            },
            role: sessionStorage.getItem('role') ? sessionStorage.getItem('role') : 'judge', // 登录的时候设置区分登录入口
            // 存储token
            token: '',
            // 存储庭审角色----暂时未用到
            trialRole: [],
            // 存储庭审权限控制
            trialPermsList: [],
            curVersion: '', // 版本号----暂时未用到
            peoplekey: sessionStorage.getItem('peoplekey') ? sessionStorage.getItem('peoplekey') : null // pc设备识别id
        });
