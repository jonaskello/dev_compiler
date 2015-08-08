// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

package com.google.javascript.jscomp;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Runs the Closure Compiler with Dart passes and coding conventions.
 * 
 * <p>TODO(ochafik): Merge to official Closure when it's ready.
 *
 * @author ochafik@google.com (Olivier Chafik)
 */
public class DartJsCompilerRunner {
  public static void main(String[] args) {
    final boolean rename = true;
    
    List<String> argsList = new ArrayList<>();
    argsList.addAll(Arrays.asList(
        "--language_in=ECMASCRIPT6_STRICT",
        // "--warning_level=VERBOSE",
        "-O=ADVANCED"
    ));
    argsList.addAll(Arrays.asList(args));
    
    new CommandLineRunner(argsList.toArray(new String[argsList.size()])) {
      @Override
      protected CompilerOptions createOptions() {
        CompilerOptions options = super.createOptions();
        if (!rename) {
          options.setVariableRenaming(VariableRenamingPolicy.OFF);
          options.setPropertyRenaming(PropertyRenamingPolicy.OFF);
          options.setGeneratePseudoNames(true);
          options.setLabelRenaming(false);
        }
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
