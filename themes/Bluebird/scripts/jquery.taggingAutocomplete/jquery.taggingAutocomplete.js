// Generated by CoffeeScript 1.6.3
(function() {
  (function($, window, document) {
    var $this, Search, methods, _internals, _jqcache, _settings, _tags;
    $this = void 0;
    _settings = {
      jqDataReference: "",
      hintText: "Type in a partial or complete name of an tag or keyword.",
      theme: "JSTree",
      ajaxLocation: "",
      textBoxLocation: "#JSTree-ac",
      menuElement: ".JSTree-menu",
      source: "",
      minLength: 3,
      delay: 300
    };
    _jqcache = {
      samplequery: ""
    };
    _tags = {
      input: "autocomplete-input"
    };
    methods = {
      init: function(options) {
        $this = $(this);
        $.extend(_settings, options || {});
        return _internals.enableAC();
      },
      kill: function(note) {
        console.log("Killed with: " + note);
        return $this;
      },
      exec: function(search, event) {
        return search.exec(event);
      }
    };
    _internals = {
      enableAC: function() {
        this.turnDataLocation();
        this.formatInput();
        return this.acSearch = new Search;
      },
      turnDataLocation: function() {
        if (_settings.jqDataReference != null) {
          return _settings.source = $(_settings.jqDataReference).data("autocomplete");
        } else {
          return methods.kill("No Data Location");
        }
      },
      formatInput: function() {
        _jqcache["input"] = $("" + _settings.textBoxLocation);
        _jqcache.input.addClass("" + _settings.theme + "-" + _tags.input);
        return _jqcache["menu"] = $("" + _settings.menuElement);
      }
    };
    Search = (function() {
      function Search() {
        this.element = _jqcache["input"];
        this.menu = _jqcache["menu"];
        this.searchIndex = 0;
        this.source = [
          {
            term: "",
            tags: _settings.source
          }
        ];
        this.rebuildswitch = true;
      }

      Search.prototype.exec = function(event, cb) {
        var _this = this;
        this.query = this.element.val();
        return this.delay(event, (function(toret) {
          return cb(toret);
        }));
      };

      Search.prototype.delay = function(event, cb) {
        var _this = this;
        clearTimeout(this.searching);
        return this.searching = setTimeout((function() {
          if (_this.query !== _this.element.val()) {
            _this.toret = _this.validate(event);
          }
          return cb(_this.toret);
        }), _settings.delay);
      };

      Search.prototype.validate = function(event) {
        var value;
        if (typeof value !== "undefined" && value !== null) {
          value = value;
        } else {
          value = this.element.val();
        }
        if (value.length < _settings.minLength) {
          return {};
        }
        return this.search(value);
      };

      Search.prototype.search = function(term) {
        var arrayToFill, cachedQuery, currentArray;
        if (term.indexOf(this.source[this.searchIndex].term) !== -1) {
          if (term.length <= this.source[this.searchIndex].term.length) {
            console.log("isrebuilding");
            this.rebuildTag(this.searchIndex);
          }
        } else {
          console.log("isrebuilding");
          this.rebuildTag(this.searchIndex);
        }
        currentArray = this.ifNullArray(this.source[this.searchIndex].tags, this.searchIndex);
        this.searchIndex++;
        arrayToFill = {
          tags: [],
          term: ""
        };
        this.source[this.searchIndex] = {};
        cachedQuery = this.checkCache(term);
        if (cachedQuery.length) {
          console.log(cachedQuery);
          arrayToFill["term"] = cachedQuery[0].term;
          arrayToFill["tags"] = cachedQuery[0].tags;
          arrayToFill["cached"] = true;
        } else {
          arrayToFill["term"] = term;
          arrayToFill["tags"] = this.filter(currentArray, term);
        }
        return this.source[this.searchIndex] = arrayToFill;
      };

      Search.prototype.filter = function(array, term) {
        var matcher,
          _this = this;
        matcher = new RegExp(this.escapeRegex(term), "i");
        return $.grep(array, function(value) {
          return matcher.test(value.name || value.id || value);
        });
      };

      Search.prototype.escapeRegex = function(value) {
        return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      };

      Search.prototype.checkCache = function(term) {
        var _this = this;
        return $.grep(this.source, function(query) {
          return term === query.term;
        });
      };

      Search.prototype.rebuildTag = function(index) {
        this.source[index] = {};
        return this.source[index].tags = this.source[0].tags;
      };

      Search.prototype.ifNullArray = function(array, index) {
        if (array != null) {
          if (array.length > 0) {
            return array;
          }
        }
        return this.checkPrevArray(index);
      };

      Search.prototype.checkPrevArray = function(index) {
        if (index > 0) {
          index--;
          return this.ifNullArray(this.source[index].tags, index);
        } else {
          return this.rebuildTag(this.searchIndex);
        }
      };

      return Search;

    })();
    return $.fn.tagACInput = function(method) {
      if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === "object" || !method) {
        return methods.init.apply(this, arguments);
      } else {
        return $.error("Method " + method + " does not exist on jquery.tagACInput");
      }
    };
  })(cj, window, document);

}).call(this);