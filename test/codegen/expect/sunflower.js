var sunflower;
(function(exports) {
  'use strict';
  let ORANGE = "orange";
  let SEED_RADIUS = 2;
  let SCALE_FACTOR = 4;
  let TAU = math.PI * 2;
  let MAX_D = 300;
  let centerX = MAX_D / 2;
  let centerY = centerX;
  // Function querySelector: (String) → Element
  function querySelector(selector) {
    return dom.document.querySelector(selector);
  }
  exports.seeds = 0;
  dart.defineLazyProperties(exports, {
    get slider() {
      return dart.as(querySelector("#slider"), dom.InputElement);
    },
    get notes() {
      return querySelector("#notes");
    },
    get PHI() {
      return (math.sqrt(5) + 1) / 2;
    },
    get context() {
      return dart.as(dart.as(querySelector("#canvas"), dom.CanvasElement).getContext('2d'), dom.CanvasRenderingContext2D);
    }
  });
  class Circle extends dart.Object {
    Circle(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
    }
  }
  class CirclePainter extends dart.Object {
    CirclePainter() {
      this.color = ORANGE;
    }
    draw() {
      exports.context.beginPath();
      exports.context.lineWidth = 2;
      exports.context.fillStyle = this.color;
      exports.context.strokeStyle = this.color;
      exports.context.arc(this.x, this.y, this.radius, 0, TAU, false);
      exports.context.fill();
      exports.context.closePath();
      exports.context.stroke();
    }
  }
  class SunflowerSeed extends dart.mixin(Circle, CirclePainter) {
    SunflowerSeed(x, y, radius, color) {
      if (color === void 0)
        color = null;
      super.Circle(x, y, radius);
      if (color !== null)
        this.color = color;
    }
  }
  // Function main: () → void
  function main() {
    exports.slider.addEventListener('change', (e) => draw());
    draw();
  }
  // Function draw: () → void
  function draw() {
    exports.seeds = core.int.parse(exports.slider.value);
    exports.context.clearRect(0, 0, MAX_D, MAX_D);
    for (let i = 0; i < exports.seeds; i++) {
      let theta = dart.notNull(i * dart.notNull(TAU)) / dart.notNull(exports.PHI);
      let r = math.sqrt(i) * SCALE_FACTOR;
      let x = dart.notNull(centerX) + dart.notNull(dart.notNull(r) * math.cos(theta));
      let y = dart.notNull(centerY) - dart.notNull(dart.notNull(r) * math.sin(theta));
      new SunflowerSeed(x, y, SEED_RADIUS).draw();
    }
    exports.notes.textContent = `${exports.seeds} seeds`;
  }
  // Exports:
  exports.ORANGE = ORANGE;
  exports.SEED_RADIUS = SEED_RADIUS;
  exports.SCALE_FACTOR = SCALE_FACTOR;
  exports.TAU = TAU;
  exports.MAX_D = MAX_D;
  exports.centerX = centerX;
  exports.centerY = centerY;
  exports.querySelector = querySelector;
  exports.Circle = Circle;
  exports.CirclePainter = CirclePainter;
  exports.SunflowerSeed = SunflowerSeed;
  exports.main = main;
  exports.draw = draw;
})(sunflower || (sunflower = {}));