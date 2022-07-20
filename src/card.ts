import { MarkdownBuilder } from "disney.js"

export interface Suit {
    name: string
    label: string
}

export interface Rank {
    label: string
    value: number
}

export class Card {
    private _suit: Suit
    private _rank: Rank
    private _isHidden: boolean
    private _isAce: boolean

    constructor(suit: Suit, rank: Rank, isHidden: boolean) {
        this._suit = suit
        this._rank = rank
        this._isHidden = isHidden
        this._isAce = this._rank.label == '1' ? true : false
    }

    public get suit(): Suit {
        return this._suit
    }

    public get rank(): Rank {
        return this._rank
    }

    public get isHidden(): boolean {
        return this._isHidden
    }
    public set isHidden(h: boolean) {
        this._isHidden = h
    }

    public get isAce(): boolean {
        return this._isAce
    }

    public print(): string {
        const alias = this._isHidden
            ? '🔒'
            : MarkdownBuilder.inlineCode(this._rank.label + this._suit.label)
        
        return alias
    }

    public static readonly Rank: Rank[] = [
        {label: 'A', value: 11}, // this will be adjusted later
        {label: '2', value: 2},
        {label: '3', value: 3},
        {label: '4', value: 4},
        {label: '5', value: 5},
        {label: '6', value: 6},
        {label: '7', value: 7},
        {label: '8', value: 8},
        {label: '9', value: 9},
        {label: '10', value: 10},
        {label: 'J', value: 10},
        {label: 'Q', value: 10},
        {label: 'K', value: 10},
    ]

    public static readonly Suit: Suit[] = [
        {name: 's', label: '♠'},
        {name: 'h', label: '♥'},
        {name: 'c', label: '♣'},
        {name: 'd', label: '♦'},
    ]
}
