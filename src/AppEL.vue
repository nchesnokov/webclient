<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}

.el-header {
  background-color: #b3c0d1;
  color: var(--el-text-color-primary);
  text-align: center;
  line-height: 10px;
  height: 25px;
}

.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 10px;
  position: fixed;
  height: 25px;
  /* Фиксированное положение */
  left: 0;
  bottom: 0;
  /* Левый нижний угол */
  padding: 10px;
  /* Поля вокруг текста */
  width: 100%;
  /* Ширина слоя */
}

button.active {
  background-color: Aquamarine;
}
</style>

<template>
  <iframe v-if="iframe != null" :src="iframe" name="debug"  scrolling="auto"></iframe>
  <el-drawer
    v-if="isLogged"
    append-to-body
    v-model="drawer"
    direction="ltr"
    size="20%"
    title="Root Menu"
  >
    <el-tree
      :data="menuData"
      :props="defaultProps"
      @node-click="handleNodeClick"
    />
  </el-drawer>
  <el-container>
    <el-header style="text-align: right; font-size: 12px">
      <el-button
        v-if="isLogged"
        type="primary"
        :icon="Menu"
        @click="drawer = !drawer"
      ></el-button>
      <el-button
        v-if="!isLogged"
        type="primary"
        :icon="User"
        @click="on_login"
      ></el-button>
      <el-dropdown
        v-else
        split-button
        type="primary"
        @command="handleUserMenuCommand"
      >
        Admin
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="preferences"
              >Preferences</el-dropdown-item
            >
            <el-dropdown-item command="logout">Logout</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>
    <el-main>
      <gp-form-login
        :isLogged="isLogged"
        v-if="isLoginFormShow"
        @update:login="do_login"
      />
      <gp-user-preferences
        v-if="isUserPreferencesFormShow"
        :cid="cid"
        @update:user-prefereces="do_user_preferences"
      />
      <template v-if="tabs.length > 0">
        <el-button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab-button', { active: currentTab === tab }]"
          @click="on_clicktab(tab)"
          >{{ tab.split("-")[1] }}</el-button
        >
        <component :is="currentTab" :cid="cid" :metas="metas" :model="model" />
      </template>
    </el-main>
    <div id="sv" style="height: 500px"></div>
    <el-footer>
      {{
        isLogged
          ? "&copy; GSRP5 " +
            new Date().getFullYear() +
            " Slot: " +
            cinfo.slot +
            " User: " +
            cinfo.user +
            " " +
            timestampLogged
          : "&copy; GSRP5 2022"
      }}
    </el-footer>
  </el-container>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>

<script setup>

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import  { msgpack } from './js/msgpack.js'

import VueApexCharts from "vue3-apexcharts";

import {v4 as uuidv4} from 'uuid'

import WebSocketAsPromised from 'websocket-as-promised';

import JsonViewer from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css";
import { User, Menu } from "@element-plus/icons-vue";

import { defineAsyncComponent, reactive, ref, getCurrentInstance } from "vue";

import { useI18n } from "vue-i18n";

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import ganttastic from '@infectoone/vue-ganttastic'

// import {v4 as uuidv4} from 'uuid'

// import WebSocketAsPromised from 'websocket-as-promised';

const { proxy, root } = getCurrentInstance();

// var app = root.appContext.app

//
root.appContext.app.use(ElementPlus, { size: 'small', zIndex: 3000 })

root.appContext.app.use(VueApexCharts);

root.appContext.app.use(JsonViewer)


root.appContext.app.use(ganttastic)
root.appContext.app.component('gp-customizable',defineAsyncComponent(() => import('./components/static/gp-customizable.vue')));
root.appContext.app.component('gp-selectable',defineAsyncComponent(() => import('./components/static/gp-selectable.vue')));
root.appContext.app.component('gp-form-login',defineAsyncComponent(() => import('./components/static/gp-form-login.vue')));
root.appContext.app.component('gp-user-preferences',defineAsyncComponent(() => import('./components/static/gp-user-preferences.vue')));
root.appContext.app.component('gp-form',defineAsyncComponent(() => import('./components/static/gp-form.vue')));
//customElements.define('gp-form',defineCustomElement(() => import('./components/static/gp-form.vue')));
root.appContext.app.component('gp-search',defineAsyncComponent(() => import('./components/static/gp-search.vue')));
//app.component('gp-find',defineAsyncComponent(() => import('./components/gp-find.vue')));
root.appContext.app.component('gp-list',defineAsyncComponent(() => import('./components/static/gp-list.vue')));
root.appContext.app.component('gp-m2m-list',defineAsyncComponent(() => import('./components/static/gp-m2mlist.vue')));
root.appContext.app.component('gp-o2m-components',defineAsyncComponent(() => import('./components/static/gp-o2m-components.vue')));
root.appContext.app.component('gp-o2m-list',defineAsyncComponent(() => import('./components/static/gp-o2m-list.vue')));
root.appContext.app.component('gp-o2m-form',defineAsyncComponent(() => import('./components/static/gp-o2m-form.vue')));

