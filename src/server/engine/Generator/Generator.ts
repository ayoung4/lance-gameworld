import { IPositionLike } from 'Shared/Graph/GridGraph';
import { serialize } from 'lance-gg';
import * as _ from 'lodash';
import * as Simplex from 'perlin-simplex';

export module Generator {

    export function randomTiles(width: number, height: number): number[][] {
        const tiles = [];
        _.forEach(_.range(width), (x) => {
            tiles[x] = [];
            _.forEach(_.range(height), (y) => {
                if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                    tiles[x][y] = _.random(0, 1);
                } else {
                    tiles[x][y] = 1;
                }
            });
        });
        return tiles;
    }

    export function noiseField(width: number, height: number): number[][] {
        const noiseMap: number[][] = [];

        var simplex = new Simplex()

        for (var x = 0; x < width; x++) {
            noiseMap[x] = [];
            for (var y = 0; y < height; y++) {
                var value = simplex.noise(x / 50, y / 50);
                noiseMap[x][y] = Math.abs(value);
            }
        }

        return noiseMap;

    }

    export function noiseSplit(width: number, height: number, partitions: number): IPositionLike[][] {
        const cuts: IPositionLike[][] = [];
        const noiseMap = noiseField(width, height);
        _.forEach(_.range(partitions), (i) => {
            cuts[i] = [];
            _.forEach(_.range(width), (x) => {
                _.forEach(_.range(height), (y) => {
                    if (noiseMap[x][y] > ((1 / partitions) * (i)) && noiseMap[x][y] < ((1 / partitions) * (i + 1))) {
                        cuts[i].push({ x, y });
                    }
                });
            });
        });
        return cuts;
    }

    export function getXYPairs(width: number, height: number) {
        return _.reduce(_.range(width), (l, x) => {
            const xPositions = _.map(_.range(height), (y) => ({ x, y }));
            return [...l, ...xPositions];
        }, []);
    }

}
