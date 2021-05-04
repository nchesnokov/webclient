

<template>

<el-dialog :title="title" v-model="showDialog" width="75%">
    <el-pagination v-if="oid != null && typeof oid == 'object' && oid.length > 1" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="oid.length">
    </el-pagination>
    <el-form :model="dataForm" label-width="auto">
        <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
            <el-input v-model="dataForm[col].name" v-if="['many2one','related'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
                <template #suffix>
                    <el-button type="primary" size="mini" icon="el-icon-search" @click="do_search(col)"></el-button>
                    <el-button type="primary" size="mini" icon="el-icon-document-add" @click="do_add(col)"></el-button>
                    <el-button v-if="dataForm[col].id != null" type="primary" size="mini" icon="el-icon-edit" @click="do_edit(col,dataForm[col].id)"></el-button>
                    <el-button v-if="dataForm[col].id != null" type="primary" size="mini" icon="el-icon-view" @click="do_lookup(col,dataForm[col].id)"></el-button>
                </template>
            </el-input>
            <json-viewer v-if="colsType[col] == 'json'" :value="dataForm[col]" copyable boxed sort />
            <el-input v-model="dataForm[col]" v-else-if="['char','varchar','composite','integer','float','decimal','numeric','timedelta'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
                <template #ffix>
                    <el-button type="primary" size="mini" icon="el-icon-monitor" v-if="isCompute(col)"></el-button>
                </template>
            </el-input>
            <el-input v-model="dataForm[col]" autosize type="textarea" v-else-if="['text','xml'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)"></el-input>
            <el-date-picker v-model="dataForm[col]" v-else-if="colsType[col] == 'date'" :readonly="readonly(col)"></el-date-picker>
            <el-time-picker v-model="dataForm[col]" v-else-if="colsType[col] == 'time'" :readonly="readonly(col)"></el-time-picker>
            <el-date-picker v-model="dataForm[col]" type="datetime" v-else-if="colsType[col] == 'datetime'" :readonly="readonly(col)"></el-date-picker>
            <el-select v-model="dataForm[col]" v-else-if="colsType[col] == 'selection'" :disabled="readonly(col)">
                <el-option v-for="item in selOptions[col]" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
            <gp-m2m-list :metas="metas" :model="metas[model].meta.columns[col].obj" :tableData="dataForm[col]" v-else-if="colsType[col] == 'many2many'">{{ colsLabel[col] }}</gp-m2m-list>
            <el-checkbox v-model="dataForm[col]" v-else-if="colsType[col] == 'boolean'" :disabled="readonly(col)"></el-checkbox>
            <el-image v-else-if="colsType[col] == 'binary' && metas[model].meta.columns[col].accept == 'image/*'" style="width: 100px; height: 100px" :src="dataForm[col]" fit="fit"></el-image>
        </el-form-item>
        <el-tabs type="border-card" v-if="o2mcols.length > 0">
            <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
                <gp-o2m-components :cid="cid" :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" :cdata="dataForm[o2mcol]" :mode="mode" :rel="metas[model].meta.columns[o2mcol].rel"/>
                <!-- <gp-list :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" :tableData="dataForm[o2mcol]" /> -->
            </el-tab-pane>
        </el-tabs>
    </el-form>
    <template #footer>
        <el-popconfirm confirmButtonText='OK' cancelButtonText='No, Thanks' icon="el-icon-info" iconColor="red" title="Are you sure to cancel?" @confirm="onCancel">
            <template #reference>
                <el-button type="danger">Cancel</el-button>
            </template>
        </el-popconfirm>
        <el-button type="success" @click="onValidate">Validate</el-button>
        <el-button type="primary" @click="onSubmit">Save</el-button>
    </template>
</el-dialog>

</template>

<script>

import {
    defineComponent,
    defineAsyncComponent,
    onMounted,
    reactive,
    ref,
    getCurrentInstance,
    render,
    createVNode,
    computed
}
from 'vue'

