import { Graph } from '../../Graph';
import { GraphTestHelpers } from '../../GraphTestHelpers';
import * as _ from 'lodash';
import { IPositionlike, GridPosition } from '../../GridGraph';

class Room {
    x: number;
    y: number;
    w: number;
    h: number;
    points: GridPosition[];
    innerPoints: GridPosition[];
    walls: GridPosition[];
    position: IPositionlike;
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.points = _.reduce(_.range(this.x, this.x + this.w), (l, x) => {
            return _.concat(l, _.map(_.range(this.y, this.y + this.h), (y) => new GridPosition(x, y)));
        }, []);
        this.walls = _.concat(
            _.map(_.range(this.x, this.x + this.w), (x) => new GridPosition(x, this.y)),
            _.map(_.range(this.x, this.x + this.w), (x) => new GridPosition(x, this.y + this.h - 1)),
            _.map(_.range(this.y + 1, this.y + this.h - 1), (y) => new GridPosition(this.x, y)),
            _.map(_.range(this.y + 1, this.y + this.h - 1), (y) => new GridPosition(this.x + this.w - 1, y)),
        );
        this.innerPoints = _.filter(this.points, (w) => !_.find(this.walls, w));
    }
    equals(other: Room) {
        return this.x === other.x && this.y === other.y && this.w === other.w && this.h === other.h;
    }
    compare(other: Room) {
        const inter = _.intersectionWith(this.innerPoints, other.innerPoints, (a, b) => a.equals(b));
        return inter.length > 0;
    }
    overlaps(other: Room) {
        const inter = _.intersectionWith(this.innerPoints, other.innerPoints, (a, b) => a.equals(b));
        return inter.length > 0;
    }
}

const directions = ['N', 'W', 'S', 'E'];

describe('L System Algorithms', function () {
    it('can compute a algea simulation of depth 3', function () {

        const G = new Graph<GraphTestHelpers.CollisionlessTestData>();
        G.addValue(new GraphTestHelpers.CollisionlessTestData('A'));
        // algea simulation: https://en.wikipedia.org/wiki/L-system#Example_1:_Algae
        G.lExpand(3, (d, i) => {
            const successors = [];
            _.forEach(d.val, (char) => {
                if (char === 'A') {
                    successors.push(new GraphTestHelpers.CollisionlessTestData(`AB`));
                } else if (char === 'B') {
                    successors.push(new GraphTestHelpers.CollisionlessTestData(`A`));
                }
            });
            const successorString = _.reduce(successors, (str, s) => `${str}${s.val}`, '');
            console.log(d.val, '->', successorString);
            return successors;
        });

    });
    it('can generate rooms', function () {
        const G = new Graph<Room>();
        const width = 21;
        const height = 101;
        G.addValue(new Room(_.floor(width / 2) - 1, _.floor(height / 2) - 1, 7, 21));
        G.lExpand(2, (d, i) => {
            const possibleNeighbors = [];
            const width = _.random(3, d.w);
            const height = _.random(3, d.h);
            _.forEach(directions, (direction) => {
                let pivot;
                switch (direction) {
                    case 'N':
                        pivot = new GridPosition(_.floor(_.random(d.x - (height / 3), d.x + (height / 3))), d.y);
                        possibleNeighbors.push(new Room(pivot.x, pivot.y - height + 1, width, height));
                        break;
                    case 'S':
                        pivot = new GridPosition(_.floor(_.random(d.x - (height / 3), d.x + (height / 3))), d.y + d.h - 1);
                        possibleNeighbors.push(new Room(pivot.x, pivot.y, width, height));
                        break;
                    case 'E':
                        pivot = new GridPosition(d.x, _.floor(_.random(d.y - (width / 3), d.y + (width / 3))));
                        possibleNeighbors.push(new Room(pivot.x - width + 1, pivot.y, width, height));
                        break;
                    case 'W':
                        pivot = new GridPosition(d.x + d.w - 1, _.floor(_.random(d.y - (width / 3), d.y + (width / 3))));
                        possibleNeighbors.push(new Room(pivot.x, pivot.y, width, height));
                        break;
                }
            });
            const successors = [];
            _.forEach(possibleNeighbors, (n) => {
                let overlaps = false;
                _.forEach(G.values, (other) => {
                    if (n.overlaps(other)) {
                        overlaps = true;
                    }
                });
                if (!overlaps) {
                    successors.push(n);
                }
            });
            return successors
        });
        
        const walls = _.reduce(_.map(G.values, (r) => r.walls), (l, r) => [...l, ...r], []);
        GraphTestHelpers.renderAscii(width, height, walls);
    });
});