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
    line-height: 30px;
}

.el-footer {
    background-color: #b3c0d1;
    color: #333;
    text-align: center;
    line-height: 30px;
    position: fixed;
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
    background-color: Aqua;
}
</style>

<template>
    <el-drawer v-if="isLogged" append-to-body v-model="drawer" direction="ltr" size="20%" title="Root Menu">
        <el-tree :data="menuData" :props="defaultProps" @node-click="handleNodeClick" />
    </el-drawer>
    <el-container>
        <el-header style="text-align: right; font-size: 12px">
            <el-button v-if="isLogged" type="primary" :icon="Menu" @click="drawer = !drawer"></el-button>
            <el-button v-if="!isLogged" type="primary" :icon="User" @click="on_login"></el-button>
            <el-dropdown v-else split-button type="primary" @command="handleUserMenuCommand">
                Admin
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="preferences">Preferences</el-dropdown-item>
                        <el-dropdown-item command="logout">Logout</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </el-header>
        <el-main>
            <gp-form-login :isLogged="isLogged" v-if="isLoginFormShow" @update:login="do_login" />
            <gp-user-preferences v-if="isUserPreferencesFormShow" :cid="cid"
                @update:user-prefereces="do_user_preferences" />
            <template v-if="tabs.length > 0">
                <el-button v-for="tab in tabs" :key="tab" :class="['tab-button', { active: currentTab === tab }]"
                    @click="on_clicktab(tab)">{{ tab.split("-")[1] }}</el-button>
                <component :is="currentTab" :cid="cid" :metas="metas" :model="model" />
            </template>
        </el-main>
        <div id="sv" style="height: 500px"></div>
        <el-footer>
            {{
                    isLogged
                        ? "&copy; GSRP5 2022 Slot: " +
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

import { User, Menu } from "@element-plus/icons-vue";

import { defineAsyncComponent, reactive, ref, getCurrentInstance } from "vue";

import { useI18n } from 'vue-i18n'

const { proxy } = getCurrentInstance();
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

const { locale, t } = useI18n({
    inheritLocale: true
})
console.log('locale:', locale)

const handleNodeClick = async (data) => {
    //console.log("handleNodeClick:", data);
    if (data.action_id.name !== null) {
        tabs.splice(0, tabs.length);
        //currentTab.value = "gp-search" + model.value.replaceAll(".", "-");
        on_load_meta(await proxy.$ws.sendAsync(
            {
                _msg: [
                    cid.value,
                    "uis",
                    "action",
                    {
                        action_id: data.action_id.name,
                        context: proxy.$UserPreferences.Context,
                    },
                ],
            },

        )
        )
    }
};

const handleUserMenuCommand = async (command) => {
    switch (command) {
        case "preferences":
            isUserPreferencesFormShow.value = true;
            break;
        case "logout":
            await proxy.$ws.sendAsync({
                _msg: [cid.value, "logout", {}],
            });
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
        let r = await proxy.$ws.sendAsync(
            {
                _msg: [
                    "00000000000000000000000000000000",
                    "_open",
                    "gsrp5.user",
                    {
                        profile: cinfo.slot,
                    },
                ],
            }
        )
        //console.log('r:',r)
        on_connect(r)


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

    await proxy.$ws.sendAsync(
        {
            _msg: [
                cid.value,
                "models",
                "bc.user.preferences",
                "modify",
                {
                    records: records,
                    context: proxy.$UserPreferences.Context,
                },
            ],
        },

    );
    await proxy.$ws.sendAsync(
        {
            _msg: [cid.value, "_commit", {}],
        },
    );

    isUserPreferencesFormShow.value = false;
};
const on_except = (event) => {
};

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

    await proxy.$message("Relogin");
    on_connect(await proxy.$ws.sendAsync(
        {
            _msg: [
                "00000000000000000000000000000000",
                "_open",
                "gsrp5.user",
                {
                    profile: cinfo.slot,
                },
            ],
        },

    )
    )
};

const on_connect = async (msg) => {
    cid.value = msg[0];
    on_service_login(await proxy.$ws.sendAsync(
        {
            _msg: [
                cid.value,
                "login",
                {
                    user: cinfo.user,
                    password: cinfo.password,
                },
            ],
        },

    )
    )
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
            proxy.$UserPreferences.framework = getFrameworkName(proxy.$UserPreferences.framework_id);
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
        locale.value = proxy.$UserPreferences.Context.lang;
        isLoginFormShow.value = false;
        timestampLogged.value = Date(); //.toLocaleDateString();
        on_menu_load(await proxy.$ws.sendAsync(
            {
                _msg: [
                    cid.value,
                    "uis",
                    "menu",
                    {
                        context: proxy.$UserPreferences.Context,
                    },
                ],
            },
        )
        );
    } else proxy.$message("Invalid login. Please check Slot User or Password");
};

const on_menu_load = (msg) => {
    menuData.splice(0, menuData.length, ...msg);
    registerViews(proxy.$UserPreferences.Context.framework);
    isLogged.value = true;
};

const options = {}

const MyloadModule = async (name, names) => {
    //console.log('MyLoadModule:', name)
    // const wsp = new WebSocketAsPromised('ws://localhost:9000', {
    //     packMessage: data => JSON.stringify(data),
    //     unpackMessage: data => JSON.parse(data),
    //     attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data), // attach requestId to message as `id` field
    //     extractRequestId: data => data && data.id,
    // });
    // await wsp.open();

    let stat = await proxy.$wsp.sendRequest({ action: 'STAT', name: name + '.vue' })

    //console.log('stat:', stat)
    if (typeof stat === 'object' && 'stats' in stat) {
        if (name in names) {
            //console.log('stat:', stat['stats'])
            const view = await proxy.$ws.sendAsync({
                _msg: [
                    cid.value,
                    "models",
                    "bc.ui.model.views",
                    "getSFC",
                    {
                        model: names[name]['model'],
                        vtype: names[name]['vtype'],
                        context: proxy.$UserPreferences.Context,
                    },
                ],
            });


            let put = await proxy.$wsp.sendRequest({ action: 'PUT', name: name + '.vue', data: view[0].sfc })
            //console.log('put:', put)
        }
        //await wsp.close()
        return Promise.resolve(import('./components/' + name + '.vue'))
    }


}

const registerViews = async (framework) => {

    let views = await proxy.$ws.sendAsync({
        _msg: [
            cid.value,
            "models",
            "bc.ui.model.views",
            "select",
            {
                fields: ['model', 'vtype'],
                cond: [{ __tuple__: ['vtype', 'in', ['element-plus/form', 'element-plus/search','element-plus/o2mform']] }],
                context: proxy.$UserPreferences.Context,
            },
        ],
    });
    //console.log('views:', views)
    for (let i = 0, n; i < views.length; i++) {
        n = views[i]["vtype"]["name"].split('/')[1] + '-' + views[i]["model"]["name"].replaceAll('.', '-')
        options['gp-' + n] = { 'model': views[i]["model"]["name"], 'vtype': views[i]["vtype"]["name"] }

    }
    for (let i = 0, n; i < views.length; i++) {
        n = views[i]["vtype"]["name"].split('/')[1] + '-' + views[i]["model"]["name"].replaceAll('.', '-')

        if (!('components' in proxy.$appcontext.app && 'gp-' + n in proxy.$appcontext.app.components)) proxy.$appcontext.app.component('gp-' + n,
            defineAsyncComponent(() => MyloadModule('gp-' + n, options)))
    }


};

const on_load_meta = (msg) => {
    //console.log('meta:',msg);
    Object.assign(metas, msg[0].model.models);
    model.value = msg[0].model.root;
    tabs.splice(0, tabs.length);
    currentTab.value = "gp-search-" + model.value.replaceAll(".", "-");
    for (let i = 0; i < metas[model.value].allow.length; i++)
        if (
            ["search", "form", "tree", "graph", "calendar", "geo", "kanban"].indexOf(
                metas[model.value].allow[i]
            ) >= 0
        )
            if (['form', 'search'].indexOf(metas[model.value].allow[i]) >= 0) tabs.push("gp-" + metas[model.value].allow[i] + '-' + model.value.replaceAll(".", "-"))
            else
                tabs.push("gp-" + metas[model.value].allow[i]);
};
proxy.$ws.onClose.addListener(event => on_close_websocket(event));
//proxy.$ws.onError.addListener(event => console.error(event));

</script>
