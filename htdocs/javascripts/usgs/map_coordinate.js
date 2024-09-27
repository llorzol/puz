/**
 * Namespace: Map_Coordinate
 *
 * Map_Coordinate is a JavaScript library to project "on-the-fly" a set on input
 *  coordinates to several other projections such as UTM and others.
 *
 * version 1.24
 * August 25, 2017
*/

/*
###############################################################################
# Copyright (c) 2017 Oregon Water Science Center
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

// Provide coordinates to cursor location
//
function showCoordinates(evt) 
  {
    jQuery("#mousepointLatLng").html(evt.lng.toFixed(3) + ", " + evt.lat.toFixed(3));
    var dms_coordinates = LatLong2DMS(mp);
    jQuery("#mousepointDMS").html(dms_coordinates.x.toFixed(3) + ",  " + dms_coordinates.y.toFixed(3));
    var utm_coordinates = LatLong2Utm(mp);
    jQuery("#mousepointUTM").html(utm_coordinates.x.toFixed(3) + ", " + utm_coordinates.y.toFixed(3) + "  meters  Zone " + utm_coordinates.utm_zone);
    var stateplane_coordinates = LatLong2StatePlane(mp);
    jQuery("#mousepointStatePlane").html(stateplane_coordinates.x.toFixed(3) + ",  " + stateplane_coordinates.y.toFixed(3) + "  feet");
 }

// Convert geographic coordinates to UTM coordinates
//
function LatLong2Utm(mp) 
  {
    utm_zone                   = parseInt( 1 +  ( mp.lng + 180.0 ) / 6.0 );
    proj4.defs["EPSG:32634"]   = "+proj=utm +zone=" + utm_zone + " +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
    var source                 = new proj4("EPSG:4326");
    var dest                   = new proj4('EPSG:32634');
    var utm_coordinates        = proj4(source, dest, [mp.lng, mp.lat]);
    utm_coordinates.utm_zone   = utm_zone;
    return utm_coordinates;
  }

// Convert geographic coordinates to DMS
//  
function LatLong2DMS(map_coordinates)
  {
    var ns     = ( 1.0 * mp.lat < 0 ) ? 'S' : 'N';
    var lat    = Math.abs( 1.0 * mp.lat);
    var latdeg = Math.floor(lat);
    var latmin = Math.floor( 60.0 * ( lat - latdeg ) );
    var latsec = 60.0 * ( 60.0 * ( lat - latdeg ) - latmin );

    var ew     = ( 1.0 * mp.lng > 0 ) ? 'E' : 'W';
    var lon    = Math.abs( 1.0 * mp.lng );
    var londeg = Math.floor(lon);
    var lonmin = Math.floor( 60.0 * ( lon - londeg ) );
    var lonsec = 60.0 * ( 60.0 * ( lon - londeg ) - lonmin );
   
    var dms_long = String(londeg) + "&deg " + String(lonmin) + "\' " + lonsec.toFixed(3) + "\" " + ew;
    //alert("is this working "+ dms_lat );
    var dms_lat   = String(latdeg) + "&deg " + String(latmin) + "\' " + latsec.toFixed(3) + "\" " + ns;
    var dms_coordinates = {x : dms_long, y : dms_lat};
    return dms_coordinates;
  }
  
// Convert UTM coordinates to geographic coordinates
//
function Utm2LatLong(raster_projection, mp) 
  {
    proj4.defs["EPSG:32634"]   = raster_projection;
    var dest                   = new proj4("EPSG:4326");
    var latlong_coordinates    = proj4(source, dest, [mp.x, mp.y]);
    return latlong_coordinates;
  }

// Convert geographic coordinates to State plane coordinates
//
function LatLong2StatePlane(map_coordinates) 
  {
    Proj4js.defs["EPSG:32634"] = "+proj=utm +zone=" + utm_zone + " +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
    var source                 = new Proj4js.Proj("EPSG:4326");
    Proj4js.defs["EPSG:9822"]  = "+proj=lcc +lat_1=46 +lat_2=44.33333333333334 +lat_0=43.66666666666666 +lon_0=-120.5 +x_0=2500000.0001424 +y_0=0 +ellps=GRS80 +to_meter=0.3048 +no_defs";
    var dest                   = new Proj4js.Proj('EPSG:9822');
    var stateplane_coordinates = new Proj4js.Point(mp.lng, mp.lat);
    Proj4js.transform(source, dest, stateplane_coordinates);
    return stateplane_coordinates;
  }

// Convert user specified coordinates
//
function User2User(in_coordinates, in_projection, out_projection) 
  {
    //alert("Coordinates " + in_coordinates.x + ", " + in_coordinates.y);
    //proj4.defs["EPSG:99998"]   = in_projection;
    //var source                 = new proj4("EPSG:99998");
    //proj4.defs["EPSG:99999"]   = out_projection;
    //var dest                   = new proj4('EPSG:99999');
    var out_coordinates        = proj4(in_projection, out_projection, [in_coordinates.x, in_coordinates.y]);
    //alert("Out Coordinates " + out_coordinates.x + ", " + out_coordinates.y);

    return out_coordinates;
  }

function DMS2dec(long, lat)
  {
   // Build longitude
   //
   var longdeg = long.substring(0,2);
   var longmin = long.substring(2,4);
   var longsec = long.substring(4);
    
   long        = (parseFloat(longdeg) + parseFloat(longmin)/60 + parseFloat(longsec)/3600) * -1;

   // Build latitude
   //
   var latdeg  = lat.substring(0,2);
   var latmin  = lat.substring(2,4);
   var latsec  = lat.substring(4);
    
   lat         = (parseFloat(latdeg) + parseFloat(latmin)/60 + parseFloat(latsec)/3600);

   return [lat, long];
  }

