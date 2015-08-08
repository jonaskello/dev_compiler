dart_library.library('dart/convert', null, /* Imports */[
  "dart_runtime/dart",
  'dart/core',
  'dart/async',
  'dart/typed_data',
  'dart/_internal',
  'dart/collection'
], /* Lazy imports */[
], function(exports, dart, core, async, typed_data, _internal, collection) {
  'use strict';
  let dartx = dart.dartx;
  let Codec$ = dart.generic(function(S, T) {
    class Codec extends core.Object {
      /**
       * @constructor
       * @return {Codec}
       */
      Codec() {
      }
      encode(input) {
        dart.as(input, S);
        return this.encoder.convert(input);
      }
      decode(encoded) {
        dart.as(encoded, T);
        return this.decoder.convert(encoded);
      }
      /**
       * @param {Codec} other
       * @return {Codec}
       */
      fuse(other) {
        dart.as(other, Codec$(T, dart.dynamic));
        return new (_FusedCodec$(S, T, dart.dynamic))(this, other);
      }
      /** @return {Codec} */
      get inverted() {
        return new (_InvertedCodec$(T, S))(this);
      }
    }
    dart.setSignature(Codec, {
      constructors: () => ({Codec: [Codec$(S, T), []]}),
      methods: () => ({
        encode: [T, [S]],
        decode: [S, [T]],
        fuse: [Codec$(S, dart.dynamic), [Codec$(T, dart.dynamic)]]
      })
    });
    return Codec;
  });
  let Codec = Codec$();
  class Encoding extends Codec$(core.String, core.List$(core.int)) {
    /**
     * @constructor
     * @return {Encoding}
     */
    Encoding() {
      super.Codec();
    }
    /**
     * @param {async.Stream} byteStream
     * @return {async.Future}
     */
    decodeStream(byteStream) {
      return dart.as(byteStream.transform(this.decoder).fold(new core.StringBuffer(), dart.fn((buffer, string) => ((() => {
        dart.dsend(buffer, 'write', string);
        return buffer;
      })()))).then(dart.fn(buffer => dart.toString(buffer), core.String, [dart.dynamic])), async.Future$(core.String));
    }
    /**
     * @param {string} name
     * @return {Encoding}
     */
    static getByName(name) {
      if (name == null)
        return null;
      name = name[dartx.toLowerCase]();
      return Encoding._nameToEncoding.get(name);
    }
  }
  dart.setSignature(Encoding, {
    constructors: () => ({Encoding: [Encoding, []]}),
    methods: () => ({decodeStream: [async.Future$(core.String), [async.Stream$(core.List$(core.int))]]}),
    statics: () => ({getByName: [Encoding, [core.String]]}),
    names: ['getByName']
  });
  let _allowInvalid = Symbol('_allowInvalid');
  class AsciiCodec extends Encoding {
    /**
     * @constructor
     * @param {{allowInvalid: (?boolean|undefined)}=} opts
     * @return {AsciiCodec}
     */
    AsciiCodec(opts) {
      let allowInvalid = opts && 'allowInvalid' in opts ? opts.allowInvalid : false;
      this[_allowInvalid] = allowInvalid;
      super.Encoding();
    }
    /** @return {string} */
    get name() {
      return "us-ascii";
    }
    /**
     * @param {core.List} bytes
     * @param {{allowInvalid: (?boolean|undefined)}=} opts
     * @return {string}
     */
    decode(bytes, opts) {
      let allowInvalid = opts && 'allowInvalid' in opts ? opts.allowInvalid : null;
      if (allowInvalid == null)
        allowInvalid = this[_allowInvalid];
      if (dart.notNull(allowInvalid)) {
        return dart.const(new AsciiDecoder({allowInvalid: true})).convert(bytes);
      } else {
        return dart.const(new AsciiDecoder({allowInvalid: false})).convert(bytes);
      }
    }
    /** @return {AsciiEncoder} */
    get encoder() {
      return dart.const(new AsciiEncoder());
    }
    /** @return {AsciiDecoder} */
    get decoder() {
      return dart.notNull(this[_allowInvalid]) ? dart.const(new AsciiDecoder({allowInvalid: true})) : dart.const(new AsciiDecoder({allowInvalid: false}));
    }
  }
  dart.setSignature(AsciiCodec, {
    constructors: () => ({AsciiCodec: [AsciiCodec, [], {allowInvalid: core.bool}]}),
    methods: () => ({decode: [core.String, [core.List$(core.int)], {allowInvalid: core.bool}]})
  });
  let ASCII = dart.const(new AsciiCodec());
  let _ASCII_MASK = 127;
  let Converter$ = dart.generic(function(S, T) {
    class Converter extends core.Object {
      /**
       * @constructor
       * @return {Converter}
       */
      Converter() {
      }
      /**
       * @param {Converter} other
       * @return {Converter}
       */
      fuse(other) {
        dart.as(other, Converter$(T, dart.dynamic));
        return new (_FusedConverter$(S, T, dart.dynamic))(this, other);
      }
      /**
       * @param {core.Sink} sink
       * @return {ChunkedConversionSink}
       */
      startChunkedConversion(sink) {
        dart.as(sink, core.Sink$(T));
        dart.throw(new core.UnsupportedError(`This converter does not support chunked conversions: ${this}`));
      }
      /**
       * @param {async.Stream} source
       * @return {async.Stream}
       */
      bind(source) {
        dart.as(source, async.Stream$(S));
        return async.Stream$(T).eventTransformed(source, dart.fn((sink => new _ConverterStreamEventSink(this, sink)).bind(this), _ConverterStreamEventSink, [async.EventSink]));
      }
    }
    Converter[dart.implements] = () => [async.StreamTransformer$(S, T)];
    dart.setSignature(Converter, {
      constructors: () => ({Converter: [Converter$(S, T), []]}),
      methods: () => ({
        fuse: [Converter$(S, dart.dynamic), [Converter$(T, dart.dynamic)]],
        startChunkedConversion: [ChunkedConversionSink, [core.Sink$(T)]],
        bind: [async.Stream$(T), [async.Stream$(S)]]
      })
    });
    return Converter;
  });
  let Converter = Converter$();
  let _subsetMask = Symbol('_subsetMask');
  class _UnicodeSubsetEncoder extends Converter$(core.String, core.List$(core.int)) {
    /**
     * @constructor
     * @param {?number} _subsetMask
     * @return {_UnicodeSubsetEncoder}
     */
    _UnicodeSubsetEncoder(subsetMask) {
      this[_subsetMask] = subsetMask;
      super.Converter();
    }
    /**
     * @param {string} string
     * @param {?number=} start
     * @param {?number=} end
     * @return {core.List}
     */
    convert(string, start, end) {
      if (start === void 0)
        start = 0;
      if (end === void 0)
        end = null;
      let stringLength = string[dartx.length];
      core.RangeError.checkValidRange(start, end, stringLength);
      if (end == null)
        end = stringLength;
      let length = dart.notNull(end) - dart.notNull(start);
      let result = typed_data.Uint8List.new(length);
      for (let i = 0; dart.notNull(i) < dart.notNull(length); i = dart.notNull(i) + 1) {
        let codeUnit = string[dartx.codeUnitAt](dart.notNull(start) + dart.notNull(i));
        if ((dart.notNull(codeUnit) & ~dart.notNull(this[_subsetMask])) != 0) {
          dart.throw(new core.ArgumentError("String contains invalid characters."));
        }
        result[dartx.set](i, codeUnit);
      }
      return dart.as(result, core.List$(core.int));
    }
    /**
     * @param {core.Sink} sink
     * @return {StringConversionSink}
     */
    startChunkedConversion(sink) {
      if (!dart.is(sink, ByteConversionSink)) {
        sink = ByteConversionSink.from(sink);
      }
      return new _UnicodeSubsetEncoderSink(this[_subsetMask], dart.as(sink, ByteConversionSink));
    }
    /**
     * @param {async.Stream} stream
     * @return {async.Stream}
     */
    bind(stream) {
      return super.bind(stream);
    }
  }
  dart.setSignature(_UnicodeSubsetEncoder, {
    constructors: () => ({_UnicodeSubsetEncoder: [_UnicodeSubsetEncoder, [core.int]]}),
    methods: () => ({
      convert: [core.List$(core.int), [core.String], [core.int, core.int]],
      startChunkedConversion: [StringConversionSink, [core.Sink$(core.List$(core.int))]],
      bind: [async.Stream$(core.List$(core.int)), [async.Stream$(core.String)]]
    })
  });
  class AsciiEncoder extends _UnicodeSubsetEncoder {
    /**
     * @constructor
     * @return {AsciiEncoder}
     */
    AsciiEncoder() {
      super._UnicodeSubsetEncoder(_ASCII_MASK);
    }
  }
  dart.setSignature(AsciiEncoder, {
    constructors: () => ({AsciiEncoder: [AsciiEncoder, []]})
  });
  class StringConversionSinkMixin extends core.Object {
    /** @param {string} str */
    add(str) {
      return this.addSlice(str, 0, str[dartx.length], false);
    }
    /**
     * @param {?boolean} allowMalformed
     * @return {ByteConversionSink}
     */
    asUtf8Sink(allowMalformed) {
      return new _Utf8ConversionSink(this, allowMalformed);
    }
    /** @return {ClosableStringSink} */
    asStringSink() {
      return new _StringConversionSinkAsStringSinkAdapter(this);
    }
  }
  StringConversionSinkMixin[dart.implements] = () => [StringConversionSink];
  dart.setSignature(StringConversionSinkMixin, {
    methods: () => ({
      add: [dart.void, [core.String]],
      asUtf8Sink: [ByteConversionSink, [core.bool]],
      asStringSink: [ClosableStringSink, []]
    })
  });
  class StringConversionSinkBase extends StringConversionSinkMixin {}
  let _sink = Symbol('_sink');
  class _UnicodeSubsetEncoderSink extends StringConversionSinkBase {
    /**
     * @constructor
     * @param {?number} _subsetMask
     * @param {ByteConversionSink} _sink
     * @return {_UnicodeSubsetEncoderSink}
     */
    _UnicodeSubsetEncoderSink(subsetMask, sink) {
      this[_subsetMask] = subsetMask;
      this[_sink] = sink;
    }
    close() {
      this[_sink].close();
    }
    /**
     * @param {string} source
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(source, start, end, isLast) {
      core.RangeError.checkValidRange(start, end, source[dartx.length]);
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        let codeUnit = source[dartx.codeUnitAt](i);
        if ((dart.notNull(codeUnit) & ~dart.notNull(this[_subsetMask])) != 0) {
          dart.throw(new core.ArgumentError(`Source contains invalid character with code point: ${codeUnit}.`));
        }
      }
      this[_sink].add(source[dartx.codeUnits][dartx.sublist](start, end));
      if (dart.notNull(isLast)) {
        this.close();
      }
    }
  }
  dart.setSignature(_UnicodeSubsetEncoderSink, {
    constructors: () => ({_UnicodeSubsetEncoderSink: [_UnicodeSubsetEncoderSink, [core.int, ByteConversionSink]]}),
    methods: () => ({
      close: [dart.void, []],
      addSlice: [dart.void, [core.String, core.int, core.int, core.bool]]
    })
  });
  let _convertInvalid = Symbol('_convertInvalid');
  class _UnicodeSubsetDecoder extends Converter$(core.List$(core.int), core.String) {
    /**
     * @constructor
     * @param {?boolean} _allowInvalid
     * @param {?number} _subsetMask
     * @return {_UnicodeSubsetDecoder}
     */
    _UnicodeSubsetDecoder(allowInvalid, subsetMask) {
      this[_allowInvalid] = allowInvalid;
      this[_subsetMask] = subsetMask;
      super.Converter();
    }
    /**
     * @param {core.List} bytes
     * @param {?number=} start
     * @param {?number=} end
     * @return {string}
     */
    convert(bytes, start, end) {
      if (start === void 0)
        start = 0;
      if (end === void 0)
        end = null;
      let byteCount = bytes[dartx.length];
      core.RangeError.checkValidRange(start, end, byteCount);
      if (end == null)
        end = byteCount;
      let length = dart.notNull(end) - dart.notNull(start);
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        let byte = bytes[dartx.get](i);
        if ((dart.notNull(byte) & ~dart.notNull(this[_subsetMask])) != 0) {
          if (!dart.notNull(this[_allowInvalid])) {
            dart.throw(new core.FormatException(`Invalid value in input: ${byte}`));
          }
          return this[_convertInvalid](bytes, start, end);
        }
      }
      return core.String.fromCharCodes(bytes, start, end);
    }
    /**
     * @param {core.List} bytes
     * @param {?number} start
     * @param {?number} end
     * @return {string}
     */
    [_convertInvalid](bytes, start, end) {
      let buffer = new core.StringBuffer();
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        let value = bytes[dartx.get](i);
        if ((dart.notNull(value) & ~dart.notNull(this[_subsetMask])) != 0)
          value = 65533;
        buffer.writeCharCode(value);
      }
      return dart.toString(buffer);
    }
    /**
     * @param {async.Stream} stream
     * @return {async.Stream}
     */
    bind(stream) {
      return super.bind(stream);
    }
  }
  dart.setSignature(_UnicodeSubsetDecoder, {
    constructors: () => ({_UnicodeSubsetDecoder: [_UnicodeSubsetDecoder, [core.bool, core.int]]}),
    methods: () => ({
      convert: [core.String, [core.List$(core.int)], [core.int, core.int]],
      [_convertInvalid]: [core.String, [core.List$(core.int), core.int, core.int]],
      bind: [async.Stream$(core.String), [async.Stream$(core.List$(core.int))]]
    })
  });
  class AsciiDecoder extends _UnicodeSubsetDecoder {
    /**
     * @constructor
     * @param {{allowInvalid: (?boolean|undefined)}=} opts
     * @return {AsciiDecoder}
     */
    AsciiDecoder(opts) {
      let allowInvalid = opts && 'allowInvalid' in opts ? opts.allowInvalid : false;
      super._UnicodeSubsetDecoder(allowInvalid, _ASCII_MASK);
    }
    /**
     * @param {core.Sink} sink
     * @return {ByteConversionSink}
     */
    startChunkedConversion(sink) {
      let stringSink = null;
      if (dart.is(sink, StringConversionSink)) {
        stringSink = sink;
      } else {
        stringSink = StringConversionSink.from(sink);
      }
      if (dart.notNull(this[_allowInvalid])) {
        return new _ErrorHandlingAsciiDecoderSink(stringSink.asUtf8Sink(false));
      } else {
        return new _SimpleAsciiDecoderSink(stringSink);
      }
    }
  }
  dart.setSignature(AsciiDecoder, {
    constructors: () => ({AsciiDecoder: [AsciiDecoder, [], {allowInvalid: core.bool}]}),
    methods: () => ({startChunkedConversion: [ByteConversionSink, [core.Sink$(core.String)]]})
  });
  let ChunkedConversionSink$ = dart.generic(function(T) {
    class ChunkedConversionSink extends core.Object {
      /**
       * @constructor
       * @return {ChunkedConversionSink}
       */
      ChunkedConversionSink() {
      }
      /**
       * @param {function(core.List)} callback
       * @return {ChunkedConversionSink}
       */
      static withCallback(callback) {
        return new _SimpleCallbackSink(callback);
      }
    }
    ChunkedConversionSink[dart.implements] = () => [core.Sink$(T)];
    dart.setSignature(ChunkedConversionSink, {
      constructors: () => ({
        ChunkedConversionSink: [ChunkedConversionSink$(T), []],
        withCallback: [ChunkedConversionSink$(T), [dart.functionType(dart.void, [core.List$(T)])]]
      })
    });
    return ChunkedConversionSink;
  });
  let ChunkedConversionSink = ChunkedConversionSink$();
  class ByteConversionSink extends ChunkedConversionSink$(core.List$(core.int)) {
    /**
     * @constructor
     * @return {ByteConversionSink}
     */
    ByteConversionSink() {
      super.ChunkedConversionSink();
    }
    /**
     * @param {function(core.List)} callback
     * @return {ByteConversionSink}
     */
    static withCallback(callback) {
      return new _ByteCallbackSink(callback);
    }
    /**
     * @param {core.Sink} sink
     * @return {ByteConversionSink}
     */
    static from(sink) {
      return new _ByteAdapterSink(sink);
    }
  }
  dart.setSignature(ByteConversionSink, {
    constructors: () => ({
      ByteConversionSink: [ByteConversionSink, []],
      withCallback: [ByteConversionSink, [dart.functionType(dart.void, [core.List$(core.int)])]],
      from: [ByteConversionSink, [core.Sink$(core.List$(core.int))]]
    })
  });
  class ByteConversionSinkBase extends ByteConversionSink {
    /** @constructor @extends {ByteConversionSink} */
    ByteConversionSinkBase() {
      super.ByteConversionSink();
    }
    /**
     * @param {core.List} chunk
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(chunk, start, end, isLast) {
      this.add(chunk[dartx.sublist](start, end));
      if (dart.notNull(isLast))
        this.close();
    }
  }
  dart.setSignature(ByteConversionSinkBase, {
    methods: () => ({addSlice: [dart.void, [core.List$(core.int), core.int, core.int, core.bool]]})
  });
  let _utf8Sink = Symbol('_utf8Sink');
  class _ErrorHandlingAsciiDecoderSink extends ByteConversionSinkBase {
    /**
     * @constructor
     * @param {ByteConversionSink} _utf8Sink
     * @return {_ErrorHandlingAsciiDecoderSink}
     */
    _ErrorHandlingAsciiDecoderSink(utf8Sink) {
      this[_utf8Sink] = utf8Sink;
    }
    close() {
      this[_utf8Sink].close();
    }
    /** @param {core.List} source */
    add(source) {
      this.addSlice(source, 0, source[dartx.length], false);
    }
    /**
     * @param {core.List} source
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(source, start, end, isLast) {
      core.RangeError.checkValidRange(start, end, source[dartx.length]);
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        if ((dart.notNull(source[dartx.get](i)) & ~dart.notNull(_ASCII_MASK)) != 0) {
          if (dart.notNull(i) > dart.notNull(start))
            this[_utf8Sink].addSlice(source, start, i, false);
          this[_utf8Sink].add(dart.const(dart.list([239, 191, 189], core.int)));
          start = dart.notNull(i) + 1;
        }
      }
      if (dart.notNull(start) < dart.notNull(end)) {
        this[_utf8Sink].addSlice(source, start, end, isLast);
      } else if (dart.notNull(isLast)) {
        this.close();
      }
    }
  }
  dart.setSignature(_ErrorHandlingAsciiDecoderSink, {
    constructors: () => ({_ErrorHandlingAsciiDecoderSink: [_ErrorHandlingAsciiDecoderSink, [ByteConversionSink]]}),
    methods: () => ({
      close: [dart.void, []],
      add: [dart.void, [core.List$(core.int)]]
    })
  });
  class _SimpleAsciiDecoderSink extends ByteConversionSinkBase {
    /**
     * @constructor
     * @param {core.Sink} _sink
     * @return {_SimpleAsciiDecoderSink}
     */
    _SimpleAsciiDecoderSink(sink) {
      this[_sink] = sink;
    }
    close() {
      this[_sink].close();
    }
    /** @param {core.List} source */
    add(source) {
      for (let i = 0; dart.notNull(i) < dart.notNull(source[dartx.length]); i = dart.notNull(i) + 1) {
        if ((dart.notNull(source[dartx.get](i)) & ~dart.notNull(_ASCII_MASK)) != 0) {
          dart.throw(new core.FormatException("Source contains non-ASCII bytes."));
        }
      }
      this[_sink].add(core.String.fromCharCodes(source));
    }
    /**
     * @param {core.List} source
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(source, start, end, isLast) {
      let length = source[dartx.length];
      core.RangeError.checkValidRange(start, end, length);
      if (dart.notNull(start) < dart.notNull(end)) {
        if (start != 0 || end != length) {
          source = source[dartx.sublist](start, end);
        }
        this.add(source);
      }
      if (dart.notNull(isLast))
        this.close();
    }
  }
  dart.setSignature(_SimpleAsciiDecoderSink, {
    constructors: () => ({_SimpleAsciiDecoderSink: [_SimpleAsciiDecoderSink, [core.Sink]]}),
    methods: () => ({
      close: [dart.void, []],
      add: [dart.void, [core.List$(core.int)]]
    })
  });
  class _ByteAdapterSink extends ByteConversionSinkBase {
    /**
     * @constructor
     * @param {core.Sink} _sink
     * @return {_ByteAdapterSink}
     */
    _ByteAdapterSink(sink) {
      this[_sink] = sink;
    }
    /** @param {core.List} chunk */
    add(chunk) {
      return this[_sink].add(chunk);
    }
    close() {
      return this[_sink].close();
    }
  }
  dart.setSignature(_ByteAdapterSink, {
    constructors: () => ({_ByteAdapterSink: [_ByteAdapterSink, [core.Sink$(core.List$(core.int))]]}),
    methods: () => ({
      add: [dart.void, [core.List$(core.int)]],
      close: [dart.void, []]
    })
  });
  let _buffer = Symbol('_buffer');
  let _callback = Symbol('_callback');
  let _bufferIndex = Symbol('_bufferIndex');
  class _ByteCallbackSink extends ByteConversionSinkBase {
    /**
     * @constructor
     * @param {function(core.List)} callback
     * @return {_ByteCallbackSink}
     */
    _ByteCallbackSink(callback) {
      this[_buffer] = typed_data.Uint8List.new(_ByteCallbackSink._INITIAL_BUFFER_SIZE);
      this[_callback] = callback;
      this[_bufferIndex] = 0;
    }
    /** @param {core.Iterable} chunk */
    add(chunk) {
      let freeCount = dart.notNull(this[_buffer][dartx.length]) - dart.notNull(this[_bufferIndex]);
      if (dart.notNull(chunk[dartx.length]) > dart.notNull(freeCount)) {
        let oldLength = this[_buffer][dartx.length];
        let newLength = dart.notNull(_ByteCallbackSink._roundToPowerOf2(dart.notNull(chunk[dartx.length]) + dart.notNull(oldLength))) * 2;
        let grown = typed_data.Uint8List.new(newLength);
        grown[dartx.setRange](0, this[_buffer][dartx.length], this[_buffer]);
        this[_buffer] = grown;
      }
      this[_buffer][dartx.setRange](this[_bufferIndex], dart.notNull(this[_bufferIndex]) + dart.notNull(chunk[dartx.length]), chunk);
      this[_bufferIndex] = dart.notNull(this[_bufferIndex]) + dart.notNull(chunk[dartx.length]);
    }
    /**
     * @param {?number} v
     * @return {?number}
     */
    static _roundToPowerOf2(v) {
      dart.assert(dart.notNull(v) > 0);
      v = dart.notNull(v) - 1;
      v = dart.notNull(v) | dart.notNull(v) >> 1;
      v = dart.notNull(v) | dart.notNull(v) >> 2;
      v = dart.notNull(v) | dart.notNull(v) >> 4;
      v = dart.notNull(v) | dart.notNull(v) >> 8;
      v = dart.notNull(v) | dart.notNull(v) >> 16;
      v = dart.notNull(v) + 1;
      return v;
    }
    close() {
      this[_callback](this[_buffer][dartx.sublist](0, this[_bufferIndex]));
    }
  }
  dart.setSignature(_ByteCallbackSink, {
    constructors: () => ({_ByteCallbackSink: [_ByteCallbackSink, [dart.functionType(dart.void, [core.List$(core.int)])]]}),
    methods: () => ({
      add: [dart.void, [core.Iterable$(core.int)]],
      close: [dart.void, []]
    }),
    statics: () => ({_roundToPowerOf2: [core.int, [core.int]]}),
    names: ['_roundToPowerOf2']
  });
  _ByteCallbackSink._INITIAL_BUFFER_SIZE = 1024;
  let _ChunkedConversionCallback$ = dart.generic(function(T) {
    let _ChunkedConversionCallback = dart.typedef('_ChunkedConversionCallback', () => dart.functionType(dart.void, [T]));
    return _ChunkedConversionCallback;
  });
  let _ChunkedConversionCallback = _ChunkedConversionCallback$();
  let _accumulated = Symbol('_accumulated');
  let _SimpleCallbackSink$ = dart.generic(function(T) {
    class _SimpleCallbackSink extends ChunkedConversionSink$(T) {
      /**
       * @constructor
       * @param {function(core.List)} _callback
       * @return {_SimpleCallbackSink}
       */
      _SimpleCallbackSink(callback) {
        this[_accumulated] = dart.list([], T);
        this[_callback] = callback;
        super.ChunkedConversionSink();
      }
      add(chunk) {
        dart.as(chunk, T);
        this[_accumulated][dartx.add](chunk);
      }
      close() {
        this[_callback](this[_accumulated]);
      }
    }
    dart.setSignature(_SimpleCallbackSink, {
      constructors: () => ({_SimpleCallbackSink: [_SimpleCallbackSink$(T), [_ChunkedConversionCallback$(core.List$(T))]]}),
      methods: () => ({
        add: [dart.void, [T]],
        close: [dart.void, []]
      })
    });
    return _SimpleCallbackSink;
  });
  let _SimpleCallbackSink = _SimpleCallbackSink$();
  let _EventSinkAdapter$ = dart.generic(function(T) {
    class _EventSinkAdapter extends core.Object {
      /**
       * @constructor
       * @param {async.EventSink} _sink
       * @return {_EventSinkAdapter}
       */
      _EventSinkAdapter(sink) {
        this[_sink] = sink;
      }
      add(data) {
        dart.as(data, T);
        return this[_sink].add(data);
      }
      close() {
        return this[_sink].close();
      }
    }
    _EventSinkAdapter[dart.implements] = () => [ChunkedConversionSink$(T)];
    dart.setSignature(_EventSinkAdapter, {
      constructors: () => ({_EventSinkAdapter: [_EventSinkAdapter$(T), [async.EventSink$(T)]]}),
      methods: () => ({
        add: [dart.void, [T]],
        close: [dart.void, []]
      })
    });
    return _EventSinkAdapter;
  });
  let _EventSinkAdapter = _EventSinkAdapter$();
  let _eventSink = Symbol('_eventSink');
  let _chunkedSink = Symbol('_chunkedSink');
  let _ConverterStreamEventSink$ = dart.generic(function(S, T) {
    class _ConverterStreamEventSink extends core.Object {
      /**
       * @constructor
       * @param {Converter} converter
       * @param {async.EventSink} sink
       * @return {_ConverterStreamEventSink}
       */
      _ConverterStreamEventSink(converter, sink) {
        this[_eventSink] = sink;
        this[_chunkedSink] = converter.startChunkedConversion(sink);
      }
      add(o) {
        dart.as(o, S);
        return this[_chunkedSink].add(o);
      }
      /**
       * @param {core.Object} error
       * @param {core.StackTrace=} stackTrace
       */
      addError(error, stackTrace) {
        if (stackTrace === void 0)
          stackTrace = null;
        this[_eventSink].addError(error, stackTrace);
      }
      close() {
        return this[_chunkedSink].close();
      }
    }
    _ConverterStreamEventSink[dart.implements] = () => [async.EventSink$(S)];
    dart.setSignature(_ConverterStreamEventSink, {
      constructors: () => ({_ConverterStreamEventSink: [_ConverterStreamEventSink$(S, T), [Converter, async.EventSink$(T)]]}),
      methods: () => ({
        add: [dart.void, [S]],
        addError: [dart.void, [core.Object], [core.StackTrace]],
        close: [dart.void, []]
      })
    });
    return _ConverterStreamEventSink;
  });
  let _ConverterStreamEventSink = _ConverterStreamEventSink$();
  let _first = Symbol('_first');
  let _second = Symbol('_second');
  let _FusedCodec$ = dart.generic(function(S, M, T) {
    class _FusedCodec extends Codec$(S, T) {
      /** @return {Converter} */
      get encoder() {
        return dart.as(this[_first].encoder.fuse(this[_second].encoder), Converter$(S, T));
      }
      /** @return {Converter} */
      get decoder() {
        return dart.as(this[_second].decoder.fuse(this[_first].decoder), Converter$(T, S));
      }
      /**
       * @constructor
       * @param {Codec} _first
       * @param {Codec} _second
       * @return {_FusedCodec}
       */
      _FusedCodec(first, second) {
        this[_first] = first;
        this[_second] = second;
        super.Codec();
      }
    }
    dart.setSignature(_FusedCodec, {
      constructors: () => ({_FusedCodec: [_FusedCodec$(S, M, T), [Codec$(S, M), Codec$(M, T)]]})
    });
    return _FusedCodec;
  });
  let _FusedCodec = _FusedCodec$();
  let _codec = Symbol('_codec');
  let _InvertedCodec$ = dart.generic(function(T, S) {
    class _InvertedCodec extends Codec$(T, S) {
      /**
       * @constructor
       * @param {Codec} codec
       * @return {_InvertedCodec}
       */
      _InvertedCodec(codec) {
        this[_codec] = codec;
        super.Codec();
      }
      /** @return {Converter} */
      get encoder() {
        return this[_codec].decoder;
      }
      /** @return {Converter} */
      get decoder() {
        return this[_codec].encoder;
      }
      /** @return {Codec} */
      get inverted() {
        return this[_codec];
      }
    }
    dart.setSignature(_InvertedCodec, {
      constructors: () => ({_InvertedCodec: [_InvertedCodec$(T, S), [Codec$(S, T)]]})
    });
    return _InvertedCodec;
  });
  let _InvertedCodec = _InvertedCodec$();
  let _FusedConverter$ = dart.generic(function(S, M, T) {
    class _FusedConverter extends Converter$(S, T) {
      /**
       * @constructor
       * @param {Converter} _first
       * @param {Converter} _second
       * @return {_FusedConverter}
       */
      _FusedConverter(first, second) {
        this[_first] = first;
        this[_second] = second;
        super.Converter();
      }
      convert(input) {
        dart.as(input, S);
        return dart.as(this[_second].convert(this[_first].convert(input)), T);
      }
      /**
       * @param {core.Sink} sink
       * @return {ChunkedConversionSink}
       */
      startChunkedConversion(sink) {
        dart.as(sink, core.Sink$(T));
        return this[_first].startChunkedConversion(this[_second].startChunkedConversion(sink));
      }
    }
    dart.setSignature(_FusedConverter, {
      constructors: () => ({_FusedConverter: [_FusedConverter$(S, M, T), [Converter, Converter]]}),
      methods: () => ({
        convert: [T, [S]],
        startChunkedConversion: [ChunkedConversionSink, [core.Sink$(T)]]
      })
    });
    return _FusedConverter;
  });
  let _FusedConverter = _FusedConverter$();
  dart.defineLazyProperties(Encoding, {
    /** @return {core.Map} */
    get _nameToEncoding() {
      return dart.map({"iso_8859-1:1987": LATIN1, "iso-ir-100": LATIN1, "iso_8859-1": LATIN1, "iso-8859-1": LATIN1, latin1: LATIN1, l1: LATIN1, ibm819: LATIN1, cp819: LATIN1, csisolatin1: LATIN1, "iso-ir-6": ASCII, "ansi_x3.4-1968": ASCII, "ansi_x3.4-1986": ASCII, "iso_646.irv:1991": ASCII, "iso646-us": ASCII, "us-ascii": ASCII, us: ASCII, ibm367: ASCII, cp367: ASCII, csascii: ASCII, ascii: ASCII, csutf8: UTF8, "utf-8": UTF8});
    },
    /** @param {core.Map} __nameToEncoding */
    set _nameToEncoding(_) {}
  });
  let _name = Symbol('_name');
  class HtmlEscapeMode extends core.Object {
    /**
     * @constructor
     * @param {string} _name
     * @param {?boolean} escapeLtGt
     * @param {?boolean} escapeQuot
     * @param {?boolean} escapeApos
     * @param {?boolean} escapeSlash
     * @return {HtmlEscapeMode}
     */
    _(name, escapeLtGt, escapeQuot, escapeApos, escapeSlash) {
      this[_name] = name;
      this.escapeLtGt = escapeLtGt;
      this.escapeQuot = escapeQuot;
      this.escapeApos = escapeApos;
      this.escapeSlash = escapeSlash;
    }
    /** @return {string} */
    toString() {
      return this[_name];
    }
  }
  dart.defineNamedConstructor(HtmlEscapeMode, '_');
  dart.setSignature(HtmlEscapeMode, {
    constructors: () => ({_: [HtmlEscapeMode, [core.String, core.bool, core.bool, core.bool, core.bool]]})
  });
  HtmlEscapeMode.UNKNOWN = dart.const(new HtmlEscapeMode._('unknown', true, true, true, true));
  let _convert = Symbol('_convert');
  class HtmlEscape extends Converter$(core.String, core.String) {
    /**
     * @constructor
     * @param {HtmlEscapeMode=} mode
     * @return {HtmlEscape}
     */
    HtmlEscape(mode) {
      if (mode === void 0)
        mode = HtmlEscapeMode.UNKNOWN;
      this.mode = mode;
      super.Converter();
    }
    /**
     * @param {string} text
     * @return {string}
     */
    convert(text) {
      let val = this[_convert](text, 0, text[dartx.length]);
      return val == null ? text : val;
    }
    /**
     * @param {string} text
     * @param {?number} start
     * @param {?number} end
     * @return {string}
     */
    [_convert](text, start, end) {
      let result = null;
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        let ch = text[dartx.get](i);
        let replace = null;
        switch (ch) {
          case '&':
          {
            replace = '&amp;';
            break;
          }
          case ' ':
          {
            replace = '&nbsp;';
            break;
          }
          case '"':
          {
            if (dart.notNull(this.mode.escapeQuot))
              replace = '&quot;';
            break;
          }
          case "'":
          {
            if (dart.notNull(this.mode.escapeApos))
              replace = '&#x27;';
            break;
          }
          case '<':
          {
            if (dart.notNull(this.mode.escapeLtGt))
              replace = '&lt;';
            break;
          }
          case '>':
          {
            if (dart.notNull(this.mode.escapeLtGt))
              replace = '&gt;';
            break;
          }
          case '/':
          {
            if (dart.notNull(this.mode.escapeSlash))
              replace = '&#x2F;';
            break;
          }
        }
        if (replace != null) {
          if (result == null)
            result = new core.StringBuffer(text[dartx.substring](start, i));
          result.write(replace);
        } else if (result != null) {
          result.write(ch);
        }
      }
      return result != null ? dart.toString(result) : null;
    }
    /**
     * @param {core.Sink} sink
     * @return {StringConversionSink}
     */
    startChunkedConversion(sink) {
      if (!dart.is(sink, StringConversionSink)) {
        sink = StringConversionSink.from(sink);
      }
      return new _HtmlEscapeSink(this, dart.as(sink, StringConversionSink));
    }
  }
  dart.setSignature(HtmlEscape, {
    constructors: () => ({HtmlEscape: [HtmlEscape, [], [HtmlEscapeMode]]}),
    methods: () => ({
      convert: [core.String, [core.String]],
      [_convert]: [core.String, [core.String, core.int, core.int]],
      startChunkedConversion: [StringConversionSink, [core.Sink$(core.String)]]
    })
  });
  let HTML_ESCAPE = dart.const(new HtmlEscape());
  HtmlEscapeMode.ATTRIBUTE = dart.const(new HtmlEscapeMode._('attribute', false, true, false, false));
  HtmlEscapeMode.ELEMENT = dart.const(new HtmlEscapeMode._('element', true, false, false, true));
  let _escape = Symbol('_escape');
  class _HtmlEscapeSink extends StringConversionSinkBase {
    /**
     * @constructor
     * @param {HtmlEscape} _escape
     * @param {StringConversionSink} _sink
     * @return {_HtmlEscapeSink}
     */
    _HtmlEscapeSink(escape, sink) {
      this[_escape] = escape;
      this[_sink] = sink;
    }
    /**
     * @param {string} chunk
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(chunk, start, end, isLast) {
      let val = this[_escape][_convert](chunk, start, end);
      if (val == null) {
        this[_sink].addSlice(chunk, start, end, isLast);
      } else {
        this[_sink].add(val);
        if (dart.notNull(isLast))
          this[_sink].close();
      }
    }
    close() {
      return this[_sink].close();
    }
  }
  dart.setSignature(_HtmlEscapeSink, {
    constructors: () => ({_HtmlEscapeSink: [_HtmlEscapeSink, [HtmlEscape, StringConversionSink]]}),
    methods: () => ({
      addSlice: [dart.void, [core.String, core.int, core.int, core.bool]],
      close: [dart.void, []]
    })
  });
  class JsonUnsupportedObjectError extends core.Error {
    /**
     * @constructor
     * @param {{cause: (*|undefined)}=} opts
     * @return {JsonUnsupportedObjectError}
     */
    JsonUnsupportedObjectError(unsupportedObject, opts) {
      let cause = opts && 'cause' in opts ? opts.cause : null;
      this.unsupportedObject = unsupportedObject;
      this.cause = cause;
      super.Error();
    }
    /** @return {string} */
    toString() {
      if (this.cause != null) {
        return "Converting object to an encodable object failed.";
      } else {
        return "Converting object did not return an encodable object.";
      }
    }
  }
  dart.setSignature(JsonUnsupportedObjectError, {
    constructors: () => ({JsonUnsupportedObjectError: [JsonUnsupportedObjectError, [dart.dynamic], {cause: dart.dynamic}]})
  });
  class JsonCyclicError extends JsonUnsupportedObjectError {
    /**
     * @constructor
     * @param {core.Object} object
     * @return {JsonCyclicError}
     */
    JsonCyclicError(object) {
      super.JsonUnsupportedObjectError(object);
    }
    /** @return {string} */
    toString() {
      return "Cyclic error in JSON stringify";
    }
  }
  dart.setSignature(JsonCyclicError, {
    constructors: () => ({JsonCyclicError: [JsonCyclicError, [core.Object]]})
  });
  let _reviver = Symbol('_reviver');
  let _toEncodable$ = Symbol('_toEncodable');
  class JsonCodec extends Codec$(core.Object, core.String) {
    /**
     * @constructor
     * @param {{reviver: (function(*, *):*|undefined), toEncodable: (function(*):*|undefined)}=} opts
     * @return {JsonCodec}
     */
    JsonCodec(opts) {
      let reviver = opts && 'reviver' in opts ? opts.reviver : null;
      let toEncodable = opts && 'toEncodable' in opts ? opts.toEncodable : null;
      this[_reviver] = reviver;
      this[_toEncodable$] = toEncodable;
      super.Codec();
    }
    /**
     * @constructor
     * @param {function(*, *):*} reviver
     * @return {JsonCodec}
     */
    withReviver(reviver) {
      this.JsonCodec({reviver: reviver});
    }
    /**
     * @param {string} source
     * @param {{reviver: (function(*, *):*|undefined)}=} opts
     */
    decode(source, opts) {
      let reviver = opts && 'reviver' in opts ? opts.reviver : null;
      if (reviver == null)
        reviver = this[_reviver];
      if (reviver == null)
        return this.decoder.convert(source);
      return new JsonDecoder(reviver).convert(source);
    }
    /**
     * @param {core.Object} value
     * @param {{toEncodable: (function(*):*|undefined)}=} opts
     * @return {string}
     */
    encode(value, opts) {
      let toEncodable = opts && 'toEncodable' in opts ? opts.toEncodable : null;
      if (toEncodable == null)
        toEncodable = this[_toEncodable$];
      if (toEncodable == null)
        return this.encoder.convert(value);
      return new JsonEncoder(dart.as(toEncodable, __CastType0)).convert(value);
    }
    /** @return {JsonEncoder} */
    get encoder() {
      if (this[_toEncodable$] == null)
        return dart.const(new JsonEncoder());
      return new JsonEncoder(dart.as(this[_toEncodable$], dart.functionType(core.Object, [core.Object])));
    }
    /** @return {JsonDecoder} */
    get decoder() {
      if (this[_reviver] == null)
        return dart.const(new JsonDecoder());
      return new JsonDecoder(this[_reviver]);
    }
  }
  dart.defineNamedConstructor(JsonCodec, 'withReviver');
  dart.setSignature(JsonCodec, {
    constructors: () => ({
      JsonCodec: [JsonCodec, [], {reviver: dart.functionType(dart.dynamic, [dart.dynamic, dart.dynamic]), toEncodable: dart.functionType(dart.dynamic, [dart.dynamic])}],
      withReviver: [JsonCodec, [dart.functionType(dart.dynamic, [dart.dynamic, dart.dynamic])]]
    }),
    methods: () => ({
      decode: [dart.dynamic, [core.String], {reviver: dart.functionType(dart.dynamic, [dart.dynamic, dart.dynamic])}],
      encode: [core.String, [core.Object], {toEncodable: dart.functionType(dart.dynamic, [dart.dynamic])}]
    })
  });
  let JSON = dart.const(new JsonCodec());
  let _Reviver = dart.typedef('_Reviver', () => dart.functionType(dart.dynamic, [dart.dynamic, dart.dynamic]));
  let _ToEncodable = dart.typedef('_ToEncodable', () => dart.functionType(dart.dynamic, [dart.dynamic]));
  class JsonEncoder extends Converter$(core.Object, core.String) {
    /**
     * @constructor
     * @param {function(core.Object):core.Object=} toEncodable
     * @return {JsonEncoder}
     */
    JsonEncoder(toEncodable) {
      if (toEncodable === void 0)
        toEncodable = null;
      this.indent = null;
      this[_toEncodable$] = toEncodable;
      super.Converter();
    }
    /**
     * @constructor
     * @param {string} indent
     * @param {function(core.Object):core.Object=} toEncodable
     * @return {JsonEncoder}
     */
    withIndent(indent, toEncodable) {
      if (toEncodable === void 0)
        toEncodable = null;
      this.indent = indent;
      this[_toEncodable$] = toEncodable;
      super.Converter();
    }
    /**
     * @param {core.Object} object
     * @return {string}
     */
    convert(object) {
      return _JsonStringStringifier.stringify(object, dart.as(this[_toEncodable$], __CastType2), this.indent);
    }
    /**
     * @param {core.Sink} sink
     * @return {ChunkedConversionSink}
     */
    startChunkedConversion(sink) {
      if (!dart.is(sink, StringConversionSink)) {
        sink = StringConversionSink.from(sink);
      } else if (dart.is(sink, _Utf8EncoderSink)) {
        return new _JsonUtf8EncoderSink(sink[_sink], this[_toEncodable$], JsonUtf8Encoder._utf8Encode(this.indent), JsonUtf8Encoder.DEFAULT_BUFFER_SIZE);
      }
      return new _JsonEncoderSink(dart.as(sink, StringConversionSink), this[_toEncodable$], this.indent);
    }
    /**
     * @param {async.Stream} stream
     * @return {async.Stream}
     */
    bind(stream) {
      return super.bind(stream);
    }
    /**
     * @param {Converter} other
     * @return {Converter}
     */
    fuse(other) {
      if (dart.is(other, Utf8Encoder)) {
        return new JsonUtf8Encoder(this.indent, dart.as(this[_toEncodable$], __CastType4));
      }
      return super.fuse(other);
    }
  }
  dart.defineNamedConstructor(JsonEncoder, 'withIndent');
  dart.setSignature(JsonEncoder, {
    constructors: () => ({
      JsonEncoder: [JsonEncoder, [], [dart.functionType(core.Object, [core.Object])]],
      withIndent: [JsonEncoder, [core.String], [dart.functionType(core.Object, [core.Object])]]
    }),
    methods: () => ({
      convert: [core.String, [core.Object]],
      startChunkedConversion: [ChunkedConversionSink$(core.Object), [core.Sink$(core.String)]],
      bind: [async.Stream$(core.String), [async.Stream$(core.Object)]],
      fuse: [Converter$(core.Object, dart.dynamic), [Converter$(core.String, dart.dynamic)]]
    })
  });
  let _indent = Symbol('_indent');
  let _bufferSize = Symbol('_bufferSize');
  class JsonUtf8Encoder extends Converter$(core.Object, core.List$(core.int)) {
    /**
     * @constructor
     * @param {string=} indent
     * @param {function(core.Object):*=} toEncodable
     * @param {?number=} bufferSize
     * @return {JsonUtf8Encoder}
     */
    JsonUtf8Encoder(indent, toEncodable, bufferSize) {
      if (indent === void 0)
        indent = null;
      if (toEncodable === void 0)
        toEncodable = null;
      if (bufferSize === void 0)
        bufferSize = JsonUtf8Encoder.DEFAULT_BUFFER_SIZE;
      this[_indent] = JsonUtf8Encoder._utf8Encode(indent);
      this[_toEncodable$] = toEncodable;
      this[_bufferSize] = bufferSize;
      super.Converter();
    }
    /**
     * @param {string} string
     * @return {core.List}
     */
    static _utf8Encode(string) {
      if (string == null)
        return null;
      if (dart.notNull(string[dartx.isEmpty]))
        return typed_data.Uint8List.new(0);
      checkAscii: {
        for (let i = 0; dart.notNull(i) < dart.notNull(string[dartx.length]); i = dart.notNull(i) + 1) {
          if (dart.notNull(string[dartx.codeUnitAt](i)) >= 128)
            break checkAscii;
        }
        return string[dartx.codeUnits];
      }
      return UTF8.encode(string);
    }
    /**
     * @param {core.Object} object
     * @return {core.List}
     */
    convert(object) {
      let bytes = dart.list([], core.List$(core.int));
      /**
       * @param {typed_data.Uint8List} chunk
       * @param {?number} start
       * @param {?number} end
       */
      function addChunk(chunk, start, end) {
        if (dart.notNull(start) > 0 || dart.notNull(end) < dart.notNull(chunk.length)) {
          let length = dart.notNull(end) - dart.notNull(start);
          chunk = typed_data.Uint8List.view(chunk.buffer, dart.notNull(chunk.offsetInBytes) + dart.notNull(start), length);
        }
        bytes[dartx.add](chunk);
      }
      dart.fn(addChunk, dart.void, [typed_data.Uint8List, core.int, core.int]);
      _JsonUtf8Stringifier.stringify(object, this[_indent], dart.as(this[_toEncodable$], dart.functionType(dart.dynamic, [core.Object])), this[_bufferSize], addChunk);
      if (bytes[dartx.length] == 1)
        return bytes[dartx.get](0);
      let length = 0;
      for (let i = 0; dart.notNull(i) < dart.notNull(bytes[dartx.length]); i = dart.notNull(i) + 1) {
        length = dart.notNull(length) + dart.notNull(bytes[dartx.get](i)[dartx.length]);
      }
      let result = typed_data.Uint8List.new(length);
      for (let i = 0, offset = 0; dart.notNull(i) < dart.notNull(bytes[dartx.length]); i = dart.notNull(i) + 1) {
        let byteList = bytes[dartx.get](i);
        let end = dart.notNull(offset) + dart.notNull(byteList[dartx.length]);
        result.setRange(offset, end, byteList);
        offset = end;
      }
      return result;
    }
    /**
     * @param {core.Sink} sink
     * @return {ChunkedConversionSink}
     */
    startChunkedConversion(sink) {
      let byteSink = null;
      if (dart.is(sink, ByteConversionSink)) {
        byteSink = sink;
      } else {
        byteSink = ByteConversionSink.from(sink);
      }
      return new _JsonUtf8EncoderSink(byteSink, this[_toEncodable$], this[_indent], this[_bufferSize]);
    }
    /**
     * @param {async.Stream} stream
     * @return {async.Stream}
     */
    bind(stream) {
      return super.bind(stream);
    }
    /**
     * @param {Converter} other
     * @return {Converter}
     */
    fuse(other) {
      return super.fuse(other);
    }
  }
  dart.setSignature(JsonUtf8Encoder, {
    constructors: () => ({JsonUtf8Encoder: [JsonUtf8Encoder, [], [core.String, dart.functionType(dart.dynamic, [core.Object]), core.int]]}),
    methods: () => ({
      convert: [core.List$(core.int), [core.Object]],
      startChunkedConversion: [ChunkedConversionSink$(core.Object), [core.Sink$(core.List$(core.int))]],
      bind: [async.Stream$(core.List$(core.int)), [async.Stream$(core.Object)]],
      fuse: [Converter$(core.Object, dart.dynamic), [Converter$(core.List$(core.int), dart.dynamic)]]
    }),
    statics: () => ({_utf8Encode: [core.List$(core.int), [core.String]]}),
    names: ['_utf8Encode']
  });
  JsonUtf8Encoder.DEFAULT_BUFFER_SIZE = 256;
  let _isDone = Symbol('_isDone');
  class _JsonEncoderSink extends ChunkedConversionSink$(core.Object) {
    /**
     * @constructor
     * @param {StringConversionSink} _sink
     * @param {core.Function} _toEncodable
     * @param {string} _indent
     * @return {_JsonEncoderSink}
     */
    _JsonEncoderSink(sink, toEncodable, indent) {
      this[_sink] = sink;
      this[_toEncodable$] = toEncodable;
      this[_indent] = indent;
      this[_isDone] = false;
      super.ChunkedConversionSink();
    }
    /** @param {core.Object} o */
    add(o) {
      if (dart.notNull(this[_isDone])) {
        dart.throw(new core.StateError("Only one call to add allowed"));
      }
      this[_isDone] = true;
      let stringSink = this[_sink].asStringSink();
      _JsonStringStringifier.printOn(o, stringSink, dart.as(this[_toEncodable$], dart.functionType(dart.dynamic, [dart.dynamic])), this[_indent]);
      stringSink.close();
    }
    close() {}
  }
  dart.setSignature(_JsonEncoderSink, {
    constructors: () => ({_JsonEncoderSink: [_JsonEncoderSink, [StringConversionSink, core.Function, core.String]]}),
    methods: () => ({
      add: [dart.void, [core.Object]],
      close: [dart.void, []]
    })
  });
  let _addChunk = Symbol('_addChunk');
  class _JsonUtf8EncoderSink extends ChunkedConversionSink$(core.Object) {
    /**
     * @constructor
     * @param {ByteConversionSink} _sink
     * @param {core.Function} _toEncodable
     * @param {core.List} _indent
     * @param {?number} _bufferSize
     * @return {_JsonUtf8EncoderSink}
     */
    _JsonUtf8EncoderSink(sink, toEncodable, indent, bufferSize) {
      this[_sink] = sink;
      this[_toEncodable$] = toEncodable;
      this[_indent] = indent;
      this[_bufferSize] = bufferSize;
      this[_isDone] = false;
      super.ChunkedConversionSink();
    }
    /**
     * @param {typed_data.Uint8List} chunk
     * @param {?number} start
     * @param {?number} end
     */
    [_addChunk](chunk, start, end) {
      this[_sink].addSlice(chunk, start, end, false);
    }
    /** @param {core.Object} object */
    add(object) {
      if (dart.notNull(this[_isDone])) {
        dart.throw(new core.StateError("Only one call to add allowed"));
      }
      this[_isDone] = true;
      _JsonUtf8Stringifier.stringify(object, this[_indent], dart.as(this[_toEncodable$], dart.functionType(dart.dynamic, [core.Object])), this[_bufferSize], dart.bind(this, _addChunk));
      this[_sink].close();
    }
    close() {
      if (!dart.notNull(this[_isDone])) {
        this[_isDone] = true;
        this[_sink].close();
      }
    }
  }
  dart.setSignature(_JsonUtf8EncoderSink, {
    constructors: () => ({_JsonUtf8EncoderSink: [_JsonUtf8EncoderSink, [ByteConversionSink, core.Function, core.List$(core.int), core.int]]}),
    methods: () => ({
      [_addChunk]: [dart.void, [typed_data.Uint8List, core.int, core.int]],
      add: [dart.void, [core.Object]],
      close: [dart.void, []]
    })
  });
  class JsonDecoder extends Converter$(core.String, core.Object) {
    /**
     * @constructor
     * @param {function(*, *):*=} reviver
     * @return {JsonDecoder}
     */
    JsonDecoder(reviver) {
      if (reviver === void 0)
        reviver = null;
      this[_reviver] = reviver;
      super.Converter();
    }
    /** @param {string} input */
    convert(input) {
      return _parseJson(input, this[_reviver]);
    }
    /**
     * @param {core.Sink} sink
     * @return {StringConversionSink}
     */
    startChunkedConversion(sink) {
      return new _JsonDecoderSink(this[_reviver], sink);
    }
    /**
     * @param {async.Stream} stream
     * @return {async.Stream}
     */
    bind(stream) {
      return super.bind(stream);
    }
  }
  dart.setSignature(JsonDecoder, {
    constructors: () => ({JsonDecoder: [JsonDecoder, [], [dart.functionType(dart.dynamic, [dart.dynamic, dart.dynamic])]]}),
    methods: () => ({
      convert: [dart.dynamic, [core.String]],
      startChunkedConversion: [StringConversionSink, [core.Sink$(core.Object)]],
      bind: [async.Stream$(core.Object), [async.Stream$(core.String)]]
    })
  });
  /**
   * @param {string} source
   * @param {function(*, *):*} reviver
   */
  function _parseJson(source, reviver) {
    if (!(typeof source == 'string'))
      dart.throw(new core.ArgumentError(source));
    let parsed = null;
    try {
      parsed = JSON.parse(source);
    } catch (e) {
      dart.throw(new core.FormatException(String(e)));
    }

    if (reviver == null) {
      return _convertJsonToDartLazy(parsed);
    } else {
      return _convertJsonToDart(parsed, reviver);
    }
  }
  dart.fn(_parseJson, dart.dynamic, [core.String, dart.functionType(dart.dynamic, [dart.dynamic, dart.dynamic])]);
  /** @return {core.Object} */
  function _defaultToEncodable(object) {
    return dart.dsend(object, 'toJson');
  }
  dart.fn(_defaultToEncodable, core.Object, [dart.dynamic]);
  let _seen = Symbol('_seen');
  let _checkCycle = Symbol('_checkCycle');
  let _removeSeen = Symbol('_removeSeen');
  class _JsonStringifier extends core.Object {
    /**
     * @constructor
     * @param {function(core.Object):core.Object} _toEncodable
     * @return {_JsonStringifier}
     */
    _JsonStringifier(_toEncodable) {
      this[_seen] = core.List.new();
      this[_toEncodable$] = _toEncodable != null ? _toEncodable : _defaultToEncodable;
    }
    /**
     * @param {?number} x
     * @return {?number}
     */
    static hexDigit(x) {
      return dart.notNull(x) < 10 ? 48 + dart.notNull(x) : 87 + dart.notNull(x);
    }
    /** @param {string} s */
    writeStringContent(s) {
      let offset = 0;
      let length = s[dartx.length];
      for (let i = 0; dart.notNull(i) < dart.notNull(length); i = dart.notNull(i) + 1) {
        let charCode = s[dartx.codeUnitAt](i);
        if (dart.notNull(charCode) > dart.notNull(_JsonStringifier.BACKSLASH))
          continue;
        if (dart.notNull(charCode) < 32) {
          if (dart.notNull(i) > dart.notNull(offset))
            this.writeStringSlice(s, offset, i);
          offset = dart.notNull(i) + 1;
          this.writeCharCode(_JsonStringifier.BACKSLASH);
          switch (charCode) {
            case _JsonStringifier.BACKSPACE:
            {
              this.writeCharCode(_JsonStringifier.CHAR_b);
              break;
            }
            case _JsonStringifier.TAB:
            {
              this.writeCharCode(_JsonStringifier.CHAR_t);
              break;
            }
            case _JsonStringifier.NEWLINE:
            {
              this.writeCharCode(_JsonStringifier.CHAR_n);
              break;
            }
            case _JsonStringifier.FORM_FEED:
            {
              this.writeCharCode(_JsonStringifier.CHAR_f);
              break;
            }
            case _JsonStringifier.CARRIAGE_RETURN:
            {
              this.writeCharCode(_JsonStringifier.CHAR_r);
              break;
            }
            default:
            {
              this.writeCharCode(_JsonStringifier.CHAR_u);
              this.writeCharCode(_JsonStringifier.CHAR_0);
              this.writeCharCode(_JsonStringifier.CHAR_0);
              this.writeCharCode(_JsonStringifier.hexDigit(dart.notNull(charCode) >> 4 & 15));
              this.writeCharCode(_JsonStringifier.hexDigit(dart.notNull(charCode) & 15));
              break;
            }
          }
        } else if (charCode == _JsonStringifier.QUOTE || charCode == _JsonStringifier.BACKSLASH) {
          if (dart.notNull(i) > dart.notNull(offset))
            this.writeStringSlice(s, offset, i);
          offset = dart.notNull(i) + 1;
          this.writeCharCode(_JsonStringifier.BACKSLASH);
          this.writeCharCode(charCode);
        }
      }
      if (offset == 0) {
        this.writeString(s);
      } else if (dart.notNull(offset) < dart.notNull(length)) {
        this.writeStringSlice(s, offset, length);
      }
    }
    [_checkCycle](object) {
      for (let i = 0; dart.notNull(i) < dart.notNull(this[_seen][dartx.length]); i = dart.notNull(i) + 1) {
        if (dart.notNull(core.identical(object, this[_seen][dartx.get](i)))) {
          dart.throw(new JsonCyclicError(object));
        }
      }
      this[_seen][dartx.add](object);
    }
    [_removeSeen](object) {
      dart.assert(!dart.notNull(this[_seen][dartx.isEmpty]));
      dart.assert(core.identical(this[_seen][dartx.last], object));
      this[_seen][dartx.removeLast]();
    }
    writeObject(object) {
      if (dart.notNull(this.writeJsonValue(object)))
        return;
      this[_checkCycle](object);
      try {
        let customJson = dart.dcall(this[_toEncodable$], object);
        if (!dart.notNull(this.writeJsonValue(customJson))) {
          dart.throw(new JsonUnsupportedObjectError(object));
        }
        this[_removeSeen](object);
      } catch (e) {
        dart.throw(new JsonUnsupportedObjectError(object, {cause: e}));
      }

    }
    /** @return {?boolean} */
    writeJsonValue(object) {
      if (dart.is(object, core.num)) {
        if (!dart.notNull(dart.as(dart.dload(object, 'isFinite'), core.bool)))
          return false;
        this.writeNumber(dart.as(object, core.num));
        return true;
      } else if (dart.notNull(core.identical(object, true))) {
        this.writeString('true');
        return true;
      } else if (dart.notNull(core.identical(object, false))) {
        this.writeString('false');
        return true;
      } else if (object == null) {
        this.writeString('null');
        return true;
      } else if (typeof object == 'string') {
        this.writeString('"');
        this.writeStringContent(dart.as(object, core.String));
        this.writeString('"');
        return true;
      } else if (dart.is(object, core.List)) {
        this[_checkCycle](object);
        this.writeList(dart.as(object, core.List));
        this[_removeSeen](object);
        return true;
      } else if (dart.is(object, core.Map)) {
        this[_checkCycle](object);
        this.writeMap(dart.as(object, core.Map$(core.String, core.Object)));
        this[_removeSeen](object);
        return true;
      } else {
        return false;
      }
    }
    /** @param {core.List} list */
    writeList(list) {
      this.writeString('[');
      if (dart.notNull(list[dartx.length]) > 0) {
        this.writeObject(list[dartx.get](0));
        for (let i = 1; dart.notNull(i) < dart.notNull(list[dartx.length]); i = dart.notNull(i) + 1) {
          this.writeString(',');
          this.writeObject(list[dartx.get](i));
        }
      }
      this.writeString(']');
    }
    /** @param {core.Map} map */
    writeMap(map) {
      this.writeString('{');
      let separator = '"';
      map.forEach(dart.fn(((key, value) => {
        this.writeString(separator);
        separator = ',"';
        this.writeStringContent(key);
        this.writeString('":');
        this.writeObject(value);
      }).bind(this), dart.dynamic, [core.String, dart.dynamic]));
      this.writeString('}');
    }
  }
  dart.setSignature(_JsonStringifier, {
    constructors: () => ({_JsonStringifier: [_JsonStringifier, [dart.functionType(core.Object, [core.Object])]]}),
    methods: () => ({
      writeStringContent: [dart.void, [core.String]],
      [_checkCycle]: [dart.void, [dart.dynamic]],
      [_removeSeen]: [dart.void, [dart.dynamic]],
      writeObject: [dart.void, [dart.dynamic]],
      writeJsonValue: [core.bool, [dart.dynamic]],
      writeList: [dart.void, [core.List]],
      writeMap: [dart.void, [core.Map$(core.String, core.Object)]]
    }),
    statics: () => ({hexDigit: [core.int, [core.int]]}),
    names: ['hexDigit']
  });
  _JsonStringifier.BACKSPACE = 8;
  _JsonStringifier.TAB = 9;
  _JsonStringifier.NEWLINE = 10;
  _JsonStringifier.CARRIAGE_RETURN = 13;
  _JsonStringifier.FORM_FEED = 12;
  _JsonStringifier.QUOTE = 34;
  _JsonStringifier.CHAR_0 = 48;
  _JsonStringifier.BACKSLASH = 92;
  _JsonStringifier.CHAR_b = 98;
  _JsonStringifier.CHAR_f = 102;
  _JsonStringifier.CHAR_n = 110;
  _JsonStringifier.CHAR_r = 114;
  _JsonStringifier.CHAR_t = 116;
  _JsonStringifier.CHAR_u = 117;
  let _indentLevel = Symbol('_indentLevel');
  class _JsonPrettyPrintMixin extends core.Object {
    /**
     * @constructor @extends {core.Object}
     * @implements {_JsonStringifier}
     */
    _JsonPrettyPrintMixin() {
      this[_indentLevel] = 0;
    }
    /** @param {core.List} list */
    writeList(list) {
      if (dart.notNull(list[dartx.isEmpty])) {
        this.writeString('[]');
      } else {
        this.writeString('[\n');
        this[_indentLevel] = dart.notNull(this[_indentLevel]) + 1;
        this.writeIndentation(this[_indentLevel]);
        this.writeObject(list[dartx.get](0));
        for (let i = 1; dart.notNull(i) < dart.notNull(list[dartx.length]); i = dart.notNull(i) + 1) {
          this.writeString(',\n');
          this.writeIndentation(this[_indentLevel]);
          this.writeObject(list[dartx.get](i));
        }
        this.writeString('\n');
        this[_indentLevel] = dart.notNull(this[_indentLevel]) - 1;
        this.writeIndentation(this[_indentLevel]);
        this.writeString(']');
      }
    }
    /** @param {core.Map} map */
    writeMap(map) {
      if (dart.notNull(map.isEmpty)) {
        this.writeString('{}');
      } else {
        this.writeString('{\n');
        this[_indentLevel] = dart.notNull(this[_indentLevel]) + 1;
        let first = true;
        map.forEach(dart.fn(((key, value) => {
          if (!dart.notNull(first)) {
            this.writeString(",\n");
          }
          this.writeIndentation(this[_indentLevel]);
          this.writeString('"');
          this.writeStringContent(key);
          this.writeString('": ');
          this.writeObject(value);
          first = false;
        }).bind(this), dart.dynamic, [core.String, core.Object]));
        this.writeString('\n');
        this[_indentLevel] = dart.notNull(this[_indentLevel]) - 1;
        this.writeIndentation(this[_indentLevel]);
        this.writeString('}');
      }
    }
  }
  _JsonPrettyPrintMixin[dart.implements] = () => [_JsonStringifier];
  dart.setSignature(_JsonPrettyPrintMixin, {
    methods: () => ({
      writeList: [dart.void, [core.List]],
      writeMap: [dart.void, [core.Map]]
    })
  });
  class _JsonStringStringifier extends _JsonStringifier {
    /**
     * @constructor
     * @param {core.StringSink} _sink
     * @return {_JsonStringStringifier}
     */
    _JsonStringStringifier(sink, _toEncodable) {
      this[_sink] = sink;
      super._JsonStringifier(dart.as(_toEncodable, dart.functionType(core.Object, [core.Object])));
    }
    /**
     * @param {function(*):*} toEncodable
     * @param {string} indent
     * @return {string}
     */
    static stringify(object, toEncodable, indent) {
      let output = new core.StringBuffer();
      _JsonStringStringifier.printOn(object, output, toEncodable, indent);
      return dart.toString(output);
    }
    /**
     * @param {core.StringSink} output
     * @param {function(*):*} toEncodable
     * @param {string} indent
     */
    static printOn(object, output, toEncodable, indent) {
      let stringifier = null;
      if (indent == null) {
        stringifier = new _JsonStringStringifier(output, toEncodable);
      } else {
        stringifier = new _JsonStringStringifierPretty(output, toEncodable, indent);
      }
      dart.dsend(stringifier, 'writeObject', object);
    }
    /** @param {?number} number */
    writeNumber(number) {
      this[_sink].write(dart.toString(number));
    }
    /** @param {string} string */
    writeString(string) {
      this[_sink].write(string);
    }
    /**
     * @param {string} string
     * @param {?number} start
     * @param {?number} end
     */
    writeStringSlice(string, start, end) {
      this[_sink].write(string[dartx.substring](start, end));
    }
    /** @param {?number} charCode */
    writeCharCode(charCode) {
      this[_sink].writeCharCode(charCode);
    }
  }
  dart.setSignature(_JsonStringStringifier, {
    constructors: () => ({_JsonStringStringifier: [_JsonStringStringifier, [core.StringSink, dart.dynamic]]}),
    methods: () => ({
      writeNumber: [dart.void, [core.num]],
      writeString: [dart.void, [core.String]],
      writeStringSlice: [dart.void, [core.String, core.int, core.int]],
      writeCharCode: [dart.void, [core.int]]
    }),
    statics: () => ({
      stringify: [core.String, [dart.dynamic, dart.functionType(dart.dynamic, [dart.dynamic]), core.String]],
      printOn: [dart.void, [dart.dynamic, core.StringSink, dart.functionType(dart.dynamic, [dart.dynamic]), core.String]]
    }),
    names: ['stringify', 'printOn']
  });
  class _JsonStringStringifierPretty extends dart.mixin(_JsonStringStringifier, _JsonPrettyPrintMixin) {
    /**
     * @constructor
     * @param {core.StringSink} sink
     * @param {core.Function} toEncodable
     * @param {string} _indent
     * @return {_JsonStringStringifierPretty}
     */
    _JsonStringStringifierPretty(sink, toEncodable, indent) {
      this[_indent] = indent;
      super._JsonStringStringifier(sink, toEncodable);
    }
    /** @param {?number} count */
    writeIndentation(count) {
      for (let i = 0; dart.notNull(i) < dart.notNull(count); i = dart.notNull(i) + 1)
        this.writeString(this[_indent]);
    }
  }
  dart.setSignature(_JsonStringStringifierPretty, {
    constructors: () => ({_JsonStringStringifierPretty: [_JsonStringStringifierPretty, [core.StringSink, core.Function, core.String]]}),
    methods: () => ({writeIndentation: [dart.void, [core.int]]})
  });
  class _JsonUtf8Stringifier extends _JsonStringifier {
    /**
     * @constructor
     * @param {?number} bufferSize
     * @param {core.Function} addChunk
     * @return {_JsonUtf8Stringifier}
     */
    _JsonUtf8Stringifier(toEncodable, bufferSize, addChunk) {
      this.addChunk = addChunk;
      this.bufferSize = bufferSize;
      this.buffer = typed_data.Uint8List.new(bufferSize);
      this.index = 0;
      super._JsonStringifier(dart.as(toEncodable, dart.functionType(core.Object, [core.Object])));
    }
    /**
     * @param {core.Object} object
     * @param {core.List} indent
     * @param {function(core.Object):*} toEncodableFunction
     * @param {?number} bufferSize
     * @param {function(typed_data.Uint8List, ?number, ?number)} addChunk
     */
    static stringify(object, indent, toEncodableFunction, bufferSize, addChunk) {
      let stringifier = null;
      if (indent != null) {
        stringifier = new _JsonUtf8StringifierPretty(toEncodableFunction, indent, bufferSize, addChunk);
      } else {
        stringifier = new _JsonUtf8Stringifier(toEncodableFunction, bufferSize, addChunk);
      }
      stringifier.writeObject(object);
      stringifier.flush();
    }
    flush() {
      if (dart.notNull(this.index) > 0) {
        dart.dcall(this.addChunk, this.buffer, 0, this.index);
      }
      this.buffer = null;
      this.index = 0;
    }
    /** @param {?number} number */
    writeNumber(number) {
      this.writeAsciiString(dart.toString(number));
    }
    /** @param {string} string */
    writeAsciiString(string) {
      for (let i = 0; dart.notNull(i) < dart.notNull(string[dartx.length]); i = dart.notNull(i) + 1) {
        let char = string[dartx.codeUnitAt](i);
        dart.assert(dart.notNull(char) <= 127);
        this.writeByte(char);
      }
    }
    /** @param {string} string */
    writeString(string) {
      this.writeStringSlice(string, 0, string[dartx.length]);
    }
    /**
     * @param {string} string
     * @param {?number} start
     * @param {?number} end
     */
    writeStringSlice(string, start, end) {
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        let char = string[dartx.codeUnitAt](i);
        if (dart.notNull(char) <= 127) {
          this.writeByte(char);
        } else {
          if ((dart.notNull(char) & 64512) == 55296 && dart.notNull(i) + 1 < dart.notNull(end)) {
            let nextChar = string[dartx.codeUnitAt](dart.notNull(i) + 1);
            if ((dart.notNull(nextChar) & 64512) == 56320) {
              char = 65536 + ((dart.notNull(char) & 1023) << 10) + (dart.notNull(nextChar) & 1023);
              this.writeFourByteCharCode(char);
              i = dart.notNull(i) + 1;
              continue;
            }
          }
          this.writeMultiByteCharCode(char);
        }
      }
    }
    /** @param {?number} charCode */
    writeCharCode(charCode) {
      if (dart.notNull(charCode) <= 127) {
        this.writeByte(charCode);
        return;
      }
      this.writeMultiByteCharCode(charCode);
    }
    /** @param {?number} charCode */
    writeMultiByteCharCode(charCode) {
      if (dart.notNull(charCode) <= 2047) {
        this.writeByte(192 | dart.notNull(charCode) >> 6);
        this.writeByte(128 | dart.notNull(charCode) & 63);
        return;
      }
      if (dart.notNull(charCode) <= 65535) {
        this.writeByte(224 | dart.notNull(charCode) >> 12);
        this.writeByte(128 | dart.notNull(charCode) >> 6 & 63);
        this.writeByte(128 | dart.notNull(charCode) & 63);
        return;
      }
      this.writeFourByteCharCode(charCode);
    }
    /** @param {?number} charCode */
    writeFourByteCharCode(charCode) {
      dart.assert(dart.notNull(charCode) <= 1114111);
      this.writeByte(240 | dart.notNull(charCode) >> 18);
      this.writeByte(128 | dart.notNull(charCode) >> 12 & 63);
      this.writeByte(128 | dart.notNull(charCode) >> 6 & 63);
      this.writeByte(128 | dart.notNull(charCode) & 63);
    }
    /** @param {?number} byte */
    writeByte(byte) {
      dart.assert(dart.notNull(byte) <= 255);
      if (this.index == this.buffer.length) {
        dart.dcall(this.addChunk, this.buffer, 0, this.index);
        this.buffer = typed_data.Uint8List.new(this.bufferSize);
        this.index = 0;
      }
      this.buffer.set((() => {
        let x = this.index;
        this.index = dart.notNull(x) + 1;
        return x;
      }).bind(this)(), byte);
    }
  }
  dart.setSignature(_JsonUtf8Stringifier, {
    constructors: () => ({_JsonUtf8Stringifier: [_JsonUtf8Stringifier, [dart.dynamic, core.int, core.Function]]}),
    methods: () => ({
      flush: [dart.void, []],
      writeNumber: [dart.void, [core.num]],
      writeAsciiString: [dart.void, [core.String]],
      writeString: [dart.void, [core.String]],
      writeStringSlice: [dart.void, [core.String, core.int, core.int]],
      writeCharCode: [dart.void, [core.int]],
      writeMultiByteCharCode: [dart.void, [core.int]],
      writeFourByteCharCode: [dart.void, [core.int]],
      writeByte: [dart.void, [core.int]]
    }),
    statics: () => ({stringify: [dart.void, [core.Object, core.List$(core.int), dart.functionType(dart.dynamic, [core.Object]), core.int, dart.functionType(dart.void, [typed_data.Uint8List, core.int, core.int])]]}),
    names: ['stringify']
  });
  class _JsonUtf8StringifierPretty extends dart.mixin(_JsonUtf8Stringifier, _JsonPrettyPrintMixin) {
    /**
     * @constructor
     * @param {core.List} indent
     * @return {_JsonUtf8StringifierPretty}
     */
    _JsonUtf8StringifierPretty(toEncodableFunction, indent, bufferSize, addChunk) {
      this.indent = indent;
      super._JsonUtf8Stringifier(toEncodableFunction, dart.as(bufferSize, core.int), dart.as(addChunk, core.Function));
    }
    /** @param {?number} count */
    writeIndentation(count) {
      let indent = this.indent;
      let indentLength = indent[dartx.length];
      if (indentLength == 1) {
        let char = indent[dartx.get](0);
        while (dart.notNull(count) > 0) {
          this.writeByte(char);
          count = dart.notNull(count) - 1;
        }
        return;
      }
      while (dart.notNull(count) > 0) {
        count = dart.notNull(count) - 1;
        let end = dart.notNull(this.index) + dart.notNull(indentLength);
        if (dart.notNull(end) <= dart.notNull(this.buffer.length)) {
          this.buffer.setRange(this.index, end, indent);
          this.index = end;
        } else {
          for (let i = 0; dart.notNull(i) < dart.notNull(indentLength); i = dart.notNull(i) + 1) {
            this.writeByte(indent[dartx.get](i));
          }
        }
      }
    }
  }
  dart.setSignature(_JsonUtf8StringifierPretty, {
    constructors: () => ({_JsonUtf8StringifierPretty: [_JsonUtf8StringifierPretty, [dart.dynamic, core.List$(core.int), dart.dynamic, dart.dynamic]]}),
    methods: () => ({writeIndentation: [dart.void, [core.int]]})
  });
  let __CastType0 = dart.typedef('__CastType0', () => dart.functionType(core.Object, [core.Object]));
  let __CastType2 = dart.typedef('__CastType2', () => dart.functionType(dart.dynamic, [dart.dynamic]));
  let __CastType4 = dart.typedef('__CastType4', () => dart.functionType(dart.dynamic, [core.Object]));
  class Latin1Codec extends Encoding {
    /**
     * @constructor
     * @param {{allowInvalid: (?boolean|undefined)}=} opts
     * @return {Latin1Codec}
     */
    Latin1Codec(opts) {
      let allowInvalid = opts && 'allowInvalid' in opts ? opts.allowInvalid : false;
      this[_allowInvalid] = allowInvalid;
      super.Encoding();
    }
    /** @return {string} */
    get name() {
      return "iso-8859-1";
    }
    /**
     * @param {core.List} bytes
     * @param {{allowInvalid: (?boolean|undefined)}=} opts
     * @return {string}
     */
    decode(bytes, opts) {
      let allowInvalid = opts && 'allowInvalid' in opts ? opts.allowInvalid : null;
      if (allowInvalid == null)
        allowInvalid = this[_allowInvalid];
      if (dart.notNull(allowInvalid)) {
        return dart.const(new Latin1Decoder({allowInvalid: true})).convert(bytes);
      } else {
        return dart.const(new Latin1Decoder({allowInvalid: false})).convert(bytes);
      }
    }
    /** @return {Converter} */
    get encoder() {
      return dart.const(new Latin1Encoder());
    }
    /** @return {Converter} */
    get decoder() {
      return dart.notNull(this[_allowInvalid]) ? dart.const(new Latin1Decoder({allowInvalid: true})) : dart.const(new Latin1Decoder({allowInvalid: false}));
    }
  }
  dart.setSignature(Latin1Codec, {
    constructors: () => ({Latin1Codec: [Latin1Codec, [], {allowInvalid: core.bool}]}),
    methods: () => ({decode: [core.String, [core.List$(core.int)], {allowInvalid: core.bool}]})
  });
  let LATIN1 = dart.const(new Latin1Codec());
  let _LATIN1_MASK = 255;
  class Latin1Encoder extends _UnicodeSubsetEncoder {
    /**
     * @constructor
     * @return {Latin1Encoder}
     */
    Latin1Encoder() {
      super._UnicodeSubsetEncoder(_LATIN1_MASK);
    }
  }
  dart.setSignature(Latin1Encoder, {
    constructors: () => ({Latin1Encoder: [Latin1Encoder, []]})
  });
  class Latin1Decoder extends _UnicodeSubsetDecoder {
    /**
     * @constructor
     * @param {{allowInvalid: (?boolean|undefined)}=} opts
     * @return {Latin1Decoder}
     */
    Latin1Decoder(opts) {
      let allowInvalid = opts && 'allowInvalid' in opts ? opts.allowInvalid : false;
      super._UnicodeSubsetDecoder(allowInvalid, _LATIN1_MASK);
    }
    /**
     * @param {core.Sink} sink
     * @return {ByteConversionSink}
     */
    startChunkedConversion(sink) {
      let stringSink = null;
      if (dart.is(sink, StringConversionSink)) {
        stringSink = sink;
      } else {
        stringSink = StringConversionSink.from(sink);
      }
      if (!dart.notNull(this[_allowInvalid]))
        return new _Latin1DecoderSink(stringSink);
      return new _Latin1AllowInvalidDecoderSink(stringSink);
    }
  }
  dart.setSignature(Latin1Decoder, {
    constructors: () => ({Latin1Decoder: [Latin1Decoder, [], {allowInvalid: core.bool}]}),
    methods: () => ({startChunkedConversion: [ByteConversionSink, [core.Sink$(core.String)]]})
  });
  let _addSliceToSink = Symbol('_addSliceToSink');
  class _Latin1DecoderSink extends ByteConversionSinkBase {
    /**
     * @constructor
     * @param {StringConversionSink} _sink
     * @return {_Latin1DecoderSink}
     */
    _Latin1DecoderSink(sink) {
      this[_sink] = sink;
    }
    close() {
      this[_sink].close();
    }
    /** @param {core.List} source */
    add(source) {
      this.addSlice(source, 0, source[dartx.length], false);
    }
    /**
     * @param {core.List} source
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    [_addSliceToSink](source, start, end, isLast) {
      this[_sink].add(core.String.fromCharCodes(source, start, end));
      if (dart.notNull(isLast))
        this.close();
    }
    /**
     * @param {core.List} source
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(source, start, end, isLast) {
      core.RangeError.checkValidRange(start, end, source[dartx.length]);
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        let char = source[dartx.get](i);
        if (dart.notNull(char) > dart.notNull(_LATIN1_MASK) || dart.notNull(char) < 0) {
          dart.throw(new core.FormatException("Source contains non-Latin-1 characters."));
        }
      }
      if (dart.notNull(start) < dart.notNull(end)) {
        this[_addSliceToSink](source, start, end, isLast);
      }
      if (dart.notNull(isLast)) {
        this.close();
      }
    }
  }
  dart.setSignature(_Latin1DecoderSink, {
    constructors: () => ({_Latin1DecoderSink: [_Latin1DecoderSink, [StringConversionSink]]}),
    methods: () => ({
      close: [dart.void, []],
      add: [dart.void, [core.List$(core.int)]],
      [_addSliceToSink]: [dart.void, [core.List$(core.int), core.int, core.int, core.bool]]
    })
  });
  class _Latin1AllowInvalidDecoderSink extends _Latin1DecoderSink {
    /**
     * @constructor
     * @param {StringConversionSink} sink
     * @return {_Latin1AllowInvalidDecoderSink}
     */
    _Latin1AllowInvalidDecoderSink(sink) {
      super._Latin1DecoderSink(sink);
    }
    /**
     * @param {core.List} source
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(source, start, end, isLast) {
      core.RangeError.checkValidRange(start, end, source[dartx.length]);
      for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
        let char = source[dartx.get](i);
        if (dart.notNull(char) > dart.notNull(_LATIN1_MASK) || dart.notNull(char) < 0) {
          if (dart.notNull(i) > dart.notNull(start))
            this[_addSliceToSink](source, start, i, false);
          this[_addSliceToSink](dart.const(dart.list([65533], core.int)), 0, 1, false);
          start = dart.notNull(i) + 1;
        }
      }
      if (dart.notNull(start) < dart.notNull(end)) {
        this[_addSliceToSink](source, start, end, isLast);
      }
      if (dart.notNull(isLast)) {
        this.close();
      }
    }
  }
  dart.setSignature(_Latin1AllowInvalidDecoderSink, {
    constructors: () => ({_Latin1AllowInvalidDecoderSink: [_Latin1AllowInvalidDecoderSink, [StringConversionSink]]})
  });
  class LineSplitter extends Converter$(core.String, core.List$(core.String)) {
    /**
     * @constructor
     * @return {LineSplitter}
     */
    LineSplitter() {
      super.Converter();
    }
    /**
     * @param {string} data
     * @return {core.List}
     */
    convert(data) {
      let lines = core.List$(core.String).new();
      _LineSplitterSink._addSlice(data, 0, data[dartx.length], true, dart.bind(lines, dartx.add));
      return lines;
    }
    /**
     * @param {core.Sink} sink
     * @return {StringConversionSink}
     */
    startChunkedConversion(sink) {
      if (!dart.is(sink, StringConversionSink)) {
        sink = StringConversionSink.from(dart.as(sink, core.Sink$(core.String)));
      }
      return new _LineSplitterSink(dart.as(sink, StringConversionSink));
    }
  }
  dart.setSignature(LineSplitter, {
    constructors: () => ({LineSplitter: [LineSplitter, []]}),
    methods: () => ({
      convert: [core.List$(core.String), [core.String]],
      startChunkedConversion: [StringConversionSink, [core.Sink]]
    })
  });
  let _carry = Symbol('_carry');
  class _LineSplitterSink extends StringConversionSinkBase {
    /**
     * @constructor
     * @param {StringConversionSink} _sink
     * @return {_LineSplitterSink}
     */
    _LineSplitterSink(sink) {
      this[_sink] = sink;
      this[_carry] = null;
    }
    /**
     * @param {string} chunk
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(chunk, start, end, isLast) {
      if (this[_carry] != null) {
        chunk = dart.notNull(this[_carry]) + dart.notNull(chunk[dartx.substring](start, end));
        start = 0;
        end = chunk[dartx.length];
        this[_carry] = null;
      }
      this[_carry] = _LineSplitterSink._addSlice(chunk, start, end, isLast, dart.bind(this[_sink], 'add'));
      if (dart.notNull(isLast))
        this[_sink].close();
    }
    close() {
      this.addSlice('', 0, 0, true);
    }
    /**
     * @param {string} chunk
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     * @param {function(string)} adder
     * @return {string}
     */
    static _addSlice(chunk, start, end, isLast, adder) {
      let pos = start;
      while (dart.notNull(pos) < dart.notNull(end)) {
        let skip = 0;
        let char = chunk[dartx.codeUnitAt](pos);
        if (char == _LineSplitterSink._LF) {
          skip = 1;
        } else if (char == _LineSplitterSink._CR) {
          skip = 1;
          if (dart.notNull(pos) + 1 < dart.notNull(end)) {
            if (chunk[dartx.codeUnitAt](dart.notNull(pos) + 1) == _LineSplitterSink._LF) {
              skip = 2;
            }
          } else if (!dart.notNull(isLast)) {
            return chunk[dartx.substring](start, end);
          }
        }
        if (dart.notNull(skip) > 0) {
          adder(chunk[dartx.substring](start, pos));
          start = pos = dart.notNull(pos) + dart.notNull(skip);
        } else {
          pos = dart.notNull(pos) + 1;
        }
      }
      if (pos != start) {
        let carry = chunk[dartx.substring](start, pos);
        if (dart.notNull(isLast)) {
          adder(carry);
        } else {
          return carry;
        }
      }
      return null;
    }
  }
  dart.setSignature(_LineSplitterSink, {
    constructors: () => ({_LineSplitterSink: [_LineSplitterSink, [StringConversionSink]]}),
    methods: () => ({
      addSlice: [dart.void, [core.String, core.int, core.int, core.bool]],
      close: [dart.void, []]
    }),
    statics: () => ({_addSlice: [core.String, [core.String, core.int, core.int, core.bool, dart.functionType(dart.void, [core.String])]]}),
    names: ['_addSlice']
  });
  _LineSplitterSink._LF = 10;
  _LineSplitterSink._CR = 13;
  class StringConversionSink extends ChunkedConversionSink$(core.String) {
    /**
     * @constructor
     * @return {StringConversionSink}
     */
    StringConversionSink() {
      super.ChunkedConversionSink();
    }
    /**
     * @param {function(string)} callback
     * @return {StringConversionSink}
     */
    static withCallback(callback) {
      return new _StringCallbackSink(callback);
    }
    /**
     * @param {core.Sink} sink
     * @return {StringConversionSink}
     */
    static from(sink) {
      return new _StringAdapterSink(sink);
    }
    /**
     * @param {core.StringSink} sink
     * @return {StringConversionSink}
     */
    static fromStringSink(sink) {
      return new _StringSinkConversionSink(sink);
    }
  }
  dart.setSignature(StringConversionSink, {
    constructors: () => ({
      StringConversionSink: [StringConversionSink, []],
      withCallback: [StringConversionSink, [dart.functionType(dart.void, [core.String])]],
      from: [StringConversionSink, [core.Sink$(core.String)]],
      fromStringSink: [StringConversionSink, [core.StringSink]]
    })
  });
  class ClosableStringSink extends core.StringSink {
    /**
     * @param {core.StringSink} sink
     * @param {function()} onClose
     * @return {ClosableStringSink}
     */
    static fromStringSink(sink, onClose) {
      return new _ClosableStringSink(sink, onClose);
    }
  }
  dart.setSignature(ClosableStringSink, {
    constructors: () => ({fromStringSink: [ClosableStringSink, [core.StringSink, dart.functionType(dart.void, [])]]})
  });
  let _StringSinkCloseCallback = dart.typedef('_StringSinkCloseCallback', () => dart.functionType(dart.void, []));
  class _ClosableStringSink extends core.Object {
    /**
     * @constructor
     * @param {core.StringSink} _sink
     * @param {function()} _callback
     * @return {_ClosableStringSink}
     */
    _ClosableStringSink(sink, callback) {
      this[_sink] = sink;
      this[_callback] = callback;
    }
    close() {
      return this[_callback]();
    }
    /** @param {?number} charCode */
    writeCharCode(charCode) {
      return this[_sink].writeCharCode(charCode);
    }
    /** @param {core.Object} o */
    write(o) {
      return this[_sink].write(o);
    }
    /** @param {core.Object=} o */
    writeln(o) {
      if (o === void 0)
        o = "";
      return this[_sink].writeln(o);
    }
    /**
     * @param {core.Iterable} objects
     * @param {string=} separator
     */
    writeAll(objects, separator) {
      if (separator === void 0)
        separator = "";
      return this[_sink].writeAll(objects, separator);
    }
  }
  _ClosableStringSink[dart.implements] = () => [ClosableStringSink];
  dart.setSignature(_ClosableStringSink, {
    constructors: () => ({_ClosableStringSink: [_ClosableStringSink, [core.StringSink, _StringSinkCloseCallback]]}),
    methods: () => ({
      close: [dart.void, []],
      writeCharCode: [dart.void, [core.int]],
      write: [dart.void, [core.Object]],
      writeln: [dart.void, [], [core.Object]],
      writeAll: [dart.void, [core.Iterable], [core.String]]
    })
  });
  let _flush = Symbol('_flush');
  class _StringConversionSinkAsStringSinkAdapter extends core.Object {
    /**
     * @constructor
     * @param {StringConversionSink} _chunkedSink
     * @return {_StringConversionSinkAsStringSinkAdapter}
     */
    _StringConversionSinkAsStringSinkAdapter(chunkedSink) {
      this[_chunkedSink] = chunkedSink;
      this[_buffer] = new core.StringBuffer();
    }
    close() {
      if (dart.notNull(this[_buffer].isNotEmpty))
        this[_flush]();
      this[_chunkedSink].close();
    }
    /** @param {?number} charCode */
    writeCharCode(charCode) {
      this[_buffer].writeCharCode(charCode);
      if (dart.notNull(this[_buffer].length) > dart.notNull(_StringConversionSinkAsStringSinkAdapter._MIN_STRING_SIZE))
        this[_flush]();
    }
    /** @param {core.Object} o */
    write(o) {
      if (dart.notNull(this[_buffer].isNotEmpty))
        this[_flush]();
      let str = dart.toString(o);
      this[_chunkedSink].add(dart.toString(o));
    }
    /** @param {core.Object=} o */
    writeln(o) {
      if (o === void 0)
        o = "";
      this[_buffer].writeln(o);
      if (dart.notNull(this[_buffer].length) > dart.notNull(_StringConversionSinkAsStringSinkAdapter._MIN_STRING_SIZE))
        this[_flush]();
    }
    /**
     * @param {core.Iterable} objects
     * @param {string=} separator
     */
    writeAll(objects, separator) {
      if (separator === void 0)
        separator = "";
      if (dart.notNull(this[_buffer].isNotEmpty))
        this[_flush]();
      let iterator = objects[dartx.iterator];
      if (!dart.notNull(iterator.moveNext()))
        return;
      if (dart.notNull(separator[dartx.isEmpty])) {
        do {
          this[_chunkedSink].add(dart.toString(iterator.current));
        } while (dart.notNull(iterator.moveNext()));
      } else {
        this[_chunkedSink].add(dart.toString(iterator.current));
        while (dart.notNull(iterator.moveNext())) {
          this.write(separator);
          this[_chunkedSink].add(dart.toString(iterator.current));
        }
      }
    }
    [_flush]() {
      let accumulated = dart.toString(this[_buffer]);
      this[_buffer].clear();
      this[_chunkedSink].add(accumulated);
    }
  }
  _StringConversionSinkAsStringSinkAdapter[dart.implements] = () => [ClosableStringSink];
  dart.setSignature(_StringConversionSinkAsStringSinkAdapter, {
    constructors: () => ({_StringConversionSinkAsStringSinkAdapter: [_StringConversionSinkAsStringSinkAdapter, [StringConversionSink]]}),
    methods: () => ({
      close: [dart.void, []],
      writeCharCode: [dart.void, [core.int]],
      write: [dart.void, [core.Object]],
      writeln: [dart.void, [], [core.Object]],
      writeAll: [dart.void, [core.Iterable], [core.String]],
      [_flush]: [dart.void, []]
    })
  });
  _StringConversionSinkAsStringSinkAdapter._MIN_STRING_SIZE = 16;
  let _stringSink = Symbol('_stringSink');
  class _StringSinkConversionSink extends StringConversionSinkBase {
    /**
     * @constructor
     * @param {core.StringSink} _stringSink
     * @return {_StringSinkConversionSink}
     */
    _StringSinkConversionSink(stringSink) {
      this[_stringSink] = stringSink;
    }
    close() {}
    /**
     * @param {string} str
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(str, start, end, isLast) {
      if (start != 0 || end != str[dartx.length]) {
        for (let i = start; dart.notNull(i) < dart.notNull(end); i = dart.notNull(i) + 1) {
          this[_stringSink].writeCharCode(str[dartx.codeUnitAt](i));
        }
      } else {
        this[_stringSink].write(str);
      }
      if (dart.notNull(isLast))
        this.close();
    }
    /** @param {string} str */
    add(str) {
      return this[_stringSink].write(str);
    }
    /**
     * @param {?boolean} allowMalformed
     * @return {ByteConversionSink}
     */
    asUtf8Sink(allowMalformed) {
      return new _Utf8StringSinkAdapter(this, this[_stringSink], allowMalformed);
    }
    /** @return {ClosableStringSink} */
    asStringSink() {
      return ClosableStringSink.fromStringSink(this[_stringSink], dart.bind(this, 'close'));
    }
  }
  dart.setSignature(_StringSinkConversionSink, {
    constructors: () => ({_StringSinkConversionSink: [_StringSinkConversionSink, [core.StringSink]]}),
    methods: () => ({
      close: [dart.void, []],
      addSlice: [dart.void, [core.String, core.int, core.int, core.bool]]
    })
  });
  class _StringCallbackSink extends _StringSinkConversionSink {
    /**
     * @constructor
     * @param {function(string)} _callback
     * @return {_StringCallbackSink}
     */
    _StringCallbackSink(callback) {
      this[_callback] = callback;
      super._StringSinkConversionSink(new core.StringBuffer());
    }
    close() {
      let buffer = dart.as(this[_stringSink], core.StringBuffer);
      let accumulated = dart.toString(buffer);
      buffer.clear();
      this[_callback](accumulated);
    }
    /**
     * @param {?boolean} allowMalformed
     * @return {ByteConversionSink}
     */
    asUtf8Sink(allowMalformed) {
      return new _Utf8StringSinkAdapter(this, this[_stringSink], allowMalformed);
    }
  }
  dart.setSignature(_StringCallbackSink, {
    constructors: () => ({_StringCallbackSink: [_StringCallbackSink, [_ChunkedConversionCallback$(core.String)]]})
  });
  class _StringAdapterSink extends StringConversionSinkBase {
    /**
     * @constructor
     * @param {core.Sink} _sink
     * @return {_StringAdapterSink}
     */
    _StringAdapterSink(sink) {
      this[_sink] = sink;
    }
    /** @param {string} str */
    add(str) {
      return this[_sink].add(str);
    }
    /**
     * @param {string} str
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(str, start, end, isLast) {
      if (start == 0 && end == str[dartx.length]) {
        this.add(str);
      } else {
        this.add(str[dartx.substring](start, end));
      }
      if (dart.notNull(isLast))
        this.close();
    }
    close() {
      return this[_sink].close();
    }
  }
  dart.setSignature(_StringAdapterSink, {
    constructors: () => ({_StringAdapterSink: [_StringAdapterSink, [core.Sink$(core.String)]]}),
    methods: () => ({
      addSlice: [dart.void, [core.String, core.int, core.int, core.bool]],
      close: [dart.void, []]
    })
  });
  let _decoder = Symbol('_decoder');
  class _Utf8StringSinkAdapter extends ByteConversionSink {
    /**
     * @constructor
     * @param {core.Sink} _sink
     * @param {core.StringSink} stringSink
     * @param {?boolean} allowMalformed
     * @return {_Utf8StringSinkAdapter}
     */
    _Utf8StringSinkAdapter(sink, stringSink, allowMalformed) {
      this[_sink] = sink;
      this[_decoder] = new _Utf8Decoder(stringSink, allowMalformed);
      super.ByteConversionSink();
    }
    close() {
      this[_decoder].close();
      if (this[_sink] != null)
        this[_sink].close();
    }
    /** @param {core.List} chunk */
    add(chunk) {
      this.addSlice(chunk, 0, chunk[dartx.length], false);
    }
    /**
     * @param {core.List} codeUnits
     * @param {?number} startIndex
     * @param {?number} endIndex
     * @param {?boolean} isLast
     */
    addSlice(codeUnits, startIndex, endIndex, isLast) {
      this[_decoder].convert(codeUnits, startIndex, endIndex);
      if (dart.notNull(isLast))
        this.close();
    }
  }
  dart.setSignature(_Utf8StringSinkAdapter, {
    constructors: () => ({_Utf8StringSinkAdapter: [_Utf8StringSinkAdapter, [core.Sink, core.StringSink, core.bool]]}),
    methods: () => ({
      close: [dart.void, []],
      add: [dart.void, [core.List$(core.int)]],
      addSlice: [dart.void, [core.List$(core.int), core.int, core.int, core.bool]]
    })
  });
  class _Utf8ConversionSink extends ByteConversionSink {
    /**
     * @constructor
     * @param {StringConversionSink} sink
     * @param {?boolean} allowMalformed
     * @return {_Utf8ConversionSink}
     */
    _Utf8ConversionSink(sink, allowMalformed) {
      this._(sink, new core.StringBuffer(), allowMalformed);
    }
    /**
     * @constructor
     * @param {StringConversionSink} _chunkedSink
     * @param {core.StringBuffer} stringBuffer
     * @param {?boolean} allowMalformed
     * @return {_Utf8ConversionSink}
     */
    _(chunkedSink, stringBuffer, allowMalformed) {
      this[_chunkedSink] = chunkedSink;
      this[_decoder] = new _Utf8Decoder(stringBuffer, allowMalformed);
      this[_buffer] = stringBuffer;
      super.ByteConversionSink();
    }
    close() {
      this[_decoder].close();
      if (dart.notNull(this[_buffer].isNotEmpty)) {
        let accumulated = dart.toString(this[_buffer]);
        this[_buffer].clear();
        this[_chunkedSink].addSlice(accumulated, 0, accumulated[dartx.length], true);
      } else {
        this[_chunkedSink].close();
      }
    }
    /** @param {core.List} chunk */
    add(chunk) {
      this.addSlice(chunk, 0, chunk[dartx.length], false);
    }
    /**
     * @param {core.List} chunk
     * @param {?number} startIndex
     * @param {?number} endIndex
     * @param {?boolean} isLast
     */
    addSlice(chunk, startIndex, endIndex, isLast) {
      this[_decoder].convert(chunk, startIndex, endIndex);
      if (dart.notNull(this[_buffer].isNotEmpty)) {
        let accumulated = dart.toString(this[_buffer]);
        this[_chunkedSink].addSlice(accumulated, 0, accumulated[dartx.length], isLast);
        this[_buffer].clear();
        return;
      }
      if (dart.notNull(isLast))
        this.close();
    }
  }
  dart.defineNamedConstructor(_Utf8ConversionSink, '_');
  dart.setSignature(_Utf8ConversionSink, {
    constructors: () => ({
      _Utf8ConversionSink: [_Utf8ConversionSink, [StringConversionSink, core.bool]],
      _: [_Utf8ConversionSink, [StringConversionSink, core.StringBuffer, core.bool]]
    }),
    methods: () => ({
      close: [dart.void, []],
      add: [dart.void, [core.List$(core.int)]],
      addSlice: [dart.void, [core.List$(core.int), core.int, core.int, core.bool]]
    })
  });
  let UNICODE_REPLACEMENT_CHARACTER_RUNE = 65533;
  let UNICODE_BOM_CHARACTER_RUNE = 65279;
  let _allowMalformed = Symbol('_allowMalformed');
  class Utf8Codec extends Encoding {
    /**
     * @constructor
     * @param {{allowMalformed: (?boolean|undefined)}=} opts
     * @return {Utf8Codec}
     */
    Utf8Codec(opts) {
      let allowMalformed = opts && 'allowMalformed' in opts ? opts.allowMalformed : false;
      this[_allowMalformed] = allowMalformed;
      super.Encoding();
    }
    /** @return {string} */
    get name() {
      return "utf-8";
    }
    /**
     * @param {core.List} codeUnits
     * @param {{allowMalformed: (?boolean|undefined)}=} opts
     * @return {string}
     */
    decode(codeUnits, opts) {
      let allowMalformed = opts && 'allowMalformed' in opts ? opts.allowMalformed : null;
      if (allowMalformed == null)
        allowMalformed = this[_allowMalformed];
      return new Utf8Decoder({allowMalformed: allowMalformed}).convert(codeUnits);
    }
    /** @return {Utf8Encoder} */
    get encoder() {
      return new Utf8Encoder();
    }
    /** @return {Utf8Decoder} */
    get decoder() {
      return new Utf8Decoder({allowMalformed: this[_allowMalformed]});
    }
  }
  dart.setSignature(Utf8Codec, {
    constructors: () => ({Utf8Codec: [Utf8Codec, [], {allowMalformed: core.bool}]}),
    methods: () => ({decode: [core.String, [core.List$(core.int)], {allowMalformed: core.bool}]})
  });
  let UTF8 = dart.const(new Utf8Codec());
  let _fillBuffer = Symbol('_fillBuffer');
  let _writeSurrogate = Symbol('_writeSurrogate');
  class Utf8Encoder extends Converter$(core.String, core.List$(core.int)) {
    /**
     * @constructor
     * @return {Utf8Encoder}
     */
    Utf8Encoder() {
      super.Converter();
    }
    /**
     * @param {string} string
     * @param {?number=} start
     * @param {?number=} end
     * @return {core.List}
     */
    convert(string, start, end) {
      if (start === void 0)
        start = 0;
      if (end === void 0)
        end = null;
      let stringLength = string[dartx.length];
      core.RangeError.checkValidRange(start, end, stringLength);
      if (end == null)
        end = stringLength;
      let length = dart.notNull(end) - dart.notNull(start);
      if (length == 0)
        return typed_data.Uint8List.new(0);
      let encoder = new _Utf8Encoder.withBufferSize(dart.notNull(length) * 3);
      let endPosition = encoder[_fillBuffer](string, start, end);
      dart.assert(dart.notNull(endPosition) >= dart.notNull(end) - 1);
      if (endPosition != end) {
        let lastCodeUnit = string[dartx.codeUnitAt](dart.notNull(end) - 1);
        dart.assert(_isLeadSurrogate(lastCodeUnit));
        let wasCombined = encoder[_writeSurrogate](lastCodeUnit, 0);
        dart.assert(!dart.notNull(wasCombined));
      }
      return encoder[_buffer][dartx.sublist](0, encoder[_bufferIndex]);
    }
    /**
     * @param {core.Sink} sink
     * @return {StringConversionSink}
     */
    startChunkedConversion(sink) {
      if (!dart.is(sink, ByteConversionSink)) {
        sink = ByteConversionSink.from(sink);
      }
      return new _Utf8EncoderSink(dart.as(sink, ByteConversionSink));
    }
    /**
     * @param {async.Stream} stream
     * @return {async.Stream}
     */
    bind(stream) {
      return super.bind(stream);
    }
  }
  dart.setSignature(Utf8Encoder, {
    constructors: () => ({Utf8Encoder: [Utf8Encoder, []]}),
    methods: () => ({
      convert: [core.List$(core.int), [core.String], [core.int, core.int]],
      startChunkedConversion: [StringConversionSink, [core.Sink$(core.List$(core.int))]],
      bind: [async.Stream$(core.List$(core.int)), [async.Stream$(core.String)]]
    })
  });
  class _Utf8Encoder extends core.Object {
    /**
     * @constructor
     * @return {_Utf8Encoder}
     */
    _Utf8Encoder() {
      this.withBufferSize(_Utf8Encoder._DEFAULT_BYTE_BUFFER_SIZE);
    }
    /**
     * @constructor
     * @param {?number} bufferSize
     * @return {_Utf8Encoder}
     */
    withBufferSize(bufferSize) {
      this[_buffer] = _Utf8Encoder._createBuffer(bufferSize);
      this[_carry] = 0;
      this[_bufferIndex] = 0;
    }
    /**
     * @param {?number} size
     * @return {core.List}
     */
    static _createBuffer(size) {
      return typed_data.Uint8List.new(size);
    }
    /**
     * @param {?number} leadingSurrogate
     * @param {?number} nextCodeUnit
     * @return {?boolean}
     */
    [_writeSurrogate](leadingSurrogate, nextCodeUnit) {
      if (dart.notNull(_isTailSurrogate(nextCodeUnit))) {
        let rune = _combineSurrogatePair(leadingSurrogate, nextCodeUnit);
        dart.assert(dart.notNull(rune) > dart.notNull(_THREE_BYTE_LIMIT));
        dart.assert(dart.notNull(rune) <= dart.notNull(_FOUR_BYTE_LIMIT));
        this[_buffer][dartx.set]((() => {
          let x = this[_bufferIndex];
          this[_bufferIndex] = dart.notNull(x) + 1;
          return x;
        }).bind(this)(), 240 | dart.notNull(rune) >> 18);
        this[_buffer][dartx.set]((() => {
          let x = this[_bufferIndex];
          this[_bufferIndex] = dart.notNull(x) + 1;
          return x;
        }).bind(this)(), 128 | dart.notNull(rune) >> 12 & 63);
        this[_buffer][dartx.set]((() => {
          let x = this[_bufferIndex];
          this[_bufferIndex] = dart.notNull(x) + 1;
          return x;
        }).bind(this)(), 128 | dart.notNull(rune) >> 6 & 63);
        this[_buffer][dartx.set]((() => {
          let x = this[_bufferIndex];
          this[_bufferIndex] = dart.notNull(x) + 1;
          return x;
        }).bind(this)(), 128 | dart.notNull(rune) & 63);
        return true;
      } else {
        this[_buffer][dartx.set]((() => {
          let x = this[_bufferIndex];
          this[_bufferIndex] = dart.notNull(x) + 1;
          return x;
        }).bind(this)(), 224 | dart.notNull(leadingSurrogate) >> 12);
        this[_buffer][dartx.set]((() => {
          let x = this[_bufferIndex];
          this[_bufferIndex] = dart.notNull(x) + 1;
          return x;
        }).bind(this)(), 128 | dart.notNull(leadingSurrogate) >> 6 & 63);
        this[_buffer][dartx.set]((() => {
          let x = this[_bufferIndex];
          this[_bufferIndex] = dart.notNull(x) + 1;
          return x;
        }).bind(this)(), 128 | dart.notNull(leadingSurrogate) & 63);
        return false;
      }
    }
    /**
     * @param {string} str
     * @param {?number} start
     * @param {?number} end
     * @return {?number}
     */
    [_fillBuffer](str, start, end) {
      if (start != end && dart.notNull(_isLeadSurrogate(str[dartx.codeUnitAt](dart.notNull(end) - 1)))) {
        end = dart.notNull(end) - 1;
      }
      let stringIndex = null;
      for (stringIndex = start; dart.notNull(stringIndex) < dart.notNull(end); stringIndex = dart.notNull(stringIndex) + 1) {
        let codeUnit = str[dartx.codeUnitAt](stringIndex);
        if (dart.notNull(codeUnit) <= dart.notNull(_ONE_BYTE_LIMIT)) {
          if (dart.notNull(this[_bufferIndex]) >= dart.notNull(this[_buffer][dartx.length]))
            break;
          this[_buffer][dartx.set]((() => {
            let x = this[_bufferIndex];
            this[_bufferIndex] = dart.notNull(x) + 1;
            return x;
          }).bind(this)(), codeUnit);
        } else if (dart.notNull(_isLeadSurrogate(codeUnit))) {
          if (dart.notNull(this[_bufferIndex]) + 3 >= dart.notNull(this[_buffer][dartx.length]))
            break;
          let nextCodeUnit = str[dartx.codeUnitAt](dart.notNull(stringIndex) + 1);
          let wasCombined = this[_writeSurrogate](codeUnit, nextCodeUnit);
          if (dart.notNull(wasCombined)) {
            stringIndex = dart.notNull(stringIndex) + 1;
          }
        } else {
          let rune = codeUnit;
          if (dart.notNull(rune) <= dart.notNull(_TWO_BYTE_LIMIT)) {
            if (dart.notNull(this[_bufferIndex]) + 1 >= dart.notNull(this[_buffer][dartx.length]))
              break;
            this[_buffer][dartx.set]((() => {
              let x = this[_bufferIndex];
              this[_bufferIndex] = dart.notNull(x) + 1;
              return x;
            }).bind(this)(), 192 | dart.notNull(rune) >> 6);
            this[_buffer][dartx.set]((() => {
              let x = this[_bufferIndex];
              this[_bufferIndex] = dart.notNull(x) + 1;
              return x;
            }).bind(this)(), 128 | dart.notNull(rune) & 63);
          } else {
            dart.assert(dart.notNull(rune) <= dart.notNull(_THREE_BYTE_LIMIT));
            if (dart.notNull(this[_bufferIndex]) + 2 >= dart.notNull(this[_buffer][dartx.length]))
              break;
            this[_buffer][dartx.set]((() => {
              let x = this[_bufferIndex];
              this[_bufferIndex] = dart.notNull(x) + 1;
              return x;
            }).bind(this)(), 224 | dart.notNull(rune) >> 12);
            this[_buffer][dartx.set]((() => {
              let x = this[_bufferIndex];
              this[_bufferIndex] = dart.notNull(x) + 1;
              return x;
            }).bind(this)(), 128 | dart.notNull(rune) >> 6 & 63);
            this[_buffer][dartx.set]((() => {
              let x = this[_bufferIndex];
              this[_bufferIndex] = dart.notNull(x) + 1;
              return x;
            }).bind(this)(), 128 | dart.notNull(rune) & 63);
          }
        }
      }
      return stringIndex;
    }
  }
  dart.defineNamedConstructor(_Utf8Encoder, 'withBufferSize');
  dart.setSignature(_Utf8Encoder, {
    constructors: () => ({
      _Utf8Encoder: [_Utf8Encoder, []],
      withBufferSize: [_Utf8Encoder, [core.int]]
    }),
    methods: () => ({
      [_writeSurrogate]: [core.bool, [core.int, core.int]],
      [_fillBuffer]: [core.int, [core.String, core.int, core.int]]
    }),
    statics: () => ({_createBuffer: [core.List$(core.int), [core.int]]}),
    names: ['_createBuffer']
  });
  _Utf8Encoder._DEFAULT_BYTE_BUFFER_SIZE = 1024;
  class _Utf8EncoderSink extends dart.mixin(_Utf8Encoder, StringConversionSinkMixin) {
    /**
     * @constructor
     * @param {ByteConversionSink} _sink
     * @return {_Utf8EncoderSink}
     */
    _Utf8EncoderSink(sink) {
      this[_sink] = sink;
      super._Utf8Encoder();
    }
    close() {
      if (this[_carry] != 0) {
        this.addSlice("", 0, 0, true);
        return;
      }
      this[_sink].close();
    }
    /**
     * @param {string} str
     * @param {?number} start
     * @param {?number} end
     * @param {?boolean} isLast
     */
    addSlice(str, start, end, isLast) {
      this[_bufferIndex] = 0;
      if (start == end && !dart.notNull(isLast)) {
        return;
      }
      if (this[_carry] != 0) {
        let nextCodeUnit = 0;
        if (start != end) {
          nextCodeUnit = str[dartx.codeUnitAt](start);
        } else {
          dart.assert(isLast);
        }
        let wasCombined = this[_writeSurrogate](this[_carry], nextCodeUnit);
        dart.assert(!dart.notNull(wasCombined) || start != end);
        if (dart.notNull(wasCombined)) {
          start = dart.notNull(start) + 1;
        }
        this[_carry] = 0;
      }
      do {
        start = this[_fillBuffer](str, start, end);
        let isLastSlice = dart.notNull(isLast) && start == end;
        if (start == dart.notNull(end) - 1 && dart.notNull(_isLeadSurrogate(str[dartx.codeUnitAt](start)))) {
          if (dart.notNull(isLast) && dart.notNull(this[_bufferIndex]) < dart.notNull(this[_buffer][dartx.length]) - 3) {
            let hasBeenCombined = this[_writeSurrogate](str[dartx.codeUnitAt](start), 0);
            dart.assert(!dart.notNull(hasBeenCombined));
          } else {
            this[_carry] = str[dartx.codeUnitAt](start);
          }
          start = dart.notNull(start) + 1;
        }
        this[_sink].addSlice(this[_buffer], 0, this[_bufferIndex], isLastSlice);
        this[_bufferIndex] = 0;
      } while (dart.notNull(start) < dart.notNull(end));
      if (dart.notNull(isLast))
        this.close();
    }
  }
  dart.setSignature(_Utf8EncoderSink, {
    constructors: () => ({_Utf8EncoderSink: [_Utf8EncoderSink, [ByteConversionSink]]}),
    methods: () => ({
      close: [dart.void, []],
      addSlice: [dart.void, [core.String, core.int, core.int, core.bool]]
    })
  });
  class Utf8Decoder extends Converter$(core.List$(core.int), core.String) {
    /**
     * @constructor
     * @param {{allowMalformed: (?boolean|undefined)}=} opts
     * @return {Utf8Decoder}
     */
    Utf8Decoder(opts) {
      let allowMalformed = opts && 'allowMalformed' in opts ? opts.allowMalformed : false;
      this[_allowMalformed] = allowMalformed;
      super.Converter();
    }
    /**
     * @param {core.List} codeUnits
     * @param {?number=} start
     * @param {?number=} end
     * @return {string}
     */
    convert(codeUnits, start, end) {
      if (start === void 0)
        start = 0;
      if (end === void 0)
        end = null;
      let length = codeUnits[dartx.length];
      core.RangeError.checkValidRange(start, end, length);
      if (end == null)
        end = length;
      let buffer = new core.StringBuffer();
      let decoder = new _Utf8Decoder(buffer, this[_allowMalformed]);
      decoder.convert(codeUnits, start, end);
      decoder.close();
      return dart.toString(buffer);
    }
    /**
     * @param {core.Sink} sink
     * @return {ByteConversionSink}
     */
    startChunkedConversion(sink) {
      let stringSink = null;
      if (dart.is(sink, StringConversionSink)) {
        stringSink = sink;
      } else {
        stringSink = StringConversionSink.from(sink);
      }
      return stringSink.asUtf8Sink(this[_allowMalformed]);
    }
    /**
     * @param {async.Stream} stream
     * @return {async.Stream}
     */
    bind(stream) {
      return super.bind(stream);
    }
    /**
     * @param {Converter} next
     * @return {Converter}
     */
    fuse(next) {
      return super.fuse(next);
    }
  }
  dart.setSignature(Utf8Decoder, {
    constructors: () => ({Utf8Decoder: [Utf8Decoder, [], {allowMalformed: core.bool}]}),
    methods: () => ({
      convert: [core.String, [core.List$(core.int)], [core.int, core.int]],
      startChunkedConversion: [ByteConversionSink, [core.Sink$(core.String)]],
      bind: [async.Stream$(core.String), [async.Stream$(core.List$(core.int))]],
      fuse: [Converter$(core.List$(core.int), dart.dynamic), [Converter$(core.String, dart.dynamic)]]
    })
  });
  let _ONE_BYTE_LIMIT = 127;
  let _TWO_BYTE_LIMIT = 2047;
  let _THREE_BYTE_LIMIT = 65535;
  let _FOUR_BYTE_LIMIT = 1114111;
  let _SURROGATE_MASK = 63488;
  let _SURROGATE_TAG_MASK = 64512;
  let _SURROGATE_VALUE_MASK = 1023;
  let _LEAD_SURROGATE_MIN = 55296;
  let _TAIL_SURROGATE_MIN = 56320;
  /**
   * @param {?number} codeUnit
   * @return {?boolean}
   */
  function _isSurrogate(codeUnit) {
    return (dart.notNull(codeUnit) & dart.notNull(_SURROGATE_MASK)) == _LEAD_SURROGATE_MIN;
  }
  dart.fn(_isSurrogate, core.bool, [core.int]);
  /**
   * @param {?number} codeUnit
   * @return {?boolean}
   */
  function _isLeadSurrogate(codeUnit) {
    return (dart.notNull(codeUnit) & dart.notNull(_SURROGATE_TAG_MASK)) == _LEAD_SURROGATE_MIN;
  }
  dart.fn(_isLeadSurrogate, core.bool, [core.int]);
  /**
   * @param {?number} codeUnit
   * @return {?boolean}
   */
  function _isTailSurrogate(codeUnit) {
    return (dart.notNull(codeUnit) & dart.notNull(_SURROGATE_TAG_MASK)) == _TAIL_SURROGATE_MIN;
  }
  dart.fn(_isTailSurrogate, core.bool, [core.int]);
  /**
   * @param {?number} lead
   * @param {?number} tail
   * @return {?number}
   */
  function _combineSurrogatePair(lead, tail) {
    return 65536 + ((dart.notNull(lead) & dart.notNull(_SURROGATE_VALUE_MASK)) << 10) | dart.notNull(tail) & dart.notNull(_SURROGATE_VALUE_MASK);
  }
  dart.fn(_combineSurrogatePair, core.int, [core.int, core.int]);
  let _isFirstCharacter = Symbol('_isFirstCharacter');
  let _value = Symbol('_value');
  let _expectedUnits = Symbol('_expectedUnits');
  let _extraUnits = Symbol('_extraUnits');
  class _Utf8Decoder extends core.Object {
    /**
     * @constructor
     * @param {core.StringSink} _stringSink
     * @param {?boolean} _allowMalformed
     * @return {_Utf8Decoder}
     */
    _Utf8Decoder(stringSink, allowMalformed) {
      this[_stringSink] = stringSink;
      this[_allowMalformed] = allowMalformed;
      this[_isFirstCharacter] = true;
      this[_value] = 0;
      this[_expectedUnits] = 0;
      this[_extraUnits] = 0;
    }
    /** @return {?boolean} */
    get hasPartialInput() {
      return dart.notNull(this[_expectedUnits]) > 0;
    }
    close() {
      this.flush();
    }
    flush() {
      if (dart.notNull(this.hasPartialInput)) {
        if (!dart.notNull(this[_allowMalformed])) {
          dart.throw(new core.FormatException("Unfinished UTF-8 octet sequence"));
        }
        this[_stringSink].writeCharCode(UNICODE_REPLACEMENT_CHARACTER_RUNE);
        this[_value] = 0;
        this[_expectedUnits] = 0;
        this[_extraUnits] = 0;
      }
    }
    /**
     * @param {core.List} codeUnits
     * @param {?number} startIndex
     * @param {?number} endIndex
     */
    convert(codeUnits, startIndex, endIndex) {
      let value = this[_value];
      let expectedUnits = this[_expectedUnits];
      let extraUnits = this[_extraUnits];
      this[_value] = 0;
      this[_expectedUnits] = 0;
      this[_extraUnits] = 0;
      /**
       * @param {?number} from
       * @return {?number}
       */
      function scanOneByteCharacters(units, from) {
        let to = endIndex;
        let mask = _ONE_BYTE_LIMIT;
        for (let i = from; dart.notNull(i) < dart.notNull(to); i = dart.notNull(i) + 1) {
          let unit = dart.dindex(units, i);
          if (!dart.equals(dart.dsend(unit, '&', mask), unit))
            return dart.notNull(i) - dart.notNull(from);
        }
        return dart.notNull(to) - dart.notNull(from);
      }
      dart.fn(scanOneByteCharacters, core.int, [dart.dynamic, core.int]);
      let addSingleBytes = (function(from, to) {
        dart.assert(dart.notNull(from) >= dart.notNull(startIndex) && dart.notNull(from) <= dart.notNull(endIndex));
        dart.assert(dart.notNull(to) >= dart.notNull(startIndex) && dart.notNull(to) <= dart.notNull(endIndex));
        this[_stringSink].write(core.String.fromCharCodes(codeUnits, from, to));
      }).bind(this);
      dart.fn(addSingleBytes, dart.void, [core.int, core.int]);
      let i = startIndex;
      loop:
        while (true) {
          multibyte:
            if (dart.notNull(expectedUnits) > 0) {
              do {
                if (i == endIndex) {
                  break loop;
                }
                let unit = codeUnits[dartx.get](i);
                if ((dart.notNull(unit) & 192) != 128) {
                  expectedUnits = 0;
                  if (!dart.notNull(this[_allowMalformed])) {
                    dart.throw(new core.FormatException(`Bad UTF-8 encoding 0x${unit[dartx.toRadixString](16)}`));
                  }
                  this[_isFirstCharacter] = false;
                  this[_stringSink].writeCharCode(UNICODE_REPLACEMENT_CHARACTER_RUNE);
                  break multibyte;
                } else {
                  value = dart.notNull(value) << 6 | dart.notNull(unit) & 63;
                  expectedUnits = dart.notNull(expectedUnits) - 1;
                  i = dart.notNull(i) + 1;
                }
              } while (dart.notNull(expectedUnits) > 0);
              if (dart.notNull(value) <= dart.notNull(_Utf8Decoder._LIMITS[dartx.get](dart.notNull(extraUnits) - 1))) {
                if (!dart.notNull(this[_allowMalformed])) {
                  dart.throw(new core.FormatException(`Overlong encoding of 0x${value[dartx.toRadixString](16)}`));
                }
                expectedUnits = extraUnits = 0;
                value = UNICODE_REPLACEMENT_CHARACTER_RUNE;
              }
              if (dart.notNull(value) > dart.notNull(_FOUR_BYTE_LIMIT)) {
                if (!dart.notNull(this[_allowMalformed])) {
                  dart.throw(new core.FormatException("Character outside valid Unicode range: " + `0x${value[dartx.toRadixString](16)}`));
                }
                value = UNICODE_REPLACEMENT_CHARACTER_RUNE;
              }
              if (!dart.notNull(this[_isFirstCharacter]) || value != UNICODE_BOM_CHARACTER_RUNE) {
                this[_stringSink].writeCharCode(value);
              }
              this[_isFirstCharacter] = false;
            }
          while (dart.notNull(i) < dart.notNull(endIndex)) {
            let oneBytes = scanOneByteCharacters(codeUnits, i);
            if (dart.notNull(oneBytes) > 0) {
              this[_isFirstCharacter] = false;
              addSingleBytes(i, dart.notNull(i) + dart.notNull(oneBytes));
              i = dart.notNull(i) + dart.notNull(oneBytes);
              if (i == endIndex)
                break;
            }
            let unit = codeUnits[dartx.get]((() => {
              let x = i;
              i = dart.notNull(x) + 1;
              return x;
            })());
            if (dart.notNull(unit) < 0) {
              if (!dart.notNull(this[_allowMalformed])) {
                dart.throw(new core.FormatException(`Negative UTF-8 code unit: -0x${(-dart.notNull(unit))[dartx.toRadixString](16)}`));
              }
              this[_stringSink].writeCharCode(UNICODE_REPLACEMENT_CHARACTER_RUNE);
            } else {
              dart.assert(dart.notNull(unit) > dart.notNull(_ONE_BYTE_LIMIT));
              if ((dart.notNull(unit) & 224) == 192) {
                value = dart.notNull(unit) & 31;
                expectedUnits = extraUnits = 1;
                continue loop;
              }
              if ((dart.notNull(unit) & 240) == 224) {
                value = dart.notNull(unit) & 15;
                expectedUnits = extraUnits = 2;
                continue loop;
              }
              if ((dart.notNull(unit) & 248) == 240 && dart.notNull(unit) < 245) {
                value = dart.notNull(unit) & 7;
                expectedUnits = extraUnits = 3;
                continue loop;
              }
              if (!dart.notNull(this[_allowMalformed])) {
                dart.throw(new core.FormatException(`Bad UTF-8 encoding 0x${unit[dartx.toRadixString](16)}`));
              }
              value = UNICODE_REPLACEMENT_CHARACTER_RUNE;
              expectedUnits = extraUnits = 0;
              this[_isFirstCharacter] = false;
              this[_stringSink].writeCharCode(value);
            }
          }
          break loop;
        }
      if (dart.notNull(expectedUnits) > 0) {
        this[_value] = value;
        this[_expectedUnits] = expectedUnits;
        this[_extraUnits] = extraUnits;
      }
    }
  }
  dart.setSignature(_Utf8Decoder, {
    constructors: () => ({_Utf8Decoder: [_Utf8Decoder, [core.StringSink, core.bool]]}),
    methods: () => ({
      close: [dart.void, []],
      flush: [dart.void, []],
      convert: [dart.void, [core.List$(core.int), core.int, core.int]]
    })
  });
  _Utf8Decoder._LIMITS = dart.const(dart.list([_ONE_BYTE_LIMIT, _TWO_BYTE_LIMIT, _THREE_BYTE_LIMIT, _FOUR_BYTE_LIMIT], core.int));
  let _processed = Symbol('_processed');
  let _computeKeys = Symbol('_computeKeys');
  let _original = Symbol('_original');
  /** @param {function(*, *):*} reviver */
  function _convertJsonToDart(json, reviver) {
    dart.assert(reviver != null);
    function walk(e) {
      if (e == null || typeof e != "object") {
        return e;
      }
      if (Object.getPrototypeOf(e) === Array.prototype) {
        for (let i = 0; dart.notNull(i) < e.length; i = dart.notNull(i) + 1) {
          let item = e[i];
          e[i] = dart.dcall(reviver, i, walk(item));
        }
        return e;
      }
      let map = new _JsonMap(e);
      let processed = map[_processed];
      let keys = map[_computeKeys]();
      for (let i = 0; dart.notNull(i) < dart.notNull(keys[dartx.length]); i = dart.notNull(i) + 1) {
        let key = keys[dartx.get](i);
        let revived = dart.dcall(reviver, key, walk(e[key]));
        processed[key] = revived;
      }
      map[_original] = processed;
      return map;
    }
    dart.fn(walk);
    return dart.dcall(reviver, null, walk(json));
  }
  dart.fn(_convertJsonToDart, dart.dynamic, [dart.dynamic, dart.functionType(dart.dynamic, [dart.dynamic, dart.dynamic])]);
  function _convertJsonToDartLazy(object) {
    if (object == null)
      return null;
    if (typeof object != "object") {
      return object;
    }
    if (Object.getPrototypeOf(object) !== Array.prototype) {
      return new _JsonMap(object);
    }
    for (let i = 0; dart.notNull(i) < object.length; i = dart.notNull(i) + 1) {
      let item = object[i];
      object[i] = _convertJsonToDartLazy(item);
    }
    return object;
  }
  dart.fn(_convertJsonToDartLazy);
  let _data = Symbol('_data');
  let _isUpgraded = Symbol('_isUpgraded');
  let _upgradedMap = Symbol('_upgradedMap');
  let _process = Symbol('_process');
  let _upgrade = Symbol('_upgrade');
  class _JsonMap extends core.Object {
    /**
     * @constructor
     * @return {_JsonMap}
     */
    _JsonMap(original) {
      this[_processed] = _JsonMap._newJavaScriptObject();
      this[_original] = original;
      this[_data] = null;
    }
    /** @param {core.Object} key */
    get(key) {
      if (dart.notNull(this[_isUpgraded])) {
        return this[_upgradedMap].get(key);
      } else if (!(typeof key == 'string')) {
        return null;
      } else {
        let result = _JsonMap._getProperty(this[_processed], dart.as(key, core.String));
        if (dart.notNull(_JsonMap._isUnprocessed(result)))
          result = this[_process](dart.as(key, core.String));
        return result;
      }
    }
    /** @return {?number} */
    get length() {
      return dart.notNull(this[_isUpgraded]) ? this[_upgradedMap].length : this[_computeKeys]()[dartx.length];
    }
    /** @return {?boolean} */
    get isEmpty() {
      return this.length == 0;
    }
    /** @return {?boolean} */
    get isNotEmpty() {
      return dart.notNull(this.length) > 0;
    }
    /** @return {core.Iterable} */
    get keys() {
      if (dart.notNull(this[_isUpgraded]))
        return this[_upgradedMap].keys;
      return new _JsonMapKeyIterable(this);
    }
    /** @return {core.Iterable} */
    get values() {
      if (dart.notNull(this[_isUpgraded]))
        return this[_upgradedMap].values;
      return _internal.MappedIterable.new(this[_computeKeys](), dart.fn((each => this.get(each)).bind(this)));
    }
    set(key, value) {
      if (dart.notNull(this[_isUpgraded])) {
        this[_upgradedMap].set(key, value);
      } else if (dart.notNull(this.containsKey(key))) {
        let processed = this[_processed];
        _JsonMap._setProperty(processed, dart.as(key, core.String), value);
        let original = this[_original];
        if (!dart.notNull(core.identical(original, processed))) {
          _JsonMap._setProperty(original, dart.as(key, core.String), null);
        }
      } else {
        this[_upgrade]().set(key, value);
      }
    }
    /** @param {core.Map} other */
    addAll(other) {
      other.forEach(dart.fn(((key, value) => {
        this.set(key, value);
      }).bind(this)));
    }
    /**
     * @param {core.Object} value
     * @return {?boolean}
     */
    containsValue(value) {
      if (dart.notNull(this[_isUpgraded]))
        return this[_upgradedMap].containsValue(value);
      let keys = this[_computeKeys]();
      for (let i = 0; dart.notNull(i) < dart.notNull(keys[dartx.length]); i = dart.notNull(i) + 1) {
        let key = keys[dartx.get](i);
        if (dart.equals(this.get(key), value))
          return true;
      }
      return false;
    }
    /**
     * @param {core.Object} key
     * @return {?boolean}
     */
    containsKey(key) {
      if (dart.notNull(this[_isUpgraded]))
        return this[_upgradedMap].containsKey(key);
      if (!(typeof key == 'string'))
        return false;
      return _JsonMap._hasProperty(this[_original], dart.as(key, core.String));
    }
    /** @param {function():*} ifAbsent */
    putIfAbsent(key, ifAbsent) {
      if (dart.notNull(this.containsKey(key)))
        return this.get(key);
      let value = ifAbsent();
      this.set(key, value);
      return value;
    }
    /** @param {core.Object} key */
    remove(key) {
      if (!dart.notNull(this[_isUpgraded]) && !dart.notNull(this.containsKey(key)))
        return null;
      return this[_upgrade]().remove(key);
    }
    clear() {
      if (dart.notNull(this[_isUpgraded])) {
        this[_upgradedMap].clear();
      } else {
        if (this[_data] != null) {
          dart.dsend(this[_data], 'clear');
        }
        this[_original] = this[_processed] = null;
        this[_data] = dart.map();
      }
    }
    /** @param {function(*, *)} f */
    forEach(f) {
      if (dart.notNull(this[_isUpgraded]))
        return this[_upgradedMap].forEach(f);
      let keys = this[_computeKeys]();
      for (let i = 0; dart.notNull(i) < dart.notNull(keys[dartx.length]); i = dart.notNull(i) + 1) {
        let key = keys[dartx.get](i);
        let value = _JsonMap._getProperty(this[_processed], key);
        if (dart.notNull(_JsonMap._isUnprocessed(value))) {
          value = _convertJsonToDartLazy(_JsonMap._getProperty(this[_original], key));
          _JsonMap._setProperty(this[_processed], key, value);
        }
        dart.dcall(f, key, value);
        if (!dart.notNull(core.identical(keys, this[_data]))) {
          dart.throw(new core.ConcurrentModificationError(this));
        }
      }
    }
    /** @return {string} */
    toString() {
      return collection.Maps.mapToString(this);
    }
    /** @return {?boolean} */
    get [_isUpgraded]() {
      return this[_processed] == null;
    }
    /** @return {core.Map} */
    get [_upgradedMap]() {
      dart.assert(this[_isUpgraded]);
      return dart.as(this[_data], core.Map);
    }
    /** @return {core.List} */
    [_computeKeys]() {
      dart.assert(!dart.notNull(this[_isUpgraded]));
      let keys = dart.as(this[_data], core.List);
      if (keys == null) {
        keys = this[_data] = _JsonMap._getPropertyNames(this[_original]);
      }
      return dart.as(keys, core.List$(core.String));
    }
    /** @return {core.Map} */
    [_upgrade]() {
      if (dart.notNull(this[_isUpgraded]))
        return this[_upgradedMap];
      let result = dart.map();
      let keys = this[_computeKeys]();
      for (let i = 0; dart.notNull(i) < dart.notNull(keys[dartx.length]); i = dart.notNull(i) + 1) {
        let key = keys[dartx.get](i);
        result.set(key, this.get(key));
      }
      if (dart.notNull(keys[dartx.isEmpty])) {
        keys[dartx.add](null);
      } else {
        keys[dartx.clear]();
      }
      this[_original] = this[_processed] = null;
      this[_data] = result;
      dart.assert(this[_isUpgraded]);
      return result;
    }
    /** @param {string} key */
    [_process](key) {
      if (!dart.notNull(_JsonMap._hasProperty(this[_original], key)))
        return null;
      let result = _convertJsonToDartLazy(_JsonMap._getProperty(this[_original], key));
      return _JsonMap._setProperty(this[_processed], key, result);
    }
    /**
     * @param {string} key
     * @return {?boolean}
     */
    static _hasProperty(object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
    }
    /** @param {string} key */
    static _getProperty(object, key) {
      return object[key];
    }
    /** @param {string} key */
    static _setProperty(object, key, value) {
      return object[key] = value;
    }
    /** @return {core.List} */
    static _getPropertyNames(object) {
      return dart.as(Object.keys(object), core.List);
    }
    /** @return {?boolean} */
    static _isUnprocessed(object) {
      return typeof object == "undefined";
    }
    static _newJavaScriptObject() {
      return Object.create(null);
    }
  }
  _JsonMap[dart.implements] = () => [collection.LinkedHashMap];
  dart.setSignature(_JsonMap, {
    constructors: () => ({_JsonMap: [_JsonMap, [dart.dynamic]]}),
    methods: () => ({
      get: [dart.dynamic, [core.Object]],
      set: [dart.void, [dart.dynamic, dart.dynamic]],
      addAll: [dart.void, [core.Map]],
      containsValue: [core.bool, [core.Object]],
      containsKey: [core.bool, [core.Object]],
      putIfAbsent: [dart.dynamic, [dart.dynamic, dart.functionType(dart.dynamic, [])]],
      remove: [dart.dynamic, [core.Object]],
      clear: [dart.void, []],
      forEach: [dart.void, [dart.functionType(dart.void, [dart.dynamic, dart.dynamic])]],
      [_computeKeys]: [core.List$(core.String), []],
      [_upgrade]: [core.Map, []],
      [_process]: [dart.dynamic, [core.String]]
    }),
    statics: () => ({
      _hasProperty: [core.bool, [dart.dynamic, core.String]],
      _getProperty: [dart.dynamic, [dart.dynamic, core.String]],
      _setProperty: [dart.dynamic, [dart.dynamic, core.String, dart.dynamic]],
      _getPropertyNames: [core.List, [dart.dynamic]],
      _isUnprocessed: [core.bool, [dart.dynamic]],
      _newJavaScriptObject: [dart.dynamic, []]
    }),
    names: ['_hasProperty', '_getProperty', '_setProperty', '_getPropertyNames', '_isUnprocessed', '_newJavaScriptObject']
  });
  let _parent = Symbol('_parent');
  class _JsonMapKeyIterable extends _internal.ListIterable {
    /**
     * @constructor
     * @param {_JsonMap} _parent
     * @return {_JsonMapKeyIterable}
     */
    _JsonMapKeyIterable(parent) {
      this[_parent] = parent;
      super.ListIterable();
    }
    /** @return {?number} */
    get length() {
      return this[_parent].length;
    }
    /**
     * @param {?number} index
     * @return {string}
     */
    elementAt(index) {
      return dart.notNull(this[_parent][_isUpgraded]) ? dart.as(this[_parent].keys[dartx.elementAt](index), core.String) : this[_parent][_computeKeys]()[dartx.get](index);
    }
    /** @return {core.Iterator} */
    get iterator() {
      return dart.notNull(this[_parent][_isUpgraded]) ? this[_parent].keys[dartx.iterator] : this[_parent][_computeKeys]()[dartx.iterator];
    }
    /**
     * @param {core.Object} key
     * @return {?boolean}
     */
    contains(key) {
      return this[_parent].containsKey(key);
    }
  }
  dart.setSignature(_JsonMapKeyIterable, {
    constructors: () => ({_JsonMapKeyIterable: [_JsonMapKeyIterable, [_JsonMap]]}),
    methods: () => ({elementAt: [core.String, [core.int]]})
  });
  dart.defineExtensionMembers(_JsonMapKeyIterable, ['elementAt', 'contains', 'length', 'iterator']);
  class _JsonDecoderSink extends _StringSinkConversionSink {
    /**
     * @constructor
     * @param {function(*, *):*} _reviver
     * @param {core.Sink} _sink
     * @return {_JsonDecoderSink}
     */
    _JsonDecoderSink(reviver, sink) {
      this[_reviver] = reviver;
      this[_sink] = sink;
      super._StringSinkConversionSink(new core.StringBuffer());
    }
    close() {
      super.close();
      let buffer = dart.as(this[_stringSink], core.StringBuffer);
      let accumulated = dart.toString(buffer);
      buffer.clear();
      let decoded = _parseJson(accumulated, this[_reviver]);
      this[_sink].add(decoded);
      this[_sink].close();
    }
  }
  dart.setSignature(_JsonDecoderSink, {
    constructors: () => ({_JsonDecoderSink: [_JsonDecoderSink, [_Reviver, core.Sink$(core.Object)]]})
  });
  // Exports:
  exports.Codec$ = Codec$;
  exports.Codec = Codec;
  exports.Encoding = Encoding;
  exports.AsciiCodec = AsciiCodec;
  exports.ASCII = ASCII;
  exports.Converter$ = Converter$;
  exports.Converter = Converter;
  exports.AsciiEncoder = AsciiEncoder;
  exports.StringConversionSinkMixin = StringConversionSinkMixin;
  exports.StringConversionSinkBase = StringConversionSinkBase;
  exports.AsciiDecoder = AsciiDecoder;
  exports.ChunkedConversionSink$ = ChunkedConversionSink$;
  exports.ChunkedConversionSink = ChunkedConversionSink;
  exports.ByteConversionSink = ByteConversionSink;
  exports.ByteConversionSinkBase = ByteConversionSinkBase;
  exports.HtmlEscapeMode = HtmlEscapeMode;
  exports.HtmlEscape = HtmlEscape;
  exports.HTML_ESCAPE = HTML_ESCAPE;
  exports.JsonUnsupportedObjectError = JsonUnsupportedObjectError;
  exports.JsonCyclicError = JsonCyclicError;
  exports.JsonCodec = JsonCodec;
  exports.JSON = JSON;
  exports.JsonEncoder = JsonEncoder;
  exports.JsonUtf8Encoder = JsonUtf8Encoder;
  exports.JsonDecoder = JsonDecoder;
  exports.Latin1Codec = Latin1Codec;
  exports.LATIN1 = LATIN1;
  exports.Latin1Encoder = Latin1Encoder;
  exports.Latin1Decoder = Latin1Decoder;
  exports.LineSplitter = LineSplitter;
  exports.StringConversionSink = StringConversionSink;
  exports.ClosableStringSink = ClosableStringSink;
  exports.UNICODE_REPLACEMENT_CHARACTER_RUNE = UNICODE_REPLACEMENT_CHARACTER_RUNE;
  exports.UNICODE_BOM_CHARACTER_RUNE = UNICODE_BOM_CHARACTER_RUNE;
  exports.Utf8Codec = Utf8Codec;
  exports.UTF8 = UTF8;
  exports.Utf8Encoder = Utf8Encoder;
  exports.Utf8Decoder = Utf8Decoder;
});
