#!/usr/bin/env python3
###############################################################################
# $Id$
#
# Project:  Rasterio Python framework_location
# Purpose:  This script produces geologic information of subsurface layers for
#           a single location point. The subsurface layers are represented by
#           one or more rasters that represent the land surface elevation 
#           and the underlying the geologic units or other subsurface features.
#
# Author:   Leonard Orzol <llorzol@usgs.gov>
#
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

import os, sys, string, re

import numpy as np
import rasterio
import rasterio.warp

import json

import csv

# Set up logging
#
import logging

# -- Set logging file
#
# Create screen handler
#
screen_logger = logging.getLogger()
formatter     = logging.Formatter(fmt='%(message)s')
console       = logging.StreamHandler()
console.setFormatter(formatter)
screen_logger.addHandler(console)
screen_logger.setLevel(logging.ERROR)
#screen_logger.setLevel(logging.INFO)
screen_logger.propagate = False

# Import modules for CGI handling
#
from urllib.parse import parse_qs

# ------------------------------------------------------------
# -- Set
# ------------------------------------------------------------

program      = "USGS PUZ Raster Location Script"
version      = "3.12"
version_date = "September 24, 2024"
usage_message = """
Usage: framework_location.py
                [--help]
                [--usage]
                [--longitude               Provide a numeric longitude value]
                [--latitude                Provide a numeric latitude value]
                [--x                       Provide a numeric x coordinate in the raster coordinate projection]
                [--y                       Provide a numeric y coordinate in the raster coordinate projection]
                [--raster                  Provide a set of rasters from land surface to bedrock (descending order)]
"""

# =============================================================================
def errorMessage(error_message):

    print("Content-type: application/json\n")
    print('{')
    print(' "status"        : "failed",')
    print(' "message": "%s" ' % error_message)
    print('}')
    
    sys.exit()

# =============================================================================

# ----------------------------------------------------------------------
# -- Main program
# ----------------------------------------------------------------------

Arguments = {}
rastersL  = []
raster_legend = {}
 
# Current directory
#
currentDir = os.path.dirname(__file__)

# Parse the Query String
#
params = {}
 
HardWired = None
#HardWired = 1

if HardWired is not None:
    os.environ['QUERY_STRING'] = 'longitude=-122.77619933243842&latitude=45.5750234451687&x_coordinate=517461.59321849514&y_coordinate=5046855.801476283&rasters=app/tiffs/lsd.tif%20app/tiffs/dtw.tif%20app/tiffs/wtele.tif%20app/tiffs/uncer.tif'

# Check URL
#
QUERY_STRING = ''

if 'QUERY_STRING' in os.environ:
    QUERY_STRING = str(os.environ['QUERY_STRING'])
    
screen_logger.info('\nQUERY_STRING: %s' % QUERY_STRING)
  
if len(QUERY_STRING) > 0:
    
    queryString = os.environ['QUERY_STRING']

    queryStringD = parse_qs(queryString, encoding='utf-8')
    screen_logger.info('\nqueryStringD %s' % str(queryStringD))

    # List of arguments
    #
    myParmsL = [
        'longitude',
        'latitude',
        'x_coordinate',
        'y_coordinate',
        'rasters'
       ]
    parmL    = list(myParmsL)
    missingL = []
    
    # Check arguments
    #
    querySet = set(queryStringD.keys())
    argsSet  = set(myParmsL)
    missingL = list(argsSet.difference(querySet))
    screen_logger.info('Arguments missing %s' % str(missingL))

    # Check other arguments
    #
    if len(missingL) > 0:
        errorL = []
        if 'raster' in missingL:
            errorL.append('%s' % 'Provide a set of rasters from land surface to bedrock (descending order)')
        elif 'longitude' in missingL:
            errorL.append('%s' % 'Provide a numeric longitude value')
        elif 'latitude' in missingL:
            errorL.append('%s' % 'Provide a numeric latitude value')
        elif 'x_coordinate' in missingL:
            errorL.append('%s' % 'Provide a numeric x_coordinate value')
        elif 'y_coordinate' in missingL:
            errorL.append('%s' % 'Provide a numeric y_coordinate value')
        elif 'color' in missingL:
            errorL.append('%s' % 'Provide a color specification file name containing a list of description and colors for each raster')

        errorMessage('%s' % ', '.join(errorL))
    
    # Check rasters
    #
    rastersL = re.split(r"[-;,\s]\s*", queryStringD['rasters'][0])
    tempL    = list(rastersL)
    screen_logger.info('\nRasters: %s' % ' '.join(rastersL))

    if len(rastersL) < 1:
        errorMessage('%s' % 'Provide a set of rasters from land surface to bedrock (descending order)')

    while len(tempL) > 0:
        rasterFile  = str(tempL.pop(0))
        #rasterFile = os.path.join(currentDir, rasterFile)

        if not os.path.isfile(rasterFile):
            errorMessage('Error: Raster file %s does not exist' % rasterFile)

    # Real numbers
    #             regex "^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$"
    #
    for myParm in ['longitude', 'latitude', 'x_coordinate', 'y_coordinate']:

        myArg = queryStringD[myParm][0]

        myMatch = bool(re.search(r"^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$", myArg))

        # Argument failed regex
        #
        if not myMatch:
            errorMessage('Provide a numeric value for %s' % myParm)

        if myParm == 'longitude':
            longitude = float(myArg)
        elif myParm == 'latitude':
            latitude = float(myArg)
        elif myParm == 'x_coordinate':
            x_coordinate = float(myArg)
        elif myParm == 'y_coordinate':
            y_coordinate = float(myArg)
            
        screen_logger.info('\n%s: %s' % (myParm, str(myArg)))

