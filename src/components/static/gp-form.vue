<template>
  <slot name="search">
    <el-row>
      <gp-selectable
        v-if="showSearch"
        :columns="metas[model].meta.columns"
        :names="metas[model].meta.names"
        :cid="cid"
        @update:search="do_search"
        @update:search-cancel="showSearch = false"
      ></gp-selectable>
    </el-row>
  </slot>
  <slot>
    <el-row>{{ mode + ":" + metas[model].meta.description }}</el-row>
    <el-row>
      <el-dropdown @command="i18nCommand">
        <span class="el-dropdown-link">
          {{ $UserPreferences.lang.toLowerCase() }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="lang in $UserPreferences.langs"
              :key="lang.code"
              :command="{ lang: lang.code }"
              >{{ lang.description }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-row>
    <el-row>
      <el-button
        v-if="!showSearch"
        type="primary"
        size="small"
        :icon="Search"
        @click="do_action('find')"
      >
      </el-button>
      <el-button
        v-if="multipleSelection.length == 0"
        type="primary"
        size="small"
        :icon="DocumentAdd"
        @click="do_action('new')"
      ></el-button>
      <el-button
        v-if="multipleSelection.length > 0 && mode == 'lookup'"
        type="primary"
        size="small"
        :icon="Edit"
        @click="do_action('edit')"
      ></el-button>
      <el-button
        v-if="multipleSelection.length > 0 && mode == 'edit'"
        type="primary"
        size="small"
        :icon="View"
        @click="do_action('lookup')"
      ></el-button>
    </el-row>
    <el-pagination
      v-if="multipleSelection.length > 1"
      background
      layout="total, prev, pager, next, jumper"
      @current-change="handleCurrentChange"
      :page-size="pageSize"
      :total="multipleSelection.length"
    >
    </el-pagination>
    <el-form
      v-if="'__data__' in dataForm && Object.keys(dataForm.__data__).length > 0"
      :model="dataForm.__data__"
      :rules="formRules"
      label-width="auto"
      status-icon
      inline-message
    >
      <el-form-item
        :label="colsLabel[col]"
        v-for="col in cols"
        :key="col"
        :prop="col"
      >
        <el-autocomplete
          :fetch-suggestions="querySearch"
          clearable
          fit-input-width
          :trigger-on-focus="false"
          @focus="setAutocomleteCol(col)"
          :value-key="col"
          v-model="dataForm.__data__[col].name"
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
        </el-autocomplete>
        <el-autocomplete
          :fetch-suggestions="querySearch"
          clearable
          :trigger-on-focus="false"
          fit-input-width
          @focus="setAutocomleteCol(col)"
          :value-key="col"
          v-model="dataForm.__data__[col].name"
          v-if="colsType[col] == 'related'"
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
        </el-autocomplete>
        <el-input
          v-model="dataForm.__data__[col]"
          :maxlength="colsSize[col]"
          show-word-limit
          v-else-if="
            ['char', 'varchar', 'composite', 'decomposite', 'tree'].indexOf(
              colsType[col]
            ) >= 0
          "
          @change="cache(dataForm, col)"
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
<!--
        <json-viewer
          v-if="colsType[col] == 'json'"
          :value="dataForm.__data__[col]"
          copyable
          boxed
          sort
        />
 -->
<JsonEditor  v-if="colsType[col] == 'json'"
    :options="{
        confirmText: 'confirm',
        cancelText: 'cancel',
    }"
	v-model:objData="dataForm.__data__[col]"
	/>
        <el-input
          v-model="dataForm.__data__[col]"
          v-else-if="
            [
              'uuid',
              'integer',
              'float',
              'decimal',
              'numeric',
              'timedelta',
            ].indexOf(colsType[col]) >= 0
          "
          @change="cache(dataForm, col)"
          :readonly="readonly(col)"
        >
          <template v-if="isCompute(col)" #prefix>
            <el-button type="primary" size="small" :icon="Monitor" />
          </template>
        </el-input>
        <QuillEditor
          v-model:context="dataForm.__data__[col]"
          theme="snow"
          v-else-if="colsType[col] == 'richtext'"
        />
        <el-input
          v-model="dataForm.__data__[col]"
          autosize
          type="textarea"
          v-else-if="['text', 'xml'].indexOf(colsType[col]) >= 0"
          @change="cache(dataForm, col)"
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
          v-model="dataForm.__data__[col]"
          v-else-if="colsType[col] == 'date'"
          @change="cache(dataForm, col)"
          :readonly="readonly(col)"
        ></el-date-picker>
        <el-time-picker
          v-model="dataForm.__data__[col]"
          v-else-if="colsType[col] == 'time'"
          @change="cache(dataForm, col)"
          :readonly="readonly(col)"
        ></el-time-picker>
        <el-date-picker
          v-model="dataForm.__data__[col]"
          type="datetime"
          v-else-if="colsType[col] == 'datetime'"
          @change="cache(dataForm, col)"
          :readonly="readonly(col)"
        ></el-date-picker>
        <el-select
          v-model="dataForm.__data__[col]"
          v-else-if="colsType[col] == 'selection'"
          @change="cache(dataForm, col)"
          :disabled="readonly(col)"
        >
          <el-option
            v-for="item in selOptions[col]"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-row v-else-if="colsType[col] == 'many2many'">
          <el-button
            type="primary"
            @click="do_find(col, 'multiple', [], { path: dataForm.__path__ })"
            >Add</el-button
          >
          <br />
          <gp-m2m-list
            :metas="metas"
            :model="metas[model].meta.columns[col].obj"
            :tableData="dataMaps.__containers__[col + '.' + dataForm.__path__]"
          >
          </gp-m2m-list>
        </el-row>
        <el-switch
          v-model="dataForm.__data__[col]"
          v-else-if="colsType[col] == 'boolean'"
          @change="cache(dataForm, col)"
          :disabled="readonly(col)"
        ></el-switch>
        <el-image
          v-else-if="
            colsType[col] == 'binary' &&
            metas[model].meta.columns[col].accept == 'image/*' &&
            dataForm.__data__[col] != null
          "
          style="width: 100px; height: 100px"
          :src="
            'data:image/jpeg;base64,' +
            dataForm.__data__[col].slice(1, dataForm.__data__[col].length - 8)
          "
          fit="fill"
        ></el-image>
        <el-upload
          v-else-if="
            colsType[col] == 'binary' &&
            metas[model].meta.columns[col].accept == 'image/*' &&
            dataForm.__data__[col] == null
          "
          ref="dataForm.__data__[col]"
          :data="dataForm.__data__[col]"
          list-type="picture"
          action=""
          :auto-upload="false"
        >
          <template #trigger>
            <el-button type="primary">select file</el-button>
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
            :maps="dataMaps"
            :metas="metas"
            :model="metas[model].meta.columns[o2mcol].obj"
            :container="o2mcol + '.' + dataForm.__path__"
            :mode="mode"
            :rel="metas[model].meta.columns[o2mcol].rel"
          />
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </slot>
  <slot name="footer">
    <el-popconfirm
      v-if="mode == 'new'"
      confirmButtonText="OK"
      cancelButtonText="No, Thanks"
      icon="el-icon-info"
      iconColor="red"
      title="Are you sure to clear?"
      @confirm="onClear"
    >
      <template #reference>
        <el-button type="danger">Clear</el-button>
      </template>
    </el-popconfirm>
    <el-popconfirm
      v-if="Object.keys(modal).length > 0 && mode != 'lookup'"
      confirmButtonText="OK"
      cancelButtonText="No, Thanks"
      icon="el-icon-info"
      iconColor="red"
      title="Are you sure to close?"
      @confirm="onClose"
    >
      <template #reference>
        <el-button type="danger">Close</el-button>
      </template>
    </el-popconfirm>
    <el-button v-else type="danger" @click="onClose">Close</el-button>
    <el-button type="success" @click="onValidate" :disabled="mode == 'lookup'"
      >Validate</el-button
    >
    <el-button type="primary" @click="onSubmit" :disabled="mode == 'lookup'"
      >{{ mode == "copy" ? "Copy" : "Save" }}
    </el-button>
  </slot>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "gp-form",
});
</script>


