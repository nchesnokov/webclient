<style>

.is-selected {
    color: #1989fa;
}

</style>

<template>

<el-container>
    <el-calendar :range="[new Date(2021, 3, 4), new Date(2021, 4, 24)]">
        <template #dateCell="{data}">
            <p :class="data.isSelected ? 'is-selected' : ''">
                {{ data.day.split('-').slice(1).join('-') }} {{ data.isSelected ? '✔️' : '' }}
            </p>
        </template>
    </el-calendar>
</el-container>

</template>

<script>

export default {
    name: 'gp-calendar',
    data() {
        return {}
    }
}

</script>
