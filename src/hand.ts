import {Card} from './card'

export class Hand {
    private _cards: Card[]

    constructor(_card0: Card, _card1: Card) {
        this._cards = [_card0, _card1]
    }

    public get cards(): Card[] {
        return this._cards
    }

    public getValue(): number {
        let total: number = 0
        let aceStack: Card[] = []

        this._cards.map((card) => {
            if (card.isAce) aceStack.push(card)
            total += card.rank.value
        })

        if ((total == 21 || total == 22) && this._cards.length == 2)
            return total
        if (this._cards.length == 3 && total == 22 && aceStack.length != 0) {
            total = 21
            return total
        }
        if (total > 21 || this._cards.length > 3) {
            // this is for dynamically changing the value of Ace Card
            for (let i in aceStack) {
                console.log(i)
                total -= 10
                if (total <= 21) return total
            }
        }

        return total
    }

    public print(): string {
        let doShowValue: boolean = true // if false, the value of hand won't be displayed
        let x: string = this._cards[0].print()

        for (var i = 1; i < this.cards.length; i++) {
            x += ' '
            x += this.cards[i].print()

            if (this.cards[i].isHidden) doShowValue = false
        }
        if (doShowValue) x += ' (' + this.getValue() + ')'
        else x += ' (xx)'
        return x
    }
}
