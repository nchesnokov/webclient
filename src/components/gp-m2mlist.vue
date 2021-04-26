<style>



</style>

<template>

<el-row>
    {{ metas[model].meta.description }}</el-row>
<el-row>
    <el-button type="primary" @click="addRow">Add</el-button>
</el-row>
<el-container>
    <el-table @selection-change="handleSelectionChange" :data="tableData" style="width: 100%">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column :prop="getProp(col)" :label="metas[model].meta.columns[col].label" v-for="col in Object.keys(this.metas[model].views.m2mlist.columns)" :key="col"></el-table-column>
    </el-table>
</el-container>
<el-pagination v-if="tableData.length > pageSize" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="tableData.length">
</el-pagination>

</template>

<script>

import {
    defineComponent, ref, reactive
}
from 'vue'
export default defineComponent({
    name: 'gp-m2m-list',
    props: ['metas', 'model', 'tableData'],
    setup(props) {
        const page = ref(1);
        const pageSize = ref(15);
        const multipleSelection = reactive([]);

        const handleSelectionChange = (val) => {
            console.log('selection:', val);
            multipleSelection.splice(0, multipleSelection.length, ...val);
        };

        const handleCurrentChange = (val) => {
            page.value = val;
        };

        const getProp = (col) => {
            return props.metas[props.model].meta.columns[col].type == 'many2one' ? col + '.name' : col
        };
        const addRow = () => {};
        return {
            page,
            pageSize,
            multipleSelection,
            handleSelectionChange,
            handleCurrentChange,
            getProp,
            addRow
        };
    }
});

</script>
