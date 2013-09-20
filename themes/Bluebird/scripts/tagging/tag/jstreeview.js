// Generated by CoffeeScript 1.6.3
var Autocomplete, Node, Resize, Settings, Tree, View, _descWidths, _openTags, _treeUtils, _treeVisibility;

window.jstree["views"] = {
  exec: function(instance) {
    this.view = new View(instance);
    return this.menuSettings = new Settings(instance, this.view);
  },
  done: function(instance) {
    var a, b, resize, trees, v, _ref;
    trees = {};
    _ref = instance.treeNames;
    for (a in _ref) {
      v = _ref[a];
      b = _treeUtils.selectByTree(instance.autocomplete, a);
      trees[a] = new Tree(b, a);
    }
    this.view.trees = trees;
    this.view.init();
    if (this.view.settings.tall) {
      resize = new Resize;
      return resize.addResize(instance, this.view);
    } else {
      return this.view.cj_tokenHolder.resize.remove();
    }
  },
  view: {}
};

View = (function() {
  View.property("trees", {
    get: function() {
      return this._trees;
    },
    set: function(a) {
      return this._trees = a;
    }
  });

  View.prototype.selectors = {
    tagBox: "",
    container: "",
    containerClass: "",
    initHolder: "",
    byHeightWidth: "",
    dropdown: "",
    defaultTree: "",
    activeTree: "",
    isFiltered: false,
    data: "data",
    idedKeys: ["container", "data"],
    addPrefix: ["dropdown", "data"]
  };

  View.prototype.menuSelectors = {
    menu: "menu",
    top: "top",
    tabs: "tabs",
    bottom: "bottom",
    autocomplete: "autocomplete",
    settings: "settings",
    addPrefix: ["menu", "tabs", "top", "bottom", "autocomplete", "settings"]
  };

  View.prototype.tokenHolder = {
    box: "tokenHolder",
    options: "options",
    body: "tokenBody",
    resize: "resize",
    left: "left",
    addPrefix: ["box", "options", "body", "resize", "left"]
  };

  View.prototype.settings = {
    tall: true,
    wide: true,
    edit: false,
    tagging: false,
    print: true
  };

  View.prototype.entity_id = 0;

  View.prototype.defaultPrefix = "JSTree";

  View.prototype.prefixes = [];

  View.prototype.defaultTree = 0;

  View.prototype.descWidths = {
    normal: 80,
    long: 160
  };

  function View(instance) {
    this.instance = instance;
    this.writeContainers();
  }

  View.prototype.writeContainers = function() {
    var height, tagBox;
    this.formatPageElements();
    this.createSelectors();
    tagBox = new Resize;
    this.setDescWidths();
    if (this.settings.tall) {
      if (tagBox != null) {
        if (tagBox.height >= 0) {
          height = " style='height:" + tagBox.height + "px'";
          return this.addClassesToElement(height);
        } else {
          return this.buildDropdown();
        }
      } else {
        height = "";
        return this.addClassesToElement(height);
      }
    } else {
      return this.buildDropdown();
    }
  };

  View.prototype.setDescWidths = function() {
    if (this.settings.tall) {
      if (this.settings.wide) {
        _descWidths.normal = 80;
        return _descWidths.long = 160;
      } else {
        _descWidths.normal = 20;
        return _descWidths.long = 40;
      }
    } else {
      if (this.settings.wide) {
        _descWidths.normal = 70;
        return _descWidths.long = 150;
      } else {
        _descWidths.normal = 20;
        return _descWidths.long = 40;
      }
    }
  };

  View.prototype.buildDropdown = function() {
    this.cj_selectors.initHolder.html("<div class='" + this.selectors.tagBox + " dropdown'></div>");
    this.cj_selectors.initHolder.prepend(this.menuHtml(this.menuSelectors));
    this.cj_selectors.initHolder.append(this.dataHolderHtml());
    this.cj_selectors.initHolder.append(this.tokenHolderHtml(this.tokenHolder));
    return this.cj_selectors.initHolder.removeClass(this.selectors.initHolder).attr("id", this.selectors.container).addClass(this.selectors.containerClass);
  };

  View.prototype.addClassesToElement = function(height) {
    this.cj_selectors.initHolder.html("<div class='" + this.selectors.tagBox + "' " + height + "></div>");
    this.cj_selectors.initHolder.prepend(this.menuHtml(this.menuSelectors));
    this.cj_selectors.initHolder.append(this.dataHolderHtml());
    this.cj_selectors.initHolder.append(this.tokenHolderHtml(this.tokenHolder));
    return this.cj_selectors.initHolder.removeClass(this.selectors.initHolder).attr("id", this.selectors.container).addClass(this.selectors.containerClass);
  };

  View.prototype.formatPageElements = function() {
    var displaySettings, pageElements, v, _i, _len, _ref;
    pageElements = this.instance.get('pageElements');
    displaySettings = this.instance.get('displaySettings');
    this.selectors.container = pageElements.wrapper.shift();
    this.selectors.containerClass = pageElements.wrapper.join(" ");
    this.selectors.tagBox = pageElements.tagHolder.join(" ");
    this.menuSelectors.tabs = pageElements.tabLocation;
    this.menuSelectors.autocomplete = pageElements.autocomplete;
    this.selectors.dropdown = pageElements.tagDropdown;
    this.selectors.initHolder = pageElements.init;
    this.settings = displaySettings;
    this.settingCollection = ["settings", "menuSelectors", "tokenHolder", "selectors"];
    _ref = pageElements.tagHolder;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      this.prefixes.push(v);
    }
    this.joinPrefix();
    return this.selectors.byHeightWidth = this.setByHeightWidth();
  };

  View.prototype.joinPrefix = function() {
    var a, i, k, name, o, v, _i, _len, _ref, _results;
    _ref = this.settingCollection;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      _results.push((function() {
        var _j, _len1, _ref1, _ref2, _results1;
        _ref1 = this["" + v];
        _results1 = [];
        for (k in _ref1) {
          o = _ref1[k];
          if (typeof o !== "string" || o.length === 0) {
            continue;
          }
          if (this["" + v].idedKeys != null) {
            if (this["" + v].idedKeys.indexOf(k) >= 0) {
              if (this["" + v].addPrefix != null) {
                if (this["" + v].addPrefix.indexOf(k) >= 0) {
                  this["" + v][k] = "" + this.prefixes[0] + "-" + o;
                  this["" + v].addPrefix.splice(this["" + v].addPrefix.indexOf(k), 1);
                }
              }
            }
          }
          if (this["" + v].addPrefix != null) {
            if (this["" + v].addPrefix.indexOf(k) >= 0) {
              name = "";
              _ref2 = this.prefixes;
              for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
                a = _ref2[i];
                name += "" + a + "-" + o;
                if (this.prefixes.length - 1 > i) {
                  name += " ";
                }
              }
              _results1.push(this["" + v][k] = name);
            } else {
              _results1.push(void 0);
            }
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  View.prototype.createSelectors = function() {
    var v, _i, _len, _ref, _results;
    _ref = this.settingCollection;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      _results.push(this.createCJfromObj(this[v], v));
    }
    return _results;
  };

  View.prototype.createCJfromObj = function(obj, name) {
    var cjed, k, selectorType, v;
    cjed = {};
    for (k in obj) {
      v = obj[k];
      if (typeof v !== "string" || v.length === 0) {
        continue;
      }
      selectorType = ".";
      if (obj.idedKeys != null) {
        if (obj["idedKeys"].indexOf(k) >= 0) {
          selectorType = "#";
        }
      }
      cjed[k] = cj("" + selectorType + (cj.trim(v).replace(/\ /g, ".")));
    }
    return this["cj_" + name] = cjed;
  };

  View.prototype.setByHeightWidth = function() {
    var ret;
    ret = "";
    if (!this.settings.wide) {
      ret += "narrow ";
    }
    if (!this.settings.tall) {
      ret += "short";
    }
    return ret;
  };

  View.prototype.menuHtml = function(name) {
    return "      <div class='" + name.menu + "'>       <div class='" + name.top + "'>        <div class='" + name.tabs + "'></div>        <div class='" + name.settings + "'></div>       </div>       <div class='" + name.bottom + "'>        <div class='" + name.autocomplete + "'>         <input type='text' id='JSTree-ac'>        </div>        <div class='" + name.settings + "'></div>       </div>      </div>    ";
  };

  View.prototype.tokenHolderHtml = function(name) {
    return "        <div class='" + name.box + "'>         <div class='" + name.resize + "'></div>         <div class='" + name.body + "'>          <div class='" + name.left + "'></div>          <div class='" + name.options + "'></div>         </div>        </div>      ";
  };

  View.prototype.dataHolderHtml = function() {
    return "<div id='JSTree-data' style='display:none'></div>";
  };

  View.prototype.init = function() {
    var ac, k, tabName, v, _ref, _ref1, _results;
    this.createSelectors();
    _treeVisibility.currentTree = _treeVisibility.defaultTree = _treeVisibility.previousTree = this.settings.defaultTree;
    _ref = this.instance.treeNames;
    for (k in _ref) {
      v = _ref[k];
      tabName = this.createTreeTabs(v);
    }
    this.setActiveTree(this.settings.defaultTree);
    ac = new Autocomplete(this.instance, this);
    _ref1 = this.instance.treeNames;
    _results = [];
    for (k in _ref1) {
      v = _ref1[k];
      this.createTabClick("tab-" + (this.getTabNameFromId(k, true)), k);
      if (parseInt(k) === 292) {
        _results.push(this.addPositionReminderText(this.cj_selectors.tagBox.find(".top-" + k)));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  View.prototype.createTabClick = function(tabName, tabTree) {
    var _this = this;
    this.cj_menuSelectors.tabs.find("." + tabName).off("click");
    return this.cj_menuSelectors.tabs.find("." + tabName).on("click", function() {
      return _this.showTags(tabTree, tabName);
    });
  };

  View.prototype.showTags = function(currentTree, tabName, noPrev) {
    if (currentTree !== _treeVisibility.currentTree) {
      this.cj_menuSelectors.tabs.find(".tab-" + (this.getTabNameFromId(_treeVisibility.currentTree, true))).removeClass("active");
      this.cj_selectors.tagBox.find(".top-" + _treeVisibility.currentTree).toggle().removeClass("active");
      _treeVisibility.previousTree = _treeVisibility.currentTree;
      _treeVisibility.currentTree = currentTree;
      this.cj_menuSelectors.tabs.find(".tab-" + (this.getTabNameFromId(currentTree, true))).addClass("active");
      return this.cj_selectors.tagBox.find(".top-" + currentTree).toggle().addClass("active");
    }
  };

  View.prototype.setActiveTree = function(id) {
    var tabName;
    tabName = this.getTabNameFromId(id, true);
    this.cj_menuSelectors.tabs.find("div").removeClass("active");
    this.cj_selectors.tagBox.find(".tagContainer").removeClass("active").css("display", "none");
    this.cj_menuSelectors.tabs.find(".tab-" + tabName).addClass("active");
    return this.cj_selectors.tagBox.find(".top-" + id).addClass("active").css("display", "block");
  };

  View.prototype.createTreeTabs = function(tabName, isHidden) {
    var output, style, tabClass;
    if (isHidden == null) {
      isHidden = false;
    }
    if (isHidden) {
      style = "style='display:none'";
    } else {
      style = "";
    }
    tabClass = (_utils.hyphenize(tabName)).toLowerCase();
    output = "<div class='tab-" + tabClass + "' " + style + ">" + tabName + "</div>";
    return this.cj_menuSelectors.tabs.append(output);
  };

  View.prototype.getTabNameFromId = function(id, hyphenize) {
    var treeNames;
    if (hyphenize == null) {
      hyphenize = false;
    }
    treeNames = this.instance.treeNames;
    if (!hyphenize) {
      return treeNames[id];
    }
    return _utils.hyphenize(treeNames[id]).toLowerCase();
  };

  View.prototype.getIdFromTabName = function(tabName) {
    tabName = cj.trim(tabName);
    if (tabName === "tab-issue-codes" || tabName === "issue-codes") {
      return 291;
    }
    if (tabName === "tab-keywords" || tabName === "keywords") {
      return 296;
    }
    if (tabName === "tab-positions" || tabName === "positions") {
      return 292;
    }
  };

  View.prototype.buildFilteredList = function(tags) {
    var buildList, checkAgainst, d, e, k, m, n, o, x, y, _ref;
    checkAgainst = {};
    for (m in tags) {
      n = tags[m];
      checkAgainst[m] = [];
      for (x in n) {
        y = n[x];
        checkAgainst[m].push(parseFloat(y.id));
      }
    }
    buildList = {};
    for (d in checkAgainst) {
      e = checkAgainst[d];
      buildList[d] = [];
      _ref = this.instance.autocomplete;
      for (k in _ref) {
        o = _ref[k];
        if (e.indexOf(parseFloat(o.id)) >= 0) {
          buildList[d].push(o);
        }
      }
    }
    return buildList;
  };

  View.prototype.writeFilteredList = function(list, term, hits) {
    var activeTree, currentBoxes, k, v, _results,
      _this = this;
    if (hits == null) {
      hits = {};
    }
    if (!this.shouldBeFiltered) {
      return false;
    }
    if (this.cj_selectors.tagBox.hasClass("filtered")) {
      if (this.cleanTree === true) {
        return false;
      }
      currentBoxes = this.cj_selectors.tagBox.find(".tagContainer");
      cj.each(currentBoxes, function(i, tree) {
        var currentTerm, incomingTerm;
        currentTerm = cj(tree).data("term");
        if (currentTerm == null) {
          currentTerm = "";
          cj(tree).data("term", "");
        }
        incomingTerm = term;
        if (currentTerm !== incomingTerm) {
          return cj(tree).remove();
        }
      });
    } else {
      this.cj_selectors.tagBox.addClass("filtered");
      currentBoxes = this.cj_selectors.tagBox.find(".tagContainer");
      cj.each(currentBoxes, function(i, tree) {
        var currentTerm, incomingTerm;
        currentTerm = cj(tree).data("term");
        if (currentTerm == null) {
          currentTerm = "";
          cj(tree).data("term", "");
        }
        incomingTerm = term;
        if (currentTerm !== incomingTerm) {
          return cj(tree).remove();
        }
      });
      this.cj_selectors.tagBox.empty();
      this.cleanTree = false;
    }
    this.setTabResults(hits);
    activeTree = this.cj_menuSelectors.tabs.find(".active").attr("class").replace("active", "");
    for (k in list) {
      v = list[k];
      new Tree(v, k, true);
      this.cj_selectors.tagBox.find(".top-" + k).data("term", term);
    }
    this.setActiveTree(this.getIdFromTabName(activeTree));
    _results = [];
    for (k in hits) {
      v = hits[k];
      _results.push(this.removeUnnecessaryDropdowns(k));
    }
    return _results;
  };

  View.prototype.noResultsBox = function(treeId, k) {
    var activeTree, isActive, noResults;
    activeTree = this.getIdFromTabName(cj.trim(cj(".JSTree-tabs .active").attr("class").replace(/active/g, "")));
    if (parseInt(k) === parseInt(activeTree)) {
      isActive = "active";
    } else {
      isActive = "";
    }
    noResults = "            <div class='top-" + k + " tagContainer filtered " + isActive + " no-results'>              <div class='no-results'>                No Results Found              </div>            </div>          ";
    return cj(".JSTree").append(noResults);
  };

  View.prototype.removeUnnecessaryDropdowns = function(treeId) {
    var dropdowned;
    dropdowned = this.cj_selectors.tagBox.find(".top-" + treeId + " .treeButton").parent().parent();
    return cj.each(dropdowned, function(i, item) {
      var cjItem, sibLength, tagid;
      cjItem = cj(item);
      tagid = cjItem.data("tagid");
      sibLength = cjItem.siblings("dl#tagDropdown_" + tagid).length;
      if (cjItem.siblings("dl#tagDropdown_" + tagid).children().length === 0) {
        return cjItem.find(".treeButton").removeClass("treeButton");
      }
    });
  };

  View.prototype.rebuildInitialTree = function() {
    var activeTree, k, v, _ref;
    if (this.cj_selectors.tagBox.hasClass("filtered")) {
      this.cj_selectors.tagBox.removeClass("filtered");
      this.cj_selectors.tagBox.find(".filtered").remove();
      activeTree = this.cj_menuSelectors.tabs.find(".active").attr("class").replace("active", "");
      _ref = this.trees;
      for (k in _ref) {
        v = _ref[k];
        new Tree(v.tagList, k);
        if (parseInt(k) === 292) {
          this.addPositionReminderText(this.cj_selectors.tagBox.find(".top-" + k));
        }
      }
      return this.setActiveTree(this.getIdFromTabName(activeTree));
    }
  };

  View.prototype.setTabResults = function(hits) {
    var cjTab, count, k, result, v, _results;
    _results = [];
    for (k in hits) {
      v = hits[k];
      cjTab = this.cj_menuSelectors.tabs.find(".tab-" + (this.getTabNameFromId(k, true)));
      count = cjTab.find("span").html();
      if (count != null) {
        count = count.replace(/\(|\)/g, "");
      }
      if ((count == null) && parseInt(v) > 0) {
        result = cjTab.html();
        _results.push(cjTab.html("" + result + "<span>(" + v + ")</span>"));
      } else {
        if (count > 0 && parseInt(v) === 0) {
          cjTab.find("span").remove();
          result = cjTab.html();
          cjTab.html("" + result + "<span>(" + count + ")</span>");
        }
        if (count === 0 && parseInt(v) > 0) {
          cjTab.find("span").remove();
          result = cjTab.html();
          _results.push(cjTab.html("" + result + "<span>(" + v + ")</span>"));
        } else {
          cjTab.find("span").remove();
          result = cjTab.html();
          _results.push(cjTab.html("" + result + "<span>(" + v + ")</span>"));
        }
      }
    }
    return _results;
  };

  View.prototype.removeTabCounts = function() {
    return this.cj_menuSelectors.tabs.find("span").remove();
  };

  View.prototype.addPositionReminderText = function(cjlocation) {
    var positionText;
    positionText = "              <div class='position-box-text-reminder'>                Type in a Bill Number or Name for Results              </div>          ";
    return cjlocation.html(positionText);
  };

  View.prototype.toggleTagBox = function() {
    return this.cj_selectors.tagBox.toggle().toggleClass("dropdown");
  };

  View.prototype.toggleDropdown = function(oc) {
    var boxHeight,
      _this = this;
    if (oc == null) {
      oc = false;
    }
    if (oc) {
      if (this.cj_selectors.tagBox.find(".top-291,.top-296").length === 2) {
        cj.each(this.cj_selectors.tagBox.find(".tagContainer:not('.top-292')"), function(i, container) {
          return _this.getTagHeight(cj(container));
        });
      }
      if (this.cj_selectors.tagBox.find(".top-292").length === 1) {
        cj.each(this.cj_selectors.tagBox.find(".tagContainer.top-292"), function(i, container) {
          return _this.getTagHeight(cj(container));
        });
      }
      this.cj_selectors.container.css("position", "static");
      return this.cj_selectors.tagBox.css("height", "auto").addClass("open").css("overflow-y", "auto");
    } else {
      boxHeight = new Resize();
      this.cj_selectors.container.css("position", "relative").height(boxHeight);
      return this.cj_selectors.tagBox.removeClass("open").css("overflow-y", "scroll");
    }
  };

  View.prototype.getTagHeight = function(cjTagContainer, maxHeight) {
    var _this = this;
    if (maxHeight == null) {
      maxHeight = 180;
    }
    return cj.each(cjTagContainer, function(a, container) {
      var checkDTs, closestTo, heightTotal, propHeight, v, _i, _j, _len, _len1;
      checkDTs = [];
      heightTotal = _this.getRecTagHeight(container);
      propHeight = 0;
      for (_i = 0, _len = heightTotal.length; _i < _len; _i++) {
        v = heightTotal[_i];
        propHeight += parseInt(v);
      }
      if (propHeight > maxHeight) {
        closestTo = 0;
        for (_j = 0, _len1 = heightTotal.length; _j < _len1; _j++) {
          v = heightTotal[_j];
          console.log(closestTo);
          if (closestTo > maxHeight) {
            break;
          }
          closestTo += parseInt(v);
        }
        return cj(container).height(closestTo);
      } else {
        return cj(container).height(propHeight);
      }
    });
  };

  View.prototype.getRecTagHeight = function(container, heightTotal, already) {
    var _this = this;
    if (heightTotal == null) {
      heightTotal = [];
    }
    if (heightTotal.length > 8) {
      return heightTotal;
    }
    cj.each(cj(container).find("dt"), function(i, el) {
      var cjEl;
      cjEl = cj(el);
      heightTotal.push(cjEl.height());
      if (heightTotal.length > 8) {
        return false;
      }
    });
    return heightTotal;
  };

  return View;

})();

Settings = (function() {
  var icons;

  function Settings(instance, view) {
    this.instance = instance;
    this.view = view;
    this.createButtons();
  }

  Settings.prototype.createButtons = function() {
    var a, b, _i, _j, _len, _len1, _ref, _ref1, _results;
    this.cj_top_settings = cj("." + (this.view.menuSelectors.top.split(" ").join(".")) + " ." + (this.view.menuSelectors.settings.split(" ").join(".")));
    this.cj_bottom_settings = cj("." + (this.view.menuSelectors.bottom.split(" ").join(".")) + " ." + (this.view.menuSelectors.settings.split(" ").join(".")));
    _ref = icons.top;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      this.cj_top_settings.append(this.addButton(a));
    }
    _ref1 = icons.bottom;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      b = _ref1[_j];
      _results.push(this.cj_bottom_settings.append(this.addButton(b)));
    }
    return _results;
  };

  icons = {
    top: ['setting', 'add', 'print'],
    bottom: ['slide']
  };

  Settings.prototype.addButton = function(name) {
    return "<div class='" + name + "'></div>";
  };

  return Settings;

})();

Resize = (function() {
  function Resize() {
    var lsheight;
    if (bbUtils.localStorage("tagBoxHeight") != null) {
      lsheight = bbUtils.localStorage("tagBoxHeight");
      this.height = lsheight.height;
    } else {
      this.height = 400;
    }
  }

  Resize.prototype.addResize = function(instance, view) {
    var displaySettings, maxHeight,
      _this = this;
    this.instance = instance;
    this.view = view;
    displaySettings = this.instance.get("displaySettings");
    maxHeight = 500;
    if (displaySettings.maxHeight != null) {
      maxHeight = displaySettings.maxHeight;
    }
    this.tagBox = this.view.cj_selectors.tagBox;
    cj(document).on("mouseup", function(event, tagBox) {
      cj(document).off("mousemove");
      if (_this.tagBox.height() < 15) {
        _this.view.toggleTagBox();
        _this.tagBox.height(0);
      }
      return bbUtils.localStorage("tagBoxHeight", {
        height: _this.tagBox.height()
      });
    });
    return this.view.cj_tokenHolder.resize.on("mousedown", function(ev, tagBox) {
      if (_this.tagBox.hasClass("dropdown")) {
        _this.tagBox.height(0);
        _this.view.toggleTagBox();
      }
      ev.preventDefault();
      return cj(document).on("mousemove", function(ev, tagBox) {
        if (ev.pageY - cj(".JSTree").offset().top < maxHeight) {
          return _this.tagBox.css("height", ev.pageY - cj(".JSTree").offset().top);
        }
      });
    });
  };

  return Resize;

})();

Autocomplete = (function() {
  var initHint;

  function Autocomplete(instance, view) {
    var cjac, params, searchmonger,
      _this = this;
    this.instance = instance;
    this.view = view;
    this.pageElements = this.instance.get('pageElements');
    this.dataSettings = this.instance.get('dataSettings');
    if (this.cjTagBox == null) {
      this.cjTagBox = cj("." + (this.pageElements.tagHolder.join(".")));
    }
    cj("#JSTree-data").data({
      "autocomplete": this.instance.autocomplete
    });
    params = {
      jqDataReference: "#JSTree-data",
      hintText: "Type in a partial or complete name of an tag or keyword.",
      theme: "JSTree"
    };
    cjac = cj("#JSTree-ac");
    this.hintText(cjac, params);
    searchmonger = cjac.tagACInput("init", params);
    cjac.on("click", (function(event) {
      if (cjac.val() === params.hintText) {
        cjac.val("");
        cjac.css("color", "#000");
        return _this.initHint = false;
      }
    }));
    cjac.on("keydown", (function(event) {
      return _this.filterKeydownEvents(event, searchmonger, cjac);
    }));
    cjac.on("keyup", (function(event) {
      var keyCode;
      keyCode = bbUtils.keyCode(event);
      if (keyCode.type === "delete" && cjac.val().length <= 3) {
        _this.view.removeTabCounts();
        _this.view.shouldBeFiltered = false;
        _this.view.rebuildInitialTree();
        _this.view.toggleDropdown();
        if (_this.initHint) {
          _this.hintText(cjac, params);
          return _this.initHint = false;
        } else {
          return cjac.css("color", "#000");
        }
      }
    }));
  }

  initHint = true;

  Autocomplete.prototype.hintText = function(cjac, params) {
    cjac.val(params.hintText);
    return cjac.css("color", "#999");
  };

  Autocomplete.prototype.filterKeydownEvents = function(event, searchmonger, cjac) {
    var keyCode, name;
    keyCode = bbUtils.keyCode(event);
    switch (keyCode.type) {
      case "directional":
        return true;
      case "letters":
      case "delete":
      case "math":
      case "punctuation":
      case "number":
        if (keyCode.type !== "delete") {
          name = keyCode.name;
        } else {
          name = "";
        }
        return this.execSearch(event, searchmonger, cjac, name);
      default:
        return false;
    }
  };

  Autocomplete.prototype.buildPositions = function(list, term, hits) {
    var openLeg, options,
      _this = this;
    if (this.positionPagesLeft > 1) {
      openLeg = new OpenLeg;
      options = {
        scrollBox: ".JSTree"
      };
      return this.cjTagBox.find(".top-292.tagContainer").infiniscroll(options, function() {
        var nextPage;
        _this.openLegQueryDone = false;
        nextPage = {
          term: _this.positionSearchTerm,
          page: _this.positionPage
        };
        _this.cjTagBox.find(".top-292.tagContainer").append(_this.addPositionLoader());
        return openLeg.query(nextPage, function(results) {
          var filteredList, poses;
          poses = _this.addPositionsToTags(results.results);
          filteredList = {
            292: poses
          };
          _this.getNextPositionRound(results);
          new Tree(poses, "292", false, cj(".JSTree .top-292"));
          _this.openLegQueryDone = true;
          return _this.buildPositions();
        });
      });
    }
  };

  Autocomplete.prototype.addPositionLoader = function() {
    return "<dt class='loadingGif' data-parentid='292'><div class='tag'><div class='ddControl'></div><div class='loadingText'>Loading...</div></div><div class='transparancyBox type-292'></div></dt>";
  };

  Autocomplete.prototype.execSearch = function(event, searchmonger, cjac, lastLetter) {
    var term,
      _this = this;
    term = cjac.val() + lastLetter;
    if (term.length >= 3) {
      this.view.shouldBeFiltered = true;
      return searchmonger.exec(event, function(terms) {
        var filteredList, foundTags, hcounts, hits, k, openLeg, tags, v;
        if ((terms != null) && !cj.isEmptyObject(terms)) {
          openLeg = new OpenLeg;
          openLeg.query({
            "term": term
          }, function(results) {
            var filteredList, poses;
            poses = _this.addPositionsToTags(results.results);
            filteredList = {
              292: poses
            };
            _this.getNextPositionRound(results);
            _this.view.writeFilteredList(filteredList, term, {
              292: results.seeXmore
            });
            _this.buildPositions();
            _this.openLegQueryDone = true;
            return _this.view.toggleDropdown(true);
          });
          tags = _this.sortSearchedTags(terms.tags);
          hits = _this.separateHits(tags);
          hcounts = 0;
          foundTags = [];
          for (k in hits) {
            v = hits[k];
            hcounts += v;
            foundTags.push(parseFloat(k));
          }
          console.log(hits);
          filteredList = _this.view.buildFilteredList(tags);
          console.log(cj.isEmptyObject(terms));
          _this.view.writeFilteredList(filteredList, terms.term.toLowerCase(), hits);
          console.log(Object.keys(hits).length);
          if (Object.keys(hits).length < 2) {
            for (k in hits) {
              v = hits[k];
              console.log(k, v);
              console.log([291, 296].indexOf(k));
            }
          }
          _this.localQueryDone = true;
        }
        if ((terms != null) && cj.isEmptyObject(terms)) {
          return tags = {};
        }
      });
    }
  };

  Autocomplete.prototype.separateHits = function(terms, results) {
    var hits, k, v;
    hits = {};
    for (k in terms) {
      v = terms[k];
      if (v.length > 0) {
        hits[k] = v.length;
      }
    }
    return hits;
  };

  Autocomplete.prototype.positionIdNumber = 292000;

  Autocomplete.prototype.getNextPositionRound = function(results) {
    this.positionPage = results.page + 1;
    this.positionPagesLeft = results.pagesLeft;
    return this.positionSearchTerm = results.term;
  };

  Autocomplete.prototype.addPositionsToTags = function(positions) {
    var agipos, format, forpos, k, neupos, o;
    format = [];
    for (k in positions) {
      o = positions[k];
      forpos = {
        name: o.forname,
        id: "" + (this.positionIdNumber + 1)
      };
      agipos = {
        name: o.againstname,
        id: "" + (this.positionIdNumber + 2)
      };
      neupos = {
        name: o.noname,
        id: "" + (this.positionIdNumber + 3)
      };
      forpos.type = agipos.type = neupos.type = "292";
      forpos.description = agipos.description = neupos.description = o.description;
      forpos.children = agipos.children = neupos.children = false;
      forpos.created_date = agipos.created_date = neupos.created_date = "";
      forpos.created_id = agipos.created_id = neupos.created_id = "";
      forpos.created_name = agipos.created_name = neupos.created_name = "";
      forpos.parent = agipos.parent = neupos.parent = "292";
      forpos.level = agipos.level = neupos.level = 1;
      forpos.url = agipos.url = neupos.url = o.url;
      format.push(forpos);
      format.push(agipos);
      format.push(neupos);
      this.positionIdNumber = this.positionIdNumber + 10;
    }
    return this.positionListing = format;
  };

  Autocomplete.prototype.sortSearchedTags = function(tags) {
    var list;
    list = {};
    cj.each(tags, function(i, el) {
      var obj;
      if (list[el.type] == null) {
        list[el.type] = [];
      }
      obj = {
        id: el.id,
        name: el.name
      };
      return list[el.type].push(obj);
    });
    return list;
  };

  return Autocomplete;

})();

_openTags = {};

_treeVisibility = {
  currentTree: "",
  defaultTree: "",
  previousTree: ""
};

Tree = (function() {
  Tree.prototype.domList = {};

  Tree.prototype.nodeList = {};

  Tree.prototype.tabName = "";

  function Tree(tagList, tagId, filter, location) {
    this.tagList = tagList;
    this.tagId = tagId;
    this.filter = filter != null ? filter : false;
    this.location = location;
    this.buildTree();
  }

  Tree.prototype.buildTree = function() {
    var filter;
    if (this.filter) {
      filter = "filtered";
    } else {
      filter = "";
    }
    if (this.location != null) {
      this.append = true;
      this.domList = cj();
      this.domList = this.domList.add("<div></div>");
    } else {
      this.domList = cj();
      this.domList = this.domList.add("<div class='top-" + this.tagId + " " + filter + " tagContainer'></div>");
    }
    return this.iterate(this.tagList);
  };

  Tree.prototype.iterate = function(ary) {
    var buttons, cjTagList, cjToAppendTo, kNode, node, _i, _len,
      _this = this;
    cjTagList = cj(this.domList);
    for (_i = 0, _len = ary.length; _i < _len; _i++) {
      node = ary[_i];
      this.nodeList[node.id] = kNode = new Node(node);
      if (node.parent === this.tagId) {
        cjTagList.append(kNode.html);
      } else {
        cjToAppendTo = cjTagList.find("dl#tagDropdown_" + kNode.parent);
        if (cjToAppendTo.length === 0) {
          cjTagList.append(kNode.html);
        } else {
          cjToAppendTo.append(kNode.html);
        }
      }
    }
    if (!this.append) {
      cjTagList.appendTo(".JSTree");
    } else {
      this.location.find(".loadingGif").replaceWith(cjTagList);
    }
    this.html = cjTagList;
    _treeUtils.makeDropdown(cj(".JSTree .top-" + this.tagId));
    if (this.filter) {
      buttons = cj(".JSTree .top-" + this.tagId + " .treeButton").parent().parent();
      return cj.each(buttons, function(i, button) {
        return _treeUtils.dropdownItem(cj(button), true);
      });
    } else {
      return _treeUtils.readDropdownsFromLocal(this.tagId, this.tagList);
    }
  };

  return Tree;

})();

_treeUtils = {
  selectByParent: function(list, parent) {
    var b, childList, _i, _len;
    childList = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      b = list[_i];
      if (b.parent === parent) {
        childList.push(b);
      }
    }
    return childList;
  },
  selectByTree: function(list, tree) {
    var b, treeList, _i, _len;
    treeList = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      b = list[_i];
      if (b.type === tree) {
        treeList.push(b);
      }
    }
    return treeList;
  },
  makeDropdown: function(cjTree) {
    cjTree.find(".treeButton").off("click");
    return cjTree.find(".treeButton").on("click", function() {
      return _treeUtils.dropdownItem(cj(this).parent().parent());
    });
  },
  dropdownItem: function(tagLabel, search) {
    var tagid,
      _this = this;
    if (search == null) {
      search = false;
    }
    tagid = tagLabel.data('tagid');
    if (tagLabel.length > 0) {
      if (tagLabel.is(".open")) {
        _openTags[tagid] = false;
      } else {
        _openTags[tagid] = true;
      }
    }
    tagLabel.siblings("dl#tagDropdown_" + tagid).slideToggle("200", function() {
      return tagLabel.toggleClass("open");
    });
    if (!search) {
      return bbUtils.localStorage("tagViewSettings", _openTags);
    }
  },
  readDropdownsFromLocal: function(cjTree) {
    var bool, tag, toPass, _ref;
    if (parseInt(cjTree) === 291) {
      if (bbUtils.localStorage("tagViewSettings")) {
        _openTags = bbUtils.localStorage("tagViewSettings");
        _ref = bbUtils.localStorage("tagViewSettings");
        for (tag in _ref) {
          bool = _ref[tag];
          if (bool) {
            toPass = cj("dt.tag-" + tag);
            this.dropdownItem(toPass);
          } else {
            delete _openTags[tag];
          }
        }
      } else {

      }
      return _openTags;
    }
  }
};

_descWidths = {
  normal: 80,
  long: 160
};

Node = (function() {
  function Node(node) {
    this.data = node;
    this.parent = node.parent;
    this.hasDesc = "";
    this.description = node.descriptf_ion;
    this.descLength(node.description);
    this.id = node.id;
    this.children = node.children;
    this.name = node.name;
    this.html = this.html(node);
    return this;
  }

  Node.prototype.descLength = function(description) {
    var desc;
    this.description = description;
    if (this.description != null) {
      if (this.description.length > 0) {
        desc = _utils.textWrap(this.description, _descWidths.normal);
        console.log(desc);
        if (desc.segs === 1) {
          this.hasDesc = "description shortdescription";
        }
        if (desc.segs === 2) {
          this.hasDesc = "description";
        }
        if (desc.segs === 3) {
          this.hasDesc = "longdescription";
        }
        if (desc.segs > 3) {
          if (desc.toRet[2] < _descWidth.normal) {
            desc.toRet[2] += "...";
          }
        }
        if (desc.segs > 1) {
          return this.description = desc.toRet.join("<br />");
        } else {
          return this.description = desc.toRet[0];
        }
      }
    }
  };

  Node.prototype.html = function(node) {
    var html, treeButton;
    if (node.children) {
      treeButton = "treeButton";
    } else {
      treeButton = "";
    }
    if (parseFloat(node.is_reserved) !== 0) {
      this.reserved = true;
    } else {
      this.reserved = false;
    }
    html = "<dt class='lv-" + node.level + " " + this.hasDesc + " tag-" + node.id + "' id='tagLabel_" + node.id + "' data-tagid='" + node.id + "' data-name='" + node.name + "' data-parentid='" + node.parent + "'>";
    html += "              <div class='tag'>            ";
    html += "                <div class='ddControl " + treeButton + "'></div>              ";
    html += "                <span class='name'>" + node.name + "</span>            ";
    if (this.hasDesc.length > 0) {
      html += "                <div class='description'>" + this.description + "</div>            ";
    }
    html += "              </div>              <div class='transparancyBox type-" + node.type + "'></div>            ";
    html += "</dt>";
    html += "              <dl class='lv-" + node.level + "' id='tagDropdown_" + node.id + "' data-name='" + node.name + "'></dl>            ";
    return html;
  };

  return Node;

})();
