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
                    :top-pct="store.pillCoords[player.id]?.topPct ?? 0"
                    :left-pct="store.pillCoords[player.id]?.leftPct ?? 0"
                    :is-dragging="false"
                    :is-conflict="false"
                    :draggable="false"
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
import { computed, ref, onMounted } from 'vue';

import AttackFlow from './components/AttackFlow.vue';
import AttackFlowViz from './components/AttackFlowViz.vue';
import CardThumb from './components/CardThumb.vue';
import OpponentPill from './components/OpponentPill.vue';
import PlayerPill from './components/PlayerPill.vue';
import type { Card } from '@/types/cardType';
import type { Player } from '@/types/playerType';
import { GK_PLAYER_ID, useSquadStore } from '@/stores/squad';
import { useTacticStore } from '@/stores/tactic';

const store = useSquadStore();
const tacticStore = useTacticStore();

const handCards = computed<Card[]>(() => tacticStore.handComposition);

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

function onAttackFinish(cards: Card[], targets: Player[], shoot: boolean) {
    const gk = store.players.find((p) => p.id === GK_PLAYER_ID);
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

onMounted(() => {
    if (Object.keys(store.pillCoords).length === 0) {
        store.resetCoordsFromSlots();
    }
    if (!tacticStore.currentStyle) {
        tacticStore.setStyle('possession');
    }
});
</script>

<style lang="less" scoped>
@import './Game.less';
</style>