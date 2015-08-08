// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

package com.google.javascript.jscomp;

import static com.google.common.base.Preconditions.checkArgument;
    
import com.google.javascript.jscomp.NodeTraversal.AbstractPreOrderCallback;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Experimental pass / playground for Dart Dev Compiler-specific needs.
 */
public class DartPass extends AbstractPreOrderCallback implements HotSwapCompilerPass {
  final AbstractCompiler compiler;

  static final DiagnosticType REMOVED_UNSUPPORTED_CODE = DiagnosticType.warning(
      "REMOVED_UNSUPPORTED_CODE",
      "Removed unsupported code.");
  static final DiagnosticType REWROTE_UNSUPPORTED_CODE = DiagnosticType.warning(
      "REWROTE_UNSUPPORTED_CODE",
      "Rewrote unsupported code.");
  
  static final DiagnosticType NEED_TO_REMOVE_UNSUPPORTED_CODE = DiagnosticType.error(
      "NEED_TO_REMOVE_UNSUPPORTED_CODE",
      "Will need to remove unsupported code.");
  
  static final DiagnosticType INTERNAL_ERROR = DiagnosticType.error(
      "INTERNAL_ERROR",
      "Internal error triggered by this code.");
  
  static final DiagnosticType UNEXPECTED_NODE_TYPE = DiagnosticType.error(
      "UNEXPECTED_NODE_TYPE",
      "Expected node type {0}, got {1} for {2}: {3}.");

  // TODO(ochafik): This is temporary, DO NOT MERGE.
  public static final boolean REMOVE_SUPER_CALLS =
      "1".equals(System.getenv("CLOSURE_DDC_REMOVE_SUPER_CALLS"));
  
  public DartPass(AbstractCompiler compiler) {
    this.compiler = compiler;
  }

  @Override
  public void process(Node externs, Node root) {
    hotSwapScript(root, null);
//    NodeTraversal.traverse(compiler, root, this);
  }

  @Override
  public void hotSwapScript(Node scriptRoot, Node originalRoot) {
    NodeTraversal.traverse(compiler, scriptRoot, this);
  }
  
  @Override
  public boolean shouldTraverse(NodeTraversal t, Node node, Node parent) {
    if (node.isCall()) {
      Iterator<Node> childrenIt = node.children().iterator();
      Node callee = childrenIt.next();//node.getFirstChild();
      if (callee.matchesQualifiedName("dart_library.library")) {
        visitDartLibraryDeclaration(t, node, parent, childrenIt);
      }
    }
    return true;
  }
  
  @Override
  public void visit(NodeTraversal t, Node node, Node parent) {
    if (node.isCall()) {
      Iterator<Node> childrenIt = node.children().iterator();
      Node callee = childrenIt.next();//node.getFirstChild();
      if (callee.matchesQualifiedName("dart_library.library")) {
        visitDartLibraryDeclaration(t, node, parent, childrenIt);
      }
    }
    
    if (REMOVE_SUPER_CALLS && node.isSuper()) {
       rewriteUnsupportedSuper(node, parent);
    }
//    if (node.isClass()) {
//      removeComputedProperties(node);
//    }
  }

  private void removeUnsupportedNode(Node node, String msg) {
    compiler.report(JSError.make(node, REMOVED_UNSUPPORTED_CODE, msg));
    Node parent = node.getParent();
    parent.replaceChild(node, IR.empty());
    compiler.reportChangeToEnclosingScope(parent);
  }

  private void rewriteUnsupportedSuper(Node node, Node parent) {
    Node enclosingCall = parent;
    Node potentialCallee = node;
    if (!parent.isCall()) {
      enclosingCall = parent.getParent();
      potentialCallee = parent;
    }
    if (!enclosingCall.isCall() || enclosingCall.getFirstChild() != potentialCallee) {
      removeUnsupportedNode(node.getParent(), "Only calls to super or to a method of super are supported.");
    }
  }

//  private void removeComputedProperties(Node node) {
//    for (Node member : getChildren(node)) {
//      if (member.getBooleanProp(Node.COMPUTED_PROP_GETTER)
//          || member.getBooleanProp(Node.COMPUTED_PROP_SETTER)) {
//
//        removeUnsupportedNode(member, 
//            "computed getter or setter in class definition");
//      }
//    }
//  }

  private List<String> stringArrayToList(Node arrayLit) {
    checkArgument(arrayLit.isArrayLit());
    List<String> res = new ArrayList<>();
    for (Node item : arrayLit.children()) {
      checkArgument(item.isString());
      res.add(item.getString());
    }

    return res;
  }
  
  /** Transforms names from file-like to dotted. */
  private Node transformModuleName(Node node) {
    String name = checkStringNode(node, "module name").getString();
    return IR.string(name.replace('/', '.')).srcref(node);
  }
  
