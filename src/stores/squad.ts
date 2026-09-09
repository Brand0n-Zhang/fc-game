import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { SLOT_COORDS } from '@/game/slots'
import type { Line, Player, Slot } from '@/types/playerType'

function lineOf(position: Slot): Line {
    if (position === 'gk') return 'gk'
    if (position === 'lb' || position === 'lcb' || position === 'rcb' || position === 'rb') return 'def'
    if (position === 'lcm' || position === 'cm' || position === 'rcm') return 'mid'
    return 'fwd'
}

const slotOrder: Record<Line, Slot[]> = {
    gk: ['gk'],
    def: ['lb', 'lcb', 'rcb', 'rb'],
    mid: ['lcm', 'cm', 'rcm'],
    fwd: ['lw', 'st', 'rw'],
}

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

    const lineup = computed(() => {
        const sortBySlot = (line: Line) => (a: Player, b: Player) =>
            slotOrder[line].indexOf(a.position) - slotOrder[line].indexOf(b.position)
        return {
            gk: players.value.filter((p) => lineOf(p.position) === 'gk'),
            def: players.value.filter((p) => lineOf(p.position) === 'def').sort(sortBySlot('def')),
            mid: players.value.filter((p) => lineOf(p.position) === 'mid').sort(sortBySlot('mid')),
            fwd: players.value.filter((p) => lineOf(p.position) === 'fwd').sort(sortBySlot('fwd')),
        }
    })

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
        lineup,
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