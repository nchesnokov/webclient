

<template>

<el-pagination v-if="cdata.length > 1" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="cdata.length">
</el-pagination>

<el-form v-if="cdata.length > 0" :modelValue="cdata[page-1].__data__" label-width="auto">
    <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
        <el-input :modelValue="cdata[page-1].__data__[col].name" v-if="['many2one','related'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
            <template #suffix>
                <el-button type="primary" size="mini" icon="el-icon-search" @click="do_find(col)"></el-button>
                <el-button type="primary" size="mini" icon="el-icon-document-add" @click="do_add(col)"></el-button>
                <el-button v-if="cdata[page-1].__data__[col].id != null" type="primary" size="mini" icon="el-icon-edit" @click="do_edit(col,cdata[page-1].__data__[col].id)"></el-button>
                <el-button v-if="cdata[page-1].__data__[col].id != null" type="primary" size="mini" icon="el-icon-view" @click="do_lookup(col,cdata[page-1].__data__[col].id)"></el-button>
            </template>
        </el-input>
        <json-viewer v-if="colsType[col] == 'json'" :value="cdata[page-1].__data__[col]" copyable boxed sort />
        <el-input :modelValue="cdata[page-1].__data__[col]" v-else-if="['char','varchar','composite','integer','float','decimal','numeric','timedelta'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
            <template #prefix>
                <el-button type="primary" size="mini" icon="el-icon-monitor" v-if="isCompute(col)"></el-button>
            </template>
        </el-input>
        <el-input :modelValue="cdata[page-1].__data__[col]" autosize type="textarea" v-else-if="['text','xml'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)"></el-input>
        <el-date-picker :modelValue="cdata[page-1].__data__[col]" v-else-if="colsType[col] == 'date'" :readonly="readonly(col)"></el-date-picker>
        <el-time-picker :modelValue="cdata[page-1].__data__[col]" v-else-if="colsType[col] == 'time'" :readonly="readonly(col)"></el-time-picker>
        <el-date-picker :modelValue="cdata[page-1].__data__[col]" type="datetime" v-else-if="colsType[col] == 'datetime'" :readonly="readonly(col)"></el-date-picker>
        <el-select :modelValue="cdata[page-1].__data__[col]" v-else-if="colsType[col] == 'selection'" :disabled="readonly(col)">
            <el-option v-for="item in selOptions[col]" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <gp-m2m-list :metas="metas" :model="metas[model].meta.columns[col].obj" :tableData="cdata[page-1].__m2m_containers__[col]" v-else-if="colsType[col] == 'many2many'">{{ colsLabel[col] }}</gp-m2m-list>
        <el-checkbox :value="cdata[page-1].__data__[col]" v-else-if="colsType[col] == 'boolean'" :disabled="readonly(col)"></el-checkbox>
        <el-image v-else-if="colsType[col] == 'binary' && metas[model].meta.columns[col].accept == 'image/*'" style="width: 100px; height: 100px" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" fit="fit"></el-image>
    </el-form-item>
    <el-tabs type="border-card" v-if="o2mcols.length > 0">
        <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
            <gp-o2m-components :cid="cid" :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" :cdata="cdata[page-1].__o2m_containers__[o2mcol]" :mode="mode" :rel="metas[model].meta.columns[o2mcol].rel"/>
        </el-tab-pane>
    </el-tabs>
</el-form>

</template>

<script>

import {
    defineComponent,
    defineAsyncComponent,
    onMounted,
    ref,
    reactive,
    getCurrentInstance,
    render,
    createVNode
}
from 'vue'

