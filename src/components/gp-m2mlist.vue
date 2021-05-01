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
        <el-table-column :prop="getProp(col)" :label="colsLabel[col]" v-for="col in cols" :key="col"></el-table-column>
    </el-table>
</el-container>
<el-pagination v-if="tableData.length > pageSize" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="tableData.length">
</el-pagination>

</template>

<script>

import {
    defineComponent, ref, reactive, onMounted
}
from 'vue'
export default defineComponent({
    name: 'gp-m2m-list',
    props: ['metas', 'model', 'tableData'],
    setup(props) {
        const page = ref(1);
        const pageSize = ref(15);
        const cols = reactive([]);
        const colsType = reactive({})
        const colsLabel = reactive({})

        const multipleSelection = reactive([]);

        const handleSelectionChange = (val) => {
            console.log('selection:', val);
            multipleSelection.splice(0, multipleSelection.length, ...val);
        };

        const handleCurrentChange = (val) => {
            page.value = val;
        };

        const getProp = (col) => {
            return ['many2one', 'related'].indexOf(colsType[col]) >= 0 ? col + '.name' : col
        };
        const addRow = () => {};
        onMounted(() => {
            for (
                let i = 0,
                    c = props.metas[props.model].views.m2mlist.columns.map((v) => v.col),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                cols.push(c[i])
            }
        })

        return {
            page,
            pageSize,
            cols,
            colsType,
            colsLabel,
            multipleSelection,
            handleSelectionChange,
            handleCurrentChange,
            getProp,
            addRow
        };
    }
});

</script>
