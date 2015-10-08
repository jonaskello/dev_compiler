// Copyright (c) 2012, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

library js_types;

import '../closure/closure_type.dart';

import '../js/js_ast.dart' as JS;
import 'dart_nodes.dart';

/// JavaScript type reference.
abstract class TypeRef extends JS.Visitable {
  @override accept(JS.NodeVisitor visitor) => visitor.visitTypeRef(this);
  @override void visitChildren(JS.NodeVisitor visitor) {}
}

abstract class TypeRefVisitor<T> {
  T visitTypeRef(TypeRef typeRef);
  T visitClosureTypeRef(ClosureTypeRef typeRef);
  T visitImportedTypeRef(ImportedTypeRef typeRef);
  T visitTypeParamRef(TypeParamRef typeRef);
  T visitGenericTypeRef(GenericTypeRef typeRef);
}

/// Used for interop (imported Closure libs) and for basic types.
/// TODO(ochafik): Merge [ClosureType] in this hierarchy.
class ClosureTypeRef extends TypeRef {
  ClosureType type;
  ClosureTypeRef(this.type);
  // TODO(ochafik): Visit sub-types here.
  @override void visitChildren(JS.NodeVisitor visitor) {}
}

/// Similar in mind to [MaybeQualifiedId], but not a JS [Node].
class ImportedTypeRef extends TypeRef {
  final String library;
  /// Note: the same type might be imported multiple times with different prefixes(?),
  /// so a pass might just walk through the imported refs and coalesce them, maybe respecting
  /// some of the original prefixes, then outputting modules as it wants / replacing
  /// those refs as needed.
  final String originalPrefix;
  final String name;
  ImportedTypeRef(this.library, this.originalPrefix, this.name);
}
/// Reference to a type parameter defined in a Dart class / method.
class TypeParamRef extends TypeRef {
  final DartDeclaration owner;
  final String name;
  TypeParamRef(this.owner, this.name);
}
class GenericTypeRef extends TypeRef {
  final TypeRef rawType;
  final List<TypeRef> typeParams;
  GenericTypeRef(this.rawType, this.typeParams);
  @override void visitChildren(JS.NodeVisitor visitor) {
    rawType.accept(visitor);
    typeParams.forEach((p) => p.accept(visitor));
  }
}
