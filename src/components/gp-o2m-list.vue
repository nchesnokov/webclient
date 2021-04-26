<style>



</style>

<template>

<el-row>
    <el-button type="primary" @click="addRow">Add</el-button>
</el-row>
<el-container>
    <el-table @selection-change="handleSelectionChange" :data="tableDataDisplay" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column type="expand" v-if="o2mcols.length > 0">
            <template #default="props">
                <el-tabs type="border-card" v-if="o2mcols.length > 0">
                    <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
                        <gp-o2m-components :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" :cdata="props.row[o2mcol]" :mode="mode" />
                    </el-tab-pane>
                </el-tabs>
            </template>
        </el-table-column>
        <el-table-column :prop="getProp(col)" :label="colsLabel[col]" v-for="col in cols" :key="col"></el-table-column>
    </el-table>
</el-container>
<el-pagination v-if="cdata.length > pageSize" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="cdata.length">
</el-pagination>

</template>

<script>

import {
    defineComponent, ref, reactive, onMounted, computed
}
from 'vue'
export default defineComponent({
    name: 'gp-o2m-list',
    props: ['cid', 'metas', 'model', 'cdata', 'mode'],
    setup(props) {
        const page = ref(1)
        const pageSize = ref(15)
        const cols = reactive([])
        const o2mcols = reactive([])
        const colsType = reactive({})
        const colsLabel = reactive({})
        const multipleSelection = reactive([])

        const handleSelectionChange = val => {
            console.log('selection:', val)
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }


        const getProp = col => {
            return ['many2one', 'related'].indexOf(colsType[col]) >= 0 ? col + '.name' : col
        }

        const addRow = () => {}

        const handleCurrentChange = val => {
            page.value = val
        }

        const tableDataDisplay = computed(() => {
            //console.log('computed:');
            if (props.cdata === null || props.cdata.length === 0) return reactive([])
            else return props.cdata.slice(pageSize.value * page.value - pageSize.value, pageSize.value * page.value)
        })

        onMounted(() => {
            for (
                let i = 0,
                    c = Object.keys(props.metas[props.model].views.list.columns),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                if (colsType[c[i]] == 'one2many') o2mcols.push(c[i])
                else cols.push(c[i])
            }
        })
        return {
            page,
            pageSize,
            addRow,
            handleCurrentChange,
            handleSelectionChange,
            tableDataDisplay,
            getProp,
            cols,
            o2mcols,
            colsType,
            colsLabel
        }
    }
})

</script>
