/* ========================================================================
 * Routing script using Google Map API v3
 *
 * ========================================================================
 * 
 *
 * @author Ibrahim As'ad
 * @Date: 5 Feb,2015
 * mail me : ibra.asad@gmail.com
 *
 * ========================================================================
 */

var img_green = 'images/point_circle_green.png';
var img_red = 'images/point_circle_red.png';
var LightBox_imgbuttonclose = 'images/btn_close.png';
var leftMenuflag = 1;
var geocoder=null;
var infoWindow =null;
var map=null;
var geocoder = null;
var map = null;
var markers = [];//add normal markers.
var addmarkers = [];//used to add the distance marker and also normal markers to keep track to each distance markers...Used in undo 
var latLngs = [];///construct path
var path = null;
var followRoad = "true";
var directiondisplay = null;
var directionService = new google.maps.DirectionsService();
var avoidHighway = false;
var travelmode = google.maps.DirectionsTravelMode.WALKING;
var loopClicked = false;
var rem = 0;
var clusterer = null;
var distcounter = 0;
var addDistance = 0;
var totaldistance = 0;
var distoption = 2;
var distArray = []; //used to reduce the distance
var markersize = new google.maps.Size(20, 20);
var distmarkersize = new google.maps.Size(25, 40);
var p = new google.maps.Point(10, 10);
var greenimg = new google.maps.MarkerImage(img_green, markersize, null, p, markersize);
var redimg = new google.maps.MarkerImage(img_red, markersize, null, p, markersize);
var kmarker = [];
var milrem = 0;
var miladdDis = 0;
var mtotaldistance = 0;
var milmarkers = [];
var mildistcounter = 0;
var maddmarkers = [];
var remarray = [];
var milremarray = [];
var miladdDisArray = [];
var addDisArray = [];
var flag = false;
var ll = null;
var inputLatitude = null ;
var inputLongitude = null;
var latitude = 0, longitude = 0;
var inputLocationDescription = null;
var inputDistance = null;
var inputDistanceUnits = null;
var showDistance = null;
var isDriving = 2;


var adUnit;

latitude = 53.34809202306839;
longitude = -6.25396728515625;
function initMap(){
	var mapProp = {
		center: new google.maps.LatLng(latitude,longitude),
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scrollwheel: false,
		draggableCursor:'crosshair'
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapProp);

	geocoder = new google.maps.Geocoder();	

	infoWindow = new google.maps.InfoWindow();
	addControlToMap();
	google.maps.event.addListener(map, 'click', mapClicked);
}



// key=AIzaSyATrswEqCRkKdUUo_0Zxt4CnGnSEoYuSoU



Number.prototype.toRad = function () {
    return this * Math.PI / 180;
};

Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
};


google.maps.LatLng.prototype.distanceFrom = function (latlng) {
    var R = 6371; // km
    var dLat = (latlng.lat() - this.lat()).toRad();
    var dLon = (latlng.lng() - this.lng()).toRad();
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.lat().toRad()) * Math.cos(latlng.lat().toRad()) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d1 = R * c; //km
    return d1;
};


google.maps.LatLng.prototype.destinationPoint = function (brng, dist) {
    dist = dist / 6371;
    brng = brng.toRad();

    var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
                        Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                                Math.cos(lat1),
                                Math.cos(dist) - Math.sin(lat1) *
                                Math.sin(lat2));

    if (isNaN(lat2) || isNaN(lon2)) { return null; }

    return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
};

google.maps.LatLng.prototype.moveTowards = function (point, distance) {
    var lat1 = this.lat().toRad();
    var lon1 = this.lng().toRad();
    var lat2 = point.lat().toRad();
    var lon2 = point.lng().toRad();
    var dLon = (point.lng() - this.lng()).toRad();

    // Find the bearing from this point to the next.
    var brng = Math.atan2(Math.sin(dLon) * Math.cos(lat2),
                         Math.cos(lat1) * Math.sin(lat2) -
                         Math.sin(lat1) * Math.cos(lat2) *
                         Math.cos(dLon));

    var angDist = distance / 6371000;  // Earth's radius.

    // Calculate the destination point, given the source and bearing.
    lat2 = Math.asin(Math.sin(lat1) * Math.cos(angDist) +
                    Math.cos(lat1) * Math.sin(angDist) *
                    Math.cos(brng));

    lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(angDist) *
                            Math.cos(lat1),
                            Math.cos(angDist) - Math.sin(lat1) *
                            Math.sin(lat2));

    if (isNaN(lat2) || isNaN(lon2)) { return null; }

    return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
};

