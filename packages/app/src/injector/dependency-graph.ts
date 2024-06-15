/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class DependencyGraph<T> {
  private readonly graph = new Map<T, Set<T>>();

  getNodes(): T[] {
    return Array.from(this.graph.keys());
  }

  addNode(node: T): this {
    if (!this.graph.has(node)) this.graph.set(node, new Set());
    return this;
  }

  getDependencies(node: T): Set<T> {
    return this.graph.get(node) ?? new Set();
  }

  addDependency(node: T, dependency: T): this {
    let nodeMap = this.graph.get(node);
    if (typeof nodeMap === 'undefined') nodeMap = this.addNode(node).getDependencies(node);
    if (!this.graph.has(dependency)) this.addNode(dependency);
    nodeMap.add(dependency);
    return this;
  }

  /**
   * Returns an array of nodes in the order in which they need to be loaded.
   * Dependent nodes are loaded first.
   *
   * @returns {T[]} The sorted array of nodes.
   * @throws {Error} If a circular dependency is detected.
   */
  getSortedNodes(): T[] {
    const nodes = this.getNodes();
    const visited = new Set<T>();
    const visiting = new Set<T>();
    const stack = new Array<T>();

    const visitNode = (node: T) => {
      if (visited.has(node)) return;
      if (visiting.has(node)) {
        const circularArr = [...visiting, node];
        const circularPath = circularArr.slice(circularArr.indexOf(node)).join(' -> ');
        throw new InternalError(`Circular dependency detected: ${circularPath}`);
      }

      visiting.add(node);
      this.getDependencies(node).forEach(visitNode);

      visiting.delete(node);
      visited.add(node);
      stack.push(node);
    };

    nodes.forEach(visitNode);
    return stack;
  }
}
