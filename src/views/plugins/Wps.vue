<!--
 * @Descripttion: wps
 * @Author: zhangt
 * @Date: 2021-04-23 17:07:43
 * @Last Modified by: zhangt
 * @Last Modified time: 2021-04-25 18:10:18
-->
<template>
   <div class="full-height">
        <div>
            <!-- <el-button type="primary" @click="fnDot">打点</el-button>
      <el-button type="primary" @click="markLink">书签跳转</el-button> -->
        </div>
        <div id="doc" class="full-height">

        </div>
        <div v-show="PluginError">
            您的WPS版本不正确
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import { IEVersion, ActiveXKiller } from '@/utils/utils';
export default {
    name: 'WPS',
    props: {
       NtkoAction: {
            type: String,
            default: ''

        },
        // savePath: {
        //     type: String,
        //     default: ''
        // },
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
                            // case 'addText':
                            //     console.log('NtkoAction---addText');
                            //     _this.addText();
                            //     break;
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
        listenChange: {
            handler(newVal) {
                let _this = this;
                _this.$nextTick(() => {
                    if (newVal.ntkoFilePath && newVal.app) {
                        _this.openFile();
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
          notes_timer: null, // 定时器
          recordPath: '', // 笔录路径
          PluginError: false,
          TANGER_OCX_OBJ: null,
          app: null
        };
    },
    computed: {
        ...mapGetters({
            userInfoGet:'userInfoGet',
            recordIdGet:'moduleJudge/recordIdGet'
        }),

        // 合并监听
        listenChange() {
            const {ntkoFilePath, app } = this;
            return {
                ntkoFilePath, app
            };
        },
         // 庭审笔录中的文档是否只能查看
        isReadOnly: {
            get() {
                // if (this.signStatus === '2') {
                //     return true;
                // }
                // let readonly = this.comm.isTrialAuthorizeShow('trial:record:signature') ? false : !this.comm.isTrialAuthorizeShow('trial:record:edit');
                // this.$emit('emitNtkoReadonly', readonly);
                // return readonly;
                return false;
            },
            set() {}
        },
    },
    mounted() {
      this.initWpsApp('doc', "100%", "100%");
    },
    beforeDestroy() {
        //console.log('Ntko---beforeDestroy');
        //this.handleBeforeUnload();
        //window.removeEventListener('beforeunload', this.handleBeforeUnload, false);

    },
    methods: {
      ...mapActions('moduleJudge', ['saveDot']),

     
      // 初始化文档对象
      initWpsApp(tagID, w, h) {
        let iframe;
        iframe = document.getElementById(tagID);
        if (iframe.innerHTML.indexOf("application/x-wps") > -1) {
            iframe.innerHTML = "";
        }
        let codes = [];
        codes.push("<object  name='webwps' id='webwps_id' type='application/x-wps'  width='100%'  height='100%'> <param name='Enabled' value='1' />  </object>");
        iframe.innerHTML = codes.join("");
        this.TANGER_OCX_OBJ = document.getElementById("webwps_id");
        this.app = this.TANGER_OCX_OBJ.Application

        window.onbeforeunload = function () {
            this.TANGER_OCX_OBJ.Application.Quit();
        };
      },
      // 创建空文档
      createDocument() {
          this.app.createDocument("wps");
      },
      openNtko() {
            this.setWpsToolbarVisible(!this.isReadOnly);
            this.$emit('ntkoLoaded');
            if (this.ntkoFilePath) {
                this.openFile();
            }


        },
      // 打开远程文档 -- path为绝对路径
      openFile() {
        if(this.app) {
          this.app.Quit()
        }
        let url = this.ntkoFilePath.replace(/\\/g, '/');
         this.recordPath = `${__API__}/trial${url}?t=${Date.now()}`;
        // console.log('open doc', this.docPath);
        let res = this.app.openDocumentRemote(this.recordPath, this.isReadOnly);
        if(!res) this.createDocument();
         this.setNotesTimer();

      },
      saveFile() {
        const res = this.saveToURL()
        // if(res) {
        //   this.$message.success('保存成功')
        // } else {
        //   this.$message.error('保存失败')
        // }
      },
      saveFileAndTip(){
        const res = this.saveToURL()
        if(res) {
          this.$message.success('保存成功')
        } else {
          this.$message.error('保存失败')
        }
      },
      // 保存文档
      saveToURL() {
          let url= `${this.userInfoGet.serverIpPort}/trial/note/saveNote?trialId=${this.$route.query.trialId}`;
          let aa = this.app.saveURL_s(url,'bl');
          return aa;
      },
      // 打印
      print() {
        this.app.PrintOut()
      },
      // 打印预览
      printPreview () {
        this.app.PrintPreview = true
      },
      //打点
      fnDot(){
            let doc = this.TANGER_OCX_OBJ;
            let descr=doc.Application.Selection.Text;
            if (!descr || descr.trim().length<2) {
                this.openNotify(`请选择一个字以上的打点内容`, 'info');
                // this.$CusConfirm(`请选择打点内容!`);
                return false;
            }
            let recordId = this.recordIdGet;

            if(!recordId){
                this.$message.error("未产生录像文件无法打点");
                 return false;
            }
            let rangeObj = doc.Application.Selection.Range;
            doc.Application.Selection.Font.Color = 255;// 选中字体颜色变红
            let timeStamp = new Date().getTime();
            // let timeStamp = 123;
            this.app.ActiveDocument.Bookmarks.Add('dot' + timeStamp, rangeObj);// 加书签
            console.log( descr + 'descr');
           
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
             //let timestamp = 123;
            let dot = 'dot' + timestamp;
            let r=this.app.ActiveDocument.BookMarks.Exists(dot);
            console.log(r+"Exists")
            if (r)
            {
                this.app.ActiveDocument.Application.Selection.GoTo(-1, 0, 0, dot);
            }
            else {
                this.openNotify(`书签不存在!`, 'error');
            }
        },
      // 获取文本内容
      getText() {
          return this.app.getText();
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
      // 设置文档只读可读模式 true 表示不可编辑，false 表示可编辑
      setReadMode(readonly) {
          this.app.enableProtect(readonly)
      },

      // 设置显示、隐藏工具菜单 true 表示显示，为 false 表示不显示
      setWpsToolbarVisible(visible) {
          this.app.setToolbarAllVisible(visible)
      },
      // 开始笔录定时
      setNotesTimer() {
          if (this.notes_timer === null) {
              this.notes_timer = setInterval(this.saveFile, 1000*60);
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
                  // this.toggleNtkoFullScreen(false);
                  this.app.Quit()
                  this.TANGER_OCX_OBJ = null;
                  ActiveXKiller("webwps_id", 'doc');// 单页面框架在路由不跳转时，切换组件移除ActiveX控件，解决频繁切换IE崩溃问题

              }
          } catch (error) {


          }
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
