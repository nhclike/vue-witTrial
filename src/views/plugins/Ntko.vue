/*ntko组件
 * @Author: nihc
 * @Date: 2020-09-03 17:47:08
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-18 15:48:47
 */

<template>
    <div>
        <div id="ntko">

        </div>
        <div v-show="PluginError">
            您的浏览器不支持此插件,请使用IE浏览器
        </div>
    </div>

</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import { IEVersion, ActiveXKiller } from '@/utils/utils';

export default {
    name: 'Ntko',
    props: {
        NtkoAction: {
            type: String,
            default: ''

        },
        savePath: {
            type: String,
            default: ''
        },
        addTextString: {
            type: String,
            default: '测试demo'
        },
        ntkoHeight: {
            type: Number,
            default: 500
        },
        signPicPath: {
            type: String,
            default: ''
        },
        receiveNoteCirculation: {
            type: Boolean
        },
        ntkoDotTimeStamp: {
            type: String,
            default: ''
        },
        signStatus: {
            type: String,
            default: ''
        },
        ntkoFilePath: {// 打开文件的文件地址
            type: String,
            default: ''
        }
    },
    data() {
        return {
            recordPath: '', // 笔录路径
            notes_timer: null, // 定时器
            PluginError: false,
            NtkoId: '',
            // 32位控件的classid
            // classid: 'C9BC4E1F-4248-4a3c-8A49-63A7D317F404', // 南北
            classid: 'A64E3073-2016-4baf-A89D-FFE1FAA10EC0', // 高院
            // 64位控件的calssid
            classidx64: '',
            // 32位控件包的路径
            // codebase: '/officecontrol/NtkoOfficeControlSetup.msi', // 南北
            codebase: '', // 高院

            // 64位控件包的路径
            codebase64: '',
            // 设置高度
            height: this.ntkoHeight,
            // 设置宽度
            width: '100%',
            // 买断授权密钥如果不是买断可以不用写
            MakerCaption: '',
            // 买断授权密钥如果不是买断可以不用写
            MakerKey: '',
            // 密钥
            // ProductCaption: '浙江南北联合',
            ProductCaption: '浙江省高级人民法院',

            // 密钥
            // ProductKey: '1061CFD1C3CADD35DA08D816866744EB45BB13DD', // 南北
            ProductKey: 'F3377399C79C47C6FCEE890E5C85B2DA9934574A', // 高院

            // 解除时间密钥
            NoExpireKey: '3701675797ADD8099C698013EFCC10E6',
            TANGER_OCX_OBJ: null,
            wordContentLen: 0// 文本内容长度
        };
    },
    computed: {
        ...mapGetters('moduleJudge', ['recordIdGet']),
        title() {
            return 'vue集成ntko示例浏览器参数：' + this.platform + '-' + this.browser;
        },
        platform() {
            return window.navigator.platform;
        },
        // 庭审笔录中的文档是否只能查看
        isReadOnly: {
            get() {
                if (this.signStatus === '2') {
                    return true;
                }
                let readonly = this.comm.isTrialAuthorizeShow('trial:record:signature') ? false : !this.comm.isTrialAuthorizeShow('trial:record:edit');
                this.$emit('emitNtkoReadonly', readonly);
                return readonly;
            },
            set() {}
        },
        browser() {
            let userAgent = navigator.userAgent;
            let rMsie = /(msie\s|trident.*rv:)([\w.]+)/;
            let rFirefox = /(firefox)\/([\w.]+)/;
            let rOpera = /(opera).+version\/([\w.]+)/;
            let rChrome = /(chrome)\/([\w.]+)/;
            let rSafari = /version\/([\w.]+).*(safari)/;
            let browser;
            function uaMatch(ua) {
                let match = rMsie.exec(ua);
                if (match != null) {
                    return { browser: 'IE', version: match[2] || '0' };
                }
                match = rFirefox.exec(ua);
                if (match != null) {
                    return { browser: match[1] || '', version: match[2] || '0' };
                }
                match = rOpera.exec(ua);
                if (match != null) {
                    return { browser: match[1] || '', version: match[2] || '0' };
                }
                match = rChrome.exec(ua);
                if (match != null) {
                    return { browser: match[1] || '', version: match[2] || '0' };
                }
                match = rSafari.exec(ua);
                if (match != null) {
                    return { browser: match[2] || '', version: match[1] || '0' };
                }
                if (match != null) {
                    return { browser: '', version: '0' };
                }
            }
            let browserMatch = uaMatch(userAgent.toLowerCase());
            if (browserMatch.browser) {
                browser = browserMatch.browser;
            }
            return browser;
        }
    },
    watch: {
        NtkoAction: {
            handler() {
                let _this = this;
                this.$nextTick(() => {
                    if (_this.TANGER_OCX_OBJ) {
                        let NtkoAction = _this.NtkoAction.split('ntko')[0];
                        switch (NtkoAction) {
                            case 'saveFile':
                                console.log('NtkoAction---saveFile');
                                _this.saveFile();
                                break;
                            case 'saveFileAndTip':
                                console.log('NtkoAction---saveFile');
                                _this.saveFileAndTip();
                                break;
                            case 'fnDot':
                                console.log('NtkoAction---fnDot');
                                _this.fnDot();
                                break;
                            case 'markLink':
                                console.log('NtkoAction---markLink');
                                _this.markLink();
                                break;
                            case 'addText':
                                console.log('NtkoAction---addText');
                                _this.addText();
                                break;
                            default:
                                break;
                        }
                    }

                });
            },
            deep: true,
            immediate: true
        },
        signPicPath: {
            handler(newVal) {
                if (this.TANGER_OCX_OBJ && newVal !== '') {
                    this.TANGER_OCX_OBJ.focus();
                    this.insertPicIntoNtko(newVal);
                }
            },
            deep: true,
            immediate: true
        },
        signStatus: {
            handler(newVal) {
                let _this = this;
                _this.$nextTick(() => {
                    if (newVal === '2' && _this.TANGER_OCX_OBJ) {
                        _this.isReadOnly = true;
                        _this.setReadMode();
                    }
                });
            },
            deep: true,
            immediate: true
        },
        ntkoFilePath: {
            handler(newVal) {
                let _this = this;
                _this.$nextTick(() => {
                    if (newVal && _this.TANGER_OCX_OBJ) {
                        _this.openFile();
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        console.log('ntko----mounted');
        let _this = this;
        this.$nextTick(() => {
            if (this.browser == 'IE') {
                _this.initNtko();
                setTimeout(() => {
                    _this.openNtko(this.receiveNoteCirculation);
                }, 20);
                // let save = window.location.href.indexOf('trialCheck') > -1 || _this.comm.isTrialAuthorizeShow('trial:record:dotSave');
                if (!this.isReadOnly) {
                    console.log('开启自动保存');
                    _this.setNotesTimer(); // 开启自动保存
                }
                window.addEventListener('beforeunload', _this.handleBeforeUnload, false);
            }
            else {
                _this.PluginError = true;

            }
            _this.$emit('ntkoLoaded');


        });
    },
    beforeDestroy() {
        console.log('Ntko---beforeDestroy');
        this.handleBeforeUnload();
        window.removeEventListener('beforeunload', this.handleBeforeUnload, false);

    },
    methods: {
        ...mapActions('moduleJudge', ['saveDot']),
        initNtko() {
            this.NtkoId = this.createGUID();
            if (this.browser == 'IE') {
                if (window.navigator.platform == 'Win32') {
                    let domStr = '';
                    domStr += '<!-- 用来产生编辑状态的ActiveX控件的JS脚本-->   ';
                    domStr += '<!-- 因为微软的ActiveX新机制，需要一个外部引入的js-->   ';
                    domStr += '<object id="' + this.NtkoId + '" classid="clsid:' + this.classid + '" codebase="' + this.codebase + '" width="' + this.width + '" height="' + this.height + '">   ';
                    // domStr += '<param name="MakerCaption" value="' + this.MakerCaption + '">   ';
                    // domStr += '<param name="MakerKey" value="' + this.MakerKey + '">   ';
                    domStr += '<param name="ProductCaption" value="' + this.ProductCaption + '">   ';
                    domStr += '<param name="ProductKey" value="' + this.ProductKey + '">   ';
                    domStr += '<param name="NoExpireKey" value="' + this.NoExpireKey + '">   ';
                    domStr += '<param name="BorderStyle" value="1">';
                    domStr += '<param name="BorderColor" value="14402205">';
                    domStr += '<param name="TitlebarColor" value="15658734">';
                    domStr += '<param name="TitlebarTextColor" value="0">';
                    domStr += '<param name="Titlebar" value="false">';
                    domStr += '<param name="MenubarColor" value="14402205">';
                    domStr += '<param name="MenuButtonColor" VALUE="16180947">';
                    domStr += '<param name="MenuBarStyle" value="3">';
                    domStr += '<param name="MenuButtonStyle" value="7">';
                    domStr += '<param name="WebUserName" value="NTKO">';
                    domStr += '<param name="Statusbar" value="false">';
                    domStr += '<param name="IsUseUTF8URL" value="-1">   ';
                    domStr += '<param name="IsUseUTF8Data" value="-1">   ';
                    domStr += '<param name="Caption" value="NTKO OFFICE文档控件示例演示 http://www.ntko.com">   ';
                    domStr += '<SPAN STYLE="color:red">不能装载文档控件。请在检查浏览器的选项中检查浏览器的安全设置。</SPAN>   ';
                    domStr += '</object>';
                    document.getElementById('ntko').innerHTML += domStr;
                }
                if (window.navigator.platform == 'Win64') {
                    let domStr = '';
                    domStr += '<!-- 用来产生编辑状态的ActiveX控件的JS脚本-->   ';
                    domStr += '<!-- 因为微软的ActiveX新机制，需要一个外部引入的js-->   ';
                    domStr += '<object id="TANGER_OCX" classid="clsid:\'+this.classidx64+\'" codebase="' + this.codebase64 + '" width="' + this.width + '" height="' + this.height + '">   ';
                    domStr += '<param name="MakerCaption" value="' + this.MakerCaption + '">   ';
                    domStr += '<param name="MakerKey" value="' + this.MakerKey + '">   ';
                    domStr += '<param name="ProductCaption" value="' + this.ProductCaption + '">   ';
                    domStr += '<param name="ProductKey" value="' + this.ProductKey + '">   ';
                    domStr += '<param name="NoExpireKey" value="' + this.NoExpireKey + '">   ';
                    domStr += '<param name="IsUseUTF8URL" value="-1">   ';
                    domStr += '<param name="IsUseUTF8Data" value="-1">   ';
                    domStr += '<param name="Caption" value="NTKO OFFICE文档控件示例演示 http://www.ntko.com">   ';
                    domStr += '<SPAN STYLE="color:red">不能装载文档控件。请在检查浏览器的选项中检查浏览器的安全设置。</SPAN>   ';
                    domStr += '</object>';
                    document.getElementById('ntko').innerHTML += domStr;
                }
            }
            else if (this.browser == 'firefox') {
                let domStr = '';
                domStr += '<object id="TANGER_OCX" type="application/ntko-plug"  codebase="' + this.codebase + '" width="' + this.width + '" height="' + this.height + '" ForOnSaveToURL="ntkosavetourl"  ForOndocumentopened="ntkoondocumentopened"';
                domStr += 'ForOnpublishAshtmltourl="ntkopublishashtml"';
                domStr += 'ForOnpublishAspdftourl="ntkopublishaspdf"';
                domStr += 'ForOnSaveAsOtherFormatToUrl="ntkosaveasotherurl"';
                domStr += '_MakerCaption="' + this.MakerCaption + '"  ';
                domStr += '_MakerKey="' + this.MakerKey + '"  ';
                domStr += '_ProductCaption="' + this.ProductCaption + '"  ';
                domStr += '_ProductKey="' + this.ProductKey + '"   ';
                domStr += '_NoExpireKey="' + this.NoExpireKey + '"   ';
                domStr += 'clsid="{' + this.classid + '}" >';
                domStr += '<SPAN STYLE="color:red">尚未安装NTKO Web FireFox跨浏览器插件</SPAN>   ';
                domStr += '</object>   ';
                document.getElementById('ntko').innerHTML += domStr;
            } else if (this.browser == 'chrome') {

                let domStr = '';
                domStr += '<object id="TANGER_OCX" clsid="{' + this.classid + '}"  ForOnSaveToURL="ntkosavetourl"  ForOndocumentopened="ntkoondocumentopened"';
                domStr += 'ForOnpublishAshtmltourl="ntkopublishashtml"';
                domStr += 'ForOnpublishAspdftourl="ntkopublishaspdf"';
                domStr += 'ForOnSaveAsOtherFormatToUrl="ntkosaveasotherurl"';
                domStr += '_IsUseUTF8URL="-1"   ';
                domStr += '_IsUseUTF8Data="-1"   ';
                domStr += '_MakerCaption="' + this.MakerCaption + '"  ';
                domStr += '_MakerKey="' + this.MakerKey + '"  ';
                domStr += '_ProductCaption="' + this.ProductCaption + '"  ';
                domStr += '_NoExpireKey="' + this.NoExpireKey + '"   ';
                domStr += '_ProductKey="' + this.ProductKey + '"   ';
                domStr += 'codebase="' + this.codebase + '" width="' + this.width + '" height="' + this.height + '" type="application/ntko-plug" ';
                domStr += '<SPAN STYLE="color:red">尚未安装NTKO Web Chrome跨浏览器插件</SPAN>   ';
                domStr += '</object>';
                document.getElementById('ntko').innerHTML += domStr;
            } else {
                alert('暂不支持其他浏览器');
            }
        },
        createGUID() {
            let _guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
            _guid = _guid.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0; let
                    v = c == 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
            return _guid.toUpperCase();
        },
        openNtko(isFullScreen) {
            this.TANGER_OCX_OBJ = document.getElementById(this.NtkoId);
            console.log('this.TANGER_OCX_OBJ', this.TANGER_OCX_OBJ);
            // 如果网络错误，不弹出提示
            this.TANGER_OCX_OBJ.IsShowNetErrorMsg = false;
            this.TANGER_OCX_OBJ.FileNew = false;
            this.TANGER_OCX_OBJ.FileOpen = false;
            this.TANGER_OCX_OBJ.FileClose = false;
            this.toggleNtkoFullScreen(isFullScreen);
            if (this.ntkoFilePath) {
                this.openFile();
            }


        },
        openFile() {
            let url = this.ntkoFilePath.replace(/\\/g, '/');
            this.recordPath = `${__API__}/trial${url}?t=${Date.now()}`;
            // this.recordPath='http://172.19.82.181:8080/test.docx';
            let lastIndex = url.lastIndexOf('.');
            let suffix = url.substr(lastIndex + 1);
            let fileType = '';
            if (suffix == 'xls' || suffix == 'xlsx') {
                fileType = 'excel';
                this.recordPath = url;
            }
            console.log(this.recordPath);

            try {
                if (this.TANGER_OCX_OBJ.ActiveDocument) {
                    this.TANGER_OCX_OBJ.close();
                }
                console.log('openFile-normal', this.TANGER_OCX_OBJ.ActiveDocument);
                switch (fileType) {
                    case 'excel':
                        //                        debugger;
                        // this.TANGER_OCX_OBJ.OpenFromURL(recordPath, false, 'Excel.Sheet');
                        this.TANGER_OCX_OBJ.BeginOpenFromURL(this.recordPath, false, true);// 异步(第三个参数为是否只读)

                        break;

                    default:
                        this.TANGER_OCX_OBJ.OpenFromURL(this.recordPath, false);

                        break;
                }
                // debugger;
                // this.TANGER_OCX_OBJ.OpenFromURL(this.recordPath, false);
            } catch (err) {
                // 如果没有打开文件，则创建文件
                //                 debugger;
                console.log('openFile-catch', this.TANGER_OCX_OBJ.ActiveDocument);
                if (this.TANGER_OCX_OBJ.ActiveDocument == 'undefined' || this.TANGER_OCX_OBJ.ActiveDocument == null) {
                    switch (fileType) {
                        case 'excel':
                            this.TANGER_OCX_OBJ.CreateNew('Excel.Sheet');

                            break;

                        default:
                            this.TANGER_OCX_OBJ.CreateNew('Word.Document');

                            break;
                    }
                }
                console.log('OpenFromURL---error', err);


            } finally {
                this.setReadMode();
                this.$emit('ntkoLoaded');

            }


        },
        saveFile() {
            console.log('ntko----saveFile');
            if (!this.TANGER_OCX_OBJ && this.TANGER_OCX_OBJ.ActiveDocument) {
                return false;
            }
            try {
                let wordContent = this.TANGER_OCX_OBJ.ActiveDocument.Content.Text;
                if (wordContent.length > 0) {
                    let res = this.TANGER_OCX_OBJ.SaveToURL(
                        `${__API__}/trial/trial/note/saveNote`,
                        'EDITFILE',
                        'trialId=' + this.$route.query.trialId,
                        this.$route.query.trialId + '.doc',
                        0,
                        false
                    );
                    let data = JSON.parse(res);
                    if (data.code === 0) {
                        // this.$CusConfirm(`${data.msg}`);
                        // 页面离开在保存后销毁ntko
                    } else {
                        this.openNotify(`保存失败!`, 'error');
                        console.log('保存失败!', data)
                    }
                }
            } catch (e) {
                console.log(e);

            }
        },
        // 保存成功并且给提示
        saveFileAndTip() {
            if (!this.TANGER_OCX_OBJ && this.TANGER_OCX_OBJ.ActiveDocument) {
                return false;
            }
            try {
                let wordContent = this.TANGER_OCX_OBJ.ActiveDocument.Content.Text;
                if (wordContent.length > 0) {
                    let res = this.TANGER_OCX_OBJ.SaveToURL(
                        `${__API__}/trial/trial/note/saveNote`,
                        'EDITFILE',
                        'trialId=' + this.$route.query.trialId,
                        this.$route.query.trialId + '.doc',
                        0,
                        false
                    );
                    let data = JSON.parse(res);
                    if (data.code === 0) {
                        this.openNotify(`${data.msg}`, 'success');
                        // this.$CusConfirm(`${data.msg}`);
                        // console.log(data);
                    } else {
                        this.openNotify(`保存失败!`, 'error');
                        // this.$CusConfirm(`保存失败!`);
                    }
                }
            } catch (e) {
                console.log(e);

            }
        },
        openNotify(message, type) {
            this.$notify({
                title: '系统提示',
                message: message,
                type: type,
                position: 'top-right',
                // duration: 0,
                customClass: 'cusNotify'
            });
        },
        addText() {
            this.TANGER_OCX_OBJ.ActiveDocument.Application.Selection.TypeText(this.addTextString);

        },
        setReadMode() {
            this.TANGER_OCX_OBJ.SetReadOnly(this.isReadOnly);
        },
        // 打点控制
        fnDot() {
            let doc = this.TANGER_OCX_OBJ.ActiveDocument;
            let rangeObj = doc.Application.Selection.Range;
            doc.Application.Selection.Font.Color = 255;// 选中字体颜色变红
            let timeStamp = new Date().getTime();
            // let timeStamp = 123;
            doc.Bookmarks.Add('dot' + timeStamp, rangeObj);// 加书签
            let descr = this.TANGER_OCX_OBJ.GetBookmarkValue('dot' + timeStamp);// 取书签值
            let recordId = this.recordIdGet;
            console.log(recordId + 'recordId' + descr + 'descr');
            if (!descr || descr.trim() === '') {
                this.openNotify(`请选择打点内容!`, 'info');
                // this.$CusConfirm(`请选择打点内容!`);
                return false;
            }

            let params = {
                'createTime': '',
                'descr': descr,
                'id': 0,
                'recordFile': '',
                'recordId': recordId,
                'timeStamp': '',
                'dotTimeStamp': timeStamp,
                'trialId': this.$route.query.trialId
            };
            this.saveDot(params).then((res) => {
                if (res.code == 0) {
                    console.log('保存打点成功', res.data);
                    this.saveFile();
                    this.$emit('emitDotSuccess');
                    this.openNotify(`${res.msg}`, 'success');
                    // this.$CusConfirm(`${res.msg}`);
                }
            }).catch((err) => {
                console.log(err);
            });
        },
        markLink() {
            // 取书签值跳转转到书签}
            let timestamp = this.ntkoDotTimeStamp;
            let dot = 'dot' + timestamp;
            if (this.TANGER_OCX_OBJ.ActiveDocument.BookMarks.Exists(dot))
            {
                this.TANGER_OCX_OBJ.ActiveDocument.Application.Selection.GoTo(-1, 0, 0, dot);
            }
            else {
                this.openNotify(`书签不存在!`, 'error');
                // this.$CusConfirm(`书签不存在!`);
            }
        },
        // 签名图片插入笔录
        insertPicIntoNtko(picPath) {
            console.log('签名路径', picPath);
            // eslint-disable-next-line camelcase
            if (!picPath || picPath === '') {
                return;
            }
            // 插入图片并设置图片大小
            // InlineShapes 不浮动 Shapes 浮动
            let result = this.TANGER_OCX_OBJ.ActiveDocument.InlineShapes.AddPicture(picPath, false, true);
            result.width = 55;
            result.height = 30;
            // 光标移到文档末尾
            let selection = this.TANGER_OCX_OBJ.ActiveDocument.Application.Selection;
            selection.EndKey();
            console.log('签名结果', result);
            /* this.TANGER_OCX_OBJ.AddPicFromURL(
                `${__API__}/trial` + this.recordPath, // URL 注意；URL必须返回Word支持的图片类型。
                false, // 是否浮动图片
                0, // 如果是浮动图片，相对于左边的Left 单位磅
                0, // 如果是浮动图片，相对于当前段落Top
                1, // 当前光标处
                100, // 缩放值
                0 // 文字上方
            ); */

        },
        // 笔录传阅 -- 重新打开笔录文件
        handleNoteCirculation1(isReload) {
            //            debugger;
            this.openNtko(isReload);
        },
        // 设置ntko是否全屏
        toggleNtkoFullScreen(fullScreen) {
            try {
                this.TANGER_OCX_OBJ.FullScreenMode = fullScreen;
            } catch (err) {
                console.log('控件不支持FullScreenMode属性');
            }
        },
        // 开始笔录定时
        setNotesTimer() {
            if (this.notes_timer === null) {
                this.notes_timer = setInterval(this.saveFile, 60000);
            }
        },
        // 停止定时
        clearNotesTimer() {
            if (this.notes_timer !== null) {
                this.notes_timer = clearInterval(this.notes_timer);
            }
        },
        handleBeforeUnload() {
            // 刷新执行
            console.log('Ntko---handleBeforeUnload');
            // debugger;
            try {
                if (this.TANGER_OCX_OBJ) {
                    if(!this.isReadOnly) {
                        this.clearNotesTimer();
                        this.saveFile();
                    }
                    this.toggleNtkoFullScreen(false);
                    this.TANGER_OCX_OBJ.close();
                    this.TANGER_OCX_OBJ = null;
                    ActiveXKiller(this.NtkoId, 'ntko');// 单页面框架在路由不跳转时，切换组件移除ActiveX控件，解决频繁切换IE崩溃问题

                }
            } catch (error) {


            }
        },
        // 获取最新笔录内容 并 替换
        replaceWithLatestContent() {
            this.TANGER_OCX_OBJ.close();
            this.openFile();
        }
    }

};
</script>
<style>
    /*全局覆盖样式，注意在其他地方不要定义ntko-demo这个样式*/
    /*.ntko-demo .el-dialog__body{*/
        /*padding: 0 0 0 0 !important;*/
    /*}*/
</style>
