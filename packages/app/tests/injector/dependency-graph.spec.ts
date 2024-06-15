/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { DependencyGraph } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('DependencyGraph', () => {
  it('should add a node to the graph', () => {
    const graph = new DependencyGraph<number>();
    graph.addNode(1);
    expect(graph.getNodes()).toContain(1);
  });

  it('should add a dependency between two nodes', () => {
    const graph = new DependencyGraph<string>();
    graph.addNode('A');
    graph.addNode('B');
    graph.addDependency('A', 'B');
    expect(graph.getDependencies('A')).toContain('B');
  });

  it('should return the sorted nodes in topological order', () => {
    const graph = new DependencyGraph<string>();
    graph.addNode('A').addNode('B').addNode('C').addNode('D');
    graph.addDependency('A', 'B');
    graph.addDependency('B', 'C');
    graph.addDependency('B', 'D');
    graph.addDependency('C', 'D');
    expect(graph.getSortedNodes()).toEqual(['D', 'C', 'B', 'A']);
  });

  it('should throw an error when a circular dependency is detected', () => {
    const graph = new DependencyGraph<string>();
    graph.addNode('A').addNode('B').addNode('C').addNode('D');
    graph.addDependency('A', 'B');
    graph.addDependency('B', 'C');
    graph.addDependency('C', 'D');
    graph.addDependency('D', 'B');

    const expectedError = new InternalError('Circular dependency detected: B -> C -> D -> B');
    expect(() => graph.getSortedNodes()).toThrowError(expectedError);
  });
});
