// Generated by CoffeeScript 1.6.3
var View, treeBehavior, treeManipulation, utils, _treeVisibility, _viewSettings;

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
    var displayElements, i, pageElements, selector, _i, _len, _ref, _ref1;
    pageElements = this.instance.get('pageElements');
    displayElements = this.instance.get('displayElements');
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
    this.addBoxSizing = pageElements.size;
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
    this.tagWrapperSelector = this.tagWrapperSelector.concat("#" + pageElements.wrapper);
    return console.log(displayElements);
  };

  View.prototype.separateSizeElements = function(el) {
    var a, b, classNames, _i, _len;
    el.replace(/\./, "");
    el.replace(/#/, "");
    classNames = el.split(" ");
    for (b = _i = 0, _len = classNames.length; _i < _len; b = ++_i) {
      a = classNames[b];
      el += "." + b;
      console.log(a, b);
    }
    return el;
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
      if (v !== this.displaySettings.defaultTree) {
        this.cjInstanceSelector.append(_treeData.html[v]);
        if (parseFloat(v) === 292) {
          treeBehavior.addPositionReminderText(this.cjInstanceSelector);
        }
      }
      treeBehavior.createOpacityFaker(".top-" + v, "dt", "type-" + v);
    }
    this.cjInstanceSelector.find(".top-" + this.displaySettings.defaultTree).addClass("active");
    treeBehavior.setCurrentTab(_treeData.treeTabs[this.displaySettings.defaultTree]);
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
      _treeData.treeTabs[k] = "tab-" + b;
      _results.push(treeBehavior.createTabClick("tab-" + b, "top-" + k));
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
  addPositionReminderText: function(cjlocation) {
    var positionText;
    positionText = "            <dl class='top-292 tagContainer' style='display:none'>              <div class='position-box-text-reminder'>                Type in a Bill Number or Name for Results              </div>            </dl>          ";
    return cjlocation.append(positionText);
  },
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
    this.dataSettings = this.instance.get('dataSettings');
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
    return cjac.on("keydown", (function(event) {
      return _this.filterKeydownEvents(event, searchmonger, cjac);
    }));
  },
  _dropdown: {
    inDropdown: false,
    isDrawn: false,
    hasLength: false
  },
  filterKeydownEvents: function(event, searchmonger, cjac) {
    var keyCode;
    keyCode = bbUtils.keyCode(event);
    switch (keyCode.type) {
      case "directional":
        return this.moveDropdown(keyCode.type);
      case "letters":
      case "delete":
      case "math":
      case "punctuation":
      case "number":
        return this.execSearch(event, searchmonger, cjac);
      default:
        return false;
    }
  },
  execSearch: function(event, searchmonger, cjac) {
    var _this = this;
    return searchmonger.exec(event, function(terms) {
      var openLeg;
      openLeg = new OpenLeg;
      console.log(terms);
      if ((terms != null) && (terms.tags != null)) {
        openLeg.query({
          "term": terms.term
        }, function(results) {
          var hits, tags;
          hits = terms.tags.length + results.results.length + results.seeXmore;
          _this.addPositionsToTags(results.results);
          _this.getNextPositionRound(results);
          tags = terms.tags;
          if (hits > 0) {
            _this.buildFilterList(tags, terms.term.toLowerCase(), hits);
            return _this.sortSearchedTags(tags);
          } else if (hits === 0 && terms.term.length >= 3) {
            return _this.buildFilterList(null, "No Results Found");
          }
        });
      }
      if (cjac.val().length < 3) {
        _this.removePositions;
        return _this.toggleFilterList();
      }
    });
  },
  positionIdNumber: 292000,
  sortSearchedTags: function(tags) {
    var list;
    list = {};
    return cj.each(tags, function(i, el) {
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
  },
  getNextPositionRound: function(results) {
    this.positionPage = results.page + 1;
    this.positionPagesLeft = results.pagesLeft;
    return this.positionSearchTerm = results.term;
  },
  addPositionsToTags: function(positions) {
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
      forpos.url = agipos.url = neupos.url = o.url;
      format.push(forpos);
      format.push(agipos);
      format.push(neupos);
      this.positionIdNumber = this.positionIdNumber + 10;
    }
    return this.positionListing = format;
  },
  moveDropdown: function(keyCode) {},
  grabParents: function(cjParentId) {
    var go, newid, parentid;
    if (this.dataSettings.pullSets.indexOf(cjParentId) !== -1) {
      return [];
    }
    go = true;
    parentid = [cjParentId];
    while (go) {
      newid = this.cjTagBox.find("dt[data-tagid=" + parentid[parentid.length - 1] + "]").data("parentid");
      if (this.dataSettings.pullSets.indexOf(newid) < 0) {
        parentid.push(newid);
      } else {
        go = false;
      }
    }
    return parentid;
  },
  buildParents: function(parentArray) {
    var clonedName, clonedTag, clonedTagLvl, index, output, parentid, _i, _len, _results;
    output = "";
    parentArray.reverse();
    _results = [];
    for (index = _i = 0, _len = parentArray.length; _i < _len; index = ++_i) {
      parentid = parentArray[index];
      clonedTag = this.cjTagBox.find("dt[data-tagid=" + parentid + "]").clone();
      clonedTagLvl = treeManipulation.parseLvl(clonedTag.attr("class"));
      clonedName = clonedTag.data('name');
      if (index === 0) {
        if (this.alreadyPlaced.indexOf(parentid) < 0) {
          clonedTag.appendTo(this.cjSearchBox).addClass("open");
          this.alreadyPlaced.push(parentid);
          _results.push(this.cjSearchBox.append(treeManipulation.createDL(clonedTagLvl, parentid, clonedName)));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  buildFilterList: function(tagList, term, hits) {
    if (!this.isFiltered) {
      return this.toggleFilterList(tagList);
    }
  },
  isFiltered: false,
  toggleFilterList: function(lists) {
    var a, activeTree, k, list, tagTypeId, v, _i, _len, _results, _results1;
    if (lists == null) {
      lists = cj(".JSTree").data("lists");
    }
    if (cj("#BBTreeContainer #JSTree-data dl").length > 0) {
      _results = [];
      for (k in lists) {
        v = lists[k];
        cj(".JSTree .tagContainer[class*=\"" + v + "\"]").remove();
        console.log(k, v);
        list = cj("#BBTreeContainer #JSTree-data .top-" + v);
        console.log(list);
        activeTree = this.convertTabToTreeName(this.getActiveTab());
        console.log(activeTree);
        console.log(cj(".JSTree dl.tagContainer." + activeTree));
        cj(".JSTree dl.tagContainer." + activeTree).addClass("active");
        cj(list).appendTo(".JSTree");
        cj(".JSTree").removeClass("isFiltered");
        cj(".JSTree").data("lists", []);
        _results.push(this.isFiltered = false);
      }
      return _results;
    } else {
      cj(".JSTree").data("lists", []);
      a = cj(".JSTree").data("lists");
      for (k in lists) {
        v = lists[k];
        if (!(a.indexOf(parseFloat(v.type)) >= 0)) {
          a.push(parseFloat(v.type));
        }
      }
      cj(".JSTree").data("lists", a);
      _results1 = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        tagTypeId = a[_i];
        cj(".JSTree").addClass("isFiltered");
        list = cj(".JSTree .tagContainer[class*=\"" + tagTypeId + "\"]").removeClass("active");
        cj(list).appendTo("#BBTreeContainer #JSTree-data");
        this.isFiltered = true;
        _results1.push(cj(".JSTree").append("<dl class='top-" + tagTypeId + " tagContainer filtered'></dl>"));
      }
      return _results1;
    }
  },
  getActiveTab: function() {
    var a, i, _i, _len;
    a = cj(".JSTree-menu .JSTree-tabs .active").attr("class").split(" ");
    for (_i = 0, _len = a.length; _i < _len; _i++) {
      i = a[_i];
      if (i !== "active") {
        return i;
      }
    }
  },
  buildPositions: function() {
    var k, o, openLeg, options, _ref;
    _ref = this.positionListing;
    for (k in _ref) {
      o = _ref[k];
      cj(treeManipulation.createDT(1, o.id, o.name, 292, "", o.description)).appendTo(this.cjSearchBox);
    }
    if (this.positionPagesLeft > 1) {
      openLeg = new OpenLeg;
      return options = {
        scrollBox: ".JSTree"
      };
    }
  },
  addPositionLoader: function() {
    return "<dt class='loadingGif' data-parentid='292'><div class='tag'><div class='ddControl'></div><div class='loadingText'>Loading...</div></div><div class='transparancyBox type-292'></div></dt>";
  },
  switchToSearch: function(tagListLength) {},
  makeShade: function(tagid, term) {},
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
  convertTabToTreeName: function(tab) {
    var k, v, _ref;
    _ref = _treeData.treeTabs;
    for (k in _ref) {
      v = _ref[k];
      if (v === tab) {
        return "top-" + k;
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
  processSearchChildren: function(tagArray) {
    var alreadyProcessed, parent, parents, tag, _i, _len, _results;
    alreadyProcessed = [];
    _results = [];
    for (_i = 0, _len = tagArray.length; _i < _len; _i++) {
      tag = tagArray[_i];
      parents = this.grabParents(tag);
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = parents.length; _j < _len1; _j++) {
          parent = parents[_j];
          if (alreadyProcessed.indexOf(parent) < 0 && parent !== tag) {
            _results1.push(alreadyProcessed.push(parent));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  },
  createTabClick: function(tabName, tabTree) {
    var _this = this;
    cj(".JSTree-tabs ." + tabName).off("click");
    return cj(".JSTree-tabs ." + tabName).on("click", function() {
      return _this.showTags(tabTree);
    });
  },
  enableDropdowns: function(tag, search) {
    if (tag == null) {
      tag = "";
    }
    if (search == null) {
      search = false;
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
  }
};

_viewSettings = {
  openTags: {}
};

utils = {
  loadingGif: function() {
    return cj("." + (this.pageElements.tagHolder.join("."))).toggleClass("loadingGif");
  }
};

treeManipulation = {
  parseLvl: function(tags) {
    var tag, tagArr, _i, _len;
    tagArr = tags.split(" ");
    for (_i = 0, _len = tagArr.length; _i < _len; _i++) {
      tag = tagArr[_i];
      if (tag.indexOf("lv-") !== -1) {
        return tag.slice(3);
      }
    }
  },
  createDL: function(lvl, id, name) {
    return "<dl class='lv-" + lvl + "' id='tagDropdown_" + id + "' data-name='" + name + "'></dl>";
  },
  createDT: function(lvl, id, name, parent, treeButton, description) {
    var hasDesc, output;
    if (lvl == null) {
      lvl = 0;
    }
    if (treeButton == null) {
      treeButton = "";
    }
    if (description == null) {
      description = "";
    }
    hasDesc = "";
    if (description.length > 0) {
      hasDesc = "description";
    }
    if (description.length > 0 && description.length <= 95) {
      hasDesc += " shortdescription";
    }
    if (description.length > 180) {
      hasDesc = "longdescription";
    }
    output = "<dt class='lv-" + lvl + " tag-" + id + " " + hasDesc + "' id='tagLabel_" + id + "' data-tagid='" + id + "' data-name='" + name + "' data-parentid='" + parent + "'>";
    output += "<div class='tag'>";
    output += "<div class='ddControl " + treeButton + "'></div>";
    output += "<span class='name'>" + name + "</span>";
    if (description != null) {
      output += "<div class='description'>" + description + "</div>";
    }
    output += "</div>";
    output += "<div class='transparancyBox type-" + parent + "'></div>";
    output += "</dt>";
    return output;
  }
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

