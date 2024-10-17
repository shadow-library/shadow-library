/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import '@shadow-library/app';
import { DependencyGraph } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('DependencyGraph', () => {
  let graph: DependencyGraph<string>;

  beforeEach(() => {
    graph = new DependencyGraph<string>();
  });

  it('should add a node to the graph', () => {
    graph.addNode('A');
    expect(graph.getNodes()).toEqual(['A']);
  });

  it('should add a dependency between two nodes', () => {
    graph.addDependency('A', 'B');
    expect(graph.getDependencies('A')).toContain('B');
    expect(graph.getDependencies('C')).toBeInstanceOf(Set);
  });

  it('should return the sorted nodes in topological order', () => {
    graph.addNode('A').addNode('B').addNode('C').addNode('D');
    graph.addDependency('A', 'B');
    graph.addDependency('B', 'C');
    graph.addDependency('B', 'D');
    graph.addDependency('C', 'D');
    expect(graph.getInitOrder()).toEqual(['D', 'C', 'B', 'A']);
  });

  it('should throw an error if a circular dependency is detected', () => {
    graph.addNode('A').addNode('B').addNode('C').addNode('D');
    graph.addDependency('A', 'B');
    graph.addDependency('B', 'C');
    graph.addDependency('C', 'A');
    expect(() => graph.getInitOrder()).toThrowError(InternalError);
  });

  it('should return the circular dependencies', () => {
    graph.addNode('A').addNode('B').addNode('C').addNode('D');
    graph.addDependency('A', 'B');
    graph.addDependency('B', 'C');
    graph.addDependency('C', 'B');
    graph.addDependency('C', 'A');
    graph.addDependency('C', 'D');
    expect(graph.determineCircularDependencies()).toEqual([
      ['B', 'C', 'B'],
      ['A', 'B', 'C', 'A'],
    ]);
  });
});
