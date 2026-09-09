<template>
    <div v-if="visible" class="attack-flow-viz">
        <svg
            class="attack-flow-viz-svg"
            viewBox="0 0 300 400"
            preserveAspectRatio="xMidYMid meet"
        >
            <g v-for="(step, i) in chain" :key="i">
                <g v-if="i === activeIndex">
                    <line
                        :class="lineClass(i)"
                        :x1="coords[i].from[0]"
                        :y1="coords[i].from[1]"
                        :x2="coords[i].to[0]"
                        :y2="coords[i].to[1]"
                        :style="lineStyle(i)"
                    />

                    <template v-if="!isFailed(i)">
                        <polygon
                            :class="[
                                'attack-flow-viz-arrow',
                                { 'attack-flow-viz-arrow--goal': step.goal },
                            ]"
                            points="0 0, -10 -5, -10 5"
                            :transform="arrowTransform(i)"
                        />

                        <circle
                            class="attack-flow-viz-ball"
                            :cx="coords[i].from[0]"
                            :cy="coords[i].from[1]"
                            r="4"
                        >
                            <animateMotion
                                dur="0.5s"
                                begin="1s"
                                fill="freeze"
                                :path="ballPath(i)"
                            />
                        </circle>

                        <circle
                            class="attack-flow-viz-dot"
                            :cx="coords[i].to[0]"
                            :cy="coords[i].to[1]"
                            r="3"
                        />

                        <circle
                            v-if="step.goal"
                            class="attack-flow-viz-goal"
                            :cx="step.goal[0]"
                            :cy="step.goal[1]"
                            r="8"
                        />
                    </template>

                    <text
                        class="attack-flow-viz-label"
                        :x="labelX(i)"
                        :y="labelY(i)"
                    >{{ step.card }}</text>
                </g>
            </g>
        </svg>

        <div v-if="failureInfo" class="attack-flow-viz-toast">
            <p class="attack-flow-viz-toast-title">{{ failureInfo.actionLabel }}失败</p>
            <p class="attack-flow-viz-toast-msg">
                {{ failureInfo.player }} 的{{ failureInfo.actionLabel }}失败了
            </p>
            <button class="attack-flow-viz-toast-btn" @click="emit('close')">关闭</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { OPPS_POSITIONS } from '@/game/slots';
import { useSquadStore } from '@/stores/squad';

type ChainAction = 'short-pass' | 'long-pass' | 'dribble' | 'shoot';

interface ChainStep {
    card: string;
    type: ChainAction;
    from: string;
    to: string;
    goal?: [number, number];
}

interface Point {
    from: [number, number];
    to: [number, number];
}

interface FailureInfo {
    player: string;
    actionLabel: string;
}

const props = defineProps<{
    chain: ChainStep[];
    visible: boolean;
}>();

const emit = defineEmits<{
    close: [];
}>();

const store = useSquadStore();
const activeIndex = ref(-1);
const failedIndex = ref<number | null>(null);
const failureInfo = ref<FailureInfo | null>(null);
const coords = ref<Point[]>([]);
let timer: ReturnType<typeof setInterval> | null = null;

const ACTION_LABEL: Record<ChainAction, string> = {
    'short-pass': '短传',
    'long-pass': '长传',
    dribble: '过人',
    shoot: '射门',
};

const LONG_PASS_DISTANCE_PENALTY_MAX = 30;
const LONG_PASS_BLOCKER_PENALTY = 15;
const LONG_PASS_BLOCKER_THRESHOLD = 25;
const LONG_PASS_MIN_RATE = 5;
const LONG_PASS_MAX_RATE = 95;
const FIELD_DIAGONAL = Math.hypot(300, 400);

function readPlayerCoords(name: string): [number, number] {
    const player = store.players.find((p) => p.name === name);
    if (!player) return [150, 200];
    const el = document.querySelector(
        `.game-home-field .player-pill[data-player-id="${player.id}"]`,
    );
    if (!el) return [150, 200];
    const field = document.querySelector('.game-home-field');
    if (!field) return [150, 200];
    const fieldRect = field.getBoundingClientRect();
    const pillRect = el.getBoundingClientRect();
    const cx = pillRect.left + pillRect.width / 2 - fieldRect.left;
    const cy = pillRect.top + pillRect.height / 2 - fieldRect.top;
    const svgX = (cx / fieldRect.width) * 300;
    const svgY = (cy / fieldRect.height) * 400;
    return [svgX, svgY];
}

function buildCoords(): Point[] {
    return props.chain.map((step) => ({
        from: readPlayerCoords(step.from),
        to: step.goal ?? readPlayerCoords(step.to),
    }));
}

function isFailed(i: number): boolean {
    return failedIndex.value === i;
}

