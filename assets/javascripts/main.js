// JSLint settings:
/*global
  alert,
  clearTimeout,
  console,
  jQuery,
  setTimeout
*/

var APP = (function($, window, document, undefined) {
	'use strict';

	$(document).ready(function() {

		APP.go();
	});

	// "Private" vars.
	var body;
	var tmpl;
	var tmplNoGeo;
	var data;
	var curPos = null;
	var critDisciplines = [];
	var filterDisciplines = [];
	var filterDisciplinesUnique = [];

	return {

		// Perform search
		search: function() {

			var innerHTMLToAdd;
			var outerHTMLtoAdd;

			var $parent = $("#outercontainer");
			var foundCount = 0;

			// Clear old results
	  		$("#outercontainer .resultbox").remove();

	  		for(var i=0; i < data.length; i++) {

	   			innerHTMLToAdd = this._renderResult(data[i], i, curPos);
	
	   			if (innerHTMLToAdd) {

		  			outerHTMLtoAdd = '<div class="grid-50 mobile-grid-100 resultbox">';
		  			outerHTMLtoAdd+= '<section>' + innerHTMLToAdd + '</section>';
		  			outerHTMLtoAdd+= '</div>';

		  			if (outerHTMLtoAdd){
		  				foundCount++;
		  				$parent.append(outerHTMLtoAdd);
		  			}
		  		}
	  		}

	  		$("#resultcount").html(foundCount + ' coaches');

		},

		// Stores the disciplines checked off by the user in a simple array
		storeCriteriaDisciplines: function() {

			critDisciplines.clear();

			$(".discipline").each(function(index, element){

				if ($(element).prop("checked")) {
					critDisciplines.push($(element).data('discipline'));
				}

			});
		},

		// Build the sidebar
		buildSidebar: function() {

			for(var i=0; i < data.length; i++) {
				for(var j=0; j < data[i].discipline.length; j++) {
					//console.log(data[i].discipline[j]);
					filterDisciplines.push(data[i].discipline[j]);
				}
			}

			filterDisciplinesUnique = this._array_unique(filterDisciplines);

			var $parent = $("#disciplinecontainer");
			$parent.html();

			var html;

			for(var k=0; k < filterDisciplinesUnique.length; k++) {

				html = '<div class="inputcontainer">';
				html+= '<input id="d__'+k+'" name="d__'+k+'" type="checkbox" class="discipline" data-discipline="' + filterDisciplinesUnique[k] + '">';
				html+= '<label for="d__'+k+'"><span>' + filterDisciplinesUnique[k] + '</span></label>';
				html+= '</div>';

				$parent.append(html);
			}

			// Wire up .discipline checkboxes
			$(".discipline").change(function() {

		  		APP.storeCriteriaDisciplines();	
		  		APP.search();
		  		$("[id^=popup_]").modal();			// Set up profile detail modals

				$(document).on($.modal.BEFORE_CLOSE, function(event, modal) {
					$("#sidebar").hide();
				});
				$(document).on($.modal.AFTER_CLOSE, function(event, modal) {
					$("#sidebar").show();
				});

		  		APP._initLazyLoad();	
			});
		},

	  	run: function() {

			$('#maxpriceslider').rangeslider({polyfill: false});
			$("#maxprice").html('$' + $("#maxpriceslider").val());
	  		$("#sidebar").relativelySticky();	// This plugin makes sure that #sidebar stays visible

			$("#sidebar .toggle").click(function() {
				if ($("#sidebar").hasClass("nottoggled")) {
					$("#sidebar").addClass('toggled');
					$("#sidebar").removeClass("nottoggled");
				} else {
					$("#sidebar").addClass('nottoggled');
					$("#sidebar").removeClass("toggled");
				}
			});

	  		this.buildSidebar();				// Build the sidebar discipline options / sport types checkboxes

	  		this.storeCriteriaDisciplines();	
	  		this.search();

	  		$("[id^=popup_]").modal();			// Set up profile detail modals
	  		this._initLazyLoad();				// (Re-) initialize lazy loader

			$(document).on($.modal.BEFORE_OPEN, function(event, modal) {
				$("#sidebar").hide();
			});
			$(document).on($.modal.AFTER_CLOSE, function(event, modal) {
				$("#sidebar").show();
			});

	  		console.log('READY !');

	  	},

	  	// _distance(pos.coords.longitude, pos.coords.latitude, 42.37, 71.03)
		_distance: function(lon1, lat1, lon2, lat2) {

			var R = 6371; // Radius of the earth in km
			var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
			var dLon = (lon2-lon1).toRad(); 
			var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
					Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon/2) * Math.sin(dLon/2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; // Distance in km
			return d;
		},

		_fixnan: function(i){

        	if(isNaN(i)){
				return 0;
        	} else{
            	return i;
        	}
		},

		_formatDecimal: function(num, numPlaces) {

			var snum = new String(parseFloat(num));
			var i=z=0; 
			var sout=ch="";

			while(i<snum.length && ch != '.' ) {
				ch = snum.charAt(i++);
				sout+=ch;
			}
			while(i<snum.length && z++<numPlaces){
				ch = snum.charAt(i++);
				sout+=ch;
			}
			if(snum.indexOf('.')==-1)sout+='.';

			while(z++<numPlaces)sout+='0';
			return sout;
		},

		_getTime4SpeedAndDistance: function(nDistMetres, speedMetersPerSec){

			var sout;

			if( nDistMetres == 0 || speedMetersPerSec == 0){
				sout = "00 : 00 : 00.00";
				return sout;
			}

			var secondsRequired;
			secondsRequired = nDistMetres / speedMetersPerSec;
			secondsRequired = parseFloat(this._formatDecimal(secondsRequired, 8));
  
    		var hours, minutes, secs;
    		var remainder; 

			hours = this._fixnan(parseInt(secondsRequired / 3600)); // ''and chuck ayay remainder

			//avoids embarassing problem where 20mph for 20 miles doesnt come 2 exactly 1 hr!!!
			//because spurious extra numbers after decimal point can add minutes!!!
			remainder = this._fixnan(parseFloat(this._formatDecimal(secondsRequired - (hours * 3600.0),4)));
	
			minutes = this._fixnan(parseInt(remainder / 60.0));
			secs = remainder - (minutes * 60.0);
	
			if( secs<= 0.0001 ) {
				secs = 0;
			}

			hours = this._fixnan(hours);
			minutes = this._fixnan(minutes);
			secs = this._fixnan(parseFloat(secs));

			sout = parseInt(hours) + " : " + parseInt(minutes) + " : " + this._formatDecimal(secs, 2);
	
			return sout;
		},

		// Prepares the box_no_geo.tpl for inclusion into the DOM
		_renderResultWithoutTravelTime: function(obj, resultNumber) {

			var tpl = tmplNoGeo;

			tpl = tpl.replaceAll("{NAME}",  obj.name);
			tpl = tpl.replaceAll("{PRICE}", obj.cheapestDisciplineHourRate);
			tpl = tpl.replaceAll("{DISCIPLINES}", obj.discipline.join(", "));
			tpl = tpl.replaceAll("{IMGSRC}", obj.picture);

			// POPUP
			tpl = tpl.replaceAll("{POPUP_AGE}", obj.age);
			tpl = tpl.replaceAll("{POPUP_NAME}", obj.name);
			tpl = tpl.replaceAll("{POPUP_ADR}", obj.address);
			tpl = tpl.replaceAll("{POPUP_REG}", obj.registered);
			tpl = tpl.replaceAll("{POPUP_GENDER}", obj.gender);
			tpl = tpl.replaceAll("{POPUP_ABOUT}", obj.about);
			tpl = tpl.replaceAll("{POPUP_FAVDIS}",obj.favoriteDiscipline);
			tpl = tpl.replaceAll("{POPUP_ID}", 'popup_' + resultNumber);

			return tpl;
		},

		// Prepares the box.tpl for inclusion into the DOM
		_renderResultWithTravelTime: function(obj, resultNumber, travelTimeStr) {

			var tpl = tmpl;

			tpl = tpl.replaceAll("{NAME}",  obj.name);
			tpl = tpl.replaceAll("{PRICE}", obj.cheapestDisciplineHourRate);
			tpl = tpl.replaceAll("{DISCIPLINES}", obj.discipline.join(", "));
			tpl = tpl.replaceAll("{IMGSRC}", obj.picture);
			tpl = tpl.replaceAll("{TRAVELTIME}", travelTimeStr);

			// POPUP
			tpl = tpl.replaceAll("{POPUP_AGE}", obj.age);
			tpl = tpl.replaceAll("{POPUP_NAME}", obj.name);
			tpl = tpl.replaceAll("{POPUP_ADR}", obj.address);
			tpl = tpl.replaceAll("{POPUP_REG}", obj.registered);
			tpl = tpl.replaceAll("{POPUP_GENDER}", obj.gender);
			tpl = tpl.replaceAll("{POPUP_ABOUT}", obj.about);
			tpl = tpl.replaceAll("{POPUP_FAVDIS}",obj.favoriteDiscipline);
			tpl = tpl.replaceAll("{POPUP_ID}", 'popup_' + resultNumber);
		
			return tpl;
		},

	  	// Filters result and calls the appropriate render method
	  	_renderResult: function(obj, resultNumber, pos) {

	  		// Not active
  			if (obj.isActive == false) {
  				return null;
  			}

  			var hourRate = parseFloat(obj.cheapestDisciplineHourRate.substring(1));

  			if (hourRate > parseFloat($("#maxpriceslider").val())) {
  				return null;	// Too expensive
  			}

  			// Does the trainer provide what has been checked off
  			if ($("#indoor").prop("checked") && obj.indoor == false) {
  				return null;
  			}
  			if ($("#outdoor").prop("checked") && obj.outdoor == false) {
  				return null;
  			}

  			var foundDisciplinesCount = 0;

  			for(var i=0; i < critDisciplines.length; i++) {
  				if ($.inArray(critDisciplines[i], obj.discipline)) {
  					foundDisciplinesCount++;
  				}
  			}

  			if (foundDisciplinesCount == 0 && critDisciplines.length > 0) {
  				return null;
  			}

  			//-----------------------------
  			// MAIN
  			//-----------------------------
  			
	  		var speed;
	  		var kmh;
	  		var travelTime;
	  		var dist;

	  		if (pos !== null) {

	  			if (pos.coords.speed === null) {
	  				speed = 0.3;				// Just assume a speed of 0.3 meters per second if not provided
	  			} else {
	  				speed = pos.coords.speed;
	  			}

	  			// Get distance in meters
	  			dist = this._distance(	pos.coords.longitude, pos.coords.latitude, 
	  									obj.longitude, obj.latitude);

	  			// Convert speed to km/h
	  			kmh = 3.6 * speed;

	  			travelTime = this._getTime4SpeedAndDistance(dist, speed);
	  			return this._renderResultWithTravelTime(obj, resultNumber, travelTime);

	  		} else {
	  			return this._renderResultWithoutTravelTime(obj, resultNumber);
	  		}

	  	},

	  	// Removes duplicates from arrays
		_array_unique: function(a) {

    		return a.sort().filter(function(item, pos, ary) {
        		return !pos || item != ary[pos - 1];
    		})
		},

	  	// Should be called after a search completes
	  	_initLazyLoad: function() {

	        if($('img.lazyload').length){

				$('img.lazyload').lazyload({ 

 					/*effect:'fadeIn',*/ 
					threshold:500, 
					failure_limit:2 

	             }).removeClass('lazyload').addClass('lazyloaded');
	        }
	  	},

	  	// Used for loading JSON or templates
		_readTextFile: function(file, callback, fileType) {
			
			var rawFile = new XMLHttpRequest();

			if (typeof rawFile.overrideMimeType !== "undefined") {

				if (fileType) {
					rawFile.overrideMimeType(fileType);
				} else {
					rawFile.overrideMimeType("application/json");
				}
			} else {
				//FIXME: Causes strange IE9 error....
				//rawFile.setRequestHeader("Accept", fileType);
			}

			rawFile.open("GET", file, false);
			rawFile.onreadystatechange = function() {
				if (rawFile.readyState === 4 && rawFile.status == "200") {
					callback(rawFile.responseText);
				}
			}
			rawFile.send(null);
		},  

		// APP.go
		go: function() {
			var i, j = APP.init;

			for (i in j) {
				// Run everything in APP.init
				j.hasOwnProperty(i) && j[i]();
			}

		  	APP.run();
		},
	
		// APP.init
		init: {

			// APP.init.assign_dom_vars
			assign_dom_vars: function() {
				body = $(document.body);
			},

			// APP.init.stop_dead_links
			stop_dead_links: function(ev) {
				body.on('click', 'a[href="#"]', function(ev) {
			  		// Stop that link!
			  		ev.preventDefault();
				});
			},

			// APP.init.load_resources	
			load_resources: function() {

				APP._readTextFile('./source.json', function(text) {
					data = JSON.parse(text);
					console.log('SOURCE DATA:', data);
				});

				APP._readTextFile('./box.tpl', function(text) {
					tmpl = text;
					console.log('Template', tmpl);
				}, 'text/html');

				APP._readTextFile('./box_no_geo.tpl', function(text) {
					tmplNoGeo = text;
					console.log('Template No Geo', tmplNoGeo);
				}, 'text/html');				
			},

			// Wires up some UI event handlers and overrides some prototypes
			initialize_controls: function() {

				var that = this;

				/** Converts numeric degrees to radians */
				if (typeof(Number.prototype.toRad) === "undefined") {
					Number.prototype.toRad = function() {
						return this * Math.PI / 180;
				  	}
				}

				String.prototype.replaceAll = function(search, replacement) {
				    var target = this;
				    return target.replace(new RegExp(search, 'g'), replacement);
				};

				Array.prototype.clear = function() {
					while (this.length) {
						this.pop();
					}
				};				

				// Wire up filter controls
				$("#indoor, #outdoor, #maxpriceslider").change(function() {

					var maxprice = $("#maxpriceslider").val();
					$("#maxprice").html('$' + maxprice);

			  		APP.storeCriteriaDisciplines();	
			  		APP.search();
			  		$("[id^=popup_]").modal();			// Set up profile detail modals
			  		APP._initLazyLoad();				// (Re-) initialize lazy loader

				});			
			},

			// Get user's current geo position
			get_pos: function() {
  
				var geoError = function(err) {

					switch(err.code) {
        				case err.PERMISSION_DENIED:
            				return "User denied the request for Geolocation.";
            				break;
        				case err.POSITION_UNAVAILABLE:
            				return "Location information is unavailable.";
				            break;
        				case err.TIMEOUT:
            				return "The request to get user location timed out.";
 				           break;
        				case err.UNKNOWN_ERROR:
            				return "An unknown error occurred."
            				break;
    				}
				};

  				try {
	  				if (typeof navigator.geolocation !== "undefined") {
	  					navigator.geolocation.getCurrentPosition(function(position) {
	    					curPos = position;	// curPos.coords.latitude, curPos.coords.longitude
	    					console.log("Geolocation: curPos", curPos);
	  					}, function(err) {
	  						console.log('Geolocation error', geoError(err));
	  						curPos = null;	
	  					}, {enableHighAccuracy: true});

		  				// Also watch for updates
	  					navigator.geolocation.watchPosition(function(position) {
	  						curPos = position;
	    					console.log("Geolocation: curPos", curPos);  						
						}, function(err) {
	  						console.log('Geolocation error', geoError(err));						
							curPos = null;
						}, {enableHighAccuracy: true});				

	  				} else { // Geolocation not supported 
	  					curPos = null;
						console.log('Geolocation not supported');
	  				}

	  			} catch(ex) {
	  				curPos = null;
	  				console.log("Geolocation not supported - Exception: ", ex);
	  			}
			}
		}
	};

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);
