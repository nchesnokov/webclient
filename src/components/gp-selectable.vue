

<template>

<el-form :model="dataForm" label-width="200px">
    <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
        <el-input v-model="dataForm[col].name" v-if="['many2one','related'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
            <template #suffix>
                <el-button type="primary" size="mini" icon="el-icon-search" @click="do_search(col)"></el-button>
            </template>
        </el-input>
        <el-input v-model="dataForm[col]" v-if="['char','varchar','composite','integer','float','decimal','numeric','timedelta'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)">
            <template #ffix>
                <el-button type="primary" size="mini" icon="el-icon-monitor" v-if="isCompute(col)"></el-button>
            </template>
        </el-input>
        <el-input v-model="dataForm[col]" type="textarea" v-if="['text','xml'].indexOf(colsType[col]) >= 0" :prefix-icon="isCompute(col) ? 'el-icon-s-data':''" :readonly="readonly(col)"></el-input>
        <el-date-picker v-model="dataForm[col]" v-if="colsType[col] == 'date'" :readonly="readonly(col)"></el-date-picker>
        <el-time-picker v-model="dataForm[col]" v-if="colsType[col] == 'time'" :readonly="readonly(col)"></el-time-picker>
        <el-date-picker v-model="dataForm[col]" type="datetime" v-if="colsType[col] == 'datetime'" :readonly="readonly(col)"></el-date-picker>
        <el-select v-model="dataForm[col]" multiple v-if="colsType[col] == 'selection'" :readonly="readonly(col)">
            <el-option v-for="item in selOptions[col]" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
        </el-select>
        <el-checkbox v-model="dataForm[col]" v-if="colsType[col] == 'boolean'" :readonly="readonly(col)">{{ colsLabel[col] }}</el-checkbox>
    </el-form-item>
    <el-form-item>
        <el-button type="primary" @click="onSearch">Search</el-button>
        <el-button type="info" @click="onCancel">Cancel</el-button>
    </el-form-item>
    <el-row>
        <el-form-item label="Offset">
            <el-input-number v-model="offset" :min="0" :max="999999"></el-input-number>
        </el-form-item>
        <el-form-item label="Limit">
            <el-input-number v-model="limit" :min="1" :max="999999"></el-input-number>
        </el-form-item>
    </el-row>
</el-form>

</template>

<script>

import {
    defineComponent, defineAsyncComponent, createVNode, render, ref, reactive, onMounted, getCurrentInstance
}
from 'vue';

