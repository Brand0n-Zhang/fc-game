import { defineStore } from 'pinia'
import { ref } from 'vue'

import { SLOT_COORDS } from '@/game/slots'
import type { Player, Slot } from '@/types/playerType'

const SLOT_VIEW_WIDTH = 300
const SLOT_VIEW_HEIGHT = 400

const initialSquad: Player[] = [
    { id: 1, name: 'Ederson', position: 'gk', shortPass: 99, longPass: 1, shooting: 20 },
    { id: 2, name: 'Gvardiol', position: 'lb', shortPass: 78, longPass: 75, shooting: 55 },
    { id: 3, name: 'Dias', position: 'lcb', shortPass: 82, longPass: 68, shooting: 40 },
    { id: 4, name: 'Stones', position: 'rcb', shortPass: 90, longPass: 80, shooting: 50 },
    { id: 5, name: 'Walker', position: 'rb', shortPass: 75, longPass: 62, shooting: 45 },
    { id: 6, name: 'Rodri', position: 'lcm', shortPass: 93, longPass: 86, shooting: 65 },
    { id: 7, name: 'De Bruyne', position: 'cm', shortPass: 92, longPass: 97, shooting: 88 },
    { id: 8, name: 'Bernardo', position: 'rcm', shortPass: 90, longPass: 78, shooting: 72 },
    { id: 9, name: 'Foden', position: 'lw', shortPass: 86, longPass: 76, shooting: 84 },
    { id: 10, name: 'Haaland', position: 'st', shortPass: 70, longPass: 50, shooting: 96 },
    { id: 11, name: 'Doku', position: 'rw', shortPass: 72, longPass: 58, shooting: 78 },
]

export const useSquadStore = defineStore('squad', () => {
    const players = ref<Player[]>([...initialSquad])
    const pillCoords = ref<Record<number, { topPct: number; leftPct: number }>>({})
    const conflictIds = ref<Set<number>>(new Set())

    function swapPositions(idA: number, idB: number): void {
        if (idA === idB) return
        const a = players.value.find((p) => p.id === idA)
        const b = players.value.find((p) => p.id === idB)
        if (!a || !b) return
        const tmp = a.position
        a.position = b.position
        b.position = tmp
    }

    function updatePosition(id: number, slot: Slot): void {
        const p = players.value.find((p) => p.id === id)
        if (p) p.position = slot
    }

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
        const gk = players.value.find((p) => p.position === 'gk')
        if (!gk) return
        const [sx, sy] = SLOT_COORDS['gk']
        pillCoords.value = {
            ...pillCoords.value,
            [gk.id]: { topPct: sy / SLOT_VIEW_HEIGHT, leftPct: sx / SLOT_VIEW_WIDTH },
        }
    }

    function resetCoordsFromSlots(): void {
        const next: Record<number, { topPct: number; leftPct: number }> = {}
        for (const p of players.value) {
            const [sx, sy] = SLOT_COORDS[p.position]
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
        swapPositions,
        updatePosition,
        placeAtCenter,
        setCoord,
        placeGk,
        resetCoordsFromSlots,
        clearCoords,
    }
})