import { createApp, defineAsyncComponent, defineComponent, defineCustomElement, reactive } from 'vue'

import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'

import App from './App.vue'

import VueApexCharts from "vue3-apexcharts";

import ganttastic from '@infectoone/vue-ganttastic'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import JsonViewer from "vue3-json-viewer"
import "vue3-json-viewer/dist/vue3-json-viewer.css";


const app = createApp(App)

app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.use(ganttastic)
app.use(VueApexCharts);
app.use(JsonViewer);

// app.config.compilerOptions.isCustomElement = (tag) => tag.includes('-')

app.config.globalProperties.$appcontext = app._context;
app.config.globalProperties.$UserPreferences = reactive({});

app.component('gp-customizable', defineAsyncComponent(() => import('./components/static/gp-customizable.vue')));
app.component('gp-selectable', defineAsyncComponent(() => import('./components/static/gp-selectable.vue')));
app.component('gp-form-login', defineAsyncComponent(() => import('./components/static/gp-form-login.vue')));
app.component('gp-user-preferences', defineAsyncComponent(() => import('./components/static/gp-user-preferences.vue')));
app.component('gp-form', defineAsyncComponent(() => import('./components/static/gp-form.vue')));
app.component('gp-search', defineAsyncComponent(() => import('./components/static/gp-search.vue')));
app.component('gp-list', defineAsyncComponent(() => import('./components/static/gp-list.vue')));
app.component('gp-m2m-list', defineAsyncComponent(() => import('./components/static/gp-m2mlist.vue')));
app.component('gp-o2m-components', defineAsyncComponent(() => import('./components/static/gp-o2m-components.vue')));
app.component('gp-o2m-list', defineAsyncComponent(() => import('./components/static/gp-o2m-list.vue')));
app.component('gp-o2m-form', defineAsyncComponent(() => import('./components/static/gp-o2m-form.vue')));
app.component('gp-table', defineAsyncComponent(() => import('./components/static/gp-table.vue')));
app.component('gp-tree', defineAsyncComponent(() => import('./components/static/gp-tree.vue')));
app.component('gp-graph', defineAsyncComponent(() => import('./components/static/gp-graph.vue')));
app.component('gp-calendar', defineAsyncComponent(() => import('./components/static/gp-calendar.vue')));
app.component('gp-geo', defineAsyncComponent(() => import('./components/static/gp-geo.vue')));
app.component('kanban-board', defineAsyncComponent(() => import('./components/static/Kanban.vue')));
app.component('gp-kanban', defineAsyncComponent({ loader: () => import('./components/static/gp-kanban.vue') }));
app.component('gp-mdx', defineAsyncComponent({ loader: () => import('./components/static/gp-mdx.vue') }));
app.component('gp-gantt', defineAsyncComponent({ loader: () => import('./components/static/gp-gantt.vue') }));
app.component('gp-schedule', defineAsyncComponent({ loader: () => import('./components/static/gp-schedule.vue') }));
app.component('QuillEditor', QuillEditor)
//app.component('JsonViewer', JsonViewer)

app.mount('#app')
