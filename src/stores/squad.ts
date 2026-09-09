import { defineStore } from 'pinia'
import { ref } from 'vue'

import { SLOT_COORDS } from '@/game/slots'
import type { Player } from '@/types/playerType'

export const GK_PLAYER_ID = 1

const SLOT_VIEW_WIDTH = 300
const SLOT_VIEW_HEIGHT = 400

const initialSquad: Player[] = [
    { id: 1, name: 'Ederson', defaultSlot: 'gk', shortPass: 99, longPass: 1, shooting: 20, saving: 88 },
    { id: 2, name: 'Gvardiol', defaultSlot: 'lb', shortPass: 78, longPass: 75, shooting: 55, saving: 0 },
    { id: 3, name: 'Dias', defaultSlot: 'lcb', shortPass: 82, longPass: 68, shooting: 40, saving: 0 },
    { id: 4, name: 'Stones', defaultSlot: 'rcb', shortPass: 90, longPass: 80, shooting: 50, saving: 0 },
    { id: 5, name: 'Walker', defaultSlot: 'rb', shortPass: 75, longPass: 62, shooting: 45, saving: 0 },
    { id: 6, name: 'Rodri', defaultSlot: 'lcm', shortPass: 93, longPass: 86, shooting: 65, saving: 0 },
    { id: 7, name: 'De Bruyne', defaultSlot: 'cm', shortPass: 92, longPass: 97, shooting: 88, saving: 0 },
    { id: 8, name: 'Bernardo', defaultSlot: 'rcm', shortPass: 90, longPass: 78, shooting: 72, saving: 0 },
    { id: 9, name: 'Foden', defaultSlot: 'lw', shortPass: 86, longPass: 76, shooting: 84, saving: 0 },
    { id: 10, name: 'Haaland', defaultSlot: 'st', shortPass: 70, longPass: 50, shooting: 96, saving: 0 },
    { id: 11, name: 'Doku', defaultSlot: 'rw', shortPass: 72, longPass: 58, shooting: 78, saving: 0 },
]

export const useSquadStore = defineStore('squad', () => {
    const players = ref<Player[]>([...initialSquad])
    const pillCoords = ref<Record<number, { topPct: number; leftPct: number }>>({})
    const conflictIds = ref<Set<number>>(new Set())

    function placeAtCenter(id: number): void {
        pillCoords.value = {
            ...pillCoords.value,
            [id]: { topPct: 0.5, leftPct: 0.5 },
        }
    }

    function setCoord(id: number, topPct: number, leftPct: number): void {
        pillCoords.value = {
            ...pillCoords.value,
            [id]: { topPct, leftPct },
        }
    }

    function placeGk(): void {
        const gk = players.value.find((p) => p.id === GK_PLAYER_ID)
        if (!gk) return
        const [sx, sy] = SLOT_COORDS[gk.defaultSlot]
        pillCoords.value = {
            ...pillCoords.value,
            [gk.id]: { topPct: sy / SLOT_VIEW_HEIGHT, leftPct: sx / SLOT_VIEW_WIDTH },
        }
    }

    function resetCoordsFromSlots(): void {
        const next: Record<number, { topPct: number; leftPct: number }> = {}
        for (const p of players.value) {
            const [sx, sy] = SLOT_COORDS[p.defaultSlot]
            next[p.id] = { topPct: sy / SLOT_VIEW_HEIGHT, leftPct: sx / SLOT_VIEW_WIDTH }
        }
        pillCoords.value = next
    }

    function clearCoords(): void {
        pillCoords.value = {}
        conflictIds.value = new Set()
    }

    return {
        players,
        pillCoords,
        conflictIds,
        placeAtCenter,
        setCoord,
        placeGk,
        resetCoordsFromSlots,
        clearCoords,
    }
})