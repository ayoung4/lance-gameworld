import { expect } from 'chai';
import { GraphTestHelpers } from '../../GraphTestHelpers';
import { GridPosition, SpacedGridPosition, GridGraph, SpacedGridGraph } from '../../GridGraph';
import { Graph } from '../../Graph';
import * as _ from 'lodash';

describe('MST Algorithms', function () {
    it('returns a mst using recursive backtracking', function () {
        const width = 5;
        const height = 5;
        const positions = GraphTestHelpers.getGridPositions(width, height);
        const G = new GridGraph(positions);
        const path = G.recursiveBacktrack();
        expect(path.length).to.equal(G.size);
    });
    it('can generate a perfect maze', function () {
        const width = 13;
        const height = 100;
        const positions = GraphTestHelpers.getXYPairs(width, height);
        const G = new SpacedGridGraph(positions);
        const path = G.recursiveBacktrack();
        const [start, ...steps] = path;
        const walls = _.map(steps, (s, i) => {
            return s.wallBetween(path[i]);
        });
        const maze = [...G.values, ...walls]
        GraphTestHelpers.renderAscii(width, height, maze);
    });
});