#!/usr/bin/python3

#!/usr/bin/env python
###############################################################################
# $Id$
#
# Project:  Framework Utilities
# Purpose:  This script provides support utility functions for framework python
#           scripts.
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
    from gdalconst import *

#
# Version
#
program      = "USGS Framework Utility Script"
version      = "3.02"
version_date = "December 21, 2023"
    
# =============================================================================
def CheckRasters(rasters, x_origin, y_origin, rows, cols):

    # Check rasters for extent, cell sizes, rows, and columns
    #
    for i in range(len(rasters)):
    
        if i > 0:
            raster         = rasters[i]
            raster_name    = raster[0]
            rc             = raster[1]
    
            # Gather raster projection information
            #
            projection     = rc.GetProjection()
            geotransform   = rc.GetGeoTransform()
            ncols          = rc.RasterXSize
            nrows          = rc.RasterYSize
            nbands         = rc.RasterCount

            # Set grid origin
            #
            xorigin        = geotransform[0]
            yorigin        = geotransform[3]
            x_cell_size    = geotransform[1]
            y_cell_size    = geotransform[5]
    
            # Gather raster projection information
            #
            projection     = rc.GetProjection()
            geotransform   = rc.GetGeoTransform()
            icols          = rc.RasterXSize
            irows          = rc.RasterYSize
            ibands         = rc.RasterCount

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

            inband         = rc.GetRasterBand(ibands)

            min = inband.GetMinimum()
            max = inband.GetMaximum()
            if min is None or max is None:
                (min,max) = inband.ComputeRasterMinMax(1)
        
            noDataValue = rc.GetRasterBand(1).GetNoDataValue()
            if min == -3.4028234663852886e+038:
                noDataValue = -3.4028234663852886e+038
                min = None
    
            # Check information
            #
            if ncols != cols:
                display_error("Error: raster %s has cols %d to correct %d" % (raster_name, ncols, cols))
            if nrows != rows:
                display_error("Error: raster %s has rows %d to correct %d" % (raster_name, nrows, rows))
            if xorigin != x_origin:
                display_error("Error: raster %s has X origin %d to correct %d" % (raster_name, xorigin, x_origin))
            if yorigin != y_origin:
                display_error("Error: raster %s has Y origin %15.6f to correct %15.6f" % (raster_name, yorigin, y_origin))
            
    return

# =============================================================================
def getRasterValue(raster_name, col, row, raster):

    RasterVal = None
    NoData    = None
        
    band = raster.GetRasterBand(1)
    if (band.GetNoDataValue() == None):
        band.SetNoDataValue(-9999)
    NoData = band.GetNoDataValue()
    
    cols = band.XSize
    rows = band.YSize
  
    geotransform = raster.GetGeoTransform()
    cellSizeX    = geotransform[1]
    cellSizeY    = -1 * geotransform[5]

    # Check extent
    #
    xLoc = col
    if((xLoc < 0) or (xLoc > cols)):
        #print('x coordinate out of bounds')
        return RasterVal, NoData
  
    yLoc = row
    if((yLoc < 0) or (yLoc > rows)):
        #print('y coordinate out of bounds')
        return RasterVal,NoData

    strRaster = band.ReadAsArray(xLoc, yLoc, 1, 1)
    dblValue  = strRaster[0,0]

    if dblValue == NoData:
        RasterVal = None
    elif dblValue == -3.4028234663852886e+038:
        RasterVal = None
    else:
        RasterVal = ("%.3f" % dblValue)
  
    return RasterVal, NoData

# =============================================================================
def get_max_min(min_value, max_value):
 
    factor         = 0.01 
    interval_shift = 0.67;
    delta          = max_value - min_value
 
    interval       = factor; 
    delta          = delta / 5.0; 
     
    # Determine interval 
    # 
    while delta > factor:
        if delta <= (factor * 1):
            interval = factor * 1
        elif (delta <= (factor * 2)):
            interval = factor * 2
        elif (delta <= (factor * 2.5)):
            if (factor < 10.0):
                interval = factor * 2
            else :
                interval = factor * 2.5
        elif (delta <= (factor * 5)):
            interval = factor * 5
        else:
            interval = factor * 10 
        factor = factor * 10 
     
    # Maximum 
    # 
    factor = int(max_value / interval)
    value  = factor * interval
    if(max_value > value ):
        value = (factor + 1) * interval; 
 
    if(abs(max_value - value) <= interval_shift * interval):
        max_value = value + interval
    else:
        max_value = value
     
    # Minimum 
    # 
    factor = int(min_value / interval)
    value  = int(factor * interval)
    if(min_value < value ):
        value = (factor - 1) * interval; 
 
    if(abs(min_value - value) <= interval_shift * interval):
        min_value = value - interval
    else:
        min_value = value
     
    return min_value,max_value,interval; 

