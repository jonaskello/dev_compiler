dart_library.library('dart/_js_mirrors', null, /* Imports */[
  "dart_runtime/dart",
  'dart/_internal',
  'dart/core',
  'dart/mirrors'
], /* Lazy imports */[
], function(exports, dart, _internal, core, mirrors) {
  'use strict';
  let dartx = dart.dartx;
  /**
   * @param {Symbol} symbol
   * @return {string}
   */
  function getName(symbol) {
    return _internal.Symbol.getName(dart.as(symbol, _internal.Symbol));
  }
  dart.fn(getName, core.String, [core.Symbol]);
  /** @return {core.Symbol} */
  function getSymbol(name, library) {
    return dart.throw(new core.UnimplementedError("MirrorSystem.getSymbol unimplemented"));
  }
  dart.fn(getSymbol, core.Symbol, [dart.dynamic, dart.dynamic]);
  dart.defineLazyProperties(exports, {
    get currentJsMirrorSystem() {
      return dart.throw(new core.UnimplementedError("MirrorSystem.currentJsMirrorSystem unimplemented"));
    }
  });
  /** @return {InstanceMirror} */
  function reflect(reflectee) {
    return new JsInstanceMirror._(reflectee);
  }
  dart.fn(reflect, mirrors.InstanceMirror, [dart.dynamic]);
  /**
   * @param {core.Type} key
   * @return {mirrors.TypeMirror}
   */
  function reflectType(key) {
    return new JsClassMirror._(key);
  }
  dart.fn(reflectType, mirrors.TypeMirror, [core.Type]);
  dart.defineLazyProperties(exports, {
    get _dart() {
      return dart;
    },
    get _metadata() {
      return exports._dart.metadata;
    }
  });
  /** @param {string} name */
  function _dload(obj, name) {
    return exports._dart.dload(obj, name);
  }
  dart.fn(_dload, dart.dynamic, [dart.dynamic, core.String]);
  /** @param {string} name */
  function _dput(obj, name, val) {
    exports._dart.dput(obj, name, val);
  }
  dart.fn(_dput, dart.void, [dart.dynamic, core.String, dart.dynamic]);
  /**
   * @param {string} name
   * @param {core.List} args
   */
  function _dsend(obj, name, args) {
    return exports._dart.dsend(obj, name, ...args);
  }
  dart.fn(_dsend, dart.dynamic, [dart.dynamic, core.String, core.List]);
  let _toJsMap = Symbol('_toJsMap');
  class JsInstanceMirror extends core.Object {
    /**
     * @constructor
     * @param {core.Object} reflectee
     * @return {JsInstanceMirror}
     */
    _(reflectee) {
      this.reflectee = reflectee;
    }
    /** @return {mirrors.ClassMirror} */
    get type() {
      return dart.throw(new core.UnimplementedError("ClassMirror.type unimplemented"));
    }
    /** @return {?boolean} */
    get hasReflectee() {
      return dart.throw(new core.UnimplementedError("ClassMirror.hasReflectee unimplemented"));
    }
    /** @param {core.Invocation} invocation */
    delegate(invocation) {
      return dart.throw(new core.UnimplementedError("ClassMirror.delegate unimplemented"));
    }
    /**
     * @param {core.Symbol} symbol
     * @return {mirrors.InstanceMirror}
     */
    getField(symbol) {
      let name = getName(symbol);
      let field = _dload(this.reflectee, name);
      return new JsInstanceMirror._(field);
    }
    /**
     * @param {core.Symbol} symbol
     * @param {core.Object} value
     * @return {mirrors.InstanceMirror}
     */
    setField(symbol, value) {
      let name = getName(symbol);
      _dput(this.reflectee, name, value);
      return new JsInstanceMirror._(value);
    }
    /**
     * @param {core.Symbol} symbol
     * @param {core.List} args
     * @param {core.Map=} namedArgs
     * @return {mirrors.InstanceMirror}
     */
    invoke(symbol, args, namedArgs) {
      if (namedArgs === void 0)
        namedArgs = null;
      let name = getName(symbol);
      if (namedArgs != null) {
        args = core.List.from(args);
        args[dartx.add](this[_toJsMap](namedArgs));
      }
      let result = _dsend(this.reflectee, name, args);
      return new JsInstanceMirror._(result);
    }
    /** @param {core.Map} map */
    [_toJsMap](map) {
      let obj = {};
      map.forEach(dart.fn((key, value) => {
        obj[getName(key)] = value;
      }, dart.dynamic, [core.Symbol, dart.dynamic]));
      return obj;
    }
  }
  JsInstanceMirror[dart.implements] = () => [mirrors.InstanceMirror];
  dart.defineNamedConstructor(JsInstanceMirror, '_');
  dart.setSignature(JsInstanceMirror, {
    constructors: () => ({_: [JsInstanceMirror, [core.Object]]}),
    methods: () => ({
      delegate: [dart.dynamic, [core.Invocation]],
      getField: [mirrors.InstanceMirror, [core.Symbol]],
      setField: [mirrors.InstanceMirror, [core.Symbol, core.Object]],
      invoke: [mirrors.InstanceMirror, [core.Symbol, core.List], [core.Map$(core.Symbol, dart.dynamic)]],
      [_toJsMap]: [dart.dynamic, [core.Map$(core.Symbol, dart.dynamic)]]
    })
  });
  let _metadata = Symbol('_metadata');
  let _declarations = Symbol('_declarations');
  let _cls = Symbol('_cls');
  class JsClassMirror extends core.Object {
    /** @return {core.List} */
    get metadata() {
      return this[_metadata];
    }
    /** @return {core.Map} */
    get declarations() {
      return this[_declarations];
    }
    /**
     * @constructor
     * @param {core.Type} cls
     * @return {JsClassMirror}
     */
    _(cls) {
      this[_cls] = cls;
      this.simpleName = core.Symbol.new(cls.name);
      this[_metadata] = null;
      this[_declarations] = null;
      let fn = this[_cls][dart.metadata];
      this[_metadata] = fn == null ? dart.list([], mirrors.InstanceMirror) : core.List$(mirrors.InstanceMirror).from(dart.as(dart.dsend(dart.dcall(fn), 'map', dart.fn(i => new JsInstanceMirror._(i), JsInstanceMirror, [dart.dynamic])), core.Iterable));
      this[_declarations] = core.Map$(core.Symbol, mirrors.MethodMirror).new();
      this[_declarations].set(this.simpleName, new JsMethodMirror._(this, this[_cls]));
    }
    /**
     * @param {core.Symbol} constructorName
     * @param {core.List} args
     * @param {core.Map=} namedArgs
     * @return {mirrors.InstanceMirror}
     */
    newInstance(constructorName, args, namedArgs) {
      if (namedArgs === void 0)
        namedArgs = null;
      dart.assert(getName(constructorName) == "");
      dart.assert(namedArgs == null || dart.notNull(namedArgs.isEmpty));
      let instance = new this[_cls](...args);
      return new JsInstanceMirror._(instance);
    }
    /** @return {core.List} */
    get superinterfaces() {
      let interfaces = this[_cls][dart.implements];
      if (interfaces == null) {
        return dart.list([], mirrors.ClassMirror);
      }
      dart.throw(new core.UnimplementedError("ClassMirror.superinterfaces unimplemented"));
    }
    /**
     * @param {core.Symbol} fieldName
     * @return {mirrors.InstanceMirror}
     */
    getField(fieldName) {
      return dart.throw(new core.UnimplementedError("ClassMirror.getField unimplemented"));
    }
    /**
     * @param {core.Symbol} memberName
     * @param {core.List} positionalArguments
     * @param {core.Map=} namedArguments
     * @return {mirrors.InstanceMirror}
     */
    invoke(memberName, positionalArguments, namedArguments) {
      if (namedArguments === void 0)
        namedArguments = null;
      return dart.throw(new core.UnimplementedError("ClassMirror.invoke unimplemented"));
    }
    /**
     * @param {mirrors.TypeMirror} other
     * @return {?boolean}
     */
    isAssignableTo(other) {
      return dart.throw(new core.UnimplementedError("ClassMirror.isAssignable unimplemented"));
    }
    /**
     * @param {mirrors.ClassMirror} other
     * @return {?boolean}
     */
    isSubclassOf(other) {
      return dart.throw(new core.UnimplementedError("ClassMirror.isSubclassOf unimplemented"));
    }
    /**
     * @param {mirrors.TypeMirror} other
     * @return {?boolean}
     */
    isSubtypeOf(other) {
      return dart.throw(new core.UnimplementedError("ClassMirror.isSubtypeOf unimplemented"));
    }
    /**
     * @param {core.Symbol} fieldName
     * @param {core.Object} value
     * @return {mirrors.InstanceMirror}
     */
    setField(fieldName, value) {
      return dart.throw(new core.UnimplementedError("ClassMirror.setField unimplemented"));
    }
    /** @return {?boolean} */
    get hasReflectedType() {
      return dart.throw(new core.UnimplementedError("ClassMirror.hasReflectedType unimplemented"));
    }
    /** @return {core.Map} */
    get instanceMembers() {
      return dart.throw(new core.UnimplementedError("ClassMirror.instanceMembers unimplemented"));
    }
    /** @return {?boolean} */
    get isAbstract() {
      return dart.throw(new core.UnimplementedError("ClassMirror.isAbstract unimplemented"));
    }
    /** @return {?boolean} */
    get isEnum() {
      return dart.throw(new core.UnimplementedError("ClassMirror.isEnum unimplemented"));
    }
    /** @return {?boolean} */
    get isOriginalDeclaration() {
      return dart.throw(new core.UnimplementedError("ClassMirror.isOriginalDeclaration unimplemented"));
    }
    /** @return {?boolean} */
    get isPrivate() {
      return dart.throw(new core.UnimplementedError("ClassMirror.isPrivate unimplemented"));
    }
    /** @return {?boolean} */
    get isTopLevel() {
      return dart.throw(new core.UnimplementedError("ClassMirror.isTopLevel unimplemented"));
    }
    /** @return {mirrors.SourceLocation} */
    get location() {
      return dart.throw(new core.UnimplementedError("ClassMirror.location unimplemented"));
    }
    /** @return {mirrors.ClassMirror} */
    get mixin() {
      return dart.throw(new core.UnimplementedError("ClassMirror.mixin unimplemented"));
    }
    /** @return {mirrors.TypeMirror} */
    get originalDeclaration() {
      return dart.throw(new core.UnimplementedError("ClassMirror.originalDeclaration unimplemented"));
    }
    /** @return {mirrors.DeclarationMirror} */
    get owner() {
      return dart.throw(new core.UnimplementedError("ClassMirror.owner unimplemented"));
    }
    /** @return {core.Symbol} */
    get qualifiedName() {
      return dart.throw(new core.UnimplementedError("ClassMirror.qualifiedName unimplemented"));
    }
    /** @return {core.Type} */
    get reflectedType() {
      return dart.throw(new core.UnimplementedError("ClassMirror.reflectedType unimplemented"));
    }
    /** @return {core.Map} */
    get staticMembers() {
      return dart.throw(new core.UnimplementedError("ClassMirror.staticMembers unimplemented"));
    }
    /** @return {mirrors.ClassMirror} */
    get superclass() {
      return dart.throw(new core.UnimplementedError("ClassMirror.superclass unimplemented"));
    }
    /** @return {core.List} */
    get typeArguments() {
      return dart.throw(new core.UnimplementedError("ClassMirror.typeArguments unimplemented"));
    }
    /** @return {core.List} */
    get typeVariables() {
      return dart.throw(new core.UnimplementedError("ClassMirror.typeVariables unimplemented"));
    }
  }
  JsClassMirror[dart.implements] = () => [mirrors.ClassMirror];
  dart.defineNamedConstructor(JsClassMirror, '_');
  dart.setSignature(JsClassMirror, {
    constructors: () => ({_: [JsClassMirror, [core.Type]]}),
    methods: () => ({
      newInstance: [mirrors.InstanceMirror, [core.Symbol, core.List], [core.Map$(core.Symbol, dart.dynamic)]],
      getField: [mirrors.InstanceMirror, [core.Symbol]],
      invoke: [mirrors.InstanceMirror, [core.Symbol, core.List], [core.Map$(core.Symbol, dart.dynamic)]],
      isAssignableTo: [core.bool, [mirrors.TypeMirror]],
      isSubclassOf: [core.bool, [mirrors.ClassMirror]],
      isSubtypeOf: [core.bool, [mirrors.TypeMirror]],
      setField: [mirrors.InstanceMirror, [core.Symbol, core.Object]]
    })
  });
  class JsTypeMirror extends core.Object {
    /**
     * @constructor
     * @param {core.Type} reflectedType
     * @return {JsTypeMirror}
     */
    _(reflectedType) {
      this.reflectedType = reflectedType;
      this.hasReflectedType = true;
    }
    /**
     * @param {mirrors.TypeMirror} other
     * @return {?boolean}
     */
    isAssignableTo(other) {
      return dart.throw(new core.UnimplementedError("TypeMirror.isAssignable unimplemented"));
    }
    /**
     * @param {mirrors.TypeMirror} other
     * @return {?boolean}
     */
    isSubtypeOf(other) {
      return dart.throw(new core.UnimplementedError("TypeMirror.isSubtypeOf unimplemented"));
    }
    /** @return {?boolean} */
    get isOriginalDeclaration() {
      return dart.throw(new core.UnimplementedError("TypeMirror.isOriginalDeclaration unimplemented"));
    }
    /** @return {?boolean} */
    get isPrivate() {
      return dart.throw(new core.UnimplementedError("TypeMirror.isPrivate unimplemented"));
    }
    /** @return {?boolean} */
    get isTopLevel() {
      return dart.throw(new core.UnimplementedError("TypeMirror.isTopLevel unimplemented"));
    }
    /** @return {mirrors.SourceLocation} */
    get location() {
      return dart.throw(new core.UnimplementedError("TypeMirror.location unimplemented"));
    }
    /** @return {core.List} */
    get metadata() {
      return dart.throw(new core.UnimplementedError("TypeMirror.metadata unimplemented"));
    }
    /** @return {mirrors.TypeMirror} */
    get originalDeclaration() {
      return dart.throw(new core.UnimplementedError("TypeMirror.originalDeclaration unimplemented"));
    }
    /** @return {mirrors.DeclarationMirror} */
    get owner() {
      return dart.throw(new core.UnimplementedError("TypeMirror.owner unimplemented"));
    }
    /** @return {core.Symbol} */
    get qualifiedName() {
      return dart.throw(new core.UnimplementedError("TypeMirror.qualifiedName unimplemented"));
    }
    /** @return {core.Symbol} */
    get simpleName() {
      return dart.throw(new core.UnimplementedError("TypeMirror.simpleName unimplemented"));
    }
    /** @return {core.List} */
    get typeArguments() {
      return dart.throw(new core.UnimplementedError("TypeMirror.typeArguments unimplemented"));
    }
    /** @return {core.List} */
    get typeVariables() {
      return dart.throw(new core.UnimplementedError("TypeMirror.typeVariables unimplemented"));
    }
  }
  JsTypeMirror[dart.implements] = () => [mirrors.TypeMirror];
  dart.defineNamedConstructor(JsTypeMirror, '_');
  dart.setSignature(JsTypeMirror, {
    constructors: () => ({_: [JsTypeMirror, [core.Type]]}),
    methods: () => ({
      isAssignableTo: [core.bool, [mirrors.TypeMirror]],
      isSubtypeOf: [core.bool, [mirrors.TypeMirror]]
    })
  });
  let _name = Symbol('_name');
  class JsParameterMirror extends core.Object {
    /**
     * @constructor
     * @param {string} _name
     * @param {core.Type} t
     * @param {core.List} annotations
     * @return {JsParameterMirror}
     */
    _(name, t, annotations) {
      this[_name] = name;
      this.type = new JsTypeMirror._(t);
      this.metadata = core.List$(mirrors.InstanceMirror).from(annotations[dartx.map](dart.fn(a => new JsInstanceMirror._(a), JsInstanceMirror, [dart.dynamic])));
    }
    /** @return {mirrors.InstanceMirror} */
    get defaultValue() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.defaultValues unimplemented"));
    }
    /** @return {?boolean} */
    get hasDefaultValue() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.hasDefaultValue unimplemented"));
    }
    /** @return {?boolean} */
    get isConst() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.isConst unimplemented"));
    }
    /** @return {?boolean} */
    get isFinal() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.isFinal unimplemented"));
    }
    /** @return {?boolean} */
    get isNamed() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.isNamed unimplemented"));
    }
    /** @return {?boolean} */
    get isOptional() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.isOptional unimplemented"));
    }
    /** @return {?boolean} */
    get isPrivate() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.isPrivate unimplemented"));
    }
    /** @return {?boolean} */
    get isStatic() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.isStatic unimplemented"));
    }
    /** @return {?boolean} */
    get isTopLevel() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.isTopLevel unimplemented"));
    }
    /** @return {mirrors.SourceLocation} */
    get location() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.location unimplemented"));
    }
    /** @return {mirrors.DeclarationMirror} */
    get owner() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.owner unimplemented"));
    }
    /** @return {core.Symbol} */
    get qualifiedName() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.qualifiedName unimplemented"));
    }
    /** @return {core.Symbol} */
    get simpleName() {
      return dart.throw(new core.UnimplementedError("ParameterMirror.simpleName unimplemented"));
    }
  }
  JsParameterMirror[dart.implements] = () => [mirrors.ParameterMirror];
  dart.defineNamedConstructor(JsParameterMirror, '_');
  dart.setSignature(JsParameterMirror, {
    constructors: () => ({_: [JsParameterMirror, [core.String, core.Type, core.List]]})
  });
  let _method = Symbol('_method');
  let _params = Symbol('_params');
  let _createParameterMirrorList = Symbol('_createParameterMirrorList');
  class JsMethodMirror extends core.Object {
    /**
     * @constructor
     * @param {JsClassMirror} cls
     * @return {JsMethodMirror}
     */
    _(cls, method) {
      this[_method] = method;
      this[_name] = getName(cls.simpleName);
      this[_params] = null;
      let ftype = exports._dart.classGetConstructorType(cls[_cls]);
      this[_params] = this[_createParameterMirrorList](ftype);
    }
    /** @return {core.Symbol} */
    get constructorName() {
      return core.Symbol.new('');
    }
    /** @return {core.List} */
    get parameters() {
      return this[_params];
    }
    /** @return {core.List} */
    [_createParameterMirrorList](ftype) {
      if (ftype == null) {
        return dart.list([], mirrors.ParameterMirror);
      }
      let args = dart.as(dart.dload(ftype, 'args'), core.List);
      let opts = dart.as(dart.dload(ftype, 'optionals'), core.List);
      let params = core.List$(mirrors.ParameterMirror).new(dart.notNull(args[dartx.length]) + dart.notNull(opts[dartx.length]));
      for (let i = 0; dart.notNull(i) < dart.notNull(args[dartx.length]); i = dart.notNull(i) + 1) {
        let type = args[dartx.get](i);
        let metadata = dart.dindex(dart.dload(ftype, 'metadata'), i);
        let param = new JsParameterMirror._('', dart.as(type, core.Type), dart.as(metadata, core.List));
        params[dartx.set](i, param);
      }
      for (let i = 0; dart.notNull(i) < dart.notNull(opts[dartx.length]); i = dart.notNull(i) + 1) {
        let type = opts[dartx.get](i);
        let metadata = dart.dindex(dart.dload(ftype, 'metadata'), dart.notNull(args[dartx.length]) + dart.notNull(i));
        let param = new JsParameterMirror._('', dart.as(type, core.Type), dart.as(metadata, core.List));
        params[dartx.set](dart.notNull(i) + dart.notNull(args[dartx.length]), param);
      }
      return params;
    }
    /** @return {?boolean} */
    get isAbstract() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isAbstract unimplemented"));
    }
    /** @return {?boolean} */
    get isConstConstructor() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isConstConstructor unimplemented"));
    }
    /** @return {?boolean} */
    get isConstructor() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isConstructor unimplemented"));
    }
    /** @return {?boolean} */
    get isFactoryConstructor() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isFactoryConstructor unimplemented"));
    }
    /** @return {?boolean} */
    get isGenerativeConstructor() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isGenerativeConstructor unimplemented"));
    }
    /** @return {?boolean} */
    get isGetter() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isGetter unimplemented"));
    }
    /** @return {?boolean} */
    get isOperator() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isOperator unimplemented"));
    }
    /** @return {?boolean} */
    get isPrivate() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isPrivate unimplemented"));
    }
    /** @return {?boolean} */
    get isRedirectingConstructor() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isRedirectingConstructor unimplemented"));
    }
    /** @return {?boolean} */
    get isRegularMethod() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isRegularMethod unimplemented"));
    }
    /** @return {?boolean} */
    get isSetter() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isSetter unimplemented"));
    }
    /** @return {?boolean} */
    get isStatic() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isStatic unimplemented"));
    }
    /** @return {?boolean} */
    get isSynthetic() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isSynthetic unimplemented"));
    }
    /** @return {?boolean} */
    get isTopLevel() {
      return dart.throw(new core.UnimplementedError("MethodMirror.isTopLevel unimplemented"));
    }
    /** @return {mirrors.SourceLocation} */
    get location() {
      return dart.throw(new core.UnimplementedError("MethodMirror.location unimplemented"));
    }
    /** @return {core.List} */
    get metadata() {
      return dart.throw(new core.UnimplementedError("MethodMirror.metadata unimplemented"));
    }
    /** @return {mirrors.DeclarationMirror} */
    get owner() {
      return dart.throw(new core.UnimplementedError("MethodMirror.owner unimplemented"));
    }
    /** @return {core.Symbol} */
    get qualifiedName() {
      return dart.throw(new core.UnimplementedError("MethodMirror.qualifiedName unimplemented"));
    }
    /** @return {mirrors.TypeMirror} */
    get returnType() {
      return dart.throw(new core.UnimplementedError("MethodMirror.returnType unimplemented"));
    }
    /** @return {core.Symbol} */
    get simpleName() {
      return dart.throw(new core.UnimplementedError("MethodMirror.simpleName unimplemented"));
    }
    /** @return {string} */
    get source() {
      return dart.throw(new core.UnimplementedError("MethodMirror.source unimplemented"));
    }
  }
  JsMethodMirror[dart.implements] = () => [mirrors.MethodMirror];
  dart.defineNamedConstructor(JsMethodMirror, '_');
  dart.setSignature(JsMethodMirror, {
    constructors: () => ({_: [JsMethodMirror, [JsClassMirror, dart.dynamic]]}),
    methods: () => ({[_createParameterMirrorList]: [core.List$(mirrors.ParameterMirror), [dart.dynamic]]})
  });
  // Exports:
  exports.getName = getName;
  exports.getSymbol = getSymbol;
  exports.reflect = reflect;
  exports.reflectType = reflectType;
  exports.JsInstanceMirror = JsInstanceMirror;
  exports.JsClassMirror = JsClassMirror;
  exports.JsTypeMirror = JsTypeMirror;
  exports.JsParameterMirror = JsParameterMirror;
  exports.JsMethodMirror = JsMethodMirror;
});
