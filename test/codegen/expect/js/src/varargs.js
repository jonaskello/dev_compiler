dart_library.library('js/src/varargs', null, /* Imports */[
  "dart_runtime/dart",
  'dart/core'
], /* Lazy imports */[
], function(exports, dart, core) {
  'use strict';
  let dartx = dart.dartx;
  class _Rest extends core.Object {
    _Rest() {
    }
  }
  dart.setSignature(_Rest, {
    constructors: () => ({_Rest: [_Rest, []]})
  });
  let rest = dart.const(new _Rest());
  function spread(args) {
    dart.throw(new core.StateError('The spread function cannot be called, ' + 'it should be compiled away.'));
  }
  dart.fn(spread);
  // Exports:
  exports.rest = rest;
  exports.spread = spread;
});