root.appContext.app.component('gp-table',defineAsyncComponent(() => import('./components/static/gp-table.vue')));
root.appContext.app.component('gp-tree',defineAsyncComponent(() => import('./components/static/gp-tree.vue')));
root.appContext.app.component('gp-graph',defineAsyncComponent(() => import('./components/static/gp-graph.vue')));
root.appContext.app.component('gp-calendar',defineAsyncComponent(() => import('./components/static/gp-calendar.vue')));
root.appContext.app.component('gp-geo',defineAsyncComponent(() => import('./components/static/gp-geo.vue')));
root.appContext.app.component('kanban-board',defineAsyncComponent(() => import('./components/static/Kanban.vue')));
root.appContext.app.component('gp-kanban',defineAsyncComponent({loader:() => import('./components/static/gp-kanban.vue')}));
root.appContext.app.component('gp-mdx',defineAsyncComponent({loader:() => import('./components/static/gp-mdx.vue')}));
root.appContext.app.component('gp-gantt',defineAsyncComponent({loader:() => import('./components/static/gp-gantt.vue')}));
root.appContext.app.component('gp-schedule',defineAsyncComponent({loader:() => import('./components/static/gp-schedule.vue')}));
root.appContext.app.component('QuillEditor', QuillEditor)

//
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
	if ('_msg' in res && '__exception__' in res._msg) iframe.value = "http://localhost:5555";
  else {
    if ('_msg' in res) return res._msg;
    return null;
  }
}

WebSocketAsPromised.prototype.sendAsync = sendAsync

async function wsopen(){
  root.appContext.app.config.globalProperties.$ws = await WSP('ws://localhost:8170');
//app.config.globalProperties.$wsp = await WSP('ws://localhost:9000/');
}
wsopen();


const iframe = ref(null);

const cid = ref(null);
const uid = reactive([]);
const cinfo = reactive({});
const drawer = ref(true);
const isLogged = ref(false);
const timestampLogged = ref("");
const isLoginFormShow = ref(false);
const isUserPreferencesFormShow = ref(false);
const tabs = reactive([]);
const currentTab = ref("");
const menuData = reactive([]);
const metas = reactive({});
const model = ref(null);
const defaultProps = reactive({
  children: "childs_id",
});

// const { locale, t } = useI18n({
//     inheritLocale: true
// })
//console.log('locale:', locale)

const handleNodeClick = async (data) => {
  //console.log("handleNodeClick:", data);
  if (data.action_id.name !== null) {
    tabs.splice(0, tabs.length);
    //currentTab.value = "gp-search" + model.value.replaceAll(".", "-");
    on_load_meta(
      await proxy.$ws.sendAsync([
        cid.value,
        "uis",
        "action",
        {
          type_obj:data.type_obj.name,
          action_id: data.action_id.name,
          context: proxy.$UserPreferences.Context,
        },
      ])
    );
  }
};

const handleUserMenuCommand = async (command) => {
  switch (command) {
    case "preferences":
      isUserPreferencesFormShow.value = true;
      break;
    case "logout":
      await proxy.$ws.sendAsync([cid.value, "logout", {}]);
      isLogged.value = false;
      tabs.splice(0, tabs.length);
      menuData.splice(0, menuData.length);
  }
};

const on_clicktab = (tab) => {
  currentTab.value = tab;
};

const on_login = () => {
  if (!isLogged.value) isLoginFormShow.value = true;
};

const do_login = async (event) => {
  if (event === "cancel") isLoginFormShow.value = false;
  else {
    Object.assign(cinfo, event);
    let r = await proxy.$ws.sendAsync([
      "00000000000000000000000000000000",
      "_open",
      "gsrp5.user",
      {
        profile: cinfo.slot,
      },
    ]);
    proxy.$ws.onClose.addListener((event) => on_close_websocket(event));
    on_connect(r);
  }
};

