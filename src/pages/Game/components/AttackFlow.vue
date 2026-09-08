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
                class="attack-flow-step"
            >
                <h3 class="attack-flow-title">选择手牌</h3>
                <p class="attack-flow-hint">{{ stepHint }}</p>
                <div class="attack-flow-list">
                    <div
                        v-for="card in handCards"
                        :key="card.id"
                        class="attack-flow-pickable"
                        @click="selectCard(card)"
                    >
                        <CardThumb :card="card" />
                    </div>
                </div>
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
                class="attack-flow-step"
            >
                <h3 class="attack-flow-title">继续选择手牌</h3>
                <p class="attack-flow-hint">{{ stepHint }}</p>
                <div class="attack-flow-list">
                    <div
                        v-for="card in secondPickCards"
                        :key="card.id"
                        class="attack-flow-pickable"
                        @click="selectCard2(card)"
                    >
                        <CardThumb :card="card" />
                    </div>
                </div>
            </div>

            <div
                v-else-if="step === 'done'"
                class="attack-flow-step"
            >
                <h3 class="attack-flow-title">本轮选择完成</h3>
                <ul class="attack-flow-summary">
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
                    class="attack-flow-confirm"
                    @click="finishFlow"
                >完成</button>
            </div>
        </div>
    </van-popup>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

import CardThumb from './CardThumb.vue';
import PlayerPill from './PlayerPill.vue';
import { nearestTeammates } from '@/game/slots';
import type { Card } from '@/types/cardType';
import type { Player } from '@/types/playerType';
import { useCardStore } from '@/stores/card';
import { useSquadStore } from '@/stores/squad';

type Step = 'pick-gk' | 'pick-card' | 'pick-player' | 'pick-card-2' | 'done';

const props = defineProps<{
    show: boolean
}>();

const emit = defineEmits<{
    'update:show': [value: boolean]
    close: []
    finish: []
}>();

const store = useSquadStore();
const cardStore = useCardStore();

const shortPassOnly = (c: Card) => c.type === 'short-pass';
const longPassOnly = (c: Card) => c.type === 'long-pass';

const step = ref<Step>('pick-gk');
const currentTarget = ref<Player | null>(null);
const selectedCards = ref<Card[]>([]);
const handCards = ref<Card[]>([]);

function resetState() {
    step.value = 'pick-gk';
    currentTarget.value = null;
    selectedCards.value = [];
    handCards.value = [
        ...cardStore.drawRandom('attack', 1, longPassOnly),
        ...cardStore.drawRandom('attack', 5, shortPassOnly),
    ];
}

watch(() => props.show, (val) => {
    if (val) resetState();
});

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

const secondPickCards = computed<Card[]>(() =>
    handCards.value.filter((c) => c.id !== selectedCards.value[0]?.id),
);

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
    if (card.type === 'short-pass' || card.type === 'long-pass') {
        step.value = 'pick-player';
    } else {
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
    emit('finish');
    emit('update:show', false);
    emit('close');
}
</script>

<style lang="less" scoped>
@import './AttackFlow.less';
</style>
