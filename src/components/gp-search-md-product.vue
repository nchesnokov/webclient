<template>
    <gp-selectable
        v-if="showSearch"
        :columns="metas[model].meta.columns"
        :names="metas[model].meta.names"
        :cid="cid"
        @update:search="do_search"
        @update:search-cancel="showSearch = false"
    ></gp-selectable>

    <el-row>{{ metas[model].meta.description }}</el-row>
    <el-row v-if="!showSearch">
        <el-tooltip class="item" effect="dark" content="Find record(s)" placement="top">
            <el-button type="primary" size="small" :icon="Search" @click="do_action('find')"></el-button>
        </el-tooltip>
        <el-tooltip
            v-if="multipleSelection.length == 0"
            class="item"
            effect="dark"
            content="New record"
            placement="top"
        >
            <el-button type="primary" size="small" :icon="DocumentAdd" @click="do_action('new')"></el-button>
        </el-tooltip>
        <el-tooltip
            v-if="multipleSelection.length > 0"
            class="item"
            effect="dark"
            content="Copy selected record(s)"
            placement="top"
        >
            <el-button type="primary" size="small" :icon="DocumentCopy" @click="do_action('copy')"></el-button>
        </el-tooltip>
        <el-tooltip
            v-if="multipleSelection.length > 0"
            class="item"
            effect="dark"
            content="Edit selected record(s)"
            placement="top"
        >
            <el-button type="primary" size="small" :icon="Edit" @click="do_action('edit')"></el-button>
        </el-tooltip>
        <el-tooltip
            v-if="multipleSelection.length > 0"
            class="item"
            effect="dark"
            content="Lookup selected record(s)"
            placement="top"
        >
            <el-button type="primary" size="small" :icon="View" @click="do_action('lookup')"></el-button>
        </el-tooltip>

        <el-popconfirm
            v-if="multipleSelection.length > 0"
            confirmButtonText="OK"
            cancelButtonText="No, Thanks"
            icon="el-icon-info"
            iconColor="red"
            title="Are you sure to delete?"
            @confirm="do_action('delete')"
        >
            <template #reference>
                <el-tooltip
                    v-if="multipleSelection.length > 0"
                    class="item"
                    effect="dark"
                    content="Delete selected record(s)"
                    placement="top"
                >
                    <el-button type="primary" size="small" :icon="Delete"></el-button>
                </el-tooltip>
            </template>
        </el-popconfirm>

        <el-tooltip class="item" effect="dark" content="Upload records from file" placement="top">
            <el-button type="primary" size="small" :icon="Upload" @click="do_action('upload')"></el-button>
        </el-tooltip>
        <el-tooltip
            v-if="multipleSelection.length > 0"
            class="item"
            effect="dark"
            content="Download selected record(s)"
            placement="top"
        >
            <el-button type="primary" size="small" :icon="Download" @click="do_action('download')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="Setting view" placement="top">
            <el-button type="primary" size="small" :icon="Setting" @click="do_action('setting')"></el-button>
        </el-tooltip>
    </el-row>
    <el-table @selection-change="handleSelectionChange" :data="tableDataDisplay">
        <el-table-column type="selection" width="55" />
        <el-table-column :prop="col" :label="colsLabel[col]" v-for="col in cols" :key="col">
            <template
                v-if="colsType[col] == 'selection'"
                #default="scope"
            >{{ selOptions[col][scope.row[col]] }}</template>
            <template v-else-if="colsType[col] == 'boolean'" #default="scope">
                <el-checkbox v-model="scope.row[col]" disabled />
            </template>
            <template
                v-else-if="['many2one','referenced','related'].indexOf(colsType[col]) >= 0"
                #default="scope"
            >{{ scope.row[col].name }}</template>

            <template v-else #default="scope">{{ scope.row[col] }}</template>
        </el-table-column>
    </el-table>
    <el-pagination
        v-if="tableData.length > pageSize"
        background
        layout="total ,prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :page-size="pageSize"
        :total="tableData.length"
    ></el-pagination>
