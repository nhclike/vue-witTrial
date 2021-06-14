/*登录路由
 * @Author: nihc
 * @Date: 2020-11-25 17:51:40
 * @Last Modified by: nihc
 * @Last Modified time: 2021-01-18 11:27:50
 */


<template>
  <div class="login">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
const nsName = 'ModuleName';// 命名空间namespace
export default {
    name: 'pageName',
    components: {},
    inject: ['reload'],
    filters: {},
    props: {

    },
    data() {
        return {
        };
    },
    computed: {

    },
    watch: {

    },
    created() {
        console.log('login---created');
        // 在登录页面重置vuex
        // if (this.$store.getters.tokenGet.length > 0) {
        //     return window.location.reload();

        // }
        // this.showLogin = true;
    },
    mounted() {
        console.log('login---mounted');
        // this.init();
    },
    methods: {
    // 接口引入
        ...mapActions(nsName, []),

        // 初始化
        init() {
            // window.sessionStorage.clear();
        }
    }


};
</script>

<style lang="less" scoped>
.login {
    width: 100%;
    height: 100%;
    background-color: rgb(228, 231, 237);
}
</style>

<style lang="less">
</style>