export default defineComponent({
    name: 'gp-form-modal',
    props: {
        cid: {
            type: String,
            required: true
        },
        oid: {
            type: [String, Object],
            default: null
        },
        model: {
            type: String,
            required: true
        },
        mode: {
            type: String,
            default: 'new'
        },
        callback: {
            type: Function,
            default: function() {
                return null
            }
        },
        callbackOpts: {
            type: Object,
            default: function() {
                return {}
            }
        }
    },
    setup(props) {
        const {
            proxy
        } = getCurrentInstance()
        const showDialog = ref(true)
        const visible = ref(false)
        const page = ref(1)
        const pageSize = ref(1)
        const metas = reactive({})
        const colsType = reactive({})
        const colsLabel = reactive({})
        const dataForm = reactive({})
        const selOptions = reactive({})
        const fields = reactive([])
        const cols = reactive([])
        const o2mcols = reactive([])

        const title = computed(() => {
            return props.mode + ':' + (Object.keys(metas).length > 0 ? metas[props.model].meta.description : ref(''))
        })

        const readonly = col => {
            return props.mode == 'lookup' || isCompute(col)
        }

        const isCompute = col => {
            return (
                ('compute' in metas[props.model].meta.columns[col] && metas[props.model].meta.columns[col].compute != null) ||
                colsType[col] == 'composite'
            )
        }

        const handleCurrentChange = val => {
            visible.value = true
            page.value = val
            proxy.$websocket.send({
                    _msg: [
                        props.cid,
                        'models',
                        props.model,
                        'read', {
                            fields: fields,
                            ids: props.oid[page.value - 1],
                            context: proxy.$UserPreferences.Context
                        }
                    ]
                },
                on_read
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

        const fieldsBuild = (model, view) => {
            let fcols = []
            for (let i = 0, columns = metas[model].views[view].columns.map((v) => v.col), k = {}; i < columns.length; i++)
                switch (metas[model].meta.columns[columns[i]].type) {
                    case 'one2many':
                        k = {}
                        if (metas[model].meta.columns[columns[i]].obj != model)
                            k[columns[i]] = fieldsBuild(metas[model].meta.columns[columns[i]].obj, 'form')
                        else k[columns[i]] = metas[model].views.list.columns.map((v) => v.col)
                        fcols.push(k)
                        break
                    case 'many2many':
                        k = {}
                        k[columns[i]] = metas[metas[model].meta.columns[columns[i]].obj].views.m2mlist.columns.map((v) => v.col)
                        fcols.push(k)
                        break
                    default:
                        fcols.push(columns[i])
                }
            return fcols
        }

        const on_find_new = (value, opts) => {
            console.log('on_find_new:', props.mode,value, opts)
            if ((['new', 'edit'].indexOf(props.mode) >= 0 || opts.mode == 'find' ) && value.id.length > 0 && value.name.length)
                dataForm[opts.col] = value
        }

        const do_search = col => {
            const rootComponent = defineAsyncComponent({
                loader: () =>
                    import ('./gp-find.vue'),
                suspensible: false
            })
            const rootProps = {
                cid: props.cid,
                model: metas[props.model].meta.columns[col].obj,
                mode: 'single',
                callback: on_find_new,
                callbackOpts: {
                    col: col,
                    mode: 'find'
                }
            }
            if ('domain' in metas[props.model].meta.columns[col] && metas[props.model].meta.columns[col].domain != null) {
                let extcond = []
                for (let i = 0, domain = metas[props.model].meta.columns[col].domain; i < domain.length; i++)
                    extcond.push({
                        __tuple__: domain[i]
                    })
                rootProps.extcond = extcond
            }

            if (metas[props.model].meta.columns[col].type == 'related') {
                let extcond = [],
                    relatedy = metas[props.model].meta.columns[col].relatedy
                for (let i = 0; i < relatedy.length; i++)
                    extcond.push({
                        __tuple__: [relatedy[i], '=',  ['many2one','related'].indexOf(colsType[relatedy[i]]) >= 0 ? dataForm[relatedy[i]].name : dataForm[relatedy[i]]]
                    })
                if ('extcond' in rootProps) rootProps.extcond.splice(0, 0, ...extcond)
                else rootProps.extcond = extcond
            }

            const vnode = createVNode(rootComponent, rootProps)
            vnode.appContext = proxy.$appcontext
            const rootContainer = document.createElement('div')
            render(vnode, rootContainer, false)
            document.querySelector('#sv').appendChild(rootContainer)
            console.log('do-search!', col, vnode, proxy)
        }

        const do_modal_form = (col, oid, mode) => {
            const rootComponent = defineAsyncComponent({
                loader: () =>
                    import ('./gp-form-modal.vue'),
                suspensible: false
            })
            const rootProps = {
                cid: props.cid,
                model: metas[props.model].meta.columns[col].obj,
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

        const do_add = col => {
            do_modal_form(col, null, 'new')
            console.log('do-add!', col)
        }

        const do_edit = (col, oid) => {
            do_modal_form(col, oid, 'edit')
            console.log('do-edit!', col, oid)
        }

        const do_lookup = (col, oid) => {
            do_modal_form(col, oid, 'lookup')
            console.log('do-lookup!', col, oid)
        }

        const onSubmit = () => {
            console.log('submit!')
            if (props.callback != null && props.callbackOpts != null && props.callbackOpts.mode == 'new')
                props.callback({
                    id: dataForm.id,
                    name: dataForm[metas[props.model].meta.names.rec_name]
                }, props.callbackOpts)
            showDialog.value = false
        }

        const onValidate = () => {
            console.log('validate')
            showDialog.value = false
        }

        const onCancel = () => {
            console.log('cancel!')
            showDialog.value = false
        }

        const on_load_meta = msg => {
            console.log('on-load-meta:', msg)
            if (msg && msg.length > 0) Object.assign(metas, msg[0])
            for (
                let i = 0, c = metas[props.model].views.form.columns.map((v) => v.col), meta = metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                if (colsType[c[i]] == 'one2many') o2mcols.push(c[i])
                else cols.push(c[i])

                switch (meta[c[i]].type) {
                    case 'many2one':
                        dataForm[c[i]] = {
                            id: null,
                            name: null
                        }
                        break
                    case 'one2many':
                    case 'many2many':
                        dataForm[c[i]] = []
                        break
                    case 'selection':
                        selOptions[c[i]] = _get_selections(meta[c[i]].selections)
                        dataForm[c[i]] = ''
                        break
                    case 'boolean':
                        dataForm[c[i]] = false
                        break
                    default:
                        dataForm[c[i]] = ''
                }
            }
            fields.splice(0, fields.length, ...fieldsBuild(props.model, 'form'))
            console.log('props.oid:', props.oid)
            if (props.oid != null && ['edit', 'lookup'].indexOf(props.mode) >= 0)
                proxy.$websocket.send({
                        _msg: [
                            props.cid,
                            'models',
                            props.model,
                            'read', {
                                fields: fields,
                                ids: typeof props.oid == 'object' ? props.oid[0] : props.oid,
                                context: proxy.$UserPreferences.Context
                            }
                        ]
                    },
                    on_read
                )
        }

        const on_read = msg => {
            console.log('on_read:', msg)
            if (msg && msg.length > 0) Object.assign(dataForm, msg[0])
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
            visible,
            title,
            readonly,
            page,
            pageSize,
            handleCurrentChange,
            metas,
            isCompute,
            colsType,
            colsLabel,
            dataForm,
            selOptions,
            fields,
            cols,
            o2mcols,
            fieldsBuild,
            onSubmit,
            onValidate,
            onCancel,
            do_search,
            do_add,
            do_edit,
            do_lookup,
            on_find_new
        }
    }
})

</script>
