/* 庭审后查看页面路由配置 */

// 庭审后查看页面
const trialCheck = () => import(/* webpackChunkName: "trialCheck" */ '@/views/trialCheck/index');
// 材料展示
const TopicReader = () => import(/* webpackChunkName: "TopicReader" */ '@/views/home/TopicReader');
// 案件信息

const CaseInfo = () => import(/* webpackChunkName: "CaseInfo" */ '@/views/home/CaseInfo');
// 即时通讯
const Message = () => import(/* webpackChunkName: "Message" */ '@/views/home/Message');
// 庭审笔录
const TrialRecord = () => import(/* webpackChunkName: "TrialRecord" */ '@/views/home/TrialRecord');
// 点播(含打点列表)---播放器播放打点记录
const DotRecordPlay = () => import(/* webpackChunkName: "DotRecordPlay" */ '@/views/home/DotRecordPlay');
// 视频播放NB---播放电子卷宗和影音证据中的视频
const VideoPlayerNB = () => import(/* webpackChunkName: "VideoPlayer" */ '@/views/home/VideoPlayerNB');
// 语音识别
const SpeechRecognition = () => import(/* webpackChunkName: "SpeechRecognition" */ '@/views/home/SpeechRecognition');
// 庭审点播页面---包含点播列表
const TrialPlay = () => import(/* webpackChunkName: "TrialPlay" */ '@/views/home/TrialPlay');
// 警务记录页面
const PoliceHistory = () => import(/* webpackChunkName: "PoliceHistory" */ '@/views/trialCheck/PoliceHistory');
//法信平台
const LawInfo = () => import(/* webpackChunkName: "LawInfo" */ '@/views/home/LawInfo');
// pdf查看
const VPdf = () => import(/* webpackChunkName: "VPdf" */ '@/views/plugins/VPdf');
// pdf插件查看页面
const PdfView = () => import(/* webpackChunkName: "PdfView" */ '@/views/home/PdfView');
//ntko插件查看页面---仅仅查看
const NtkoView = () => import(/* webpackChunkName: "NtkoView" */ '@/views/home/NtkoView');



export default [
    { // 签名页
        path: '/trialCheck',
        name: 'trialCheck',
        component: trialCheck,
        redirect: '/trialCheck/topicReader',
        meta: {
            requireAuth: true  // 添加该字段，表示进入这个路由是需要登录的
        },
        children:[
            {
                path:'topicReader',
                components: {
                    TopicReader: TopicReader,
                    CaseInfo: CaseInfo,
                    Message:Message,
                    TrialPlay:TrialPlay,
                    TrialRecord:TrialRecord,
                    DotRecordPlay:DotRecordPlay,
                    VideoPlayerNB:VideoPlayerNB,
                    SpeechRecognition:SpeechRecognition,
                    PoliceHistory,
                    LawInfo,
                    PdfView:PdfView,
                    NtkoView:NtkoView
                }
            }
        ]

    }
];