export default defineComponent({
    name: 'gp-selectable',
    props: {
        'cid': {
            type: String
        },
        'model': {
            type: String
        },
        'columns': {
            type: Object
        },
        'names': {
            type: Object
        },
        'extcond': {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    emits: ['update:search', 'update:search-cancel'],
    setup(props) {
        const {
            proxy
        } = getCurrentInstance();
        const colsType = reactive({});
        const colsLabel = reactive({});
        const dataForm = reactive({});
        const selOptions = reactive({});
        const cols = reactive([]);
        const relatedcols = reactive({});
        const cond = reactive([]);
        const offset = ref(0);
        const limit = ref(80);

        const readonly = (col) => {
            return col in relatedcols;
        };

        const on_find_new = (value, opts) => {
            console.log('on_find_new:', value, opts);
            if (!readonly(opts.col) && value.id.length > 0 && value.name.length) dataForm[opts.col] = value;
        };


        const do_search = (col) => {
            const rootComponent = defineAsyncComponent({
                loader: () =>
                    import ('./gp-find.vue'),
                suspensible: false
            });
            const rootProps = {
                cid: props.cid,
                model: props.columns[col].obj,
                'mode': 'single',
                'callback': on_find_new,
                callbackOpts: {
                    'col': col,
                    'mode': 'find'
                }
            };
            if ('domain' in props.columns[col] && props.columns[col].domain != null) {
                let extcond = [];
                for (let i = 0, domain = props.columns[col].domain; i < domain.length; i++) extcond.push({
                    '__tuple__': domain[i]
                });
                rootProps.extcond = extcond;
            }

            if (props.columns[col].type == 'related') {
                let extcond = [];
                for (let i = 0, relatedy = props.columns[col].relatedy; i < relatedy.length; i++) extcond.push({
                    '__tuple__': [relatedy[i], '=', ['many2one','related'].indexOf(colsType[relatedy[i]]) >= 0 ? dataForm[relatedy[i]].name : dataForm[relatedy[i]]]
                });
                if ('extcond' in rootProps) rootProps.extcond.splice(0, 0, ...extcond);
                else rootProps.extcond = extcond;
            }

            const vnode = createVNode(rootComponent, rootProps);
            vnode.appContext = proxy.$appcontext;
            const rootContainer = document.createElement("div")
            render(vnode, rootContainer, false);
            document.querySelector('#sv').appendChild(rootContainer);
            console.log('do-search!', col, vnode, proxy);

        };


        const onCancel = () => {
            proxy.$emit('update:search-cancel');
        };
        const onSearch = () => {
            console.log('search!');
            cond.splice(0, cond.length);
            for (let k in dataForm) {
                switch (colsType[k]) {
                    case 'many2one':
                        if (dataForm[k].name != null && dataForm[k].name.length > 0) cond.push({
                            __tuple__: [k, dataForm[k].name.match(/%/g) ? 'like' : '=', dataForm[k].name]
                        });
                        break;
                    case 'related':
                        if (dataForm[k].name != null && dataForm[k].name.length > 0) cond.push({
                            __tuple__: [k, dataForm[k].name.match(/%/g) ? 'like' : '=', dataForm[k].name]
                        });
                        break;
                    case 'selection':
                        if (dataForm[k] != null && dataForm[k].length > 0)
                            if (dataForm[k].length == 1) cond.push({
                                __tuple__: [k, '=', dataForm[k][0]]
                            });
                            else cond.push({
                                __tuple__: [k, 'in', dataForm[k]]
                            });
                        break;
                    case 'boolean':
                        if (dataForm[k]) cond.push({
                            __tuple__: [k]
                        });
                        break;
                    default:
                        if (dataForm[k] != null && dataForm[k].length > 0) cond.push({
                            __tuple__: [k, dataForm[k].match(/%/g) ? 'like' : '=', dataForm[k]]
                        });
                }
            }
            console.log('cond:', cond);
            proxy.$emit('update:search', {
                'cond': cond,
                'offset': offset,
                'limit': limit
            });
        };

        const isCompute = (col) => {
            return 'compute' in props.columns[col] && props.columns[col].compute != null || colsType[col] == 'composite';
        };

        const _get_selections = (s) => {
            let r = []
            for (let j = 0; j < s.length; j++) r.push({
                label: s[j][1],
                value: s[j][0]
            });
            return r;

        };

        onMounted(() => {
            for (let i = 0; i < props.extcond.length; i++) relatedcols[props.extcond[i].__tuple__[0]] = props.extcond[i].__tuple__[2];
            for (let i = 0, c = Object.keys(props.columns); i < c.length; i++)
                if ('selectable' in props.columns[c[i]] && props.columns[c[i]].selectable || props.columns[c[i]].type == 'selection' || props.columns[c[i]].inactive != null && props.columns[c[i]].inactive && props.name.inactive == c[i] || props.names.row_name == c[i]) {
                    cols.push(c[i]);
                    colsType[c[i]] = props.columns[c[i]].type;
                    colsLabel[c[i]] = props.columns[c[i]].label;
                    switch (colsType[c[i]]) {
                        case 'many2one':
                            if (c[i] in relatedcols) dataForm[c[i]] = {
                                id: null,
                                name: relatedcols[c[i]]
                            };
                            else dataForm[c[i]] = {
                                id: null,
                                name: null
                            };
                            break;
                        case 'selection':
                            selOptions[c[i]] = _get_selections(props.columns[c[i]].selections);
                            if (c[i] in relatedcols) dataForm[c[i]] = relatedcols[c[i]];
                            else dataForm[c[i]] = '';
                            break;
                        case 'boolean':
                            if (c[i] in relatedcols) dataForm[c[i]] = relatedcols[c[i]];
                            else dataForm[c[i]] = false;
                            break;
                        default:
                            if (c[i] in relatedcols) dataForm[c[i]] = relatedcols[c[i]];
                            else dataForm[c[i]] = '';
                    }
                }
        });
        return {
            readonly,
            cols,
            colsType,
            colsLabel,
            dataForm,
            selOptions,
            cond,
            offset,
            limit,
            do_search,
            onSearch,
            onCancel,
            isCompute
        };
    }
});

</script>
