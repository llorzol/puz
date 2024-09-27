/**
 * Namespace: Framework_Tools
 *
 * Framework_Tools is a JavaScript library to read framework information such as
 * projection and boundary information.
 *
 * version 2.03
 * June 20, 2023
*/

/*
###############################################################################
# Copyright (c) Oregon Oregon Water Science Center
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
   
// Request Framework information from json file
//
function getInfo(myFile) 
  {
    //alert("Grabbing framework parameters from " + myFile);

    var myInfo      = {};

    $.support.cors  = true;
    jQuery.ajax( 
                { url: myFile + "?_="+(new Date()).valueOf(),
                  dataType: "json",
                  timeout: 5000,
                  async: false
                })
      .done(function(data)
            {
              myInfo  = parseInfo(data);
            })
      .fail(function() { 
          var message = "Error reading framework configuration file " + myFile;
          console.log(message);
          openModal(message);
          fadeModal(6000);
        });

    return myInfo;

  }

function parseInfo(json) 
  {
    return json;               
  }

function setBounds(raster_projection,
                   latlong_projection,
                   northwest_x, northwest_y,
                   northeast_x, northeast_y,
                   southwest_x, southwest_y,
                   southeast_x, southeast_y
                  ) 
  {
    // Northwest corner
    // 
    raster_northwest             = northwest_x + "," + northwest_y;
    raster_x_origin              = northwest_x;
    raster_y_origin              = northwest_y;

    var latlong_coordinate     = proj4(raster_projection, latlong_projection, [raster_x_origin, raster_y_origin]);

    var long_nw                = latlong_coordinate[0];
    var lat_nw                 = latlong_coordinate[1];
                                                                 
    var framework_min_x        = raster_x_origin;
    var framework_max_x        = raster_x_origin;
    var framework_min_y        = raster_y_origin;
    var framework_max_y        = raster_y_origin;
                                                                 
    // Northeast corner
    // 
    raster_northeast             = northeast_x + "," + northeast_y;
    raster_x_northeast           = northeast_x;
    raster_y_northeast           = northeast_y;

    var latlong_coordinate     = proj4(raster_projection, latlong_projection, [raster_x_northeast, raster_y_northeast]);

    var long_ne                = latlong_coordinate[0];
    var lat_ne                 = latlong_coordinate[1];
                                                                 
    if(raster_x_northeast > framework_max_x) { framework_max_x = raster_x_northeast; }
    if(raster_x_northeast < framework_min_x) { framework_min_x = raster_x_northeast; }
    if(raster_y_northeast > framework_max_y) { framework_max_y = raster_y_northeast; }
    if(raster_y_northeast < framework_min_y) { framework_min_y = raster_y_northeast; }
                                                                 
    // Southeast corner
    // 
    raster_southeast             = southeast_x + "," + southeast_y;
    raster_x_southeast           = southeast_x;
    raster_y_southeast           = southeast_y;

    var latlong_coordinate     = proj4(raster_projection, latlong_projection, [raster_x_southeast, raster_y_southeast]);

    var long_se                = latlong_coordinate[0];
    var lat_se                 = latlong_coordinate[1];
                                                                 
    if(raster_x_southeast > framework_max_x) { framework_max_x = raster_x_southeast; }
    if(raster_x_southeast < framework_min_x) { framework_min_x = raster_x_southeast; }
    if(raster_y_southeast > framework_max_y) { framework_max_y = raster_y_southeast; }
    if(raster_y_southeast < framework_min_y) { framework_min_y = raster_y_southeast; }
                                                                 
    // Southwest corner
    // 
    raster_southwest             = southwest_x + "," + southwest_y;
    raster_x_southwest           = southwest_x;
    raster_y_southwest           = southwest_y;

    var latlong_coordinate     = proj4(raster_projection, latlong_projection, [raster_x_southwest, raster_y_southwest]);

    var long_sw                = latlong_coordinate[0];
    var lat_sw                 = latlong_coordinate[1];
                                                                 
    if(raster_x_southwest > framework_max_x) { framework_max_x = raster_x_southwest; }
    if(raster_x_southwest < framework_min_x) { framework_min_x = raster_x_southwest; }
    if(raster_y_southwest > framework_max_y) { framework_max_y = raster_y_southwest; }
    if(raster_y_southwest < framework_min_y) { framework_min_y = raster_y_southwest; }
                                                  
    // Framework boundary
    // 
    framework = [
                  {x: long_nw, y: lat_nw}, 
                  {x: long_ne, y: lat_ne}, 
                  {x: long_se, y: lat_se}, 
                  {x: long_sw, y: lat_sw}, 
                  {x: long_nw, y: lat_nw}
                 ]; 
                                                                 
    // Framework grid center
    // 
    var framework_x            = ( framework_min_x + framework_max_x ) * 0.50;
    var framework_y            = ( framework_min_y + framework_max_y ) * 0.50;

    var latlong_coordinate     = proj4(raster_projection, latlong_projection, [framework_x, framework_y]);

    var framework_ctr          = {
                                  long: latlong_coordinate[0], 
                                  lat : latlong_coordinate[1], 
                                 };

    var p_min                  = proj4(raster_projection, latlong_projection, [framework_min_x, framework_min_y]);
    var p_max                  = proj4(raster_projection, latlong_projection, [framework_max_x, framework_max_y]);

    framework_bnds             = {
                                  long_min: p_min[0], lat_min: p_min[1], 
                                  long_max: p_max[0], lat_max: p_max[1] 
                                 };

    return framework_bnds;               
  }

// Load text
//
function loadText(file_name) 
  {
    var myInfo = "";

    // Check file name
    //
    if(file_name.length < 1)
      {
        var message = "No file specified";
        openModal(message);
        fadeModal(4000);
        return;
      }

    // Load file
    //
    jQuery.ajax( 
                { url: file_name + "?_="+(new Date()).valueOf(),
                  dataType: "text",
                  async: false
                })
      .done(function(data)
            {
              myInfo = data;
            })
      .fail(function() 
            { 
              var message = "No file specified";
              openModal(message);
              fadeModal(4000);
              return;
            });

    return myInfo;
  }
