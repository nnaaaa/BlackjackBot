
import { BotInputMessage, ButtonStyle, MarkdownBuilder, MessageAction, MessageButton,MemberEntity } from 'disney.js'
import {Deck} from './deck'
import {Hand} from './hand'

export enum GameResult {
    TimeUp = -2,
    Lost = -1,
    Running = 0,
    Won = 1,
    Tie = 2,
    // BlackJack = 3,
}

export class GameState {
    private _deck: Deck
    private _dealerHand: Hand
    private _playerHand: Hand

    private _action!: MessageAction
    /**
     * -2 - Time-up
     * -1 - Lost
     * 0 - Default (Game is running)
     * 1 - Won
     * 2 - Tie
     **/
    private _result = GameResult.Running
    private _overtime = 1000 * 60

    private _timestamp = Date.now() // game starting time

    private _actionButtonHit: MessageButton
    private _actionButtonStand: MessageButton

    constructor(private _author: MemberEntity, private _bet: number, deck: Deck) {
        this._deck = deck
        this._dealerHand = new Hand(this._deck.draw(), this._deck.draw(true))
        this._playerHand = new Hand(this._deck.draw(), this._deck.draw())

        this._actionButtonHit = new MessageButton()
            .setStyle(ButtonStyle.PRIMARY)
            .setName('Hit')
            .setCustomId('hit')

        this._actionButtonStand = new MessageButton()
            .setStyle(ButtonStyle.ERROR)
            .setName('Stand')
            .setCustomId('stand')
        
        this._action = new MessageAction()

        let BlackJack = 21,
            DoubleAce = 22
        let checkPlayer = 1
        let checkDealer = 1
        if (this._playerHand.getValue() == BlackJack) {
            this._dealerHand.cards[1].isHidden = false
            checkPlayer = 9
        }
        if (this._playerHand.getValue() == DoubleAce) {
            this._dealerHand.cards[1].isHidden = false
            checkPlayer = 10
        }
        if (this._dealerHand.getValue() == BlackJack) {
            this._dealerHand.cards[1].isHidden = false
            checkDealer = 9
        }
        if (this._dealerHand.getValue() == DoubleAce) {
            this._dealerHand.cards[1].isHidden = false
            checkDealer = 10
        }
        if (checkPlayer > checkDealer) {
            this._result = GameResult.Won
        } else if (checkPlayer < checkDealer) {
            this._result = GameResult.Lost
        } else if (checkPlayer == checkDealer && checkPlayer != 1) {
            this._result = GameResult.Tie
        }
    }

    public isOver(): boolean {
        return this._result != GameResult.Running
    }
    public isOverTime() {
        return Date.now() - this._timestamp > this._overtime
    }

    public getAction() {
        this._action.clearButton()
    
        this._action
            .addButton(this._actionButtonHit)
            .addButton(this._actionButtonStand)
        return this._action
    }

    public getContent(): string {
        try {
            // const dollar = currency(this._bet).format()
            const {nickname} = this._author

            let message = MarkdownBuilder.tag`
                ${MarkdownBuilder.italic(
                    `Response within ${this._overtime / 1000}s`
                )}\n
                ${MarkdownBuilder.bold('Dealer')}\n
                ${this._dealerHand.print()}\n
                ${MarkdownBuilder.bold(`${nickname}`)}\n
                ${this._playerHand.print()}\n
            `

            if (this._result != GameResult.Running) {
                this._actionButtonHit.setDisabled(true)
                this._actionButtonStand.setDisabled(true)
            }

            if (this._result == GameResult.Won) {
                message += '\n\n' + MarkdownBuilder.bold('You won')
            } else if (this._result == GameResult.Lost) {
                message += '\n\n' + MarkdownBuilder.bold('You lost')
            } else if (this._result == GameResult.Tie) {
                message += '\n\n' + MarkdownBuilder.bold('You tied with dealer')
            } else if (this._result == GameResult.TimeUp) {
                message += '\n\n' + MarkdownBuilder.bold('You lost')
            }

            // message.setDescription(remind)
            // message.setColor(color)

            return message
        } catch (e) {
            console.log(e)
            return ''
        }
    }

    public getMessage(): BotInputMessage {
        return {
            content: this.getContent(),
            action: this.getAction(),
        }
    }

    // player action HIT
    public hit(): void {
        if (!this.isOverTime()) {
            // check for time-up
            this._playerHand.cards.push(this._deck.draw(false))

            // check for player blackjack or bust
            if (this._playerHand.getValue() >= 21) this.stand()

            // check for player magic five
            if (this._playerHand.cards.length == 5) this.stand()
        } else this._result = GameResult.TimeUp
    }

    // player action STAND
    public stand(): void {
        if (!this.isOverTime()) {
            // check for time-up
            // reveal the dealer's second card
            this._dealerHand.cards[1].isHidden = false

            // get a card for dealer
            // AI ver 1
            while (this._dealerHand.getValue() < 16) {
                // dealer hit's in case of value less than 17
                this._dealerHand.cards.push(this._deck.draw(false))
                if (this._dealerHand.cards.length == 5) break
            }
            if (
                (this._dealerHand.getValue() == 16 ||
                    this._dealerHand.getValue() == 17) &&
                this._dealerHand.cards.length < 5
            ) {
                if (this._playerHand.cards.length <= 3) {
                    this._dealerHand.cards.push(this._deck.draw(false))
                } else {
                    let ran = Math.floor(Math.random() * 10)
                    if (ran == 3 || ran == 7) {
                        this._dealerHand.cards.push(this._deck.draw(false))
                    }
                }
            }

            if (this._playerHand.getValue() < 16) {
                this._result = GameResult.Lost
            }
            // check for dealer
            if (
                this._dealerHand.getValue() > 21 &&
                this._playerHand.getValue() > 21
            )
                this._result = GameResult.Tie
            else if (
                this._dealerHand.getValue() > 21 &&
                this._playerHand.getValue() <= 21
            )
                this._result = GameResult.Won
            else if (
                this._dealerHand.getValue() <= 21 &&
                this._playerHand.getValue() > 21
            )
                this._result = GameResult.Lost
            // all player <= 21
            else {
                const winnerIsLowerValue = () => {
                    if (
                        this._playerHand.getValue() <
                        this._dealerHand.getValue()
                    )
                        this._result = GameResult.Won
                    else if (
                        this._playerHand.getValue() >
                        this._dealerHand.getValue()
                    )
                        this._result = GameResult.Lost
                    else this._result = GameResult.Tie
                }
                if (this._playerHand.cards.length == 5) {
                    if (this._dealerHand.cards.length == 5) winnerIsLowerValue()
                    else this._result = GameResult.Won
                } else if (this._dealerHand.cards.length == 5) {
                    if (this._playerHand.cards.length == 5) {
                        winnerIsLowerValue()
                    } else this._result = GameResult.Lost
                }
                // dealer has not bust, so compare the player and the dealer
                else if (
                    this._playerHand.getValue() > this._dealerHand.getValue()
                )
                    this._result = GameResult.Won
                else if (
                    this._playerHand.getValue() < this._dealerHand.getValue()
                )
                    this._result = GameResult.Lost
                else if (
                    this._playerHand.getValue() == this._dealerHand.getValue()
                )
                    this._result = GameResult.Tie
            }
        } else this._result = GameResult.TimeUp
    }

    public get result() {
        return this._result
    }

    public get overTime() {
        return this._overtime
    }

    public get action() {
        return this._action
    }
}
