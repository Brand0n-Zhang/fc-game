import type { Line, Slot } from './types'

export const lineOf = (position: Slot): Line => {
    if (position === 'gk') return 'gk'
    if (position === 'lb' || position === 'lcb' || position === 'rcb' || position === 'rb') return 'def'
    if (position === 'lcm' || position === 'cm' || position === 'rcm') return 'mid'
    return 'fwd'
}

export const slotOrder: Record<Line, Slot[]> = {
    gk: ['gk'],
    def: ['lb', 'lcb', 'rcb', 'rb'],
    mid: ['lcm', 'cm', 'rcm'],
    fwd: ['lw', 'st', 'rw'],
}
