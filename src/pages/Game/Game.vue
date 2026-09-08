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

type Position = 'gk' | 'def' | 'mid' | 'fwd'

interface Player {
    id: string
    name: string
    position: Position
}

const mockSquad: Player[] = [
    { id: 'gk', name: 'Ederson', position: 'gk' },
    { id: 'lb', name: 'Gvardiol', position: 'def' },
    { id: 'lcb', name: 'Dias', position: 'def' },
    { id: 'rcb', name: 'Stones', position: 'def' },
    { id: 'rb', name: 'Walker', position: 'def' },
    { id: 'lcm', name: 'Rodri', position: 'mid' },
    { id: 'cm', name: 'De Bruyne', position: 'mid' },
    { id: 'rcm', name: 'Bernardo', position: 'mid' },
    { id: 'lw', name: 'Foden', position: 'fwd' },
    { id: 'st', name: 'Haaland', position: 'fwd' },
    { id: 'rw', name: 'Doku', position: 'fwd' },
]

const lineup = computed(() => ({
    gk: mockSquad.filter((p) => p.position === 'gk'),
    def: mockSquad.filter((p) => p.position === 'def'),
    mid: mockSquad.filter((p) => p.position === 'mid'),
    fwd: mockSquad.filter((p) => p.position === 'fwd'),
}))
</script>

<style lang="less" scoped>
@import './Game.less';
</style>
