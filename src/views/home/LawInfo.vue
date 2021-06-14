/* 法信平台
 * @Author: Nihc
 * @Date: 2020-09-03 17:19:10
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2020-11-06 16:56:56
 */

<template>
    <div class="page-box full-height">
        <div class="page-top">
            <div class="page-title">法信平台</div>
        </div>
        <div class="page-content">
            <iframe
                :src="url"
                style="height: 100%;width:100%; frameborder=no"
                frameborder="no"
                border="0"
                marginWidth="0"
                marginHeight="0"
            ></iframe>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LawInfo',
    inject: ['reload', 'systemConfig'],
    filters: {},

    data() {
        return {
            url: ''
        };
    },

    created() {
        // this.init();
    },
    mounted() {
        this.url = this.systemConfig().fxpt;
    },
    methods: {}
};
</script>

<style lang="less" scoped>
</style>

