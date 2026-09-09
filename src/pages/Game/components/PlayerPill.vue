<template>
    <span
        class="player-pill"
        :class="{
            'is-dragging': isDragging,
            'is-conflict': isConflict,
            'is-static': !draggable,
        }"
        :data-player-id="player.id"
        :style="pillStyle"
        @pointerdown="onPointerDown"
    >
        {{ player.name }}
    </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Player } from '@/types/playerType'

const props = defineProps<{
    player: Player
    topPct: number
    leftPct: number
    isDragging: boolean
    isConflict: boolean
    draggable?: boolean
}>()

const emit = defineEmits<{
    dragstart: [id: number, clientX: number, clientY: number]
}>()

const pillStyle = computed(() => ({
    top: `${props.topPct * 100}%`,
    left: `${props.leftPct * 100}%`,
    zIndex: props.isDragging ? 1000 : 1,
}))

const onPointerDown = (e: PointerEvent) => {
    if (props.draggable === false) return
    emit('dragstart', props.player.id, e.clientX, e.clientY)
}
</script>

<style lang="less" scoped>
@import './PlayerPill.less';
</style>