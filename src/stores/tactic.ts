import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useCardStore } from '@/stores/card'
import type { Card } from '@/types/cardType'
import type { TacticStyle } from '@/types/tacticType'

export interface StyleConfig {
    name: string
    description: string
    shortPass: number
    dribble: number
    longPass: number
}

export const STYLE_CONFIGS: Record<TacticStyle, StyleConfig> = {
    possession: {
        name: '传球控制',
        description: '控球为主,层层推进',
        shortPass: 5,
        dribble: 1,
        longPass: 1,
    },
    pressing: {
        name: '高位压迫',
        description: '前场压迫,快速突进',
        shortPass: 2,
        dribble: 2,
        longPass: 2,
    },
    counter: {
        name: '防守反击',
        description: '稳守阵型,伺机反扑',
        shortPass: 4,
        dribble: 0,
        longPass: 0,
    },
}

export const useTacticStore = defineStore('tactic', () => {
    const currentStyle = ref<TacticStyle | null>(null)
    const cardStore = useCardStore()

    const handComposition = computed<Card[]>(() => {
        if (!currentStyle.value) return []
        const cfg = STYLE_CONFIGS[currentStyle.value]
        const draw = (type: Card['type'], n: number) =>
            n > 0 ? cardStore.drawRandom('attack', n, (c) => c.type === type) : []
        return [
            ...draw('short-pass', cfg.shortPass),
            ...draw('dribble', cfg.dribble),
            ...draw('long-pass', cfg.longPass),
        ]
    })

    function setStyle(s: TacticStyle): void {
        currentStyle.value = s
    }

    function reset(): void {
        currentStyle.value = null
    }

    return { currentStyle, handComposition, setStyle, reset }
})