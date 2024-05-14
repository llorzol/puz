#! /usr/bin/perl

=head1 NAME

Retrieves Framework geometry information at a single location

=head1 HISTORY

version 2.0 June 12, 2023
version 3.00 April 25, 2024

=head1 DESCRIPTION

This program retrieves Framework geometry information for a location
through set of rasters to produce a file of this geologic information
in JSON format.

=over 2

=head1 AUTHOR

Leonard L. Orzol 

U. S. Geological Survey - WRD

10615 SE. Cherry Blossom Drive 

Portland, Oregon 97216 USA

Internet: llorzol@usgs.gov 

Phone: (503) 251-3270 

=head1 COPYRIGHT

Copyright Leonard L Orzol <llorzol@usgs.gov>.

Permission is granted to copy, distribute and/or modify this 
document under the terms of the GNU Free Documentation 
License, Version 1.2 or any later version published by the 
Free Software Foundation; with no Invariant Sections, with 
no Front-Cover Texts, and with no Back-Cover Texts.

=head1 DISCLAIMER

Although this program has been used by the U.S. Geological Survey, 
no warranty, expressed or implied, is made by the USGS as to the 
accuracy and functioning of the program and related program 
material nor shall the fact of distribution constitute any such 
warranty, and no responsibility is assumed by the USGS in 
connection therewith. 

=cut

use strict;
use warnings;
use utf8;
use CGI::Tiny;

use Cwd;

use File::Spec::Functions 'catfile';

# Globals
# 
my $os            = $^O;

my $presentDir    = getcwd();

# Parse arguments to perl script 
# 
cgi {
  my $cgi = $_;

  # Parse latitude
  #
  my $latitude = $cgi->query_param('latitude');
  unless (length $latitude) {
        my $return_string = " \"error\": \"Missing a value for latitude\"";
        $cgi->set_response_status(400)->render(text => "{ $return_string }");
        exit;
  }

  # Longitude
  #
  my $longitude = $cgi->query_param('longitude');
  unless (length $latitude) {
        my $return_string = ("\"error\": " . "\"Missing a value for longitude\"");
        $cgi->set_response_status(400)->render(text => "{ $return_string }");
        exit;
  }

  # X coordinate
  #
  my $x_coordinate = $cgi->query_param('x_coordinate');
  unless (length $x_coordinate) {
        my $return_string = ("\"error\": " . "\"Missing a value for x coordinate\"");
        $cgi->set_response_status(400)->render(text => "{ $return_string }");
        exit;
  }

  # Y coordinate
  #
  my $y_coordinate = $cgi->query_param('y_coordinate');
  unless (length $y_coordinate) {
        my $return_string = ("\"error\": " . "\"Missing a value for y coordinate\"");
        $cgi->set_response_status(400)->render(text => "{ $return_string }");
        exit;
  }

  # Rasters
  #
  my $raster = $cgi->query_param('rasters');
  unless (length $raster) {
        my $return_string = ("\"error\": " . "\"Missing one or more sets of framework rasters\"");
        $cgi->set_response_status(400)->render(text => "{ $return_string }");
        exit;
  }
  my @rasters = split(/,/,$raster);
  if(scalar(@rasters) < 1) {
     my $return_string = ("\"error\": " . "\"Missing one or more sets of framework rasters\"");
     $cgi->set_response_status(400)->render(text => "{ $return_string }");
     exit;
  }

  # Build argument list
  #
  my $program_arguments = "";
  $program_arguments   .= "--latitude " . sprintf("%.6f ",$latitude);
  $program_arguments   .= "--longitude " . sprintf("%.6f ",$longitude);
  $program_arguments   .= "--x_coordinate " . sprintf("%.2f ",$x_coordinate);
  $program_arguments   .= "--y_coordinate " . sprintf("%.2f ",$y_coordinate);
  $program_arguments   .= "--rasters " . join(" ", @rasters) . " ";

  # Build command
  #
  my $program = catfile($presentDir, "framework_location.py");

  if(! -e $program)
  {
     my $return_string = ("\"warning\": " . "\"Program $program does not exist\"");
     $cgi->set_response_status(400)->render(text => "{ $return_string }");
     exit;
  }

  if(! -x $program)
  {
     my $return_string = ("\"warning\": " . "\"Insufficient rights to run $program\"");
     $cgi->set_response_status(400)->render(text => "{ $return_string }");
     exit;
  }

  # Run command
  #
  my $Line = `$program $program_arguments`;
  
  #print "$Line";
  $cgi->set_response_status(200)->render(text => $Line);

  # Finished
  #
  exit; 
  
}
