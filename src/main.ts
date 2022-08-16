

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

client.login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3RJZCI6IjVkMDk1N2I4LWE0ODMtNDFiNy1hNWEzLTJjNTg4OWZiNzVhMCIsImlhdCI6MTY2MDQ4MDU4MH0.WHTgo5rEW18hdxhM_VnQY5oUr4yTFqIBv-0_0P__7RQ');

