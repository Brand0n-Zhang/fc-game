<template>
    <div
        class="tactic-card"
        :class="{ selected }"
        @click="$emit('select')"
    >
        <h3 class="tactic-card-name">{{ config.name }}</h3>
        <p class="tactic-card-desc">{{ config.description }}</p>
        <div class="tactic-card-preview">
            <span v-if="config.shortPass > 0" class="tactic-tag">短×{{ config.shortPass }}</span>
            <span v-if="config.dribble > 0" class="tactic-tag">过×{{ config.dribble }}</span>
            <span v-if="config.longPass > 0" class="tactic-tag">长×{{ config.longPass }}</span>
            <span class="tactic-tag tactic-tag-total">共 {{ total }} 张</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { StyleConfig } from '@/stores/tactic'

const props = defineProps<{
    config: StyleConfig
    selected: boolean
}>()

defineEmits<{
    select: []
}>()

const total = computed(() => props.config.shortPass + props.config.dribble + props.config.longPass)
</script>

<style lang="less" scoped>
.tactic-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 16px 14px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.tactic-card:hover {
    background: rgba(255, 255, 255, 0.12);
}

.tactic-card.selected {
    background: rgba(56, 189, 248, 0.18);
    border-color: rgba(56, 189, 248, 0.6);
}

.tactic-card:active {
    transform: scale(0.98);
}

.tactic-card-name {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #f8fafc;
}

.tactic-card-desc {
    margin: 0 0 12px;
    font-size: 12px;
    color: #94a3b8;
}

.tactic-card-preview {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.tactic-tag {
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
    font-size: 11px;
    font-weight: 600;
}

.tactic-tag-total {
    background: rgba(56, 189, 248, 0.25);
    color: #bae6fd;
}
</style>