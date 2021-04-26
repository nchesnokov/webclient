<style>



</style>

<template>

<el-dialog title="User Preferences" v-model="isVisible">
    <el-form :model="form">
        <el-form-item label="Framework" :label-width="formLabelWidth">
            <el-select v-model="form.framework" autocomplete="on">
                <el-option v-for="item in $UserPreferences.frameworks" :key="item.code" :label="item.descr" :value="item.code">
                </el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="Language" :label-width="formLabelWidth">
            <el-select v-model="form.language" autocomplete="on">
                <el-option v-for="item in $UserPreferences.langs" :key="item.code" :label="item.description" :value="item.code">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="Country" :label-width="formLabelWidth">
            <el-select v-model="form.country">
                <el-option v-for="k,v in $UserPreferences.country_names" :key="v" :label="k" :value="v">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item v-if="form.country.length > 0" label="Timezone" :label-width="formLabelWidth">
            <el-select v-model="form.timezone">
                <el-option v-for="k in $UserPreferences.country_timezones[form.country]" :key="k" :label="k" :value="k">
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <template #footer>
        <span class="dialog-footer">
      <el-button @click="isVisible = false">Cancel</el-button>
      <el-button type="primary" @click="do_save">Save</el-button>
    </span>
    </template>
</el-dialog>

</template>

<script>

import {
    defineComponent, reactive, ref, onMounted, getCurrentInstance
}
from 'vue'
export default defineComponent({
    name: 'gp-user-preferences',
    props: ['cid'],
    emits: ['update:user-prefereces'],
    setup() {
        const {
            proxy
        } = getCurrentInstance();

        const isVisible = ref(true);

        const form = reactive({
            framework: '',
            language: '',
            country: '',
            timezone: ''

        });
        const formLabelWidth = ref('120px');

        const do_save = () => {
            proxy.$emit('update:user-prefereces', {
                framework: form.framework,
                language: form.language,
                country: form.country,
                timezone: form.timezone
            })
            isVisible.value = false;
        }
        onMounted(() => {
            console.log('lang:',proxy.$UserPreferences.lang);
            form.framework = proxy.$UserPreferences.framework;
            form.language = proxy.$UserPreferences.lang;
            form.country = proxy.$UserPreferences.country;
            form.timezone = proxy.$UserPreferences.timezone;
        });

        return {
            isVisible,
            form,
            formLabelWidth,
            do_save
        };
    }
});

</script>
