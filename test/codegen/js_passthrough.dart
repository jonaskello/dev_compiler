library js_passthrough;

/// @internal.PassThrough
import 'dart:js';

String typeof(JsObject o) native;

class Foo {}

doStuff(JsObject obj) {
  obj['prop'] = 'value';
  print(obj['prop']);
}

main(args) {
  var someName = 'Foo';
  print(context[someName]);

  var o = new JsObject(context['ConstructorWithoutArgs']);
  o = new JsObject(context['ConstructorWithArgs'], ["1", 2]);
  o = new JsObject(context['ConstructorWithArgList'], args);
  print(o.callMethod('methodWithoutArgs'));
  print(o.callMethod('methodWithArgs', [1, "2"]));
  print(o.callMethod('methodWithArgList', args));
  o.deleteProperty('foo');
  print(o.hasProperty('foo'));
  print(o.instanceof(context['Bar']));
  print(typeof(o));
  doStuff(new Foo() as JsObject);

  JsFunction f = context['Symbol'] as JsFunction;
  print(f.apply(['someSymbol']));
  print(f.apply(args));
  print(f.apply(args, thisArg: o));

  print(context['Symbol'].apply(['_runtimeType']));
}
