

import { Deck } from "./deck";
import { GameState } from "./state";
import { MessageClient } from 'disney.js';


class Blackjack extends MessageClient{
    async bet(betNumber: number) {
        const gameState = new GameState(
            this.message.data.author,
            betNumber,
            new Deck()
        )

        const message = await this.message.send(gameState.getMessage())

        gameState.action.onButtonClick(async (button) => {
            if (button.customId === 'hit') {
                gameState.hit()
            }
            if (button.customId === 'stand') {
                gameState.stand()
            }

            message.edit(gameState.getMessage())
            if (gameState.isOver()) {
                console.log("game over")
            }
        })
    }
}

const client = new Blackjack()

client.login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3RJZCI6Ijg4MjQwZTA2LWMyYzMtNDY4ZS04MGI4LTZiNmMxYjk5YmI4OCIsImlhdCI6MTY1ODMyMDE0OH0.KBc0W91UxsHGfQhzwJplIZ3dAL_YQm7DKgdXi3fca-Q');

