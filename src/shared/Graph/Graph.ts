import * as _ from 'lodash';
import * as Queue from 'tinyqueue';
import { count } from 'typescript-stl';
import * as randomNormal from 'random-normal';
import { IPositionlike } from 'Shared/Graph/GridGraph';

export interface IComparable<T> {
    equals(other: T): boolean;
}

interface IWrapper<T> {
    val: T
}

class ComparablePrimitive<T> implements IWrapper<T> {
    val: T
    constructor(val: T) {
        this.val = val;
    }
    equals(other: IWrapper<T>) {
        return this.val == other.val;
    }
}

type idType = string;

interface Q<T> {
    push(item: T);
    pop(): T;
    peek(): T;
    length: number;
    constructor(queue?: T[], comparator?: (a: T, b: T) => number);
}

class TraversalRecord {
    dict: { [key: string]: idType };
    constructor(start: idType) {
        this.dict = {};
        this.dict[start.toString()] = null;
    }
    insert(parent: idType, child: idType) {
        this.dict[child.toString()] = parent;
    }
    path(goal: idType) {
        const path: idType[] = [goal];
        let cur = this.dict[goal.toString()];
        while (cur !== null) {
            path.push(cur);
            cur = this.dict[cur.toString()];
        }
        return path.reverse();
    }
    contains(v: idType) {
        return !!this.dict[v.toString()] || this.dict[v.toString()] === null;
    }
    get length() {
        return _.keys(this.dict).length;
    }
}

export class Graph<T extends IComparable<any>> {

