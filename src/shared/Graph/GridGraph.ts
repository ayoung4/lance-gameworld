import { Graph } from './Graph';
import * as  _ from 'lodash';

export interface IPositionlike {
    x: number;
    y: number;
}

export class GridPosition implements IPositionlike {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    equals(other: IPositionlike): boolean {
        return this.x === other.x && this.y === other.y;
    }
    compare(other: IPositionlike): boolean {
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

export class SpacedGridPosition extends GridPosition {
    get neighbors(): SpacedGridPosition[] {
        return [
            new SpacedGridPosition(this.x + 2, this.y),
            new SpacedGridPosition(this.x - 2, this.y),
            new SpacedGridPosition(this.x, this.y + 2),
            new SpacedGridPosition(this.x, this.y - 2),
        ];
    }
    wallBetween(other: SpacedGridPosition): GridPosition {
        if (this.x === other.x) {
            if (this.y < other.y) {
                return new GridPosition(this.x, this.y + 1);
            } else {
                return new GridPosition(this.x, this.y - 1);
            }
        } else {
            if (this.x < other.x) {
                return new GridPosition(this.x + 1, this.y);
            } else {
                return new GridPosition(this.x - 1, this.y);
            }
        }
    }
}

export class DiagonalSpacedGridPosition extends SpacedGridPosition {
    get neighbors(): SpacedGridPosition[] {
        return [
            new SpacedGridPosition(this.x + 2, this.y),
            new SpacedGridPosition(this.x - 2, this.y),
            new SpacedGridPosition(this.x, this.y + 2),
            new SpacedGridPosition(this.x, this.y - 2),
            new SpacedGridPosition(this.x + 2, this.y + 2),
            new SpacedGridPosition(this.x - 2, this.y - 2),
            new SpacedGridPosition(this.x + 2, this.y - 2),
            new SpacedGridPosition(this.x - 2, this.y + 2),
        ];
    }
    wallBetween(other: SpacedGridPosition): GridPosition {
        if (this.x === other.x) {
            if (this.y < other.y) {
                return new GridPosition(this.x, this.y + 1);
            } else {
                return new GridPosition(this.x, this.y - 1);
            }
        } else {
            if (this.x < other.x) {
                return new GridPosition(this.x + 1, this.y);
            } else {
                return new GridPosition(this.x - 1, this.y);
            }
        }
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
    constructor(positions: IPositionlike[], options?: { mode: gridModes }) {

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

export class SpacedGridGraph extends Graph<SpacedGridPosition> {
    constructor(positions: IPositionlike[], options?: { mode: gridModes }) {

        const opts: { mode: gridModes } = options;
        _.extend({
            mode: 'default',
        }, opts);

        super();

        _.forEach(positions, ({ x, y }) => {
            if (x % 2 && y % 2) {
                if (!!opts && !!opts.mode && opts.mode === 'diagonal') {
                    this.addValue(new DiagonalSpacedGridPosition(x, y));
                } else {
                    this.addValue(new SpacedGridPosition(x, y));
                }
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