  /**
   * This transforms:
   * <pre>{@code
   *   dart_library.library('foo/bar', null, ['baz/bam'], [],
   *       function(exports, dart, bam) { ... });
   * }</pre>
   * 
   * To:
   * <pre>{@code
   *   goog.module('foo.bar');
   *   let dart = goog.require('dart.core');
   *   let bam = goog.require('baz.bam');
   *   ...
   * }</pre>
   */
  private void visitDartLibraryDeclaration(NodeTraversal t, Node node, Node parent, Iterator<Node> paramIt) {
    Node nameNode = checkStringNode(paramIt.next(), "module name");
    Node defaultValueNode = checkNullNode(paramIt.next(), "defaultValue");
    Node imports = checkArrayLitNode(paramIt.next(), "imports");
    Node lazyImports = checkArrayLitNode(paramIt.next(), "lazyImports");
    Node loaderNode = checkFunctionNode(paramIt.next(), "loader");
    
    checkArgument(!paramIt.hasNext());
    
    System.err.println("Got Module " + nameNode.getString()
        + " with imports " + stringArrayToList(imports)
        + " and lazy imports " + stringArrayToList(lazyImports));
    
    Node loaderParamList = checkParamListNode(loaderNode.getChildAtIndex(1), "loader paramList");
    checkArgument(loaderParamList.getFirstChild().getString().equals("exports"));

    Node loaderBody = loaderNode.getChildAtIndex(2);
    checkArgument(loaderBody.isBlock());

    int importCount = imports.getChildCount() + lazyImports.getChildCount();
    int paramCount = loaderParamList.getChildCount();
    checkArgument(paramCount == importCount + 1);

    List<Node> statements = new ArrayList<>();
    
    statements.add(
        IR.exprResult(
            IR.call(
                IR.getprop(IR.name("goog"), "module").srcref(node),
                transformModuleName(nameNode)
            ).srcref(node)
        ).srcref(node)
    );

    for (int iImport = 0; iImport < importCount; iImport++) {
      Node importName = checkStringNode(
          iImport < imports.getChildCount()
              ? imports.getChildAtIndex(iImport)
              : lazyImports.getChildAtIndex(iImport - imports.getChildCount()),
          "required name");
 
      Node param = loaderParamList.getChildAtIndex(iImport + 1);
      
      statements.add(
          IR.let(
              param.cloneTree().srcref(param),
              IR.call(
                  IR.getprop(IR.name("goog"), "require").srcref(importName),
                  transformModuleName(importName)
              ).srcref(importName)
          ).srcref(importName)
      );
    }
    
//    Node loaderBodyCopy = loaderBody.cloneTree().srcref(loaderBody);
    // TODO test it's `return exports`
    for (Node child : loaderBody.children()) {
//      if (child.isReturn()) {
//        System.err.print("DROPPING RETURN: " + print(child));
//        loaderBodyCopy.removeChild(child);
//      }
//      if (!child.isReturn()) {
        statements.add(child.cloneTree().srcref(child));
        System.err.println("type: " + Token.name(child.getType()));
//      }
    }
//    statements.add(loaderBodyCopy);
    
    Node script = IR.block(normalizeStatementsForIR(statements)).srcref(node);
//    System.err.print("OUTPUT:\n" + print(script));
    
    node.getParent().replaceChild(node, script);
  }
  
  
  /** TODO(ochafik): Make {@link IR#mayBeStatementNoReturn} accept LET. */
  Node normalizeStatementsForIR(List<Node> statements) {
    List<Node> fixedStatements = new ArrayList<>();
    for (Node statement: statements) {
      if (statement.isLet()) {
        Node lhs = statement.getFirstChild().getFirstChild();
        Node rhs = statement.getFirstChild().getLastChild();
        System.out.println("EXPR = " + print(statement) + ", LHS = " + print(lhs) + ", RHS = " + print(rhs));
        statement = IR.var(
            lhs.cloneTree().srcref(lhs),
            rhs.cloneTree().srcref(rhs));
      }
      fixedStatements.add(statement);
    }
    return IR.block(fixedStatements);
  }
  
  String print(Node n) {
    return new CodePrinter.Builder(n)
        .setPrettyPrint(true)
        .build();
  }
  Node checkNode(Node node, int tokenType, String name) {
    if (node == null || node.getType() != tokenType) {
      compiler.report(JSError.make(node, UNEXPECTED_NODE_TYPE,
          Token.name(tokenType),
          node == null ? "?" : Token.name(node.getType()),
          name,
          node == null ? "?" : print(node)));
    }
    return node;
  }
  Node checkStringNode(Node node, String name) {
    return checkNode(node, Token.STRING, name);
  } 
  Node checkParamListNode(Node node, String name) {
    return checkNode(node, Token.PARAM_LIST, name);
  } 
  private Node checkArrayLitNode(Node node, String name) {
    return checkNode(node, Token.ARRAYLIT, name);
  }
  private Node checkFunctionNode(Node node, String name) {
    return checkNode(node, Token.FUNCTION, name);
  }
  private Node checkNullNode(Node node, String name) {
    return checkNode(node, Token.NULL, name);
  }
  private Node checkReturnNode(Node node, String name) {
    return checkNode(node, Token.RETURN, name);
  }
}