function togel() {
        if (leftMenuflag == 0) {
            $("#tool").attr("src", 'images/down_arrow.png');
            $("#ctrl").animate({ width: "140px" }, "fast", function () {
                $("#mapsub").show();
            });
            leftMenuflag = 1;
        } else {
            leftMenuflag = 0;
            $("#ctrl").animate({ width: "1px" }, "fast");
            $("#mapsub").hide();
            $("#tool").attr("src", 'images/up_arrow.png');

        }
    }



function addControlToMap() {
    var divControl = document.createElement('DIV');
    var divControl1 = document.createElement('DIV');
    var divControl2 = document.createElement('DIV');
    var controlUI = document.createElement('DIV');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    divControl.appendChild(controlUI);
    //var backimage = document.getElementById('ctrl_background');
    var backimage = document.getElementById('route-buttons');

    //controlUI.appendChild(backimage);
    //
    //var controlUI1 = document.createElement('DIV');
    //controlUI1.style.backgroundColor = 'white';
    //controlUI1.style.cursor = 'pointer';
    //controlUI1.style.textAlign = 'center';

    //var mapoption1 = document.getElementById('mapoptions');
    //controlUI1.appendChild(mapoption1);
    //divControl1.appendChild(controlUI1);
 
    //
    //divControl.index = 1;
    //divControl1.index = 2;
    //map.controls[google.maps.ControlPosition.RIGHT_TOP].push(divControl);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(divControl1);
    
}



function findOnMap() {
    var location = $("#txt_find").val();
    if (location != "") {
        codeAddress(location, true);
    }
    
}



function codeAddress(address, center) {
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (center == true) {
                orig = results[0].geometry.location;
                //origaddress = results[0].address_components[0].long_name;
                geocoder.geocode({ 'location': orig }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var index = results.length;
                        var country = results[Number(index) - 1].formatted_address;
                        $("#CountryId option:contains(" + country + ")").attr("selected", "selected");
                    } else {
                        alert("Invalid Address:Location Not Found!");
                    }
                });
                map.setCenter(orig);
                // inputLatitude.setAttribute("value", results[0].geometry.location.lat());
                // inputLongitude.setAttribute("value", results[0].geometry.location.lng());
                // inputLocationDescription.setAttribute("value", address);
            }

        } else {
            alert("Invalid Address:Location Not Found!");
        }
    });
}

 function txtKeyPress(event) {
        if (event.keyCode == 13) {
            var address = $("#txt_find").val();
            codeAddress(address, true);
        }
        return disableEnterKey(event);
    }

function disableEnterKey(e) {
        var key;
        if (window.event)
            key = window.event.keyCode; //IE
        else
            key = e.which; //firefox      

        return (key != 13);
    }


function setTravelMode(value) {
    if (value == "walking") {
      
        travelmode = google.maps.DirectionsTravelMode.WALKING;
        isDriving = 0;
    } else {
        travelmode = google.maps.DirectionsTravelMode.DRIVING;
        isDriving = 1;
    }

}


function changeAvoidHighways(value) {
    avoidHighways = value.toString();
}

function setFollowRoad(value) {
    followRoad = value.toString();

}


function mapClicked(event) {
	// alert("lciked");
    ll = event.latLng;
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        mapclickthread();
    }
    else {
        setTimeout("mapclickthread();", 300);
    }
}




