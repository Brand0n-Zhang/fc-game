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
                        :class="[
                            'attack-flow-viz-line',
                            { 'attack-flow-viz-line--goal': step.goal },
                        ]"
                        :x1="coords[i].from[0]"
                        :y1="coords[i].from[1]"
                        :x2="coords[i].to[0]"
                        :y2="coords[i].to[1]"
                        :style="{ '--line-len': lineLength(i) + 'px' }"
                    />

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

                    <text
                        class="attack-flow-viz-label"
                        :x="labelX(i)"
                        :y="labelY(i)"
                    >{{ step.card }}</text>
                </g>
            </g>
        </svg>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useSquadStore } from '@/stores/squad';

interface ChainStep {
    card: string;
    from: string;
    to: string;
    goal?: [number, number];
}

interface Point {
    from: [number, number];
    to: [number, number];
}

const props = defineProps<{
    chain: ChainStep[];
    visible: boolean;
}>();

const store = useSquadStore();
const activeIndex = ref(-1);
const coords = ref<Point[]>([]);
let timer: ReturnType<typeof setInterval> | null = null;

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

watch(
    () => props.visible,
    (val) => {
        if (val) {
            coords.value = buildCoords();
            activeIndex.value = -1;
            let idx = 0;
            timer = setInterval(() => {
                activeIndex.value = idx;
                idx++;
                if (idx >= props.chain.length) {
                    clearInterval(timer!);
                    timer = null;
                }
            }, 1600);
        } else {
            activeIndex.value = -1;
            coords.value = [];
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
    },
);

onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});
</script>

<style lang="less" scoped>
@import './AttackFlowViz.less';
</style>
