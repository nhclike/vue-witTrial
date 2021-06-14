/* 消息聊天功能页面
 * @Author: nihc
 * @Date: 2020-09-03 17:48:12
 * @Last Modified by: nihc
 * @Last Modified time: 2021-03-01 10:06:36
 */
<template>
  <div class="container-message">
    <div class="header">
      <div class="title">即时通讯</div>
    </div>
    <div class="container-body">
      <!-- 聊天面板 -->
      <div class="chat-area">
        <!-- 上方信息区域 -->
        <div class="chat-content"  id="chat" ref="chatContent">
          <div class="chat-list">
              <div
              v-for="(item,index) in msgList"
              :key="index"
              :class="[item.type==0?'chat-left':'chat-right']">
                <span v-if="item.type===0"><img src="/images/trial/icon-person.png" alt=""></span>

                <div>
                    <p v-if="item.type===0">
                        <b>{{item.sender}}</b>
                        <i>{{item.sendTime}}</i>
                    </p>
                    <p v-if="item.type===1">
                        <i>{{item.sendTime}}</i>
                        <b>{{item.sender}}</b>
                    </p>
                    <div class="msg">{{item.content}}</div>
                </div>
                <span v-if="item.type===1"><img src="/images/trial/icon-person.png" alt=""></span>
              </div>
          </div>
        </div>
        <!-- 消息发送区域 -->
        <div class="chat-send" v-if="showSendArea">
          <div class="inputBox">
            <!-- <div class="chooseBox">
                <span>参会人员</span>
                <select class="form-control" name="attendMember" id="attendMember">
                    <option value="">参会人</option>
                </select>
                <button class="finishBtn">完成</button>
            </div> -->
            <textarea ref="msgTextarea" rows="2" placeholder="" id="content" name="content" v-model="content" @keyup.enter="sendMsg"></textarea>
          </div>
          <div class="action">
              <a-button type="primary" class="publishBtn" @click="sendMsg">发送</a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters,mapActions } from 'vuex';
export default {
    props:{
      acceptMsg:{
        type:Object,
        default:()=>{
          return{
            sender:'',
            content:"",
            sendTime:""
          }
          
        }
      }
    },
    inject:['userInfo'],
    data() {
        return {
            showSendArea:true,
            content:"",
            curUserId:'',
            msgList: []
        };
    },
    computed: {
        ...mapGetters(['tokenGet'])
    },
    watch:{
      acceptMsg:{
        handler(newVal,oldVal){
          
          if(newVal && newVal.senderId === this.curUserId){
            newVal.type=1;
          }else{
            newVal.type=0;
          }
          this.msgList=this.msgList.concat(newVal);
          let _this=this;
          this.$nextTick(()=>{
            var container = _this.$el.querySelector('#chat')
            container.scrollTop = container.scrollHeight
          })
         

        },
        deep:true,
        immediate:true
      }
      
    },
    mounted() {
        console.log('message mounted');
        this.curUserId=this.userInfo().id;
        if(window.location.href.indexOf('trialCheck')>0){
          this.showSendArea=false;
          this.$refs.chatContent.style.bottom=0
        };
        this.getMsg();
        this.$refs.msgTextarea.focus();
    },
    methods: {
      ...mapActions('moduleJudge',['getMessageData']),
      sendMsg(){
        if(this.content.trim()===''){
          this.$message.error("消息不能为空!");
          return false;
        }
        this.$emit("emitSendMsg",this.content);
        let _this=this;
        setTimeout(() => {
          _this.content='';
        }, 20);
      },
      getMsg(){
        this.getMessageData({trialId:this.$route.query.trialId}).then((res)=>{
          if(res.code==0){
            this.msgList=this.formatData(res.data)
            let _this=this;
            this.$nextTick(()=>{
              var container = _this.$el.querySelector('#chat')
              container.scrollTop = container.scrollHeight
            })
         
          }
        })
      },
      formatData(arr){
        for(var i=0;i<arr.length;i++){
          if(arr[i].senderId===this.curUserId){
            arr[i].type=1
          }
          else{
            arr[i].type=0
          }
        }
        return arr;
      }
    }
};
</script>

