<style>



</style>

<template>

<el-dialog :title="'Find:'+model" v-model="showDialog" width="60%">
    <template v-if="Object.keys(metas).length > 0">
        <gp-selectable v-if="showSearch" :cid="cid" :columns="metas[model].meta.columns" :names="metas[model].meta.names" @update:search="do_search" @update:search-cancel="showSearch = false" :extcond="extcond"></gp-selectable>
        <el-row>{{ metas[model].meta.description }}</el-row>
        <el-row v-if="!showSearch">
            <el-button type="primary" @click="do_select">Search</el-button>
        </el-row>
        <el-container>
            <template v-if="mode=='single'">
                <el-table border highlight-current-row @current-change="handleCurrentChange" :data="tableDataDisplay">
                    <el-table-column :type="mode == 'single' ? 'index' : 'selection'" width="55">
                    </el-table-column>
                    <el-table-column :prop="getProp(col)" :label="colsLabel[col]" v-for="col in cols" :key="col"></el-table-column>
                </el-table>
            </template>
            <template v-else-if="mode=='multiple'">
                <el-table border @selection-change="handleSelectionChange" :data="tableDataDisplay">
                    <el-table-column :type="mode == 'single' ? 'index' : 'selection'" width="55">
                    </el-table-column>
                    <el-table-column :prop="getProp(col)" :label="colsLabel[col]" v-for="col in cols" :key="col"></el-table-column>
                </el-table>
            </template>

        </el-container>
        <el-row>
            <el-button type="danger" @click="onCancel">Cancel</el-button>
            <el-button v-if="mode == 'single' && currentRow != null || multipleSelection.length > 0" type="primary" @click="onSelect">Select</el-button>
        </el-row>
        <el-pagination v-if="tableData.length > pageSize" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="tableData.length">
        </el-pagination>

    </template>
</el-dialog>

</template>

<script>

import {
    defineComponent, reactive, ref, computed, onMounted, getCurrentInstance
}
from 'vue'

export default defineComponent({
    name: 'gp-find',
    props: {
        cid: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        mode: {
            type: String,
            default: 'single',
            validator: function(value) {
                return ['single', 'multiple'].indexOf(value) !== -1
            }
        },
        callback: {
            type: Function
        },
        callbackOpts: {
            type: Object
        },
        extcond: {
            type: Array,
            default: function() {
                return []
            }
        }
    },
    setup(props) {
        const {
            proxy
        } = getCurrentInstance()
        const showDialog = ref(true)
        const metas = reactive({})
        const page = ref(1)
        const pageSize = ref(15)
        const showSearch = ref(false)
        const cols = reactive([])
        const o2mcols = reactive([])
        const colsType = reactive({})
        const colsLabel = reactive({})
        const tableData = reactive([])
        const currentRow = ref(null)
        const multipleSelection = reactive([])

        const onCancel = () => {
            showDialog.value = false
        }
        const onSelect = () => {
            console.log('onSelect:')
            if (props.callbackOpts.mode == 'find' && props.callback != null) {
                if (props.mode == 'single')
                    props.callback({
                            id: currentRow.value.id,
                            name: currentRow.value[metas[props.model].meta.names.rec_name]
                        },
                        props.callbackOpts
                    )
                else {
                    let vals = []
                    for (let i = 0, rec_name = metas[props.model].meta.names.rec_name; i < multipleSelection.length; i++)
                        vals.push({
                            id: multipleSelection[i].id,
                            name: multipleSelection[i][rec_name]
                        })
                    props.callback(vals, props.callbackOpts)
                }
            }
            showDialog.value = false
        }

        const handleSelectionChange = val => {
            console.log('selection:', val)
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }

        const handleCurrentChange = val => {
            if (props.mode == 'single') currentRow.value = val
            else page.value = val
        }

        const getProp = col => {
            return ['many2one', 'related'].indexOf(colsType[col]) >= 0 ? col + '.name' : col
        }

        const do_select = () => {
            showSearch.value = true
        }
        const do_search = event => {
            console.log('select data:', event)
            proxy.$websocket.send({
                    _msg: [
                        props.cid,
                        'models',
                        props.model,
                        'select', {
                            fields: Object.keys(metas[props.model].views.find.columns),
                            cond: event.cond,
                            context: proxy.$UserPreferences.Context,
                            offset: event.offset.value,
                            limit: event.limit.value
                        }
                    ]
                },
                on_select_data
            )
        }

        const on_select_data = msg => {
            console.log('msg:', msg)
            if (msg.length > 0) showSearch.value = false
            tableData.splice(0, tableData.length, ...msg)
        }

        const tableDataDisplay = computed(() => {
            //console.log('computed:');
            if (tableData === null || tableData.length === 0) return reactive([])
            else return tableData.slice(pageSize.value * page.value - pageSize.value, pageSize.value * page.value)
        })

        const on_load_meta = msg => {
            console.log('meta:', msg)
            Object.assign(metas, msg[0])
            for (
                let i = 0, c = Object.keys(metas[props.model].views.find.columns), meta = metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                if (colsType[c[i]] == 'one2many') o2mcols.push(c[i])
                else cols.push(c[i])
            }
        }

        onMounted(() => {
            proxy.$websocket.send({
                    _msg: [props.cid, 'uis', 'get_meta_of_models_v2', {
                        model: props.model,
                        context: proxy.$UserPreferences.Context
                    }]
                },
                on_load_meta
            )
        })
        return {
            showDialog,
            page,
            pageSize,
            showSearch,
            metas,
            cols,
            o2mcols,
            colsType,
            colsLabel,
            tableData,
            tableDataDisplay,
            currentRow,
            multipleSelection,
            handleSelectionChange,
            handleCurrentChange,
            getProp,
            onCancel,
            onSelect,
            do_select,
            do_search,
            on_select_data,
            on_load_meta
        }
    }
})

</script>
