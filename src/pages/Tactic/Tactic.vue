<template>
    <div class="tactic">
        <header class="tactic-top">
            <span class="tactic-brand">选择战术</span>
        </header>

        <p class="tactic-hint">不同风格将影响本场手牌分布</p>

        <div class="tactic-list">
            <TacticCard
                v-for="(cfg, key) in STYLE_CONFIGS"
                :key="key"
                :config="cfg"
                :selected="tacticStore.currentStyle === key"
                @select="tacticStore.setStyle(key as TacticStyle)"
            />
        </div>

        <button
            class="tactic-confirm"
            :disabled="!tacticStore.currentStyle"
            @click="goToGame"
        >确认战术 →</button>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

import TacticCard from './components/TacticCard.vue'
import { STYLE_CONFIGS, useTacticStore } from '@/stores/tactic'
import type { TacticStyle } from '@/types/tacticType'

const tacticStore = useTacticStore()
const router = useRouter()

function goToGame() {
    if (!tacticStore.currentStyle) return
    router.push({ name: 'Game' })
}
</script>

<style lang="less" scoped>
@import './Tactic.less';
</style>