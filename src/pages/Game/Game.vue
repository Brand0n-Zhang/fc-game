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

                <div class="game-away-row game-away-row-gk">
                    <OpponentPill
                        v-for="(name, i) in opponentPlayers.gk"
                        :key="`agk${i}`"
                        :name="name"
                    />
                </div>

                <div class="game-away-row game-away-row-def">
                    <OpponentPill
                        v-for="(name, i) in opponentPlayers.def"
                        :key="`adef${i}`"
                        :name="name"
                    />
                </div>

                <div class="game-away-row game-away-row-mid">
                    <OpponentPill
                        v-for="(name, i) in opponentPlayers.mid"
                        :key="`amid${i}`"
                        :name="name"
                    />
                </div>

                <div class="game-away-row game-away-row-fwd">
                    <OpponentPill
                        v-for="(name, i) in opponentPlayers.fwd"
                        :key="`afwd${i}`"
                        :name="name"
                    />
                </div>

                <PlayerPill
                    v-for="player in store.players"
                    :key="player.id"
                    :player="player"
                    :top-pct="pillCoords[player.id]?.topPct ?? 0"
                    :left-pct="pillCoords[player.id]?.leftPct ?? 0"
                    :is-dragging="draggingId === player.id"
                    :is-conflict="conflictIds.has(player.id)"
                    @dragstart="handleDragStart"
                />

                <AttackFlowViz
                    :chain="attackChain"
                    :visible="showViz"
                    @close="onVizClose"
                />
            </div>

            <div class="game-home-hand">
                <div class="game-home-hand-list">
                    <CardThumb
                        v-for="card in handCards"
                        :key="card.id"
                        :card="card"
                    />
                </div>
            </div>

            <button
                class="game-home-action"
                @click="modalOpen = true; showViz = false"
            >开始进攻</button>
        </div>

        <AttackFlow v-model:show="modalOpen" :hand-cards="handCards" @finish="onAttackFinish" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

import AttackFlow from './components/AttackFlow.vue';
import AttackFlowViz from './components/AttackFlowViz.vue';
import CardThumb from './components/CardThumb.vue';
import OpponentPill from './components/OpponentPill.vue';
import PlayerPill from './components/PlayerPill.vue';
import { SLOT_COORDS } from '@/game/slots';
import type { Card } from '@/types/cardType';
import type { Player, Slot } from '@/types/playerType';
import { useCardStore } from '@/stores/card';
import { useSquadStore } from '@/stores/squad';

const store = useSquadStore();
const cardStore = useCardStore();

const shortPassOnly = (c: Card) => c.type === 'short-pass';
const longPassOnly = (c: Card) => c.type === 'long-pass';
const handCards = ref<Card[]>([
    ...cardStore.drawRandom('attack', 1, longPassOnly),
    ...cardStore.drawRandom('attack', 5, shortPassOnly),
]);

type ChainAction = 'short-pass' | 'long-pass' | 'dribble' | 'shoot';
interface ChainStep {
    card: string;
    type: ChainAction;
    from: string;
    to: string;
    goal?: [number, number];
}

const modalOpen = ref(false);
const attackChain = ref<ChainStep[]>([]);
const showViz = ref(false);

const opponentPlayers = {
    gk: ['Raya'],
    def: ['Zinchenko', 'Saliba', 'Gabriel', 'White'],
    mid: ['Martinelli', 'Rice', 'Ødegaard', 'Saka'],
    fwd: ['Trossard', 'Havertz', 'Jesus'],
};

const draggingId = ref<number | null>(null);
const pillCoords = ref<Record<number, { topPct: number; leftPct: number }>>({});
const conflictIds = ref<Set<number>>(new Set());
let dragOffsetX = 0;
let dragOffsetY = 0;
let pillWPct = 0;
let pillHPct = 0;
let fieldEl: HTMLElement | null = null;
let dragStartPct: { topPct: number; leftPct: number } | null = null;

function initPillCoords(): void {
    const next: Record<number, { topPct: number; leftPct: number }> = {};
    for (const p of store.players) {
        const [sx, sy] = SLOT_COORDS[p.position];
        next[p.id] = { topPct: sy / 400, leftPct: sx / 300 };
    }
    pillCoords.value = next;
}

