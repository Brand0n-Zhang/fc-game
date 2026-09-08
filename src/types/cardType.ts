export type AttackCardType = 'short-pass' | 'dribble' | 'long-pass'
export type DefenseCardType = 'save' | 'tackle' | 'clear' | 'block'
export type CardType = AttackCardType | DefenseCardType
export type DeckSide = 'attack' | 'defense'

export interface LocalizedName {
    zh: string
    en: string
}

export interface Card {
    id: number
    name: LocalizedName
    type: CardType
    cost: number
}

export interface CardMeta {
    name: LocalizedName
    cost: number
}
