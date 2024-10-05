/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { errors } from './errors';
import { InjectionToken } from '../../interfaces';

/**
 * Defining types
 */

interface NodeMetadata {
  distance: number;
  dependsOn: number;
  requiredBy: number;
}

/**
 * Declaring the constants
 */

export class DependencyGraph<T extends InjectionToken> {
  private readonly nodeMap = new Map<T, Set<T>>();

  private constructMetadata(): Map<T, NodeMetadata> {
    const metadata = new Map<T, NodeMetadata>();
    const queue: T[] = [];

    /** add the node, dependsOn and requiredBy data */
    for (const [node, deps] of this.nodeMap.entries()) {
      if (deps.size == 0) queue.push(node);
      const nodeMetadata = metadata.get(node);
      if (nodeMetadata) nodeMetadata.dependsOn = deps.size;
      else metadata.set(node, { distance: 0, dependsOn: deps.size, requiredBy: 0 });
      for (const dep of deps) {
        const depMetadata = metadata.get(dep);
        if (depMetadata) depMetadata.requiredBy++;
        else metadata.set(dep, { distance: 0, dependsOn: 0, requiredBy: 1 });
      }
    }

    /** calculate the distance of each node from the leaves */
    while (queue.length > 0) {
      const current = queue.shift() as T;
      const currentMetadata = metadata.get(current) as NodeMetadata;

      for (const [node, deps] of this.nodeMap.entries()) {
        if (!deps.has(current)) continue;
        const nodeMetadata = metadata.get(node) as NodeMetadata;
        const newDistance = currentMetadata.distance + 1;
        if (newDistance > nodeMetadata.distance) nodeMetadata.distance = newDistance;
        if (--nodeMetadata.dependsOn === 0) queue.push(node);
      }
    }

    return metadata;
  }

  getNodes(): T[] {
    return Array.from(this.nodeMap.keys());
  }

  addNode(node: T): this {
    if (!this.nodeMap.has(node)) this.nodeMap.set(node, new Set());
    return this;
  }

  getDependencies(node: T): Set<T> {
    return this.nodeMap.get(node) ?? new Set();
  }

  addDependency(node: T, dependency: T): this {
    let nodeMap = this.nodeMap.get(node);
    if (typeof nodeMap === 'undefined') nodeMap = this.addNode(node).getDependencies(node);
    if (!this.nodeMap.has(dependency)) this.addNode(dependency);
    nodeMap.add(dependency);
    return this;
  }

  determineCircularDependencies(): T[][] {
    const circularDeps = [] as T[][];
    const nodes = this.getNodes();
    const visited = new Set<T>();
    const visiting = new Set<T>();
    const stack = new Array<T>();

    const visitNode = (node: T) => {
      if (visited.has(node)) return;

      if (visiting.has(node)) {
        const circularArr = [...visiting, node];
        const circularPath = circularArr.slice(circularArr.indexOf(node));
        circularDeps.push(circularPath);
        return;
      }

      visiting.add(node);
      this.getDependencies(node).forEach(visitNode);

      visiting.delete(node);
      visited.add(node);
      stack.push(node);
    };

    nodes.forEach(visitNode);

    return circularDeps;
  }

  getInitOrder(): T[] {
    const metadata = this.constructMetadata();
    const nodes: T[] = [];
    const queue: T[] = [];

    /** Initialize queue with nodes having no dependencies (zero in-degree) */
    for (const [node, nodeMetadata] of metadata.entries()) {
      if (nodeMetadata.requiredBy === 0) queue.push(node);
    }

    /** Perform BFS-like processing to generate the topological order */
    while (queue.length > 0) {
      const node = queue.shift() as T;
      nodes.push(node);

      const dependencies = this.getDependencies(node);
      for (const dependency of dependencies) {
        const dependencyMetadata = metadata.get(dependency) as NodeMetadata;
        if (--dependencyMetadata.requiredBy === 0) queue.push(dependency);
      }
    }

    /** If all nodes are not present, then there's a cycle (circular dependency) */
    if (nodes.length !== this.nodeMap.size) {
      const circularDeps = this.determineCircularDependencies();
      const circularDepNames = circularDeps.map(deps => deps.map(dep => dep.toString()));
      throw errors.getCircularDependencyError(circularDepNames);
    }

    const getDistance = (node: T) => (metadata.get(node) as NodeMetadata).distance;
    const sortedNodes = nodes.sort((a, b) => getDistance(a) - getDistance(b));
    return sortedNodes;
  }
}
