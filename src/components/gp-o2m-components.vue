

<template>

<el-row>
    <el-button v-for="tab in tabs" :key="tab" :class="['tab-button', { active: currentTab === tab }]" @click="on_clicktab(tab)">{{ tab.split('-')[2] }}</el-button>
</el-row>
<component :is="currentTab" :cid="cid" :metas="metas" :model="model" :cdata="cdata" :mode="mode" :rel="rel"/>

</template>

<script>

import {
    defineComponent, ref, reactive, onMounted
}
from 'vue'

export default defineComponent({
    name: 'gp-o2m-components',
    props: {
        'cid': {
            type: String
        },
        'metas': {
            type: Object
        },
        'model': {
            type: String
        },
        'cdata': {
            type: Array
        },
        'mode': {
            type: String
        },
        'rel': {
            type: String
        }
    },
    setup(props) {
        //const {proxy} = getCurrentInstance();
        const tabs = reactive([]);
        const currentTab = ref('gp-o2m-list');

        const on_clicktab = (tab) => {
            currentTab.value = tab;
        };

        onMounted(() => {
            for (let i = 0; i < props.metas[props.model].allow.length; i++)
            //if (['form', 'tree', 'graph', 'calendar', 'geo', 'kanban'].indexOf(metas[model.value].allow[i]) >= 0) tabs.push('gp-' + metas[model.value].allow[i]);
                if (['form', 'list'].indexOf(props.metas[props.model].allow[i]) >= 0) tabs.push('gp-o2m-' + props.metas[props.model].allow[i]);

        });
        return {
            tabs,
            currentTab,
            on_clicktab
        };
    }
});

</script>
