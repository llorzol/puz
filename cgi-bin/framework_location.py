#!/usr/bin/python3

#!/usr/bin/env python
###############################################################################
# $Id$
#
# Project:  GDAL Python framework_location
# Purpose:  This script produces geologic information of subsurface layers for
#           a single location point. The subsurface layers are represented by
#           one or more rasters that represent the land surface elevation 
#           and the underlying the geologic units or other subsurface features.
#
# Author:   Leonard Orzol <llorzol@usgs.gov>
#
###############################################################################
# Copyright (c) Leonard Orzol <llorzol@usgs.gov>
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

try:
    from osgeo import osr
    from osgeo import gdal
    from osgeo.gdalconst import *
except ImportError:
    import gdal

import os
import sys
import random

import argparse

import frameworkUtils

program      = "USGS Location Script"
version      = "3.02"
version_date = "December 21, 2023"
usage_message = """
Usage: framework_location.py
                [--help]
                [--usage]
                [--longitude               Provide a longitude value]
                [--latitude                Provide a latitude value]
                [--x_coordinate            Provide a x coordinate in the raster coordinate projection]
                [--y_coordinate            Provide a y coordinate in the raster coordinate projection]
"""

# =============================================================================
def Usage():
    frameworkUtils.display_error("Error: usage_message")

# =============================================================================

# Initialize arguments
#
band_nu               = None
longitude             = None
latitude              = None
x_coordinate          = None
y_coordinate          = None
rasters               = []

# Set arguments
#
parser = argparse.ArgumentParser(prog=program)

parser.add_argument("--usage", help="Provide usage",
                    type=str)

parser.add_argument("--longitude", help="Provide a longitude value",
                    type=float, required=True)

parser.add_argument("--latitude", help="Provide a latitude value",
                    type=float, required=True)

parser.add_argument("--x_coordinate", help="Provide a x coordinate",
                    type=float, required=True)

parser.add_argument("--y_coordinate", help="Provide a y coordinate",
                    type=float, required=True)

parser.add_argument("--rasters", help="Provide a set of rasters from land surface to bedrock (descending order)",
                    type=str, required=True, nargs='+')

# Parse arguments
#
args = parser.parse_args()

# Longitude
#
if args.longitude:

    longitude = args.longitude

# Latitude
#
if args.latitude:

    latitude = args.latitude

# X coordinate
#
if args.x_coordinate:

    x_coordinate = args.x_coordinate

# Y coordinate
#
if args.y_coordinate:

    y_coordinate = args.y_coordinate

# Rasters
#
if args.rasters:

    while len(args.rasters) > 0:

        raster = str(args.rasters.pop(0))
            
        if not os.path.isfile(raster):
            frameworkUtils.display_error("Error: Raster file %s does not exist" % raster)

        rc = gdal.Open( raster, GA_ReadOnly )
    
        if rc is None:
            frameworkUtils.display_error("Error: Raster %s is not a raster" % raster)

        # Remove suffix .tif
        #
        (root, tif_suffix)   = os.path.splitext(raster)
        if tif_suffix is not None:
            (dir, raster) = os.path.split(root)

        rasters.append((raster, rc))

# Register drives
#
gdal.AllRegister()

# Gather raster information
#
raster_values   = {}
raster_x_origin = None
raster_y_origin = None

for raster in rasters:

    raster_name          = raster[0]
    rc                   = raster[1]

    raster_bands = rc.RasterCount
    if raster_bands > 0:
        inband           = rc.GetRasterBand(raster_bands)
        nodata           = rc.GetRasterBand(raster_bands).GetNoDataValue()
        sDT              = gdal.GetDataTypeName(inband.DataType).lower()
        datasize         = gdal.GetDataTypeSize(inband.DataType)
    
        raster_min       = inband.GetMinimum()
        raster_max       = inband.GetMaximum()
        if raster_min is None or raster_max is None:
            (raster_min,raster_max) = inband.ComputeRasterMinMax(1)
    
        if raster_min == -3.4028234663852886e+038:
            nodata     = -3.4028234663852886e+038
            raster_min = None
    
    # Gather raster projection information
    #
    projection     = rc.GetProjection()
    geotransform   = rc.GetGeoTransform()
    ncols          = rc.RasterXSize
    nrows          = rc.RasterYSize
    nbands         = rc.RasterCount
    
    parms          = osr.SpatialReference()
    parms.ImportFromWkt(str(projection))
    projcs         = parms.GetAttrValue('PROJCS')
    geogcs         = parms.GetAttrValue('GEOGCS')
    spheroid       = parms.GetAttrValue('SPHEROID')
    false_easting  = parms.GetProjParm('false_easting')
    false_northing = parms.GetProjParm('false_northing')
    datum          = parms.GetAttrValue('DATUM')
    units          = parms.GetAttrValue('UNIT')
    proj_name      = parms.GetAttrValue('PROJECTION')
    if parms.IsGeographic():
        geographic   = "Geographic"
    else:
        geographic   = "Projected"
    
    # Set raster origin
    #
    if raster_x_origin is None:
        raster_x_origin = float( "%.3f" % geotransform[0])
        raster_y_origin = float( "%.3f" % geotransform[3])
        x_cell_size     = geotransform[1]
        y_cell_size     = geotransform[5]
        
    else:
        x_origin = float( "%.3f" % geotransform[0])
        y_origin = float( "%.3f" % geotransform[3])
        
        if raster_x_origin != x_origin:
            frameworkUtils.display_error("Error: raster %s has a X origin %.3f to differ from %.3f" % (raster_name, x_origin, raster_x_origin))
        if raster_y_origin != y_origin:
            frameworkUtils.display_error("Error: raster %s has a X origin %.3f to differ from %.3f" % (raster_name, y_origin, raster_y_origin))
            

    # Set raster information
    #
    if raster_name not in raster_values:
        raster_values[raster_name] = {}
        
        raster_values[raster_name]['value']   = "null"
        raster_values[raster_name]['maximum'] = "null"
        raster_values[raster_name]['minimum'] = "null"
        raster_values[raster_name]['nodata']  = "null"

    if raster_max is not None:
        raster_values[raster_name]['maximum'] = raster_max
    if raster_min is not None:
        raster_values[raster_name]['minimum'] = raster_min
    if nodata is not None:
        raster_values[raster_name]['nodata'] = nodata

