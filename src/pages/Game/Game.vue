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
                    <PlayerPill
                        v-for="player in store.lineup.fwd"
                        :key="player.id"
                        :player="player"
                        :is-dragging="draggingId === player.id"
                        :is-hover="hoverId === player.id"
                        :drag-x="dragX"
                        :drag-y="dragY"
                        @dragstart="handleDragStart"
                    />
                </div>

                <div class="game-home-row game-home-row-mid">
                    <PlayerPill
                        v-for="player in store.lineup.mid"
                        :key="player.id"
                        :player="player"
                        :is-dragging="draggingId === player.id"
                        :is-hover="hoverId === player.id"
                        :drag-x="dragX"
                        :drag-y="dragY"
                        @dragstart="handleDragStart"
                    />
                </div>

                <div class="game-home-row game-home-row-def">
                    <PlayerPill
                        v-for="player in store.lineup.def"
                        :key="player.id"
                        :player="player"
                        :is-dragging="draggingId === player.id"
                        :is-hover="hoverId === player.id"
                        :drag-x="dragX"
                        :drag-y="dragY"
                        @dragstart="handleDragStart"
                    />
                </div>

                <div class="game-home-row game-home-row-gk">
                    <PlayerPill
                        v-for="player in store.lineup.gk"
                        :key="player.id"
                        :player="player"
                        :is-dragging="draggingId === player.id"
                        :is-hover="hoverId === player.id"
                        :drag-x="dragX"
                        :drag-y="dragY"
                        @dragstart="handleDragStart"
                    />
                </div>
            </div>

            <button
                class="game-home-action"
                @click="modalOpen = true"
            >开始进攻</button>
        </div>

        <AttackFlow v-model:show="modalOpen" @finish="onAttackFinish" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount } from 'vue';

import AttackFlow from './components/AttackFlow.vue';
import PlayerPill from './components/PlayerPill.vue';
import { useSquadStore } from '@/stores/squad';

const store = useSquadStore();

const modalOpen = ref(false);

const draggingId = ref<number | null>(null);
const hoverId = ref<number | null>(null);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragPointerX = ref(0);
const dragPointerY = ref(0);

const dragX = computed(() =>
    draggingId.value !== null ? dragPointerX.value - dragStartX.value : 0,
);
const dragY = computed(() =>
    draggingId.value !== null ? dragPointerY.value - dragStartY.value : 0,
);

function onAttackFinish() {
    // TODO: 引擎结算
}

const handlePointerMove = (e: PointerEvent) => {
    dragPointerX.value = e.clientX;
    dragPointerY.value = e.clientY;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el instanceof HTMLElement && el.classList.contains('player-pill')) {
        hoverId.value = Number(el.dataset.playerId);
    } else {
        hoverId.value = null;
    }
};

const handlePointerUp = () => {
    if (
        draggingId.value !== null &&
        hoverId.value !== null &&
        draggingId.value !== hoverId.value
    ) {
        store.swapPositions(draggingId.value, hoverId.value);
    }
    draggingId.value = null;
    hoverId.value = null;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
};

const handleDragStart = (id: number, clientX: number, clientY: number) => {
    draggingId.value = id;
    dragStartX.value = clientX;
    dragStartY.value = clientY;
    dragPointerX.value = clientX;
    dragPointerY.value = clientY;
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
};

onBeforeUnmount(() => {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
});
</script>

<style lang="less" scoped>
@import './Game.less';
</style>
