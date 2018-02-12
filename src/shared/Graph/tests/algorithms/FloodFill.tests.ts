import { expect } from 'chai';
import { GraphTestHelpers } from '../../GraphTestHelpers';
import { GridPosition, DiagonalGridPosition, GridGraph } from '../../GridGraph';
import { Graph } from '../../Graph';
import * as _ from 'lodash';

describe('Flood Fill Algorithm', function () {
    it('returns a list of all contained vertices wrapped in a list when called on a connected graph', function () {
        const width = 10;
        const height = 10;
        const positions = GraphTestHelpers.getGridPositions(width, height);
        const G = new GridGraph(positions);
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
        const positions = GraphTestHelpers.getGridPositions(width, height);
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
    it('flood counts cellular bodies', function () {
        const width = 10;
        const height = 100;
        const positions = GraphTestHelpers.getDiagonalPositions(width, height);
        const G = new GridGraph(positions, { mode: 'diagonal' });
        const partition = G.cellularBodies(2, {
            starvationRate: 1.5,
        });
        const allNodes = width * height;
        const aliveG = new GridGraph(partition.alive);
        const components = aliveG.floodFill();
        GraphTestHelpers.renderAscii(width, height, ...components);
    });
});