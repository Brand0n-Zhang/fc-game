import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { lineOf, slotOrder } from '@/pages/Game/slots'
import type { Line, Player } from '@/pages/Game/types'

const initialSquad: Player[] = [
    { id: 1, name: 'Ederson', position: 'gk' },
    { id: 2, name: 'Gvardiol', position: 'lb' },
    { id: 3, name: 'Dias', position: 'lcb' },
    { id: 4, name: 'Stones', position: 'rcb' },
    { id: 5, name: 'Walker', position: 'rb' },
    { id: 6, name: 'Rodri', position: 'lcm' },
    { id: 7, name: 'De Bruyne', position: 'cm' },
    { id: 8, name: 'Bernardo', position: 'rcm' },
    { id: 9, name: 'Foden', position: 'lw' },
    { id: 10, name: 'Haaland', position: 'st' },
    { id: 11, name: 'Doku', position: 'rw' },
]

export const useSquadStore = defineStore('squad', () => {
    const players = ref<Player[]>([...initialSquad])

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

    return { players, lineup, swapPositions }
})