<script setup>
import {
  defineAsyncComponent,
  onBeforeMount,
  ref,
  reactive,
  getCurrentInstance,
  render,
  h,
  createVNode,
} from "vue";

import { on_modify_models, dataRowMaps } from "../../js/nf.js";

import {
  Monitor,
  Search,
  DocumentAdd,
  Edit,
  View,
  ArrowDown,
} from "@element-plus/icons-vue";
// import { classType } from "element-plus/es/components/table-v2/src/common.js";
import JsonEditor from "vue3-json-edit";
import "vue3-json-edit/dist/style.css";
const props = defineProps({
  cid: {
    type: String,
    required: true,
  },
  metas: {
    type: Object,
  },
  model: {
    type: String,
    required: true,
  },
  modal: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emit = defineEmits(["update:close"]);

const { proxy } = getCurrentInstance();
const autoCompleteCol = ref("");
const mode = ref("new");
const guid = ref(null);
const page = ref(1);
const pageSize = ref(1);
const showSearch = ref(false);
const colsType = reactive({});
const colsLabel = reactive({});
const colsSize = reactive({});
const colsTranslate = reactive({});
const colsLang = reactive({});
const dataMaps = reactive({ __ids__: {}, __containers__: {} });
const dataForm = reactive({});
const selOptions = reactive({});
const formRules = reactive({});
const fields = reactive([]);
const cols = reactive([]);
const o2mcols = reactive([]);
const multipleSelection = reactive([]);

const readonly = (col) => {
  return (
    mode.value == "lookup" ||
    dataForm.__meta__.ro[col] ||
    isCompute(col) ||
    (colsType[col] == "related" && isRelatedEmpry(col))
  );
};

const required = (path, col) => {
  // console.log("required:", path, col);
  return dataForm.__meta__.rq[col];
};

const visible = (path, col) => {
  // console.log("visible:", path, col);
  return !dataForm.__meta__.iv[col];
};

const listRelatedFields = (relatedy) => {
  return relatedy.map((v) => {
    return Array.isArray(v) ? v[0] : v;
  });
};

const isRelatedEmpry = (col) => {
  // console.log("isRelatedEmpry:", col);
  return listRelatedFields(
    props.metas[props.model].meta.columns[col].relatedy
  ).every((v) => {
    if (
      ["many2one", "referenced", "related"].indexOf(
        props.metas[props.model].meta.columns[col].type
      ) >= 0 &&
      dataForm.__data__[v].id == null
    )
      return true;
    else if (dataForm.__data__[v] == null) return true;
    return false;
  });
};

const setAutocomleteCol = (col) => {
  // console.log("autocomplete:", col);
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
    // console.log("querySearch:", queryString, cb, autoCompleteCol.value);
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
  // console.log("handleSelect:", item);
  if (props.metas[props.model].meta.columns[autoCompleteCol.value.col].type == "related") related_cache(dataForm,autoCompleteCol.value.col,props.metas[props.model].meta.columns[autoCompleteCol.value.col].relatedy)
  else  m2o_cache(dataForm, autoCompleteCol.value.col);
};
const addRow = () => {};

const cache = (item, name) => {
  // console.log("cache-item:", name, item.__data__[name], item);
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
    case "binary":
      value = {
        __binary__: item.__data__[name],
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
  // console.log("cache:", r);
  proxy.$ws
    .sendAsync({
      _msg: [props.cid, "_cache", "cache", guid.value, r],
    })
    .then((v) => {
      // console.log("cache:", v);
      if (v.length > 0) on_modify_models(dataMaps, v[0]);
    });
};

const m2o_cache = (item, name) => {
  // console.log("m2o_cache:", name, item.__data__[name], item);
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
    context: proxy.$UserPreferences.Context,
  };
  // console.log("cache:", r);
  proxy.$ws
    .sendAsync({
      _msg: [props.cid, "_cache", "m2ofind", guid.value, r],
    })
    .then((v) => {
      // console.log("m2ofind:", v);
      let f = v[0];
      if (f.__m2o_find__.__data__.v.length == 1) {
        for (let key in f.__m2o_find__.__data__.v[0])
          if (key == "id")
            dataForm.__data__[name].id = f.__m2o_find__.__data__.v[0].id;
          else dataForm.__data__[name].name = f.__m2o_find__.__data__.v[0][key];
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
            if (Array.isArray(d[i]))
              extcond.push({
                __tuple__: d[i],
              });
            else extcond.push(d[i]);
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
      _msg: [props.cid, "_cache", "relatedfind", guid.value, r],
    })
    .then((v) => {
      // console.log("relatedfind:", v);
      let f = v[0];
      if (f.__related_find__.__data__.v.length == 1) {
        dataForm.__data__[name] = f.__related_find__.__data__.v[0];
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

const i18nCommand = (command) => {
  // console.log("command-18n:", command);
  colsLang[command.col] = command.lang;
  let ctx = Object.assign({}, proxy.$UserPreferences.Context);
  ctx.lang = command.lang;
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "models",
        props.model,
        "read",
        {
          fields: [command.col],
          ids: dataForm.__data__.id,
          context: ctx,
        },
      ],
    })
    .then((msg) => {
      dataForm.__data__[command.col] = msg[0][command.col];
    });
};
const handleSelectionChange = (val) => {
  //console.log('selection:', val)
  multipleSelection.splice(0, multipleSelection.length, ...val);
};

const handleCurrentChange = (val) => {
  page.value = val;
  let ctx = Object.assign({}, proxy.$UserPreferences.Context);
  ctx.cache = guid.value;
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "models",
        props.model,
        "readforupdate",
        {
          fields: fields,
          ids: multipleSelection[page.value - 1],
          context: ctx,
        },
      ],
    })
    .then((msg) => on_read(msg));
};

const isCompute = (col) => {
  return (
    ("compute" in props.metas[props.model].meta.columns[col] &&
      props.metas[props.model].meta.columns[col].compute != null) ||
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

const on_find_new = (value, opts) => {
  // console.log("on_find_new:", value, opts);
  if (
    ["new", "edit"].indexOf(mode.value) >= 0 &&
    value.id &&
    value.id.length > 0 &&
    value.name &&
    value.name.length > 0
  )
    Object.assign(dataForm.__data__[opts.col], value);
  cache(opts.item, opts.col);
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
          context: {},
        },
      ],
    })
    .then((msg) => on_modify_models(dataMaps, msg[0]));
};
const on_find_m2m = (value, opts) => {
  // console.log("on_find_m2m:", value, opts);
  if (["new", "edit"].indexOf(mode.value) >= 0 && value.length > 0) {
    let model = dataForm.__model__;
    let container = opts.col + "." + opts.path;
    let obj = props.metas[dataForm.__model__].meta.columns[opts.col].obj;
    let fields = props.metas[obj].views.m2mlist.columns.map((f) => f.col);
    let rel = props.metas[dataForm.__model__].meta.columns[opts.col].rel;
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

const fieldsBuild = (model, view) => {
  let fcols = [];
  for (
    let i = 0,
      columns = props.metas[model].views[view].columns.map((v) => v.col),
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
          k[columns[i]] = props.metas[model].views.list.columns.map(
            (v) => v.col
          );
        fcols.push(k);
        break;
      case "many2many":
        k = {};
        k[columns[i]] = props.metas[
          props.metas[model].meta.columns[columns[i]].obj
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
    loader: () => import("./gp-find.vue"),
    suspensible: false,
  });
  if (colsType[col] == "related") extcond.push(...relatedyConditions(col));
  // if (props.metas[props.model].meta.columns[col].domain !== null)
  //   for (
  //     let i = 0, domain = props.metas[props.model].meta.columns[col].domain;
  //     i < domain.length;
  //     i++
  //   )
  //     if (Array.isArray(domain[i])) extcond.push({ __tuple__: domain[i] });
  //     else extcond.push(domain[i]);
  // console.log("Extcond:", extcond);
  let domaincond =
    props.metas[props.model].meta.columns[col].domain != null
      ? domainConditions(props.metas[props.model].meta.columns[col].domain)
      : [];
  const rootProps = {
    cid: props.cid,
    model: props.metas[props.model].meta.columns[col].obj,
    mode: mode,
    callback: mode == "single" ? on_find_new : on_find_m2m,
    domaincond: domaincond,
    extcond: extcond,
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
  document.body.appendChild(rootContainer);
  //console.log('do-search!', col, vnode, proxy)
};

const do_search = (event) => {
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "models",
        props.model,
        "search",
        {
          cond: event.cond,
          context: proxy.$UserPreferences.Context,
          offset: event.offset.value,
          limit: event.limit.value,
        },
      ],
    })
    .then((msg) => on_search(msg));
};