function lineClass(i: number): Array<string | Record<string, boolean>> {
    const step = props.chain[i];
    return [
        'attack-flow-viz-line',
        { 'attack-flow-viz-line--goal': !!step.goal },
        { 'attack-flow-viz-line--fail': isFailed(i) },
    ];
}

function lineStyle(i: number): Record<string, string> {
    const len = lineLength(i) + 'px';
    if (isFailed(i)) {
        return { '--line-len': len, '--line-len-fail': len };
    }
    return { '--line-len': len };
}

function labelX(i: number): number {
    const [fx] = coords.value[i].from;
    const [tx] = coords.value[i].to;
    return (fx + tx) / 2;
}

function labelY(i: number): number {
    const [, fy] = coords.value[i].from;
    const [, ty] = coords.value[i].to;
    return (fy + ty) / 2 - 10;
}

function lineLength(i: number): number {
    const [fx, fy] = coords.value[i].from;
    const [tx, ty] = coords.value[i].to;
    return Math.hypot(tx - fx, ty - fy);
}

function arrowAngle(i: number): number {
    const [fx, fy] = coords.value[i].from;
    const [tx, ty] = coords.value[i].to;
    return Math.atan2(ty - fy, tx - fx) * (180 / Math.PI);
}

function arrowTransform(i: number): string {
    const [tx, ty] = coords.value[i].to;
    const angle = arrowAngle(i);
    return `translate(${tx}, ${ty}) rotate(${angle})`;
}

function ballPath(i: number): string {
    const [fx, fy] = coords.value[i].from;
    const [tx, ty] = coords.value[i].to;
    return `M0,0 L${tx - fx},${ty - fy}`;
}

function getAbilityValue(step: ChainStep): number | null {
    const player = store.players.find((p) => p.name === step.from);
    if (!player) return null;
    if (step.type === 'short-pass') return player.shortPass;
    if (step.type === 'long-pass') return player.longPass;
    if (step.type === 'shoot') return player.shooting;
    return null;
}

function rollStep(i: number): boolean {
    const step = props.chain[i];
    const value = getAbilityValue(step);
    if (value == null) return true;
    if (step.type === 'long-pass') {
        const fromCoord = readPlayerCoords(step.from);
        const toCoord = step.goal ?? readPlayerCoords(step.to);
        const finalRate = computeLongPassRate(fromCoord, toCoord, value);
        return Math.random() * 100 < finalRate;
    }
    return Math.random() * 100 < value;
}

function distanceToSegment(
    from: [number, number],
    to: [number, number],
    point: [number, number],
): number {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(point[0] - from[0], point[1] - from[1]);
    let t = ((point[0] - from[0]) * dx + (point[1] - from[1]) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = from[0] + t * dx;
    const projY = from[1] + t * dy;
    return Math.hypot(point[0] - projX, point[1] - projY);
}

function computeLongPassRate(
    from: [number, number],
    to: [number, number],
    baseRate: number,
): number {
    const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const distancePenalty =
        (distance / FIELD_DIAGONAL) * LONG_PASS_DISTANCE_PENALTY_MAX;
    const blockersCount = OPPS_POSITIONS.filter(
        (opp) => distanceToSegment(from, to, opp) < LONG_PASS_BLOCKER_THRESHOLD,
    ).length;
    const blockerPenalty = blockersCount * LONG_PASS_BLOCKER_PENALTY;
    return Math.max(
        LONG_PASS_MIN_RATE,
        Math.min(LONG_PASS_MAX_RATE, baseRate - distancePenalty - blockerPenalty),
    );
}

function failStep(i: number): void {
    const step = props.chain[i];
    failedIndex.value = i;
    failureInfo.value = {
        player: step.from,
        actionLabel: ACTION_LABEL[step.type],
    };
}

function clearTimer(): void {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

watch(
    () => props.visible,
    (val) => {
        if (val) {
            coords.value = buildCoords();
            activeIndex.value = -1;
            failedIndex.value = null;
            failureInfo.value = null;
            let idx = 0;
            timer = setInterval(() => {
                if (idx >= props.chain.length) {
                    clearTimer();
                    return;
                }
                if (!rollStep(idx)) {
                    failStep(idx);
                    activeIndex.value = idx;
                    clearTimer();
                    return;
                }
                activeIndex.value = idx;
                idx++;
            }, 1600);
        } else {
            activeIndex.value = -1;
            failedIndex.value = null;
            failureInfo.value = null;
            coords.value = [];
            clearTimer();
        }
    },
);

onBeforeUnmount(() => {
    clearTimer();
});
</script>

<style lang="less" scoped>
@import './AttackFlowViz.less';
</style>