# =============================================================================
def ReadColor (color_file):

    import re

    ncolors  = 0
    colors   = {}

    # Open specification file
    #
    fh = open(color_file, 'r')
    if fh is None:
        display_error("\n\tError: Can not open specification file %s \n\n" % color_file)
        
    # Remove user comment lines
    #
    while fh:
        line = fh.readline()
        if line[0] != "#" and line[0] != "@":
            break

    # Header line
    #
    line        = line.strip("\n|\r")
    cols        = line.split()
    nFields     = len(cols)
    i           = 0

    if nFields < 3:
        errorLines = []
        errorLines.append("Error: Need at least 3 fields in the specification file %s" % color_file)
        errorLines.append("\t First field is identifier")
        errorLines.append("\t Second field is description")
        errorLines.append("\t Third field is color model description [RGB or CMYK only]")
        display_error('\n'.join(errorLines))
    
    zone        = cols[i]
    i          += 1
    description = cols[i]
    i      += 1
    color_model = cols[i]
        
    # Remove user comment lines
    #
    for line in fh:
        
        line = line.strip("\n|\r")
        ncolors    += 1
        cols        = line.split("\t")

        i           = 0
        zone        = float(cols[i])
        i      += 1
        color_specs = cols[i]
        i          += 1
        description = cols[i]

        if not zone in colors:
            colors[zone] = {}
        colors[zone]['description'] = description
        colors[zone]['color']       = color_specs        
        
    # Close file
    #
    fh.close()

    # Return
    #
    return colors

# =============================================================================
def rgb2cmyk (r,g,b):

    import math
    
    computedC = 0.0
    computedM = 0.0
    computedY = 0.0
    computedK = 0.0

    if r == 0 and g == 0 and b == 0:
        computedK = 1.0

    else:
        computedC = 1.0 - ( r / 255.0 )
        computedM = 1.0 - ( g / 255.0 )
        computedY = 1.0 - ( b / 255.0 )

        minCMY = min(computedC,min(computedM,computedY))
        
        computedC = ( computedC - minCMY ) / ( 1 - minCMY )
        computedM = ( computedM - minCMY ) / ( 1 - minCMY )
        computedY = ( computedY - minCMY ) / ( 1 - minCMY )
        computedK = minCMY

    # Return
    #
    return [ ("%.4f" % computedC), ("%.4f" % computedM), ("%.4f" % computedY), ("%.4f" % computedK)]

# =============================================================================
def RGBToHTMLColor(rgb_tuple):
    """ convert an (R, G, B) tuple to #RRGGBB """
    hexcolor = '#%02x%02x%02x' % rgb_tuple
    # that's it! '%02x' means zero-padded, 2-digit hex values
    
    return hexcolor

# =============================================================================
def HTMLColorToRGB(colorstring):
    """ convert #RRGGBB to an (R, G, B) tuple """
    colorstring = colorstring.strip()
    if colorstring[0] == '#': colorstring = colorstring[1:]
    if len(colorstring) != 6:
        frameworkUtils("ValueError, Input #%s is not in #RRGGBB format" % colorstring)
    r, g, b = colorstring[:2], colorstring[2:4], colorstring[4:]
    r, g, b = [int(n, 16) for n in (r, g, b)]
    
    return (r, g, b)

# =============================================================================
def display_error (error_message):

    import sys

    print ("Content-type: application/json\n\n")
    print ("{")
    print ("  \"status\": \"fail\",")
    print ("  \"error\":  \"%s\"" % error_message)
    print ("}")

    sys.exit( 1 )
