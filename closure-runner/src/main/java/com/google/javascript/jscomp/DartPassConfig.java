// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

package com.google.javascript.jscomp;

import java.util.List;

public class DartPassConfig extends PassConfig.PassConfigDelegate {
    public DartPassConfig(CompilerOptions options) {
        super(new DefaultPassConfig(options));
    }

    @Override
    protected List<PassFactory> getChecks() {
        List<PassFactory> checks = super.getChecks();
        checks.add(0, dartPass);
        return checks;
    }

    final static PassFactory dartPass = new PassFactory("dartPass", true) {
        @Override
        CompilerPass create(AbstractCompiler compiler) {
            return new DartPass(compiler);
        }
    };
}