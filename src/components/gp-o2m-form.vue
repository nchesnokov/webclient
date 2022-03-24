<template>
    <el-pagination
        v-if="cdata.length > 1"
        background
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :page-size="pageSize"
        :total="cdata.length"
    ></el-pagination>

    <el-form
        v-if="cdata.length > 0"
        :modelValue="cdata[page - 1].__data__"
        label-width="auto"
        status-icon
        inline-message
    >
        <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
            <el-input
            v-model="cdata[page-1].__data__[col].name"
                @change="m2o_cache(cdata[page-1], col)"
                v-if="['many2one', 'referenced', 'related'].indexOf(colsType[col]) >= 0"
                :prefix-icon="isCompute(col) ? 'el-icon-s-data' : ''"
                :readonly="readonly(col)"
            >
                <template #suffix>
                    <el-button type="primary" size="small" :icon="Search" @click="do_find(col, 'single', [], { 'item': cdata[page - 1] })"></el-button>
                    <el-button type="primary" size="small" :icon="DocumentAdd" @click="do_add(col)"></el-button>
                    <el-button
                        v-if="cdata[page - 1].__data__[col].id != null"
                        type="primary"
                        size="small"
                        :icon="Edit"
                        @click="do_edit(col, cdata[page - 1].__data__[col].id)"
                    ></el-button>
                    <el-button
                        v-if="cdata[page - 1].__data__[col].id != null"
                        type="primary"
                        size="small"
                        :icon="View"
                        @click="do_lookup(col, cdata[page - 1].__data__[col].id)"
                    ></el-button>
                </template>
            </el-input>
            <json-viewer
                v-if="colsType[col] == 'json'"
                :value="cdata[page - 1].__data__[col]"
                copyable
                boxed
                sort
            />

            <el-input
            v-model="cdata[page-1].__data__[col]"
                @change="cache(cdata[page-1], col)"
                v-else-if="['char', 'varchar', 'composite', 'decomposite', 'tree'].indexOf(colsType[col]) >= 0"
                :prefix-icon="isCompute(col) ? 'el-icon-s-data' : ''"
                :readonly="readonly(col)"
            >
                <template #prefix>
                    <el-dropdown v-if="colsTranslate[col]" @command="i18nCommand">
                        <span class="el-dropdown-link">
                            {{ colsLang[col].toLowerCase() }}
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="lang in $UserPreferences.langs"
                                    :key="lang.code"
                                    :command="{ col: col, lang: lang.code }"
                                >{{ lang.description }}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-input>

            <el-input
            v-model="cdata[page-1].__data__[col]"
                @change="cache(cdata[page-1], col)"
                v-else-if="['integer', 'float', 'decimal', 'numeric', 'timedelta'].indexOf(colsType[col]) >= 0"
                :prefix-icon="isCompute(col) ? 'el-icon-s-data' : ''"
                :readonly="readonly(col)"
            >
                <template #prefix>
                    <el-button
                        type="primary"
                        size="small"
                        icon="el-icon-monitor"
                        v-if="isCompute(col)"
                    ></el-button>
                </template>
            </el-input>
            <el-input
                v-model="cdata[page-1].__data__[col]"
                @change="cache(cdata[page-1], col)"
                autosize
                type="textarea"
                v-else-if="['text', 'xml'].indexOf(colsType[col]) >= 0"
                :prefix-icon="isCompute(col) ? 'el-icon-s-data' : ''"
                :readonly="readonly(col)"
            ></el-input>
            <el-date-picker
                :modelValue="cdata[page - 1].__data__[col]"
                @update:modelValue="cache($event)"
                v-else-if="colsType[col] == 'date'"
                :readonly="readonly(col)"
            ></el-date-picker>
            <el-time-picker
                :modelValue="cdata[page - 1].__data__[col]"
                @update:modelValue="cache($event)"
                v-else-if="colsType[col] == 'time'"
                :readonly="readonly(col)"
            ></el-time-picker>
            <el-date-picker
                :modelValue="cdata[page - 1].__data__[col]"
                @update:modelValue="cache($event)"
                type="datetime"
                v-else-if="colsType[col] == 'datetime'"
                :readonly="readonly(col)"
            ></el-date-picker>
            <el-select
                :modelValue="cdata[page - 1].__data__[col]"
                @update:modelValue="cache($event)"
                v-else-if="colsType[col] == 'selection'"
                :disabled="readonly(col)"
            >
                <el-option
                    v-for="item in selOptions[col]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
            <gp-m2m-list
                :metas="metas"
                :model="metas[model].meta.columns[col].obj"
                :tableData="cdata[page - 1].__m2m_containers__[col]"
                v-else-if="colsType[col] == 'many2many'"
            >{{ colsLabel[col] }}</gp-m2m-list>
            <el-checkbox
                :value="cdata[page - 1].__data__[col]"
                @update:modelValue="cache($event)"
                v-else-if="colsType[col] == 'boolean'"
                :disabled="readonly(col)"
            ></el-checkbox>
            <el-image
                v-else-if="colsType[col] == 'binary' && metas[model].meta.columns[col].accept == 'image/*'"
                style="width: 100px; height: 100px"
                src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
                fit="fit"
            ></el-image>
        </el-form-item>
        <el-tabs type="border-card" v-if="o2mcols.length > 0">
            <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
                <gp-o2m-components
                    :cid="cid"
                    :metas="metas"
                    :model="metas[model].meta.columns[o2mcol].obj"
                    :cdata="cdata[page - 1].__o2m_containers__[o2mcol]"
                    :mode="mode"
                    :rel="metas[model].meta.columns[o2mcol].rel"
                />
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