x_left      = raster_x_origin
x_right     = raster_x_origin + ncols * x_cell_size
y_upper     = raster_y_origin
y_lower     = raster_y_origin + nrows * y_cell_size

# Check well log coordinates
#
if x_coordinate < x_left or  x_coordinate > x_right:
    frameworkUtils.display_error("Error: starting x coordinate (%s) is outside of raster (range %s to %s)" % (x_coordinate, x_left, x_right))

if y_coordinate < y_lower or y_coordinate > y_upper:
    frameworkUtils.display_error("Error: starting y coordinate (%s) is outside of raster (range %s to %s)" % (y_coordinate, y_lower, y_upper))
   
# Compute row
#
row    = int( ( y_upper - y_coordinate ) / abs( y_cell_size ) )
   
row_nu = ( y_upper - y_coordinate ) / abs( y_cell_size )

upper  = y_origin - float(row) * abs( y_cell_size )

lower  = upper - abs( y_cell_size )

# Compute column
#
col    = int( abs( x_left - x_coordinate ) / x_cell_size )
   
col_nu = abs( x_left - x_coordinate ) / x_cell_size

left   = x_origin + float(col) * abs( x_cell_size )

right  = left + abs( x_cell_size )

cell   = [ [left,upper], [right,upper], [right,lower], [left,lower], [left,upper] ] 

# Check rasters for extent and other vital information
#
#frameworkUtils.CheckRasters(rasters, x_origin, y_origin, nrows, ncols)

# Loop through rasters
#
band_nu       = 1
elevation_max = -9999999999999999.99
elevation_min =  9999999999999999.99
cell_count    = 0

# Loop through rasters
#
for raster in rasters:

    raster_name          = raster[0]
    rc                   = raster[1]
    (dir_path, dir_name) = os.path.split(raster_name)

    (RasterVal, NoData)  = frameworkUtils.getRasterValue( raster_name, col, row, rc)

    # Raster information
    #
    if RasterVal != "null":

        cell_count += 1

    if raster_name not in raster_values:
        raster_values[raster_name] = {}
        
    raster_values[raster_name]['value'] = RasterVal
                
# Check for rasters
#
if cell_count < 1:
    frameworkUtils.display_error("Warning: Site is outside the extent of the geologic units")    

# Output raster information
#
try:
    # Begin JSON format
    #
    print("Content-type: application/json\n")
    print("{")
    print("  \"status\"        : \"success\",")
    print("  \"nrows\"         : %15d," % nrows)
    print("  \"ncols\"         : %15d," % ncols)
    print("  \"nlays\"         : %15d," % len(rasters))
    
    print("  \"longitude\"     : %15.2f," % longitude)
    print("  \"latitude\"      : %15.2f," % latitude)
    print("  \"easting\"       : %15.2f," % x_coordinate)
    print("  \"northing\"      : %15.2f," % y_coordinate)
    print("  \"row\"           : %15d," % row)
    print("  \"column\"        : %15d," % col)
          
    print("  \"cell_width\"    : %15.2f," % x_cell_size)
    
    # Build cell information
    #
    print("  \"cell\" : ")
    print("             [")
    lines = []
    for corner in cell:
        line  = "              {"
        line += " \"x\": %s," % corner[0]
        line += " \"y\": %s" %  corner[1]
        line += " }"

        lines.append(line)

    print(",\n".join(lines))
    
    print("             ], ")

    # Build raster fields
    #
    print("  \"raster_fields\": [ \"raster\", \"value\", \"maximum\", \"minimum\", \"nodata\"],")
    
    print("  \"rasters\" : ")
    print("             [")

    # Draw rasters
    #
    lines = []
    for raster in rasters:

        raster_name   = raster[0]
        
        raster_value  = raster_values[raster_name]['value']
        raster_max    = raster_values[raster_name]['maximum']
        raster_min    = raster_values[raster_name]['minimum']
        raster_nodata = raster_values[raster_name]['nodata']

        # Set layer
        #
        line  = "              { "
        line += " \"raster\"   : \"%s\"," % raster_name
        line += " \"value\"    : %s," % raster_value
        line += " \"maximum\"  : %s," % raster_max
        line += " \"minimum\"  : %s," % raster_min
        line += " \"nodata\"  : %s" % raster_nodata
        line += " }"
            
        lines.append(line)

    print(",\n".join(lines))
    
    print("             ], ")
  
    print("  \"cell_count\":    %15d,"   % cell_count)
    print("  \"cell_width\":    %15.2f"  % x_cell_size)
      
    print("}");

except IOError:
    frameworkUtils.display_error("Error: Cannot create JSON output")
