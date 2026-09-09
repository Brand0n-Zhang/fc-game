<template>
    <van-popup
        :show="show"
        round
        closeable
        position="center"
        @update:show="onUpdateShow"
    >
        <div class="attack-flow">
            <div
                v-if="step === 'pick-gk'"
                class="attack-flow-step"
            >
                <h3 class="attack-flow-title">选择门将</h3>
                <p class="attack-flow-hint">点击门将开始进攻</p>
                <div class="attack-flow-list">
                    <div
                        v-if="gkPlayer"
                        class="attack-flow-pickable"
                        @click="selectGk"
                    >
                        <span class="attack-flow-pill">{{ gkPlayer.name }}</span>
                    </div>
                </div>
            </div>

            <div
                v-else-if="step === 'pick-card'"
                class="attack-flow-step"
            >
                <h3 class="attack-flow-title">选择手牌</h3>
                <p class="attack-flow-hint">{{ stepHint }}</p>
                <div class="attack-flow-list">
                    <div
                        v-for="card in remainingCards"
                        :key="card.id"
                        class="attack-flow-pickable"
                        @click="selectCard(card)"
                    >
                        <CardThumb :card="card" />
                    </div>
                </div>
                <button
                    class="attack-flow-shoot"
                    @click="finishFlow(true)"
                >射门</button>
            </div>

            <div
                v-else-if="step === 'pick-player'"
                class="attack-flow-step"
            >
                <h3 class="attack-flow-title">选择目标球员</h3>
                <p class="attack-flow-hint">{{ stepHint }}</p>
                <div class="attack-flow-list">
                    <div
                        v-for="player in availablePlayers"
                        :key="player.id"
                        class="attack-flow-pickable"
                        @click="selectPlayer(player)"
                    >
                        <span class="attack-flow-pill">{{ player.name }}</span>
                    </div>
                </div>
                <button
                    class="attack-flow-shoot"
                    @click="finishFlow(true)"
                >射门</button>
            </div>

            <div
                v-else-if="step === 'done'"
                class="attack-flow-step"
            >
                <h3 class="attack-flow-title">本轮选择完成</h3>
                <ul class="attack-flow-summary">
                    <li>门将：{{ gkPlayer?.name }}</li>
                    <li v-for="(card, i) in selectedCards" :key="card.id">
                        动作 {{ i + 1 }}：{{ card.name.zh }}
                    </li>
                </ul>
                <button
                    class="attack-flow-confirm"
                    @click="() => finishFlow()"
                >完成</button>
            </div>
        </div>
    </van-popup>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

import CardThumb from './CardThumb.vue';
import type { Card } from '@/types/cardType';
import type { Player } from '@/types/playerType';
import { useSquadStore } from '@/stores/squad';

type Step = 'pick-gk' | 'pick-card' | 'pick-player' | 'done';

const props = defineProps<{
    show: boolean
    handCards: Card[]
}>();

const emit = defineEmits<{
    'update:show': [value: boolean]
    close: []
    finish: [cards: Card[], targets: Player[], shoot: boolean]
}>();

const store = useSquadStore();

const step = ref<Step>('pick-gk');
const currentTarget = ref<Player | null>(null);
const selectedCards = ref<Card[]>([]);
const selectedTargets = ref<Player[]>([]);

function resetState() {
    step.value = 'pick-gk';
    currentTarget.value = null;
    selectedCards.value = [];
    selectedTargets.value = [];
}

watch(() => props.show, (val) => {
    if (val) resetState();
});

const gkPlayer = computed<Player | null>(
    () => store.players.find((p) => p.position === 'gk') ?? null,
);

const remainingCards = computed<Card[]>(() => {
    const usedIds = new Set(selectedCards.value.map((c) => c.id));
    return props.handCards.filter((c) => !usedIds.has(c.id));
});

const lastCard = computed(() => selectedCards.value.at(-1) ?? null);

const availablePlayers = computed<Player[]>(() => {
    if (step.value !== 'pick-player') return [];
    if (!currentTarget.value) return [];
    const card = lastCard.value;
    if (!card) return [];

    const currentCoord = store.pillCoords[currentTarget.value.id];
    if (!currentCoord) return [];

    const others = store.players
        .filter((p) => p.id !== currentTarget.value!.id && store.pillCoords[p.id] != null)
        .map((p) => {
            const c = store.pillCoords[p.id]!;
            return {
                player: p,
                dist: Math.hypot(
                    (currentCoord.leftPct - c.leftPct) * 300,
                    (currentCoord.topPct - c.topPct) * 400,
                ),
            };
        })
        .sort((a, b) => a.dist - b.dist);

    if (card.type === 'short-pass') return others.slice(0, 3).map((x) => x.player);
    if (card.type === 'long-pass') return others.slice(2).map((x) => x.player);
    return [];
});

const stepHint = computed(() => {
    if (step.value === 'pick-card') {
        const round = selectedCards.value.length + 1;
        return currentTarget.value
            ? `第 ${round} 轮 · 当前球员：${currentTarget.value.name}`
            : `第 ${round} 轮`;
    }
    if (step.value === 'pick-player') {
        const card = lastCard.value;
        if (card?.type === 'short-pass') return '短传：离目标最近的 3 名队友';
        if (card?.type === 'long-pass') return '长传：除最近 2 名之外的所有球员';
    }
    return '';
});

function onUpdateShow(val: boolean) {
    emit('update:show', val);
    if (!val) emit('close');
}

function selectGk() {
    if (!gkPlayer.value) return;
    currentTarget.value = gkPlayer.value;
    step.value = 'pick-card';
}

function selectCard(card: Card) {
    selectedCards.value.push(card);
    step.value = 'pick-player';
}

function selectPlayer(player: Player) {
    currentTarget.value = player;
    selectedTargets.value.push(player);
    step.value = remainingCards.value.length > 0 ? 'pick-card' : 'done';
}

function finishFlow(shoot = false) {
    emit('finish', selectedCards.value, selectedTargets.value, shoot);
    emit('update:show', false);
    emit('close');
}
</script>

<style lang="less" scoped>
@import './AttackFlow.less';
</style>
