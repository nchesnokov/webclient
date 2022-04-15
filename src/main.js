import { createApp,defineAsyncComponent,reactive } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'

import VueApexCharts from "vue3-apexcharts";

import WebSocketVue from './js/vue3-async-websocket';
import {v4 as uuidv4} from 'uuid'

const url = 'ws://localhost:8100/ws';

function genID(){ return uuidv4()}


const defOptions = {
    'debug': false,
    'load-on-start': true,   
    'create-id-func': genID ,
};

import mitt from 'mitt';
const emitter = mitt();

const app = createApp(App)

app.use(ElementPlus)
//installElementPlus(app)

app.use( WebSocketVue, url, defOptions );

app.use(VueApexCharts);

import JsonViewer from "vue3-json-viewer"
app.use(JsonViewer)

import {createI18n} from 'vue3-i18n'
const VueI18n = createI18n({locale:'en'})
app.use(VueI18n)

app.component('gp-customizable',defineAsyncComponent(() => import('./components/gp-customizable.vue')));
app.component('gp-selectable',defineAsyncComponent(() => import('./components/gp-selectable.vue')));
app.component('gp-form-login',defineAsyncComponent(() => import('./components/gp-form-login.vue')));
app.component('gp-user-preferences',defineAsyncComponent(() => import('./components/gp-user-preferences.vue')));
app.component('gp-form',defineAsyncComponent(() => import('./components/gp-form.vue')));
app.component('gp-search',defineAsyncComponent(() => import('./components/gp-search.vue')));
//app.component('gp-find',defineAsyncComponent(() => import('./components/gp-find.vue')));
app.component('gp-list',defineAsyncComponent(() => import('./components/gp-list.vue')));
app.component('gp-m2m-list',defineAsyncComponent(() => import('./components/gp-m2mlist.vue')));
app.component('gp-o2m-components',defineAsyncComponent(() => import('./components/gp-o2m-components.vue')));
app.component('gp-o2m-list',defineAsyncComponent(() => import('./components/gp-o2m-list.vue')));
app.component('gp-o2m-form',defineAsyncComponent(() => import('./components/gp-o2m-form.vue')));

app.component('gp-table',defineAsyncComponent(() => import('./components/gp-table.vue')));
app.component('gp-tree',defineAsyncComponent(() => import('./components/gp-tree.vue')));
app.component('gp-graph',defineAsyncComponent(() => import('./components/gp-graph.vue')));
app.component('gp-calendar',defineAsyncComponent(() => import('./components/gp-calendar.vue')));
app.component('gp-geo',defineAsyncComponent(() => import('./components/gp-geo.vue')));
app.component('kanban-board',defineAsyncComponent(() => import('./components/Kanban.vue')));
app.component('gp-kanban',defineAsyncComponent({loader:() => import('./components/gp-kanban.vue')}));

app.config.globalProperties.$appcontext = app._context;
app.config.globalProperties.$emitter = emitter;
app.config.globalProperties.$UserPreferences = reactive({});



app.mount('#app')
