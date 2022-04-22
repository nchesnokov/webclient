

<template>

<slot name="search">
    <el-row>
        <gp-selectable v-if="showSearch" :columns="metas[model].meta.columns" :names="metas[model].meta.names" @update:search="do_search" @update:search-cancel="showSearch = false"></gp-selectable>
    </el-row>
</slot>
<slot>
    <el-row>{{ metas[model].meta.description }}</el-row>
    <el-row>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="do_action('find')"></el-button>
    </el-row>
    <el-pagination v-if="multipleSelection.length > 1" background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="multipleSelection.length">
    </el-pagination>

    <l-map v-model="zoom" v-model:zoom="zoom" :zoom="zoom" :center="center" @move="log('move')">
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
        <l-marker :lat-lng="marker">
            <l-icon :icon-url="iconUrl" :icon-size="iconSize" />
        </l-marker>
    </l-map>
</slot>

</template>

<script>

import "leaflet/dist/leaflet.css"
import {
    latLng
}
from "leaflet/dist/leaflet-src.esm";
import {
    defineComponent, ref, reactive, computed, getCurrentInstance, onMounted
}
from 'vue';
import {
    LMap, LTileLayer, LMarker, LIcon
}
from '@vue-leaflet/vue-leaflet';

export default defineComponent({
    name: 'gp-geo',
    props: ['cid', 'metas', 'model'],
    components: {
        LMap, LTileLayer, LMarker, LIcon
    },
    setup(props) {
        const {
            proxy
        } = getCurrentInstance();
        const showSearch = ref(false);
        const page = ref(1);
        const pageSize = ref(1);
        const fields = reactive([]);
        const dataGeo = reactive([]);
        const multipleSelection = reactive([]);
        const zoom = ref(13);
        const center = ref(latLng(49.413220, -1.219482));
        const marker = ref(latLng(49.413220, -1.219482));
        const url = ref('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
        const attribution = ref('&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors');
        const iconWidth = ref(25);
        const iconHeight = ref(40);

        const handleCurrentChange = (val) => {
            page.value = val;
            proxy.$ws.sendAsync({
                _msg: [props.cid, 'models', props.model, 'read', {
                    'fields': fields,
                    'ids': multipleSelection[page.value - 1],
                    'context': proxy.$UserPreferences.Context
                }]
            }).then(msg => on_read(msg) );
        };

        const fieldsBuild = (model, view) => {
            let fcols = [];
            for (let i = 0, columns = props.metas[model].views[view].columns.map((v) => v.col); i < columns.length; i++)
                switch (props.metas[model].meta.columns[columns[i]].type) {
                    case 'one2many':
                    case 'many2many':
                        break;
                    default:
                        fcols.push(columns[i]);
                }
            return fcols;
        };

        const log = console.log;

        const iconUrl = computed(() => {
            return `https://placekitten.com/${iconWidth.value}/${iconHeight.value}`;
        });
        const iconSize = computed(() => {
            return [iconWidth, iconHeight];
        });


        const do_action = (action) => {
            console.log('action:', action);
            switch (action) {
                case 'find':
                    showSearch.value = true;
                    break;
            }
        };

        const do_search = (event) => {
            proxy.$ws.sendAsync({
                _msg: [props.cid, 'models', props.model, 'search', {
                    'cond': event.cond,
                    'context': proxy.$UserPreferences.Context,
                    'offset': event.offset.value,
                    'limit': event.limit.value
                }]
            }).then(msg => on_search(msg));

        };

        const on_search = (msg) => {
            console.log('on-search:', msg);
            if (msg.length > 0) {
                multipleSelection.splice(0, multipleSelection.length, ...msg);
                showSearch.value = false;
                proxy.$ws.sendAsync({
                    _msg: [props.cid, 'models', props.model, 'read', {
                        'fields': fields,
                        'ids': multipleSelection[page.value - 1],
                        'context': proxy.$UserPreferences.Context
                    }]
                }).then(msg => on_read(msg) );

            }
        };

        const on_read = (msg) => {
            console.log('on_read:', msg);
            if (msg && msg.length > 0) {
                Object.assign(dataGeo, msg[0]);
                let c1 = dataGeo[props.metas[props.model].meta.names.latitude],
                    c2 = dataGeo[props.metas[props.model].meta.names.longitude];
                if (c1 != null && c2 != null) {
                    center.value = latLng(c1, c2);
                    marker.value = latLng(c1, c2);
                }
            }
        };

        onMounted(() => {
            fields.splice(0, fields.length, ...fieldsBuild(props.model, 'geo'));
        });


        return {
            page,
            pageSize,
            showSearch,
            fields,
            zoom,
            center,
            marker,
            url,
            attribution,
            iconUrl,
            iconSize,
            log,
            dataGeo,
            handleCurrentChange,
            multipleSelection,
            do_action,
            do_search
        };
    },
});

</script>
