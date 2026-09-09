export type Slot =
    | 'gk'
    | 'lb'
    | 'lcb'
    | 'rcb'
    | 'rb'
    | 'lcm'
    | 'cm'
    | 'rcm'
    | 'lw'
    | 'st'
    | 'rw'

export interface Player {
    id: number
    name: string
    defaultSlot: Slot
    shortPass: number
    longPass: number
    shooting: number
    saving: number
}
