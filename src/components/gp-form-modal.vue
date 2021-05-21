

<template>

<el-dialog :title="title" v-model="showDialog" width="75%">
  <gp-form v-if="Object.keys(metas).length > 0" :cid="cid" :metas="metas" :model="model" :modal="{'oid':oid,'mode':mode,'callback':callback,'callbackOpts':callbackOpts}" @update:close="showDialog = false"/>
</el-dialog>

</template>

<script>

import {
    defineComponent,
    onBeforeMount,
    reactive,
    ref,
    getCurrentInstance,
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
        const metas = reactive({})
        const title = ref('Modal Form')

        onBeforeMount(() => {
            console.log('props:',props)
            proxy.$websocket.sendAsync({
                    _msg: [props.cid, 'uis', 'get_meta_of_models_v2', {
                        model: props.model,
                        context: proxy.$UserPreferences.Context
                    }]
                }).then((msg) => {
                  if (msg && msg.length > 0) Object.assign(metas, msg[0])
                })
        })
        return {
            showDialog,
            metas,
            title
        }
    }
})

</script>
