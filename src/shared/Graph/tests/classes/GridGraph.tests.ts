import { expect } from 'chai';
import * as _ from 'lodash';
import { GraphTestHelpers } from '../../GraphTestHelpers';
import { GridGraph, SpacedGridGraph } from '../../GridGraph';

describe('GridGraph Class', function () {
    it('GridGraph constructs a complete grid', () => {
        const width = 50;
        const height = 50;
        const positions = GraphTestHelpers.getXYPairs(width, height);
        const G = new GridGraph(positions);
        const allNodes = width * height;
        const twoEdges = 4;
        const threeEdges = ((height - 2) * 2) + ((width - 2) * 2);
        const fourEdges = allNodes - threeEdges - twoEdges;
        expect(G.size).to.equal(allNodes);
        expect(G.associations).to.equal((2 * twoEdges) + (3 * threeEdges) + (4 * fourEdges));
    });
    it('SpacedGridGraph constructs a complete spaced grid of odd grid positions', () => {
        const width = 10;
        const height = 10;
        const positions = GraphTestHelpers.getXYPairs(width, height);
        const G = new SpacedGridGraph(positions);
        const allNodes = _.floor((width * height) / 4);
        const twoEdges = 4;
        const threeEdges = ((_.floor(height / 2) - 2) * 2) + ((_.floor(width / 2) - 2) * 2);
        const fourEdges = allNodes - threeEdges - twoEdges;
        expect(G.size).to.equal(allNodes);
        expect(G.associations).to.equal((2 * twoEdges) + (3 * threeEdges) + (4 * fourEdges));
        GraphTestHelpers.renderAscii(width, height, G.values);
    });
})