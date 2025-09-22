<style>



</style>

<template>

<el-tabs type="border-card">
    <el-tab-pane :label="label">
        <gp-list :metas="metas" :model="model" :tableData="tableData" />
    </el-tab-pane>
</el-tabs>

</template>

<script>

export default {
    name: 'gp-tabs',
    props: ['metas', 'model', 'tableData']
}

</script>
