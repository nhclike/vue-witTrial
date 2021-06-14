import Vue from 'vue';
import CusConfirm from '@/components/common/CusConfirm.vue';

const Confirm = Vue.extend(CusConfirm);

CusConfirm.install = function(options) {
    /**
     * options的其他情况自行判断添加默认值等等
     */
    // eslint-disable-next-line no-undefined
    if (options === undefined || options === null) {
        options = {
            title: '是否确认？'
        };
    } else if (typeof options === 'string' || typeof options === 'number') {
        options = {
            title: options
        };
    }

    let instance = new Confirm({
        data: options
    }).$mount();

    document.body.appendChild(instance.$el);

    Vue.nextTick(() => {
        instance.flag = true; // 记得这里是控制弹窗显隐的状态，一定要同自定义组件里边 v-if 后面的值相同
    });
};

export default CusConfirm;
