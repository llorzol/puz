/**
 * Namespace: WebRequest
 *
 * WebRequest is a JavaScript library to make a Ajax request.
 *
 * $Id: /var/www/html/columbia/javascripts/usgs/webRequest.js, v 1.11 2026/04/19 16:24:27 llorzol Exp $
 * $Revision: 1.11 $
 * $Date: 2026/04/19 16:24:27 $
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

async function webRequests(urls, responseType, callBack) {
    // Create an array of Promises
    //
    const fetchPromises = urls.map(url => fetch(url));

    try {
        // Wait for all promises to resolve
        //
        const responses = await Promise.all(fetchPromises);

        // Map over the responses to parse them as JSON (each is an async operation)
        //
        const myPromises = responses.map(response => {
            if (!response.ok) {
                // You must handle non-ok statuses here
                throw new Error(`HTTP error! status: ${response.status} for ${response.url}`);
            }
            if (responseType == 'json') return response.json();
            else if (responseType == 'text') return response.text();
            else if (responseType == 'image') return response.arrayBuffer();
            else if (responseType == 'blob') return response.blob();
            else if (responseType == 'bytes') return response.bytes();
            else return response.text();
        });

        // Wait for all JSON parsing promises to resolve
        //
        const dataArray = await Promise.all(myPromises);
        //console.log("All concurrent fetches complete:", dataArray);
        //return dataArray;
        callBack(dataArray)

    } catch (error) {
        let message = `An error occurred during concurrent fetches: ${error}`
        console.error(message)
        updateModal(message);
        fadeModal(6000);
    }
}





function webRequest(request_type, script_http, data_http, dataType, callFunction)
  {
    var myData   = null;

    $.support.cors = true;

    myPromise = $.ajax({
                        type: request_type,
                        url: script_http,
                        data: data_http,
                        dataType: dataType
                      })
        .done(function(myData) { 
                                callFunction(myData); 
                               })
        .fail(function(jqXHR, textStatus, exception) {

             var message = "";

             if(jqXHR.status === 0)
               {
                 message = "Not connect.n Verify Network.";
               }
            else if (jqXHR.status == 400)
               {
                 message = "Bad request. [400] " . jqXHR.responseText;
               }
            else if (jqXHR.status == 404)
               {
                 message = "Requested page not found. [404]";
               }
            else if (jqXHR.status == 500)
               {
                 message = "Internal Server Error [500].";
               }
            else if (exception === 'parsererror')
               {
                 message = "Requested JSON parse failed.";
               }
            else if (exception === 'timeout')
               {
                 message = "Time out error.";
               }
            else if (exception === 'abort')
               {
                 message = "Ajax request aborted.";
               }
            else
               {
                 message = "Uncaught Error " + exception;
               }

            message    += "<br> please wait while the page is refreshed";
            openModal(message);
            fadeModal(4000);
            return false;
           });

  }