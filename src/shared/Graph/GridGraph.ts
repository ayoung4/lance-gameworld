import { Graph } from './Graph';
import * as  _ from 'lodash';

export interface IPositionLike {
    x: number;
    y: number;
}

export class GridPosition implements IPositionLike {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    equals(other: GridPosition): boolean {
        return this.x === other.x && this.y === other.y;
    }
    compare(other: GridPosition): boolean {
        return this.x > other.x && this.y > other.y;
    }
    get neighbors(): GridPosition[] {
        return [
            new GridPosition(this.x + 1, this.y),
            new GridPosition(this.x - 1, this.y),
            new GridPosition(this.x, this.y + 1),
            new GridPosition(this.x, this.y - 1),
        ];
    }
}

export class DiagonalGridPosition extends GridPosition {
    get neighbors(): GridPosition[] {
        return [
            new GridPosition(this.x + 1, this.y),
            new GridPosition(this.x - 1, this.y),
            new GridPosition(this.x, this.y + 1),
            new GridPosition(this.x, this.y - 1),
            new GridPosition(this.x + 1, this.y + 1),
            new GridPosition(this.x - 1, this.y - 1),
            new GridPosition(this.x + 1, this.y - 1),
            new GridPosition(this.x - 1, this.y + 1),
        ];
    }
}

type gridModes = 'default' | 'diagonal';

export class GridGraph extends Graph<GridPosition> {
    constructor(positions: IPositionLike[], options?: { mode: gridModes }) {

        const opts: { mode: gridModes } = options;
        _.extend({
            mode: 'default',
        }, opts);

        super();

        _.forEach(positions, ({ x, y }) => {
            if (!!opts && !!opts.mode && opts.mode === 'diagonal') {
                this.addValue(new DiagonalGridPosition(x, y));
            } else {
                this.addValue(new GridPosition(x, y));
            }
        });

        _.forEach(this.vertices, (v) => {
            _.forEach(v.neighbors, (w) => {
                if (_.findIndex(this.vertices, (v) => v.equals(w)) !== -1) {
                    this.addEdge(v, w);
                }
            });
        });

    }
}