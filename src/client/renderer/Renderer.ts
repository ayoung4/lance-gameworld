import { render } from 'lance-gg';
import { 
    GameEngine,
    terrainTypes,
    barrierTypes,
} from 'Shared/engine/GameEngine';

import * as p5 from 'p5';
import * as _ from 'lodash';

const RES = 20;
const RENDER_MODES = {
    world: 0,
    player: 1,
}
const RENDER_MODE = RENDER_MODES.world;

interface IColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

const colors = {
    darkBrown: { r: 56, g: 53, b: 44 },
    brown: { r: 164, g: 183, b: 130 },
    darkGreen: { r: 66, g: 122, b: 67 },
    lightGreen: { r: 195, g: 214, b: 158 },
    green: { r: 159, g: 193, b: 110 },
    blue: { r: 72, g: 105, b: 206 },
}

const viewWidth = 50;
const viewHeight = 30;

export class Renderer extends render.Renderer {

    renderer: p5Sketch;
    gameEngine: GameEngine;
    ready: boolean

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.ready = false;
    }

    setReady() {
        this.renderer = new p5((sketch) => {
            this.renderer = sketch;
            sketch.setup = () => {
                if (RENDER_MODE === RENDER_MODES.player) {
                    sketch.createCanvas(viewWidth * RES, viewHeight * RES);
                } else {
                    sketch.createCanvas(this.gameEngine.map.length * RES, this.gameEngine.map[0].length * RES);
                }
            }
        });
        this.ready = true;
    }

    draw() {
        super.draw();
        if (this.ready) {
            if (RENDER_MODE === RENDER_MODES.player) {
                const playerId = this.clientEngine.playerId;
                const player = this.gameEngine.world.getPlayerObject(playerId) as any;
                this.drawView(player.position, this.gameEngine.map);
            } else {
                this.drawTiles(this.gameEngine.map);
            }
        }
    }

    setColor({ r, g, b, a }: IColor) {
        this.renderer.fill(r, g, b, a | 255);
    }

    drawView(position: { x: number, y: number }, tiles: number[][]) {
        const left = position.x - ~~(viewWidth / 2);
        const right = position.x + ~~(viewWidth / 2);
        const bottom = position.y - ~~(viewHeight / 2);
        const top = position.y + ~~(viewHeight / 2);
        const leftBound = left > 0 ? left : 0;
        const rightBound = right < tiles.length ? right : tiles.length - 1;
        const bottomBound = bottom > 0 ? bottom : 0
        const topBound = top < tiles[0].length ? top : tiles[0].length - 1
        _.forEach(_.range(leftBound, rightBound), (x, i) => {
            _.forEach(_.range(bottomBound, topBound), (y, j) => {
                if (tiles[x][y] === terrainTypes.grass) {
                    this.setColor(colors.green)
                } else if (tiles[x][y] === terrainTypes.forest) {
                    this.setColor(colors.lightGreen)
                } else if (tiles[x][y] === terrainTypes.mountain) {
                    this.setColor(colors.brown)
                } else if (tiles[x][y] === barrierTypes.rock) {
                    this.setColor(colors.darkBrown)
                } else if (tiles[x][y] === barrierTypes.tree) {
                    this.setColor(colors.darkGreen)
                }
                this.renderer.noStroke();
                this.renderer.rect(i * RES, j * RES, RES, RES);
                this.gameEngine.world.forEachObject((id, obj: any) => {
                    if (x === obj.position.x && y === obj.position.y) {
                        this.renderer.fill(255, 0, 0);
                        this.renderer.rect(i * RES, j * RES, RES, RES);
                    }
                });
            });
        });
    }

    drawTiles(tiles: number[][]) {
        _.forEach(tiles, (row, x) => {
            _.forEach(row, (tile, y) => {
                if (tiles[x][y] === terrainTypes.grass) {
                    this.setColor(colors.green)
                } else if (tiles[x][y] === terrainTypes.forest) {
                    this.setColor(colors.lightGreen)
                } else if (tiles[x][y] === terrainTypes.mountain) {
                    this.setColor(colors.brown)
                } else if (tiles[x][y] === barrierTypes.rock) {
                    this.setColor(colors.darkBrown)
                } else if (tiles[x][y] === barrierTypes.tree) {
                    this.setColor(colors.darkGreen)
                }
                this.renderer.noStroke();
                this.renderer.rect(x * RES, y * RES, RES, RES);
            });
        });
    }

}