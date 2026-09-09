import type { Slot } from '@/types/playerType'

export const SLOT_COORDS: Record<Slot, [number, number]> = {
    gk: [150, 360],
    lb: [50, 290],
    lcb: [110, 290],
    rcb: [190, 290],
    rb: [250, 290],
    lcm: [95, 200],
    cm: [150, 200],
    rcm: [205, 200],
    lw: [60, 110],
    st: [150, 110],
    rw: [240, 110],
}

export function slotDistance(a: Slot, b: Slot): number {
    const [ax, ay] = SLOT_COORDS[a]
    const [bx, by] = SLOT_COORDS[b]
    return Math.hypot(ax - bx, ay - by)
}

export function nearestTeammates(from: Slot, allSlots: Slot[], count: number): Slot[] {
    return [...allSlots]
        .filter((s) => s !== from)
        .sort((a, b) => slotDistance(from, a) - slotDistance(from, b))
        .slice(0, count)
}

// Opponent lineup (Arsenal 4-4-3), SVG coords. Order matches Game.vue render order.
export const OPPS_POSITIONS: Array<[number, number]> = [
    // gk
    [150, 30],
    // def (LB, LCB, RCB, RB)
    [50, 100], [110, 100], [190, 100], [250, 100],
    // mid (4)
    [60, 180], [120, 180], [180, 180], [240, 180],
    // fwd (LW, ST, RW)
    [60, 270], [150, 270], [240, 270],
]

// Opponent interception values, parallel to OPPS_POSITIONS (gk first, then def/mid/fwd).
// Used by pass / shoot blocker formula: each defender in path reduces rate by interception/100 × penalty × distRatio.
export const OPPS_INTERCEPTIONS: number[] = [
    50, // gk
    50, 50, 50, 50, // def
    50, 50, 50, 50, // mid
    50, 50, 50, // fwd
]

// Opponent saving values, parallel to OPPS_POSITIONS (gk first, then def/mid/fwd).
// Used by shoot formula: GK saving penalty scaled by distance ratio.
export const OPPS_SAVING: number[] = [
    65, // gk: Raya
    0, 0, 0, 0, // def
    0, 0, 0, 0, // mid
    0, 0, 0, // fwd
]
