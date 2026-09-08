<template>
    <div class="game-home">
        <header class="game-home-top">
            <span class="game-home-brand">Football Clash Cards</span>
        </header>

        <div class="game-home-stage">
            <div class="game-home-field">
                <svg
                    class="game-home-field-svg"
                    viewBox="0 0 300 400"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <rect
                        class="game-home-field-outline"
                        x="0"
                        y="0"
                        width="300"
                        height="400"
                    />
                    <line
                        class="game-home-field-line"
                        x1="0"
                        y1="200"
                        x2="300"
                        y2="200"
                    />
                    <circle
                        class="game-home-field-circle"
                        cx="150"
                        cy="200"
                        r="30"
                    />
                    <circle
                        class="game-home-field-spot"
                        cx="150"
                        cy="200"
                        r="1.5"
                    />
                    <rect
                        class="game-home-field-box"
                        x="60"
                        y="0"
                        width="180"
                        height="50"
                    />
                    <rect
                        class="game-home-field-box"
                        x="110"
                        y="0"
                        width="80"
                        height="20"
                    />
                    <rect
                        class="game-home-field-box"
                        x="60"
                        y="350"
                        width="180"
                        height="50"
                    />
                    <rect
                        class="game-home-field-box"
                        x="110"
                        y="380"
                        width="80"
                        height="20"
                    />
                </svg>

                <div class="game-home-row game-home-row-fwd">
                    <span
                        v-for="player in lineup.fwd"
                        :key="player.id"
                        class="game-home-player"
                    >
                        {{ player.name }}
                    </span>
                </div>

                <div class="game-home-row game-home-row-mid">
                    <span
                        v-for="player in lineup.mid"
                        :key="player.id"
                        class="game-home-player"
                    >
                        {{ player.name }}
                    </span>
                </div>

                <div class="game-home-row game-home-row-def">
                    <span
                        v-for="player in lineup.def"
                        :key="player.id"
                        class="game-home-player"
                    >
                        {{ player.name }}
                    </span>
                </div>

                <div class="game-home-row game-home-row-gk">
                    <span
                        v-for="player in lineup.gk"
                        :key="player.id"
                        class="game-home-player"
                    >
                        {{ player.name }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

type Slot =
    | 'gk'
    | 'lb'
    | 'lcb'
    | 'rcb'
    | 'rb'
    | 'lcm'
    | 'cm'
    | 'rcm'
    | 'lw'
    | 'st'
    | 'rw'

type Line = 'gk' | 'def' | 'mid' | 'fwd'

interface Player {
    id: number
    name: string
    position: Slot
}

const lineOf = (position: Slot): Line => {
    if (position === 'gk') return 'gk'
    if (position === 'lb' || position === 'lcb' || position === 'rcb' || position === 'rb') return 'def'
    if (position === 'lcm' || position === 'cm' || position === 'rcm') return 'mid'
    return 'fwd'
}

const mockSquad: Player[] = [
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

const lineup = computed(() => ({
    gk: mockSquad.filter((p) => lineOf(p.position) === 'gk'),
    def: mockSquad.filter((p) => lineOf(p.position) === 'def'),
    mid: mockSquad.filter((p) => lineOf(p.position) === 'mid'),
    fwd: mockSquad.filter((p) => lineOf(p.position) === 'fwd'),
}))
</script>

<style lang="less" scoped>
@import './Game.less';
</style>
