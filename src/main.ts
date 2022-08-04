

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
        gameState.setMessage(this.message)

        const message = await this.message.send(gameState.getMessage())

        gameState.setMessage(message)

        gameState.message.action.onButtonClick(async (interaction) => {
            if (interaction.button.customId === 'hit') {
                gameState.hit()
            }
            if (interaction.button.customId === 'stand') {
                gameState.stand()
            }

            const editedMessage = await message.edit(gameState.getMessage())
            gameState.setMessage(editedMessage)
            if (gameState.isOver()) {
                console.log("game over")
            }
        })
    }
}

const client = new Blackjack()

client.login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3RJZCI6Ijg4MjQwZTA2LWMyYzMtNDY4ZS04MGI4LTZiNmMxYjk5YmI4OCIsImlhdCI6MTY1ODMyMDE0OH0.KBc0W91UxsHGfQhzwJplIZ3dAL_YQm7DKgdXi3fca-Q');

