import { Graph } from '../../Graph';
import { expect } from 'chai';
import * as _ from 'lodash';
import { performance } from 'perf_hooks';
import { GridPosition, DiagonalGridPosition, GridGraph } from '../../GridGraph';
import { GraphTestHelpers } from '../../GraphTestHelpers';

describe('Graph Class', function () {
    it('constructs an empty graph', function () {
        const G = new Graph<GraphTestHelpers.TestData>();
        expect(G).to.not.be.undefined;
    });
    it('adds some data to it', function () {
        const G = new Graph<GraphTestHelpers.TestData>();
        const numData = _.random(10);
        const data = _.map(_.range(numData), (i) => new GraphTestHelpers.TestData(i));
        _.forEach(data, (d) => {
            G.addValue(d);
        });
        expect(G.size).to.equal(numData);
    });
    it('adds some edges', function () {
        const G = new Graph<GraphTestHelpers.TestData>();
        const numData = _.random(3, 10);
        const data = _.map(_.range(numData), (i) => new GraphTestHelpers.TestData(i));
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
        const positions = GraphTestHelpers.getGridPositions(width, height);
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
});




