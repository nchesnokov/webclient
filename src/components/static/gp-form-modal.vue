

<template>
  <el-dialog :title="title" v-model="showDialog" width="75%" :close-on-click-modal="false">
    <gp-form
      v-if="Object.keys(metas).length > 0"
      :cid="cid"
      :metas="metas"
      :model="model"
      :modal="{
        oid: oid,
        mode: mode,
        callback: callback,
        callbackOpts: callbackOpts,
      }"
      @update:close="showDialog = false"
    />
  </el-dialog>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "gp-form-modal",
});
</script>

<script setup>
import { getCurrentInstance, onBeforeMount, reactive, ref } from "vue";

const props = defineProps({
  cid: {
    type: String,
    required: true,
  },
  oid: {
    type: [String, Object],
    default: null,
  },
  model: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: "new",
  },
  callback: {
    type: Function,
    default: function () {
      return null;
    },
  },
  callbackOpts: {
    type: Object,
    default: function () {
      return {};
    },
  },
});

const { proxy } = getCurrentInstance();
const showDialog = ref(true);
const metas = reactive({});
const title = ref("Modal Form");

onBeforeMount(() => {
  proxy.$ws
    .sendAsync({
      _msg: [
        props.cid,
        "uis",
        "get_meta_of_models_v2",
        {
          model: props.model,
          context: proxy.$UserPreferences.Context,
        },
      ],
    })
    .then((msg) => {
      if (msg && msg.length > 0) {
        Object.assign(metas, msg[0]);
        title.value = metas[props.model].meta.description;
      }
    });
});
</script>
