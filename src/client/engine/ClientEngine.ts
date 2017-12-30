import { ClientEngine as CE } from 'lance-gg';
import { Renderer } from 'Client/renderer/Renderer';
import { GameEngine } from 'Shared/engine/GameEngine';
import { Controller } from 'Client/engine/Controller';

import { Player } from 'Shared/engine/Player';

export class ClientEngine extends CE {

    renderer: Renderer;
    gameEngine: GameEngine;
    private controller: Controller;

    constructor(gameEngine, options) {

        super(gameEngine, options, Renderer);

        this.gameEngine.on('client__preStep', this.preStep.bind(this));

        this.serializer.registerClass(Player);

        this.controller = new Controller();

    }

    preStep() {

        if (this.controller.keyStates.up.isDown) {
            this.sendInput('up', { movement: true });
        }

        if (this.controller.keyStates.down.isDown) {
            this.sendInput('down', { movement: true });
        }

        if (this.controller.keyStates.left.isDown) {
            this.sendInput('left', { movement: true });
        }

        if (this.controller.keyStates.right.isDown) {
            this.sendInput('right', { movement: true });
        }

        if (this.controller.keyStates.space.isDown) {
            this.sendInput('space', { movement: true });
        }
    }

    connect() {
        return super.connect().then(() => {

            this.socket.on('mapUpdate', (e) => {
                this.gameEngine.map = e;
                this.renderer.setReady();
            });

        });
    }

}