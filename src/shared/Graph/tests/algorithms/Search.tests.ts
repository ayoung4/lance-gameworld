import { expect } from 'chai';
import * as _ from 'lodash';
import { GraphTestHelpers } from '../../GraphTestHelpers';
import { GridPosition, DiagonalGridPosition, GridGraph, SpacedGridGraph } from '../../GridGraph';

const euclideanDistance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

describe('Graph Seach Algorithms', function () {
    it('returns a path from A to B on a small grid using bfs', function () {
        const width = 5;
        const height = 5;
        const positions = GraphTestHelpers.getGridPositions(width, height);
        const G = new GridGraph(positions);
        const path = G.bfs(positions[0], positions[positions.length - 1]);
        // does not hold for larger graphs
        expect(path.length).to.equal(width + height - 1);
    });
    it('returns a path from A to B on a small grid using aStar', function () {
        const width = 5;
        const height = 5;
        const positions = GraphTestHelpers.getGridPositions(width, height);
        const G = new GridGraph(positions);
        const path = G.aStar(positions[0], positions[positions.length - 1], euclideanDistance);
        // does not hold for larger graphs
        expect(path.length).to.equal(width + height - 1);
    });
    it('returns a path across a perfect maze using aStar', function () {
        const width = 13;
        const height = 100;
        const positions = GraphTestHelpers.getXYPairs(width, height);
        const G = new SpacedGridGraph(positions);
        const mazePath = G.recursiveBacktrack();
        const [start, ...steps] = mazePath;
        const walls = _.map(steps, (s, i) => {
            return s.wallBetween(mazePath[i]);
        });
        const mazePositions = [...G.values, ...walls];
        const openPositions = _.filter(positions, (p) => !_.intersectionWith(mazePositions, [p], (a, b) => a.equals(b)).length);
        const Maze = new GridGraph(openPositions);
        const path = Maze.aStar(Maze.values[0], Maze.values[Maze.size - 1], euclideanDistance);
        GraphTestHelpers.renderAscii(width, height, mazePositions, path);
    });
});
