import { createApp,defineAsyncComponent,defineComponent,defineCustomElement,reactive } from 'vue'
import router from "./router/index"
import 'element-plus/dist/index.css'

import App from './el.vue'

import  {msgpack } from './js/msgpack.js'

import VueApexCharts from "vue3-apexcharts";

import {v4 as uuidv4} from 'uuid'

import WebSocketAsPromised from 'websocket-as-promised';


const app = createApp(App)

app.use(router)

app.config.compilerOptions.isCustomElement = (tag) => tag.includes('-')



app.config.globalProperties.$appcontext = app._context;
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
