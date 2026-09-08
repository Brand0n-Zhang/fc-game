<template>
    <div class="card-thumb" :class="`card-thumb-${cardTypeSide}`">
        <span class="card-thumb-type">{{ typeLabel }}</span>
        <span class="card-thumb-name">{{ card.name.zh }}</span>
        <span class="card-thumb-cost">{{ card.cost }}</span>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Card, CardType } from '@/types/cardType'

const props = defineProps<{
    card: Card
}>()

const ATTACK_TYPES: CardType[] = ['short-pass', 'shoot', 'dribble', 'long-pass']

const cardTypeSide = computed<'attack' | 'defense'>(() =>
    ATTACK_TYPES.includes(props.card.type) ? 'attack' : 'defense',
)

const TYPE_LABEL: Record<CardType, string> = {
    'short-pass': '传球',
    'shoot': '射门',
    'dribble': '过人',
    'long-pass': '长传',
    'save': '扑救',
    'tackle': '抢断',
    'clear': '解围',
    'block': '封堵',
}

const typeLabel = computed(() => TYPE_LABEL[props.card.type])
</script>

<style lang="less" scoped>
@import './CardThumb.less';
</style>