const on_search = (msg) => {
  //console.log('on-search:', msg)
  if (msg.length > 0) {
    multipleSelection.splice(0, multipleSelection.length, ...msg);
    showSearch.value = false;
    mode.value = "edit";
    let ctx = Object.assign({}, proxy.$UserPreferences.Context);
    ctx.cache = guid.value;
    proxy.$ws
      .sendAsync({
        _msg: [
          props.cid,
          "models",
          props.model,
          "readforupdate",
          {
            fields: fields,
            ids: multipleSelection[page.value - 1],
            context: ctx,
          },
        ],
      })
      .then((msh) => on_read(msg));
  }
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
      item: dataForm,
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
      mode.value = "new";
      break;
    case "edit":
      mode.value = "edit";
      break;
    case "lookup":
      mode.value = "lookup";
      break;
    case "find":
      showSearch.value = true;
      break;
    case "m2mfind":
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

const onSubmit = async () => {
  (async () => {
    if (["new", "edit", "copy"].indexOf(mode.value) >= 0) {
      let msg = await proxy.$ws.sendAsync({
        _msg: [
          props.cid,
          "_cache",
          mode.value == "copy" ? "copy" : "save",
          guid.value,
          {},
        ],
      });
      let action = msg[0],
        oid = msg[1];
      // console.log("action:", msg);
      if (action == "commit") {
        await proxy.$ws.sendAsync({
          _msg: [
            props.cid,
            "_cache",
            "commit",
            guid.value,
            {
              action: "commit work",
            },
          ],
        });
        dataForm.__data__.id = oid;
        if (mode.value == "new") {
          if (
            "callback" in props.modal &&
            props.modal.callback != null &&
            "callbackOpts" in props.modal &&
            props.modal.callbackOpts != null &&
            props.modal.callbackOpts.mode == "new"
          )
            props.modal.callback(
              {
                id: dataForm.__data__.id,
                name: dataForm.__data__[
                  props.metas[props.model].meta.names.rec_name
                ],
              },
              props.modal.callbackOpts
            );
          emit("update:close");
        }
        proxy.$notify({
          title: "Information",
          message: h(
            "i",
            {
              style: "color: teal",
            },
            "Record saved."
          ),
        });
      } else {
        if (action == "no chache")
          proxy.$notify({
            title: "Information",
            message: h(
              "i",
              {
                style: "color: teal",
              },
              "No cache!"
            ),
          });
      }
    }
  })();
};

const onValidate = () => {
  //console.log('validate')
};

const onClose = () => {
  emit("update:close");
};
const onClear = () => {
  if (mode.value == "new")
    proxy.$ws
      .sendAsync({
        _msg: [
          props.cid,
          "_cache",
          "initialize",
          guid.value,
          {
            model: props.model,
            view: "form",
          },
        ],
      })
      .then((msg) => {
        if (msg && msg.length > 0) {
          init_metacache();
          // Object.assign(dataForm, dataRowForm(msg[0]));
          // dataRowMaps(dataMaps,dataForm);
          dataRowMaps(dataMaps, msg[0]);
          Object.assign(dataForm, dataMaps.__ids__[msg[0].__path__]);
          // console.log("dataRowMaps:", dataMaps);

          // console.log("initialize:", msg);
        }
      });
};
const init_metacache = () => {
  for (let k in dataForm) dataMaps[k] = {};
};

const on_read = (msg) => {
  // console.log("on_read:", msg);
  if (msg && msg.length > 0) {
    init_metacache();
    dataRowMaps(dataMaps, msg[0]);
    Object.assign(dataForm, dataMaps.__ids__[msg[0].__path__]);
    // console.log("dataRowMaps:", dataMaps);
    // console.log("dataForm:", dataForm);
  }
};

onBeforeMount(async () => {
  if ("mode" in props.modal) mode.value = props.modal.mode;
  let msg = await proxy.$ws.sendAsync({
    _msg: [
      props.cid,
      "_cache",
      "open",
      {
        mode: mode.value,
        context: proxy.$UserPreferences.Context,
      },
    ],
  });
  if (msg && msg.length > 0) guid.value = msg[0];
  if (mode.value == "new") {
    msg = await proxy.$ws.sendAsync({
      _msg: [
        props.cid,
        "_cache",
        "initialize",
        guid.value,
        {
          model: props.model,
          view: "form",
        },
      ],
    });
    if (msg && msg.length > 0) {
      init_metacache();

      dataRowMaps(dataMaps, msg[0]);
      Object.assign(dataForm, dataMaps.__ids__[msg[0].__path__]);
      // console.log("dataRowMaps:", dataMaps);

      // console.log("dataForm:", dataForm);
    }
  }
    for (
    let i = 0,
      c = props.metas[props.model].views.form.columns.map((v) => v.col),
      meta = props.metas[props.model].meta.columns;
    i < c.length;
    i++
  ) {
    colsType[c[i]] = meta[c[i]].type;
    colsLabel[c[i]] = meta[c[i]].label;
    if (meta[c[i]].type == "selection")
      selOptions[c[i]] = _get_selections(meta[c[i]].selections);
    if (
      ["char", "varchar", "composite", "decomposite"].indexOf(colsType[c[i]]) >=
      0
    )
      colsSize[c[i]] = meta[c[i]].size ? meta[c[i]].size : 32767;
    colsTranslate[c[i]] =
      "translate" in meta[c[i]] ? meta[c[i]].translate : false;
    colsLang[c[i]] = proxy.$UserPreferences.lang;
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
  //Object.assign(formRules, rules);
  console.log("rules:", formRules);

  //console.log('translate:',colsTranslate,colsType)
  fields.splice(0, fields.length, ...fieldsBuild(props.model, "form"));
  if (mode.value !== "new" && "oid" in props.modal) {
    if (Array.isArray(props.modal.oid))
      multipleSelection.splice(0, multipleSelection.length, ...props.modal.oid);
    else multipleSelection.splice(0, multipleSelection.length, props.modal.oid);
    // console.log("multipleSelection:", multipleSelection);
    let ctx = Object.assign({}, proxy.$UserPreferences.Context);
    ctx.cache = guid.value;
    proxy.$ws
      .sendAsync({
        _msg: [
          props.cid,
          "models",
          props.model,
          "readforupdate",
          {
            ids: props.modal.oid,
            fields: fields,
            context: ctx,
          },
        ],
      })
      .then((msg) => on_read(msg));
  }
});
</script>
