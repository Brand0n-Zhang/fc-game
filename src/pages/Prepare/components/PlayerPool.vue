<template>
    <div class="pool-grid">
      <PlayerPoolCard
            v-for="p in pool"
            :key="p.id"
            :player="p"
            @pick="$emit('pick', p.id)"
        />
    </div>
</template>

<script lang="ts" setup>
import PlayerPoolCard from './PlayerPoolCard.vue'
import type { Player } from '@/types/playerType'

defineProps<{
    pool: Player[]
}>()

defineEmits<{
    pick: [id: number]
}>()
</script>

<style lang="less" scoped>
@import './PlayerPool.less';
</style>