function mapclickthread() {
    if (flag == true) {
        var marker = new google.maps.Marker({
            position: ll,
            map: map,
            icon: redimg

        });
        if (markers.length > 1) {

            markers[markers.length - 1].setIcon(greenimg);
        }
        if (markers.length == 0) {
            google.maps.event.addListener(marker, 'dblclick', function (event) {
                loopRoute();
            });
        } else {
            google.maps.event.addListener(marker, 'dblclick', function (event) {
                mapClicked(event);
            });
        }
        markers.push(marker);
        addmarkers.push(marker);
        maddmarkers.push(marker);
        populateLatLngs();
    }
    flag = true;
}

function populateLatLngs() {

    if ((followRoad == "true") == false) {
        
        getStraightLatlngs();
    } else {
        getRoadLatLngs();
    }
    
}

function getStraightLatlngs() {

    latLngs.push(markers[markers.length - 1].getPosition());
    //drawPolyline();
    /**/if (latLngs.length > 1) {
        //distArray.push(totaldistance + markers[markers.length - 2].getPosition().distanceFrom(markers[markers.length - 1].getPosition()));
        distanceMarker(markers[markers.length - 2].getPosition(), markers[markers.length - 1].getPosition());

    }
    
    remarray.push(rem);
    milremarray.push(milrem);
    drawPolyline();
    distArray.push(totaldistance);
    
   
}


function getRoadLatLngs() {

    if (markers && markers.length > 1) {

        var start = markers[markers.length - 2].getPosition();
        var end = markers[markers.length - 1].getPosition();
        var rendererOptions = {
            map: map
        };
        directiondisplay = new google.maps.DirectionsRenderer(rendererOptions);
        var request = {
            origin: start,
            destination: end,
            optimizeWaypoints: true,
            travelMode: travelmode,
            provideRouteAlternatives: true,
            avoidHighways: (avoidHighway == "true")
        };
        directionService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                if (response) {
                    var route = response.routes[0].overview_path;
                    for (i = 0; i < route.length; i++) {
                        latLngs.push(route[i]);
                    }
                    var steps = response.routes[0].legs[0].steps;
                    var d = 0;
                    for (i in steps) {
                        distanceMarker(steps[i].start_location, steps[i].end_location);
                    }
                    //alert(milrem);

                    miladdDisArray.push(miladdDis);
                    addDisArray.push(addDistance);
                    

                    remarray.push(rem);
                    milremarray.push(milrem);
                    setMarkerOnLine();
                    drawPolyline();
                    if (loopClicked == true) {
                        markers[0].setPosition(markers[markers.length - 1].getPosition());
                        loopClicked = false;
                    }

                    distArray.push(totaldistance);

                }

            } else {
                alert("There is no specific route");
            }
        });
    } else {
        latLngs.push(markers[markers.length - 1].getPosition());
    }
}



function loopRoute() {
    loopClicked = true;
    var initial = markers[0].getPosition();
    var last = markers[markers.length - 1].getPosition();
    if (initial.lat() != last.lat() && initial.lng() != last.lng()) {
        var marker = new google.maps.Marker({
            position: latLngs[0],
            map: map,
            icon:redimg
        });
        if (markers.length > 1) {
            markers[markers.length - 1].setIcon(greenimg);
        }
        //marker.setIcon("images/marker.png");
        markers.push(marker);
        addmarkers.push(marker);
        maddmarkers.push(marker);
        populateLatLngs();
    } else {
        alert("Already in Loop!");
        loopClicked = false;
    }

}

function reverseRoute() {
    latLngs = latLngs.reverse();
    drawPolyline();
}



