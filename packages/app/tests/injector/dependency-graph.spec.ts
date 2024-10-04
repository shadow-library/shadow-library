/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

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
    const graph = new DependencyGraph<string>().addNode('A');
    expect(graph.getNodes()).toEqual(['A']);
  });

  it('should add a dependency between two nodes', () => {
    const graph = new DependencyGraph<string>();
    graph.addDependency('A', 'B');
    expect(graph.getDependencies('A')).toContain('B');
    expect(graph.getDependencies('C')).toBeInstanceOf(Set);
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

    expect(() => graph.getSortedNodes()).toThrowError(InternalError);
  });

  it(`should not throw an error when a circular dependency is detected and 'allowCircularDeps' is true`, () => {
    const graph = new DependencyGraph<string>();
    graph.addNode('A').addNode('B').addNode('C').addNode('D');
    graph.addDependency('A', 'B');
    graph.addDependency('B', 'C');
    graph.addDependency('C', 'D');
    graph.addDependency('D', 'B');

    expect(() => graph.getSortedNodes(true)).not.toThrowError();
  });
});
