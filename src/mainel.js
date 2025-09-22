import ElementPlus from 'element-plus'

import VueApexCharts from "vue3-apexcharts";


var app = window.app

app.config.compilerOptions.isCustomElement = (tag) => tag.includes('-')


app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.use(VueApexCharts);

import JsonViewer from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css";
app.use(JsonViewer)

app.component('gp-customizable',defineAsyncComponent(() => import('./components/static/gp-customizable.vue')));
app.component('gp-selectable',defineAsyncComponent(() => import('./components/static/gp-selectable.vue')));
app.component('gp-form-login',defineAsyncComponent(() => import('./components/static/gp-form-login.vue')));
app.component('gp-user-preferences',defineAsyncComponent(() => import('./components/static/gp-user-preferences.vue')));
app.component('gp-form',defineAsyncComponent(() => import('./components/static/gp-form.vue')));
//customElements.define('gp-form',defineCustomElement(() => import('./components/static/gp-form.vue')));
app.component('gp-search',defineAsyncComponent(() => import('./components/static/gp-search.vue')));
//app.component('gp-find',defineAsyncComponent(() => import('./components/gp-find.vue')));
app.component('gp-list',defineAsyncComponent(() => import('./components/static/gp-list.vue')));
app.component('gp-m2m-list',defineAsyncComponent(() => import('./components/static/gp-m2mlist.vue')));
app.component('gp-o2m-components',defineAsyncComponent(() => import('./components/static/gp-o2m-components.vue')));
app.component('gp-o2m-list',defineAsyncComponent(() => import('./components/static/gp-o2m-list.vue')));
app.component('gp-o2m-form',defineAsyncComponent(() => import('./components/static/gp-o2m-form.vue')));

app.component('gp-table',defineAsyncComponent(() => import('./components/static/gp-table.vue')));
app.component('gp-tree',defineAsyncComponent(() => import('./components/static/gp-tree.vue')));
app.component('gp-graph',defineAsyncComponent(() => import('./components/static/gp-graph.vue')));
app.component('gp-calendar',defineAsyncComponent(() => import('./components/static/gp-calendar.vue')));
app.component('gp-geo',defineAsyncComponent(() => import('./components/static/gp-geo.vue')));
app.component('kanban-board',defineAsyncComponent(() => import('./components/static/Kanban.vue')));
app.component('gp-kanban',defineAsyncComponent({loader:() => import('./components/static/gp-kanban.vue')}));
app.component('gp-mdx',defineAsyncComponent({loader:() => import('./components/static/gp-mdx.vue')}));
app.component('gp-gantt',defineAsyncComponent({loader:() => import('./components/static/gp-gantt.vue')}));
app.component('gp-schedule',defineAsyncComponent({loader:() => import('./components/static/gp-schedule.vue')}));

app.config.globalProperties.$appcontext = app._context;
app.config.globalProperties.$UserPreferences = reactive({});
