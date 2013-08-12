// Generated by CoffeeScript 1.6.3
var View, treeBehavior, _treeVisibility, _viewSettings;

window.jstree.views = {
  createNewView: function(instance) {
    var newView;
    return newView = new View(instance);
  }
};

View = (function() {
  function View(instance) {
    this.instance = instance;
    this.writeContainers();
    this.interval = this.setUpdateInterval(1000);
  }

  View.prototype.getData = function() {
    if (this.instance.get('ready') === true) {
      this.killUpdateInterval(this.interval);
      return this.writeTreeFromSource();
    }
  };

  View.prototype.setUpdateInterval = function(timeSet) {
    var callback,
      _this = this;
    callback = function() {
      return _this.getData();
    };
    return setInterval(callback, timeSet);
  };

  View.prototype.killUpdateInterval = function(clearInt) {
    return clearInterval(clearInt);
  };

  View.prototype.writeContainers = function() {
    this.formatPageElements();
    return this.addClassesToElement();
  };

  View.prototype.addClassesToElement = function() {
    this.cjInitHolderId.html("<div class='" + this.addClassHolderString + "'></div>");
    this.addMenuToElement();
    this.addTokenHolderToElement();
    this.addDataHolderToElement();
    return this.cjInitHolderId.removeClass(this.initHolderId).attr("id", this.addIdWrapperString);
  };

  View.prototype.addMenuToElement = function() {
    var menu;
    menu = "      <div class='" + this.menuName.menu + "'>       <div class='" + this.menuName.top + "'>        <div class='" + this.menuName.tabs + "'></div>        <div class='" + this.menuName.settings + "'></div>       </div>       <div class='" + this.menuName.bottom + "'>        <div class='" + this.menuName.autocomplete + "'>         <input type='text' id='JSTree-ac'>        </div>        <div class='" + this.menuName.settings + "'></div>       </div>      </div>    ";
    return this.cjInitHolderId.prepend(menu);
  };

  View.prototype.addDataHolderToElement = function() {
    var dataHolder;
    dataHolder = "<div id='JSTree-data' style='display:none'></div>";
    return this.cjInitHolderId.append(dataHolder);
  };

  View.prototype.addTokenHolderToElement = function() {
    var tokenHolder;
    tokenHolder = "      <div class='" + this.tokenHolder.tokenHolder + "'>       <div class='" + this.tokenHolder.resize + "'></div>       <div class='" + this.tokenHolder.body + "'>        <div class='" + this.tokenHolder.left + "'></div>        <div class='" + this.tokenHolder.options + "'></div>       </div>      </div>    ";
    return this.cjInitHolderId.append(tokenHolder);
  };

  View.prototype.addSearchBoxToElement = function() {};

  View.prototype.formatPageElements = function() {
    var i, pageElements, selector, _i, _len, _ref, _ref1;
    pageElements = this.instance.get('pageElements');
    _ref = ["", ""], this.tagHolderSelector = _ref[0], this.tagWrapperSelector = _ref[1];
    this.menuName = {
      menu: "",
      top: "",
      tabs: "",
      bottom: "",
      autocomplete: "",
      settings: ""
    };
    this.tokenHolder = {
      tokenHolder: "",
      options: "",
      body: "",
      resize: "",
      left: ""
    };
    this.addIdWrapperString = pageElements.wrapper;
    this.addClassHolderString = pageElements.tagHolder;
    this.initHolderId = pageElements.init;
    this.cjInitHolderId = cj("." + this.initHolderId);
    this.addClassHolderString = this.ifisarrayjoin(this.addClassHolderString);
    _ref1 = pageElements.tagHolder;
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      selector = _ref1[i];
      selector = selector.replace(" ", "-");
      this.menuName = this.concatOnObj(this.menuName, selector);
      this.tokenHolder = this.concatOnObj(this.tokenHolder, selector);
      this.tagHolderSelector = this.tagHolderSelector.concat("." + selector);
    }
    return this.tagWrapperSelector = this.tagWrapperSelector.concat("#" + pageElements.wrapper);
  };

  View.prototype.ifisarrayjoin = function(toJoin) {
    if (cj.isArray(toJoin)) {
      return toJoin = toJoin.join(" ");
    }
  };

  View.prototype.concatOnObj = function(obj, selector, classOrId) {
    var k, v;
    if (classOrId == null) {
      classOrId = ".";
    }
    for (k in obj) {
      v = obj[k];
      if (k.substr(0, 3) === "cj_") {
        break;
      }
      if (typeof obj["cj_" + k] === "undefined") {
        obj["cj_" + k] = "";
      }
      obj["cj_" + k] = obj["cj_" + k].concat("" + classOrId + selector + "-" + k);
      obj[k] = obj[k].concat("" + selector + "-" + k + " ");
    }
    return obj;
  };

  View.prototype.getCJQsaves = function() {
    this.cjTagWrapperSelector = cj(this.tagWrapperSelector);
    this.cjTagHolderSelector = cj(this.tagHolderSelector);
    this.cjInstanceSelector = cj(this.tagWrapperSelector.concat(" " + this.tagHolderSelector));
    return this.cjTabs = cj(this.menuName.cj_tabs);
  };

  View.prototype.writeTreeFromSource = function() {
    var k, locals, v, _ref;
    this.getCJQsaves();
    this.displaySettings = this.instance.get('displaySettings');
    this.dataSettings = this.instance.get('dataSettings');
    locals = {
      "menu": this.menuName.cj_tabs,
      "top": this.displaySettings.defaultTree
    };
    treeBehavior.setLocals(locals);
    this.writeTabs();
    this.cjInstanceSelector.html(_treeData.html[this.displaySettings.defaultTree]);
    _ref = this.dataSettings.pullSets;
    for (k in _ref) {
      v = _ref[k];
      treeBehavior.createOpacityFaker(".top-" + v, "dt", "type-" + v);
    }
    treeBehavior.setCurrentTab(_treeData.treeTabs[this.displaySettings.defaultTree]);
    cj(this.tagHolderSelector).append("<div class='search'></div>");
    treeBehavior.autoCompleteStart(this.instance);
    treeBehavior.readDropdownsFromLocal();
    return treeBehavior.enableDropdowns();
  };

  View.prototype.writeTabs = function() {
    var b, k, output, v, _ref, _results;
    output = "";
    _treeData.treeTabs = {};
    _ref = _treeData.treeNames;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      b = v.replace(" ", "-");
      b = b.toLowerCase();
      treeBehavior.appendTab(b, v);
      _results.push(_treeData.treeTabs[k] = "tab-" + b);
    }
    return _results;
  };

  return View;

})();

