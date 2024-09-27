/**
 * Namespace: Main
 *
 * Main is a JavaScript library to provide a set of functions to manage
 *  the web requests.
 *
 * version 3.15
 * July 10, 2024
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

// Prevent jumping to top of page when clicking a href
//
jQuery('.noJump a').click(function(event){
   event.preventDefault();
});

// Global variables for map
//
var isMobile           = false;
var isLegend           = true;
var map;
var map_bounds;
var marker;
var rasterlayer;
var markerlayer;
var markers            = [];

var polygonCoordinates = [];

// Configuration variables
//
var title                      = "";
var zoom_level                 = -99;

var marker;
var markers                    = [];
var marker_icon                = "";

var myZoomFlag                 = false;

// Retrieve configuration information
//
var frameworkFile      = "puz_configuration.js";
var studyareaBoundary  = 'gis/extent_dd.json';

var aboutFiles         = null;
var rasters            = null;
var latlong_projection = null;
var raster_projection  = null;
var raster_coordinates = null;
var raster_polygon     = null;
var noDataValue        = null;
var xy_multiplier      = null;
var xy_units           = null;
var z_multiplier       = null;
var z_units            = null;
var graph_x_axis       = null;
var graph_y_axis       = null;
var color_file         = null;
var studtyareaJson     = null;

// Prepare when the DOM is ready 
//
$(document).ready(function() 
  {
   // Loading message
   //
   message = "Preparing information";
   openModal(message);
   //closeModal();

   // Build ajax requests
   //
   var webRequests  = [];

   // Request for project information
   //
   var request_type = "GET";
   var script_http  = frameworkFile + "?_="+(new Date()).valueOf();
   var data_http    = "";
   var dataType     = "json";
      
   // Web request
   //
    webRequests.push($.ajax( {
      method:   request_type,
      url:      script_http,
      data:     data_http,
      dataType: dataType,
      success: function (myData) {
        message = "Processed Puz configuration information";
        openModal(message);
        fadeModal(2000);
        
        processConfigFile(myData);
      },
      error: function (error) {
        message = "Error loading Puz configuration information ";
        openModal(message);
        fadeModal(2000);
        return false;
      }
   }));

   // Set studyarea boundary
   //	
   console.log("Studyarea boundary " + studyareaBoundary);
   if(studyareaBoundary)
     {
      console.log("Retrieving studyarea boundary " + studyareaBoundary);

      // Request for basin boundary
      //
      var request_type = "GET";
      var script_http  = studyareaBoundary;
      var data_http    = "";
      var dataType     = "json";
      
      // Web request
      //
       webRequests.push($.ajax( {
         method:   request_type,
         url:      script_http,
         data:     data_http,
         dataType: dataType,
         success: function (myData) {
           message = "Processed studyarea boundary information";
           openModal(message);
           fadeModal(2000);
           
           studtyareaJson = myData;
         },
         error: function (error) {
           message = `Failed to load studyarea boundary information ${error}`;
           openModal(message);
           fadeModal(2000);
           return false;
         }
      }));
     }

   // Run ajax requests
   //
   $.when.apply($, webRequests).then(function() {

        fadeModal(2000);

        // Build map
        //
        buildMap();
   });
  });

// Process project configuration information
//
function processConfigFile(myInfo) 
  {        
   console.log("Processing project configuration information");
   console.log(myInfo);

   aboutFiles         = myInfo.aboutFiles;
   rasters            = myInfo.rasters;
   latlong_projection = myInfo.latlong_projection;
   raster_projection  = myInfo.raster_projection;
   raster_coordinates = { northwest: { x: myInfo.northwest_x, y: myInfo.northwest_y } };
   northwest_x       = myInfo.northwest_x;
   northwest_y       = myInfo.northwest_y;
   northeast_x       = myInfo.northeast_x;
   northeast_y       = myInfo.northeast_y;
   southeast_x       = myInfo.southeast_x;
   southeast_y       = myInfo.southeast_y;
   southwest_x       = myInfo.southwest_x;
   southwest_y       = myInfo.southwest_y;
   raster_polygon     = [];
   noDataValue        = myInfo.noDataValue;
   xy_multiplier      = myInfo.xy_multiplier;
   xy_units           = myInfo.xy_units;
   z_multiplier       = myInfo.z_multiplier;
   z_units            = myInfo.z_units;
   graph_x_axis       = myInfo.graph_x_axis;
   graph_y_axis       = myInfo.graph_y_axis;
   color_file         = myInfo.color_file;

   return;

  }
