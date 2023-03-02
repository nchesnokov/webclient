<template>
    <span>Hello Vue 3 + Vite</span>
  </template>
<script setup>
import { defineAsyncComponent, reactive, ref, getCurrentInstance } from "vue";
import PrimeVue from 'primevue/config';

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';

const { proxy, root } = getCurrentInstance();

root.appContext.app.use(PrimeVue)
</script>