import { expect } from 'chai';
import { GraphTestHelpers } from '../../GraphTestHelpers';
import { GridPosition, DiagonalGridPosition, GridGraph, SpacedGridGraph } from '../../GridGraph';

describe('Cellular Automata Algorithms', function () {
    it('creates random cellular bodies', function () {
        const width = 13;
        const height = 100;
        const size = width * height;
        const positions = GraphTestHelpers.getDiagonalPositions(width, height);
        const G = new GridGraph(positions, { mode: 'diagonal' });
        const partition = G.cellularBodies(2, {
            starvationRate: 1.5,
        });
        GraphTestHelpers.renderAscii(width, height, partition.alive, partition.dead);
    });
    it('works with spaced grid position graphs', function () {
        const width = 13;
        const height = 100;
        const size = width * height;
        const positions = GraphTestHelpers.getXYPairs(width, height);
        const G = new SpacedGridGraph(positions, { mode: 'diagonal' });
        const partition = G.cellularBodies(2);
        GraphTestHelpers.renderAscii(width, height, partition.alive, partition.dead);
    });
    it('creates random cellular bodies using alive func and pruning', function () {
        const width = 13;
        const height = 100;
        const size = width * height;
        const positions = GraphTestHelpers.getDiagonalPositions(width, height);
        const G = new GridGraph(positions, { mode: 'diagonal' });
        const partition = G.cellularBodies(5, {
            pruning: 6,
            aliveFn: ({ x, y }) => x === 0 || x === width - 1 || y === 0 || y === height - 1, 
        });
        GraphTestHelpers.renderAscii(width, height, partition.alive, partition.dead);
    });
});
