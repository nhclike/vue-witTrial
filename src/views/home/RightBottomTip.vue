<template>
    <div class="tip-body">
        <div class="form-top">
            <p class="form-title">操作提示</p>
            <i type="primary" class="el-icon-close form-top-icon" @click="$emit('emitClose')"></i>
        </div>
        <div class="form-body">
            <p class="msg">{{ tipMsg }}</p>
        </div>
    </div>
</template>

<script>

export default {
    name: 'RightBottomTip',
    inject: ['reload'],
    filters: {},
    props: {
        tipMsg: {
            type: String,
            default: '',
            required: true
        }
    },

    data() {
        return {

        };
    },

    mounted() {

    },
    methods: {

    }
};

</script>

<style lang="less" type="text/less" scoped>
    .tip-body {
        width: 100%;
        height: 100%;
        .form-top{
            padding: 10px;
            background-color: @color_primary;
            .form-title {
                font-size: @font22px;
            }
            .form-top-icon {
                right: 0;
                top: 8px;
            }
        }
        .msg {
            font-size: @font22px;
            text-align: center;
        }
    }
</style>
