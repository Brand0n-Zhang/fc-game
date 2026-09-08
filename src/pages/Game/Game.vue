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
                @click="openAttackFlow"
            >开始进攻</button>
        </div>

        <Modal
            :visible="modalOpen"
            @close="closeAttackFlow"
        >
            <div
                v-if="step === 'pick-gk'"
                class="game-home-modal-step"
            >
                <h3 class="game-home-modal-title">选择门将</h3>
                <p class="game-home-modal-hint">点击门将开始进攻</p>
                <div class="game-home-modal-list">
                    <div
                        v-if="gkPlayer"
                        class="game-home-modal-pickable"
                        @click="selectGk"
                    >
                        <PlayerPill
                            :player="gkPlayer"
                            :is-dragging="false"
                            :is-hover="false"
                            :drag-x="0"
                            :drag-y="0"
                        />
                    </div>
                </div>
            </div>

            <div
                v-else-if="step === 'pick-card'"
                class="game-home-modal-step"
            >
                <h3 class="game-home-modal-title">选择手牌</h3>
                <p class="game-home-modal-hint">{{ stepHint }}</p>
                <div class="game-home-modal-list">
                    <div
                        v-for="card in handCards"
                        :key="card.id"
                        class="game-home-modal-pickable"
                        @click="selectCard(card)"
                    >
                        <CardThumb :card="card" />
                    </div>
                </div>
            </div>

            <div
                v-else-if="step === 'pick-player'"
                class="game-home-modal-step"
            >
                <h3 class="game-home-modal-title">选择目标球员</h3>
                <p class="game-home-modal-hint">{{ stepHint }}</p>
                <div class="game-home-modal-list">
                    <div
                        v-for="player in availablePlayers"
                        :key="player.id"
                        class="game-home-modal-pickable"
                        @click="selectPlayer(player)"
                    >
                        <PlayerPill
                            :player="player"
                            :is-dragging="false"
                            :is-hover="false"
                            :drag-x="0"
                            :drag-y="0"
                        />
                    </div>
                </div>
            </div>

            <div
                v-else-if="step === 'pick-card-2'"
                class="game-home-modal-step"
            >
                <h3 class="game-home-modal-title">继续选择手牌</h3>
                <p class="game-home-modal-hint">{{ stepHint }}</p>
                <div class="game-home-modal-list">
                    <div
                        v-for="card in handCards"
                        :key="card.id"
                        class="game-home-modal-pickable"
                        @click="selectCard2(card)"
                    >
                        <CardThumb :card="card" />
                    </div>
                </div>
            </div>

            <div
                v-else-if="step === 'done'"
                class="game-home-modal-step"
            >
                <h3 class="game-home-modal-title">本轮选择完成</h3>
                <ul class="game-home-modal-summary">
                    <li>门将：{{ gkPlayer?.name }}</li>
                    <li>动作 1：{{ selectedCards[0]?.name.zh }}</li>
                    <li v-if="selectedCards.length > 1 && currentTarget">
                        目标：{{ currentTarget.name }}
                    </li>
                    <li v-if="selectedCards.length > 1">
                        动作 2：{{ selectedCards[1]?.name.zh }}
                    </li>
                </ul>
                <button
                    class="game-home-modal-confirm"
                    @click="finishFlow"
                >完成</button>
            </div>
        </Modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount } from 'vue';

import CardThumb from './components/CardThumb.vue';
import Modal from './components/Modal.vue';
import PlayerPill from './components/PlayerPill.vue';
import { nearestTeammates } from '@/game/slots';
import type { Card } from '@/types/cardType';
import type { Player } from '@/types/playerType';
import { useCardStore } from '@/stores/card';
import { useSquadStore } from '@/stores/squad';

type Step = 'pick-gk' | 'pick-card' | 'pick-player' | 'pick-card-2' | 'done';

const store = useSquadStore();
const cardStore = useCardStore();

// TODO: 临时 mock —— 引擎支持射门/过人/长传后移除
const shortPassOnly = (c: Card) => c.type === 'short-pass';
const handCards = ref<Card[]>(cardStore.drawRandom('attack', 6, shortPassOnly));

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

// ===== 进攻流程弹窗状态机 =====
const modalOpen = ref(false);
const step = ref<Step>('pick-gk');
const currentTarget = ref<Player | null>(null);
const selectedCards = ref<Card[]>([]);

const gkPlayer = computed<Player | null>(
    () => store.players.find((p) => p.position === 'gk') ?? null,
);

const availablePlayers = computed<Player[]>(() => {
    if (step.value !== 'pick-player') return [];
    if (!currentTarget.value) return [];
    const card = selectedCards.value[0];
    if (!card) return [];
    const allSlots = store.players.map((p) => p.position);
    if (card.type === 'short-pass') {
        const slots = nearestTeammates(currentTarget.value.position, allSlots, 2);
        return store.players.filter((p) => slots.includes(p.position));
    }
    if (card.type === 'long-pass') {
        const nearest2 = new Set(nearestTeammates(currentTarget.value.position, allSlots, 2));
        return store.players.filter(
            (p) => p.id !== currentTarget.value!.id && !nearest2.has(p.position),
        );
    }
    return [];
});

const stepHint = computed(() => {
    if (step.value === 'pick-card' || step.value === 'pick-card-2') {
        return currentTarget.value ? `目标球员：${currentTarget.value.name}` : '';
    }
    if (step.value === 'pick-player') {
        const card = selectedCards.value[0];
        if (card?.type === 'short-pass') return '短传：离目标最近的 2 名队友';
        if (card?.type === 'long-pass') return '长传：除最近 2 名之外的所有球员';
    }
    return '';
});

function openAttackFlow() {
    modalOpen.value = true;
    step.value = 'pick-gk';
    currentTarget.value = null;
    selectedCards.value = [];
}

function closeAttackFlow() {
    modalOpen.value = false;
}

function selectGk() {
    if (!gkPlayer.value) return;
    currentTarget.value = gkPlayer.value;
    step.value = 'pick-card';
}

function selectCard(card: Card) {
    selectedCards.value.push(card);
    if (card.type === 'short-pass' || card.type === 'long-pass') {
        step.value = 'pick-player';
    } else {
        // shoot / dribble: 本轮先跳过选人
        step.value = 'pick-card-2';
    }
}

function selectPlayer(player: Player) {
    currentTarget.value = player;
    step.value = 'pick-card-2';
}

function selectCard2(card: Card) {
    selectedCards.value.push(card);
    step.value = 'done';
}

function finishFlow() {
    closeAttackFlow();
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
