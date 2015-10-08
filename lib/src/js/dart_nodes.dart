// Copyright (c) 2012, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

/// The pseudo-nodes defined here are not JS [Node] subclasses, but they are
/// still [Visitable] as they may contain nested JS [Node].
///
/// For instance, a [DartClassDeclaration] will contain JS [Fun] bodies for
/// its converted methods. A [DartMethodCall] will contain the converted JS
/// arguments of the method call, etc.
library dart_ast;

import '../closure/closure_type.dart';

import '../js/js_ast.dart';
import 'js_types.dart';
import 'package:dev_compiler/src/js/dart_nodes.dart';
// import 'package:dev_compiler/src/js/dart_nodes.dart';

class DartMethodCall extends Visitable {
  /// Can be this, an expression or null (for global functions).
  final Expression target;
  final String methodName;
  final List<Expression> arguments;
  /// Prepare for generic method calls.
  final List<TypeRef> typeArguments;
  /// If true, some dynamic call will be needed (which might involve a reference
  /// to the signature).
  final bool isUnknownMethod;
  DartMethodCall(this.target, this.methodName, this.arguments,
      {this.isUnknownMethod, this.typeArguments : const<TypeRef>[]});

  @override accept(NodeVisitor visitor) => null;

  @override void visitChildren(NodeVisitor visitor) {
    target?.accept(visitor);
    arguments.forEach((a) => a.accept(visitor));
    typeArguments.forEach((a) => a.accept(visitor));
  }
}

/// TODO(ochafik): Store [LibraryElement]?
class DartLibrary {
  final String name;
  final List<DartDeclaration> declarations;
  DartLibrary(this.name, this.declarations);
}

abstract class DartDeclaration extends Visitable {
  String get name;
  List<String> get genericTypeNames;
}

class DartTypedef extends DartDeclaration {
  final String name;
  final TypeRef returnType;
  final List<TypeRef> paramTypes;
  List<String> get genericTypeNames => const<String>[];

  DartTypedef(this.name, this.returnType, this.paramTypes);

  @override accept(NodeVisitor visitor) => null;

  @override void visitChildren(NodeVisitor visitor) {
    returnType?.accept(visitor);
    paramTypes.forEach((a) => a.accept(visitor));
  }
}

/// JS node that gathers the JS output of a Dart class.
/// This output is kept abstract in this node and needs to be lowered down to
/// "normal" JS nodes like [ClassDeclaration] and potentially other support
/// statements / function calls.
///
/// TODO(ochafik): Store [ClassElement]?
class DartClassDeclaration extends DartDeclaration {
  // final String comment;
  final String name;
  final TypeRef parentRef;
  final List<TypeRef> mixinRefs;
  final List<TypeRef> implementedRefs;
  final List<String> genericTypeNames;
  final List<DartCallableDeclaration> members;
  DartClassDeclaration(
      {this.name,
      this.parentRef,
      this.mixinRefs,
      this.implementedRefs,
      this.genericTypeNames,
      this.members}) {
    // TODO(ochafik): Check none of these are null.
  }

  @override accept(NodeVisitor visitor) => null;

  @override void visitChildren(NodeVisitor visitor) {
    parentRef?.accept(visitor);
    mixinRefs.forEach((a) => a.accept(visitor));
    implementedRefs.forEach((a) => a.accept(visitor));
    members.forEach((a) => a.accept(visitor));
  }
}

enum DartCallableKind {
  constructor,
  function,
  /// Note that the body of static fields is lazy.
  value,
  getter,
  setter
}

enum DartCallableStorage {
  topLevel,
  instanceMember,
  classMember
}

class DartModifiers {
  final bool isStatic;
  final bool isConst;
  final bool isFinal;
  DartModifiers(
      {this.isStatic : false,
      this.isConst : false,
      this.isFinal : false});
}

/// Representation of a "callable" Dart element such as fields, top-level values
/// and functions, constructors, methods, accessors.
/// TODO(ochafik): Store [ExecutableElement]?
class DartCallableDeclaration extends DartDeclaration {
  final String name;
  final DartModifiers modifiers;
  final DartCallableStorage storage;
  final DartCallableKind kind;
  List<String> get genericTypeNames => const<String>[];
  /// Can be a [Fun] for executable declarations (getters, functions), or any
  /// expression for fields / top-level vars.
  final Expression body;

  /// Left intentionally mutable for now. Some passes will update this.
  String comment;

  DartCallableDeclaration._(this.name, this.modifiers, this.kind, this.storage, this.body) {
    // Check body type.
    assert((body is Fun) || (kind == DartCallableKind.value));
    // Check params.
    switch (kind) {
      case DartCallableKind.getter:
        assert(body is Fun && (body as Fun).params.isEmpty);
        break;
      case DartCallableKind.setter:
        assert(body is Fun && (body as Fun).params.length == 1);
        break;
      default:
        break;
    }
  }

  @override accept(NodeVisitor visitor) => null;

  @override void visitChildren(NodeVisitor visitor) {
    body?.accept(visitor);
  }
}

// Dart AST creation helpers.
// TODO(ochafik): Simplify? Remove? Beautify?

PlaceholderExpression newDartKnownMethodCall(Expression target, String methodName, List<Expression> arguments) =>
    new PlaceholderExpression(
        new DartMethodCall(target, methodName, arguments, isUnknownMethod: false));

PlaceholderExpression newDartUnknownMethodCall(Expression target, String methodName, List<Expression> arguments) =>
    new PlaceholderExpression(
        new DartMethodCall(target, methodName, arguments, isUnknownMethod: false));

DartCallableDeclaration newDartInstanceField(String name, DartModifiers modifiers) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.value, DartCallableStorage.instanceMember, null);

DartCallableDeclaration newDartStaticField(String name, DartModifiers modifiers, Expression body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.value, DartCallableStorage.classMember, body);

DartCallableDeclaration newDartTopLevelValue(String name, DartModifiers modifiers, Expression body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.value, DartCallableStorage.topLevel, body);

DartCallableDeclaration newDartTopLevelFunction(String name, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.function, DartCallableStorage.topLevel, body);

DartCallableDeclaration newDartInstanceMethod(String name, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.function, DartCallableStorage.instanceMember, body);

DartCallableDeclaration newDartStaticMethod(String name, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.function, DartCallableStorage.classMember, body);

DartCallableDeclaration newDartInstanceGetter(String name, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.getter, DartCallableStorage.instanceMember, body);

DartCallableDeclaration newDartStaticGetter(String name, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.getter, DartCallableStorage.classMember, body);

DartCallableDeclaration newDartInstanceSetter(String name, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.setter, DartCallableStorage.instanceMember, body);

DartCallableDeclaration newDartStaticSetter(String name, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(name, modifiers, DartCallableKind.setter, DartCallableStorage.classMember, body);
