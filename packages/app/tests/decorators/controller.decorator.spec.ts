/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Controller } from '@shadow-library/app';
import { CONTROLLER_WATERMARK, PATH_METADATA, VERSION_METADATA } from '@shadow-library/app/constants';

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

  @Controller(path)
  class PathController {}

  @Controller(pathArray)
  class PathArrayController {}

  @Controller(pathArrayWithDuplicates)
  class PathArrayDuplicateController {}

  @Controller({ path, version })
  class PathAndVersionController {}

  @Controller({ path: pathArray, version: versionArray })
  class PathAndVersionArrayController {}

  @Controller({ path: pathArray, version: versionArrayWithDuplicates })
  class PathAndVersionDuplicateArrayController {}

  it(`should enhance component with '${CONTROLLER_WATERMARK.toString()}' metadata`, () => {
    const controllerWatermark = Reflect.getMetadata(CONTROLLER_WATERMARK, PathController);

    expect(controllerWatermark).toBe(true);
  });

  it('should enhance controller with expected path metadata', () => {
    const path1 = Reflect.getMetadata(PATH_METADATA, PathController);
    expect(path1).toStrictEqual([path]);
    const path2 = Reflect.getMetadata(PATH_METADATA, PathArrayController);
    expect(path2).toStrictEqual(pathArray);
    const path3 = Reflect.getMetadata(PATH_METADATA, PathAndVersionController);
    expect(path3).toStrictEqual([path]);
    const path4 = Reflect.getMetadata(PATH_METADATA, PathArrayDuplicateController);
    expect(path4).toStrictEqual(pathArray);
    const path5 = Reflect.getMetadata(PATH_METADATA, PathAndVersionArrayController);
    expect(path5).toStrictEqual(pathArray);
  });

  it('should enhance controller with expected version metadata', () => {
    const version1 = Reflect.getMetadata(VERSION_METADATA, PathAndVersionController);
    expect(version1).toStrictEqual([version]);
    const version2 = Reflect.getMetadata(VERSION_METADATA, PathAndVersionArrayController);
    expect(version2).toStrictEqual(versionArray);
    const version3 = Reflect.getMetadata(VERSION_METADATA, PathAndVersionDuplicateArrayController);
    expect(version3).toStrictEqual(versionArray);
  });

  it('should set version as empty array when no version passed as param', () => {
    const version = Reflect.getMetadata(VERSION_METADATA, PathController);
    expect(version).toStrictEqual([]);
  });
});
