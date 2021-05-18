

<template>

<el-dialog :title="title" v-model="showDialog" width="75%">
    <el-pagination v-if="oid != null && typeof oid == 'object' && oid.length > 1" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="oid.length">
    </el-pagination>
    <el-form v-if="'__data__' in dataForm && Object.keys(dataForm.__data__).length > 0" :model="dataForm.__data__" label-width="auto">
        <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
            <el-input v-model="dataForm.__data__[col].name" v-if="['many2one','related'].indexOf(colsType[col]) >= 0" @change="cache(dataForm,col)" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
                <template #suffix>
                    <el-button type="primary" size="mini" icon="el-icon-search" @click="do_search(col)"></el-button>
                    <el-button type="primary" size="mini" icon="el-icon-document-add" @click="do_add(col)"></el-button>
                    <el-button v-if="dataForm.__data__[col].id != null" type="primary" size="mini" icon="el-icon-edit" @click="do_edit(col,dataForm.__data__[col]).id"></el-button>
                    <el-button v-if="dataForm.__data__[col].id != null" type="primary" size="mini" icon="el-icon-view" @click="do_lookup(col,dataForm.__data__[col].id)"></el-button>
                </template>
            </el-input>
            <json-viewer v-if="colsType[col] == 'json'" :value="dataForm.__data__[col]" copyable boxed sort />
            <el-input v-model="dataForm.__data__[col]" v-else-if="['uuid','char','varchar','composite','integer','float','decimal','numeric','timedelta'].indexOf(colsType[col]) >= 0" @change="cache(dataForm,col)"  :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
                <template #ffix>
                    <el-button type="primary" size="mini" icon="el-icon-monitor" v-if="isCompute(col)"></el-button>
                </template>
            </el-input>
            <el-input v-model="dataForm.__data__[col]" autosize type="textarea" v-else-if="['text','xml'].indexOf(colsType[col]) >= 0" @change="cache(dataForm,col)" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)"></el-input>
            <el-date-picker v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'date'" @change="cache(dataForm,col)" :readonly="readonly(col)"></el-date-picker>
            <el-time-picker v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'time'" @change="cache(dataForm,col)" :readonly="readonly(col)"></el-time-picker>
            <el-date-picker v-model="dataForm.__data__[col]" type="datetime" v-else-if="colsType[col] == 'datetime'" @change="cache(dataForm,col)" :readonly="readonly(col)"></el-date-picker>
            <el-select v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'selection'" @change="cache(dataForm,col)" :disabled="readonly(col)">
                <el-option v-for="item in selOptions[col]" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
            <gp-m2m-list :metas="metas" :model="metas[model].meta.columns[col].obj" :tableData="dataForm.__m2m_containers__[col]" v-else-if="colsType[col] == 'many2many'">{{ colsLabel[col] }}</gp-m2m-list>
            <el-checkbox v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'boolean'" @change="cache(dataForm,col)" :disabled="readonly(col)"></el-checkbox>
            <el-image v-else-if="colsType[col] == 'binary' && metas[model].meta.columns[col].accept == 'image/*'" style="width: 100px; height: 100px" :src="dataForm.__data__[col]" fit="fit"></el-image>
        </el-form-item>
        <el-tabs type="border-card" v-if="o2mcols.length > 0">
            <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
                <gp-o2m-components :cid="cid" :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" :cdata="dataForm.__o2m_containers__[o2mcol]" :mode="mode" :rel="metas[model].meta.columns[o2mcol].rel"/>
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
    onBeforeMount,
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
        const guid = ref(null)
        //const visible = ref(false)
        const page = ref(1)
        const pageSize = ref(1)
        const metas = reactive({})
        const colsType = reactive({})
        const colsLabel = reactive({})
        const dataForm = reactive({'__data__':{}})
        const selOptions = reactive({})
        const fields = reactive([])
        const cols = reactive([])
        const o2mcols = reactive([])

        const cache = (item,name) => {
              //console.log('cache:',name,item.__data__[name],item);
              let value;
              switch(metas[props.model].meta.columns[name].type){
                  case 'integer':
                    value = parseInt(item.__data__[name],10);
                    break;
                case 'float':
                case 'double':
                    value = parseFloat(item.__data__[name]);
                    break;
                case 'real':
                case 'decimal':
                case 'numeric':
                    value = {'__decimal__':item.__data__[name]};
                    break;
                case 'datetime':
                    if (metas[props.model].meta.columns[name].timezone) value = {'__datetime_tz__':item.__data__[name].toJsonString()};
                    else value = {'__datetime__':item.__data__[name].toJsonString()};
                    break;
                case 'date':
                    value = {'__date__':item.__data__[name]};
                    break;
                case 'time':
                    if (metas[props.model].meta.columns[name].timezone) value = {'__time_tz__':item.__data__[name]};
                    else value = {'__time__':item.__data__[name]};
                    break;
                case 'timedelta':
                    value = {'__timedelta__':item.__data__[name]};
                    break;
                case 'many2one':
                case 'related':
                    //console.log('typeof-value:',typeof item[name]);
                    if ('__data__' in item){
                    if (typeof item.__data__[name] == 'object') value = item.__data__[name];
                    else  {value = {'id':item.__data__[name].id,'name':item.__data__[name].name}; item.__data__.id =value.id;item.__data__.name =value.name;}
                    }
                    else{
                    if (typeof item[name] == 'object') value = item[name];
                    else  {value = {'id':item[name].id,'name':item[name].name};item.__data__.id = value.id;item.__data__.name = value.name;}
                        }
                    break;
                default:
                    value = item.__data__[name];
                  }
              let r = {'path':item.__path__,'key':name,'value':value,'context':{}}
             //console.log('cache:',r);
              proxy.$websocket.sendAsync({_msg:[props.cid,'_cache','cache',guid.value,r]}).then((v) => console.log('cache:',v));
              }

        const title = computed(() => {
            return props.mode + ':' + (Object.keys(metas).length > 0 ? metas[props.model].meta.description : ref(''))
        })

        const readonly = col => {
            return props.mode.value == 'lookup' || dataForm.__meta__.ro[col] || isCompute(col)
        }

        const required = (path,col) => {
          console.log('required:',path,col)
          return dataForm.__meta__.rq[col]
        }


         const visible = (path,col) => {
           console.log('required:',path,col)
           return !dataForm.__meta__.iv[col]
         }

        const isCompute = col => {
            return (
                ('compute' in metas[props.model].meta.columns[col] && metas[props.model].meta.columns[col].compute != null) ||
                colsType[col] == 'composite'
            )
        }

        const handleCurrentChange = val => {
            //visible.value = true
            page.value = val
            proxy.$websocket.send({
                    _msg: [
                        props.cid,
                        'models',
                        props.model,
                        'readforupdate', {
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
            //console.log('on_find_new:', props.mode,value, opts)
            if ((['new', 'edit'].indexOf(props.mode) >= 0 || opts.mode == 'find' ) && value.id.length > 0 && value.name.length)
                dataForm.__data__[opts.col] = value
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
                        __tuple__: [relatedy[i], '=',  ['many2one','related'].indexOf(colsType[relatedy[i]]) >= 0 ? dataForm.__data__[relatedy[i]].name : dataForm.__data__[relatedy[i]]]
                    })
                if ('extcond' in rootProps) rootProps.extcond.splice(0, 0, ...extcond)
                else rootProps.extcond = extcond
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
        }

        const do_edit = (col, oid) => {
            do_modal_form(col, oid, 'edit')
        }

        const do_lookup = (col, oid) => {
            do_modal_form(col, oid, 'lookup')
        }

        const onSubmit = () => {
            if (props.callback != null && props.callbackOpts != null && props.callbackOpts.mode == 'new')
                props.callback({
                    id: dataForm.__data__.id,
                    name: dataForm.__data__[metas[props.model].meta.names.rec_name]
                }, props.callbackOpts)
            showDialog.value = false
        }

        const onValidate = () => {
            //console.log('validate')
            showDialog.value = false
        }

        const onCancel = () => {
            //console.log('cancel!')
            showDialog.value = false
        }

        const on_load_meta = msg => {
            //console.log('on-load-meta:', msg)
            if (msg && msg.length > 0) Object.assign(metas, msg[0])
            for (
                let i = 0, c = metas[props.model].views.form.columns.map((v) => v.col), meta = metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                if (colsType[c[i]] == 'selection') selOptions[c[i]] = _get_selections(meta[c[i]].selections)
                if (colsType[c[i]] == 'one2many') o2mcols.push(c[i])
                else cols.push(c[i])
/*
                switch (meta[c[i]].type) {
                    case 'many2one':
                    case 'related':
                        dataForm.__data__[c[i]] = {
                            id: null,
                            name: null
                        }
                        break
                    case 'one2many':
                        dataForm.__o2m_containers__ = {}
                        dataForm.__o2m_containers__[c[i]] = []
                        break
                    case 'many2many':
                        dataForm.__m2m_containers__ = {}
                        dataForm.__m2m_containers__ [c[i]] = []
                        break

                    case 'selection':
                        selOptions[c[i]] = _get_selections(meta[c[i]].selections)
                        dataForm.__data__[c[i]] = ''
                        break
                    case 'boolean':
                        dataForm.__data__[c[i]] = false
                        break
                    default:
                        dataForm.__data__[c[i]] = ''
                }
*/
            }
            fields.splice(0, fields.length, ...fieldsBuild(props.model, 'form'))
            if (props.oid != null && ['edit', 'lookup'].indexOf(props.mode) >= 0) {
                let ctx = Object.assign({},proxy.$UserPreferences.Context)
                ctx.cache = guid.value
                proxy.$websocket.send({
                        _msg: [
                            props.cid,
                            'models',
                            props.model,
                            'readforupdate', {
                                fields: fields,
                                ids: typeof props.oid == 'object' ? props.oid[0] : props.oid,
                                context: ctx
                            }
                        ]
                    },
                    on_read
                )
            }
        }

        const on_read = msg => {        
            console.log('on_read:', msg)
            if (msg && msg.length > 0) Object.assign(dataForm, msg[0])
        }

        onBeforeMount(() => {
            proxy.$websocket.sendAsync({_msg:[props.cid,'_cache','open',{'mode':props.mode,'context':proxy.$UserPreferences.Context}]}).then((msg) => {
              if (msg && msg.length > 0) guid.value = msg[0]
              if (props.mode.value == 'new') proxy.$websocket.sendAsync({_msg:[props.cid,'_cache','initialize',guid.value,{'model':props.model,'view':'form'}]}).then((msg) => {if (msg && msg.length > 0) Object.assign(dataForm, msg[0]);console.log('initialize:',msg)})
              
            })
        
            //proxy.$websocket.sendAsync({_msg:[props.cid,'_cache','open',{'mode':props.mode,'context':proxy.$UserPreferences.Context}]}).then((msg) => {guid.value = msg[0]})
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
            title,
            readonly,
            required,
            visible,
            page,
            pageSize,
            handleCurrentChange,
            metas,
            guid,
            cache,
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
