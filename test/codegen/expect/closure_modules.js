'use strict';
goog.module('closure_modules');
// Imports
let dart = goog.require('dart_runtime.dart');
let core = goog.require('dart.core');
// Module closure_modules
let dartx = dart.dartx;
class SomeClass extends core.Object {}
let SomeTypedef = dart.typedef('SomeTypedef', () => dart.functionType(dart.void, []));
{
  function someFunction() {
  }
  dart.fn(someFunction, dart.void, []);
}
exports.some_var = 1;
let some_const = 2;
exports.some_final = 3;
// Exports:
exports.SomeClass = SomeClass;
exports.SomeTypedef = SomeTypedef;
exports.someFunction = someFunction;
exports.some_const = some_const;
