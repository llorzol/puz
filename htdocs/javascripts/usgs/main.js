/**
 * Namespace: Main
 *
 * Main is a JavaScript library to provide a set of functions to manage
 *  the web requests.
 *
 * $Id: /var/www/html/puz/javascripts/usgs/main.js, v 3.17 2026/09/14 16:28:07 llorzol Exp $
 * $Revision: 3.17 $
 * $Date: 2026/09/14 16:28:07 $
 * $Author: llorzol $
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

// loglevel
//
let myLogger = log.getLogger('myLogger');
//myLogger.setLevel('debug');
myLogger.setLevel('info');

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
var studyareaBoundary  = 'gis/studyarea.geojson';

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
    let urls = [];

    // Insert accordion text
    //
    jQuery.each(aboutFiles, function(keyItem, keyFile) {

        // Request for accordion text information
        //
        //let Url = `${keyFile} + "?_="+(new Date()).valueOf()`
        let Url = `${keyFile}`

        // Web request
        //
        urls.push(`${Url}`);
    });

    // Call the async function
    //
    webRequests(urls, 'text', processAboutFiles)
});

// Process about files information
//
function processAboutFiles(myInfo) {
    myLogger.info("processAboutFiles");
    //myLogger.info(myInfo);
    
    jQuery.each(aboutFiles, function(keyItem, keyFile) {
        jQuery("#" + keyItem).html(myInfo.shift());
    });

    // Build ajax requests
    //
    let urls = [];

    // Web request
    //
    if(studyareaBoundary) {
        urls.push(`${studyareaBoundary}`);

        // Call the async function
        //
        webRequests(urls, 'json', processStudyBoundary)
    }
}

// Process study boundary information
//
function processStudyBoundary(myData) {
    myLogger.info("processStudyBoundary");

    StudyBoundary = myData[0]

    // Build map
    //
    buildMap ()
}

// Process project configuration information
//
function processConfigFile(myInfo) {
    myLogger.info("Processing project configuration information");
    myLogger.debug(myInfo);
    for (let key in myInfo) {
        globalThis[key] = myInfo[key]
    }

    return;

}

// Process project configuration information
//
function processConfigFileOld(myInfo) 
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