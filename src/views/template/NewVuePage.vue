/* 页面名称
 * @Author: ShiHuiJun
 * @Date: 2020-09-04 09:36:32
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2020-12-25 16:00:28
 */

<template>
    <div class="listPage/pageName-list/detail/edit/list/info/report">页面名称</div>
</template>

<script>
import { mapActions } from 'vuex';
import ShjListPage from '@/components/common/ShjListPage';
export default {
    name: 'NewVuePage',
    components: { ShjListPage },
    inject: ['reload'],
    filters: {},
    props: {
        /* // 父组件>String
        String: {
            type: String,
            default: 0,
            required: false,
            validator: function(value) {
                return value >= 0;
            }
        },
        // 父组件>Number
        Number: {
            type: Number,
            default: 0,
            required: false,
            validator: function(value) {
                return value >= 0;
            }
        },
        // 父组件>object
        Object: {
            type: Object,
            default: () => ({}),
            required: false
        },
        // 父组件>array
        Array: {
            type: Array,
            default: () => [],
            required: false
        } */
    },
    data() {
        return {};
    },
    computed: {
        /* computeFunction() {
            return 'value';
        },
        // 仅读取
        aDouble: function() {
            return this.a * 2;// this.aPaDoublelus => 2
        },
        // 读取和设置
        aPlus: {
            get: function() {
                return this.a + 1;// this.aPlus => 2
            },
            set: function(v) {
                this.a = v - 1;// this.aPlus=3 => this.a=2
            }
        } */
    },
    watch: {
        // 监听-值
        // watchValue: {
        //     handler() {
        //     },
        //     deep: true,
        //     immediate: true
        // },
        // 监听-对象
        //  'watchObject.key': {
        //     handler() {
        //     },
        //     deep: true,
        //     immediate: true
        // },
        // watch: {
        //     watchValue(newValue, oldValue) {
        //         console.log(newValue, oldValue);
        //     }
        // }
    },
    created() {
        // this.init();
    },
    mounted() {
        // this.init();
    },
    methods: {
        // 初始化
        init() {
            //
        },
        // 接口引入
        ...mapActions(['moduleName/action'])
    }
};
</script>

<style lang="less" scoped>
</style>

<style lang="less">
</style>

