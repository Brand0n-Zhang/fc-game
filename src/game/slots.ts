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
