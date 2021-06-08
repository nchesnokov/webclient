<style>



</style>

<template>

<el-container>
    <el-table @selection-change="handleSelectionChange" :data="tableData" style="width: 100%" fit>
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column :prop="getProp(col)" :label="colsLabel[col]" v-for="col in cols" :key="col">
              <template v-if="colsType[col] == 'selection'" #default="scope">
                {{ selOptions[col][scope.row[col]] }}
              </template>
              <template v-else-if="colsType[col] == 'boolean'" #default="scope">
                <el-checkbox v-model="scope.row[col]" disabled></el-checkbox>
              </template>        
        </el-table-column>
    </el-table>
</el-container>
<el-pagination v-if="tableData.length > pageSize" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="tableData.length">
</el-pagination>

</template>

<script>

import {
    defineComponent, ref, reactive, onBeforeMount
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
        const selOptions = reactive({})
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
            return ['many2one', 'referenced', 'related'].indexOf(colsType[col]) >= 0 ? col + '.name' : col
        };

        const _get_selections = s => {
            let r = []
            for (let j = 0; j < s.length; j++) r.push({
                label: s[j][1],
                value: s[j][0]
            })
            return r
        }


        onBeforeMount(() => {
            for (
                let i = 0,
                    c = props.metas[props.model].views.m2mlist.columns.map((v) => v.col),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                if (colsType[c[i]] == 'selection') selOptions[c[i]] = _get_selections(meta[c[i]].selections)
                cols.push(c[i])
            }
        })

        return {
            page,
            pageSize,
            cols,
            colsType,
            colsLabel,
            selOptions,
            multipleSelection,
            handleSelectionChange,
            handleCurrentChange,
            getProp
        };
    }
});

</script>
