<style>



</style>

<template>

<gp-selectable v-if="showSearch" :columns="metas[model].meta.columns" :names="metas[model].meta.names" @update:search="do_search" @update:search-cancel="showSearch = false">
</gp-selectable>
<el-row>{{ metas[model].description }}</el-row>
<el-row v-if="!showSearch">
    <el-button type="primary" @click="do_select">Search</el-button>
</el-row>
<el-container>
    <el-table :data="tableData" row-key="id" border default-expand-all
        lazy :load="load"
        :tree-props="treeProps" style="width: 100%">
        <el-table-column :prop="getProp(col)" :label="metas[model].meta.columns[col].label" v-for="col in metas[this.model].views.tree.columns.map((v) =>  v.col).filter(col => col != metas[model].meta.names.childs_id)" :key="col"/>
    </el-table>
</el-container>
<el-pagination v-if="tableData.length > pageSize" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="tableData.length">
</el-pagination>

</template>

<script>

import {
    defineComponent, ref, reactive, onMounted, getCurrentInstance
}
from 'vue'

export default defineComponent({
    name: 'gp-tree',
    props: ['cid', 'metas', 'model'],
    setup(props, context) {
        console.log('context:', context);
        const {
            proxy
        } = getCurrentInstance();
        const page = ref(1);
        const pageSize = ref(15);
        const showSearch = ref(false);
        const tableData = reactive([]);
        const treeProps = reactive({
            children: props.metas[props.model].meta.names.childs_id,
            hasChildren: 'hasChildren'
        });
        const fields = reactive([]);
        const multipleSelection = reactive([]);

        const load = (tree, treeNode, resolve) => {
          console.log('load-tree:',tree)
          console.log('load-treeNode:',treeNode)
          console.log('load-resolve:',resolve)
            proxy.$websocket.send({
                _msg: [props.cid, 'models', props.model, 'select', {
                    fields: fields,
                    cond: [{__tuple__:[props.metas[props.model].meta.names.parent_id,'=', tree[props.metas[props.model].meta.names.rec_name]]}],
                    context: proxy.$UserPreferences.Context
                }]
            }, resolve);

        }

        const handleSelectionChange = (val) => {
            console.log('selection:', val);
            multipleSelection.splice(0, multipleSelection.length, ...val);
        };
        const handleCurrentChange = (val) => {
            page.value = val;
        };

        const getProp = (col) => {
            return props.metas[props.model].meta.columns[col].type == 'many2one' ? col + '.name' : col
        }
        const do_select = () => {
            showSearch.value = true;
        };

        const do_search = () => {
            console.log('select data:');

            //proxy.$websocket.sendAsync({_msg:[props.cid,'models',props.model,'tree',{fields:fields,context:{}}]}).then(msg=>tableData.splice(0,tableData.length,...msg));
            proxy.$websocket.send({
                _msg: [props.cid, 'models', props.model, 'select', {
                    fields: fields,
                    cond: [{__tuple__:[props.metas[props.model].meta.names.parent_id,'?']}],
                    context: proxy.$UserPreferences.Context
                }]
            }, on_select_data);
        };
        const on_select_data = (msg) => {
            console.log('select data:', treeProps, msg);
            if (msg.length > 0) showSearch.value = false;
            for(let i = 0; i < msg.length; i++) msg[i].hasChildren = true
            tableData.splice(0, tableData.length, ...msg);
        };
        onMounted(() => {
            fields.splice(0, fields.length, ...props.metas[props.model].views.tree.columns.map((v) => v.col).filter(col => col != props.metas[props.model].meta.names.childs_id))
            //if (fields.indexOf(props.metas[props.model].meta.names.parent_id) == -1) fields.push(props.metas[props.model].meta.names.parent_id);
            //if (fields.indexOf(props.metas[props.model].meta.names.childs_id) == -1) fields.push(props.metas[props.model].meta.names.childs_id);
            treeProps.children = props.metas[props.model].meta.names.childs_id;

        });
        return {
            page,
            pageSize,
            showSearch,
            handleSelectionChange,
            handleCurrentChange,
            tableData,
            treeProps,
            fields,
            getProp,
            do_select,
            do_search,
            on_select_data,
            load
        };
    },
})

</script>
