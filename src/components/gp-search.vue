<style>



</style>

<template>

<slot name="search">

</slot>
<gp-selectable v-if="showSearch" :columns="metas[model].meta.columns" :names="metas[model].meta.names" :cid="cid" @update:search="do_search" @update:search-cancel="showSearch = false"></gp-selectable>
<slot>
    <el-row>{{ metas[model].meta.description }}</el-row>
    <el-row v-if="!showSearch">
        <el-tooltip class="item" effect="dark" content="Find record(s)" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-search" @click="do_action('find')"></el-button>
        </el-tooltip>
        <el-tooltip v-if="multipleSelection.length == 0" class="item" effect="dark" content="New record" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-document-add" @click="do_action('new')"></el-button>
        </el-tooltip>
        <el-tooltip v-if="multipleSelection.length > 0" class="item" effect="dark" content="Copy selected record(s)" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-copy-document" @click="do_action('copy')"></el-button>
        </el-tooltip>
        <el-tooltip v-if="multipleSelection.length > 0" class="item" effect="dark" content="Edit selected record(s)" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="do_action('edit')"></el-button>
        </el-tooltip>
        <el-tooltip v-if="multipleSelection.length > 0" class="item" effect="dark" content="Lookup selected record(s)" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-view" @click="do_action('lookup')"></el-button>
        </el-tooltip>
    
        
          <el-popconfirm  v-if="multipleSelection.length > 0" confirmButtonText='OK' cancelButtonText='No, Thanks' icon="el-icon-info" iconColor="red" title="Are you sure to delete?" @confirm="do_action('delete')">
            <template #reference>         
              <el-button type="primary" size="mini" icon="el-icon-delete"></el-button>
            </template>
          </el-popconfirm>
        

        <el-tooltip class="item" effect="dark" content="Upload records from file" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-upload" @click="do_action('upload')"></el-button>
        </el-tooltip>
        <el-tooltip v-if="multipleSelection.length > 0" class="item" effect="dark" content="Download selected record(s)" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-download" @click="do_action('download')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="Setting view" placement="top">
          <el-button type="primary" size="mini" icon="el-icon-setting" @click="do_action('setting')"></el-button>
        </el-tooltip>
    </el-row>
    <el-container>
        <el-table @selection-change="handleSelectionChange" :data="tableDataDisplay" fit>
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column fixed :prop="getProp(col)" :label="colsLabel[col]" v-for="col in cols" :key="col">
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

</slot>

</template>

<script>

import {
    defineComponent,
    defineAsyncComponent,
    createVNode,
    render,
    reactive,
    ref,
    h,
    computed,
    onMounted,
    getCurrentInstance
}
from 'vue'

export default defineComponent({
    name: 'gp-search',
    props: ['cid', 'metas', 'model'],
    emits: ['action:form'],
    setup(props) {
        const {
            proxy
        } = getCurrentInstance()
        const page = ref(1)
        const pageSize = ref(15)
        const showSearch = ref(false)
        const cols = reactive([])
        const o2mcols = reactive([])
        const colsType = reactive({})
        const colsLabel = reactive({})
        const selOptions = reactive({})
        const tableData = reactive([])
        const multipleSelection = reactive([])

        const handleSelectionChange = val => {
            //console.log('selection:', val)
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }

        const handleCurrentChange = val => {
            page.value = val
        }

        const _get_selections = s => {
            let r = {}
            for (let j = 0; j < s.length; j++) r[s[j][0]] = s[j][1]
            return r
        }

        const getProp = col => {
            return ['many2one','referenced', 'related'].indexOf(colsType[col]) >= 0 ? col + '.name' : col
        }
        const do_select = () => {
            showSearch.value = true
        }

        const do_search = event => {
            //console.log('select data:', event)
            proxy.$websocket.send({
                    _msg: [
                        props.cid,
                        'models',
                        props.model,
                        'select', {
                            fields: props.metas[props.model].views.search.columns.map((v) => v.col),
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

        const do_modal_form = (oid, mode) => {
            const rootComponent = defineAsyncComponent({
                loader: () =>
                    import ('./gp-form-modal.vue'),
                suspensible: false
            })
            const rootProps = {
                cid: props.cid,
                model: props.model,
                mode: mode,
                oid: oid
            }
            const vnode = createVNode(rootComponent, rootProps)
            vnode.appContext = proxy.$appcontext
            const rootContainer = document.createElement('div')
            render(vnode, rootContainer, false)
            document.querySelector('#sv').appendChild(rootContainer)
        }

        const do_action = action => {
            console.log('action:', action)
            switch (action) {
                case 'find':
                    do_select()
                    break
                case 'new':
                    //proxy.$emit('action:form',{'mode':'new'});
                    do_modal_form(null, 'new')
                    break
                case 'edit':
                    //proxy.$emit('action:form',{'mode':'edit','oids':multipleSelection});
                    do_modal_form(
                        multipleSelection.length == 1 ? multipleSelection[0].id : multipleSelection.map(v => v.id),
                        'edit'
                    )
                    break
                case 'lookup':
                    //proxy.$emit('action:form',{'mode':'lookup','oids':multipleSelection});
                    do_modal_form(
                        multipleSelection.length == 1 ? multipleSelection[0].id : multipleSelection.map(v => v.id),
                        'lookup'
                    )
                    break
                case 'copy':
                    //proxy.$emit('action:form',{'mode':'edit','oids':multipleSelection});
                    do_modal_form(
                        multipleSelection.length == 1 ? multipleSelection[0].id : multipleSelection.map(v => v.id),
                        'copy'
                    )
                    break
                case 'delete':
                     proxy.$websocket.sendAsync({
                        _msg: [
                            props.cid,
                            'models',
                            props.model,
                            'unlink', {
                                ids: multipleSelection.length == 1 ? multipleSelection[0].id : multipleSelection.map(v => v.id),
                                context: proxy.$UserPreferences.Context
                            }
                        ]
                    }
                ).then((msg) => {
                    console.log('action:', msg)
                    if (msg.length > 0) {
                        proxy.$websocket.sendAsync({
                            _msg: [
                                props.cid,
                                '_commit'
                            ]
                        }).then(() =>{
                        proxy.$notify({
                            title: 'Information',
                            message: h(
                                'i', {
                                    style: 'color: teal'
                                },
                                'Records deleted.'
                            )
                        })
                        
                        })
                
                }
                }
                )
                    
                    break

            }
        }

        const on_select_data = msg => {
            //console.log('msg:', msg)
            if (msg.length > 0) showSearch.value = false
            tableData.splice(0, tableData.length, ...msg)
        }

        const tableDataDisplay = computed(() => {
            //console.log('computed:');
            if (tableData === null || tableData.length === 0) return reactive([])
            else return tableData.slice(pageSize.value * page.value - pageSize.value, pageSize.value * page.value)
        })
        onMounted(() => {
            for (
                let i = 0,
                    c = props.metas[props.model].views.list.columns.map((v) => v.col ) ,
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
            showSearch,
            cols,
            o2mcols,
            colsType,
            colsLabel,
            selOptions,
            tableData,
            tableDataDisplay,
            multipleSelection,
            handleSelectionChange,
            handleCurrentChange,
            getProp,
            do_modal_form,
            do_select,
            do_search,
            on_select_data,
            do_action
        }
    }
})

</script>
