/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Controller } from '@shadow-library/app';
import { CONTROLLER_WATERMARK, PATH_METADATA, ROUTE_RULES_METADATA, VERSION_METADATA } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@controller', () => {
  const path = 'test';
  const pathArray = ['test', 'test2'];
  const pathArrayWithDuplicates = ['test', 'test2', 'test', 'test2'];
  const version = '1';
  const versionArray = ['1', '2'];
  const versionArrayWithDuplicates = ['1', '2', '2', '1', '2', '1'];
  const actionRule = { action: 'controller-action-rule' };

  @Controller(path)
  class PathController {}

  @Controller(pathArray)
  class PathArrayController {}

  @Controller(pathArrayWithDuplicates)
  class PathArrayDuplicateController {}

  @Controller(path, { version, ...actionRule })
  class PathAndVersionController {}

  @Controller(pathArray, { version: versionArray, ...actionRule })
  class PathAndVersionArrayController {}

  @Controller(pathArray, { version: versionArrayWithDuplicates })
  class PathAndVersionDuplicateArrayController {}

  it(`should enhance component with '${CONTROLLER_WATERMARK.toString()}' metadata`, () => {
    const controllerWatermark = Reflect.getMetadata(CONTROLLER_WATERMARK, PathController);

    expect(controllerWatermark).toBe(true);
  });

  it('should enhance controller with expected path metadata', () => {
    const path1 = Reflect.getMetadata(PATH_METADATA, PathController);
    const path2 = Reflect.getMetadata(PATH_METADATA, PathArrayController);
    const path3 = Reflect.getMetadata(PATH_METADATA, PathAndVersionController);
    const path4 = Reflect.getMetadata(PATH_METADATA, PathArrayDuplicateController);
    const path5 = Reflect.getMetadata(PATH_METADATA, PathAndVersionArrayController);

    expect(path1).toStrictEqual(path);
    expect(path2).toStrictEqual(pathArray);
    expect(path3).toStrictEqual(path);
    expect(path4).toStrictEqual(pathArrayWithDuplicates);
    expect(path5).toStrictEqual(pathArray);
  });

  it('should enhance controller with expected version metadata', () => {
    const version1 = Reflect.getMetadata(VERSION_METADATA, PathAndVersionController);
    const version2 = Reflect.getMetadata(VERSION_METADATA, PathAndVersionArrayController);
    const version3 = Reflect.getMetadata(VERSION_METADATA, PathAndVersionDuplicateArrayController);

    expect(version1).toStrictEqual([version]);
    expect(version2).toStrictEqual(versionArray);
    expect(version3).toStrictEqual(versionArray);
  });

  it('should set version as empty array when no version passed as param', () => {
    const version = Reflect.getMetadata(VERSION_METADATA, PathController);
    expect(version).toStrictEqual([]);
  });

  it('should set action rules', () => {
    const actionRule1 = Reflect.getMetadata(ROUTE_RULES_METADATA, PathAndVersionController);
    const actionRule2 = Reflect.getMetadata(ROUTE_RULES_METADATA, PathAndVersionArrayController);

    expect(actionRule1).toStrictEqual(actionRule);
    expect(actionRule2).toStrictEqual(actionRule);
  });
});
