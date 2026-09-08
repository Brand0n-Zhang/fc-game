import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type {
    AttackCardType,
    Card,
    CardMeta,
    CardType,
    DeckSide,
    DefenseCardType,
} from '@/types/cardType'

const ATTACK_META: Record<AttackCardType, CardMeta> = {
    'short-pass': { name: { zh: '短传', en: 'Short Pass' }, cost: 1 },
    'shoot': { name: { zh: '射门', en: 'Shoot' }, cost: 1 },
    'dribble': { name: { zh: '过人', en: 'Dribble' }, cost: 1 },
    'long-pass': { name: { zh: '长传', en: 'Long Pass' }, cost: 1 },
}

const DEFENSE_META: Record<DefenseCardType, CardMeta> = {
    'save': { name: { zh: '扑救', en: 'Save' }, cost: 1 },
    'tackle': { name: { zh: '抢断', en: 'Tackle' }, cost: 1 },
    'clear': { name: { zh: '解围', en: 'Clear' }, cost: 1 },
    'block': { name: { zh: '封堵', en: 'Block' }, cost: 1 },
}

const ATTACK_COUNTS: Record<AttackCardType, number> = {
    'short-pass': 7,
    'shoot': 5,
    'dribble': 3,
    'long-pass': 3,
}

const DEFENSE_COUNTS: Record<DefenseCardType, number> = {
    'save': 3,
    'tackle': 5,
    'clear': 5,
    'block': 5,
}

function buildPool<T extends CardType>(
    counts: Record<T, number>,
    meta: Record<T, CardMeta>,
): Card[] {
    const cards: Card[] = []
    ;(Object.keys(counts) as T[]).forEach((type) => {
        const m = meta[type]
        for (let i = 0; i < counts[type]; i++) {
            cards.push({
                id: cards.length + 1,
                name: m.name,
                type,
                cost: m.cost,
            })
        }
    })
    return cards
}

export const useCardStore = defineStore('card', () => {
    const attack = ref<Card[]>(buildPool(ATTACK_COUNTS, ATTACK_META))
    const defense = ref<Card[]>(buildPool(DEFENSE_COUNTS, DEFENSE_META))

    const all = computed<Card[]>(() => [...attack.value, ...defense.value])

    function findById(id: number, side?: DeckSide): Card | undefined {
        if (side === 'attack') return attack.value.find((c) => c.id === id)
        if (side === 'defense') return defense.value.find((c) => c.id === id)
        return all.value.find((c) => c.id === id)
    }

    function findByType(type: CardType): Card[] {
        return all.value.filter((c) => c.type === type)
    }

    function drawRandom(side: DeckSide, n: number): Card[] {
        const pool = side === 'attack' ? attack.value : defense.value
        const copy = [...pool]
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const tmp = copy[i]
            copy[i] = copy[j]
            copy[j] = tmp
        }
        return copy.slice(0, n)
    }

    return { attack, defense, all, findById, findByType, drawRandom }
})
