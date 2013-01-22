/*
* BBTree JS 0.3
* Now with infinite looping!
* And modular abilities!
* Last Updated: 1-15-2013
* Coded: Dan Pozzie (dpozzie@gmail.com)
*/

//alias for basic functionality, also provides pathing for calling function types
var BBTree = {
	startInstance: function(config)
	{	
		//Check remote timestamp first
		//then check cookie timestamp	
		//if cookies found skip getAjaxData
		//if cookie is found, send json to separate.
		//Config - BBTree.startInstance({writeSets: [291,296], treeTypeSet: 'edit'}); 
		callTree.setCurrentSettings(config);
	    //have to use a queue with ajax data
	    cj({})
	    	.queue(BBTree.getAjaxData)
	    	.queue(BBTree.writeTree);
	    //IDEA HERE IS TO GET THE DATA ASYNCHRONOUSLY THE FIRST TIME, IF DATA DOESN'T EXIST.
	    //AND THEN WRITE IT. THIS IS IMPORTANT BECAUSE WE DON'T WANT TO READ THE DATA EVERY TIME
	    //YOU GO AND FIND NEW CONTACTS. YOU WANT TO READ THE CONTACT DATA, NOT THE ENTIRE TREE
	    //AND THEN APPLY THE CONTACT DATA
	    //ALSO REMEMBER TO SET entity_counts: 1
	    //COOKIES REMEMBER CHECK COOKIES


	    //civicrm/ajax/entity_tag/get

	},
	initContainer: function()
	{
		callTree.treeSetupPage();
		BBTreeModal.makeModalInit();
	},
	getAjaxData: function(next)
	{
		 callTree.callTreeAjax(function(){next();});
	},
	writeTree: function(next)
	{
		callTree.writeParsedData();//written, but hidden
		setTreeLoc();//sets tree location variable which is used EVERYWHERE
		callTree.slideDownTree(); //writes jquery slidedown function
		sortWindow(); //list of where you're located, sets pageLocation, needs to be updated with each instance added
		switch(callTree.currentSettings.pageLocation) //gives manage/
		{
			case 'manage': BBTree.manageTree(); break;
			case 'edit': BBTree.tagTree(); break;
			case 'view': BBTree.tagTree(); break;
		}
		cj.each(callTree.currentSettings.displaySettings.writeSets, function(i, className){
			cj('.'+addTagLabel(className)).removeClass('loadingGif');
		});
		//BBTree.getMaxID();
		next();
	},
	manageTree: function()
	{
		BBTreeEdit.setTagInfo();
	},
	tagTree: function()
	{
		BBTreeTag.getContactTags();
	},
	getMaxID: function(){ //isn't actually necessary, should make based on response
		var idarray = cj('dt', callTree.currentSettings.pageSettings.wrapper + ' .' + callTree.currentSettings.pageSettings.tagHolder);
		var passarray = [];
		cj.each(idarray, function(i, v){
			passarray[i] = cj(v).attr('tid');
		});
		callTree.currentSettings.pageSettings.tagIdMax = Math.max.apply( Math, passarray );
		return callTree.currentSettings.pageSettings.tagIdMax;
	}
	/*
		Dynamically Added
		----------------
		SeparateTreeAjax
		----------------
		BBTree["rawJsonData"] = {};
		BBTree["parsedJsonData"] = {};
		BBTree["pulledData"] = {};
		BBTree["treeLoc"] = {};
	*/
};
//
var callTree =  {
	defaultSettings: {
		pageSettings:{
			wrapper: '#BBTreeContainer',
			idName: 'BBTreeContainer',
			tagHolder: 'BBTree',
			container: 'div',
			hiddenTag: 'hidden',
			tagIdMax: '0'
		},
		displaySettings: { //Sets the default when the page has to be refreshed internally
			writeSets: [291], //Set [one], or [other] to show only one, use [291,296] for both (when you want to show KW & IC)
			treeCodeSet: 291, //IssueCodes = 291, KW = 296. Sets default tree to show first.
			currentTree: 291,
			treeTypeSet: 'tagging' //Sets default type to appear: edit, modal or tagging versions... adds 'boxes/checks'
		},
		callSettings:{
			ajaxUrl: '/civicrm/ajax/tag/tree',
			ajaxSettings:{
				entity_type: 'civicrm_contact',
				entity_id: 0,
				call_uri: window.location.href,
				entity_counts: 0
			},
			callback: false
		}
	},
	setCurrentSettings: function(config){
		if(config)
		{
			callTree["pulledConfig"] = {};
			cj.each(
				config,function(i, value){
	            	callTree.pulledConfig[i] = value;
	       	});
	    }
	    cj.extend(true, callTree.defaultSettings, callTree.pulledConfig); //sets the inital settings
		callTree['currentSettings'] = callTree.defaultSettings; //this is what EVERYTHING is based off of...
		sortWindow(); //gets current window location
	},
	treeSetupPage: function(){ 
		//overwrites defaults technically can post these to a cookie and rewrite ::TODO::
		if(cj(callTree.currentSettings.pageSettings.wrapper).length == 0) //needs to append a div right after the function is called
		{
			if(cj('#BBInit').length > 0)
			{
				cj('#BBInit').attr('id', callTree.currentSettings.pageSettings.idName);
			}
		}
		//make this a function to build x trees with y attributes, and everyone is hidden but the first
		callTree.buildBoxes(); //sends # of boxes to buildBoxes
		//cj(callTree.defaultSettings.pageSettings.wrapper).append('<div class="BBTree '+ this.config.displaySettings.treeTypeSet.toLowerCase() +'"></div>');
	},
	callTreeAjax: function(callback){
		// var pageCID = getPageCID();
		// cj.extend(callTree.currentSettings.callSettings.ajaxSettings.entity_id,pageCID); //overwrites CID if page is different. Check Add Contact?
		cj.ajax({
			url: callTree.currentSettings.callSettings.ajaxUrl,
			data: {
				entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
				// entity_id: callTree.currentSettings.callSettings.ajaxSettings.entity_id,
				call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri,
				entity_counts: callTree.currentSettings.callSettings.ajaxSettings.entity_counts
			},
			dataType: 'json',
			success: function(data, status, XMLHttpRequest) {
				if(data.code != 1) {
					alert('Error');
				}
				else{
					callTree.separateTreeAjax(data.message);
					callback();
				}
			} 
		});
	},
	separateTreeAjax: function(data){
		//if cookie is found, send json to here.
		/*
		var dataStore = $.cookie("basket-data", JSON.stringify($("#ArticlesHolder").data()));
		var data=JSON.parse($.cookie("basket-data"))
		*/
		BBTree["rawJsonData"] = {}; //add new data properties
		BBTree["parsedJsonData"] = {};

		cj.each(data, function(i,tID){
			if(cj.inArray(parseFloat(tID.id), callTree.currentSettings.displaySettings.writeSets)>-1) //Checks against Allowed Sets
			{
				BBTree.rawJsonData[tID.id] = {'name':tID.name, 'children':tID.children};
				var displayObj = callTree.writeTreeInit(tID);
				callTree.currentSettings.displaySettings.currentTree = tID.id;
				callTree.parseTreeAjax(tID, displayObj);
			}
		});
		callTree.currentSettings.displaySettings.currentTree = callTree.currentSettings.displaySettings.treeCodeSet; //sets tree back to original code
	},
	writeTreeInit: function(tID){
		//start testing
		var displayObj = {};
		displayObj.tLvl = 0;
		displayObj.treeTop = tID.id;
		var tagLabel = addTagLabel(tID.id); //writes the identifying tag label
		displayObj.output += '<dl class="lv-'+displayObj.tLvl+'" id="'+tagLabel+'" tLvl="'+displayObj.tLvl+'">';
		displayObj.output = '<dt class="lv-'+displayObj.tLvl+' issueCode-'+tID.id;
		if(cj.inArray(parseFloat(tID.id), callTree.currentSettings.displaySettings.writeSets)>-1) //only writes the 
		{
			if(callTree.currentSettings.callSettings.ajaxSettings.entity_id != 0)
			{
				displayObj.output += isItemMarked(tID.is_checked,'checked');
			}
			displayObj.output += ' ' + isItemMarked(tID.is_reserved,'isReserved');
		}
		displayObj.output += '" id="'+tagLabel+'" description="'+tID.description+'" tLvl="'+displayObj.tLvl+'" tID="'+tID.id+'">';
		displayObj.output += '<div class="ddControl '+isItemChildless(tID.children.length)+'"></div><div class="tag"><span class="name">'+tID.name+'</span></div>';
		displayObj.output += addControlBox(tagLabel, displayObj.treeTop, isItemMarked(tID.is_checked,'checked')) + '</dt>';
		displayObj.output += '<dl class="lv-'+displayObj.tLvl+' '+tagLabel+'" id="" tLvl="'+displayObj.tLvl+'">';
		displayObj.tLvl++; //start the tree at lv-1
		return displayObj;
	},
	parseTreeAjax: function(tID, displayObj){
		var treeData = callTree.parseJsonInsides(tID, displayObj);
		BBTree.parsedJsonData[tID.id] = {'name':tID.name, 'data':treeData};
	},
	parseJsonInsides: function(tID, displayObj){
		cj.each(tID.children, function(i, cID){//runs all first level
			callTree.writeTagLabel(cID, displayObj);
			if(cID.children.length > 0)
			{
				callTree.writeJsonTag(cID, displayObj);
			}
		});
		return(displayObj.output);	
	},
	writeJsonTag: function(tID, displayObj){//in second level & beyond
		callTree.openChildJsonTag(tID, displayObj);
		cj.each(tID.children, function(i, cID){
			callTree.writeTagLabel(cID, displayObj, tID.id);
			if(cID.children.length > 0)
			{
				callTree.writeJsonTag(cID, displayObj);
			}
		});
		callTree.closeChildJsonTag(tID, displayObj);
	},
	writeTagLabel: function(cID, displayObj, parentTag){
		if(typeof parentTag === 'undefined')
		{
			parentTag = callTree.currentSettings.displaySettings.currentTree;
		}
		var tagLabel = addTagLabel(cID.id);
		displayObj.output += '<dt class="lv-'+displayObj.tLvl+' '+isItemMarked(cID.is_reserved,'isReserved')+'" id="'+tagLabel+'" description="'+cID.description+'" tLvl="'+displayObj.tLvl+'" tid="'+cID.id+'" parent="'+parentTag+'"><div class="ddControl '+ isItemChildless(cID.children.length) + '"></div><div class="tag"><span class="name">'+cID.name+'</span></div>'+addEntityCount(cID.entity_count) + addControlBox(tagLabel, displayObj.treeTop, isItemMarked(cID.is_checked,'checked'))  + '</dt>';
		//'/*+isItemChildless(cID.children.length)+*/
	},
	writeTagContainer: function(tID,displayObj){
		var tagLabel = addTagLabel(tID.id);
		displayObj.output += '<dl class="lv-'+displayObj.tLvl+'" id="'+tagLabel+'" tLvl="'+displayObj.tLvl+'" >';
	},
	openChildJsonTag: function(tID, displayObj){
		callTree.writeTagContainer(tID, displayObj);
		displayObj.tLvl++;
	},
	closeChildJsonTag: function(tID, displayObj){
		displayObj.tLvl--;
		displayObj.output += '</dl>';
	},
	buildBoxes: function() //reads from currentSettings to make the boxes to put lists in
	{
		cj.each(callTree.currentSettings.displaySettings.writeSets, function(i, className){
			var treeBox = '<div class="'+ callTree.currentSettings.pageSettings.tagHolder +' '+ callTree.currentSettings.displaySettings.treeTypeSet.toLowerCase() + ' ';
			if(className != callTree.currentSettings.displaySettings.treeCodeSet) //hide all boxes that aren't 'default' 
			{
				treeBox += 'hidden ';
			}
			else { //or else we give it the 'loading' treatment
				treeBox += 'loadingGif '; 
			}
			treeBox += addTagLabel(className);
			treeBox += '" id="'+addTagLabel(className)+'"></div>';
			cj(callTree.currentSettings.pageSettings.wrapper).append(treeBox);
		});	
	},
	writeParsedData: function()//write the tree to the CORRECT div
	{
		callTree.writeTabs();
		cj.each(callTree.currentSettings.displaySettings.writeSets, function(i, className){
			var treeTarget = callTree.currentSettings.pageSettings.wrapper + ' ';
			treeTarget += '.'+ callTree.currentSettings.pageSettings.tagHolder;
			treeTarget += '.'+ callTree.currentSettings.displaySettings.treeTypeSet.toLowerCase();
			treeTarget += '.'+ addTagLabel(className);
			cj(treeTarget).append(BBTree.parsedJsonData[className].data);
		});
	},
	writeTabs: function()
	{
		//need to figure out how to 
		if(cj('.crm-tagTabHeader ul li').length > 0)
		{
			cj('.crm-tagTabHeader ul').html('');
		}
		cj.each(callTree.currentSettings.displaySettings.writeSets, function(i, className){
			var tabInfo = {id: callTree.currentSettings.displaySettings.writeSets[i], name: BBTree.parsedJsonData[callTree.currentSettings.displaySettings.writeSets[i]].name, position: i, length: callTree.currentSettings.displaySettings.writeSets.length, isActive: ''};

			if(className == callTree.currentSettings.displaySettings.treeCodeSet) //hide all boxes that aren't 
			{
				tabInfo.isActive = 'active';
			}
			var tabHTML = '<li class="tab '+ tabInfo.isActive+ '" id="' +addTagLabel(tabInfo.id) + '" onclick="callTree.swapTrees(this);return false;">'+tabInfo.name+'</li>';
			cj('.crm-tagTabHeader ul').append(tabHTML);
		});
		
	},
	slideDownTree: function()
	{
		cj(BBTree.treeLoc + ' dt .treeButton').unbind('click');
		cj(BBTree.treeLoc + ' dt .treeButton').click(function() {
			var tagLabel = cj(this).parent().attr('id');
			var isOpen = cj(BBTree.treeLoc+ ' dl#'+tagLabel).hasClass('open');
			switch(isOpen)
			{
				case true:
					cj(BBTree.treeLoc + ' dt#'+tagLabel+' div').removeClass('open');
					cj(BBTree.treeLoc + ' dl#'+tagLabel).slideUp('200', function() {
						cj(BBTree.treeLoc + ' dl#'+tagLabel).removeClass('open');
					});
				break;
				case false:
					cj(BBTree.treeLoc + ' dt#'+tagLabel+' div').addClass('open');
					cj(BBTree.treeLoc + ' dl#'+tagLabel).slideDown('200', function() {
						cj(BBTree.treeLoc + ' dl#'+tagLabel).addClass('open');
					});
				break;
			}
		});
	},
	swapTrees: function(tab)
	{
		var currentTree = addTagLabel(callTree.currentSettings.displaySettings.treeCodeSet);
		var getTab = cj(tab).attr('id');
		if(currentTree != getTab){
			cj(BBTree.treeLoc +'#' + currentTree).addClass('hidden');
			//cj('.BBtree.edit#' + currentTree).children().hide();
			cj('.crm-tagTabHeader li.tab#' + getTab).addClass('active');
			cj('.crm-tagTabHeader li.tab#' + currentTree).removeClass('active');
			cj(BBTree.treeLoc +'#' + getTab).removeClass('hidden');
			callTree.currentSettings.displaySettings.treeCodeSet = [removeTagLabel(getTab)];
			callTree.currentSettings.displaySettings.currentTree = removeTagLabel(getTab);
		}
	}
	//still need a reload tree option.
	//make sure to capture which ones are 'open'
	//write a different addControlBox function that functions based on the parameters sent
};
var BBTreeEdit = {
	setTagInfo: function()
	{
		cj(BBTree.treeLoc+' dt').unbind('mouseenter mouseleave');
		cj(BBTree.treeLoc+' dt').hover(
		function(){
			if(cj(this).attr('id') != 'tagLabel_291' && cj(this).attr('id') != 'tagLabel_296' )
			{ 
				var tagCount = ' ';
				tagCount += cj('span.entityCount', this).html().match(/[0-9]+/);
				if(tagCount == ' ' +null)
				{
					tagCount = cj('span.entityCount', this).html();
				}
			}
			var tagName = cj('div.tag', this).html();
			var tagId = cj(this).attr('tid');
			var isReserved = 'False';
			if(cj(this).hasClass('isReserved') == true)
			{
				isReserved = 'True';
			}
			cj('.crm-tagListInfo .tagInfoBody .tagName span').html(tagName);
			cj('.crm-tagListInfo .tagInfoBody .tagId span').html(tagId);
			cj('.crm-tagListInfo .tagInfoBody .tagDescription span').html(cj(this).attr('description'));
			cj('.crm-tagListInfo .tagInfoBody .tagReserved span').html(isReserved);
			cj('.crm-tagListInfo .tagInfoBody .tagCount span').html(tagCount);
		}, 
		function() {
			cj('.crm-tagListInfo .tagInfoBody .tagName span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagID span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagDescription span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagReserved span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagCount span').html('');
		});
	}
}
var BBTreeTag = {
	getContactTags: function()
	{
		var pageCID = {entity_id : getPageCID()};
		if(typeof BBTree.contactTagData === 'undefined')
		{
			BBTree.contactTagData = {};
		}
		cj.extend(true, callTree.currentSettings.callSettings.ajaxSettings,pageCID); //overwrites CID if page is different. Check Add Contact?
		cj.ajax({
			url: '/civicrm/ajax/entity_tag/get',
			data: {
				entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
				entity_id: callTree.currentSettings.callSettings.ajaxSettings.entity_id,
				call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri
			},
			dataType: 'json',
			success: function(data, status, XMLHttpRequest) {
				if(data.code != 1 ) {
					alert('Error');
				}
				else{
					BBTree.contactTagData['cid_'+pageCID.entity_id] = data.message;
					BBTreeTag.applyContactTags();
				}
			}
		});
	},
	applyContactTags: function()
	{
		cj.each(BBTree.contactTagData['cid_'+callTree.currentSettings.callSettings.ajaxSettings.entity_id], function(i, tag){
			cj(BBTree.treeLoc + ' dt#'+addTagLabel(tag)+' .checkbox').attr('checked','true').addClass('checked');
			cj(BBTree.treeLoc + ' dt#'+addTagLabel(tag)).addClass('checked');
			BBTreeTag.tagInheritanceFlag(addTagLabel(tag), 'add');
		});
	},
	removeContactTags: function()
	{
		cj(BBTree.treeLoc + ' .checkbox').removeAttr('checked');
	},
	checkRemoveAdd: function(tagLabel) { //adds and removes the checkbox data
		var n = cj(BBTree.treeLoc + ' dt#'+ tagLabel).hasClass('checked');
		if(n == false)
		{	
			cj.ajax({
				url: '/civicrm/ajax/entity_tag/create',
				data: {
					entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
					entity_id: callTree.currentSettings.callSettings.ajaxSettings.entity_id,
					call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri,
					tag_id: removeTagLabel(tagLabel)
				},
				dataType: 'json',
				success: function(data, status, XMLHttpRequest) {
					if(data.code != 1) {alert('fails');}
					else {
						cj(BBTree.treeLoc+' dt#'+tagLabel).addClass('checked');
						BBTreeTag.tagInheritanceFlag(tagLabel, 'add');
					}
				}
			});
				
		} else {
			cj.ajax({
				url: '/civicrm/ajax/entity_tag/delete',
				data: {
					entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
					entity_id: callTree.currentSettings.callSettings.ajaxSettings.entity_id,
					call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri,
					tag_id: removeTagLabel(tagLabel)
				},
				dataType: 'json',
				success: function(data, status, XMLHttpRequest) {
					if(data.code != 1) {alert('fails');}
					else{
						BBTreeTag.tagInheritanceFlag(tagLabel, 'remove');
						updateViewContactPage(tagLabel);
					}
				}
			});
		}
	},
	tagInheritanceFlag: function(tagLabel, toggle) //adds or removes inheritance toggle: add/remove/clear
	{
		var jq_tagLabelDT = cj(BBTree.treeLoc + ' dt#' + tagLabel);
		if(toggle == 'add') //adds subchecked in one big jq string
		{ 
			jq_tagLabelDT.parents('dl').not('.lv-0').prev('dt').addClass('subChecked');
		}
		if(toggle == 'remove') //remove subchecked 
		{ 
			jq_tagLabelDT.removeClass('checked');
			var checkChildren = cj(BBTree.treeLoc+' dl#'+tagLabel).children('dt.checked').length + cj(BBTree.treeLoc+' dl#'+tagLabel).children('dt.subChecked').length;
			if(checkChildren > 0) // if children are checked, don't remove anything above
			{
				jq_tagLabelDT.removeClass('checked').addClass('subChecked');
				return false;
			}
			var checkSiblings = jq_tagLabelDT.siblings('.checked').length + jq_tagLabelDT.children('.subChecked').length;
			if(checkSiblings > 0) // if it has checked siblings, you shouldn't remove anything above
			{
				jq_tagLabelDT.removeClass('checked').removeClass('subChecked');
				return false;
			}
			var getParents = jq_tagLabelDT.parents('dl').not('.lv-0');
			cj.each(getParents, function(i, parents) // if everything below and aside is ok, go up!
			{
				var parentID = cj(parents).attr('id');
				var jq_tagLabelParentDT = cj(BBTree.treeLoc + ' dt#'+parentID);
				var jq_tagLabelParentDL = cj(BBTree.treeLoc + ' dl#'+parentID);
				if(jq_tagLabelParentDT.hasClass('checked')){ //if the parent is checked
					jq_tagLabelParentDT.removeClass('subChecked');
					return false;
				}
				var getSibLength = jq_tagLabelParentDT.siblings('.checked').length + jq_tagLabelParentDT.siblings('.subChecked').length;
				if(getSibLength > 0 ){ //if the parent's siblings are checked/subchecked
					var hasSibNoChildren = jq_tagLabelParentDL.children('dt.checked').length + jq_tagLabelParentDL.children('dt.subChecked').length 
					if(hasSibNoChildren == 0)
					{
						jq_tagLabelParentDT.removeClass('subChecked');
					}
					return false;
				}
				jq_tagLabelParentDT.removeClass('subChecked');
			});
		}
	}
}
function getMaxID(){
	var idarray = cj('dt', callTree.currentSettings.pageSettings.wrapper + ' .' + callTree.currentSettings.pageSettings.tagHolder);
	var passarray = [];
	cj.each(idarray, function(i, v){
		passarray[i] = cj(v).attr('tid');
	});
	callTree.currentSettings.pageSettings.tagIdMax = Math.max.apply( Math, passarray );
	return callTree.currentSettings.pageSettings.tagIdMax;
}
var BBTreeModal = {
	defaultSettings: {
		closeOnEscape: true,
		draggable: true,
		height: 300,
		width: 300,
		modal: true, 
		bgiframe: true,
		overlay: { 
			opacity: 0.2, 
			background: "black" 
		},
		close: function() {
			callTree.currentSettings.displaySettings.currentTree = removeTagLabel(cj('.crm-tagTabHeader li.tab.active').attr('id'));
			if(callTree.currentSettings.displaySettings.treeTypeSet == 'modal')
			{
				callTree.currentSettings.displaySettings.treeTypeSet = callTree.currentSettings.displaySettings.previousTree.toLowerCase();
				callTree.currentSettings.displaySettings.previousTree = 'modal';
			}
			if(typeof BBTreeModal.modalParsedData[callTree.currentSettings.displaySettings.currentTree] !== 'undefined') //TODO
			{
				cj(BBTreeModal.taggedID, BBTreeModal.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).show();
			}
			setTreeLoc();
			cj(this).html('');
		}, 
		buttons: {
			"Cancel": function() { 
				cj(this).dialog("close"); 
				cj(this).dialog("destroy"); 
			}
		} 
	},
	modalParsedData: {

	},
	resetCurrentSettings: function(){
		this['currentSettings'] = {};
		cj.extend(this.currentSettings, this.defaultSettings);
	},
	tagInfo: function(obj, tagLabel){
		var jq_tagLabelDT = cj(BBTree.treeLoc + ' dt#' + tagLabel);
		var jq_tagLabelDL = cj(BBTree.treeLoc + ' dl#' + tagLabel);
		this.taggedObject = obj;
		this.taggedMethod = cj(obj).attr('do');
		this.taggedReserved = jq_tagLabelDT.hasClass('isReserved');
		this.taggedID = tagLabel;
		this.taggedName = jq_tagLabelDT.find('.tag .name').html();
		if(jq_tagLabelDT.attr('description') != 'null')
		{
			this.taggedDescription = jq_tagLabelDT.attr('description');
		}
		else{
			this.taggedDescription = '';
		}
		this.taggedChildren = jq_tagLabelDL.find('dl, dt').length;
		this.tlvl = jq_tagLabelDT.attr('tlvl');
		this.taggedParent = addTagLabel(jq_tagLabelDT.attr('parent'));
		this.taggedDialog = BBTreeModal.addDialogInfo();
		this.applyHtml(this.taggedDialog);
		
		// //make this into a subfunction to find proper greeting name if not reserved
		
		// cj('#dialog input:[name=tagName]').focus();

	},
	setTreeType: function() // sets previous tree
	{
		if(callTree.currentSettings.displaySettings.treeTypeSet != 'modal')
		{
			callTree.currentSettings.displaySettings['previousTree'] = callTree.currentSettings.displaySettings.treeTypeSet;
		}	
		callTree.currentSettings.displaySettings.treeTypeSet = 'modal';
		setTreeLoc();
	},
	addModalTagTree: function() // modal needs to add a tree
	{
		if(this.taggedReserved){
			this.resetCurrentSettings();
		}
		else{
			this.currentSettings.getTree = {};
			this.currentSettings.getTree = true;
			this.currentSettings.height = 500;
			this.currentSettings.width = 600;
			return '<div class="' + callTree.currentSettings.pageSettings.tagHolder + ' modal '+ addTagLabel(callTree.currentSettings.displaySettings.currentTree) + '" id="'+addTagLabel(callTree.currentSettings.displaySettings.currentTree)+'_modal"></div>';
		}
	},
	getModalTagTree: function() //on open, so it all loads asynch
	{
		BBTreeModal.setTreeType();
		if(typeof this.modalParsedData[callTree.currentSettings.displaySettings.currentTree] === 'undefined')
		{	
			this.modalParsedData[callTree.currentSettings.displaySettings.currentTree] = cj(BBTree.parsedJsonData[callTree.currentSettings.displaySettings.currentTree].data).clone(true, true);
			cj('span.fCB', this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).empty().html('<input type="radio" class="selectRadio" name="selectTag"/>');
			cj('#'+this.taggedID, this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).hide();
			cj('.fCB', BBTreeModal.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).parent('.lv-0').children('span.fCB').html('');
			cj(this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).html();
			cj('#'+addTagLabel(callTree.currentSettings.displaySettings.currentTree)+'_modal').html(this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]);
			this.radioButtonAction();
		}
		else
		{
			cj('#'+addTagLabel(callTree.currentSettings.displaySettings.currentTree)+'_modal').html(this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]);
			this.radioButtonAction();
		}
	},
	radioButtonAction: function(){
		switch(BBTreeModal.taggedMethod){
			case 'convert':
			case 'move':
				cj('.BBTree.modal dt.lv-0 span.fCB').html('<input type="radio" class="selectRadio" name="selectTag"/>');
				break;
		}
		cj(BBTree.treeLoc + ' input.selectRadio, '+ BBTree.treeLoc + ' div.tag').unbind('click');
		cj(BBTree.treeLoc + ' input.selectRadio, '+ BBTree.treeLoc + ' div.tag').click(function(){
			BBTreeModal['radioSelectedTid'] = cj(this).parent('.fCB').parent('dt').attr('tid');
			switch(BBTreeModal.taggedMethod) //sets both open
			{
				case 'convert': BBTreeModal.convertTag.runFunction(); break;
				case 'merge':
				case 'mergeKW': BBTreeModal.mergeTag.runFunction(); break;
				case 'move': BBTreeModal.moveTag.runFunction(); break;
				default: alert('Invalid RBA Modifier'); break;
			}
		});
		callTree.slideDownTree();
	},
	addDialogInfo: function() //writes what's in the modal
	{
		var addDialogText = '';
		switch(this.taggedMethod)
		{
			case 'add':
				addDialogText += '<div class="modalHeader">Add new tag under ' + this.taggedName + '</div>';
				addDialogText += '<div class="modalInputs">';
				addDialogText += '<div><span>Tag Name:</span ><input type="text" name="tagName" /></div>';
				addDialogText += '<div><span>Description:</span ><input type="text" name="tagDescription" /></div>';
				addDialogText += '<div><span>Reserved:</span><input type="checkbox" name="isReserved"/></div>';
				addDialogText += '</div>';
				this.taggedReserved = false;
				this.currentSettings['actionName'] = 'added';
				this.currentSettings['title'] = 'Add New Tag';
				break;
			case 'remove':
				addDialogText += '<div class="modalHeader">Remove Tag: <span class="parentName" id="'+this.taggedID+'">' + this.taggedName + '</span></div>';
				this.currentSettings['actionName'] = 'removed';
				this.currentSettings['title'] = 'Remove Tag';
				break;
			case 'move':
				addDialogText += '<div class="modalHeader">Move <span id="modalNameTid" tID="'+this.taggedID+'">' + this.taggedName + ' under Tag...</span></div>';
				addDialogText += this.addModalTagTree();
				this.currentSettings['actionName'] = 'moved';
				this.currentSettings['title'] = 'Move Tag';
				break;
			case 'merge':
			case 'mergeKW':
				addDialogText += '<div class="modalHeader">Merge <span id="modalNameTid" tID="'+this.taggedID+'">' + this.taggedName + '</span> into Selected Tag... (note: this is a slow process)</div>'; 
				addDialogText += this.addModalTagTree();
				this.currentSettings['actionName'] = 'merged';
				this.currentSettings['title'] = 'Merge Tag';
				break;
			case 'update':
				addDialogText += '<div class="modalHeader">Update Tag <span class="parentName" id="'+this.taggedID+'">' + this.taggedName + '</span></div>';
				addDialogText += '<div class="modalInputs">';
				addDialogText += '<div><span>Tag Name:</span ><input type="text" name="tagName" value="'+this.taggedName+'" /></div>';
				addDialogText += '<div><span>Description:</span ><input type="text" name="tagDescription" value="'+this.taggedDescription+'" /></div>';
				addDialogText += '<div><span>Reserved:</span><input type="checkbox" name="isReserved" '
				if(this.taggedReserved){addDialogText += "checked";}
				addDialogText +='/></div>';
				addDialogText += '</div>'; 
				this.taggedReserved = false;
				this.currentSettings['title'] = 'Update Tag';
				break;
			case 'convert': 
				if(callTree.currentSettings.displaySettings.currentTree == 296)
				{
					callTree.currentSettings.displaySettings.currentTree = 291;
				}
				else{
					callTree.currentSettings.displaySettings.currentTree = 296;
				}
				addDialogText += '<div class="modalHeader">Convert <span id="modalNameTid" tID="'+this.taggedID+'">' + this.taggedName + '</span> into a Issue Code under...</div>'; 
				addDialogText += this.addModalTagTree();
				this.currentSettings['actionName'] = 'converted';
				this.currentSettings['title'] = 'Convert Keyword to Tag';
				break;
		}
		if(this.taggedReserved){
			addDialogText = this.taggedName + ' is reserved and cannot be ' + this.currentSettings.actionName + '. <br /> <br /> Try updating tag first.';			
		}
		return addDialogText;
	},
	makeModalInit: function(){ //creates the dialog box to make and move
		cj('body').append('<div id="BBDialog"></div>');
	},
	makeModal: function(obj, tagLabel){ //sorts and separates & should read settings
		this.resetCurrentSettings();
		BBTreeModal.tagInfo(obj, tagLabel);
		switch(this.taggedMethod) //sets both open
		{
			case 'convert': BBTreeModal.defaultSettings['open'] = BBTreeModal.convertTag.setOpen(); break;
			case 'mergeKW':
			case 'merge': BBTreeModal.defaultSettings['open'] = BBTreeModal.mergeTag.setOpen();break;
			case 'update': BBTreeModal.defaultSettings['open'] = BBTreeModal.updateTag.setOpen(); break;
			case 'move': BBTreeModal.defaultSettings['open'] = BBTreeModal.moveTag.setOpen(); break;
			case 'remove': BBTreeModal.defaultSettings['open'] = BBTreeModal.removeTag.setOpen(); break;
			case 'add': BBTreeModal.defaultSettings['open'] = BBTreeModal.addTag.setOpen(); break;
			default: alert('Invalid Modifier'); break;
		}
		this.makeModalBox();
	},
	applyHtml: function(data){
		cj('#BBDialog').append(data);
	},
	makeModalBox: function(){
		cj("#BBDialog").show();
		cj("#BBDialog").dialog(this.currentSettings);
		switch(this.taggedMethod) //sets both open
		{
			case 'update': BBTreeModal.updateTag.runFunction(); break;
			case 'remove': BBTreeModal.removeTag.runFunction(); break;
			case 'add': BBTreeModal.addTag.runFunction(); break;
			default: break;
		}
	},
	convertTag: {
		setOpen: function(){
			BBTreeModal.getModalTagTree();
		},
		runFunction: function(){
			console.log(BBTreeModal.radioSelectedTid);
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function() {
					modalLoadingGif('add');
					tagMove = new Object();
					tagMove.currentId = removeTagLabel(BBTreeModal.taggedID);
					cj.ajax({
						url: '/civicrm/ajax/tag/update',
						data: {
							id: tagMove.currentId,
							parent_id: BBTreeModal.radioSelectedTid,
							call_uri: window.location.href
						},
						dataType: 'json',
						success: function(data, status, XMLHttpRequest) {
							if(data.code != 1)
							{
								alert(data.message);
								modalLoadingGif('remove');
							}
							else
							{
								cj('#BBDialog').dialog('close');
								cj('#BBDialog').dialog('destroy');
								BBTreeModal.convertTag.moveKW(data.message);
								callTree.swapTrees(cj('li#tagLabel_'+callTree.currentSettings.displaySettings.currentTree));
							}
						}
					});
				}
			},	
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		},
		moveKW: function(data){ //removes from kw and appends to issue codes
			var parentId = addTagLabel(BBTreeModal.radioSelectedTid);
			var toMove = cj('dt#'+addTagLabel(data.id));
			if(cj('dt#'+parentId+' .ddControl').hasClass('treeButton') == false)
			{
				cj('dt#'+parentId+' .ddControl').addClass('treeButton');
			}
			if(cj('dl#'+parentId).length != 0 && BBTreeModal.radioSelectedTid != 291)
			{
				cj('dl#'+parentId).append(toMove);
			}
			else if(BBTreeModal.radioSelectedTid != 291){
				var toAddDL = '<dl class="lv-' + cj('dt#'+parentId).attr('tlvl') + ' ' + parentId+'" id="' + parentId + '" tlvl="'+cj('dt#'+parentId).attr('tlvl')+'"></dl>';
				cj('dt#'+parentId).after(toAddDL);
				cj('dl#'+parentId).append(toMove);
			}
			else if(BBTreeModal.radioSelectedTid == 291){
				cj('dl.'+parentId).prepend(toMove);
			}
			callTree.slideDownTree();
			BBTreeEdit.setTagInfo();
		}

	},
	mergeTag: {
		setOpen: function(){
			BBTreeModal.getModalTagTree();
		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
				{
					text: "Merge ",
					click: function() {
						tagMerge = new Object();
						modalLoadingGif('add');
						tagMerge.currentId = removeTagLabel(BBTreeModal.taggedID);
						tagMerge.destinationId = BBTreeModal.radioSelectedTid;
						var postUrl = '/civicrm/ajax/mergeTags';
		 				var data    = 'fromId='+ tagMerge.currentId + '&toId='+ tagMerge.destinationId;
		 				var tidMatch = false;
						if(BBTreeModal.taggedChildren > 0)
						{
							tidMatch = true;
						}
			 			//console.log(tidMatch);
						if(tidMatch == false)
						{	
							cj.ajax({
								type: "POST",
								url: postUrl,
								data: data,
								dataType: 'json',
								success: function(data, status, XMLHttpRequest) {
									if ( data.status == true ) {
										cj("#BBDialog").dialog("close"); 
										cj("#BBDialog").dialog("destroy"); 
										if(cj('.contactTagsList.help').length < 1)
										{
											cj('.crm-content-block #help').after('<div class="contactTagsList help" id="tagStatusBar"></div>');
										}
										var toIdTag = cj('#tagLabel_' + tagMerge.destinationId + ' .tag .name').html();
										var msg = "<ul style=\"margin: 0 1.5em\"><li>'" + BBTreeModal.taggedName + "' has been merged with '" + toIdTag + "'. All records previously tagged with '" + BBTreeModal.taggedName + "' are now tagged with '" + toIdTag + "'.</li></ul>";
										cj('#tagStatusBar').html(msg);
										console.log(tagMerge.currentId);
										BBTreeModal.removeTag.removeInline(tagMerge.currentId);
									}
									else
									{
										modalLoadingGif('remove');
									}
									
								}	
							});
						}
						else {
							alert("Cannot merge a parent tag into another tag. Try moving sub-tags into the parent you want to merge into and then merge the tag into the destination");
							modalLoadingGif('remove');
						}

					}
				},
				{
					text: "Cancel",
					click: function() { 
						cj(this).dialog("close"); 
						cj(this).dialog("destroy"); 
					}
				}
			]);
		}
	},
	updateTag: {
		setOpen: function(){

		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function () {
					modalLoadingGif('add');
					tagUpdate = new Object();
					tagUpdate.tagName = cj('#BBDialog .modalInputs input:[name=tagName]').val();
					tagUpdate.tagDescription = cj('#BBDialog .modalInputs input:[name=tagDescription]').val();
					tagUpdate.parentId = removeTagLabel(BBTreeModal.taggedID);
					tagUpdate.isReserved = cj('#BBDialog .modalInputs input:checked[name=isReserved]').length;
					cj.ajax({
						url: '/civicrm/ajax/tag/update',
						data: {
							name: tagUpdate.tagName,
							description: tagUpdate.tagDescription,
							id: tagUpdate.parentId,
							is_reserved: tagUpdate.isReserved,
							call_uri: window.location.href	
						},
						dataType: 'json',
						success: function(data, status, XMLHttpRequest) {
							if(data.code != 1)
							{
								alert(data.message);
								modalLoadingGif('remove');
							}
							else
							{
								cj('#BBDialog').dialog('close');
								cj('#BBDialog').dialog('destroy');
								BBTreeModal.updateTag.updateInline(data.message);
							}
						}
					});
				}
			},	
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		},
		updateInline: function(data){ // adds an element inline with all the fixins
			var target = cj('dt#'+addTagLabel(data.id));
			if(data.is_reserved != 0)
			{
				target.addClass('isReserved');
			}
			else{
				target.removeClass('isReserved');
			}
			target.attr('description', data.description);
			cj('.tag .name', target).html(data.name);
			callTree.slideDownTree();
		}
	},
	moveTag:  {
		setOpen: function(){
			BBTreeModal.getModalTagTree();
		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function() {
					modalLoadingGif('add');
					tagMove = new Object();
					tagMove.currentId = removeTagLabel(BBTreeModal.taggedID);
					if(BBTreeModal.taggedChildren == 0)
					{
						cj.ajax({
							url: '/civicrm/ajax/tag/update',
							data: {
								id: tagMove.currentId,
								parent_id: BBTreeModal.radioSelectedTid,
								call_uri: window.location.href
							},
							dataType: 'json',
							success: function(data, status, XMLHttpRequest) {
								if(data.code != 1)
								{
									alert(data.message);
									modalLoadingGif('remove');
								}
								else
								{
									cj('#BBDialog').dialog('close');
									cj('#BBDialog').dialog('destroy');
									BBTreeModal.convertTag.moveKW(data.message);
									callTree.swapTrees(cj('li#tagLabel_'+callTree.currentSettings.displaySettings.currentTree));
								}
							}
						});
					} else {
						alert("Cannot move a parent tag. Try deleting subtags before deleting parent tag.");
						modalLoadingGif('remove');
					}
				}
			},	
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		}
	},
	removeTag:  {
		setOpen: function(){

		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function() {
					tagRemove = new Object();
					tagRemove.parentId = removeTagLabel(BBTreeModal.taggedID);
					modalLoadingGif('add');
					if(BBTreeModal.taggedChildren == 0)
					{
							cj.ajax({
							url: '/civicrm/ajax/tag/delete',
							data: {
								id: tagRemove.parentId,
								call_uri: window.location.href
							},
							dataType: 'json',
							success: function(data, status, XMLHttpRequest) {
								if(data.code != 1)
								{
									if(data.message == 'DB Error: constraint violation')
									{
										alert('Error: Child Tag Exists');
									}
									else { alert(data.message); }
									modalLoadingGif('remove');
								}
								else
								{	
									cj('#BBDialog').dialog('close');
									cj('#BBDialog').dialog('destroy');
									BBTreeModal.removeTag.removeInline(tagRemove.parentId);
								}
							}
						});
					} else {
						alert("Cannot remove a parent tag. Try deleting subtags before deleting parent tag.");
						modalLoadingGif('remove');
					}

				}
			},
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		},
		removeInline: function(parentId){
			cj('dt#'+addTagLabel(parentId)).remove();
			if(cj('dl#'+BBTreeModal.taggedParent).children().length == 0)
			{
				cj('dl#'+BBTreeModal.taggedParent).remove();
				cj('dt#'+BBTreeModal.taggedParent+' .ddControl').removeClass('treeButton').removeClass('open');
			}
			
		}
	},
	addTag:  {
		setOpen: function(){

		},
		runFunction: function(){
			cj('#BBDialog input:[name=tagName]').focus();
			cj("#BBDialog").dialog( "option", "buttons", 
			[
				{
					text: "Done",
					click: function() {
						tagCreate = new Object();
						tagCreate.tagDescription = '';
						modalLoadingGif('add');
						tagCreate.tagName = cj('#BBDialog .modalInputs input:[name=tagName]').val();
						tagCreate.tagDescription = cj('#BBDialog .modalInputs input:[name=tagDescription]').val();
						tagCreate.parentId = removeTagLabel(BBTreeModal.taggedID);
						tagCreate.isReserved = cj('#BBDialog .modalInputs input:checked[name=isReserved]').length;
						cj.ajax({
							url: '/civicrm/ajax/tag/create',
							data: {
								name: tagCreate.tagName,
								description: tagCreate.tagDescription,
								parent_id: tagCreate.parentId,
								is_reserved: tagCreate.isReserved,
								call_uri: window.location.href	
							},
							dataType: 'json',
							success: function(data, status, XMLHttpRequest) {
								if(data.code != 1)
								{
									alert(data.message);
									modalLoadingGif('remove');
								}
								else
								{
									cj('#BBDialog').dialog('close');
									cj('#BBDialog').dialog('destroy');
									BBTreeModal.addTag.createAddInline(data.message);
								}
							}
						});
					}
				},
				{
					text: "Cancel",
					click: function() { 
						cj(this).dialog("close"); 
						cj(this).dialog("destroy"); 
					}
				}
			]);
		},
		createAddInline: function(data){ // adds an element inline with all the fixins
			if(data.parent_id == 291)
			{
				var tlvl = parseFloat(BBTreeModal.tlvl);
				tlvl++;
				if(cj('dt#'+BBTreeModal.taggedID+' .ddControl').hasClass('treeButton') == false)
				{
					cj('dt#'+BBTreeModal.taggedID+' .ddControl').addClass('treeButton');
				}
				var toAddDT = '<dt class="lv-' + tlvl + ' ';
				if(data.is_reserved != null)
				{
					toAddDT += 'isReserved';
				}
				toAddDT += '" id="tagLabel_'+data.id+'" description="'+data.description+'" tlvl="'+tlvl +'" tid="'+data.id+'" parent="'+removeTagLabel(BBTreeModal.taggedID)+'"><div class="ddControl"></div><div class="tag"><span class="name">'+data.name+'</span></div><span class="entityCount" style="display:none">Unknown</span><span class="fCB">'+addControlBox(addTagLabel(data.id), callTree.currentSettings.displaySettings.currentTree )+'</dt>';
				if(cj('dl#'+BBTreeModal.taggedID).length != 0)
				{
					cj('dl#'+BBTreeModal.taggedID).append(toAddDT);
				}
				else{
					var toAddDL = '<dl class="lv-' + tlvl + ' tagLabel_' + removeTagLabel(BBTreeModal.taggedID)+'" id="tagLabel_' + removeTagLabel(BBTreeModal.taggedID) + '" tlvl="'+tlvl+'"></dl>';
					cj('dt#'+BBTreeModal.taggedID).after(toAddDL);
					cj('dl#'+BBTreeModal.taggedID).append(toAddDT);
				}
				callTree.slideDownTree();
				BBTreeEdit.setTagInfo();
			}
			if(data.parent_id == 296)
			{
				console.log('296')
				var tlvl = parseFloat(BBTreeModal.tlvl);
				var toAddDT = '<dt class="lv-1 ';
				if(data.is_reserved != null)
				{
					toAddDT += 'isReserved';
				}
				toAddDT += '" id="tagLabel_'+data.id+'" description="'+data.description+'" tlvl="1" tid="'+data.id+'" parent="'+removeTagLabel(BBTreeModal.taggedID)+'"><div class="ddControl"></div><div class="tag"><span class="name">'+data.name+'</span></div><span class="entityCount" style="display:none">Unknown</span><span class="fCB">'+addControlBox(addTagLabel(data.id), callTree.currentSettings.displaySettings.currentTree )+'</dt>';
				cj('dl.tagLabel_296').prepend(toAddDT);
				callTree.slideDownTree();
				BBTreeEdit.setTagInfo();
			}
		}
	}
}