function onAttackFinish(cards: Card[], targets: Player[], shoot: boolean) {
    const gk = store.players.find((p) => p.position === 'gk');
    const chain: ChainStep[] = cards.map((card, i) => ({
        card: card.name.zh,
        type: card.type as ChainAction,
        from: i === 0 ? gk?.name ?? '门将' : targets[i - 1]?.name ?? '未知',
        to: targets[i]?.name ?? '未知',
    }));
    if (shoot) {
        const shooter = targets.length > 0
            ? targets[targets.length - 1]?.name ?? '未知'
            : gk?.name ?? '门将';
        chain.push({ card: '射门', type: 'shoot', from: shooter, to: '球门', goal: [150, 20] });
    }
    console.log('进攻链路：', chain);
    attackChain.value = chain;
    showViz.value = true;
}

function onVizClose() {
    showViz.value = false;
    attackChain.value = [];
}

const handlePointerMove = (e: PointerEvent) => {
    if (draggingId.value === null || !fieldEl) return;
    const fieldRect = fieldEl.getBoundingClientRect();
    if (fieldRect.width === 0 || fieldRect.height === 0) return;
    const rawLeftPx = e.clientX - fieldRect.left - dragOffsetX;
    const rawTopPx = e.clientY - fieldRect.top - dragOffsetY;
    const maxLeft = 1 - pillWPct;
    const maxTop = 1 - pillHPct;
    const newLeftPct = Math.max(0, Math.min(maxLeft, rawLeftPx / fieldRect.width));
    const newTopPct = Math.max(0, Math.min(maxTop, rawTopPx / fieldRect.height));
    const id = draggingId.value;
    pillCoords.value = {
        ...pillCoords.value,
        [id]: { topPct: newTopPct, leftPct: newLeftPct },
    };
    detectConflicts(id);
};

function detectConflicts(dragId: number): void {
    const dragged = pillCoords.value[dragId];
    if (!dragged) {
        conflictIds.value = new Set();
        return;
    }
    const dCxPct = dragged.leftPct + pillWPct / 2;
    const dCyPct = dragged.topPct + pillHPct / 2;
    const next = new Set<number>();
    for (const p of store.players) {
        if (p.id === dragId) continue;
        const other = pillCoords.value[p.id];
        if (!other) continue;
        const dxCenterPct = Math.abs(other.leftPct + pillWPct / 2 - dCxPct);
        const dyCenterPct = Math.abs(other.topPct + pillHPct / 2 - dCyPct);
        if (dxCenterPct < pillWPct && dyCenterPct < pillHPct) {
            next.add(dragId);
            next.add(p.id);
        }
    }
    conflictIds.value = next;
}

function findNearestSlot(topPct: number, leftPct: number): Slot {
    const cx = leftPct * 300;
    const cy = topPct * 400;
    let best: Slot = 'gk';
    let bestDist = Infinity;
    for (const slot of Object.keys(SLOT_COORDS) as Slot[]) {
        const [sx, sy] = SLOT_COORDS[slot];
        const d = Math.hypot(sx - cx, sy - cy);
        if (d < bestDist) {
            bestDist = d;
            best = slot;
        }
    }
    return best;
}

const handlePointerUp = () => {
    if (draggingId.value !== null) {
        const id = draggingId.value;
        const start = dragStartPct;
        if (conflictIds.value.size > 0 && start) {
            pillCoords.value = {
                ...pillCoords.value,
                [id]: { ...start },
            };
        } else {
            const coord = pillCoords.value[id];
            if (coord) {
                const slot = findNearestSlot(coord.topPct, coord.leftPct);
                store.updatePosition(id, slot);
            }
        }
    }
    draggingId.value = null;
    conflictIds.value = new Set();
    dragStartPct = null;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
};

const handleDragStart = (id: number, clientX: number, clientY: number) => {
    const pillEl = document.querySelector(
        `.game-home-field .player-pill[data-player-id="${id}"]`,
    ) as HTMLElement | null;
    fieldEl = document.querySelector('.game-home-field') as HTMLElement | null;
    if (!pillEl || !fieldEl) return;
    const pillRect = pillEl.getBoundingClientRect();
    const fieldRect = fieldEl.getBoundingClientRect();
    if (fieldRect.width === 0 || fieldRect.height === 0) return;
    dragOffsetX = clientX - (pillRect.left + pillRect.width / 2);
    dragOffsetY = clientY - (pillRect.top + pillRect.height / 2);
    pillWPct = pillRect.width / fieldRect.width;
    pillHPct = pillRect.height / fieldRect.height;
    dragStartPct = pillCoords.value[id] ? { ...pillCoords.value[id] } : null;
    draggingId.value = id;
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
};

onMounted(() => {
    initPillCoords();
});

onBeforeUnmount(() => {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
});
</script>

<style lang="less" scoped>
@import './Game.less';
</style>
