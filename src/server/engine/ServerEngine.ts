import { ServerEngine as SE } from 'lance-gg';
import * as _ from 'lodash';

import { Generator } from 'Server/engine/Generator/Generator';
import { GameEngine } from 'Shared/engine/GameEngine';
import { Player } from 'Shared/engine/Player';
import { GridGraph } from 'Shared/Graph/GridGraph';


export class ServerEngine extends SE {

    gameEngine: GameEngine;
    currentMap: number[][];

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.serializer.registerClass(Player);
    }

    start() {
        super.start();
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        this.gameEngine.addPlayer(socket.playerId);
        const width = this.gameEngine.worldSettings.width;
        const height = this.gameEngine.worldSettings.height;
        const tiles = _.map(_.range(width), () => {
            return _.map(_.range(height), () => 0);
        });
        const numNoiseBodies = 4;
        const noiseBodies = Generator.noiseSplit(width, height, numNoiseBodies);
        _.forEach(noiseBodies, (body, i) => {
            _.forEach(body, ({ x, y }) => {
                tiles[x][y] = i;
            })
            if (i < noiseBodies.length - 1) {
                const G = new GridGraph(noiseBodies[i], { mode: 'diagonal' });
                const cellularBodies = G.cellularBodies(2, {
                    chanceToStartAlive: 0.7,
                    overpopRate: ((0.75 ** (noiseBodies.length - i)) * 2),
                    smoothing: i + 1,
                });
                _.forEach(cellularBodies.alive, ({ x, y }) => {
                    tiles[x][y] = 4;
                });
            }
        });
        this.currentMap = tiles;
        this.updateMap();
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        delete this.gameEngine.world.objects[playerId];
    }

    updateMap() {
        _.delay(() => {
            this.io.sockets.emit('mapUpdate', this.currentMap);
        }, 1000);
    }

}
