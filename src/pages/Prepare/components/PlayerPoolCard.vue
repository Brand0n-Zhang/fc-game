<template>
    <div class="pool-card" @click="$emit('pick')">
        <span class="pool-card-name">{{ player.name }}</span>
    </div>
</template>

<script lang="ts" setup>
import type { Player } from '@/types/playerType'

defineProps<{
    player: Player
}>()

defineEmits<{
    pick: []
}>()
</script>