function saveRoute(){
    $('#route-buttons').css('display', 'none');
    $("#save_route").css("display","block");
}



 function distanceMarker(latlngS, latlngD) {

        var d1 = latlngS.distanceFrom(latlngD);  //km

        totaldistance += d1;
        
        showTotalDistance();
        var d = d1 * 1000; //meter
        d = Math.ceil(d);
        d += addDistance;

        var counter = Math.floor((d + rem ) / 1000);

       
        if (counter > 0) {
            for (i = 1; i <= counter; i++) {
                var dist = i * 1000;
                dist = dist - rem;
                dist = dist - addDistance;
                if (dist > 0) {
                    var ltlgd = latlngS.moveTowards(latlngD, dist);
                    distcounter += 1;

                    var pinDist = 0;
                    if (distcounter < 100) {
                        pinDist = distcounter;
                    } else {
                        pinDist = 99;
                    }

                    // only have images up to 99, so don't add a marker with no image > 99
                    var distimage = 'images/numbers/pin_km_' + pinDist + '.jpg';
                   /* var mimg = new google.maps.MarkerImage(distimage, distmarkersize, null, null, distmarkersize);
*/
                    var newmar = new google.maps.Marker({
                        position: ltlgd,
                       // icon: mimg

                    });

                    if (distoption == 2) {
                       // newmar.setMap(map);
                    }

                    addmarkers.push(newmar);
                    kmarker.push(newmar);
                }

            }

            rem = (d + rem) % 1000;
            addDistance = 0;

        } else {
            addDistance += d1 * 1000;
        }

        d1 = d1 / 1.609;
        mtotaldistance += d1;
        d = d1;
        d += miladdDis;

        counter = Math.floor(d + milrem);

        if (counter > 0) {
            for (i = 1; i <= counter; i++) {
                var dist = i * 1.609 * 1000;
                dist = dist - (milrem * 1609);
                dist = dist - (miladdDis * 1609);
                if (dist > 0) {
                    var ltlg = latlngS.moveTowards(latlngD, dist);
                    mildistcounter += 1;

                    var pinDist = 0;
                    if (mildistcounter < 100) {
                        pinDist = mildistcounter;
                    } else {
                        pinDist = 99;
                    }

                    // only have images up to 99, so don't add a marker with no image > 99
                    var distimg = 'images/numbers/pin_mi_' + pinDist + '.jpg';
                   // var mimg = new google.maps.MarkerImage(distimg, distmarkersize, null, null, distmarkersize);
                    var newmar = new google.maps.Marker({
                        position: ltlg ,
                       // icon: mimg
                    });

                    if (distoption != 2) {
                        //newmar.setMap(map);
                    }
                    maddmarkers.push(newmar);
                    milmarkers.push(newmar);

                }
            }
            milrem = (d + milrem) % 1609;
            miladdDis = 0;
            
        } else {
            miladdDis += d1;
            
        }
        addDisArray.push(addDistance);
        miladdDisArray.push(miladdDis);
   
    }




function drawPolyline() {
    if (path) {
        path.setMap(null);
    }
    if (latLngs && latLngs.length > 1) {
        path = new google.maps.Polyline({
            path: latLngs,
            strokeColor:"red"
	    //strokeColor: "#FF0000",
            //strokeWeight: 2.5,
            //strokeOpacity:0.7
        });
        path.setMap(map);
        //map.setCenter(latLngs[latLngs.length - 1]);
        //setMapBounds();
        
    }


}




function showTotalDistance() {

    if (distoption == 2) {

        if (totaldistance.toString() != "NaN" || totaldistance != "undefined") {
            $("#totaldistance").html(totaldistance.toFixed(2));
            $("#Distance").val(totaldistance.toFixed(2));

            // inputDistance.setAttribute("value", totaldistance.toFixed(2));
        } else {
            totaldistance = 0;
            showTotalDistance();
        }

    } else {
        if (totaldistance.toString() != "NaN" || totaldistance != "undefined") {
            
            var d = totaldistance / 1.609;
            d = Number(d);
            $("#totaldistance").html(d.toFixed(2));
            $("#Distance").val(d.toFixed(2));
            // inputDistance.setAttribute("value", d.toFixed(2));


        } else {
            totaldistance = 0;
            showTotalDistance();
        }

    }

    if (totaldistance == 0) {
        addDistance = 0;
    }

    

    
}


function setMarkerOnLine() {
    var mar = markers[markers.length - 1].getPosition();
    var matchmar = latLngs[latLngs.length - 1];
    if (mar.lat() != matchmar.lat() && mar.lng() != matchmar.lng()) {
        markers[markers.length - 1].setPosition(matchmar);
    }
}



