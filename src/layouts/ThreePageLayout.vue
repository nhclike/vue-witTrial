/* 主框架---审判长庭审页面
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:23:13
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-05-12 13:54:57
 */

<template>
    <div class="basic-layout full-height">
        <!-- 庭审头部 -->
        <trial-header-simple
            :randomNum="randomNum"
            :caseName="caseName"
            :caseCodes="caseCodes"
            @emitCaseCode="
                (val) => {
                    caseName = val;
                }
            "
        ></trial-header-simple>
        <div class="content">
            <!-- 电子卷宗和影音证据 -->
            <div class="tree" ref="leftTreeBox">
                <tree-tab
               @emitNodeSelect="treeNodeSelect"
                :ahdm="ahdm"
                ></tree-tab>
            </div>
            <!-- 路由匹配到的组件将显示在这里(主要是材料查看) -->
            <div class="left full-height pos-r" ref="leftBox">
                <router-view
                    ref="leftRouter"
                    :name="leftRouterName"

                ></router-view>
            </div>
             <!-- 路由匹配到的组件将显示在这里(主要是材料查看) -->
            <div class="middle full-height pos-r" ref="middleBox">
                <router-view
                    ref="leftRouter"
                    :name="middleRouterName"

                ></router-view>
                
            </div>
            <!-- 路由匹配到的组件将显示在这里 -->
            <div class="right full-height pos-r" ref="rightBox" >
                 <router-view
                    ref="rightRouter"
                    :name="rightRouterName"

                ></router-view>
            </div>         
        </div>        
    </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex';
import TrialHeaderSimple from '@/components/header/TrialHeaderSimple';
import TreeTab from '@/views/home/TreeTab';


export default {
    name: 'BasicLayout',
    components: {
       TrialHeaderSimple,
       TreeTab
    },
    inject: ['reload', 'userInfo', 'systemConfig'],
    data() {
        return {
             randomNum: '', // 案件随机码
            caseName: '', // 案件名称
            caseCodes: [], // 并案案号列表currentUser: {}, // 当前用户信息
            rightRouterName:'TopicReader',
            middleRouterName:'TopicReader',
            leftRouterName:'TopicReader',
            trialId:"",
            ahdm:""
        }
    },
    computed: {
       

    },
    watch: {
      
    },
    created() {
        console.log('BasicLayout created');
    },
    mounted() {
        this.trialId = this.$route.query.trialId;
        this.getTrialInfoAndHandle();
    },
    beforeDestroy() {
       
    },
    methods: {
        ...mapActions({
           queryTrialById: 'moduleJudge/queryTrialById'

        }),
       // 查询庭审信息并且处理
        // 1填充案件名称,随机码
        // 2初始化质证状态
        // 3初始化法官允许阅卷状态
        getTrialInfoAndHandle() {
            let _this = this;
            // 查询庭审信息
            this.queryTrialById({ trialId: this.trialId }).then((res) => {
                console.log('查询庭审信息', res);
                if (res.code != 0) {
                    return false;
                }
                _this.randomNum = res.data.randomCode;
                _this.caseName = res.data.caseCode;
                _this.caseCodes = res.data.caseCodes || [];
               

            });
        },
        treeNodeSelect(item){
            console.log("treeNodeSelect",item);
        }
      
    }
};
</script>
<style scoped lang="less" type="text/less">
.basic-layout {
    font-size: @font20px;
    width: 2560px;
    height: 100%;
    background: url('./../assets/images/bg.png') no-repeat top center;
    background-size:cover;
   background-attachment:fixed;
   background-color:@bg_box;
    overflow: hidden;
   .content {
        padding: 0 40px 40px;
        height: calc(100% - @trial_top_menu_h);
        display: flex;
        position: relative;
        .tree {
            padding: 0 20px;
            flex: 0 0 400px;
            width: 400px;
            background-color: @bg_box;
        }
        .left {
            flex: 0 0 640px;
            width: 640px;
            margin-left: 40px;
            background-color: @bg_box;
        }
        .middle {
            flex: 0 0 640px;
            width:640px;
            margin-left: 40px;
            background-color: @bg_box;
        }
        .right {
            flex: 0 0 640px;
            width: 640px;
            margin-left: 40px;
            background-color: @bg_box;
        }
        
    }
   
}
</style>
<style lang="less">
</style>