const getFrameworkID = (framework) => {
  for (
    let i = 0, frameworks = proxy.$UserPreferences.frameworks;
    i < frameworks.length;
    i++
  )
    if (frameworks[i].code == framework) return frameworks[i].id;
  return null;
};

const getFrameworkName = (frameworkid) => {
  for (
    let i = 0, frameworks = proxy.$UserPreferences.frameworks;
    i < frameworks.length;
    i++
  )
    if (frameworks[i].id == frameworkid) return frameworks[i].code;
  return null;
};

const getLanguageID = (lang) => {
  for (let i = 0, langs = proxy.$UserPreferences.langs; i < langs.length; i++)
    if (langs[i].code == lang) return langs[i].id;
  return null;
};

const getCountryID = (country) => {
  for (let k in proxy.$UserPreferences.country_names)
    if (proxy.$UserPreferences.country_names[k] == country) return k;
  return null;
};

const do_user_preferences = async (event) => {
  //console.log('do_user_preference:', event);
  proxy.$UserPreferences.lang = event.language;
  proxy.$UserPreferences.country = event.country;
  proxy.$UserPreferences.timezone = event.timezone;
  let records = {
    user_id:
      "user_id" in proxy.$UserPreferences
        ? proxy.$UserPreferences.user_id
        : uid[1],
    framework: getFrameworkID(event.framework),
    lang: getLanguageID(event.language),
    country: proxy.$UserPreferences.country_names[event.country],
    timezone: event.timezone,
  };
  //if ('lang_id' in proxy.$UserPreferences) records.lang = proxy.$UserPreferences.lang_id;
  //else records.lang = getLanguageID(event.language);
  if ("preferences_id" in proxy.$UserPreferences)
    records.id = proxy.$UserPreferences.preferences_id;

  await proxy.$ws.sendAsync([
    cid.value,
    "models",
    "bc.user.preferences",
    "modify",
    {
      records: records,
      context: proxy.$UserPreferences.Context,
    },
  ]);
  await proxy.$ws.sendAsync([cid.value, "_commit", {}]);

  isUserPreferencesFormShow.value = false;
};
const on_except = (event) => {};

const on_close_websocket = async (event) => {
  console.log("event:", event);
  isLogged.value = false;
  menuData.splice(0, menuData.length);
  tabs.splice(0, tabs.length);
  document.querySelector("#sv").childNodes.forEach((e) => {
    e.remove();
  });
  await proxy.$ws.close();
  await proxy.$ws.open();
  proxy.$ws.onClose.addListener((event) => on_close_websocket(event));

  await proxy.$message("Relogin");
  on_connect(
    await proxy.$ws.sendAsync([
      "00000000000000000000000000000000",
      "_open",
      "gsrp5.user",
      {
        profile: cinfo.slot,
      },
    ])
  );
};

const on_connect = async (msg) => {
  cid.value = msg[0];
  on_service_login(
    await proxy.$ws.sendAsync([
      cid.value,
      "login",
      {
        user: cinfo.user,
        password: cinfo.password,
      },
    ])
  );
};

const on_service_login = async (msg) => {
  //console.log('on_service_login:  ', msg);
  uid.splice(0, uid.length, ...msg);
  if (uid[0]) {
    proxy.$UserPreferences.langs = msg[2].langs;
    proxy.$UserPreferences.country_names = msg[2].country_names;
    proxy.$UserPreferences.country_timezones = msg[2].country_timezones;
    if (msg[2].preferences.length > 0) {
      proxy.$UserPreferences.preferences_id = msg[2].preferences[0].id;
      proxy.$UserPreferences.user_id = msg[2].preferences[0].user_id.id;
      proxy.$UserPreferences.framework_id = msg[2].preferences[0].framework.id;
      proxy.$UserPreferences.frameworks = msg[2].frameworks;
      proxy.$UserPreferences.framework = getFrameworkName(
        proxy.$UserPreferences.framework_id
      );
      proxy.$UserPreferences.lang_id = msg[2].preferences[0].lang.id;
      proxy.$UserPreferences.lang = msg[2].preferences[0].lang.name;
      proxy.$UserPreferences.country = getCountryID(
        msg[2].preferences[0].country
      );
      proxy.$UserPreferences.timezone = msg[2].preferences[0].timezone;
    } else {
      proxy.$UserPreferences.user_id = uid[1];
      proxy.$UserPreferences.framework = "element-plus";
      proxy.$UserPreferences.frameworks = msg[2].frameworks;
      proxy.$UserPreferences.lang = "en";
      proxy.$UserPreferences.country = "en";
      proxy.$UserPreferences.timezone = "UTC";
    }
    proxy.$UserPreferences.Context = {
      user: proxy.$UserPreferences.user_id,
      framework: proxy.$UserPreferences.framework,
      lang: proxy.$UserPreferences.lang,
      tz: proxy.$UserPreferences.timezone,
    };
    //locale.value = proxy.$UserPreferences.Context.lang;
    isLoginFormShow.value = false;
    timestampLogged.value = Date(); //.toLocaleDateString();
    on_menu_load(
      await proxy.$ws.sendAsync([
        cid.value,
        "uis",
        "menu",
        {
          context: proxy.$UserPreferences.Context,
        },
      ])
    );
  } else proxy.$message("Invalid login. Please check Slot User or Password");
};