function Undo() {
console.log(addmarkers)
    if (markers) {
        if (markers.length > 1) {
            var r1 = -1;
            for (i in addmarkers) {
                if (addmarkers[i].getPosition() == markers[markers.length - 1].getPosition()) {
                    r1 = i;
                }
            }
            if (r1 != -1) {
                var t = Number(r1) + 1;
                var length = addmarkers.length;
                for (i = t; i < length; i++) {
                    addmarkers[i].setMap(null);
                    for (j in kmarker) {
                        if (kmarker[j].getPosition() == addmarkers[i].getPosition()) {
                            kmarker.splice(j, 1);
                            distcounter -= 1;
                            
                        }
                    }

                }
            }

            for (i in maddmarkers) {
                if (maddmarkers[i].getPosition() == markers[markers.length - 1].getPosition()) {
                    r1 = i;
                }
            }

            if (r1 != -1) {
                var t = Number(r1) + 1;
                length = maddmarkers.length;
                for (i = t; i < length; i++) {
                    maddmarkers[i].setMap(null);
                    for (j in milmarkers) {
                        if (milmarkers[j].getPosition() == maddmarkers[i].getPosition()) {
                            milmarkers.splice(j, 1);
                            mildistcounter -= 1;
                           
                        }
                    }
                }
            }

            
            markers[markers.length - 1].setMap(null);
            var rindex = null;
            var removelatlng = markers[markers.length - 2].getPosition();
            for (i in latLngs) {
                if (latLngs[i].lat() == removelatlng.lat() && latLngs[i].lng() == removelatlng.lng()) {
                    rindex = i;
                }
            }

            if ((latLngs.length - 1) != rindex) {
                while (latLngs.length - 1 > rindex) {
                    latLngs.pop();
                }
            } else {
                var middle = Math.floor(latLngs.length / 2);
                for (i = 0; i < middle; i++) {
                    latLngs.pop();
                }
            }

            distArray.pop();
            totaldistance = distArray[distArray.length - 1];

            if (distArray.length <= 0) {
                totaldistance = 0;
            }
            //totaldistance -= (distArray[distArray.length - 1] - distArray[distArray.length - 2]);
            
            
            remarray.pop();
            rem = remarray[remarray.length - 1];
            
            milremarray.pop();
            milrem = milremarray[milremarray.length - 1];

            miladdDisArray.pop();
            miladdDis = miladdDisArray[miladdDisArray.length - 1];
            if (miladdDis == undefined) {
                miladdDis = 0;
            }
            
            addDisArray.pop();

            addDistance = addDisArray[addDisArray.length - 1];
            if (addDistance == undefined) {
                addDistance = 0;

            }
            
            showTotalDistance();
            markers.pop();
            drawPolyline();
        } else {
            if (markers.length > 0) {
                markers[markers.length - 1].setMap(null);
                markers.pop();
                if (latLngs.length > 0) {
                    latLngs = [];
                }
                drawPolyline();
                totaldistance = 0;
                distcounter = 0;
                showTotalDistance();
            }

        }
        if (markers.length > 0) {
            markers[markers.length - 1].setIcon(redimg);
        }

    }
    if (distArray.length == 0) {
        
        reset();
    }

    
}



function outAndBack() {
       
            var length = latLngs.length;

            for (var i = 1; i <= length; i++) {
                var index = length - i;
                latLngs.push(latLngs[index]);
            }

            var start = Math.floor(latLngs.length / 2);

            var marker = new google.maps.Marker({
                position: latLngs[latLngs.length - 1],
                map: map,
                icon: redimg
            });

            markers.push(marker);
            addmarkers.push(marker);
            maddmarkers.push(marker);
           /**/ for (var i = start; i < (latLngs.length - 1); i++) {
                distanceMarker(latLngs[i], latLngs[i + 1]);
            }

            remarray.push(rem);
            milremarray.push(milrem);
            //map.setCenter(marker.getPosition());
            distArray.push(totaldistance);
    
    
}

function clearMarkers() {
        clearOverlays();
    }

