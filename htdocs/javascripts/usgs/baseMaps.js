/**
 * Namespace: baseMaps
 *
 * baseMaps is a JavaScript library to set of functions to manage
 *  the base maps layers on the map.
 *
 * version 2.02
 * June 20, 2023
*/

/*
###############################################################################
# Copyright (c) Oregon Water Science Center
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

var baseMapContent = []
baseMapContent.push('<div class="dropdown">');
baseMapContent.push('<button id="basemapButton" class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">');
baseMapContent.push('Basemaps</button>');
baseMapContent.push('<ul id="basemapMenu" class="dropdown-menu BaseMaps">');

// Help text
//
//setHelpTip("#basemapsHelp", "Click this to change the background of the map.", "bottom");

// Base maps
//
var basemapNameArray   = [
                          ["ESRIgrayBasemap",   "ESRI Gray"],
                          ["ESRIstreetsBasemap","ESRI Streets"],
                          ["ESRIimageryBasemap","ESRI Imagery"],
                          ["ESRIusaTopoBasemap","ESRI USA Topo"],
                          ["ESRInatGeoBasemap", "ESRI Nat Geo"],
                          ["NationalMapBasemap","National Map"],
                          ["ESRItopoBasemap",   "ESRI Topo"]
                          //["USGS Topo <br />with river miles", "RiverMiles"]
                         ];

// Set up basemap layers
//
var ESRIgrayBasemap    = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {attribution: 'Copyright: &copy; 2013 Esri, DeLorme, NAVTEQ'});
var ESRIstreetsBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2013'});
var ESRIimageryBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {attribution: 'Source: Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'});
var ESRIusaTopoBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}", {opacity: 0.7,attribution: 'Copyright:&copy; 2013 National Geographic Society, i-cubed'});
var ESRInatGeoBasemap  = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC>'});
var NationalMapBasemap = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {maxZoom: 20,attribution: '<a href="https://www.doi.gov">U.S. Department of the Interior</a> | <a href="https://www.usgs.gov">U.S. Geological Survey</a> | <a href="https://www.usgs.gov/laws/policies_notices.html">Policies</a>'});
var ESRItopoBasemap    = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'MRLC, State of Oregon, State of Oregon DOT, State of Oregon GEO, Esri, DeLorme, HERE, TomTom, USGS, NGA, EPA, NPS, U.S. Forest Service'});
//var RiverMilesBasemap  = L.tileLayer.wms("https://raster.nationalmap.gov/arcgis/services/Scanned_Maps/USGS_EROS_DRG_SCALE/ImageServer/WMSServer",{ layers: "USGS_EROS_DRG_SCALE" });

// Add items to basemap dropdown
//
jQuery.each(basemapNameArray, function(i, v) 
   {
     var basemap = '<li class="base_maps dropdown noJump" id="' + v[0] + '" >';
     basemap    += '<a href="#" class="dropdown-item noJump">';
     basemap    += v[1] + '</a></li>';
     //jQuery("#basemapMenu").append(basemap);

     baseMapContent.push(basemap);	

     // Make default layer active
     //
     if (v[0] == "ESRItopoBasemap") 
        {
	  jQuery("#ESRItopoBasemap").addClass('active');
	}

});

baseMapContent.push('</ul>');
baseMapContent.push('</div>');
 
// Add basemap dropdown
//
var basemapObj         = {
                          "Gray":        ESRIgrayBasemap,
                          "Streets":     ESRIstreetsBasemap,
                          "Imagery":     ESRIimageryBasemap,
                          "Esri Geo":    ESRIusaTopoBasemap,
                          "Nat Geo":     ESRInatGeoBasemap,
                          "DOI":         NationalMapBasemap,
                          "Topo":        ESRItopoBasemap
                          //"River Miles": RiverMilesBasemap
                         };

// Set up minimap layers
//
var MinimapNameArray   = [
                          ["ESRIgrayMinimap",   "ESRI Gray"],
                          ["ESRIstreetsMinimap","ESRI Streets"],
                          ["ESRIimageryMinimap","ESRI Imagery"],
                          ["ESRIusaTopoMinimap","ESRI USA Topo"],
                          ["ESRInatGeoMinimap", "ESRI Nat Geo"],
                          ["NationalMapMinimap","National Map"],
                          ["ESRItopoMinimap",   "ESRI Topo"]
                          //["USGS Topo <br />with river miles", "RiverMiles"]
                         ];

var ESRIgrayMinimap    = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {attribution: 'Copyright: &copy; 2013 Esri, DeLorme, NAVTEQ'});
var ESRIstreetsMinimap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2013'});
var ESRIimageryMinimap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {attribution: 'Source: Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'});
var ESRIusaTopoMinimap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}", {opacity: 0.7,attribution: 'Copyright:&copy; 2013 National Geographic Society, i-cubed'});
var ESRInatGeoMinimap  = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC>'});
var NationalMapMinimap = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {maxZoom: 20,attribution: '<a href="https://www.doi.gov">U.S. Department of the Interior</a> | <a href="https://www.usgs.gov">U.S. Geological Survey</a> | <a href="https://www.usgs.gov/laws/policies_notices.html">Policies</a>'});
var ESRItopoMinimap    = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'MRLC, State of Oregon, State of Oregon DOT, State of Oregon GEO, Esri, DeLorme, HERE, TomTom, USGS, NGA, EPA, NPS, U.S. Forest Service'});
//var RiverMilesMinimap  = L.tileLayer.wms("https://raster.nationalmap.gov/arcgis/services/Scanned_Maps/USGS_EROS_DRG_SCALE/ImageServer/WMSServer",{ layers: "USGS_EROS_DRG_SCALE" });

var minimapObj = {
                          "ESRIgrayBasemap":     ESRIgrayMinimap,
                          "ESRIstreetsBasemap":  ESRIstreetsMinimap,
                          "ESRIimageryBasemap":  ESRIimageryMinimap,
                          "ESRIusaTopoBasemap":  ESRIusaTopoMinimap,
                          "ESRInatGeoBasemap":   ESRInatGeoMinimap,
                          "NationalMapBasemap":  NationalMapMinimap,
                          "ESRItopoBasemap":     ESRItopoMinimap
                          //"River Miles": RiverMilesMinimap
                  };

// Control for basemap dropdown
//
jQuery('#basemapMenu5 li').click(function(){

   // Dont do anything if the current active layer is clicked
   //
   if(!map.hasLayer(window[$(this).prop("id")])) 
     {			
       // Remove currently active basemap
       //
       jQuery("#basemapMenu li.active").each(function () 
          {
            // Console.log("removing ",$(this).attr("id"));
            //
            map.removeLayer(window[$(this).prop("id")]);
            jQuery(this).removeClass("active");
          });
			
       // Make new selection active and add to map
       //
       jQuery(this).addClass('active');
       map.addLayer(window[$(this).prop("id")]);
       miniMap.changeLayer(minimapObj[$(this).prop("id")]);
     }
   
   // Close after clicked
   //
   $("#basemapButton").dropdown("toggle");
});

// Pick basemap
//
function pickBaseMap(clickedMap) 
  {
   var clickedMapID = $(clickedMap).prop("id");
      
   // Dont do anything if the current active layer is clicked
   //
   if(!map.hasLayer(window[clickedMapID])) 
     {			
       // Remove currently active basemap
       //
       jQuery("#basemapMenu li.active").each(function () 
          {
            map.removeLayer(window[clickedMap]);
            jQuery(clickedMap).removeClass("active");
          });
			
       // Make new selection active and add to map
       //
       jQuery(clickedMap).addClass('active');
       map.addLayer(window[clickedMapID]);
       miniMap.changeLayer(minimapObj[clickedMapID]);
     }
   
   // Close after clicked
   //
   $("#basemapButton").dropdown("toggle");
  }



// Pick basemap
//
function pickBaseMap2(clickedMap) 
  {
      console.log(clickedMap);
      console.log(window[clickedMap]);
           console.log(map.hasLayer(window[clickedMap]));

   // Dont do anything if the current active layer is clicked
   //
   map.eachLayer( function(layer) {
       if(layer instanceof L.TileLayer) {
           console.log("Layer");
           console.log(layer);
           console.log(map.hasLayer(layer));
           console.log(layer.getContainer());
       }
   } );
      
      if(map.hasLayer(clickedMap)) 
     {			
     }

   // Dont do anything if the current active layer is clicked
   //
   else 
     {			
       // Remove currently active basemap
       //
       jQuery("#basemapMenu li.active").each(function () 
          {
            // Console.log("removing ",$(this).attr("id"));
            //
            map.removeLayer(clickedMap);
            jQuery('#' + clickedMap).removeClass("active");
          });
			
       // Make new selection active and add to map
       //
       jQuery('#' + clickedMap).addClass('active');
       map.addLayer(clickedMap);
       miniMap.changeLayer(minimapObj[clickedMap]);
     }

   // Close after clicked
   //
   $("#basemapButton").dropdown("toggle");
  }
