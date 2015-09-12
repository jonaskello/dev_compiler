#!/bin/bash

set -eu

echo "main(args) { print('Hello, World'); }" > hello.dart

dart -c bin/devrun.dart --v8-binary=${NODE_BIN:-node} hello.dart | tee hello.dart.out
cat hello.dart.out | grep "Hello, World"

