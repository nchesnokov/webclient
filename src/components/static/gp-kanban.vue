<template>

    <slot name="search">
        <el-row>
            <gp-selectable v-if="showSearch" :cid="cid" :columns="metas[model].meta.columns" :names="metas[model].meta.names"
                @update:search="do_search" @update:search-cancel="showSearch = false"></gp-selectable>
        </el-row>
    </slot>
    <slot>
        <el-row>{{ metas[model].meta.description }}</el-row>
        <el-row>
            <el-button type="primary" size="small" :icon="Search" @click="do_action('find')"></el-button>
        </el-row>
        <kanban-board :stages="stages" :blocks="blocks"></kanban-board>
    </slot>

</template>

<script>

import {
    defineComponent
}
    from 'vue'

export default defineComponent({
    name: 'gp-kanban',
})
</script>

<script setup>
import {
    ref, reactive, onMounted, getCurrentInstance
}
    from 'vue';
import { Search } from '@element-plus/icons-vue'

const props = defineProps({ cid: String, metas: Object, model: String })
const {            proxy
        } = getCurrentInstance();
        const showSearch = ref(false);
        const stages = reactive([]);
        const blocks = reactive([]);

        const do_action = (action) => {
            console.log('action:', action);
            switch (action) {
                case 'find':
                    showSearch.value = true;
                    break;
            }
        }

        const do_search = (event) => {
            console.log('select data:', event);
            proxy.$ws.send(
                [props.cid, 'models', props.model, 'select', {
                    fields: props.metas[props.model].views.kanban.columns.map((v) => v.col),
                    cond: event.cond,
                    context: proxy.$UserPreferences.Context,
                    offset: event.offset.value,
                    limit: event.limit.value
                }]
            ).then(msg => on_select_data(msg))
        }

        const on_select_data = (msg) => {
            console.log("msg:",msg)
            if (msg.length > 0) {
                showSearch.value = false;
                blocks.splice(0, blocks.length);
                for (let i = 0; i < msg.length; i++) blocks.push({
                    title: msg[i].id,
                    status: msg[i][props.metas[props.model].meta.names.state],
                    id: msg[i][props.metas[props.model].meta.names.rec_name]
                });
            }
        }

        onMounted(() => {
            let s = props.metas[props.model].meta.columns[props.metas[props.model].meta.names.state].selections;
            stages.splice(0, stages.length);
            for (let i = 0; i < s.length; i++) stages.push(s[i][0]);
        })
</script>
