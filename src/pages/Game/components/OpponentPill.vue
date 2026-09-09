<template>
    <span class="opponent-pill">{{ name }}</span>
</template>

<script lang="ts" setup>
defineProps<{ name: string }>()
</script>

<style lang="less" scoped>
@import './OpponentPill.less';
</style>