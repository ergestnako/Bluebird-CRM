﻿/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.editorConfig = function( config )
{
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    //config.uiColor = '#AADC6E';
    
    //config.filebrowserBrowseUrl = '/index.php?q=imce&app=ckeditor|url@txtUrl|width@txtWidth|height@txtHeight';
    //config.filebrowserBrowseUrl = '/sites/all/ckfinder/ckfinder.html';
 
    // disable auto spell check
    config.scayt_autoStartup = false;

    // This is actually the default value.
    config.toolbar_Full =
    [
        ['Bold','Italic','Underline'],
        ['Font','FontSize'],
        //['TextColor','BGColor'],   
        ['Link','Unlink'],
        ['Image'],
        ['NumberedList','BulletedList'],     
        ['PasteText','PasteFromWord'],
        ['RemoveFormat'],
        ['Source'],
    ];
};


//NYSS 3878 remove some unnecessary elements
CKEDITOR.on( 'dialogDefinition', function( ev )
{
    // Take the dialog name and its definition from the event data.
    var dialogName = ev.data.name;
    var dialogDefinition = ev.data.definition;

    // Check if the definition is from the dialog we're
    // interested in (the 'link' dialog).
    if ( dialogName == 'link' ) {
        // Remove the 'Advanced' tabs from the 'Link' dialog.
        dialogDefinition.removeContents( 'advanced' );
 
        // Get a reference to the Link Info tab. Remove unnecessary widgets.
        var infoTab = dialogDefinition.getContents( 'info' );
        infoTab.remove( 'browse');
        infoTab.remove( 'protocol');
		
		// Get a reference to the Target tab. Remove items from target type list.
		var targetTab = dialogDefinition.getContents( 'target' );
		var targetTypeItems = targetTab.get( 'linkTargetType' ).items;
		if ( targetTypeItems.length > 0 ) {
			var items_popup = targetTypeItems.slice(0, 1).concat( targetTypeItems.slice(3, targetTypeItems.length) );
			targetTab.get( 'linkTargetType' ).items = items_popup;
		}
		
		
        
    } else if ( dialogName == 'image' ) {
        // Remove the 'Advanced' tabs from the 'Image Properties' dialog.
        dialogDefinition.removeContents( 'advanced' );
    }
      
});
