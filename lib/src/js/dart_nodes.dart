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
import 'package:analyzer/src/generated/element.dart';
import 'package:dev_compiler/src/info.dart';

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
  final LibraryUnit libraryUnit;
  final List<DartLibraryPart> parts;
  DartLibrary(this.libraryUnit, this.parts);
}
class DartLibraryPart {
  /// Note: has uri.
  final CompilationUnitElement compilationUnitElement;
  final List<DartDeclaration> declarations;
  DartLibraryPart(this.compilationUnitElement, this.declarations);
}

abstract class DartDeclaration extends Visitable {
  Element get element;
  // String get name => element.name;
  List<String> get genericTypeNames;
}

class DartTypedef extends DartDeclaration {
  final FunctionTypeAliasElement element;
  final TypeRef returnType;
  final List<TypeRef> paramTypes;
  List<String> get genericTypeNames => const<String>[];

  DartTypedef(this.element, this.returnType, this.paramTypes);

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
  final ClassElement element;
  final TypeRef parentRef;
  final List<TypeRef> mixinRefs;
  final List<TypeRef> implementedRefs;
  final List<String> genericTypeNames;
  final List<DartCallableDeclaration> members;
  DartClassDeclaration(
      {this.element,
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
  /// A [ClassMemberElement] or [VariableElement].
  final Element element;
  // final String name;
  final DartModifiers modifiers;
  final DartCallableStorage storage;
  final DartCallableKind kind;
  List<String> get genericTypeNames => const<String>[];
  /// Can be a [Fun] for executable declarations (getters, functions), or any
  /// expression for fields / top-level vars.
  final Expression body;

  /// Left intentionally mutable for now. Some passes will update this.
  String comment;

  DartCallableDeclaration._(this.element, this.modifiers, this.kind, this.storage, this.body) {
    assert(element is ClassMemberElement || element is VariableElement);
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

DartCallableDeclaration newDartInstanceField(FieldElement element, DartModifiers modifiers) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.value, DartCallableStorage.instanceMember, null);

DartCallableDeclaration newDartStaticField(FieldElement element, DartModifiers modifiers, Expression body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.value, DartCallableStorage.classMember, body);

DartCallableDeclaration newDartTopLevelValue(TopLevelVariableElement element, DartModifiers modifiers, Expression body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.value, DartCallableStorage.topLevel, body);

DartCallableDeclaration newDartTopLevelFunction(FunctionElement element, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.function, DartCallableStorage.topLevel, body);

DartCallableDeclaration newDartInstanceMethod(MethodElement element, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.function, DartCallableStorage.instanceMember, body);

DartCallableDeclaration newDartStaticMethod(MethodElement element, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.function, DartCallableStorage.classMember, body);

DartCallableDeclaration newDartInstanceGetter(PropertyAccessorElement element, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.getter, DartCallableStorage.instanceMember, body);

DartCallableDeclaration newDartStaticGetter(PropertyAccessorElement element, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.getter, DartCallableStorage.classMember, body);

DartCallableDeclaration newDartInstanceSetter(PropertyAccessorElement element, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.setter, DartCallableStorage.instanceMember, body);

DartCallableDeclaration newDartStaticSetter(PropertyAccessorElement element, DartModifiers modifiers, Fun body) =>
    new DartCallableDeclaration._(element, modifiers, DartCallableKind.setter, DartCallableStorage.classMember, body);
