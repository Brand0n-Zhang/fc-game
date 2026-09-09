<template>
    <div class="pool-card" @click="$emit('pick')">
        <div class="pool-card-name">{{ player.name }}</div>
        <div class="pool-card-pos">{{ positionLabel }}</div>
        <div class="pool-card-stats">
            <span title="短传">短{{ player.shortPass }}</span>
            <span title="长传">长{{ player.longPass }}</span>
            <span title="射门">射{{ player.shooting }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Player, Slot } from '@/types/playerType'

const props = defineProps<{
    player: Player
}>()

defineEmits<{
    pick: []
}>()

const POSITION_LABEL: Record<Slot, string> = {
    gk: '门将',
    lb: '左后卫',
    lcb: '左中卫',
    rcb: '右中卫',
    rb: '右后卫',
    lcm: '左中场',
    cm: '中场',
    rcm: '右中场',
    lw: '左边锋',
    st: '前锋',
    rw: '右边锋',
}

const positionLabel = computed(() => POSITION_LABEL[props.player.position])
</script>