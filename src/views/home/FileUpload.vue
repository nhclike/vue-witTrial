/*影音证据文件上传
 * @Author: nihc
 * @Date: 2020-09-09 17:02:26
 * @Last Modified by: nihc
 * @Last Modified time: 2020-12-02 15:26:00
 */

<template>
    <div class="page-box full-height">
        <div class="page-title">
            文件上传
        </div>
        <div class="page-tip">
            <div>支持上传的文件类型:
                <br>
                <p>.mp3,.wmv,.mp4,.bmp,.jpg,.jpeg,.png,.gif,.doc,.docx,.xlsx,.xls,.pdf,.ppt,.pptx</p>
            </div>
        </div>

        <div class="page-content">
            
            <a-upload
                :accept="acceptType"
                :action="actionUrl"
                :multiple="true"
                :file-list="fileList"
                :remove="handleRemove"
                :before-upload="beforeUpload"
                @change="handleChange"
                :headers="headers"

            >

            <a-button type="primary"> <a-icon type="cloud-upload" />上传 </a-button>

            </a-upload>
        </div>
    </div>

</template>
<script>
import { mapGetters,mapActions } from 'vuex';
import {getArrDefValIdx} from '@/utils/utils';
export default {
    data() {
        return {
            fileList: [],
            headers:null,
            acceptType:'.mp3,.wmv,.mp4,.bmp,.jpg,.jpeg,.png,.gif,.doc,.docx,.xlsx,.xls,.pdf,.ppt,.pptx',
            actionUrl:`${__API__}/trial/trial/trialFile/upload?trialId=${this.$route.query.trialId}`
        };
    },
    computed: {
        ...mapGetters(['tokenGet'])
    },
    mounted(){
        this.init();
        this.headers={
            token:this.tokenGet
        }
    },
    methods: {
        ...mapActions('moduleJudge',['getTrialFile','deleteTrialFile']),
        init(){
            let _this=this;
            this.getTrialFile({trialId:this.$route.query.trialId}).then((res)=>{
                console.log(res);
                if(res.code==0){
                    _this.fileList=res.data;
                }
            })
        },
        handleRemove(file){
            console.log('fileupload----handleRemove',file);
            let params={
                trialId:this.$route.query.trialId,
                id:file.uid
            }
            this.deleteTrialFile(params).then((res)=>{
               if(res.code==0){
                   this.$message.success(res.msg);
                   this.$emit("emitUpdateProofTree",file.uid)

               }
            })
        },
        beforeUpload(file,fileList){
            console.log('fileupload----beforeUpload',file,fileList);
            //校验文件名称
            if(file.name.length>100){
                this.$message.error('文件名称过长!')
                return false;
            }
            //校验文件类型
            let lastIndex=file.name.lastIndexOf('.');
            let fileType=file.name.substr(lastIndex).toLowerCase();
            if(this.acceptType.indexOf(fileType)<0){
                this.$message.error('文件类型不符合!');
                let index=getArrDefValIdx(fileList,'uid',file.uid);
                fileList.splice(index,1);
                console.log('fileupload----beforeUpload1',file,fileList);

                return false;
            }
            //校验文件大小
            if(file.size>1024*1024*1*1000){
                this.$message.error('文件大小不能超过1G!');
                return false;
            }

        },
        handleChange(info) {
            console.log('fileupload----handleChange',info)
          
            //上传错误提示
            if(info.file.response&&info.file.response.code!=0){
                this.$message.error(info.file.response.msg);
                return false;
            }
            //上传成功后重新获取上传的文件列表
            if(info.file.status=='done'){
               console.log('fileupload----handleChange----上传成功',info)
               this.$message.success("上传成功!");
               //this.init();
               this.$emit("emitUpdateProofTree",info.file.uid)

            }
            let fileList = [...info.fileList];

            for(var i=0;i<fileList.length;i++){

                if(fileList[i].response){
                    fileList[i].uid=fileList[i].response.data.id;
                }
            }
            this.fileList = fileList;
        }
    }
};
</script>
<style lang="less" scoped>
.page-box{
    padding:0 40px 20px 40px;
    .page-title{
        height: 60px;
        line-height: 60px;
        font-size: @font28px;
        color:@text_color_black;
        border-bottom: 1px solid @text_color_white_4;
    }
    .page-tip{
        font-size: @font24px;
        color: #e4393c;
        word-wrap: break-word;
        white-space: normal;
        word-break: break-all;
    }
    .page-content{
        height: calc(100% - 100px);
        position: relative;
        padding: 10px 0;
        overflow-y: auto;
    }
}
/deep/.ant-upload.ant-upload-select{
    position: fixed;
    top:1.3rem;
    right: 3.5rem;
}
/deep/.ant-upload-list-item{
    height: 30px;
    line-height: 30px;
     margin-top: 6px;
     span{
         i.anticon{
             top:5px;
         }
         .ant-upload-list-item-name{
             padding-left: 30px;
         }
     }
}

/deep/a:hover{
    color: #333 !important;
}
</style>
