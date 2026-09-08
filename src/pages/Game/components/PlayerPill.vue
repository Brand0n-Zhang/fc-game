<template>
    <span
        class="player-pill"
        :class="{
            'is-dragging': isDragging,
            'is-hover': isHover
        }"
        :data-player-id="player.id"
        :style="dragStyle"
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
    isDragging: boolean
    isHover: boolean
    dragX: number
    dragY: number
}>()

const emit = defineEmits<{
    dragstart: [id: number, clientX: number, clientY: number]
}>()

const dragStyle = computed(() => {
    if (!props.isDragging) return {}
    return {
        transform: `translate(${props.dragX}px, ${props.dragY}px) scale(0.95)`,
        zIndex: 1000,
    }
})

const onPointerDown = (e: PointerEvent) => {
    emit('dragstart', props.player.id, e.clientX, e.clientY)
}
</script>

<style lang="less" scoped>
@import './PlayerPill.less';
</style>
