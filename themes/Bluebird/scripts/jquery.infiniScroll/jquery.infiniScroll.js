// Generated by CoffeeScript 1.6.3
(function() {
  (function($, window, document) {
    var $this, methods, _cb, _cj, _defaults, _internals, _options;
    $this = void 0;
    _defaults = {
      scrollBox: ".infiniScrollBox",
      box: {
        height: 0,
        percent: 99,
        pixels: 0
      }
    };
    _cj = {};
    _options = {};
    _cb = function() {};
    methods = {
      init: function(options, cb) {
        _options = $.extend(_defaults, options);
        if (typeof cb !== "function") {
          return console.log("Callback isn't a function");
        }
        _cb = cb;
        _internals.setCJ(this);
        return _internals.matchBox();
      },
      unbind: function(ob) {
        return ob.off("scroll");
      }
    };
    _internals = {
      setCJ: function(target) {
        _cj.sb = cj(_options.scrollBox);
        return _cj.loc = target;
      },
      matchBox: function() {
        this.box = _options.box;
        this.box.height = _cj.loc.height();
        this.box.viewHeight = _cj.sb.height();
        this.box.limit = this.findBottomLimit();
        return this.execScrollerHandler();
      },
      execScrollerHandler: function() {
        var dc,
          _this = this;
        dc = 0;
        return _cj.sb.scroll(function() {
          _this.box.currentPos = _cj.sb.scrollTop();
          if (_this.box.limit <= _this.box.viewHeight + _this.box.currentPos) {
            if (dc !== 1) {
              dc = 1;
              _cb();
              return methods.unbind(_cj.sb);
            }
          }
        });
      },
      findBottomLimit: function() {
        if (parseInt(this.box.pixels) > 0) {
          return this.box.height - parseInt(this.box.pixels);
        }
        return Math.floor(this.box.height * parseInt(this.box.percent) / 100);
      }
    };
    return $.fn.infiniscroll = function(method) {
      if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === "object" || !method) {
        return methods.init.apply(this, arguments);
      } else {
        return $.error("Method " + method + " does not exist on jquery.infiniscroll");
      }
    };
  })($, window, document);

}).call(this);