import { Monitor, Search, DocumentAdd, Edit, View } from '@element-plus/icons-vue'
import { on_modify_models } from '../js/nf.js'

export default defineComponent({
    name: 'gp-o2m-form',
    props: ['cid', 'guid', 'root', 'metas', 'model', 'container', 'cdata', 'mode', 'rel'],
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
        const colsTranslate = reactive({})
        const colsLang = reactive({})
        const selOptions = reactive({})
        const fields = reactive([])
        //const dataForm = reactive({})
        const cols = reactive([])
        const o2mcols = reactive([])
        const multipleSelection = reactive([])

        const readonly = col => {
            return props.mode == 'lookup' || isCompute(col)
        }

        const i18nCommand = command => {
            //console.log('command-18n:',command)
            colsLang[command.col] = command.lang
        }


        const handleSelectionChange = val => {
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }

        const handleCurrentChange = val => {
            page.value = val

        }

        const m2o_cache = (item, name) => {
            console.log('m2o_cache:', name, item.__data__[name], item)
            if (item.__data__[name].name.length == 0) {
                item.__data__[name].id = null
                item.__data__[name].name = null
                cache(item, name);
                return
            }
            let r = {
                'path': item.__path__,
                'model': item.__model__,
                'key': name,
                'value': item.__data__[name],
                'context': proxy.$UserPreferences.Context
            }
            //console.log('cache:',r);
            proxy.$websocket.sendAsync({
                '_msg': [props.cid, '_cache', 'm2ofind', guid.value, r]
            }).then((v) => {
                console.log('m2ofind:', v);
                let f = v[0];
                if (f.__m2o_find__.__data__.v.length == 1) {
                    dataForm.__data__[name] = f.__m2o_find__.__data__.v[0];
                    cache(item, name);
                } else {
                    let extcond = [];
                    if ('domain' in props.metas[props.model].meta.columns[name] && props.metas[props.model].meta.columns[name].domain != null)
                        for (let i = 0, d = props.metas[props.model].meta.columns[name].domain; i < d.length; i++) extcond.push({
                            '__tuple__': d[i]
                        });
                    if (f.__m2o_find__.__data__.v.length > 1) extcond.push({
                        '__tuple__': ['id', 'in', f.__m2o_find__.__data__.v]
                    })
                    do_find(name, 'single', extcond, {
                        'item': item,
                        'mode': 'autofind'
                    })
                }
            });
        }

        const related_cache = (item, name, relatedy) => {
            if (item.__data__[name].name.length == 0) {
                item.__data__[name].id = null
                item.__data__[name].name = null
                cache(item, name);
                return
            }
            let r = {
                'path': item.__path__,
                'model': item.__model__,
                'key': name,
                'value': item.__data__[name],
                'relatedy': relatedy,
                'context': proxy.$UserPreferences.Context
            }
            //console.log('cache-related:',r);
            proxy.$websocket.sendAsync({
                '_msg': [props.cid, '_cache', 'relatedfind', guid.value, r]
            }).then((v) => {
                console.log('relatedfind:', v);
                let f = v[0];
                if (f.__related_find__.__data__.v.length == 1) {
                    dataForm.__data__[name] = f.__related_find__.__data__.v[0];
                    cache(item, name);
                } else {
                    let extcond = [];
                    if ('domain' in props.metas[props.model].meta.columns[name] && props.metas[props.model].meta.columns[name].domain != null)
                        for (let i = 0, d = props.metas[props.model].meta.columns[name].domain; i < d.length; i++) extcond.push({
                            '__tuple__': d[i]
                        });
                    if ('relatedy' in props.metas[props.model].meta.columns[name] && props.metas[props.model].meta.columns[name].relatedy != null)
                        for (let i = 0, relatedy, relatedyd; i < props.metas[props.model].meta.columns[name].relatedy.length; i++) {
                            relatedy = props.metas[props.model].meta.columns[name].relatedy[i].__tuple__[0];
                            relatedyd = props.metas[props.model].meta.columns[name].relatedy[i].__tuple__[1];
                            if (item.__data__[relatedy] != null && item.__data__[relatedy].name != null && item.__data__[relatedy].name.length > 0) extcond.push({
                                __tuple__: [relatedyd, '=', item.__data__[relatedy].name]
                            });

                            if (f.__relatedy_find__.__data__.v.length > 1) extcond.push({
                                '__tuple__': ['id', 'in', f.__related_find__.__data__.v]
                            })
                            do_find(name, 'single', extcond, {
                                'item': item,
                                'mode': 'autofind'
                            })
                        }
                }
            });
        }


        const cache = (item, name) => {
            console.log('cache-item:', name, item.__data__[name], item)
            let value
            switch (props.metas[props.model].meta.columns[name].type) {
                case 'integer':
                    value = parseInt(item.__data__[name], 10)
                    break
                case 'float':
                case 'double':
                    value = parseFloat(item.__data__[name])
                    break
                case 'real':
                case 'decimal':
                case 'numeric':
                    value = {
                        __decimal__: item.__data__[name]
                    }
                    break
                case 'datetime':
                    if (props.metas[props.model].meta.columns[name].timezone)
                        value = {
                            __datetime_tz__: item.__data__[name].toJsonString()
                        }
                    else
                        value = {
                            __datetime__: item.__data__[name].toJsonString()
                        }
                    break
                case 'date':
                    value = {
                        __date__: item.__data__[name]
                    }
                    break
                case 'time':
                    if (props.metas[props.model].meta.columns[name].timezone)
                        value = {
                            __time_tz__: item.__data__[name]
                        }
                    else
                        value = {
                            __time__: item.__data__[name]
                        }
                    break
                case 'timedelta':
                    value = {
                        __timedelta__: item.__data__[name]
                    }
                    break
                case 'many2one':
                case 'related':
                    //console.log('typeof-value:',typeof item[name]);
                    if ('__data__' in item) {
                        if (typeof item.__data__[name] == 'object') value = item.__data__[name]
                        else {
                            value = {
                                id: item.__data__[name].id,
                                name: item.__data__[name].name
                            }
                            item.__data__.id = value.id
                            item.__data__.name = value.name
                        }
                    } else {
                        if (typeof item[name] == 'object') value = item[name]
                        else {
                            value = {
                                id: item[name].id,
                                name: item[name].name
                            }
                            item.__data__.id = value.id
                            item.__data__.name = value.name
                        }
                    }
                    break
                default:
                    value = item.__data__[name]
            }
            let r = {
                path: item.__path__,
                key: name,
                value: value,
                context: proxy.$UserPreferences.Context
            }
            console.log('cache:', r)
            proxy.$websocket
                .sendAsync({
                    _msg: [props.cid, '_cache', 'cache', props.guid, r]
                })
                .then(v => {
                    console.log('cache:', v);
                    on_modify_models(props.root.dataForm,v[0]);
                })
        }

        const cache1 = (event) => {
            console.log('event-cache:', event)
        }

        const isCompute = col => {
            return (
                ('compute' in props.metas[props.model].meta.columns[col] &&
                    props.metas[props.model].meta.columns[col].compute != null) ||
                ['composite', 'tree'].indexOf(colsType[col]) >= 0
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
                ['new', 'edit'].indexOf(opts.mode.value) >= 0 &&
                value.id &&
                value.id.length > 0 &&
                value.name &&
                value.name.length > 0
            )
                dataForm.__data__[opts.col] = value
                opts.item.__data__[opts.col] = value
            cache(opts.item, opts.col);
        }

        const on_find_m2m = (value, opts) => {
            console.log('on_find_m2m:', value, opts)
            if (
                ['new', 'edit'].indexOf(mode.value) >= 0 &&
                value.length > 0
            )
                dataForm.__m2m_containers__[opts.col].splice(dataForm.__m2m_containers__[opts.col].length, 0, ...value)
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

        const do_find = (col, mode = 'single', extcond = [], callbackopts = {}) => {
            const rootComponent = defineAsyncComponent({
                loader: () =>
                    import('./gp-find.vue'),
                suspensible: false
            })
            const rootProps = {
                cid: props.cid,
                model: props.metas[props.model].meta.columns[col].obj,
                mode: mode,
                callback: mode == 'single' ? on_find_new : on_find_m2m,
                extcond: extcond,
                callbackOpts: {
                    ...callbackopts,
                    col: col,
                    mode: 'mode' in callbackopts ? callbackopts.mode : 'find'
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
                    import('./gp-form-modal.vue'),
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
                colsTranslate[c[i]] = 'translate' in meta[c[i]] ? meta[c[i]].translate : false
                colsLang[c[i]] = proxy.$UserPreferences.lang
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
            //Object.assign(dataForm,props.cdata[page.value-1])
            //console.log('o2mdataform',dataForm)

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
            colsTranslate,
            selOptions,
            //dataForm,
            fields,
            cols,
            o2mcols,
            fieldsBuild,
            i18nCommand,
            do_action,
            do_find,
            do_add,
            do_edit,
            do_lookup,
            on_find_new,
            cache,
            m2o_cache,
            related_cache,
            on_modify_models,
            Search,
            Monitor,
            DocumentAdd,
            Edit,
            View
        }
    }
})

</script>
