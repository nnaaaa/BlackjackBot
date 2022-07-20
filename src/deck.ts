import {Card} from './card'

export class Deck {
    private _cards: Card[] = []
    constructor() {
        for (let r in Card.Rank) {
            for (let s in Card.Suit) {
                const rank = Card.Rank[r] // value between 0 -> 12
                const suit = Card.Suit[s] // value between 0 -> 3
                this._cards.push(
                    new Card(suit, rank, false)
                )
            }
        }
        this.shuffle()
    }
    public shuffle() {
        for (let i = this._cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]]
        }
    }
    public draw(isHidden = false) {
        const card = this._cards.shift() as Card

        card.isHidden = isHidden
        return card
    }
}