_treeVisibility = {
  currentTree: "",
  defaultTree: "",
  previousTree: ""
};

treeBehavior = {
  setLocals: function(locals) {
    if (locals.menu != null) {
      this.tabsLoc = locals.menu;
    }
    if (locals.top != null) {
      if (_treeVisibility.currentTree === "") {
        return _treeVisibility.currentTree = "top-" + locals.top;
      }
    }
  },
  autoCompleteStart: function(instance) {
    var cjac, params, searchmonger,
      _this = this;
    this.instance = instance;
    this.pageElements = this.instance.get('pageElements');
    this.appendTab("search", "search", true);
    if (this.cjTagBox == null) {
      this.cjTagBox = cj("." + (this.pageElements.tagHolder.join(".")));
    }
    cj("#JSTree-data").data({
      "autocomplete": this.instance.getAutocomplete()
    });
    params = {
      jqDataReference: "#JSTree-data",
      hintText: "Type in a partial or complete name of an tag or keyword.",
      theme: "JSTree"
    };
    cjac = cj("#JSTree-ac");
    searchmonger = cjac.tagACInput("init", params);
    return cjac.on("keydown", function(event) {
      return searchmonger.exec(event, function(terms) {
        console.log(terms);
        if ((terms != null) && (terms.tags != null)) {
          if (terms.tags.length > 0) {
            _this.buildSearchList(terms.tags, terms.term.toLowerCase());
          } else if (terms.tags.length === 0 && terms.term.length >= 3) {
            _this.buildSearchList(null, "No Results Found");
          }
        }
        if (cjac.val().length < 3) {
          if (_treeVisibility.currentTree === "search") {
            _this.showTags(_treeVisibility.previousTree);
            return cj("" + _this.tabsLoc + " .tab-search").hide();
          }
        }
      });
    });
  },
  buildSearchList: function(tagList, term) {
    var allDropdowns, cjCloneChildren, cjCloneTag, key, tag, tagListLength, toShade, value, _i, _len,
      _this = this;
    if (this.cjSearchBox == null) {
      this.cjSearchBox = this.cjTagBox.find(".search");
    }
    this.cjSearchBox.empty();
    if (tagList !== null) {
      tagListLength = tagList.length;
      toShade = [];
      for (key in tagList) {
        tag = tagList[key];
        cjCloneTag = this.cjTagBox.find("dt[data-tagid=" + tag.id + "]");
        if (this.cloneChildren(cjCloneTag, tagList)) {
          cjCloneChildren = this.cjTagBox.find("#tagDropdown_" + tag.id);
          console.log(cjCloneChildren);
          cjCloneTag.clone().appendTo(this.cjSearchBox).addClass("shaded");
          cjCloneChildren.clone().appendTo(this.cjSearchBox);
        } else {
          console.log(tag.id);
          toShade.push(tag.id);
        }
      }
      allDropdowns = cj(".search dt .tag .ddControl.treeButton").parent().parent();
      cj.each(allDropdowns, function(key, value) {
        var tagid;
        console.log(value);
        tagid = cj(value).data('tagid');
        if (tagid != null) {
          return _this.enableDropdowns(".search dt[data-tagid='" + tagid + "']", true);
        }
      });
    } else {
      tagListLength = 0;
      this.cjSearchBox.append("<div class='noResultsFound'>No Results Found</div>");
    }
    for (_i = 0, _len = toShade.length; _i < _len; _i++) {
      value = toShade[_i];
      this.toShade(value);
    }
    cj("" + this.tabsLoc + " .tab-search").show();
    this.setTabResults(tagListLength, "tab-search");
    return this.showTags("search");
  },
  toShade: function(tagid) {
    return cj(".search dt[data-tagid='" + tagid + "']").addClass("shaded");
  },
  cloneChildren: function(cjTag, tagList) {
    var hasRelevantPs, key, setReturn, tag;
    setReturn = true;
    for (key in tagList) {
      tag = tagList[key];
      hasRelevantPs = cjTag.parents("dl#tagDropdown_" + tag.id);
      if (hasRelevantPs.length > 0) {
        setReturn = false;
      }
    }
    return setReturn;
  },
  setTabResults: function(number, tabName) {
    var result, tab;
    tab = cj("" + this.tabsLoc + " ." + tabName);
    tab.find("span").remove();
    result = tab.html();
    return tab.html("" + result + "<span>(" + number + ")</span>");
  },
  setCurrentTab: function(treeTag) {
    cj("" + this.tabsLoc).find(".active").toggleClass("active");
    return cj("" + this.tabsLoc).find("." + treeTag).toggleClass("active");
  },
  showTags: function(currentTree, noPrev) {
    if (currentTree !== _treeVisibility.currentTree) {
      this.cjTagBox.find("." + _treeVisibility.currentTree).toggle();
      _treeVisibility.previousTree = _treeVisibility.currentTree;
      _treeVisibility.currentTree = currentTree;
      this.cjTagBox.find("." + currentTree).toggle();
      return this.setCurrentTab(this.convertTreeNameToTab(currentTree));
    }
  },
  convertTreeNameToTab: function(treeName) {
    var parsed, splitted;
    splitted = treeName.split("-");
    parsed = parseInt(splitted[splitted.length - 1]);
    if (!isNaN(parsed)) {
      return "" + _treeData.treeTabs[parsed];
    } else {
      if (treeName === "search") {
        return "tab-" + treeName;
      }
    }
  },
  appendTab: function(a, c, hidden) {
    var cjtabloc, output, style;
    if (hidden == null) {
      hidden = false;
    }
    style = "";
    if (hidden) {
      style = "style='display:none'";
    }
    cjtabloc = cj("" + this.tabsLoc);
    output = "<div class='tab-" + a + "' " + style + ">" + c + "</div>";
    return cjtabloc.append(output);
  },
  autoCompleteEnd: function(instance) {
    this.instance = instance;
    return cj("#JSTree-ac").off("keydown");
  },
  processSearchChildren: function(tag) {
    var dtClass, searchTag, tagid;
    console.log(tag);
    dtClass = cj("" + tag);
    dtClass.addClass("open");
    tagid = dtClass.data('tagid');
    searchTag = cj(".search dl#tagDropdown_" + tagid);
    return searchTag.show();
  },
  enableDropdowns: function(tag, search) {
    if (tag == null) {
      tag = "";
    }
    if (search == null) {
      search = false;
    }
    if (search) {
      this.processSearchChildren(tag);
    }
    cj(".JSTree " + tag + " .treeButton").off("click");
    return cj(".JSTree " + tag + " .treeButton").on("click", function() {
      return treeBehavior.dropdownItem(cj(this).parent().parent(), search);
    });
  },
  createOpacityFaker: function(container, parent, cssClass) {
    var cjItems;
    if (cssClass == null) {
      cssClass = "";
    }
    cjItems = cj("" + container + " " + parent);
    return cjItems.append("<div class='transparancyBox " + cssClass + "'></div>");
  },
  dropdownItem: function(tagLabel, search) {
    var tagid,
      _this = this;
    if (search == null) {
      search = false;
    }
    tagid = tagLabel.data('tagid');
    tagLabel.siblings("dl#tagDropdown_" + tagid).slideToggle("200", function() {
      if (tagLabel.is(".open")) {
        _viewSettings["openTags"][tagid] = false;
      } else {
        _viewSettings["openTags"][tagid] = true;
      }
      return tagLabel.toggleClass("open");
    });
    if (!search) {
      return bbUtils.localStorage("tagViewSettings", _viewSettings["openTags"]);
    }
  },
  readDropdownsFromLocal: function() {
    var bool, tag, toPass, _ref;
    if (bbUtils.localStorage("tagViewSettings")) {
      _viewSettings["openTags"] = bbUtils.localStorage("tagViewSettings");
      _ref = bbUtils.localStorage("tagViewSettings");
      for (tag in _ref) {
        bool = _ref[tag];
        if (bool) {
          toPass = cj("dt.tag-" + tag);
          this.dropdownItem(toPass);
        } else {
          delete _viewSettings["openTags"][tag];
        }
      }
    } else {

    }
    return _viewSettings["openTags"];
  },
  loadingGif: function() {
    return cj("." + (this.pageElements.tagHolder.join("."))).toggleClass("loadingGif");
  }
};

_viewSettings = {
  openTags: {}
};

/*
neat
<script>
$("div").attr("id", function (arr) {
  return "div-id" + arr;
})
.each(function () {
  $("span", this).html("(ID = '<b>" + this.id + "</b>')");
});
</script>
*/

