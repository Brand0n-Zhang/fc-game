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

export type Line = 'gk' | 'def' | 'mid' | 'fwd'

export interface Player {
    id: number
    name: string
    position: Slot
    shortPass: number
    longPass: number
    shooting: number
}