const on_menu_load = (msg) => {
  menuData.splice(0, menuData.length, ...msg);
  //registerViews(proxy.$UserPreferences.Context.framework);
  isLogged.value = true;
};

const options = {};

const MyloadModule = async (name, names) => {
  let stat = await proxy.$wsp.sendRequest({
    action: "STAT",
    name: name + ".vue",
  });

  //console.log('stat:', stat)
  if (typeof stat === "object" && "stats" in stat) {
    if (name in names) {
      //console.log('stat:', stat['stats'])
      const view = await proxy.$ws.sendAsync([
        cid.value,
        "models",
        "bc.ui.model.views",
        "getSFC",
        {
          model: names[name]["model"],
          vtype: names[name]["vtype"],
          context: proxy.$UserPreferences.Context,
        },
      ]);

      let put = await proxy.$wsp.sendRequest({
        action: "PUT",
        name: name + ".vue",
        data: view[0].sfc,
      });
      //console.log('put:', put)
    }
    //await wsp.close()
    return Promise.resolve(import("./components/" + name + ".vue"));
  }
};

const registerViews = async (framework) => {
  let views = await proxy.$ws.sendAsync([
    cid.value,
    "models",
    "bc.ui.model.views",
    "select",
    {
      fields: ["model", "vtype"],
      cond: [
        {
          __tuple__: [
            "vtype",
            "in",
            [
              "element-plus/form",
              "element-plus/search",
              "element-plus/o2mform",
            ],
          ],
        },
      ],
      context: proxy.$UserPreferences.Context,
    },
  ]);
  //console.log('views:', views)
  for (let i = 0, n; i < views.length; i++) {
    n =
      views[i]["vtype"]["name"].split("/")[1] +
      "-" +
      views[i]["model"]["name"].replaceAll(".", "-");
    options["gp-" + n] = {
      model: views[i]["model"]["name"],
      vtype: views[i]["vtype"]["name"],
    };
  }
  for (let i = 0, n; i < views.length; i++) {
    n =
      views[i]["vtype"]["name"].split("/")[1] +
      "-" +
      views[i]["model"]["name"].replaceAll(".", "-");

    if (
      !(
        "components" in proxy.$appcontext.app &&
        "gp-" + n in proxy.$appcontext.app.components
      )
    )
      proxy.$appcontext.app.component(
        "gp-" + n,
        defineAsyncComponent(() => MyloadModule("gp-" + n, options))
      );
  }
};

const on_load_meta = (msg) => {
  //console.log('meta:',msg);
  Object.assign(metas, msg[0].model.models);
  model.value = msg[0].model.root;
  tabs.splice(0, tabs.length);
  currentTab.value = "gp-search";
  // + model.value.replaceAll(".", "-");
  for (let i = 0; i < metas[model.value].allow.length; i++)
    // ,'mdx','gantt','schedule'
    if (
      [
        "search",
        "form",
        "tree",
        "graph",
        "calendar",
        "geo",
        "kanban",
        "mdx",
        "gantt",
        "schedule",
      ].indexOf(metas[model.value].allow[i]) >= 0
    )
      //if (['form', 'search'].indexOf(metas[model.value].allow[i]) >= 0) tabs.push("gp-" + metas[model.value].allow[i] + '-' + model.value.replaceAll(".", "-"))
      //else
      tabs.push("gp-" + metas[model.value].allow[i]);
};
//proxy.$ws.onClose.addListener(event => on_close_websocket(event));
//proxy.$ws.onError.addListener(event => console.error(event));
</script>