export default defineComponent({
    name: 'gp-o2m-form',
    props: ['cid', 'metas', 'model', 'cdata', 'mode','rel'],
    setup(props) {
        const {
            proxy
        } = getCurrentInstance()
            //const mode = ref('new')
        const page = ref(1)
        const pageSize = ref(1)
        const showSearch = ref(false)
        const colsType = reactive({})
        const colsLabel = reactive({})
        const selOptions = reactive({})
        const fields = reactive([])
        const cols = reactive([])
        const o2mcols = reactive([])
        const multipleSelection = reactive([])

        const readonly = col => {
            return props.mode == 'lookup' || isCompute(col)
        }

        const handleSelectionChange = val => {
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }

        const handleCurrentChange = val => {
            page.value = val

        }



        const isCompute = col => {
            return (
                ('compute' in props.metas[props.model].meta.columns[col] &&
                    props.metas[props.model].meta.columns[col].compute != null) ||
                colsType[col] == 'composite'
            )
        }

        const _get_selections = s => {
            let r = []
            for (let j = 0; j < s.length; j++) r.push({
                label: s[j][1],
                value: s[j][0]
            })
            return r
        }

        const on_find_new = (value, opts) => {
            console.log('on_find_new:', value, opts)
            if (
                ['new', 'edit'].indexOf(props.mode) >= 0 &&
                value.id &&
                value.id.length > 0 &&
                value.name &&
                value.name.length > 0
            )
            ;
            //props.cdata[opts.col] = value
        }

        const fieldsBuild = (model, view) => {
            let fcols = []
            for (let i = 0, columns = props.metas[model].views[view].columns.map((v) => v.col).filter((c) => c != props.rel), k = {}; i < columns.length; i++)
                switch (props.metas[model].meta.columns[columns[i]].type) {
                    case 'one2many':
                        k = {}
                        if (props.metas[model].meta.columns[columns[i]].obj != model)
                            k[columns[i]] = fieldsBuild(props.metas[model].meta.columns[columns[i]].obj, 'form')
                        else k[columns[i]] = props.metas[model].views.form.columns.map((v) => v.col)
                        fcols.push(k)
                        break
                    case 'many2many':
                        k = {}
                        k[columns[i]] = props.metas[model].meta.columns[columns[i].obj].views.m2mlist.columns.map((v) => v.col)
                        fcols.push(k)
                        break
                    default:
                        fcols.push(columns[i])
                }
            return fcols
        }

        const do_find = col => {
            const rootComponent = defineAsyncComponent({
                loader: () =>
                    import ('./gp-find.vue'),
                suspensible: false
            })
            const rootProps = {
                cid: props.cid,
                model: props.metas[props.model].meta.columns[col].obj,
                mode: 'single',
                callback: on_find_new,
                callbackOpts: {
                    col: col,
                    mode: 'find'
                }
            }
            const vnode = createVNode(rootComponent, rootProps)
            vnode.appContext = proxy.$appcontext
            const rootContainer = document.createElement('div')
            render(vnode, rootContainer, false)
            document.querySelector('#sv').appendChild(rootContainer)
        }

        const do_modal_form = (col, oid, mode) => {
            const rootComponent = defineAsyncComponent({
                loader: () =>
                    import ('./gp-form-modal.vue'),
                suspensible: false
            })
            const rootProps = {
                cid: props.cid,
                model: props.metas[props.model].meta.columns[col].obj,
                oid: oid,
                mode: mode
            }
            if (mode === 'new') {
                rootProps.callback = on_find_new
                rootProps.callbackOpts = {
                    col: col,
                    mode: 'new'
                }
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
                case 'new':
                    //mode.value = 'new'
                    break
                case 'edit':
                    //mode.value = 'edit'
                    break
                case 'lookup':
                    //mode.value = 'lookup'
                    break
                case 'find':
                    showSearch.value = true
                    break
            }
        }

        const do_add = col => {
            do_modal_form(col, null, 'new')
        }

        const do_edit = (col, oid) => {
            do_modal_form(col, oid, 'edit')
        }

        const do_lookup = (col, oid) => {
            do_modal_form(col, oid, 'lookup')
        }


        onMounted(() => {
            for (
                let i = 0,
                    c = props.metas[props.model].views.form.columns.map((v) => v.col).filter((c) => c != props.rel),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                if (colsType[c[i]] == 'selection') selOptions[c[i]] = _get_selections(meta[c[i]].selections)
                if (colsType[c[i]] == 'one2many') o2mcols.push(c[i])
                else cols.push(c[i])

                /* switch (meta[c[i]].type) {
                    case 'many2one':
                        props.cdata[c[i]] = {
                            id: null,
                            name: null
                        }
                        break
                    case 'one2many':
                    case 'many2many':
                        //props.cdata[c[i]] = []
                        break
                    case 'selection':
                        selOptions[c[i]] = _get_selections(meta[c[i]].selections)
                            //props.cdata[c[i]] = ''
                        break
                    case 'boolean':
                        //props.cdata[c[i]] = false
                        break
                    default:
                        break
                        //props.cdata[c[i]] = ''
                }
                */
            }
            fields.splice(0, fields.length, ...fieldsBuild(props.model, 'form'))
        })
        return {
            readonly,
            isCompute,
            showSearch,
            page,
            pageSize,
            multipleSelection,
            handleCurrentChange,
            handleSelectionChange,
            colsType,
            colsLabel,
            selOptions,
            fields,
            cols,
            o2mcols,
            fieldsBuild,
            do_action,
            do_find,
            do_add,
            do_edit,
            do_lookup,
            on_find_new,
        }
    }
})

</script>
