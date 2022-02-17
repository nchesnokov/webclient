<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 0px;
}

.el-header
{
  background-color: #b3c0d1;
  color: var(--el-text-color-primary);
  text-align: center;
  line-height: 30px;
}

.el-footer {
    background-color: #B3C0D1;
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

<el-drawer v-if="isLogged" append-to-body v-model="drawer" direction='ltr' size="20%" title="Root Menu">
    <el-tree :data="menuData" :props="defaultProps" @node-click="handleNodeClick"/>
</el-drawer>
<el-container>
    <el-header style="text-align: right; font-size: 12px">
        <el-button v-if="isLogged" type="primary" :icon="Menu" @click="drawer=!drawer"></el-button>
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
        <gp-user-preferences v-if="isUserPreferencesFormShow" :cid="cid" @update:user-prefereces="do_user_preferences" />
        <template v-if="tabs.length > 0">
            <el-button v-for="tab in tabs" :key="tab" :class="['tab-button', { active: currentTab === tab }]" @click="on_clicktab(tab)">{{ tab.split('-')[1] }}</el-button>
            <component :is="currentTab" :cid="cid" :metas="metas" :model="model" />
        </template>
    </el-main>
    <div id="sv"></div>
    <el-footer>{{isLogged ? '&copy; GSRP5 2022 Slot: ' + cinfo.slot + ' User: '+cinfo.user + ' ' + timestampLogged: '&copy; GSRP5 2022'}}</el-footer>
</el-container>
</template>

<script>

import { defineComponent } from 'vue'

import { loadModule } from 'vue3-sfc-loader'

export default defineComponent({
    name: 'App',
});

</script>

<script setup>

import { User, Menu } from '@element-plus/icons-vue'

import {reactive, ref, getCurrentInstance } from 'vue'

        const {
            proxy
        } = getCurrentInstance();
        const cid = ref(null);
        const uid = reactive([]);
        const cinfo = reactive({});
        const drawer = ref(true);
        const isLogged = ref(false);
        const timestampLogged = ref('');
        const isLoginFormShow = ref(false);
        const isUserPreferencesFormShow = ref(false);
        const tabs = reactive([]);
        const currentTab = ref('gp-search');
        const menuData = reactive([]);
        const metas = reactive({});
        const model = ref(null);
        const defaultProps = reactive({
            children: 'childs_id'
        });

        const handleNodeClick = (data) => {
            console.log('handleNodeClick:',data)
            if (data.action_id.name !== null) {
                tabs.splice(0, tabs.length);
                proxy.$websocket.send({
                    _msg: [cid.value, 'uis', 'action', {
                        'action_id': data.action_id.name,
                        'context': proxy.$UserPreferences.Context
                    }]
                }, on_load_meta);
            }
        };

        const handleUserMenuCommand = (command) => {
            switch (command) {
                case 'preferences':
                    isUserPreferencesFormShow.value = true;
                    break;
                case 'logout':
                    proxy.$websocket.send({
                        _msg: [cid.value, 'logout', {}]
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

        const do_login = (event) => {
            if (event === 'cancel') isLoginFormShow.value = false;
            else {
                Object.assign(cinfo, event);
                proxy.$websocket.webSocket = null;
                proxy.$websocket.setURL(cinfo.url)
                proxy.$websocket.open();
                proxy.$websocket.addEventListener('onclose', on_close_websocket);
                proxy.$websocket.addStaticCallback('_exception', on_except);
                setTimeout(() => {
                    proxy.$websocket.send({
                        _msg: ['00000000000000000000000000000000', '_open', 'gsrp5.user', {
                            'profile': cinfo.slot
                        }]
                    }, on_connect);
                }, 500);
            }
        };

        const getFrameworkID = (framework) => {
            for (let i = 0, frameworks = proxy.$UserPreferences.franeworks; i < frameworks.length; i++)
                if (frameworks[i].code == framework) return frameworks[i].id;
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

        const do_user_preferences = (event) => {
            //console.log('do_user_preference:', event);
            proxy.$UserPreferences.lang = event.language;
            proxy.$UserPreferences.country = event.country;
            proxy.$UserPreferences.timezone = event.timezone;
            let records = {
                'user_id': 'user_id' in proxy.$UserPreferences ? proxy.$UserPreferences.user_id : uid[1],
                'framework':getFrameworkID(event.frameworr),
                'lang':getLanguageID(event.language),
                'country': proxy.$UserPreferences.country_names[event.country],
                'timezone': event.timezone,
            };
            //if ('lang_id' in proxy.$UserPreferences) records.lang = proxy.$UserPreferences.lang_id;
            //else records.lang = getLanguageID(event.language);
            if ('preferences_id' in proxy.$UserPreferences) records.id = proxy.$UserPreferences.preferences_id;


            proxy.$websocket.send({
                _msg: [cid.value, 'models', 'bc.user.preferences', 'modify', {
                    'records': records,
                    'context': proxy.$UserPreferences.Context
                }]
            }, console.log);
            proxy.$websocket.send({
                _msg: [cid.value, '_commit', {}]
            }, console.log);

            isUserPreferencesFormShow.value = false;

        };
        const on_except = (event) => {
            console.error('except:', event);
            //proxy.$websocket.addEStaticventListener('_exception','except',on_except);
        };

        const on_close_websocket = (event) => {
            console.log('event:', event);
            isLogged.value = false;
            menuData.splice(0, menuData.length);
            tabs.splice(0, tabs.length);
            document.querySelector('#sv').childNodes.forEach((e) => {
                e.remove();
            });
            proxy.$websocket.close();
            proxy.$message('Relogin');
            setTimeout(() => {
                proxy.$websocket.webSocket = null;
            }, 1500);
            proxy.$websocket.setURL(cinfo.url)
            proxy.$websocket.open();
            proxy.$websocket.addStaticCallback('_exception', on_except);
            setTimeout(() => {
                proxy.$websocket.send({
                    _msg: ['00000000000000000000000000000000', '_open', 'gsrp5.user', {
                        'profile': cinfo.slot
                    }]
                }, on_connect);
            }, 1500);
        };

        const on_connect = (msg) => {
            cid.value = msg[0];
            proxy.$websocket.send({
                _msg: [cid.value, 'login', {
                    'user': cinfo.user,
                    'password': cinfo.password
                }],
                _type: 'main'
            }, on_service_login);
        };

        const on_service_login = (msg) => {
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
                    proxy.$UserPreferences.lang_id = msg[2].preferences[0].lang.id;
                    proxy.$UserPreferences.lang = msg[2].preferences[0].lang.name;
                    proxy.$UserPreferences.country = getCountryID(msg[2].preferences[0].country);
                    proxy.$UserPreferences.timezone = msg[2].preferences[0].timezone;
                } else {
                    proxy.$UserPreferences.user_id = uid[1]
                    proxy.$UserPreferences.framework = 'element-plus'
                    proxy.$UserPreferences.frameworks = msg[2].frameworks
                    proxy.$UserPreferences.lang = 'EN'
                    proxy.$UserPreferences.country = 'EN'
                    proxy.$UserPreferences.timezone = 'UTC'
                }
                proxy.$UserPreferences.Context = {
                    'user':  proxy.$UserPreferences.user_id,
                    'framework': proxy.$UserPreferences.framework,
                    'lang': proxy.$UserPreferences.lang,
                    'tz': proxy.$UserPreferences.timezone
                }
                isLoginFormShow.value = false;
                timestampLogged.value = Date(); //.toLocaleDateString();
                proxy.$websocket.send({
                    _msg: [cid.value, 'uis', 'menu', {
                        'context': proxy.$UserPreferences.Context
                    }]
                }, on_menu_load);
            } else proxy.$message('Invalid login. Please check Slot User or Password');
        };

        const on_menu_load = (msg) => {
            menuData.splice(0, menuData.length, ...msg);
            isLogged.value = true;
        };

        const on_load_meta = (msg) => {
            //console.log('meta:',msg);
            Object.assign(metas, msg[0].model.models);
            model.value = msg[0].model.root;
            tabs.splice(0, tabs.length);
            for (let i = 0; i < metas[model.value].allow.length; i++)
                if (['search', 'form', 'tree', 'graph', 'calendar', 'geo', 'kanban'].indexOf(metas[model.value].allow[i]) >= 0) tabs.push('gp-' + metas[model.value].allow[i]);
        };

</script>
