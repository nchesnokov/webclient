import { createApp,defineAsyncComponent,reactive } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'

import  {msgpack } from './js/msgpack.js'

import VueApexCharts from "vue3-apexcharts";

import {v4 as uuidv4} from 'uuid'

import WebSocketAsPromised from 'websocket-as-promised';

//const url = 'ws://localhost:8100/ws';

//function genID(){ return uuidv4()}


// const defOptions = {
//     'debug': false,
//     'load-on-start': true,   
//     'create-id-func': genID ,
// };

//import mitt from 'mitt';
//const emitter = mitt();

const app = createApp(App)

app.use(ElementPlus)
//installElementPlus(app)

//app.use( WebSocketVue, url, defOptions );

app.use(VueApexCharts);

import JsonViewer from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css";
app.use(JsonViewer)

// import {createI18n} from 'vue-i18n'
// const VueI18n = createI18n({locale:'en'})
// app.use(VueI18n)

app.component('gp-customizable',defineAsyncComponent(() => import('./components/static/gp-customizable.vue')));
app.component('gp-selectable',defineAsyncComponent(() => import('./components/static/gp-selectable.vue')));
app.component('gp-form-login',defineAsyncComponent(() => import('./components/static/gp-form-login.vue')));
app.component('gp-user-preferences',defineAsyncComponent(() => import('./components/static/gp-user-preferences.vue')));
app.component('gp-form',defineAsyncComponent(() => import('./components/static/gp-form.vue')));
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

app.config.globalProperties.$appcontext = app._context;
//app.config.globalProperties.$emitter = emitter;
app.config.globalProperties.$UserPreferences = reactive({});

async function WSP(url){
const wsp = new WebSocketAsPromised(url, {
    packMessage: data => msgpack.encode(data),
    unpackMessage: data => msgpack.decode(data),
    attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data), // attach requestId to message as `id` field
    extractRequestId: data => data && data.id,
});
await wsp.open();
return wsp
}


const _json_pickle = (obj) => {
	if(typeof obj == 'object' && Array.isArray(obj)) for(let i = 0;i < obj.length;i++) obj[i] = _json_pickle(obj[i]);
	else if (typeof obj == 'object'){
		for(let k in obj) {
			if (['__datetime_tz__','__datetime__','__time_tz__','__time__','__date__','__timedelta__','__decimal__','__tuple__'].indexOf(k) >= 0) {
				if (k == '__decimal__') obj[k] = Number(obj[k]);
				else obj = _json_pickle(obj[k]);
			}
			else obj[k] = _json_pickle(obj[k]);
			}
		return obj;
		} 
	return obj;
}


async function sendAsync(message,options={}){
    if (!( 'requestId' in options)) options.requestId = uuidv4()
    let res = await this.sendRequest('_msg' in message ? message:{_msg:message},options);
    //if ('_msg' in res) return _json_pickle(res._msg);
	if ('_msg' in res) return res._msg;
    return null;
}

WebSocketAsPromised.prototype.sendAsync = sendAsync

async function wsopen(){
app.config.globalProperties.$ws = await WSP('ws://localhost:8170');
//app.config.globalProperties.$wsp = await WSP('ws://localhost:9000/');
}
wsopen();

app.mount('#app')
