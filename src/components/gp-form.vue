

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
    <el-form v-if="'__data__' in dataForm && Object.keys(dataForm.__data__).length > 0" :model="dataForm.__data__" label-width="auto">
        <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
            <el-input v-model="dataForm.__data__[col].name" v-if="['many2one','related'].indexOf(colsType[col]) >= 0" @change="cache(dataForm,col)" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
                <template #suffix>
                    <el-button type="primary" size="mini" icon="el-icon-search" @click="do_find(col)"></el-button>
                    <el-button type="primary" size="mini" icon="el-icon-document-add" @click="do_add(col)"></el-button>
                    <el-button v-if="dataForm.__data__[col].id != null" type="primary" size="mini" icon="el-icon-edit" @click="do_edit(col,dataForm.__data__[col].id)"></el-button>
                    <el-button v-if="dataForm.__data__[col].id != null" type="primary" size="mini" icon="el-icon-view" @click="do_lookup(col,dataForm.__data__[col].id)"></el-button>
                </template>
            </el-input>

            <el-input v-model="dataForm.__data__[col]" :maxlength="colsSize[col]" show-word-limit v-else-if="['char','varchar','composite','decomposite'].indexOf(colsType[col]) >= 0" @change="cache(dataForm,col)" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
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

            <json-viewer v-if="colsType[col] == 'json'" :value="dataForm.__data__[col]" copyable boxed sort />
            <el-input v-model="dataForm.__data__[col]" v-else-if="['uuid','integer','float','decimal','numeric','timedelta'].indexOf(colsType[col]) >= 0" @change="cache(dataForm,col)" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)"></el-input>
            <el-input v-model="dataForm.__data__[col]" autosize type="textarea" v-else-if="['text','xml'].indexOf(colsType[col]) >= 0" @change="cache(dataForm,col)" :readonly="readonly(col)">            
            </el-input>
            <el-date-picker v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'date'" @change="cache(dataForm,col)" :readonly="readonly(col)"></el-date-picker>
            <el-time-picker v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'time'" @change="cache(dataForm,col)" :readonly="readonly(col)"></el-time-picker>
            <el-date-picker v-model="dataForm.__data__[col]" type="datetime" v-else-if="colsType[col] == 'datetime'" @change="cache(dataForm,col)" :readonly="readonly(col)"></el-date-picker>
            <el-select v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'selection'" @change="cache(dataForm,col)" :disabled="readonly(col)">
                <el-option v-for="item in selOptions[col]" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
            <gp-m2m-list :metas="metas" :model="metas[model].meta.columns[col].obj" :tableData="dataForm.__m2m_containers__[col]" v-else-if="colsType[col] == 'many2many'">{{ colsLabel[col] }}</gp-m2m-list>
            <el-checkbox v-model="dataForm.__data__[col]" v-else-if="colsType[col] == 'boolean'" @change="cache(dataForm,col)" :disabled="readonly(col)"></el-checkbox>
            <el-image v-else-if="colsType[col] == 'binary' && metas[model].meta.columns[col].accept == 'image/*'" style="width: 100px; height: 100px" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" fit="fit"></el-image>
        </el-form-item>
        <el-tabs type="border-card" v-if="o2mcols.length > 0">
            <el-tab-pane :label="colsLabel[o2mcol]" v-for="o2mcol in o2mcols" :key="o2mcol">
                <gp-o2m-components :cid="cid" :metas="metas" :model="metas[model].meta.columns[o2mcol].obj" :cdata="dataForm.__o2m_containers__[o2mcol]" :mode="mode" :rel="metas[model].meta.columns[o2mcol].rel"/>
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
    onBeforeMount,
    ref,
    reactive,
    getCurrentInstance,
    render,
    h,
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
        const guid = ref(null)
        const page = ref(1)
        const pageSize = ref(1)
        const showSearch = ref(false)
        const colsType = reactive({})
        const colsLabel = reactive({})
        const colsSize = reactive({})
        const colsTranslate = reactive({})
        const colsLang = reactive({})
        const dataForm = reactive({'__data__':{}})
        const selOptions = reactive({})
        const fields = reactive([])
        const cols = reactive([])
        const o2mcols = reactive([])
        const multipleSelection = reactive([])

        const readonly = col => {
            return mode.value == 'lookup' || dataForm.__meta__.ro[col] || isCompute(col)
        }

        const required = (path,col) => {
          console.log('required:',path,col)
          return dataForm.__meta__.rq[col]
        }


         const visible = (path,col) => {
           console.log('required:',path,col)
           return !dataForm.__meta__.iv[col]
         }

        const cache = (item,name) => {
              console.log('cache-item:',name,item.__data__[name],item);
              let value;
              switch(props.metas[props.model].meta.columns[name].type){
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
                    if (props.metas[props.model].meta.columns[name].timezone) value = {'__datetime_tz__':item.__data__[name].toJsonString()};
                    else value = {'__datetime__':item.__data__[name].toJsonString()};
                    break;
                case 'date':
                    value = {'__date__':item.__data__[name]};
                    break;
                case 'time':
                    if (props.metas[props.model].meta.columns[name].timezone) value = {'__time_tz__':item.__data__[name]};
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
              let r = {'path':item.__path__,'key':name,'value':value,'context': proxy.$UserPreferences.Context}
             console.log('cache:',r);
              proxy.$websocket.sendAsync({_msg:[props.cid,'_cache','cache',guid.value,r]}).then((v) => console.log('cache:',v));
              }

        const i18nCommand = (command) =>{
          //console.log('command-18n:',command)
          colsLang[command.col] = command.lang
        };
        const handleSelectionChange = val => {
            //console.log('selection:', val)
            multipleSelection.splice(0, multipleSelection.length, ...val)
        }

        const handleCurrentChange = val => {
            page.value = val
            proxy.$websocket.send({
                    _msg: [
                        props.cid,
                        'models',
                        props.model,
                        'readforupdate', {
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
            //console.log('on_find_new:', value, opts)
            if (
                ['new', 'edit'].indexOf(mode.value) >= 0 &&
                value.id &&
                value.id.length > 0 &&
                value.name &&
                value.name.length > 0
            )
                dataForm.__data__[opts.col] = value
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
            //console.log('do-search!', col, vnode, proxy)
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
            //console.log('on-search:', msg)
            if (msg.length > 0) {
                multipleSelection.splice(0, multipleSelection.length, ...msg)
                showSearch.value = false
                mode.value = 'edit'
                let ctx = Object.assign({},proxy.$UserPreferences.Context)
                ctx.cache = guid.value
                proxy.$websocket.send({
                        _msg: [
                            props.cid,
                            'models',
                            props.model,
                            'readforupdate', {
                                fields: fields,
                                ids: multipleSelection[page.value - 1],
                                context: ctx
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
            //console.log('action:', action)
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
        }        

        const do_edit = (col, oid) => {
            do_modal_form(col, oid, 'edit')
        }

        const do_lookup = (col, oid) => {
            do_modal_form(col, oid, 'lookup')
        }

        const onSubmit = () => {
            console.log('submit!');
              
          ( async () => {
           if (mode.value == 'new' || mode.value == 'edit') {
             let msg = await proxy.$websocket.sendAsync({'_msg':[props.cid,'_cache','save',guid.value,{}]});
             let action = msg[0];
             console.log('action:', msg)
             if (action == 'commit') {
               await proxy.$websocket.sendAsync({'_mag':[props.cid,'_cache','commit',guid.value,{'action':'commit work'}]});
               if (mode.value == 'new') {
                 msg = proxy.$websocket.sendAsync({'_msg':[props.cid,'_cache','initialize',guid.value,{'model':props.model,'view':'form'}]});
                 Object.assign(dataForm, msg[0]);
               }
               proxy.$notify({
                        title: 'Title',
                        message: h('i', { style: 'color: teal' }, 'Record saved.')
               });
             }
           }
           })();
            
        }

        const onValidate = () => {
            //console.log('validate')
        }

        const onCancel = () => {
            for (
                let i = 0,
                    c = Object.keys(props.metas[props.model].views.form.columns),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                switch (meta[c[i]].type) {
                    case 'many2one':
                    case 'related':
                        dataForm.__data__[c[i]] = {
                            id: null,
                            name: null
                        }
                        break
                    case 'one2many':
                    case 'many2many':
                        dataForm.__data__[c[i]] = []
                        break
                    case 'selection':
                        dataForm.__data__[c[i]] = ''
                        break
                    case 'boolean':
                        dataForm.__data__[c[i]] = false
                        break
                    default:
                        dataForm.__data__[c[i]] = ''
                }
            }
        }

        const on_read = msg => {
            console.log('on_read:', msg)
            if (msg && msg.length > 0) Object.assign(dataForm, msg[0])
        }

        onBeforeMount(() => {            
            proxy.$websocket.sendAsync({_msg:[props.cid,'_cache','open',{'mode':mode,'context':proxy.$UserPreferences.Context}]}).then((msg) => {
              if (msg && msg.length > 0) guid.value = msg[0]
              if (mode.value == 'new') proxy.$websocket.sendAsync({_msg:[props.cid,'_cache','initialize',guid.value,{'model':props.model,'view':'form'}]}).then((msg) => {if (msg && msg.length > 0) Object.assign(dataForm, msg[0]);console.log('initialize:',msg)})
              
            })

            for (
                let i = 0,
                    c = props.metas[props.model].views.form.columns.map((v) => v.col),
                    meta = props.metas[props.model].meta.columns; i < c.length; i++
            ) {
                colsType[c[i]] = meta[c[i]].type
                colsLabel[c[i]] = meta[c[i]].label
                if (meta[c[i]].type == 'selection') selOptions[c[i]] = _get_selections(meta[c[i]].selections)
                if (['char','varchar','composite','decomposite'].indexOf(colsType[c[i]]) >= 0) colsSize[c[i]] = meta[c[i]].size ? meta[c[i]].size: 32767
                colsTranslate[c[i]] = 'translate' in meta[c[i]] ? meta[c[i]].translate:false
                colsLang[c[i]] = proxy.$UserPreferences.lang
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
                        dataForm.__data__[c[i]] = []
                        break
                    case 'many2many':
                        dataForm.__data__.__m2m_containers__ = {}
                        dataForm.__data__.__m2m_containers__[c[i]]  = []
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
            
            //console.log('translate:',colsTranslate,colsType)
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
            guid,
            readonly,
            required,
            visible,
            colsSize,
            cache,
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
