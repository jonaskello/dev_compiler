// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

package com.google.javascript.jscomp;

import java.io.IOException;

/**
 * Runs the Closure Compiler with Dart passes and coding conventions.
 * 
 * <p>TODO(ochafik): Merge to official Closure when it's ready.
 */
public class DartJsCompilerRunner {
  public static void main(String[] args) {
    new CommandLineRunner(args) {
      @Override
      protected CompilerOptions createOptions() {
        CompilerOptions options = super.createOptions();
        options.setCodingConvention(
            new DartCodingConvention(options.getCodingConvention()));
        return options;
      }

      @Override
      protected void setRunOptions(CompilerOptions options)
          throws AbstractCommandLineRunner.FlagUsageException, IOException {
        super.setRunOptions(options);
        getCompiler().setPassConfig(new DartPassConfig(options));
      }
    }.run();
  }
}
