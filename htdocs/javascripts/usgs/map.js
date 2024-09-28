/**
 * Namespace: Map
 *
 * Map is a JavaScript library to provide a set of functions to build
 *  a Leaflet Map Site.
 *
 * version 3.06
 * September 24, 2024
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
var studyareaPolygon = [];

// Prepare when the DOM is ready 
//
function buildMap() 
  {
  // Loading message
  //
  message = "Processing map information ";
  openModal(message);
  console.log(message);
  
  // Insert accordion text
  //
  jQuery.each(aboutFiles, function(keyItem, keyFile) {
  
      var InfoText = loadText(keyFile);
  
      jQuery("#" + keyItem).html(InfoText);
  
  });

  closeModal(message);

  // Set bounds based upon framework information
  //
  map_bounds = setBounds(raster_projection,
                         latlong_projection,
                         northwest_x, northwest_y,
                         northeast_x, northeast_y,
                         southwest_x, southwest_y,
                         southeast_x, southeast_y
                        );

  // Create the map object
  //
  map = new L.map('map', {zoomControl: false});

  map.fitBounds([
                 [map_bounds.lat_max, map_bounds.long_max], 
                 [map_bounds.lat_min, map_bounds.long_min]
                ]);

  map.setMaxBounds([
                 [map_bounds.lat_max, map_bounds.long_max], 
                 [map_bounds.lat_min, map_bounds.long_min]
                ]);
      
  // Disable controls for map view
  //
  //$(".leaflet-control-zoom").css("visibility", "visible");
  map.scrollWheelZoom.disable();    

  // Add home button
  //
  var zoomHome = L.Control.zoomHome();
  zoomHome.addTo(map);
      
  // Clicked zoom home
  //
  $(".leaflet-control-zoomhome-home").on("click", (e) => {

      // Clear raster polygons
      //
      if(rasterLayer.getLayers().length > 0)
         {
          rasterLayer.eachLayer(function(layer) {

              longitude              = layer.properties.longitude;
              latitude               = layer.properties.latitude;
              land_surface_elevation = layer.properties.land_surface_elevation;
              water_level            = layer.properties.water_level;
              water_level_elevation  = layer.properties.water_level_elevation;
              uncertainty            = layer.properties.uncertainty;
           
              marker = L.circle([latitude, longitude], 150, {
                  color: 'red',
                  fillColor: '#f03',
                  zIndexOffset: 999,
                  fillOpacity: 0.9
              });

              marker.properties = {};
              marker.properties.longitude = longitude;
              marker.properties.latitude  = latitude;
              marker.properties.land_surface_elevation  = land_surface_elevation;
              marker.properties.water_level = water_level;
              marker.properties.water_level_elevation  = water_level_elevation;
              marker.properties.uncertainty  = uncertainty;
   
              markerLayer.addLayer(marker);
              map.addLayer(markerLayer);
          
              createPopUp(marker, {
                     'longitude': longitude,
                     'latitude':  latitude,
                     'land_surface_elevation': land_surface_elevation,
                     'water_level': water_level,
                     'water_level_elevation': water_level_elevation,
                     'uncertainty': uncertainty
              });
              
          });
              
          // Delete raster cell              
          //
          map.removeLayer(rasterLayer);
          rasterLayer.clearLayers();
         }
  });
      
  // Add base map
  //
  map.addLayer(ESRItopoBasemap);
      
  // Create the miniMap
  //
    miniMap = new L.Control.MiniMap(ESRItopoMinimap, { toggleDisplay: true, position: 'bottomleft' }).addTo(map);
      
  // Create marker and raster cell layers
  //
  markerLayer  = new L.LayerGroup();
  rasterLayer  = new L.LayerGroup();

  // Add raster layers
  //
  //L.tileLayer('lsd_tiles/{z}/{x}/{y}.png').addTo(map);
  //L.tileLayer('lsd_tiles/{z}/{y}/{x}.png').addTo(map);
  //L.tileLayer('lsd_tiles/9/80/329.png').addTo(map);
	  
  //L.control.scale().addTo(map);

  // Add studyarea boundary
  //
  if(studtyareaJson)
    {
     console.log("Adding studyarea boundary ");
     var studtyareaLayer = L.geoJson(studtyareaJson, {
         onEachFeature: function(feature, featureLayer) {
             polygonCoordinates = feature.geometry.coordinates[0];
             //console.log("polygonCoordinates length " + polygonCoordinates.length);
             for(let i = 0; i < polygonCoordinates.length; i++) {
                 studyareaPolygon.push({ x: polygonCoordinates[i][0],
                                         y: polygonCoordinates[i][1]});
             }
             //console.log("studyareaPolygon");
             //console.log(studyareaPolygon);
         }}).addTo(map);
    }

  // Add zoom to your location
  //
  var myLocate = L.control.locate({
      drawCircle: false,
      drawMarker: false,
      clickBehavior: { outOfView: 'stop' },
      strings: { title: "Move and zoom to your location" }
  }).addTo(map);

  // Remove locations tool
  //
  var removeTool = [];
      removeTool.push('<div id="removeLocationButton" class="d-flex align-items-center justify-content-center">');
      removeTool.push('<i class="bi bi-trash"></i>')
      //removeTool.push('<strong>Remove Locations</strong>');
      removeTool.push('</div>');
      L.easyButton(removeTool.join(" "), function(btn, map) {
          resetPoints(markerLayer, rasterLayer);
      }).addTo(map);
      $('.easy-button-container').prop('title','Click to remove existing locations on map');
      
  // Map bounds for geocoding tool
  //
  const corner1 = L.latLng(map_bounds.lat_max, map_bounds.long_ma);
  const corner2 = L.latLng(map_bounds.lat_min, map_bounds.long_mi);
  const bounds  = L.latLngBounds(corner1, corner2);

  // Create the geocoding control and add it to the map
  //
    var searchControl = new GeoSearch.GeoSearchControl({
      provider: new GeoSearch.OpenStreetMapProvider(),
      showMarker: false,
      autoClose: true, 
      searchLabel: "Enter address, intersection, or latitude/longitude"
    })
    map.addControl(searchControl);
    $(".leaflet-control-geosearch form input").css('min-width', '400px');
    $(".leaflet-control-geosearch form button").remove();
    $(".leaflet-control-geosearch a").html('');
    $(".leaflet-control-geosearch a").html('<img src="css/icons/search.png" class="searchPng">')
    //$(".leaflet-control-geosearch a").html('<i class="fa-solid fa-magnifying-glass"></i>')
    $(".leaflet-control-geosearch a").css('font-size', '2.5rem');

  map.on('geosearch/showlocation', function(data) {
      console.log("geocoding results ",data);
  			
      if('location' in data)
        {
          var myAddress = { latlng: { lng: data.location.x,  lat: data.location.y } };

          onMapClick(markerLayer, rasterLayer, myAddress);
        }
  });
      
  // Base maps button from baseMaps.js
  //
  var basemapControl = L.control({position: 'topright'});
  basemapControl.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'baseMaps NoJump');
      div.innerHTML = baseMapContent.join(" ");
      div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
      return div;
  };
  basemapControl.addTo(map);      
  $('.baseMaps').prop('title','Click to change background on map');
      
  // Set current basemap active in dropdown menu
  //
  jQuery('#ESRItopoBasemap').addClass('active');
      
  // Clicked base map
  //
  $(".baseMaps").on("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
  			
      // Clicked base map
      //
      jQuery('#basemapMenu li').click(function()
        {
         // Dont do anything if the current active layer is clicked
         //
         if(!map.hasLayer(window[$(this).prop("id")]))
           {			
            // Remove currently active basemap
            //
            jQuery("#basemapMenu li.active").each(function () 
               {
                console.log("removing ",$(this).prop("id"));

                map.removeLayer(window[$(this).prop("id")]);
                jQuery(this).removeClass("active");
               });
   			
            // Make new selection active and add to map
            //
            console.log("Active ",$(this).prop("id"));
            jQuery(this).addClass('active');
            map.addLayer(window[$(this).prop("id")]);
            miniMap.changeLayer(minimapObj[$(this).prop("id")]);
           }
   
         // Close after clicked
         //
         $("#basemapButton").dropdown("toggle");
      });
  });
      
  // Scroll message
  //
  $("#map").on("mouseover", function () {
      if(!myZoomFlag)
        {
         myZoomFlag = true
         message = "Use Shift-Left Mouse Drag: Select a region by pressing the Shift key and dragging the left mouse button"
         openModal(message);
         fadeModal(2000);
        }
  });

  // Show initial map zoom level
  //
  jQuery( ".mapZoom" ).html( "<b>Zoom Level: </b>" + map.getZoom());

  // Refresh sites on extent change
  //
  map.on('zoomend dragend', function(evt) {
      jQuery( ".mapZoom" ).html( "<b>Zoom Level: </b>" + map.getZoom());
      //jQuery( ".latlng" ).html(evt.latlng.lng.toFixed(3) + ", " + evt.latlng.lat.toFixed(3));
  });

  // Generate point location
  //
  map.on('click', function(evt) {
      onMapClick(markerLayer, rasterLayer, evt);
   });

  // Remove point location(s)
  //
  jQuery('#resetPoints').click(function(){
      resetPoints(markerLayer, rasterLayer);
   });

  // Add more style to popup
  //
  jQuery(".leaflet-popup-content-wrapper").css("border", "2px solid black");
  jQuery(".leaflet-popup-close-button").css("font-weight", "bold");

  // Add more style to popup
  //
  jQuery(".leaflet-control").css("z-index", "600");
  jQuery(".leaflet-popup").css("z-index", "650");

  }

   
// Parse information from file
//
function setMap(json_data) 
  {
    raster_coordinates         = json_data.raster_coordinates;
    raster_projection          = json_data.raster_projection;
    latlong_projection         = json_data.latlong_projection;
    zoom_level                 = json_data.zoom_level;

    var latlong_max_x          = -99999999999999.99;
    var latlong_max_y          = -99999999999999.99;
    var latlong_min_x          =  99999999999999.99;
    var latlong_min_y          =  99999999999999.99;

    var raster_max_x           = -99999999999999.99;
    var raster_max_y           = -99999999999999.99;
    var raster_min_x           =  99999999999999.99;
    var raster_min_y           =  99999999999999.99;

    // Set corners 
    // 
    for (var corner in raster_coordinates)
	{
	  var raster_corner       = { "x": raster_coordinates[corner].x, "y": raster_coordinates[corner].y };
          var latlong_coordinate  = User2User(
					      raster_corner,
                                              raster_projection,
                                              latlong_projection
                                             );
      
          if(raster_corner.x > raster_max_x) { raster_max_x = raster_corner.x; }
          if(raster_corner.x < raster_min_x) { raster_min_x = raster_corner.x; }
          if(raster_corner.y > raster_max_y) { raster_max_y = raster_corner.y; }
          if(raster_corner.y < raster_min_y) { raster_min_y = raster_corner.y; }
      
          if(latlong_coordinate.x > latlong_max_x) { latlong_max_x = latlong_coordinate.x; }
          if(latlong_coordinate.x < latlong_min_x) { latlong_min_x = latlong_coordinate.x; }
          if(latlong_coordinate.y > latlong_max_y) { latlong_max_y = latlong_coordinate.y; }
          if(latlong_coordinate.y < latlong_min_y) { latlong_min_y = latlong_coordinate.y; }
      
          //raster_polygon.push({ "x" : latlong_coordinate.x, "y" : latlong_coordinate.y });
          raster_polygon.push({ "x" : raster_corner.x, "y" : raster_corner.y });
	}
    return { "min_x": latlong_min_x, "min_y": latlong_min_y, "max_x": latlong_max_x, "max_y": latlong_max_y };
  }


function updateLegend(v, currentMap, updateType) {

    //jQuery("#overlayMenu.sw").append('<li role="presentation" id="' + curSiteTypeInfo.overlayLayerName + '" class="' + curSiteTypeInfo.overlayLayerName  + '"><a role="menuitem" tabindex="-1"><div name="overlayLayers" ><img src="' + curSiteTypeInfo.singleMarkerURL + '"/><span>' + curSiteTypeInfo.legendLayerName + '</span></div></li>');}

}

// Determine if a point is within raster
//
function isPointInPoly(poly, pt)
  {
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
	((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
	&& (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
	&& (c = !c);
    return c;
  }

function onMapClick(markerLayer, rasterLayer, evt) 
  {
   if(typeof evt !== "undefined")
     {
      // Translate map click location to model grid coordinates
      //
      var long                   = evt.latlng.lng;
      var lat                    = evt.latlng.lat;
  
      var coordinate             = User2User(
                                             { "x": long, "y": lat },
                                             latlong_projection,
                                             raster_projection
                                            );
     console.log("coordinate");
     console.log(coordinate);
     console.log(studyareaPolygon);
 
      // Point inside model grid
      //
      if(isPointInPoly(studyareaPolygon, {x: long, y: lat}) > 0)
        {                                              
          // Place marker on map
          //
          marker = L.circle([lat, long], 
                            2, 
                            {
                             color: 'red',
                             fillColor: '#f03',
                             zIndexOffset: 999,
                             fillOpacity: 0.9
                            });
    
          // Add marker
          //
          //markerLayer.addLayer(marker);
          //map.addLayer(markerLayer);

         var dtw = getDTW({ x: long, y: lat }, { x: coordinate[0], y: coordinate[1] });
        }
                                  
      // Point outside model grid
      //
      else
        { 
         var message = "Point is located outside the boundaries of the study";
         openModal(message);
         fadeModal(5000);
         return;
        }
    }
}

function outsideStudyArea()
  { 
    console.log("Point is located outside the boundaries of the study");
         var message = "Point is located outside the boundaries of the study";
         openModal(message);
         fadeModal(5000);
         return;
}

function resetPoints(markerLayer, rasterLayer)
  { 
    console.log("Removing all location information");

   // Clear markers and raster polygons
   //
   if(markerLayer.getLayers().length > 0 || rasterLayer.getLayers().length > 0)
      {
       map.removeLayer(markerLayer);
       markerLayer.clearLayers();

       map.removeLayer(rasterLayer);
       rasterLayer.clearLayers();

       var message = "Removing all location information, please begin again. ";
       openModal(message);
       fadeModal(2000);
       return;
      }
  }


// Get depth to water
//
function getDTW(markerPoint, myPoint) 
  {
    // Determine if point is inside raster
    //
    console.log("Web " + myPoint.x + " " + myPoint.y);

    var message = "Retrieving location information, please wait. ";
    openModal(message);

    // Retrieve data for each site
    //
    var request_type = "GET";
        var script_http  = "../puz_new?";
        var script_http  = "/cgi-bin/puz/puz_location.py?";
        var color_file = "color.file";
        var data_http    = "";
            data_http   += "longitude=" + markerPoint.x;
            data_http   += "&latitude=" + markerPoint.y;
            data_http   += "&x_coordinate=" + myPoint.x;
            data_http   += "&y_coordinate=" + myPoint.y;
            data_http   += "&rasters=" + rasters.join(" ");
            data_http   += "&color=" + color_file;
            data_http   += "&raster_origin=" + [raster_coordinates.northwest.x, raster_coordinates.northwest.y].join(" ");
            //data_http   += "&northwest_corner=" + [raster_coordinates.origin.x, raster_coordinates.origin.y].join(",");
            //data_http   += "&northeast_corner=" + [raster_coordinates.row_1.x, raster_coordinates.row_1.y].join(",");
            //data_http   += "&northeast_corner=" + [raster_coordinates.col_1.x, raster_coordinates.col_1.y].join(",");
            //data_http   += "&northeast_corner=" + [raster_coordinates.row_n.x, raster_coordinates.row_n.y].join(",");

    var dataType    = "json";

    webRequest(request_type, script_http, data_http, dataType, showMarker);

  }

// Marker for depth to water
//
function showMarker(json) 
  {
    // Remove marker and raster cell if present
    //
    //if(marker) { map.removeLayer(marker); }
    //if(rasterlayer) { map.removeLayer(rasterlayer); }
	
	closeModal();

    // Failed
    //
    if(json.status == "fail")
      {
        var message = "";
        if(typeof json.error !== "undefined")
          {
            message = json.error;
          }
        if(typeof json.warning !== "undefined")
          {
            message = json.warning;
          }
       message = "Estimated Depth to Ground Water " + message;
       openModal(message);
       return false;
      }
 
    var longitude              = json.longitude.toFixed(4);
    var latitude               = json.latitude.toFixed(4);
    var land_surface_elevation = json.rasters[0].value.toFixed(1);
    var water_level_max        = json.rasters[1].maximum;
    var water_level_min        = json.rasters[1].minimum;
    var water_level            = json.rasters[1].value.toFixed(1);
    var water_level_elevation  = (land_surface_elevation - water_level).toFixed(1);
    var uncertainty            = json.rasters[3].value.toFixed(3);
    var rasterCell             = json.cell;

    if(uncertainty <= 0.33)
      {
        uncertainty = "Low (< 0.34)";
      }
    else if(uncertainty <= 0.67)
      {
        uncertainty = "Moderate (0.34 to 0.67)";
      }
    else
      {
        uncertainty = "High (> 0.67)";
      }

    // Check zoom of map
    //
    var mapzoom = map.getZoom();
          
    // Place marker on map
    //
    if(mapzoom < 13)
      {      
       marker = L.circle([latitude, longitude], 300, {
                  color: 'red',
                  fillColor: '#f03',
                  zIndexOffset: 999,
                  fillOpacity: 0.9
        });

       marker.properties = {};
       marker.properties.longitude = longitude;
       marker.properties.latitude  = latitude;
       marker.properties.land_surface_elevation  = land_surface_elevation;
       marker.properties.water_level = water_level;
       marker.properties.water_level_elevation  = water_level_elevation;
       marker.properties.uncertainty  = uncertainty;

       console.log("Marker");
   
       markerLayer.addLayer(marker);
       map.addLayer(markerLayer);
          
       createPopUp(marker, {
              'longitude': longitude,
              'latitude':  latitude,
              'land_surface_elevation': land_surface_elevation,
              'water_level': water_level,
              'water_level_elevation': water_level_elevation,
              'uncertainty': uncertainty
       });
      }
          
    // Place raster cell on map
    //
    else
      {
       rasterPolygon = addCell(rasterCell, water_level, water_level_min, water_level_max);

       rasterPolygon.properties = {};
       rasterPolygon.properties.longitude = longitude;
       rasterPolygon.properties.latitude  = latitude;
       rasterPolygon.properties.land_surface_elevation  = land_surface_elevation;
       rasterPolygon.properties.water_level = water_level;
       rasterPolygon.properties.water_level_elevation  = water_level_elevation;
       rasterPolygon.properties.uncertainty  = uncertainty;
    
       rasterLayer.addLayer(rasterPolygon);
       map.addLayer(rasterLayer);
          
       createPopUp(rasterPolygon, {
              'longitude': longitude,
              'latitude':  latitude,
              'land_surface_elevation': land_surface_elevation,
              'water_level': water_level,
              'water_level_elevation': water_level_elevation,
              'uncertainty': uncertainty
       });
      }

  }
    
function addCell(rasterCell, water_level, water_level_min, water_level_max) 
  {
    // Allocate colors
    //
    var class_colors = AllocateColors();
    var cell_color   = DetermineColor(30, water_level, water_level_min, water_level_max);
    var r            = class_colors[cell_color].r;
    var g            = class_colors[cell_color].g;
    var b            = class_colors[cell_color].b;
    //alert("Color color " + cell_color + " -> " + r + " " + g + " " + b);
    var myColor      = rgbToHex(r, g, b)

    var polygon = [];

    // Set corners 
    // 
    for(var i = 0; i < rasterCell.length; i++)
      {
        var raster_corner       = { "x": rasterCell[i].x, "y": rasterCell[i].y };
        var latlong_coordinate  = User2User(
                                            raster_corner,
                                            raster_projection,
                                            latlong_projection
                                           );
      
        if( i < 4)
          {
            var vertice = new L.LatLng(latlong_coordinate[1], latlong_coordinate[0]);
            polygon.push(vertice);
          }
      }
      
    myCell = L.polygon(polygon, {
                                 stroke: false,
                                 color: 'black',
                                 fillColor: myColor,
                                 fillOpacity: 0.5
    });

    return myCell;
  }
   
function AllocateColors() 
  {
    // Global variables
    //
    max_r  = 204.0;
    max_g  = 204.0;
    max_b  = 255.0;

    min_r  =   0.0;
    min_g  =   0.0;
    min_b  = 224.0;

    class_colors      = [];
    number_of_classes = 30.0;

    r_interval = (max_r - min_r) / number_of_classes;
    g_interval = (max_g - min_g) / number_of_classes;
    b_interval = (max_b - min_b) / number_of_classes;
    
    for(var i = 0; i < number_of_classes; i++)
       {
	 r = parseInt(min_r + i * r_interval);
	 if(r > max_r) { r = max_r; }
	 if(r < min_r) { r = min_r; }
            
	 g = parseInt(min_g + i * g_interval);
	 if(g > max_g) { g = max_g; }
	 if(g < min_g) { g = min_g; }
            
	 b = parseInt(min_b + i * b_interval);
	 if(b > max_b) { b = max_b; }
	 if(b < min_b) { b = min_b; }

         //hexcolor = rgbToHex(int(r),int(g),int(b));
         class_colors.push({ "r": r, "g": g, "b": b });
       }

    return class_colors
   }
   
function DetermineColor(number_of_classes, cell_value, cell_min, cell_max) 
  {
    cell_color = number_of_classes * ( cell_value - cell_min ) / Math.abs( cell_max - cell_min );
    //alert("DetermineColor " + cell_value + " " + cell_min + " " + cell_max + " cell color " + cell_color);
    cell_color = parseInt(cell_color);
    if(cell_color >= number_of_classes)
      {
	cell_color = number_of_classes - 1;
      }
    if(cell_color <= 0)
      {
	cell_color = 0;
      }
    //alert("DetermineColor  cell color " + cell_color);
        
    return cell_color;
  }

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Provide coordinates to cursor location
//
function showCoordinates(evt) 
  {
    //mp = e.latlng;
    document.getElementById("mousepointLatLng").innerHTML = mp.lng.toFixed(3) + ", " + mp.lat.toFixed(3);
    var dms_coordinates = LatLong2DMS(mp);
	document.getElementById("mousepointDMS").innerHTML = dms_coordinates.x.toFixed(3) + ",  " + dms_coordinates.y.toFixed(3);
	var utm_coordinates = LatLong2Utm(mp);
    document.getElementById("mousepointUTM").innerHTML = utm_coordinates.x.toFixed(3) + ", " + utm_coordinates.y.toFixed(3) + "  meters  Zone " + utm_coordinates.utm_zone;
    var stateplane_coordinates = LatLong2StatePlane(mp);
    document.getElementById("mousepointStatePlane").innerHTML = stateplane_coordinates.x.toFixed(3) + ",  " + stateplane_coordinates.y.toFixed(3) + "  feet";
 }
