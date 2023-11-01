

<template>
  <el-form :model="dataForm" label-width="200px">
    <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
      <!-- <el-autocomplete
          :fetch-suggestions="querySearch"
          clearable
          fit-input-width
          :trigger-on-focus="false"
          @focus="setAutocomleteCol(col)"
          :value-key="col"
          v-model="dataForm[col].name"
          v-if="['many2one', 'referenced'].indexOf(colsType[col]) >= 0"
          @select="handleSelect"
          :readonly="readonly(col)"
        >
          <template v-if="isCompute(col)" #prefix>
            <el-button type="primary" size="small" :icon="Monitor" />
          </template>
          <template #suffix>
            <el-button
              v-if="mode != 'lookup'"
              type="primary"
              size="small"
              :icon="Search"
              @click="do_find(col, 'single', [], { item: dataForm })"
            ></el-button>
            <el-button
              v-if="mode != 'lookup'"
              type="primary"
              size="small"
              :icon="DocumentAdd"
              @click="do_add(col)"
            ></el-button>
            <el-button
              v-if="dataForm.__data__[col].id != null && mode != 'lookup'"
              type="primary"
              size="small"
              :icon="Edit"
              @click="do_edit(col, dataForm.__data__[col].id)"
            ></el-button>
            <el-button
              v-if="dataForm.__data__[col].id != null"
              type="primary"
              size="small"
              :icon="View"
              @click="do_lookup(col, dataForm.__data__[col].id)"
            ></el-button>
          </template>
        </el-autocomplete> -->

      <el-input
        v-model="dataForm[col].name"
        v-if="['many2one', 'referenced', 'related'].indexOf(colsType[col]) >= 0"
        :prefix-icon="isCompute(col) ? 'el-icon-s-data' : ''"
        :readonly="readonly(col)"
      >
        <template #suffix>
          <el-button
            type="primary"
            size="small"
            :icon="Search"
            @click="do_search(col)"
          ></el-button>
        </template>
      </el-input>
      <el-input
        v-model="dataForm[col]"
        v-if="
          [
            'char',
            'varchar',
            'composite',
            'i18n',
            'tree',
            'integer',
            'float',
            'decimal',
            'numeric',
            'timedelta',
          ].indexOf(colsType[col]) >= 0
        "
        :prefix-icon="isCompute(col) ? 'el-icon-s-data' : ''"
        :readonly="readonly(col)"
      >
        <template #prefix>
          <el-button
            type="primary"
            size="small"
            :icon="Monitor"
            v-if="isCompute(col)"
          ></el-button>
        </template>
      </el-input>
      <el-input
        v-model="dataForm[col]"
        type="textarea"
        v-if="['text', 'xml'].indexOf(colsType[col]) >= 0"
        :prefix-icon="isCompute(col) ? 'el-icon-s-data' : ''"
        :readonly="readonly(col)"
      ></el-input>
      <el-date-picker
        v-model="dataForm[col]"
        v-if="colsType[col] == 'date'"
        :readonly="readonly(col)"
      ></el-date-picker>
      <el-time-picker
        v-model="dataForm[col]"
        v-if="colsType[col] == 'time'"
        :readonly="readonly(col)"
      ></el-time-picker>
      <el-date-picker
        v-model="dataForm[col]"
        type="datetime"
        v-if="colsType[col] == 'datetime'"
        :readonly="readonly(col)"
      ></el-date-picker>
      <el-select
        v-model="dataForm[col]"
        multiple
        v-if="colsType[col] == 'selection'"
        :readonly="readonly(col)"
      >
        <el-option
          v-for="item in selOptions[col]"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-checkbox
        v-model="dataForm[col]"
        v-if="colsType[col] == 'boolean'"
        :readonly="readonly(col)"
        >{{ colsLabel[col] }}</el-checkbox
      >
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSearch">Search</el-button>
      <el-button type="info" @click="onCancel">Cancel</el-button>
    </el-form-item>
    <el-row>
      <el-form-item label="Offset">
        <el-input-number
          v-model="offset"
          :min="0"
          :max="999999"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="Limit">
        <el-input-number
          v-model="limit"
          :min="1"
          :max="999999"
        ></el-input-number>
      </el-form-item>
    </el-row>
  </el-form>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "gp-selectable",
});
</script>
<script setup>
import {
  defineAsyncComponent,
  createVNode,
  render,
  ref,
  reactive,
  onMounted,
  getCurrentInstance,
} from "vue";

import { Monitor, Search } from "@element-plus/icons-vue";