function reset() {
    totaldistance = 0;
    distcounter = 0;
    showTotalDistance();
    addDistance = 0;
    mildistcounter = 0;
    miladdDis = 0;
    milrem = 0;
    rem = 0;
    kmarker = [];
    milmarkers = [];
}


function clearOverlays() {
  var cnf = confirm("You are about to remove all markers from the map.\nPlease confirm you would like to proceed?");
    if (cnf == true) {
        if (markers) {
            for (i in markers) {
                markers[i].setMap(null);

            }
            markers = [];
            if (path) {
                path.setMap(null);
            }
            latLngs = [];
            for (i in addmarkers) {
                addmarkers[i].setMap(null);
            }
            addmarkers = [];
            for (i in maddmarkers) {
                maddmarkers[i].setMap(null);
            }
            maddmarkers = [];

        }
        totaldistance = 0;
        distcounter = 0;
        showTotalDistance();
        addDistance = 0;
        mildistcounter = 0;
        miladdDis = 0;
        milrem = 0;
        rem = 0;
        kmarker = [];
        milmarkers = [];
    }
}

function setDistanceOption(value) {

    distoption = Number(value);
    
    if (totaldistance != 0) {
        if (distoption.toString() == "2") {
            $("#totaldistance").html(totaldistance.toFixed(2));
            //$("#Distance").val(totaldistance.toFixed(2));
            
            // inputDistance.setAttribute("value", totaldistance.toFixed(2));
            // inputDistance.value = totaldistance.toFixed(2);
            if (kmarker) {
                for (i in kmarker) {
                   // kmarker[i].setMap(map);
                }
            }
            if (milmarkers) {
                for (i in milmarkers) {
                    milmarkers[i].setMap(null);
                }
            }
        } else {
            var d = totaldistance / 1.609;
            d = Number(d);
            $("#totaldistance").html(d.toFixed(2));
            //$("#Distance").val(totaldistance.toFixed(2));
            // inputDistance.setAttribute("value", d.toFixed(2));
            // inputDistance.value = d.toFixed(2);
            
            if (kmarker) {
                for (i in kmarker) {
                    kmarker[i].setMap(null);
                }
            }
            if (milmarkers) {
                for (i in milmarkers) {
                   // milmarkers[i].setMap(map);
                }
            }
        }
    }
//    inputDistanceUnits.value = distoption;
    $("#distoption").val(distoption);
}

function saveMapToServer(){
     var url;
   ;
    $("#route_description").val();
     $("#totaldistance").val(); 

    var driveVal =  $('input[name="tm"]:checked').val();
    if (driveVal == 'walking') { isDriving = 0; }
    else if (driveVal == "Driving") { isDriving = 1; }
    
     sendMarkers=markers;

     var ajaxData=new Object();
     ajaxData.route_title= $("#route_title").val();
     ajaxData.route_description=$("#route_description").val();
     ajaxData.totaldistance= $("#totaldistance").html();
     ajaxData.distanceType= $('#distoption option:selected').text();
     ajaxData.isRoute=followRoad;
     if (isDriving !== 2) {
        ajaxData.isDriving = isDriving;
    }
     ajaxData.latLng=[];
     console.log("isDriving: " + isDriving)
     if (isDriving == 0 || isDriving == 1) {
        url = 'save_route.php';
     }
     else if (isDriving == 2) {
        console.log("NO ROUTE")
        url = 'save_no_route.php';
     }


     for (var i = 0; i < markers.length; i++) {
        // function(){
        var obj=new Object();
        obj.latitude=markers[i].getPosition().lat();
        obj.longitude=markers[i].getPosition().lng();
         ajaxData.latLng.push(obj);
     // }()
     };

     console.log(ajaxData);

// return;
     $.ajax({
        url:url,
        type:'POST',
        data:ajaxData,
        success:function(data){

            if(data > -1 ){
                $("#route_saved_dive").css('display','inline-block');
                $("#route_id_done").html("<a href='viewMap.php?route="+data+"'> View Map </a>" );
            }else{
                alert("Problem with saving");
            }
            console.log(data);
        },
        error:function(error){
            console.log(error);
        }
     });



}


Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}

Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
}