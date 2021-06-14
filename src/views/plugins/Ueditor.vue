/* 模版-页面-百度编辑器
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:19:27
 * @Last Modified by: nihc
 * @Last Modified time: 2021-02-03 17:22:21
 */
<template>
    <div class="listPage" v-if="showEditor">
        <vue-ueditor-wrap v-model="content" :config="myConfig"></vue-ueditor-wrap>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import VueUeditorWrap from 'vue-ueditor-wrap';

export default {
    name: 'Ueditor',
    components: { VueUeditorWrap },
    inject: ['reload'],
    filters: {},
    props: {
        typeCode: { // 0:备忘录1:语音识别
            type: Number,
            default: 0
        },
        action: {
            type: String,
            default: ''
        },
        ueditorHeight: {
            type: Number,
            default: 400
        },
        addTextStr: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            showEditor: false,
            /* ueditor */
            content: '', // 编辑器中的内容
            myConfig: {
                toolbars: [
                    [
                        'undo', // 撤销
                        'bold', // 加粗
                        'indent', // 首行缩进
                        'italic', // 斜体
                        'underline', // 下划线
                        'strikethrough', // 删除线
                        'subscript', // 下标
                        'fontborder', // 字符边框
                        'superscript', // 上标
                        'formatmatch', // 格式刷
                        'fontfamily', // 字体
                        'fontsize', // 字号
                        'justifyleft', // 居左对齐
                        'justifycenter', // 居中对齐
                        'justifyright', // 居右对齐
                        'justifyjustify', // 两端对齐
                        'insertorderedlist', // 有序列表
                        'insertunorderedlist', // 无序列表
                        'lineheight' // 行间距
                    ]
                ],
                // eslint-disable-next-line standard/object-curly-even-spacing

                'fontfamily': [
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'songti', val: '宋体,SimSun'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '仿宋', name: 'fangsong', val: '仿宋,FangSong'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '仿宋_GB2312', name: 'fangsong', val: '仿宋_GB2312,FangSong'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'kaiti', val: '楷体,楷体_GB2312, SimKai'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'yahei', val: '微软雅黑,Microsoft YaHei'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'heiti', val: '黑体, SimHei'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'lishu', val: '隶书, SimLi'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'andaleMono', val: 'andale mono'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'arial', val: 'arial, helvetica,sans-serif'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'arialBlack', val: 'arial black,avant garde'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'comicSansMs', val: 'comic sans ms'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'impact', val: 'impact,chicago'},
                    // eslint-disable-next-line standard/object-curly-even-spacing
                    { label: '', name: 'timesNewRoman', val: 'times new roman'}
                ],
                serverUrl: `${__PROJECTPATH__}/ueditor/ueditorConfig`, // 上传功能的后端服务器接口地址
                UEDITOR_HOME_URL: '/ueditor/', // 你的UEditor资源存放的路径,相对于打包后的index.html
                autoHeightEnabled: false, // 编辑器是否自动被内容撑高
                autoFloatEnabled: false, // 工具栏是否可以浮动
                initialFrameHeight: this.ueditorHeight ? this.ueditorHeight : '400', // 初始容器高度
                initialFrameWidth: '100%', // 初始容器高度
                wordCount: true, // 不开启数字统计
                maximumWords: 20000, // 最多文字显示
                wordOverFlowMsg: '<span class="ue-overflow" style="color:red;">你输入的字符个数已经超出最大允许值！</span>',
                elementPathEnabled: false, // 删除元素路径
                lang: 'zh-cn',
                enterTag:'span',
                langPath: '/ueditor/lang/',
                enableAutoSave: false // 关闭自动保存
            }
        };
    },
    computed: {
    },
    watch: {
        action: {
            handler() {
                let action = this.action.split('num')[0];
                switch (action) {
                    case 'saveMemo':// 保存备忘录数据
                        this.saveMemoData();
                        break;
                    case 'addText':// 动态追加文本
                        this.addText();
                        break;
                    case 'clearRecog':// 动态追加文本
                        this.clearRecog();
                        break;
                    default:
                        break;
                }
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        console.log('Ueditor---created');
    },
    mounted() {
        this.showEditor = true;
        this.$nextTick(() => {
            this.init();
        });
    },
    beforeDestroy() {
        this.showEditor = false;
        this.content = '';
    },
    methods: {
        // 接口引入
        ...mapActions('moduleJudge', [
            'getMemo',
            'saveMemo',
            'initAsr',
            'editAsr',
            'clearAsr'
        ]),
        // 初始化
        init() {
            let params = {
                trialId: this.$route.query.trialId
            };
            // 备忘录---初始化获取数据
            if (this.typeCode == 0) {

                this.getMemo(params).then(res => {
                    console.log('getMemo', res);
                    if (res.code === 0 && res.data[0]) {
                        this.content = res.data[0].text;
                    }
                });
            }
            if (this.typeCode == 1) { // 语音识别

                // this.initAsr(params).then(res=>{
                //     console.log('initAsr', res);
                //     if (res.code === 0&& res.data[0]) {
                //         this.content = res.data[0].text;
                //     }
                // })
            }

        },

        // 保存备忘录数据
        saveMemoData() {
            if ($('.listPage').find('span.ue-overflow').hasClass('ue-overflow')) {
                this.$message.error('您输入的内容超过最大保存数!');
                return false;
            }
            let params = {
                trialId: this.$route.query.trialId,
                text: this.content// 编辑器助中的内容"
            };
            this.saveMemo(params).then(res => {
                console.log('saveMemo', res);
                if (res.code === 0) {
                    this.$message.success(`${res.msg}`);
                    // this.reload();
                }
            });
        },
        // 清除语音识别
        clearRecog() {
            let params = {
                'asrType': '',
                'message': '',
                'roomId': '',
                'trialId': ''
            };
            this.clearAsr(params).then(res => {
                if (res.code == 0) {
                    this.clearText();
                }
            });
        },
        addText() {
            this.content = this.content.concat(this.addTextStr);
        },
        clearText() {
            this.content = '';
        }
    }
};
</script>

<style lang="less" scoped>

</style>

