/**
 * Namespace: Popup Functions
 *
 * Provides set of functions to build a Popup.
 *
 * version 3.03
 * July 10, 2024
*/

/*
###############################################################################
# Copyright (c) U.S. Geological Survey Oregon Water Science Center
# 
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.
###############################################################################
*/

// Popup specs
//
var popupOptions = { 'maxHeight': '200', 'maxWidth': '300', offset: new L.Point(0, -15) };

// Adds a new DIV table row with two columns
//
function addTableRow(col1, col2) {
   var content = '<div class="divTableRow">';
   content    += ' <div class="divTableCell">';
   content    += col1;
   content    += ' </div>';
   if(col2.toString().length > 0)
     {
      content    += ' <div class="divTableCell">';
      content    += col2;
      content    += ' </div>';
     }
   content    += '</div>';

   return content;
}

// Adds a new DIV table row with two columns
//
function addDivSeparator2() {
	var content = '<div class="divTableRow">';
	content    += ' <hr class="divSeparator"></hr>';
	content    += '</div>';

	return content;
}

// Adds a new DIV table row with two columns
//
function addDivSeparator() {
	var content = '<div class="divTableRow">';
	content    += ' <div class="divTableCell">';
	content    += '  <hr class="divSeparator"></hr>';
	content    += ' </div>';
	content    += ' <div class="divTableCell">';
	content    += '  <hr class="divSeparator"></hr>';
	content    += ' </div>';
	content    += '</div>';

	return content;
}

// Build popup
//
function createPopUp(site, siteInfo)
  {  
   //console.log("buildPopUp -> " + siteID);
   //console.log("buildPopUp -> " + site.options.opacity);
   //console.log("buildPopUp -> " + site.options.zIndexOffset);
      //
      console.log("createPopUp -> ");
      console.log(siteInfo);

   //  Skip popup content not active
   //
   //if(site.options.opacity < 0.9) { return; }

   //  Create popup content
   //
   //var popupContent  = '<div class="leaflet-popup-body">';
   var popupContent  = '<div class="leaflet-popup-title">Location Information</div>';
       popupContent += '<div class="leaflet-popup-body">';
       popupContent += '<div class="divTable">';
   popupContent     += '<div class="divTableBody">';

   // Attributes
   //
   var longitude              = siteInfo.longitude;
   var latitude               = siteInfo.latitude;
   var land_surface_elevation = siteInfo.land_surface_elevation;
   var water_level            = siteInfo.water_level;
   var water_level_elevation  = siteInfo.water_level_elevation;
   var uncertainty            = siteInfo.uncertainty;

   //  Create General entries
   //
   popupContent     += addTableRow('<span class="label">Site Longitude:</span>', longitude);
   popupContent     += addTableRow('<span class="label">Site Latitude:</span>', latitude);
   popupContent     += addTableRow('<span class="label">Estimated Depth to Groundwater:</span>', water_level);
   popupContent     += addTableRow('<span class="label">Estimated Water Elevation of Groundwater:</span>', water_level_elevation);
   popupContent     += addTableRow('<span class="label">Land-Surface Elevation:</span>', land_surface_elevation);
   popupContent     += addTableRow('<span class="label">Uncertainty:</span>', uncertainty);

   popupContent     += '</div></div></div>';

   // Open popup 
   //
   //var myPopup = L.responsivePopup({ offset: [2,2] }).setContent(popupContent);
   var myPopup = L.responsivePopup({ hasTip: true, autoPan: false, offset: [2, 2]}).setContent(popupContent);
   //var myPopup = site.bindPopup(popupContent, popupOptions).openPopup();
          
   site.bindPopup(myPopup);
   //site.bindPopup(popupContent);
    
   site.on('mouseover', function (e) {
           this.openPopup();
          });
    
   //$(".leaflet-popup-content").before('<div class="leaflet-popup-title">Location Information</div>');
   //$(".leaflet-popup-close-button").before('<div class="leaflet-popup-title">Location Information</div>');
   //$(".leaflet-popup-content-wrapper").prepend('<div class="leaflet-popup-title">Location Information</div>');
   $(".leaflet-popup").css("z-index", "650");
    
   site.on('mouseout', function (e) {
           this.closePopup();
          });
 
   return;
}
