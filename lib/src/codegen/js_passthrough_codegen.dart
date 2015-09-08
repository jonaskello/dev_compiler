library dev_compiler.src.codegen.js_passthrough_codegen;

import 'package:analyzer/analyzer.dart' hide ConstantEvaluator;
import 'package:analyzer/src/generated/ast.dart' hide ConstantEvaluator;

// import 'package:analyzer/src/generated/constant.dart';
import 'package:analyzer/src/generated/element.dart';

// TODO(jmesserly): import from its own package
import 'package:dev_compiler/src/js/js_ast.dart' as JS;
import 'package:dev_compiler/src/js/js_ast.dart' show js;

/// Hacked-up regexp that matches "// @internal.PassThrough\nimport 'dart:js';".
final RegExp _PASS_THROUGH_DART_JS_IMPORT = new RegExp(
    r'''//\s*@internal.PassThrough\s*\n\s*import\s*['"]dart:js['"]\s*;''');

/// Mixin with support for codegen of pass-through JavaScript interop.
///
/// As its name implies, pass-through interop does a super-naive 1:1 translation
/// of dart:js API calls, picking the closest JavaScript construct and not
/// caring about Dart vs. JavaScript semantics.
///
/// This is meant to help write parts of the JS runtime in Dart and must NOT
/// be used as general interop.
///
/// TODO(ochafik): Introduce intrinsics: JS_isDef(x), JS_isDefAndNotNull(x),
/// etc.
abstract class JsPassThroughCodegen {
  bool isLibraryConfiguredForPassThroughJsInterop(LibraryElement lib) =>
      lib.imports.any(
          (ImportElement e) => e.importedLibrary.name == "dart.js" &&
              _PASS_THROUGH_DART_JS_IMPORT.hasMatch(e.source.contents.data));

  JS.Expression emitPassThroughJsIndexedAssignment(
      AssignmentExpression expr, _visit(AstNode node)) => js.call("# = #", [
    emitPassThroughJsIndexExpression(expr.leftHandSide, _visit),
    _visit(expr.rightHandSide)
  ]);

  JS.Expression emitPassThroughJsIndexExpression(
      IndexExpression expr, _visit(AstNode node)) {
    var index = expr.index;
    if (isJsContext(expr.target)) {
      return index is SimpleStringLiteral
          ? new JS.Identifier(index.stringValue)
          : js.call("dart.global[#]", [_visit(index)]);
    } else {
      return js.call("#[#]", [_visit(expr.target), _visit(index)]);
    }
  }

  JS.Expression emitPassThroughJsInstanceCreation(
      InstanceCreationExpression expr, _visit(AstNode node)) {
    if (isJsArray(expr)) {
      if (expr.argumentList.arguments.isEmpty) {
        return new JS.ArrayInitializer([]);
      }
    } else if (isJsObject(expr)) {
      if (expr.constructorName.name == null) {
        final args = expr.argumentList.arguments;
        visitFirst() => _visit(args.first);

        switch (args.length) {
          case 1:
            return js.call("new #()", [visitFirst()]);
          case 2:
            final list = args[1];
            if (list is ListLiteral) {
              return js.call("new #(#)", [
                visitFirst(),
                list.elements.map(_visit).toList()
              ]);
            } else {
              return js.call(
                  "new (Function.prototype.bind.apply(#, [null, #]))()", [
                visitFirst(),
                _visit(list)
              ]);
            }
            break;
          default:
        }
      }
    }
    // TODO(ochafik): Support JsObject.fromBrowserObject?
    throw new StateError("Not implemented");
  }

  JS.Expression emitPassThroughJsMethodInvocation(
      MethodInvocation expr, _visit(AstNode node)) {
    NodeList args = expr.argumentList.arguments;
    assert(expr is! CascadeExpression);

    String name = expr.methodName.name;
    switch (name) {
      case "apply":
        isNamedExpr(f) => f is NamedExpression;
        isNotNamedExpr(f) => f is! NamedExpression;
        NamedExpression thisArg =
            args.any(isNamedExpr) ? args.firstWhere(isNamedExpr) : null;
        if (thisArg != null && thisArg.name.label.name != "thisArg") {
          throw new ArgumentError("Expected thisArg, got $thisArg");
        }
        Expression functionArgs =
            args.any(isNotNamedExpr) ? args.firstWhere(isNotNamedExpr) : null;

        if (thisArg == null &&
            (functionArgs == null || functionArgs is ListLiteral)) {
          return js.call("#(#)", [
            _visit(expr.target),
            functionArgs == null
                ? []
                : functionArgs.elements.map(_visit).toList()
          ]);
        } else {
          return js.call("#.apply(#, #)", [
            _visit(expr.target),
            thisArg == null ? new JS.LiteralNull() : _visit(thisArg.expression),
            _visit(functionArgs)
          ]);
        }
        break;
      case "callMethod":
        assert(args.length == 1 || args.length == 2);
        var methodName = _visit(args[0]);
        var methodArgs = args.length == 1 ? null : args[1];
        // TODO(ochafik): Remove this limitation: call Function.apply.
        if (methodArgs == null || methodArgs is ListLiteral) {
          return js.call("#[#](#)", [
            _visit(expr.target),
            methodName,
            methodArgs == null ? [] : methodArgs.elements.map(_visit).toList()
          ]);
        } else {
          // TODO(ochafik): optimize the case where target is a stable ident.
          return js.call(
              "((target, args) => target[#].apply(target, args))(#, #)", [
            methodName,
            _visit(expr.target),
            _visit(methodArgs)
          ]);
        }
        break;
      case "hasProperty":
        return js.call("# in #", [_visit(args.single), _visit(expr.target)]);
      case "deleteProperty":
        return js.call(
            "delete #[#]", [_visit(expr.target), _visit(args.single)]);
      case "instanceof":
        return js.call(
            "# instanceof #", [_visit(expr.target), _visit(args.single)]);
      default:
      // TODO: pass some methods through? (Array.prototype.map, Object.getProperties...).
    }
    throw new ArgumentError("Not implemented: $expr");
  }

  String _getJsName(Expression expr) {
    DartType type = expr?.bestType;
    String libName = type?.element?.library?.name;
    if (libName != "dart.js") return null;
    return type?.name;
  }

  bool isJsObject(Expression expr) {
    String name = _getJsName(expr);
    return name == "JsObject" || name == "JsArray" || name == "JsFunction";
  }

  bool isJsArray(Expression expr) => _getJsName(expr) == "JsArray";

  bool isJsFunction(Expression expr) => _getJsName(expr) == "JsFunction";

  bool isJsContext(Expression expr) =>
      expr is SimpleIdentifier && expr.name == "context" && isJsObject(expr);
}
