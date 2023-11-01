<template>
  <el-pagination
    v-if="maps.__containers__[container].length > 1"
    background
    layout="total, prev, pager, next, jumper"
    @current-change="handleCurrentChange"
    :page-size="pageSize"
    :total="maps.__containers__[container].length"
  ></el-pagination>

  <el-form
    v-if="maps.__containers__[container].length > 0"
    :model="maps.__containers__[container][page - 1].__data__"
    :rules="formRules"
    label-width="auto"
    status-icon
    inline-message
  >
    <el-form-item :label="colsLabel[col]" v-for="col in cols" :key="col">
      <el-autocomplete
        :fetch-suggestions="querySearch"
        clearable
        :trigger-on-focus="false"
        @focus="setAutocomleteCol(col)"
        :value-key="col"
        v-model="maps.__containers__[container][page - 1].__data__[col].name"
        v-if="['many2one', 'referenced'].indexOf(colsType[col]) >= 0"
        @select="handleSelect"
        :prefix-icon="isCompute(col) ? Monitor : ''"
        :readonly="readonly(col)"
      >
        <template #suffix>
          <el-button
            type="primary"
            size="small"
            :icon="Search"
            @click="
              do_find(col, 'single', [], {
                item: maps.__containers__[container][page - 1],
              })
            "
          ></el-button>
          <el-button
            type="primary"
            size="small"
            :icon="DocumentAdd"
            @click="do_add(col)"
          ></el-button>
          <el-button
            v-if="
              maps.__containers__[container][page - 1].__data__[col].id != null
            "
            type="primary"
            size="small"
            :icon="Edit"
            @click="
              do_edit(
                col,
                maps.__containers__[container][page - 1].__data__[col].id
              )
            "
          ></el-button>
          <el-button
            v-if="
              maps.__containers__[container][page - 1].__data__[col].id != null
            "
            type="primary"
            size="small"
            :icon="View"
            @click="
              do_lookup(
                col,
                maps.__containers__[container][page - 1].__data__[col].id
              )
            "
          ></el-button>
        </template>
      </el-autocomplete>
      <el-autocomplete
      :fetch-suggestions="querySearch"
          clearable
          :trigger-on-focus="false"
          @focus="setAutocomleteCol(col)"
          :value-key="col"
          v-model="maps.__containers__[container][page - 1].__data__[col].name"
          v-if="colsType[col] == 'related'"
          @select="handleSelect"
          :readonly="readonly(col)"
      >
        <template #suffix>
          <el-button
            type="primary"
            size="small"
            :icon="Search"
            @click="
              do_find(col, 'single', [], {
                item: maps.__containers__[container][page - 1],
              })
            "
          ></el-button>
          <el-button
            type="primary"
            size="small"
            :icon="DocumentAdd"
            @click="do_add(col)"
          ></el-button>
          <el-button
            v-if="
              maps.__containers__[container][page - 1].__data__[col].id != null
            "
            type="primary"
            size="small"
            :icon="Edit"
            @click="
              do_edit(
                col,
                maps.__containers__[container][page - 1].__data__[col].id
              )
            "
          ></el-button>
          <el-button
            v-if="
              maps.__containers__[container][page - 1].__data__[col].id != null
            "
            type="primary"
            size="small"
            :icon="View"
            @click="
              do_lookup(
                col,
                maps.__containers__[container][page - 1].__data__[col].id
              )
            "
          ></el-button>
        </template>
      </el-autocomplete>
      <json-viewer
        v-if="colsType[col] == 'json'"
        :value="maps.__containers__[container][page - 1].__data__[col]"
        copyable
        boxed
        sort
      />

      <el-input
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        @change="cache(maps.__containers__[container][page - 1], col)"
        v-else-if="
          ['char', 'varchar', 'composite', 'decomposite', 'tree'].indexOf(
            colsType[col]
          ) >= 0
        "
        :readonly="readonly(col)"
      >
        <template v-if="isCompute(col) || colsTranslate[col]" #prepend>
          <el-button
            v-if="isCompute(col)"
            type="primary"
            size="small"
            :icon="Monitor"
          />
          <el-dropdown v-if="colsTranslate[col]" @command="i18nCommand">
            <span class="el-dropdown-link">
              {{ colsLang[col].toLowerCase() }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="lang in $UserPreferences.langs"
                  :key="lang.code"
                  :command="{ col: col, lang: lang.code }"
                  >{{ lang.description }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-input>

      <el-input
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        @change="cache(maps.__containers__[container][page - 1], col)"
        v-else-if="
          ['integer', 'float', 'decimal', 'numeric', 'timedelta'].indexOf(
            colsType[col]
          ) >= 0
        "
        :prefix-icon="isCompute(col) ? Monitor : ''"
        :readonly="readonly(col)"
      >
      </el-input>
      <el-input
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        @change="cache(maps.__containers__[container][page - 1], col)"
        autosize
        type="textarea"
        v-else-if="['text', 'xml'].indexOf(colsType[col]) >= 0"
        :prefix-icon="isCompute(col) ? Monitor : ''"
        :readonly="readonly(col)"
      >
        <template v-if="isCompute(col) || colsTranslate[col]" #prepend>
          <el-button
            v-if="isCompute(col)"
            type="primary"
            size="small"
            :icon="Monitor"
          />
          <el-dropdown v-if="colsTranslate[col]" @command="i18nCommand">
            <span class="el-dropdown-link">
              {{ colsLang[col].toLowerCase() }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="lang in $UserPreferences.langs"
                  :key="lang.code"
                  :command="{ col: col, lang: lang.code }"
                  >{{ lang.description }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-input>
      <el-date-picker
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        type="date"
        @change="cache(maps.__containers__[container][page - 1], col)"
        v-else-if="colsType[col] == 'date'"
        :readonly="readonly(col)"
      ></el-date-picker>
      <el-time-picker
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        @change="cache(maps.__containers__[container][page - 1], col)"
        v-else-if="colsType[col] == 'time'"
        :readonly="readonly(col)"
      ></el-time-picker>
      <el-date-picker
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        @change="cache(maps.__containers__[container][page - 1], col)"
        type="datetime"
        v-else-if="colsType[col] == 'datetime'"
        :readonly="readonly(col)"
      ></el-date-picker>
      <el-select
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        @change="cache(maps.__containers__[container][page - 1], col)"
        v-else-if="colsType[col] == 'selection'"
        :disabled="readonly(col)"
      >
        <el-option
          v-for="item in selOptions[col]"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <gp-m2m-list
        :maps="maps"
        :metas="metas"
        :model="metas[model].meta.columns[col].obj"
        :tableData="maps.__containers__[container][page - 1]"
        v-else-if="colsType[col] == 'many2many'"
        >{{ colsLabel[col] }}</gp-m2m-list
      >
      <el-switch
        v-model="maps.__containers__[container][page - 1].__data__[col]"
        @change="cache(maps.__containers__[container][page - 1], col)"
        v-else-if="colsType[col] == 'boolean'"
        :disabled="readonly(col)"
      ></el-switch>
      <el-image
        v-else-if="
          colsType[col] == 'binary' &&
          metas[model].meta.columns[col].accept == 'image/*' &&
          maps.__containers__[container][page - 1].__data__[col] != null
        "
        style="width: 100px; height: 100px"
        :src="maps.__containers__[container][page - 1].__data__[col]"
        fit="fill"
      ></el-image>
      <el-upload
        v-else-if="
          colsType[col] == 'binary' &&
          metas[model].meta.columns[col].accept == 'image/*' &&
          maps.__containers__[container][page - 1].__data__[col] == null
        "
        ref="maps.__containers__[container][page-1].__data__[col]"
        :data="maps.__containers__[container][page - 1].__data__[col]"
        list-type="picture"
        :action="col"
        :http-request="request"
        :auto-upload="true"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            jpg/png files with a size less than 500kb
          </div>
        </template>
      </el-upload>
    </el-form-item>
    <el-tabs type="border-card" v-if="o2mcols.length > 0">
      <el-tab-pane
        :label="colsLabel[o2mcol]"
        v-for="o2mcol in o2mcols"
        :key="o2mcol"
      >
        <gp-o2m-components
          :cid="cid"
          :guid="guid"
          :maps="maps"
          :metas="metas"
          :model="metas[model].meta.columns[o2mcol].obj"
          :container="
            o2mcol + '.' + maps.__containers__[container][page - 1].__path__
          "
          :mode="mode"
          :rel="metas[model].meta.columns[o2mcol].rel"
        />
      </el-tab-pane>
    </el-tabs>
  </el-form>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "gp-o2m-form",
});
</script>

<script setup>
import {
  defineAsyncComponent,
  onMounted,
  ref,
  reactive,
  getCurrentInstance,
  render,
  createVNode,
} from "vue";

import {
  Monitor,
  Search,
  DocumentAdd,
  Edit,
  View,
  ArrowDown,
} from "@element-plus/icons-vue";

import { UploadFilled } from "@element-plus/icons-vue";

import { on_modify_models } from "../../js/nf.js";

const props = defineProps({
  cid: {
    type: String,
    required: true,
  },
  guid: {
    type: String,
    required: true,
  },
  maps: {
    type: Object,
    required: true,
  },
  metas: {
    type: Object,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  container: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  rel: {
    type: String,
    required: true,
  },
});
//const emit = defineEmits(['update:close'])

const { proxy } = getCurrentInstance();
const autoCompleteCol = ref("");
const page = ref(1);
const pageSize = ref(1);
const showSearch = ref(false);
const colsType = reactive({});
const colsLabel = reactive({});
const colsTranslate = reactive({});
const colsLang = reactive({});
const selOptions = reactive({});
const formRules = reactive({});
const fields = reactive([]);
const cols = reactive([]);
const o2mcols = reactive([]);
const multipleSelection = reactive([]);

const readonly = (col) => {
  return (
    props.mode == "lookup" ||
    isCompute(col) ||
    (colsType[col] == "related" && isRelatedEmpry(col))
  );
};

const isRelatedEmpry = (col) => {
  console.log("isRelatedEmpry:", col);
  return props.metas[props.model].meta.columns[col].relatedy.every(
    (v) =>
      (["many2one", "related", "referenced"].indexOf(colsType[col]) >= 0 &&
        props.maps.__containers__[props.container][page.value - 1].__data__[
          v[0]
        ].id == null) ||
      props.maps.__containers__[props.container][page.value - 1].__data__[v[0]][
        v[0]
      ] == null
  );
};

const setAutocomleteCol = (col) => {
  console.log("autocomplete:", col);
  let obj = props.metas[props.model].meta.columns[col].obj,
    rec_name = props.metas[obj].meta.names.rec_name,
    sz = props.metas[obj].meta.columns[rec_name].size == null? 32767:props.metas[obj].meta.columns[rec_name].size;
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
  if (props.metas[props.model].meta.columns[autoCompleteCol.value.col].type == "related") related_cache(props.maps.__containers__[props.container][page.value - 1],autoCompleteCol.value.col,props.metas[props.model].meta.columns[autoCompleteCol.value.col].relatedy)
  else  m2o_cache(props.maps.__containers__[props.container][page.value - 1], autoCompleteCol.value.col);
};


const handleSelect1 = (item) => {
  console.log(
    "handleSelect:",
    item,
    props.maps.__containers__[props.container][page.value - 1]
  );
  m2o_cache(
    props.maps.__containers__[props.container][page.value - 1],
    autoCompleteCol.value.col
  );
};

const i18nCommand = (command) => {
  //console.log('command-18n:',command)
  colsLang[command.col] = command.lang;
};

const handleSelectionChange = (val) => {
  multipleSelection.splice(0, multipleSelection.length, ...val);
};

const handleCurrentChange = (val) => {
  page.value = val;
};

const m2o_cache = (item, name) => {
  console.log("m2o_cache:", name, item.__data__[name], item);
  if (
    item.__data__[name].name == null ||
    item.__data__[name].name.length == 0
  ) {
    item.__data__[name].id = null;
    item.__data__[name].name = null;
    cache(item, name);
    return;
  }
  let r = {
    path: item.__path__,
    model: item.__model__,
    key: name,
    value: item.__data__[name],
    context: proxy.$UserPreferences.Context,
  };
  //console.log('cache:',r);
  proxy.$ws
    .sendAsync({
      _msg: [props.cid, "_cache", "m2ofind", props.guid, r],
    })
    .then((v) => {
      console.log("m2ofind:", v);
      let f = v[0];
      if (f.__m2o_find__.__data__.v.length == 1) {
        for (let key in f.__m2o_find__.__data__.v[0])
          if (key == "id")
            props.maps.__containers__[props.container][page.value - 1].__data__[
              name
            ].id = f.__m2o_find__.__data__.v[0].id;
          else
            props.maps.__containers__[props.container][page.value - 1].__data__[
              name
            ].  name = f.__m2o_find__.__data__.v[0][key];
        cache(item, name);
      } else {
        let extcond = [];
        if (
          "domain" in props.metas[props.model].meta.columns[name] &&
          props.metas[props.model].meta.columns[name].domain != null
        )
          for (
            let i = 0, d = props.metas[props.model].meta.columns[name].domain;
            i < d.length;
            i++
          )
            extcond.push({
              __tuple__: d[i],
            });
        if (f.__m2o_find__.__data__.v.length > 1)
          extcond.push({
            __tuple__: ["id", "in", f.__m2o_find__.__data__.v],
          });
        do_find(name, "single", extcond, {
          item: item,
          mode: "autofind",
        });
      }
    });
};

const related_cache = (item, name, relatedy) => {
  if (item.__data__[name].name.length == 0) {
    item.__data__[name].id = null;
    item.__data__[name].name = null;
    cache(item, name);
    return;
  }
  let r = {
    path: item.__path__,
    model: item.__model__,
    key: name,
    value: item.__data__[name],
    relatedy: relatedy,
    context: proxy.$UserPreferences.Context,
  };
  //console.log('cache-related:',r);
  proxy.$ws
    .sendAsync({
      _msg: [props.cid, "_cache", "relatedfind", props.guid, r],
    })
    .then((v) => {
      console.log("relatedfind:", v);
      let f = v[0];
      if (f.__related_find__.__data__.v.length == 1) {
        props.maps.__m2m_containers__[props.container][page.value - 1].__data__[
          name
        ] = f.__related_find__.__data__.v[0];
        cache(item, name);
      } else {
        let extcond = [];
        if (
          "domain" in props.metas[props.model].meta.columns[name] &&
          props.metas[props.model].meta.columns[name].domain != null
        )
          for (
            let i = 0, d = props.metas[props.model].meta.columns[name].domain;
            i < d.length;
            i++
          )
            extcond.push({
              __tuple__: d[i],
            });
        if (
          "relatedy" in props.metas[props.model].meta.columns[name] &&
          props.metas[props.model].meta.columns[name].relatedy != null
        )
          for (
            let i = 0, relatedy, relatedyd;
            i < props.metas[props.model].meta.columns[name].relatedy.length;
            i++
          ) {
            relatedy =
              props.metas[props.model].meta.columns[name].relatedy[i]
                .__tuple__[0];
            relatedyd =
              props.metas[props.model].meta.columns[name].relatedy[i]
                .__tuple__[1];
            if (
              item.__data__[relatedy] != null &&
              item.__data__[relatedy].name != null &&
              item.__data__[relatedy].name.length > 0
            )
              extcond.push({
                __tuple__: [relatedyd, "=", item.__data__[relatedy].name],
              });

            if (f.__relatedy_find__.__data__.v.length > 1)
              extcond.push({
                __tuple__: ["id", "in", f.__related_find__.__data__.v],
              });
            do_find(name, "single", extcond, {
              item: item,
              mode: "autofind",
            });
          }
      }
    });
};

const cache = (item, name) => {
  console.log("cache-item:", name, item.__data__[name], item);
  let value;
  switch (props.metas[props.model].meta.columns[name].type) {
    case "integer":
      value = parseInt(item.__data__[name], 10);
      break;
    case "float":
    case "double":
      value = parseFloat(item.__data__[name]);
      break;
    case "real":
    case "decimal":
    case "numeric":
      value = {
        __decimal__: item.__data__[name],
      };
      break;
    case "datetime":
      if (props.metas[props.model].meta.columns[name].timezone)
        value = {
          __datetime_tz__: item.__data__[name],
        };
      else
        value = {
          __datetime__: item.__data__[name],
        };
      break;
    case "date":
      value = {
        __date__: item.__data__[name],
      };
      break;
    case "time":
      if (props.metas[props.model].meta.columns[name].timezone)
        value = {
          __time_tz__: item.__data__[name],
        };
      else
        value = {
          __time__: item.__data__[name],
        };
      break;
    case "timedelta":
      value = {
        __timedelta__: item.__data__[name],
      };
      break;
    case "many2one":
    case "related":
      //console.log('typeof-value:',typeof item[name]);
      if ("__data__" in item) {
        if (typeof item.__data__[name] == "object") value = item.__data__[name];
        else {
          value = {
            id: item.__data__[name].id,
            name: item.__data__[name].name,
          };
          item.__data__.id = value.id;
          item.__data__.name = value.name;
        }
      } else {
        if (typeof item[name] == "object") value = item[name];
        else {
          value = {
            id: item[name].id,
            name: item[name].name,
          };
          item.__data__.id = value.id;
          item.__data__.name = value.name;
        }
      }
      break;
    default:
      value = item.__data__[name];
  }
  let r = {
    path: item.__path__,
    key: name,
    value: value,
    context: proxy.$UserPreferences.Context,
  };
  console.log("cache:", r);
  proxy.$ws
    .sendAsync({
      _msg: [props.cid, "_cache", "cache", props.guid, r],
    })
    .then((v) => {
      console.log("cache:", v);
      on_modify_models(props.maps, v[0]);
    });
};

const isCompute = (col) => {
  return (
    ("compute" in props.metas[props.model].meta.columns[col] &&
      props.metas[props.model].meta.columns[col].compute != null) ||
    ["composite", "tree"].indexOf(colsType[col]) >= 0
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

const on_find_new = (value, opts) => {
  console.log("on_find_new:", value, opts);
  if (
    ["new", "edit"].indexOf(opts.mode.value) >= 0 &&
    value.id &&
    value.id.length > 0 &&
    value.name &&
    value.name.length > 0
  )
    // dataForm.__data__[opts.col] = value;
    Object.assign(
      props.maps[props.container][page.value - 1].__data__[opts.col],
      value
    );
  opts.item.__data__[opts.col] = value;
  cache(opts.item, opts.col);
};

const on_find_m2m = (value, opts) => {
  console.log("on_find_m2m:", value, opts);
  if (["new", "edit"].indexOf(mode.value) >= 0 && value.length > 0) {
    let model = props.maps[props.container][page.value - 1].__model__;
    let container = opts.col + "." + opts.path;
    let obj = props.metas[model].meta.columns[opts.col].obj;
    let fields = props.metas[obj].views.m2mlist.columns.map((f) => f.col);
    let rel = props.metas[model].meta.columns[opts.col].rel;
    let id2 = value.map((item) => item.id);
    m2m_cache(
      model,
      container,
      fields,
      obj,
      rel,
      id2,
      proxy.$UserPreferences.Context
    );
  }
};

const m2m_cache = (model, container, fields, obj, rel, id2, context) => {
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "_cache",
        "m2madd",
        guid.value,
        {
          model: model,
          container: container,
          fields: fields,
          obj: obj,
          rel: rel,
          id2: id2,
          context: proxy.$UserPreferences.Context,
        },
      ],
    })
    .then((msg) => on_modify_models(props.maps, msg[0]));
};

const fieldsBuild = (model, view) => {
  let fcols = [];
  for (
    let i = 0,
      columns = props.metas[model].views[view].columns
        .map((v) => v.col)
        .filter((c) => c != props.rel),
      k = {};
    i < columns.length;
    i++
  )
    switch (props.metas[model].meta.columns[columns[i]].type) {
      case "one2many":
        k = {};
        if (props.metas[model].meta.columns[columns[i]].obj != model)
          k[columns[i]] = fieldsBuild(
            props.metas[model].meta.columns[columns[i]].obj,
            "form"
          );
        else
          k[columns[i]] = props.metas[model].views.form.columns.map(
            (v) => v.col
          );
        fcols.push(k);
        break;
      case "many2many":
        k = {};
        k[columns[i]] = props.metas[model].meta.columns[
          columns[i].obj
        ].views.m2mlist.columns.map((v) => v.col);
        fcols.push(k);
        break;
      default:
        fcols.push(columns[i]);
    }
  return fcols;
};

const domainConditions = (domain) => {
  return domain.map((v) => {
    return Array.isArray(v) ? { __tuple__: v } : v;
  });
};

const relatedyConditions = (col) => {
  let cond = [];
  for (
    let i = 0,
      relatedy = listRelatedFields(
        props.metas[props.model].meta.columns[col].relatedy
      );
    i < relatedy.length;
    i++
  )
    cond.push({
      __tuple__: [
        relatedy[i],
        "=",
        ["many2one", "referenced", "related"].indexOf(
          props.metas[props.model].meta.columns[relatedy[i]].type
        ) >= 0
          ? dataForm.__data__[relatedy[i]].name
          : dataForm.__data__[relatedy[i]],
      ],
    });
  return cond;
};


const do_find = (col, mode = "single", extcond = [], callbackopts = {}) => {
  const rootComponent = defineAsyncComponent({
    loader: () => import("../static/gp-find.vue"),
    suspensible: false,
  });
  let domaincond = props.metas[props.model].meta.columns[col].domain != null ? (domainConditions(props.metas[props.model].meta.columns[col].domain)):[]
  const rootProps = {
    cid: props.cid,
    model: props.metas[props.model].meta.columns[col].obj,
    mode: mode,
    callback: mode == "single" ? on_find_new : on_find_m2m,
    extcond: extcond,
    domaincond: domaincond,
    callbackOpts: {
      ...callbackopts,
      col: col,
      mode: "mode" in callbackopts ? callbackopts.mode : "find",
    },
  };
  const vnode = createVNode(rootComponent, rootProps);
  vnode.appContext = proxy.$appcontext;
  const rootContainer = document.createElement("div");
  render(vnode, rootContainer, false);
  document.querySelector("#sv").appendChild(rootContainer);
};

const do_modal_form = (col, oid, mode) => {
  const rootComponent = defineAsyncComponent({
    loader: () => import("./gp-form-modal.vue"),
    suspensible: false,
  });
  const rootProps = {
    cid: props.cid,
    model: props.metas[props.model].meta.columns[col].obj,
    oid: oid,
    mode: mode,
  };
  if (mode === "new") {
    rootProps.callback = on_find_new;
    rootProps.callbackOpts = {
      item: props.maps.__containers__[props.container][page.value - 1],
      col: col,
      mode: "new",
    };
  }
  const vnode = createVNode(rootComponent, rootProps);
  vnode.appContext = proxy.$appcontext;
  const rootContainer = document.createElement("div");
  render(vnode, rootContainer, false);
  document.querySelector("#sv").appendChild(rootContainer);
};

const do_action = (action) => {
  //console.log('action:', action)
  switch (action) {
    case "new":
      //mode.value = 'new'
      break;
    case "edit":
      //mode.value = 'edit'
      break;
    case "lookup":
      //mode.value = 'lookup'
      break;
    case "find":
      showSearch.value = true;
      break;
  }
};

const do_add = (col) => {
  do_modal_form(col, null, "new");
};

const do_edit = (col, oid) => {
  do_modal_form(col, oid, "edit");
};

const do_lookup = (col, oid) => {
  do_modal_form(col, oid, "lookup");
};

const request = (content) => {
  getBase64(content.file).then((res) => {
    props.maps.__containers__[props.container][page.value - 1].__data__[
      content.action
    ] = res;
    cache(
      props.maps.__containers__[props.container][page.value - 1],
      content.action
    );
  });
};

const getBase64 = (file) => {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader();
    let imgResult = "";
    reader.readAsDataURL(file);
    reader.onload = function () {
      imgResult = reader.result;
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.onloadend = function () {
      resolve(imgResult);
    };
  });
};

onMounted(() => {
  let rules = {};
  for (
    let i = 0,
      c = props.metas[props.model].views.form.columns
        .map((v) => v.col)
        .filter((c) => c != props.rel),
      meta = props.metas[props.model].meta.columns;
    i < c.length;
    i++
  ) {
    colsType[c[i]] = meta[c[i]].type;
    colsLabel[c[i]] = meta[c[i]].label;
    colsTranslate[c[i]] =
      "translate" in meta[c[i]] ? meta[c[i]].translate : false;
    colsLang[c[i]] = proxy.$UserPreferences.lang;
    if (colsType[c[i]] == "selection")
      selOptions[c[i]] = _get_selections(meta[c[i]].selections);
  if (meta[c[i]].required)
      formRules[c[i]] = [
        {
          required: true,
          message: `Please input ${colsLabel[c[i]]}`,
          trigger: [
            "char",
            "varchar",
            "composite",
            "decomposite",
            "tree",
          ].indexOf(colsType[c[i]])
            ? "blur"
            : "change",
        },
      ];
  
    if (colsType[c[i]] == "one2many") o2mcols.push(c[i]);
    else cols.push(c[i]);
  }
      // Object.assign(formRules, rules);
      console.log("formRules:",formRules);
  fields.splice(0, fields.length, ...fieldsBuild(props.model, "form"));
  // console.log("PROPS-O2MFORM:", props.maps.__containers__[props.container]);
});
</script>
