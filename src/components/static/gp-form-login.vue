<style>
</style>

<template>
    <el-dialog title="Login" v-model="isVisible">
        <el-form :model="form">
            <el-form-item label="URL" :label-width="formLabelWidth">
                <el-input v-model="form.url" class="input-with-select">
                    <template #prepend>
                        <el-select v-model="select" placeholder="Select">
                            <el-option label="ws://" value="ws://"></el-option>
                            <el-option label="wss://" value="wss://"></el-option>
                        </el-select>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="Slot" :label-width="formLabelWidth">
                <el-input v-model="form.slot" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="User" :label-width="formLabelWidth">
                <el-input v-model="form.user" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="Password" :label-width="formLabelWidth">
                <el-input v-model="form.password" autocomplete="off" show-password></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="$emit('update:login', 'cancel')">Cancel</el-button>
                <el-button type="primary" @click="do_login">Confirm</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>

import {
    defineComponent, reactive, ref, getCurrentInstance
}
    from 'vue'
export default defineComponent({
    name: 'gp-login-form',
    props: ['isLogged'],
    emits: ['update:login'],
    setup(props) {
        const {
            proxy
        } = getCurrentInstance();

        const isVisible = ref(false);
        const select = ref('ws://')
        const form = reactive({
            url: 'localhost:8170',
            slot: 'test002',
            user: 'admin',
            password: 'admin'
        });
        const formLabelWidth = ref('120px');
        const do_login = () => {
            proxy.$emit('update:login', {
                url: select.value + form.url,
                slot: form.slot,
                user: form.user,
                password: form.password
            })
        }
        if (!props.isLogged) isVisible.value = true;
        return {
            select,
            isVisible,
            form,
            formLabelWidth,
            do_login
        };
    }
});

</script>

<style>
.el-select .el-input {
    width: 110px;
}
.input-with-select .el-input-group__prepend {
    background-color: #fff;
}
</style>