const props = defineProps({
  cid: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    //    required: true
  },
  columns: {
    type: Object,
    required: true,
  },
  names: {
    type: Object,
    required: true,
  },
  extcond: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emit = defineEmits(["update:search", "update:search-cancel"]);

const { proxy } = getCurrentInstance();
const colsType = reactive({});
const colsLabel = reactive({});
const dataForm = reactive({});
const selOptions = reactive({});
const cols = reactive([]);
const relatedcols = reactive({});
const cond = reactive([]);
const extcond = reactive({});
const offset = ref(0);
const limit = ref(80);

const setAutocomleteCol = (col) => {
  console.log("autocomplete:", col);
  let obj = props.metas[props.model].meta.columns[col].obj,
    rec_name = props.metas[obj].meta.names.rec_name,
    sz =
      props.metas[obj].meta.columns[rec_name].size == null
        ? 32767
        : props.metas[obj].meta.columns[rec_name].size;
  autoCompleteCol.value = { col: col, sz: sz };
};
const querySearch = (queryString, cb) => {
  if (
    queryString.length > 3 ||
    queryString.search("%") >= 0 ||
    autoCompleteCol.value.sz < 5
  ) {
    console.log("querySearch:", queryString, cb, autoCompleteCol.value);
    let obj =
      props.metas[props.model].meta.columns[autoCompleteCol.value.col].obj;
    let rec_name =
      props.metas[
        props.metas[props.model].meta.columns[autoCompleteCol.value.col].obj
      ].meta["names"]["rec_name"];
    let cond = [
      {
        __tuple__: [
          rec_name,
          "like",
          queryString.search("%") >= 0 ? queryString : queryString + "%",
        ],
      },
    ];
    if (
      props.metas[props.model].meta.columns[autoCompleteCol.value.col].type ==
      "related"
    )
      for (
        let i = 0, r = relatedyConditions(autoCompleteCol.value.col);
        i < r.length;
        i++
      )
        cond.push(r[i]);
    if (
      props.metas[props.model].meta.columns[autoCompleteCol.value.col].domain !=
      null
    )
      if (cond.length > 0)
        cond.push(
          domainConditions(
            props.metas[props.model].meta.columns[autoCompleteCol.value.col]
              .domain
          )
        );
      else
        for (
          let i = 0,
            d = domainConditions(
              props.metas[props.model].meta.columns[autoCompleteCol.value.col]
                .domain
            );
          i < d.length;
          i++
        )
          cond.push(d[i]);
    proxy.$ws
      .sendAsync({
        _msg: [
          props.cid,
          "models",
          obj,
          "select",
          {
            fields: [rec_name],
            cond: cond,
            context: proxy.$UserPreferences.Context,
            limit: 10,
          },
        ],
      })
      .then((msg) => {
        let result = [];
        for (let i = 0, v; i < msg.length; i++) {
          v = {};
          v.id = msg[i].id;
          v[autoCompleteCol.value.col] = msg[i][rec_name];
          result.push(v);
        }
        console.log("Result:", result, cond);
        cb(result);
      });
  }
};

const handleSelect = (item) => {
  console.log("handleSelect:", item);
  if (props.metas[props.model].meta.columns[autoCompleteCol.value.col].type == "related") related_cache(dataForm,autoCompleteCol.value.col,props.metas[props.model].meta.columns[autoCompleteCol.value.col].relatedy)
  else  m2o_cache(dataForm, autoCompleteCol.value.col);
};


const readonly = (col) => {
  return col in relatedcols;
};

const on_find_new = (value, opts) => {
  //console.log('on_find_new:', value, opts);
  if (!readonly(opts.col) && value.id.length > 0 && value.name.length)
    dataForm[opts.col] = value;
};

const do_search = (col) => {
  const rootComponent = defineAsyncComponent({
    loader: () => import("./gp-find.vue"),
    suspensible: false,
  });
  const rootProps = {
    cid: props.cid,
    model: props.columns[col].obj,
    mode: "single",
    callback: on_find_new,
    callbackOpts: {
      col: col,
      mode: "find",
    },
  };
  if ("domain" in props.columns[col] && props.columns[col].domain != null) {
    let extcond = [];
    for (let i = 0, domain = props.columns[col].domain; i < domain.length; i++)
      if (Array.isArray(domain[i])) extcond.push({ __tuple__: domain[i] });
      else extcond.push(domain[i]);
    rootProps.extcond = extcond;
  }

  if (props.columns[col].type == "related") {
    let extcond = [];
    for (
      let i = 0, relatedy = props.columns[col].relatedy;
      i < relatedy.length;
      i++
    )
    {  
    let rf =Array.isArray(relatedy[i]) ? rf = relatedy[i][0]:relatedy[i];
      
      extcond.push({
        __tuple__: [
          rf,
          "=",
          ["many2one", "related","referenced"].indexOf(colsType[rf]) >= 0
            ? dataForm[rf].name
            : dataForm[rf],
        ],
      });
    }
    if ("extcond" in rootProps) rootProps.extcond.splice(0, 0, ...extcond);
    else rootProps.extcond = extcond;
  }

  switch (colsType[col]) {
    case "many2one":
    case "referenced":
      if (dataForm[col].name != null && dataForm[col].name.length > 0)
        cond.push({
          __tuple__: [
            col,
            dataForm[col].name.match(/%/g) ? "like" : "=",
            dataForm[col].name,
          ],
        });
      break;
    case "related":
      if (dataForm[col].name != null && dataForm[col].name.length > 0)
        cond.push({
          __tuple__: [
            col,
            dataForm[col].name.match(/%/g) ? "like" : "=",
            dataForm[col].name,
          ],
        });
      break;
    case "selection":
      if (dataForm[col] != null && dataForm[col].length > 0)
        if (dataForm[col].length == 1)
          cond.push({
            __tuple__: [col, "=", dataForm[col][0]],
          });
        else
          cond.push({
            __tuple__: [col, "in", dataForm[col]],
          });
      break;
    case "boolean":
      if (dataForm[col])
        cond.push({
          __tuple__: [col],
        });
      break;
    default:
      if (dataForm[col] != null && dataForm[col].length > 0)
        cond.push({
          __tuple__: [
            col,
            dataForm[k].match(/%/g) ? "like" : "=",
            dataForm[col],
          ],
        });
  }

  const vnode = createVNode(rootComponent, rootProps);
  vnode.appContext = proxy.$appcontext;
  const rootContainer = document.createElement("div");
  render(vnode, rootContainer, false);
  document.querySelector("#sv").appendChild(rootContainer);
  //console.log('do-search!', col, vnode, proxy);
};

const onCancel = () => {
  proxy.$emit("update:search-cancel");
};
const onSearch = () => {
  //console.log('search!');
  cond.splice(0, cond.length);
  for (let k in dataForm) {
    switch (colsType[k]) {
      case "many2one":
      case "referenced":
        if (dataForm[k].name != null && dataForm[k].name.length > 0)
          cond.push({
            __tuple__: [
              k,
              dataForm[k].name.match(/%/g) ? "like" : "=",
              dataForm[k].name,
            ],
          });
        break;
      case "related":
        if (dataForm[k].name != null && dataForm[k].name.length > 0)
          cond.push({
            __tuple__: [
              k,
              dataForm[k].name.match(/%/g) ? "like" : "=",
              dataForm[k].name,
            ],
          });
        break;
      case "selection":
        if (dataForm[k] != null && dataForm[k].length > 0)
          if (dataForm[k].length == 1)
            cond.push({
              __tuple__: [k, "=", dataForm[k][0]],
            });
          else
            cond.push({
              __tuple__: [k, "in", dataForm[k]],
            });
        break;
      case "boolean":
        if (dataForm[k])
          cond.push({
            __tuple__: [k],
          });
        break;
      default:
        if (dataForm[k] != null && dataForm[k].length > 0)
          cond.push({
            __tuple__: [k, dataForm[k].match(/%/g) ? "like" : "=", dataForm[k]],
          });
    }
  }

  console.log("cond:", cond);
  proxy.$emit("update:search", {
    cond: cond,
    offset: offset,
    limit: limit,
  });
};

const isCompute = (col) => {
  return (
    ("compute" in props.columns[col] && props.columns[col].compute != null) ||
    colsType[col] == "composite"
  );
};

const _get_selections = (s) => {
  let r = [];
  for (let j = 0; j < s.length; j++)
    r.push({
      label: s[j][1],
      value: s[j][0],
    });
  return r;
};

onMounted(() => {
  for (let i = 0; i < props.extcond.length; i++)
    relatedcols[props.extcond[i].__tuple__[0]] = props.extcond[i].__tuple__[2];
  for (let i = 0, c = Object.keys(props.columns); i < c.length; i++)
    if (
      ("selectable" in props.columns[c[i]] && props.columns[c[i]].selectable) ||
      props.columns[c[i]].type == "selection" ||
      (props.columns[c[i]].inactive != null &&
        props.columns[c[i]].inactive &&
        props.name.inactive == c[i]) ||
      props.names.row_name == c[i] ||
      props.names.full_name == c[i] ||
      props.names.rec_name == c[i]
    ) {
      cols.push(c[i]);
      colsType[c[i]] = props.columns[c[i]].type;
      colsLabel[c[i]] = props.columns[c[i]].label;
      switch (colsType[c[i]]) {
        case "many2one":
        case "referenced":
        case "related":
          if (c[i] in relatedcols)
            dataForm[c[i]] = {
              id: null,
              name: relatedcols[c[i]],
            };
          else
            dataForm[c[i]] = {
              id: null,
              name: null,
            };
          break;
        case "selection":
          selOptions[c[i]] = _get_selections(props.columns[c[i]].selections);
          if (c[i] in relatedcols) dataForm[c[i]] = relatedcols[c[i]];
          else dataForm[c[i]] = "";
          break;
        case "boolean":
          if (c[i] in relatedcols) dataForm[c[i]] = relatedcols[c[i]];
          else dataForm[c[i]] = false;
          break;
        default:
          if (c[i] in relatedcols) dataForm[c[i]] = relatedcols[c[i]];
          else dataForm[c[i]] = "";
      }
    }
});
</script>
