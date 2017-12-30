import { Graph } from './Graph';
import * as shortid from 'shortid';
import { expect } from 'chai';
import * as _ from 'lodash';
import { performance } from 'perf_hooks';
import { GridPosition, DiagonalGridPosition, GridGraph } from './GridGraph';

class TestData {
    val: any;
    constructor(val: any) {
        this.val = val;
    }
    equals(other: TestData): boolean {
        return other.val === this.val;
    }
    compare(other: TestData): boolean {
        return true;
    }
}

const euclideanDistance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const getXYPairs = (width: number, height: number) => _.reduce(_.range(width), (l, x) => {
    const xPositions = _.map(_.range(height), (y) => ({ x, y }));
    return [...l, ...xPositions];
}, []);

const getGridPositions = (width: number, height: number) => _.reduce(_.range(width), (l, x) => {
    const xPositions = _.map(_.range(height), (y) => new GridPosition(x, y));
    return [...l, ...xPositions];
}, []);

const getDiagonalPositions = (width: number, height: number) => _.reduce(_.range(width), (l, x) => {
    const xPositions = _.map(_.range(height), (y) => new DiagonalGridPosition(x, y));
    return [...l, ...xPositions];
}, []);

describe('Graph', function () {
    it('constructs an empty graph', function () {
        const G = new Graph<TestData>();
        expect(G).to.not.be.undefined;
    });
    it('adds some data to it', function () {
        const G = new Graph<TestData>();
        const numData = _.random(10);
        const data = _.map(_.range(numData), (i) => new TestData(i));
        _.forEach(data, (d) => {
            G.addValue(d);
        });
        expect(G.size).to.equal(numData);
    });
    it('adds some edges', function () {
        const G = new Graph<TestData>();
        const numData = _.random(3, 10);
        const data = _.map(_.range(numData), (i) => new TestData(i));
        _.forEach(data, (d) => {
            G.addValue(d);
        });
        _.forEach(_.range(1, data.length - 1), (i) => {
            G.addEdge(data[i], data[i - 1]);
        });
        expect(G.associations).to.equal(numData - 2);
    });
    it('can construct a represention a 50 x 50 grid', function () {
        const width = 50;
        const height = 50;
        const G = new Graph<GridPosition>();
        const positions = getGridPositions(width, height);
        _.forEach(positions, (position) => {
            G.addValue(position);
        });
        _.forEach(G.values, (v) => {
            _.forEach(v.neighbors, (w) => {
                if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
                    G.addEdge(v, w);
                }
            });
        });
        const allNodes = width * height;
        const twoEdges = 4;
        const threeEdges = ((height - 2) * 2) + ((width - 2) * 2);
        const fourEdges = allNodes - threeEdges - twoEdges;
        expect(G.size).to.equal(allNodes);
        expect(G.associations).to.equal((2 * twoEdges) + (3 * threeEdges) + (4 * fourEdges));
    });
    it('GridGraph constructs a complete grid', () => {
        const width = 50;
        const height = 50;
        const positions = getXYPairs(width, height);
        const G = new GridGraph(positions);
        const allNodes = width * height;
        const twoEdges = 4;
        const threeEdges = ((height - 2) * 2) + ((width - 2) * 2);
        const fourEdges = allNodes - threeEdges - twoEdges;
        expect(G.size).to.equal(allNodes);
        expect(G.associations).to.equal((2 * twoEdges) + (3 * threeEdges) + (4 * fourEdges));

    })
    describe('can flood fill to find disconnected components', function () {
        it('returns a list of all contained vertices wrapped in a list when called on a connected graph', function () {
            const width = 10;
            const height = 10;
            const G = new Graph<GridPosition>();
            const positions = getGridPositions(width, height);
            _.forEach(positions, (position) => {
                G.addValue(position);
            });
            _.forEach(G.values, (v) => {
                _.forEach(v.neighbors, (w) => {
                    if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
                        G.addEdge(v, w);
                    }
                });
            });
            const allNodes = width * height;
            const components = G.floodFill();
            expect(components.length).to.equal(1);
            _.forEach(components, (c) => {
                expect(c.length).to.equal(allNodes);
            });
        });
        it('returns a list of contained vertices wrapped in lists when called on a completely disconnected graph', function () {
            const width = 10;
            const height = 10;
            const G = new Graph<GridPosition>();
            const positions = getGridPositions(width, height);
            _.forEach(positions, (position) => {
                G.addValue(position);
            });
            const allNodes = width * height;
            expect(G.associations).to.equal(0);
            const components = G.floodFill();
            expect(components.length).to.equal(allNodes);
            _.forEach(components, (c) => {
                expect(c.length).to.equal(1);
            });
        });
    });
    describe('can search itself', function () {
        it('returns a path from A to B on a small grid using bfs', function () {
            const width = 5;
            const height = 5;
            const G = new Graph<GridPosition>();
            const positions = getGridPositions(width, height);
            _.forEach(positions, (position) => {
                G.addValue(position);
            });
            _.forEach(G.values, (v) => {
                _.forEach(v.neighbors, (w) => {
                    if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
                        G.addEdge(v, w);
                    }
                });
            });
            const path = G.bfs(positions[0], positions[positions.length - 1]);
            // does not hold for larger graphs
            expect(path.length).to.equal(width + height - 1);
        });
        it('returns a path from A to B on a small grid using aStar', function () {
            const width = 5;
            const height = 5;
            const G = new Graph<GridPosition>();
            const positions = getGridPositions(width, height);
            _.forEach(positions, (position) => {
                G.addValue(position);
            });
            _.forEach(G.values, (v) => {
                _.forEach(v.neighbors, (w) => {
                    if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
                        G.addEdge(v, w);
                    }
                });
            });
            const path = G.aStar(positions[0], positions[positions.length - 1], euclideanDistance);
            // does not hold for larger graphs
            expect(path.length).to.equal(width + height - 1);
        });
    });
    describe('can compute a spanning tree', function () {
        it('returns a mst using recursive backtracking', function () {
            const width = 5;
            const height = 5;
            const size = width * height;
            const G = new Graph<GridPosition>();
            const positions = getGridPositions(width, height);
            _.forEach(positions, (position) => {
                G.addValue(position);
            });
            _.forEach(G.values, (v) => {
                _.forEach(v.neighbors, (w) => {
                    if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
                        G.addEdge(v, w);
                    }
                });
            });
            const path = G.recursiveBacktrack();
            expect(path.length).to.equal(size);
        });
    });
    describe('can use cellular automata', function () {
        it('creates random cellular bodies', function () {
            const width = 13;
            const height = 100;
            const size = width * height;
            const G = new Graph<DiagonalGridPosition>();
            const positions = getDiagonalPositions(width, height);
            _.forEach(positions, (position) => {
                G.addValue(position);
            });
            _.forEach(G.values, (v) => {
                _.forEach(v.neighbors, (w) => {
                    if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
                        G.addEdge(v, w);
                    }
                });
            });
            const partition = G.cellularBodies(2, {
                starvationRate: 1.5,
            });
            const map = _.map(_.range(width), (x) => {
                const row = _.reduce(_.range(height), (str, y) => {
                    const position = new GridPosition(x, y);
                    if (_.intersectionWith(partition.alive, [position], (a) => a.equals(position)).length) {
                        return `${str}X`
                    } else {
                        return `${str} `
                    }
                }, '');
                return row;
            });
            console.log(map);

        });
    });
    describe('can expand itself from an l-system grammer', function () {
        it('can compute a algea simulation of depth 3', function () {
            class CollisionlessTestData extends TestData {
                id: string;
                constructor(val) {
                    super(val);
                    this.id = shortid.generate();
                }
                equals(other) {
                    return other.id === this.id;
                }
            }
            const G = new Graph<CollisionlessTestData>();
            G.addValue(new CollisionlessTestData('0_A'));
            // algea simulation: https://en.wikipedia.org/wiki/L-system#Example_1:_Algae
            G.lExpand(3, (d, i) => {
                const successors = [];
                _.forEach(d.val, (char) => {
                    if (char === 'A') {
                        successors.push(new CollisionlessTestData(`${i + 1}_AB`));
                    } else if (char === 'B') {
                        successors.push(new CollisionlessTestData(`${i + 1}_A`));
                    }
                });
                return successors;
            });
        })
    });
});