//finds Page CID
function getPageCID()
{
	var cid = 0 ;
	var cidpre = /cid=\d*/.exec(document.location.search);
	var cidsplit = /\d.*/.exec(cidpre);
	if(cidsplit)
	{
		cid = cidsplit[0];
	}
	return cid;
}
function addTagLabel(tag)
{
	return 'tagLabel_' + tag;
}
function removeTagLabel(tag)
{
	return tag.replace('tagLabel_', '');
}
//checks to see if the user can add or remove tags
function getUserEditLevel()
{
	cj.ajax({
		url: '/civicrm/ajax/entity_tag/checkUserLevel/',
		data: {
			call_uri: window.location.href
		},
		dataType: 'json',
		success: function(data, status, XMLHttpRequest) {
			return data.code; //true = can use
		}
	});
}
//marks item as checked or reserved
function isItemMarked(value, type)
{
	if(value == true)
	{
		return(type);
	}
	else {
		return '';
	}
}
//if has children, return either arrow or nothing
function isItemChildless(childLength)
{
	if(childLength > 0)
	{
		return('treeButton');
	}
	else
	{
		return '';
	}
}
//add Entity Span
function addEntityCount(count)
{
	if(callTree.currentSettings.callSettings.ajaxSettings.entity_counts != 0)
	{
		var add = '<span class="entityCount">('+count+')</span>';
		return add;
	}
	else{
		var add = '<span class="entityCount" style="display:none">Unknown</span>';
		return add;
	}
}
//adds Control Box
function addControlBox(tagLabel, treeTop, isChecked) { //should break this up 
	var floatControlBox;
	if(callTree.currentSettings.displaySettings.treeTypeSet == 'edit')
	{
		floatControlBox = '<span class="fCB">';
		floatControlBox += '<ul>';
		if(291 == callTree.currentSettings.displaySettings.currentTree)
		{
			floatControlBox += '<li class="addTag" title="Add New Tag" do="add" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="removeTag" title="Remove Tag" do="remove" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="moveTag" title="Move Tag" do="move" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="updateTag" title="Update Tag" do="update" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="mergeTag" title="Merge Tag" do="merge" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
		}
		if(296 == callTree.currentSettings.displaySettings.currentTree)
		{
			floatControlBox += '<li class="removeTag" title="Remove Keyword" do="remove" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="updateTag" title="Update Keyword" do="update"  onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="mergeTag" title="Merge Keyword" do="mergeKW" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="convertTag" title="Convert Keyword" do="convert" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
		}
		floatControlBox += '</span>';
		
	}
	if(callTree.currentSettings.displaySettings.treeTypeSet == 'tagging')
	{
		var displayChecked = '';
		floatControlBox = '<span class="fCB">';
		floatControlBox += '<ul>';
		floatControlBox += '<li>';
		if(isChecked == ' checked'){
			floatControlBox += '<input type="checkbox" class="checkbox checked"  checked onclick="BBTreeTag.checkRemoveAdd(\''+tagLabel+'\')"></input></li></ul>';
		} else {
			floatControlBox += '<input type="checkbox" class="checkbox" onclick="BBTreeTag.checkRemoveAdd(\''+tagLabel+'\')"></input></li></ul>';
		}
		floatControlBox += '</span>';
		if(tagLabel != 'tagLabel_291' && tagLabel != 'tagLabel_296')
		{
			return(floatControlBox);
		} else { 
			return ''; 
		}
	}
	if((tagLabel == 'tagLabel_291' || tagLabel == 'tagLabel_296') && callTree.currentSettings.displaySettings.treeTypeSet != 'modal')
	{
		return '<span class="fCB" ><ul><li class="printTag"  onClick="printTags()"> </li><li class="addTag" title="Add New Tag" do="add" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li></ul></span>'; 
	} 
	else 
	{ 
		return(floatControlBox); 
	}
}
function updateViewContactPage(tagLabel)
{
	var tabCounter = cj('li#tab_tag em').html();
	var tagLiteralName = cj(BBTree.treeLoc + ' dt#'+ tagLabel + ' .tag .name').html();
	var headList = cj('.contactTagsList.help span').html();
	if(headList)
	{
		var headSplit = headList.split(" • ");
		var appendAfter = headSplit.length;
		headSplit[appendAfter] = tagLiteralName;
		headSplit.sort();
		headList = headSplit.join(" • ");
		cj('.contactTagsList.help span').html(headList);
	}
	else
	{
		headList = tagLiteralName;
		cj('#TagGroups #dialog').append('<div class="contactTagsList help"><strong>Issue Codes: </strong><span>' + headList + '</span></div>');
	}
	cj('li#tab_tag em').html('').html(parseFloat(tabCounter)+1);
	return true;

}
function modalLoadingGif(path)
{
	switch(path){
		case 'add': cj('.ui-dialog-buttonpane').addClass('loadingGif');cj('.ui-dialog-buttonset').css("visibility", "hidden"); break;
		case 'remove': cj('.ui-dialog-buttonpane').removeClass('loadingGif');cj('.ui-dialog-buttonset').css("visibility", "visible"); break;
		default: break;
	}		
}
function sortWindow()
{
	var path = window.location.pathname;
	switch(path.toLowerCase())
	{
		case '/civicrm/contact/view': callTree.currentSettings['pageLocation'] ='view'; break;
		case '/civicrm/contact/add': callTree.currentSettings['pageLocation'] = 'edit'; break;
		case '/civicrm/admin/tag': callTree.currentSettings['pageLocation'] = 'manage'; break;
		default: callTree.currentSettings['pageLocation'] = 'default'; break;
	}
}
function setTreeLoc()
{
	BBTree["treeLoc"] = {};
	BBTree.treeLoc = '.'+callTree.currentSettings.pageSettings.tagHolder+'.'+callTree.currentSettings.displaySettings.treeTypeSet.toLowerCase();
}
//remove at the end
function returnTime()
{
	var time = new Date();
	var rTime = time.getMinutes() + ':' + time.getSeconds() + ':' + time.getMilliseconds();
	console.log(rTime);
}
