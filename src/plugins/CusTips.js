import Vue from 'vue';
import CusTips from '@/components/common/CusTips.vue';

const Tips = Vue.extend(CusTips);

CusTips.install = function(options) {
    /**
     * options的其他情况自行判断添加默认值等等
     */

    let instance = new Tips({
        data: options
    }).$mount();

    document.body.appendChild(instance.$el);

    Vue.nextTick(() => {
        instance.flag = true; // 记得这里是控制弹窗显隐的状态，一定要同自定义组件里边 v-if 后面的值相同
    });
};

export default CusTips;