</template><script>
import {
    defineComponent
}
    from 'vue'

export default defineComponent({
    name: 'gp-search-md-product',
})

</script>
<script setup>
import {
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
import { Search, DocumentAdd, DocumentCopy, Edit, DocumentDelete, View, Delete, Download, Upload, Setting } from '@element-plus/icons-vue'

import {useI18n} from 'vue-i18n'

const props = defineProps({ cid: String, metas: Object, model: String })
const emit = defineEmits(['action:form'])


const {
    proxy
} = getCurrentInstance()
//const {t} = useI18n()
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

// const { locale, t } = useI18n({
//     inheritLocale: true
// })


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
    return ['many2one', 'referenced', 'related'].indexOf(colsType[col]) >= 0 ? col + '.name' : col
}
const do_select = () => {
    showSearch.value = true
}

const do_search = event => {
    //console.log('select data:', event)
    proxy.$ws.sendAsync({
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
    }
        
    ).then(msg => on_select_data(msg) )
}

const do_modal_form = (oid, mode) => {
    const rootComponent = defineAsyncComponent({
        loader: () =>
            import('./static/gp-form-modal.vue'),
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
    //console.log('action:', action)
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
            proxy.$ws.sendAsync({
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
                //console.log('action:', msg)
                if (msg.length > 0) {
                    proxy.$ws.sendAsync({
                        _msg: [
                            props.cid,
                            '_commit'
                        ]
                    }).then(() => {
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
    //console.log('computed:', tableData === null || tableData.length === 0 ? reactive([]) : tableData.slice(pageSize.value * page.value - pageSize.value, pageSize.value * page.value));
    if (tableData === null || tableData.length === 0) return reactive([])
    else return tableData.slice(pageSize.value * page.value - pageSize.value, pageSize.value * page.value)
})
onMounted(() => {
    for (
        let i = 0,
        c = props.metas[props.model].views.list.columns.map((v) => v.col),
        meta = props.metas[props.model].meta.columns; i < c.length; i++
    ) {
        colsType[c[i]] = meta[c[i]].type
        colsLabel[c[i]] = meta[c[i]].label
        if (colsType[c[i]] == 'selection') selOptions[c[i]] = _get_selections(meta[c[i]].selections)
        if (colsType[c[i]] == 'one2many') o2mcols.push(c[i])
        else cols.push(c[i])
    }
})

</script>
<i18n lang="yaml">
de:
  Code: Code
  Group Of Type Items: Group Of Type Items
  Link: Link
  Medium-sized photo: Medium-sized photo
  Name: Name
  Note: Note
  Photo: Photo
  QRCode: QRCode
  Small-sized photo: Small-sized photo
  State: State
  Template: Template
  Unit Of Measure: Unit Of Measure
  Volume: Volume
  Volume UoM: Volume UoM
  Weight: Weight
  Weight UoM: Weight UoM
en:
  Code: Code
  Group Of Type Items: Group Of Type Items
  Link: Link
  Medium-sized photo: Medium-sized photo
  Name: Name
  Note: Note
  Photo: Photo
  QRCode: QRCode
  Small-sized photo: Small-sized photo
  State: State
  Template: Template
  Unit Of Measure: Unit Of Measure
  Volume: Volume
  Volume UoM: Volume UoM
  Weight: Weight
  Weight UoM: Weight UoM
ru:
  Code: Code
  Group Of Type Items: Group Of Type Items
  Link: Link
  Medium-sized photo: Medium-sized photo
  Name: Name
  Note: Note
  Photo: Photo
  QRCode: QRCode
  Small-sized photo: Small-sized photo
  State: State
  Template: Template
  Unit Of Measure: Unit Of Measure
  Volume: Volume
  Volume UoM: Volume UoM
  Weight: Weight
  Weight UoM: Weight UoM

</i18n>