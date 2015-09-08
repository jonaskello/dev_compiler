dart_library.library('js_passthrough', null, /* Imports */[
  "dart_runtime/dart",
  'dart/core',
  'dart/js'
], /* Lazy imports */[
], function(exports, dart, core, js) {
  'use strict';
  let dartx = dart.dartx;
  class Foo extends core.Object {}
  function doStuff(obj) {
    obj.prop = 'value';
    core.print(obj.prop);
  }
  dart.fn(doStuff, dart.dynamic, [js.JsObject]);
  function main(args) {
    let someName = 'Foo';
    core.print(dart.global[someName]);
    let o = new ConstructorWithoutArgs();
    o = new ConstructorWithArgs("1", 2);
    o = new (Function.prototype.bind.apply(ConstructorWithArgList, [null, dart.as(args, core.List)]))();
    core.print(o.methodWithoutArgs());
    core.print(o.methodWithArgs(1, "2"));
    core.print(((target, args) => target.methodWithArgList.apply(target, args))(o, dart.as(args, core.List)));
    delete o.foo;
    core.print('foo' in o);
    core.print(o instanceof Bar);
    core.print(typeof(o));
    doStuff(new Foo());
    let f = Symbol;
    core.print(f('someSymbol'));
    core.print(f.apply(null, dart.as(args, core.List)));
    core.print(f.apply(o, dart.as(args, core.List)));
    core.print(Symbol('_runtimeType'));
  }
  dart.fn(main);
  // Exports:
  exports.Foo = Foo;
  exports.doStuff = doStuff;
  exports.main = main;
});
