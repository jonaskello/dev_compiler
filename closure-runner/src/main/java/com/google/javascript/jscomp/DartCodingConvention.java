// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

package com.google.javascript.jscomp;

public class DartCodingConvention extends CodingConventions.Proxy {

  public DartCodingConvention() {
    this(CodingConventions.getDefault());
  }

  public DartCodingConvention(CodingConvention wrapped) {
    super(wrapped);

    // TODO(ochafik): Add some conventions.
  }
}