# Set rasters
#
if len(rastersL) > 0:

    rasterD    = {}
    rasters    = []
    units      = []
    tempL      = list(rastersL)
    nrows      = None
    ncols      = None
    nlays      = len(rastersL)
    row        = None
    col        = None
    cell_size  = None
    cell       = None
    cell_count = 0
    bounds     = None

    while len(tempL) > 0:

        rasterFile  = str(tempL.pop(0))
        NoData      = None
        rasterValue = None
        maximum     = None
        minimum     = None
        nodata      = None
            
        if not os.path.isfile(rasterFile):
            errorMessage('Error: Raster file %s does not exist' % rasterFile)

        # Remove suffix .tif
        #
        (root, tif_suffix)   = os.path.splitext(rasterFile)
        if tif_suffix is not None:
            (dir, raster) = os.path.split(root)

        # Build list of rasters
        #
        rasters.append(raster)

        # Read raster bands directly to Numpy arrays.
        #
        try:
            #with rasterio.open(rasterFile, 'r+') as rc:
            with rasterio.open(rasterFile) as rc:
                
                # General information for rasters
                #
                if bounds is None:
                    screen_logger.info('\n\nGeneral information for rasters')
                    kwds = rc.profile
                    #screen_logger.info(kwds)
                    bounds = rc.bounds
                    screen_logger.info('\t%s' % str(bounds))
                    ncols = rc.width
                    #screen_logger.info('Number of columns %s' % str(ncols))
                    nrows = rc.height
                    #screen_logger.info('Number of rows %s' % str(nrows))
                    shape = rc.shape
                    screen_logger.info('\tRaster shape (columns %s (x coordinate) rows %s (y coordinate) ' % (str(ncols), str(nrows)))

                    # Determine CRS parameters
                    #
                    rasterCrs = rc.crs
                    screen_logger.info('\tCoordinate system %s' % str(rasterCrs))
                    
                    # Determine Affine parameters
                    #
                    rasterAffine = rc.transform
                    #screen_logger.info('\tAffine %s' % str(rasterAffine))

                    # Determine origin coordinates
                    #
                    origin_x, origin_y = rc.transform * (0, 0)
                    screen_logger.info('\tOrigin %s %s' % (str(origin_x), str(origin_y)))

                    # Determine row and column from coordinates
                    #
                    transformer = rasterio.transform.AffineTransformer(rasterAffine)
                    (row, col) = transformer.rowcol(float(x_coordinate), float(y_coordinate))
                    cell_count += 1
                    screen_logger.info('\tRaster row %s col %s' % (str(row), str(col)))

                    # Bounding box of cell
                    #
                    geoInfo   = rc.transform
                    cell_x_size = geoInfo[0]
                    screen_logger.info('\tColumn cell size %s (x direction)' % str(cell_x_size))
                    cell_y_size = geoInfo[4]
                    screen_logger.info('\tRow cell size %s (y direction)' % str(cell_y_size))
                    
                    x = col
                    y = row
                    upper_left  = rc.transform * (x, y) 
                    screen_logger.info('\tCell upper_left  %s' %  str(upper_left))
                    
                    x = col + 1
                    y = row
                    upper_right  = rc.transform * (x, y)
                    screen_logger.info('\tCell upper_right %s' % str(upper_right))
                    
                    x = col + 1
                    y = row + 1
                    lower_right = rc.transform * (x, y)
                    screen_logger.info('\tCell lower_right %s' %  str(lower_right))
                    
                    x = col
                    y = row + 1
                    lower_left  = rc.transform * (x, y)
                    screen_logger.info('\tCell lower_left  %s' %  str(lower_left))
                    
                    cell = [ upper_left, upper_right, lower_right, lower_left]
                    #screen_logger.info('\tCell %s' %  str(cell))

                    # Computing row/col
                    #
                    rowEst = abs(origin_y - float(y_coordinate)) / cell_y_size
                    colEst = abs(origin_x - float(x_coordinate)) / cell_x_size
                    screen_logger.info('\tEstimated Raster row %s col %s' % (str(rowEst), str(colEst)))

                    py, px = rc.index(float(x_coordinate), float(y_coordinate))
                    screen_logger.info('\tPixel location column x %s row y %s' % (str(px), str(py)))

                screen_logger.info('\nProcessing raster %s' % raster)

                noData = rc.nodata
                screen_logger.info('\tnoData %s' % str(noData))

                # Raster cell value
                #
                rasterData = rc.read(1, masked=True)
                #screen_logger.info('Raster value %s' % str(rasterData))

                rasterValue = rasterData[abs(row)][abs(col)]
                if str(rasterValue) != '--':

                    units.append(raster)
                    
                else:
                    rasterValue = 'null'                    
                screen_logger.info('\tRaster cell value %s' % str(rasterValue))

                # Min/max of raster with nodata values
                #
                rasterMin    = rasterData.min()
                screen_logger.info('\tRaster minimum %s' % str(rasterMin))
                rasterMax    = rasterData.max()
                screen_logger.info('\tRaster maximum %s' % str(rasterMax))
                rasterMean   = rasterData.mean()
                screen_logger.info('\tRaster mean %s' % str(rasterMean))
                rasterData = rc.read(1)
                rasterArray = rasterData[rasterData != noData]
                rasterMedian = np.median(rasterArray)
                screen_logger.info('\tRaster median %s' % str(rasterMedian))

        except:
            errorMessage('Error: Opening and reading raster %s' % rasterFile)

        # Store raster information
        #
        rasterD[raster] = {
            'name'    : raster,
            'value'   : rasterValue,
            'maximum' : rasterMax,
            'minimum' : rasterMin,
            'mean'    : rasterMean,
            'median'  : rasterMedian,
            'nodata'  : noData
         }

    screen_logger.info('\nDone reading rasters')

    x_min = 0.0
    x_max = cell_x_size

    # Output raster information
    #
    if len(rastersL) > 0:
        # Begin JSON format
        #
        jsonL = []
        jsonL.append('{')
        jsonL.append('  "status"        : "%s",' % "success")
        jsonL.append('  "nrows"         : %15d,' % nrows)
        jsonL.append('  "ncols"         : %15d,' % ncols)
        jsonL.append('  "nlays"         : %15d,' % nlays)

        jsonL.append('  "longitude"     : %15f,' % float(longitude))
        jsonL.append('  "latitude"      : %15f,' % float(latitude))
        jsonL.append('  "easting"       : %15f,' % float(x_coordinate))
        jsonL.append('  "northing"      : %15f,' % float(y_coordinate))
        jsonL.append('  "row"           : %15d,' % float(row))
        jsonL.append('  "column"        : %15d,' % float(col))

        jsonL.append('  "cell_width"    : %15f,' % cell_x_size)

        screen_logger.info('\nDone with general information\n')

        # Build cell information
        #
        jsonL.append('  "cell" : ')
        jsonL.append('             [')
        lines = []
        while len(cell) > 0:
            x, y = cell.pop(0)
            line  = '              {'
            line += ' "x": %15f,' % x
            line += ' "y": %15f' %  y
            line += ' }'

            lines.append(line)

        jsonL.append(',\n'.join(lines))

        jsonL.append('             ], ')

        # Build explanation
        #
        jsonL.append('  "raster_fields": [ "raster", "value", "maximum", "minimum", "nodata" ],')

        jsonL.append('  "rasters" : ')
        jsonL.append('             [')
    
        lines = []
        for raster in rasters:
    
            line  = '              {'
            line += ' "raster": "%s",' % raster
            line += ' "value": %s,' % str(rasterD[raster]['value'])
            line += ' "maximum": %s,' % str(rasterD[raster]['maximum'])
            line += ' "minimum": %s,' % str(rasterD[raster]['minimum'])
            line += ' "nodata": %s' % str(rasterD[raster]['nodata'])
            line += ' }'
            lines.append(line)

        jsonL.append(',\n'.join(lines))

        jsonL.append('             ], ')

        screen_logger.info('Done with cell information\n')

        jsonL.append('  "cell_count":    %15d'   % len(rasters))

        jsonL.append('}');

    else:
        errorMessage('Error: writing raster information')
        
    print('Content-type: application/json\n')

    print('\n'.join(jsonL))
    
else:

    usage_message = ", ".join([
    'Provide a longitude value',
    'Provide a latitude value',
    'Provide a x coordinate in the raster coordinate projection',
    'Provide a y coordinate in the raster coordinate projection',
    #'Provide a path to directory containing the set of rasters',
    'Provide a set of rasters from land surface to bedrock (descending order)'
    ])
    errorMessage(usage_message)

sys.exit()
