/* 法官-工作台
 * @Author: ShiHuiJun
 * @Date: 2020-09-02 11:06:28
 * @Last Modified by: ShiHuiJun
 * @Last Modified time: 2021-01-05 11:13:29
 */
<template>
    <div class="workBench full-height">
        <WorkBenchHeader></WorkBenchHeader>
        <div class="wrap">
            <!--<div class="left-menu full-height">
                <div
                    class="left-menu-item"
                    v-for="(menu,index) in menuList"
                    :key="index"
                    @click="changeRouter(menu.path)"
                >{{menu.name}}</div>
            </div>-->
            <el-row class="left-menu full-height">
                <el-menu
                    :default-active="activeMenuIndex"
                    class="el-menu-vertical"
                    background-color="#fff"
                    active-text-color="#2882FF"
                >
                    <template v-for="(menu, index1) in menuList">
                        <el-menu-item
                            class="menu"
                            v-if="menu.list.length === 0"
                            :key="menu.menuId"
                            :index="`${index1 + 1}`"
                            @click="changeRouter(menu.url)"
                        >
                            <img :src="formatImageUrl(menu.icon)" />
                            <span class="first-menu-item" slot="title">{{
                                menu.name
                            }}</span>
                        </el-menu-item>
                        <el-submenu
                            class="submenu"
                            v-if="menu.list.length > 0"
                            :key="menu.menuId"
                            :index="`${index1 + 1}`"
                        >
                            <template slot="title">
                                <img :src="formatImageUrl(menu.icon)" />
                                <span class="first-menu-item">
                                    {{ menu.name }}</span
                                >
                            </template>
                            <el-menu-item-group>
                                <!-- <template slot="title">分组一</template> -->
                                <el-menu-item
                                    v-for="(subMenu, index2) in menu.list"
                                    :key="subMenu.menuId"
                                    :index="`${index1 + 1}-${index2 + 1}`"
                                    class="second-menu-item"
                                    @click="changeRouter(subMenu.url)"
                                    >{{ subMenu.name }}</el-menu-item
                                >
                            </el-menu-item-group>
                        </el-submenu>
                    </template>
                </el-menu>
            </el-row>
            <div class="content">
                <!-- 路由匹配到的组件将显示在这里 -->
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import WorkBenchHeader from '@/components/header/WorkBenchHeader';
export default {
    name: 'NewVuePage',
    components: { WorkBenchHeader },
    inject: ['reload'],
    filters: {},
    props: {},
    data() {
        return {
            activeMenuIndex: '1',
            menuList: []
        };
    },
    computed: {},
    watch: {
    },
    created() {
        // this.init();
    },
    mounted() {
        this.init();
    },
    methods: {
        // 接口引入
        ...mapActions('moduleSystem', ['getLeftPermList']),
        // 初始化
        init() {
            this.initMenuList();
        },
        initMenuList() {
            this.getLeftPermList().then((res) => {
                if (res.code === 0) {
                    this.menuList = res.data;
                    this.menuList.forEach((menu, index) => {
                        if (menu.url === this.$route.fullPath) {
                            this.activeMenuIndex = String(index + 1);
                        }
                    });
                }
            }).then(() => {
                let firstMenu = this.menuList[Number(this.activeMenuIndex) - 1];
                let path = firstMenu.url ? firstMenu.url : firstMenu.list[0].url;
                this.$router.push({
                    path: path
                // query: {}
                });
            });
        },
        changeRouter(path) {
            // console.log(path, this.$route.fullPath);
            if (path === this.$route.fullPath) {
                //                this.reload();
            } else {
                this.$router.push({
                    path: path
                // query: {}
                });
            }
        },
        formatImageUrl(icon) {
            let iconUrl = require(`@/assets/images/workBench/${icon}.png`);
            return iconUrl;
        }
    }
};
</script>

<style lang="less" scoped>
@left_menu_w:340px;
.workBench {
    .wrap {
        display: flex;
        background: @color_black;
        height: calc(100% - @workBench_top_menu_h);
        width: 100%;
        .left-menu {
            padding: 30px 0;
            background: @text_color_white;
            width: @left_menu_w;
            box-shadow: 0 10px 10px 0 @box_shadow_blue;
            .menu,
            .submenu {
                margin-bottom: 20px;
            }
            .first-menu-item {
                display: inline-block;
                line-height: 70px;
                height: 70px;
            }
            .second-menu-item {
                width: 100%;
                display: inline-block;
                height: 60px;
                line-height: 60px;
                cursor: pointer;
                padding-left: 88px !important;
            }
            img {
                width: 38px;
                height: 38px;
                margin-right: 20px;
            }
        }
        .content {
            background: #EBEBEB;
            width: calc(100% - @left_menu_w);
            padding: 30px 40px;
        }
    }
}
.el-menu {
    border: none;
    .el-menu-item {
        padding: 0 30px !important;
        line-height: 70px;
        height: 70px;
        &.is-active {
            background-color: #e1edff !important;
            border-right: 7px solid #1677ff;
        }
    }
}
/deep/.el-submenu {
    .el-submenu__title {
        padding: 0 30px !important;
        line-height: 70px;
        height: 70px;
        .el-submenu__icon-arrow{
            font-size: @font28px;
            margin-top: -14px;
        }
    }
}
.el-menu-item,
.el-submenu__title span {
    font-size: @font28px;
}
</style>

<style lang="less">
</style>

