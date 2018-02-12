import { GridGraph, GridPosition, DiagonalGridPosition, IPositionlike } from './GridGraph';
import * as _ from 'lodash';
import * as shortid from 'shortid';

export module GraphTestHelpers {

    export class TestData {
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

    export class CollisionlessTestData extends TestData {
        id: string;
        constructor(val) {
            super(val);
            this.id = shortid.generate();
        }
        equals(other) {
            return other.id === this.id;
        }
    }

    export const getXYPairs = _.memoize((width: number, height: number) => _.reduce(_.range(width), (l, x) => {
        const xPositions = _.map(_.range(height), (y) => ({ x, y }));
        return [...l, ...xPositions];
    }, [] as IPositionlike[]));

    export const getGridPositions = _.memoize((width: number, height: number) => _.reduce(_.range(width), (l, x) => {
        const xPositions = _.map(_.range(height), (y) => new GridPosition(x, y));
        return [...l, ...xPositions];
    }, [] as GridPosition[]));

    export const getDiagonalPositions = _.memoize((width: number, height: number) => _.reduce(_.range(width), (l, x) => {
        const xPositions = _.map(_.range(height), (y) => new DiagonalGridPosition(x, y));
        return [...l, ...xPositions];
    }, [] as DiagonalGridPosition[]));

    const asciiMap = [
        ' ',
        'X',
        '-',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'O',
        '+',
    ];

    export const renderAscii = (width: number, height: number, ...partitions: GridPosition[][]) => {
        const map = _.map(_.range(width), (x) => {
            const row = _.reduce(_.range(height), (str, y) => {
                const position = new GridPosition(x, y);
                let char = asciiMap[0];
                for (let i = 1; i < asciiMap.length; i++) {
                    if (_.intersectionWith(partitions[i - 1], [position], (a) => a.equals(position)).length) {
                        char = asciiMap[i];
                    }
                }
                return `${str}${char}`;
            }, '');
            return row;
        });
        _.forEach(map, (row) => console.log(row));
    };

}
