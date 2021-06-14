/*
 * @Descripttion: 
 * @Author: zhangt
 * @Date: 2021-05-11 10:00:52
 * @Last Modified by: zhangt
 * @Last Modified time: 2021-05-12 14:50:58
 */
/* 庭审主页面-路由管理 */
import {
    BasicLayout
    // RouteView
} from '@/layouts';

/* 庭审功能页面 */
// 材料展示
const TopicReader = () => import(/* webpackChunkName: "TopicReader" */ '@/views/home/TopicReader');
// 案件信息
const CaseInfo = () => import(/* webpackChunkName: "CaseInfo" */ '@/views/home/CaseInfo');
// 即时通讯
const Message = () => import(/* webpackChunkName: "Message" */ '@/views/home/Message');
// 庭审画面
const TrialScene = () => import(/* webpackChunkName: "TrialScene" */ '@/views/home/TrialScene');
// 文件上传(影音证据)
const FileUpload = () => import(/* webpackChunkName: "FileUpload" */ '@/views/home/FileUpload');
// 庭审笔录
const TrialRecord = () => import(/* webpackChunkName: "TrialRecord" */ '@/views/home/TrialRecord');
const TrialRecordModal = () => import(/* webpackChunkName: "TrialRecordModal" */ '@/views/home/TrialRecordModal');

// 备忘录
const MemoBook = () => import(/* webpackChunkName: "MemoBook" */ '@/views/home/MemoBook');
// 点播(含打点列表)---播放器播放直播画面
const RecordPlay = () => import(/* webpackChunkName: "RecordPlay" */ '@/views/home/RecordPlay');
// 视频播放---播放电子卷宗和影音证据中的视频
const VideoPlayerNB = () => import(/* webpackChunkName: "VideoPlayer" */ '@/views/home/VideoPlayerVideojs');
// 语音识别
const SpeechRecognition = () => import(/* webpackChunkName: "SpeechRecognition" */ '@/views/home/SpeechRecognition');
// 法信平台
const LawInfo = () => import(/* webpackChunkName: "LawInfo" */ '@/views/home/LawInfo');
// 点播(含打点列表)---播放器播放打点记录
const DotRecordPlay = () => import(/* webpackChunkName: "DotRecordPlay" */ '@/views/home/DotRecordPlay');
// 警务记录页面
const PoliceHistory = () => import(/* webpackChunkName: "PoliceHistory" */ '@/views/trialCheck/PoliceHistory');
// pdf插件查看页面
const PdfView = () => import(/* webpackChunkName: "PdfView" */ '@/views/home/PdfView');
// ntko插件查看页面---仅仅查看
const NtkoView = () => import(/* webpackChunkName: "NtkoView" */ '@/views/home/NtkoView');

export default [
    {
        path: '/home',  // 庭审主页面
        name: 'home',
        component: BasicLayout,
        redirect: '/home/topicReader',
        meta: {
            requireAuth: true  // 添加该字段，表示进入这个路由是需要登录的
        },
        children: [
            {
                path: 'topicReader',
                components: {
                    TopicReader: TopicReader,
                    CaseInfo: CaseInfo,
                    Message: Message,
                    TrialScene: TrialScene,
                    FileUpload: FileUpload,
                    TrialRecord: TrialRecord,
                    MemoBook: MemoBook,
                    RecordPlay: RecordPlay,
                    DotRecordPlay: DotRecordPlay,
                    SpeechRecognition: SpeechRecognition,
                    VideoPlayerNB: VideoPlayerNB,
                    LawInfo: LawInfo,
                    PoliceHistory: PoliceHistory,
                    PdfView: PdfView,
                    NtkoView: NtkoView,
                    TrialRecordModal:TrialRecordModal
                }
            }
        ]
    }
];
