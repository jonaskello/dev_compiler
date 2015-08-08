Usage / test:
```
dart -c bin/devc.dart --out ~/devrunout ~/hello.dart
cd closure-runner
mvn package && java -jar target/dart-dev-compiler-closure-runner-0.1.0-SNAPSHOT.jar `find ~/devrunout -name '*.js'`
```