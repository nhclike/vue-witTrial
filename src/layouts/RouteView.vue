/* 控制是否开启缓存，使用该组件配置路由时需要redirect新的跳转路由
 * @Author: ShiHuiJun
 * @Date: 2020-09-03 17:23:13
 * @Last Modified by:   ShiHuiJun
 * @Last Modified time: 2020-09-03 17:23:13
 */
<script>
export default {
    name: 'RouteView',
    props: {
        keepAlive: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {};
    },
    render() {
        // const { $route: { meta }, $store: { getters } } = this;
        // const inKeep = (
        //     <keep-alive>
        //         <router-view />
        //     </keep-alive>
        // );
        const notKeep = (
            <router-view />
        );
        // 这里增加了 multiTab 的判断，当开启了 multiTab 时
        // 应当全部组件皆缓存，否则会导致切换页面后页面还原成原始状态
        // 若确实不需要，可改为 return meta.keepAlive ? inKeep : notKeep
        // if (!getters.multiTab && meta.keepAlive === false) {
        //     return notKeep;
        // }
        // return this.keepAlive || getters.multiTab || meta.keepAlive ? inKeep : notKeep;
        return notKeep;
    }
};
</script>
