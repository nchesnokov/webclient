

<template>
    <el-row>
        <el-button v-for="tab in tabs" :key="tab" :class="['tab-button', { active: currentTab === tab }]"
            @click="on_clicktab(tab)">{{ tab.split('-')[2] }}</el-button>
    </el-row>
    <component :is="currentTab" :cid="cid" :guid="guid" :maps="maps" :metas="metas" :model="model" :container="container"
        :mode="mode" :rel="rel" />
</template>

<script>

import {
    defineComponent, ref, reactive, onMounted,getCurrentInstance
}
    from 'vue'

export default defineComponent({
    name: 'gp-o2m-components'
});
</script> 

<script setup>
const props = defineProps({
    'cid': {
        type: String
    },
    'guid': {
        type: String
    },

    'maps': {
        type: Object
    },

    'metas': {
        type: Object
    },
    'model': {
        type: String
    },
    'container': {
        type: String
    },
    'mode': {
        type: String
    },
    'rel': {
        type: String
    }
})
const { root, proxy } = getCurrentInstance();
const tabs = reactive([]);
const currentTab = ref('gp-o2m-list');

const on_clicktab = (tab) => {
    currentTab.value = tab;
};

onMounted(async () => {
    for (let i = 0; i < props.metas[props.model].allow.length; i++)
        if (['form', 'list'].indexOf(props.metas[props.model].allow[i]) >= 0) {
            tabs.push('gp-o2m-' + props.metas[props.model].allow[i]);
        }

});

</script>
