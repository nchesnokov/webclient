

<template>

<slot name="search">
    <el-row>
        <gp-selectable v-if="showSearch" :columns="metas[model].meta.columns" :names="metas[model].meta.names" :cid="cid" @update:search="do_search" @update:search-cancel="showSearch = false"></gp-selectable>
    </el-row>
</slot>
<slot>
    <el-row>{{ mode +':' + metas[model].meta.description }}</el-row>
    <el-row>
       <el-dropdown @command="i18nCommand">
          <span class="el-dropdown-link">
            {{$UserPreferences.lang.toLowerCase()}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="lang in $UserPreferences.langs" :key=lang.code :command="{lang:lang.code}">{{lang.description}}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
    

    </el-row>
    <el-row>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="do_action('find')"></el-button>
        <el-button v-if="multipleSelection.length == 0" type="primary" size="mini" icon="el-icon-document-add" @click="do_action('new')"></el-button>
        <el-button v-if="multipleSelection.length > 0" type="primary" size="mini" icon="el-icon-edit" @click="do_action('edit')"></el-button>
        <el-button v-if="multipleSelection.length > 0" type="primary" size="mini" icon="el-icon-view" @click="do_action('lookup')"></el-button>

    </el-row>
    <el-pagination v-if="multipleSelection.length > 1" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="multipleSelection.length">
    </el-pagination>
    <el-form :model="dataForm" label-width="auto">
        <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
            <el-input v-model="dataForm[col].name" v-if="['many2one','related'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
                <template #suffix>
                    <el-button type="primary" size="mini" icon="el-icon-search" @click="do_find(col)"></el-button>
                    <el-button type="primary" size="mini" icon="el-icon-document-add" @click="do_add(col)"></el-button>
                    <el-button v-if="dataForm[col].id != null" type="primary" size="mini" icon="el-icon-edit" @click="do_edit(col,dataForm[col].id)"></el-button>
                    <el-button v-if="dataForm[col].id != null" type="primary" size="mini" icon="el-icon-view" @click="do_lookup(col,dataForm[col].id)"></el-button>
                </template>
            </el-input>

            <el-input v-model="dataForm[col]" maxlength="10" show-word-limit v-else-if="['char','varchar','composite'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
                <template #prefix>
                   <el-dropdown v-if="colsTranslate[col]" @command="i18nCommand">
                      <span class="el-dropdown-link">
                        {{colsLang[col].toLowerCase()}}<i class="el-icon-arrow-down el-icon--right"></i>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item v-for="lang in $UserPreferences.langs" :key=lang.code :command="{col:col,lang:lang.code}">{{lang.description}}</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                 </template>
            </el-input>

            <json-viewer v-if="colsType[col] == 'json'" :value="dataForm[col]" copyable boxed sort />
            <el-input v-model="dataForm[col]" v-else-if="['integer','float','decimal','numeric','timedelta'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)"></el-input>
            <el-input v-model="dataForm[col]" type="textarea" v-else-if="['text','xml'].indexOf(colsType[col]) >= 0" :readonly="readonly(col)">            
            </el-input>
            <el-date-picker v-model="dataForm[col]" v-else-if="colsType[col] == 'date'" :readonly="readonly(col)"></el-date-picker>
            <el-time-picker v-model="dataForm[col]" v-else-if="colsType[col] == 'time'" :readonly="readonly(col)"></el-time-picker>
            <el-date-picker v-model="dataForm[col]" type="datetime" v-else-if="colsType[col] == 'datetime'" :readonly="readonly(col)"></el-date-picker>
            <el-select v-model="dataForm[col]" v-else-if="colsType[col] == 'selection'" :disabled="readonly(col)">
                <el-option v-for="item in selOptions[col]" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
            <gp-m2m-list :metas="metas" :model="metas[model].meta.columns[col].obj" :tableData="dataForm[col]" v-else-if="colsType[col] == 'many2many'">{{ colsLabel[col] }}</gp-m2m-list>
            <el-checkbox v-model="dataForm[col]" v-else-if="colsType[col] == 'boolean'" :disabled="readonly(col)"></el-checkbox>
            <el-image v-else-if="colsType[col] == 'binary' && metas[model].meta.columns[col].accept == 'image/*'" style="width: 100px; height: 100px" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" fit="fit"></el-image>
        </el-form-item>
        <el-tabs type="border-card" v-if="o2mcols.length > 0">
            <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
                <gp-o2m-components :cid="cid" :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" :cdata="dataForm[o2mcol]" :mode="mode"/>
            </el-tab-pane>
        </el-tabs>
    </el-form>
</slot>
<slot name="footer">
    <el-popconfirm confirmButtonText='OK' cancelButtonText='No, Thanks' icon="el-icon-info" iconColor="red" title="Are you sure to cancel?" @confirm="onCancel">
        <template #reference>
            <el-button type="danger">Cancel</el-button>
        </template>
    </el-popconfirm>
    <el-button type="success" @click="onValidate">Validate</el-button>
    <el-button type="primary" @click="onSubmit">Save</el-button>
</slot>

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
    name: 'gp-form',
    props: ['cid', 'metas', 'model'],
    setup(props) {
        const {
            proxy
        } = getCurrentInstance()
        const mode = ref('new')
        const page = ref(1)
        const pageSize = ref(1)
        const showSearch = ref(false)
        const colsType = reactive({})
        const colsLabel = reactive({})
        const colsTranslate = reactive({})
        const colsLang = reactive({})
        const dataForm = reactive({})
        const selOptions = reactive({})
        const fields = reactive([])
        const cols = reactive([])
        const o2mcols = reactive([])
        const multipleSelection = reactive([])

        const readonly = col => {
            return mode.value == 'lookup' || isCompute(col)
        }

        const i18nCommand = (command) =>{
          console.log('command-18n:',command)
          colsLang[command.col] = command.lang
        };
        const handleSelectionChange = val => {
            console.log('selection:', val)
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }

        const handleCurrentChange = val => {
            page.value = val
            proxy.$websocket.send({
                    _msg: [
                        props.cid,
                        'models',
                        props.model,
                        'read', {
                            fields: fields,
                            ids: multipleSelection[page.value - 1],
                            context: proxy.$UserPreferences.Context
                        }
                    ]
                },
                on_read
            )
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
                ['new', 'edit'].indexOf(mode.value) >= 0 &&
                value.id &&
                value.id.length > 0 &&
                value.name &&
                value.name.length > 0
            )
                dataForm[opts.col] = value
        }

        const fieldsBuild = (model, view) => {
            let fcols = []
            for (let i = 0, columns = props.metas[model].views[view].columns.map((v) => v.col), k = {}; i < columns.length; i++)
                switch (props.metas[model].meta.columns[columns[i]].type) {
                    case 'one2many':
                        k = {}
                        if (props.metas[model].meta.columns[columns[i]].obj != model)
                            k[columns[i]] = fieldsBuild(props.metas[model].meta.columns[columns[i]].obj, 'form')
                        else k[columns[i]] = props.metas[model].views.list.columns.map((v) => v.col)
                        fcols.push(k)
                        break
                    case 'many2many':
                        k = {}
                        k[columns[i]] = props.metas[props.metas[model].meta.columns[columns[i]].obj].views.m2mlist.columns.map((v) => v.col)
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
            document.body.appendChild(rootContainer)
            console.log('do-search!', col, vnode, proxy)
        }

        const do_search = event => {
            proxy.$websocket.send({
                    _msg: [
                        props.cid,
                        'models',
                        props.model,
                        'search', {
                            cond: event.cond,
                            context: proxy.$UserPreferences.Context,                            
                            offset: event.offset.value,
                            limit: event.limit.value
                            }
                    ]
                },
                on_search
            )
        }

        const on_search = msg => {
            console.log('on-search:', msg)
            if (msg.length > 0) {
                multipleSelection.splice(0, multipleSelection.length, ...msg)
                showSearch.value = false
                mode.value = 'edit'
                proxy.$websocket.send({
                        _msg: [
                            props.cid,
                            'models',
                            props.model,
                            'read', {
                                fields: fields,
                                ids: multipleSelection[page.value - 1],
                                context: proxy.$UserPreferences.Context
                            }
                        ]
                    },
                    on_read
                )
            }
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
            console.log('action:', action)
            switch (action) {
                case 'new':
                    mode.value = 'new'
                    break
                case 'edit':
                    mode.value = 'edit'
                    break
                case 'lookup':
                    mode.value = 'lookup'
                    break
                case 'find':
                    showSearch.value = true
                    break
            }
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
        }

        const onValidate = () => {
            console.log('validate')
        }

        const onCancel = () => {
            console.log('cancel!')
            for (
                let i = 0,
                    c = Object.keys(props.metas[props.model].views.form.columns),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
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
                        dataForm[c[i]] = ''
                        break
                    case 'boolean':
                        dataForm[c[i]] = false
                        break
                    default:
                        dataForm[c[i]] = ''
                }
            }
        }

        const on_read = msg => {
            console.log('on_read:', msg)
            if (msg && msg.length > 0) Object.assign(dataForm, msg[0])
        }

        onMounted(() => {
            for (
                let i = 0,
                    c = props.metas[props.model].views.form.columns.map((v) => v.col),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                colsTranslate[c[i]] = 'translate' in meta[c[i]] ? meta[c[i]].translate:false
                colsLang[c[i]] = proxy.$UserPreferences.lang
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
            console.log('translate:',colsTranslate,colsType)
            fields.splice(0, fields.length, ...fieldsBuild(props.model, 'form'))
            if (mode.value !== 'new')
                proxy.$websocket.send({
                        _msg: [props.cid, 'models', props.model, 'select', {
                            fields: fields,
                            context: proxy.$UserPreferences.Context,
                            limit: 1
                        }]
                    },
                    on_read
                )
                //console.log('fields:',fields);
        })
        return {
            mode,
            readonly,
            i18nCommand,
            isCompute,
            showSearch,
            page,
            pageSize,
            multipleSelection,
            handleCurrentChange,
            handleSelectionChange,
            colsType,
            colsLabel,
            colsTranslate,
            colsLang,
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
            on_search,
            do_action,
            do_find,
            do_add,
            do_edit,
            do_lookup,
            on_find_new,
            on_read
        }
    }
})

</script>