<style scoped lang='less'>
@chat-send-height:200px;
ul{
  margin: 0;
  li{
    list-style: none;
  }
}
.container-message{
  width: 100%;
  height: 100%;
  position: relative;
  .header{
    height: 60px;
    line-height: 60px;
          border-bottom: 1px solid @text_color_white_4;
          padding: 0 40px;

    .title{
      font-size: @font28px;
      color:@text_color_black;
    }
  }
  .container-body{
    width: 100%;
    height: calc(100% - 60px);
    padding: 20px;
    .chat-area{
      background: #E5F2FF;
      position: relative;
      width: 100%;
      height:100%;

      .chat-content{
        position: absolute;
        top:0;
        bottom: @chat-send-height;
        left: 10px;
        right: 10px;
        overflow-y: scroll;
      }
      .chat-send{
        position: absolute;
        bottom: 0;
        height: @chat-send-height;
        width: 100%;
        border-top: 2px solid @bg_box;
        background: #fff;
        .inputBox{
          height: 100%;
          .chooseBox{
            height: 45px;
            width: 100%;
            flex: 0 0 40px;
            display: block;
            padding: 5px;
            box-sizing: border-box;
            border-bottom: 1px solid #ddd;
            .form-control{
              height: 34px;
            }
            &:after{
              content: "";
              display: block;
              clear: both;
            }
            span{
              font-size: 16px;
              color: #00a0e9;
              float: left;
              display: block;
              margin: 0 10px;
              height: 30px;
              line-height: 30px;
            }
            select{
              float: left;
              width: 150px;

            }
            button.finishBtn{
              padding: 2px 20px;
              color: #fff;
              background: #159cfe;
              border-radius: 5px;
              font-size: 17px;
              border: 1px solid #159cfe;
              float: right;
            }
          }
          textarea {
            display: block;
            margin:0;
            height: calc(100% - 40px);
            width:100%;
            font-size:@font22px;
            background-color: #fff;
            border:none;
            color:#000;
          }
        }
        .action{
          position: absolute;
          bottom: 5px;
          right: 5px;
        }
      }
    }
  }

}


div.chat-left {
  text-align:left;
  margin: 10px auto;

  span{
    max-width: 60px;
    font-weight:normal;
    // font-size:18px;
    // color:#999;
    overflow: hidden;
    float: left;
    img{
      width: 50px;
      height: 50px;
    }
  }
  &>div {
    display: inline-block;
    width: calc(100% - 60px);
    p{
      font-size:@font22px;
      color: @text_color_black;
      padding-left: 10px;
      margin-bottom: 5px;
      i{
        font-style: normal;
      }
      b{
        font-weight: normal;
        margin-right: 10px;
      }
    }
    .msg{
      max-width: 90%;
      position: relative;
      float: left;
      padding: 6px;
      color: #fff;
      font-size: @font24px;
      margin: 0 20px 0 10px;
      border-radius: 10px;
      background-color: @color_primary;
      box-shadow: inset 0 0 1px @color_primary;
      vertical-align: top;
      &:before{
        content:"";
        position: absolute;
        left: -10px;
        top: 1px;
        width: 0;
        height: 0;
        border-top: 1px solid transparent;
        border-right: 20px solid @color_primary;
        border-bottom: 10px solid transparent;
      }
    }

  }
}

div.chat-right {
  text-align:right;
  margin: 10px auto;
  span{
    // max-width: 60px;
    font-weight:normal;
    // font-size:14px;
    // color:#999;
    overflow: hidden;
    float: right;
    img{
      width: 50px;
      height: 50px;
    }
  }
  &>div{
    display: inline-block;
    width: calc(100% - 60px);
    p{
      font-size: @font22px;
      color: @text_color_black;
      padding-right: 10px;
      margin-bottom: 5px;

      i{
        font-style: normal;
      }
      b{
        font-weight: normal;
        margin-left: 10px;
      }
    }
    .msg{
      max-width: 90%;
      position:relative;
      float: right;
      padding: 6px;
      font-size: @font24px;
      margin:0 10px 0 12px;
      text-align:left;
      border-radius:10px;
      color:#fff;
      box-shadow: inset 0 0 1px #48d800;
      background-color:#48d800;
      vertical-align: top;
      word-break: break-all;
      &:before {
        content:"";
        position: absolute;
        right: -10px;
        top: 1px;
        width: 0;
        height: 0;
        border-top:1px solid transparent;
        border-left: 20px solid #48d800;
        border-bottom: 10px solid transparent;
      }
    }
  }
}



</style>