    protected vertices: T[];
    protected adjMatrix: idType[][];
    protected idOf: (value: T) => idType;
    protected count: number;
    protected resetIdOf() {
        this.idOf = _.memoize((value: T) => {
            const index = _.findIndex(this.vertices, (v) => v.equals(value));
            return index !== -1 ? String(index) : null;
        });
    }
    constructor() {
        this.vertices = [];
        this.adjMatrix = [];
        this.count = 0;
        this.resetIdOf();
    }
    get size(): number {
        return this.vertices.length;
    }
    get associations(): number {
        return _.reduce(_.keys(this.adjMatrix), (count, id) => {
            return count + this.adjMatrix[id].length;
        }, 0);
    }
    get values(): T[] {
        return this.vertices;
    }
    contains(value: T): boolean {
        return !!this.idOf(value);
    }
    addValue(value: T): void {
        if (!this.idOf(value)) {
            this.vertices[this.count] = value;
            this.adjMatrix[this.count] = [];
            this.resetIdOf();
            this.count++;
        }
    }
    addEdge(src: T, dest: T): void {
        const srcId = this.idOf(src);
        const destId = this.idOf(dest);
        if (!srcId || !destId) {
            throw new Error('Graph.addEdge requires src and dest to exist in graph');
        } else {
            if (!_.includes(this.adjMatrix[srcId], destId)) {
                this.adjMatrix[srcId].push(destId);
            }
        }
    }
    protected neighbors(id: idType): number[] {
        if (Number(id) > this.adjMatrix.length) {
            throw new Error('Graph.neighbors value is not present in graph');
        } else {
            const neighborIds = this.adjMatrix[id];
            const neighbors: number[] = [];
            _.forEach(neighborIds, (nId) => neighbors.push(nId));
            return neighbors;
        }
    }
    lExpand(numSteps: number, prodRule: (value: T, index?: number) => T[]) {
        // const visited = [];
        _.forEach(_.range(numSteps), () => {
            const Q = new Queue(_.range(this.vertices.length)) as Q<idType>;
            _.forEach(_.range(Q.length), (i) => {
                const v = Q.pop();
                // if (!_.includes(visited, v)) {
                const value = this.vertices[v];
                _.forEach(prodRule(value, i), (successor) => {
                    this.addValue(successor);
                    this.addEdge(this.vertices[v], successor);
                });
                // visited.push(v);
                // }
            });
        });
    }
    bfs(start: T, goal: T): T[] {
        const startId = this.idOf(start);
        const goalId = this.idOf(goal);
        const Q = new Queue([startId]) as Q<idType>;
        const visited = new TraversalRecord(startId);
        while (Q.length) {
            const v = Q.pop();
            if (goalId === v) {
                const path = visited.path(goalId);
                return _.map(path, (step) => this.vertices[step]);
            }
            _.forEach(this.neighbors(v), (w) => {
                const wId = String(w);
                if (!visited.contains(wId)) {
                    visited.insert(v, wId);
                    Q.push(wId);
                }
            });
        }
        return [];
    }
    aStar(start: T, goal: T, heuristic: (a: T, b: T) => number): T[] {
        const startId = this.idOf(start);
        const goalId = this.idOf(goal);
        type aStarPrioQ = Q<{
            vertexId: idType;
            priority: number;
        }>;
        const comparePriority = (a, b) => a.priority - b.priority;
        const Q = new Queue([{
            priority: 0,
            vertexId: startId
        }], comparePriority) as aStarPrioQ;
        const visited = new TraversalRecord(startId);
        while (Q.length) {
            const { vertexId, priority } = Q.pop();
            if (goalId === vertexId) {
                const path = visited.path(goalId);
                return _.map(path, (step) => this.vertices[step]);
            }
            _.forEach(this.neighbors(vertexId), (w) => {
                const wId = String(w);
                if (!visited.contains(wId)) {
                    visited.insert(vertexId, wId);
                    Q.push({
                        vertexId: wId,
                        priority: priority + 1 + heuristic(this.vertices[w], goal),
                    });
                }
            });
        }
        return [];
    }
    floodFill(): T[][] {
        const start = _.random(this.vertices.length - 1);
        const S = [start];
        const visited = [start];
        const bodies = [[this.vertices[start]]];
        let v = start;
        let bodyCount = 0;
        while (visited.length < this.vertices.length) {
            const neighbors = this.neighbors(String(v));
            const unvisitedNeighbors = _.filter(neighbors, (w) => !_.includes(visited, w));
            if (unvisitedNeighbors.length > 0) {
                _.forEach(unvisitedNeighbors, (w) => {
                    visited.push(w);
                    bodies[bodyCount].push(this.vertices[w]);
                    S.push(v);
                });
            } else if (S.length > 0) {
                v = S.pop();
            } else {
                const unvisted = _.filter(_.range(this.vertices.length - 1), (w) => !_.includes(visited, w));
                v = unvisted[0];
                visited.push(v);
                bodyCount++;
                bodies[bodyCount] = [this.vertices[v]];
            }
        }
        return bodies;
    }
    cellularBodies(numSteps: number, options?: {
        chanceToStartAlive?: number;
        starvationRate?: number;
        overpopRate?: number;
        birthRate?: number;
        smoothing?: number;
        outDegree?: number;
        pruning?: number;
        aliveFn?: (val: T) => boolean;
    }): { alive: T[], dead: T[] } {
        const opts = {
            chanceToStartAlive: 0.5,
            starvationRate: 1,
            overpopRate: 1,
            birthRate: 1,
            smoothing: 0,
            outDegree: undefined,
            pruning: undefined,
            aliveFn: (v: T) => false,
        }
        _.extend(opts, !!options ? options : {});

        let maxOutDegree = opts.outDegree;
        if (!maxOutDegree) {
            const outDegrees = _.map(_.values(this.adjMatrix), (branches) => branches.length);
            maxOutDegree = _.max(outDegrees);
        }

        const aliveFn = _.memoize(opts.aliveFn);

        let states = _.map(_.range(this.vertices.length), () => {
            if (_.random(true) < opts.chanceToStartAlive) {
                return 1;
            } else {
                return 0;
            }
        });

        const SURVIVE_MIN = 4 / (opts.starvationRate);
        const SURVIVE_MAX = 8 * (opts.overpopRate);
        const RESURRECT_MIN = Math.round(5 / (opts.birthRate));
        const RESURRECT_MAX = Math.round(5 * (opts.birthRate));
        const SMOOTHING_MIN = 2;
        const SMOOTHING_MAX = 5;

        _.forEach(_.range(numSteps), (i) => {
            let aliveCounts = _.map(states, (s, v) => {
                const neighbors = this.neighbors(String(v));
                return _.reduce(neighbors, (c, n) => {
                    return c + states[n];
                }, 0);
            });
            const newStates = _.map(states, (oldState, v) => {
                const neighbors = this.neighbors(String(v));
                const alive = aliveCounts[v];
                if (!aliveFn(this.values[v])) {
                    if (oldState) {
                        if (alive >= SURVIVE_MIN && alive <= SURVIVE_MAX) {
                            return 1;
                        } else {
                            return 0;
                        }
                    } else {
                        if (alive >= RESURRECT_MIN && alive <= RESURRECT_MAX) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                } else {
                    return 1;
                }
            });
            let smoothedStates = newStates;
            _.forEach(_.range(opts.smoothing), () => {
                let aliveCounts = _.map(states, (s, v) => {
                    const neighbors = this.neighbors(String(v));
                    return _.reduce(neighbors, (c, n) => {
                        return c + states[n];
                    }, 0);
                });
                smoothedStates = _.map(smoothedStates, (oldState, v) => {
                    if (_.random(10) === 5) {
                        const alive = aliveCounts[v];
                        if (alive <= SMOOTHING_MIN) {
                            return 0;
                        } else if (alive >= SMOOTHING_MAX) {
                            return 1;
                        }
                    }
                    return oldState;
                });
            });
            if (typeof opts.pruning === 'number') {
                const aliveG = new Graph<ComparablePrimitive<string>>();
                const unpruned = _.filter(_.range(this.vertices.length), (i) => !states[i]);
                const unprunedVertices = _.map(unpruned, (u) => new ComparablePrimitive(String(u)));
                _.forEach(unprunedVertices, (v) => {
                    aliveG.addValue(v);
                });
                _.forEach(unprunedVertices, (v) => {
                    _.forEach(this.adjMatrix[v.val], (w) => {
                        if (!states[w]) {
                            aliveG.addEdge(v, new ComparablePrimitive(String(w)));
                        }
                    });
                });
                const components = aliveG.floodFill();
                console.log(components.length);
                const smallComponents = _.filter(components, (c) => c.length <= opts.pruning);
                _.forEach(smallComponents, (c) => {
                    console.log(c.length);
                    _.forEach(c, (v) => {
                        smoothedStates[v.val] = 0;
                    });
                });
            }
            states = smoothedStates;
        });
        const alive = _.filter(this.vertices, (data, i) => !!states[i]);
        const dead = _.filter(this.vertices, (data, i) => !states[i]);
        return { alive, dead };
    }
    automatonStep() {

    }
    recursiveBacktrack(loopFactor?: number, comparator?: (a: T, b: T) => number): T[] {
        const start = _.random(this.vertices.length - 1);
        const removedWalls = [];
        const S = [start];
        const visited = [start];
        let v = start;
        while (visited.length < this.vertices.length) {
            const neighbors = this.neighbors(String(v));
            const unvisitedNeighbors = _.filter(neighbors, (w) => !_.includes(visited, w));
            if (unvisitedNeighbors.length) {
                let w;
                if (typeof comparator === 'function') {
                    const weights = _.map(unvisitedNeighbors, (n) => comparator(this.vertices[v], this.vertices[n]));
                    w = unvisitedNeighbors[_.indexOf(weights, _.min(weights))];
                } else {
                    w = unvisitedNeighbors[_.random(unvisitedNeighbors.length - 1)];
                }
                visited.push(w);
                S.push(v);
                // create a loop if loop factor is passed
                if (typeof loopFactor === 'number' && _.random(100) / 100 < loopFactor) {
                    const u = neighbors[_.random(neighbors.length - 1)];
                    visited.push(u);
                }
                v = w;
            } else if (S.length) {
                v = S.pop();
            } else {
                const unvisted = _.filter(_.range(this.vertices.length - 1), (w) => !_.includes(visited, w));
                v = unvisted[_.random(0, unvisted.length - 1)];
                visited.push(v);
            }
        }
        return _.map(visited, (step) => this.vertices[step]);
    }
}