<template>
    <div class="prepare">
        <header class="prepare-top">
            <span class="prepare-brand">组建阵容</span>
            <span class="prepare-count">{{ placedCount }}/{{ totalCount }}</span>
        </header>

        <div class="prepare-stage">
            <div
                class="prepare-field"
                ref="fieldRef"
            >
                <svg
                    class="prepare-field-svg"
                    viewBox="0 0 300 400"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <rect
                        class="prepare-field-outline"
                        x="0"
                        y="0"
                        width="300"
                        height="400"
                    />
                    <line
                        class="prepare-field-line"
                        x1="0"
                        y1="200"
                        x2="300"
                        y2="200"
                    />
                    <circle
                        class="prepare-field-circle"
                        cx="150"
                        cy="200"
                        r="30"
                    />
                    <circle
                        class="prepare-field-spot"
                        cx="150"
                        cy="200"
                        r="1.5"
                    />
                    <rect
                        class="prepare-field-box"
                        x="60"
                        y="0"
                        width="180"
                        height="50"
                    />
                    <rect
                        class="prepare-field-box"
                        x="110"
                        y="0"
                        width="80"
                        height="20"
                    />
                    <rect
                        class="prepare-field-box"
                        x="60"
                        y="350"
                        width="180"
                        height="50"
                    />
                    <rect
                        class="prepare-field-box"
                        x="110"
                        y="380"
                        width="80"
                        height="20"
                    />
                </svg>

                <div class="game-away-row game-away-row-gk">
                    <OpponentPill name="对方门将" />
                </div>

                <PlayerPill
                    v-for="player in placedPlayers"
                    :key="player.id"
                    :player="player"
                    :top-pct="store.pillCoords[player.id]?.topPct ?? 0"
                    :left-pct="store.pillCoords[player.id]?.leftPct ?? 0"
                    :is-dragging="draggingId === player.id"
                    :is-conflict="store.conflictIds.has(player.id)"
                    :draggable="player.id !== GK_PLAYER_ID"
                    @dragstart="handleDragStart"
                />
            </div>

            <div class="prepare-pool">
                <PlayerPool
                    :pool="poolPlayers"
                    @pick="handlePick"
                />
            </div>

            <button
                class="prepare-debug"
                @click="autoPosition"
            >一键站位(调试)</button>

            <button
                class="prepare-start"
                :disabled="!allPlaced"
                @click="goToGame"
            >开始比赛</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import OpponentPill from '@/pages/Game/components/OpponentPill.vue';
import PlayerPill from '@/pages/Game/components/PlayerPill.vue';
import { SLOT_COORDS } from '@/game/slots';
import { useFieldDrag } from '@/composables/useFieldDrag';
import { GK_PLAYER_ID, useSquadStore } from '@/stores/squad';

import PlayerPool from './components/PlayerPool.vue';

const store = useSquadStore();
const router = useRouter();

const fieldRef = ref<HTMLElement | null>(null);
const { draggingId, handleDragStart } = useFieldDrag(fieldRef, 0.08);

const totalCount = computed(() => store.players.length);
const placedCount = computed(() =>
    store.players.filter((p) => store.pillCoords[p.id] != null).length,
);
const placedPlayers = computed(() =>
    store.players.filter((p) => store.pillCoords[p.id] != null),
);

const poolPlayers = computed(() =>
    store.players.filter(
        (p) => p.id !== GK_PLAYER_ID && store.pillCoords[p.id] == null,
    ),
);

const allPlaced = computed(
    () => placedCount.value === totalCount.value && totalCount.value === 11,
);

function handlePick(id: number) {
    store.placeAtCenter(id);
}

function autoPosition() {
    for (const p of store.players) {
        const [sx, sy] = SLOT_COORDS[p.defaultSlot]
        store.setCoord(p.id, sy / 400, sx / 300)
    }
}

function goToGame() {
    if (!allPlaced.value) return;
    router.push({ name: 'Tactic' });
}

onMounted(() => {
    store.clearCoords();
    store.placeGk();
});
</script>

<style lang="less" scoped>
@import './Prepare.less';
</style>