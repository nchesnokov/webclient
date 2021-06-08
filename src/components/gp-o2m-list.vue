<style>



</style>

<template>

<el-row>
    <el-button type="primary" @click="addRow">Add</el-button>
</el-row>
<el-container>
    <el-table @selection-change="handleSelectionChange" :data="tableDataDisplay" style="width: 100%" fit>
        <el-table-column type="selection" width="55" />
        <el-table-column type="expand" v-if="o2mcols.length > 0">
            <template #default="props">
                <el-tabs type="border-card" v-if="o2mcols.length > 0">
                    <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
                        <gp-o2m-components :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" v-model:cdata="props.row[o2mcol]" :mode="mode" :rel="metas[model].meta.columns[o2mcol].rel"/>
                    </el-tab-pane>
                </el-tabs>
            </template>
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
    props: ['cid', 'metas', 'model', 'cdata', 'mode','rel'],
    setup(props) {
        const page = ref(1)
        const pageSize = ref(15)
        const cols = reactive([])
        const o2mcols = reactive([])
        const colsType = reactive({})
        const colsLabel = reactive({})
         const selOptions = reactive({})
        const multipleSelection = reactive([])

        const handleSelectionChange = val => {
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }


        const getProp = col => {
            return ['many2one','referenced', 'related'].indexOf(colsType[col]) >= 0 ? '__data__.' + col + '.name' : '__data__.' + col
        }

        const addRow = () => {}

        const handleCurrentChange = val => {
            page.value = val
        }

        const _get_selections = s => {
            let r = []
            for (let j = 0; j < s.length; j++) r.push({
                label: s[j][1],
                value: s[j][0]
            })
            return r
        }

        const tableDataDisplay = computed(() => {
            if (props.cdata === null || props.cdata.length === 0) return reactive([])
            else return props.cdata.slice(pageSize.value * page.value - pageSize.value, pageSize.value * page.value)
        })

        onMounted(() => {
            for (
                let i = 0,
                    c = props.metas[props.model].views.list.columns.map((v) => v.col).filter((c) => c != props.rel),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                 if (colsType[c[i]] == 'selection') selOptions[c[i]] = _get_selections(meta[c[i]].selections)
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
            colsLabel,
            selOptions
        }
    }
})

</script>
