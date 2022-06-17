<style>
</style>

<template>
  <el-row>
    <el-button
      type="primary"
      @click="add_row(model, container, 'list')"
      v-if="mode != 'lookup'"
      size="small"
      :icon="DocumentAdd"
    ></el-button>
    <el-popconfirm
      v-if="mode != 'lookup' && multipleSelection.length > 0"
      confirmButtonText="OK"
      cancelButtonText="No, Thanks"
      :icon="InfoFilled"
      iconColor="red"
      title="Are you sure to delete?"
      @confirm="remove_rows()"
    >
      <template #reference>
        <el-button type="danger" size="small" :icon="Delete"></el-button>
      </template>
    </el-popconfirm>
  </el-row>
  <el-container>
    <el-table
      @selection-change="handleSelectionChange"
      :data="tableDataDisplay"
      style="width: 100%"
      fit
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="expand" v-if="o2mcols.length > 0">
        <template #default="props">
          <el-tabs type="border-card" v-if="o2mcols.length > 0">
            <el-tab-pane
              :label="colsLabel[o2mcol]"
              v-for="o2mcol in o2mcols"
              :key="o2mcol"
            >
              <gp-o2m-components
                :cid="cid"
                :guid="guid"
                :root="props.row"
                :metas="metas"
                :model="metas[model].meta.columns[o2mcol].obj"
                :container="o2mcol + '.' + props.row.__path__"
                :cdata="props.row.__o2m_containers__[o2mcol + '.' + cdata[page - 1].__path__]"
                :mode="mode"
                :rel="metas[model].meta.columns[o2mcol].rel"
              />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-table-column>
      <el-table-column
        :prop="getProp(col)"
        :label="colsLabel[col]"
        v-for="col in cols"
        :key="col"
      >
        <template v-if="colsType[col] == 'selection'" #default="scope">
          {{ selOptions[col][scope.row[col]] }}
        </template>
        <template v-else-if="colsType[col] == 'boolean'" #default="scope">
          <el-switch v-model="scope.row[col]" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Operations"
        width="120"
        v-if="mode != 'lookup'"
      >
        <template #default="scope">
          <el-popconfirm
            confirmButtonText="OK"
            cancelButtonText="No, Thanks"
            :icon="InfoFilled"
            iconColor="red"
            title="Are you sure to delete?"
            @confirm="remove_row(scope.row.__path__)"
          >
            <template #reference>
              <el-button type="danger" size="small" :icon="Delete"></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-container>
  <el-pagination
    v-if="cdata.length > pageSize"
    background
    layout="prev, pager, next"
    @current-change="handleCurrentChange"
    :page-size="pageSize"
    :total="cdata.length"
  >
  </el-pagination>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "gp-o2m-list",
});
</script>

<script setup>
import { ref, reactive, onMounted, computed, getCurrentInstance } from "vue";

import { on_modify_models } from "../../js/nf";

import { DocumentAdd, Delete, InfoFilled } from "@element-plus/icons-vue";

const props = defineProps({
  cid: {
    type: String,
    required: true,
  },
  guid: {
    type: String,
    required: true,
  },
  root: {
    type: Object,
  },

  metas: {
    type: Object,
  },
  model: {
    type: String,
    required: true,
  },
  container: {
    type: String,
    required: true,
  },
  cdata: {
    type: Object,
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

const { proxy } = getCurrentInstance();
const page = ref(1);
const pageSize = ref(15);
const cols = reactive([]);
const o2mcols = reactive([]);
const colsType = reactive({});
const colsLabel = reactive({});
const selOptions = reactive({});
const multipleSelection = reactive([]);

const handleSelectionChange = (val) => {
  multipleSelection.splice(0, multipleSelection.length, ...val);
};

const getProp = (col) => {
  return ["many2one", "referenced", "related"].indexOf(colsType[col]) >= 0
    ? "__data__." + col + ".name"
    : "__data__." + col;
};

const add_row = (model, container, view) => {
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "_cache",
        "add",
        props.guid,
        {
          model: props.model,
          container: props.container,
          context: {},
          view: view,
        },
      ],
    })
    .then((msg) => on_modify_models(props.root, msg[0]));
};

const remove_row = (path) => {
  //console.log('remove_row:',path,props.container)
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "_cache",
        "remove",
        props.guid,
        { path: path, container: props.container, context: {} },
      ],
    })
    .then((msg) => on_modify_models(props.root, msg[0]));
};

const remove_rows = () => {
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "_cache",
        "removes",
        props.guid,
        {
          rows: multipleSelection.map(function (v) {
            return { path: v["__path__"], container: props.container };
          }),
          context: {},
        },
      ],
    })
    .then((msg) =>
      //console.log('on_removes:',msg[0]))
      on_modify_models(props.root, msg[0])
    );
};

const handleCurrentChange = (val) => {
  page.value = val;
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

const tableDataDisplay = computed(() => {
  if (props.cdata === null || props.cdata.length === 0) return reactive([]);
  else
    return props.cdata.slice(
      pageSize.value * page.value - pageSize.value,
      pageSize.value * page.value
    );
});

onMounted(() => {
  for (
    let i = 0,
      c = props.metas[props.model].views.list.columns
        .map((v) => v.col)
        .filter((c) => c != props.rel),
      meta = props.metas[props.model].meta.columns;
    i < c.length;
    i++
  ) {
    colsType[c[i]] = meta[c[i]].type;
    colsLabel[c[i]] = meta[c[i]].label;
    if (colsType[c[i]] == "selection")
      selOptions[c[i]] = _get_selections(meta[c[i]].selections);
    if (colsType[c[i]] == "one2many") o2mcols.push(c[i]);
    else cols.push(c[i]);
  }
  //console.log('COLS:',colsType,colsLabel,cols,o2mcols,props.root,props.cdata);
  console.log("PROPS-O2MLIST:", props.cdata);
});
</script>
