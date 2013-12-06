Site = {
	atrakcje : null,
	id_atrakcji : null,
	id_zdjecia : null,
	atrakcja : null,
	rodzaje : {
		1 : "Zamki i twierdze",
		2 : "Mury miejskie",
		3 : "Pałace i dworki",
		4 : "Obiekty sakralne i cmentarze",
		5 : "Ratusze",
		6 : "Inne obiekty",
		24 : "Pomniki, rzeźby i ławeczki",
		7 : "Muzea i skanseny",
		8 : "Rynki, place i deptaki",
		9 : "Jaskinie i podziemia",
		10 : "Parki miejskie",
		11 : "Parki Narodowe i rezerwaty",
		12 : "Skałki",
		13 : "Szlaki turystyczne",
		23 : "Schroniska turystyczne",
		14 : "Doliny i wąwozy",
		15 : "Szczyty i punkty widokowe",
		16 : "Narciarstwo",
		17 : "Jeziora, wodospady i rzeki",
		18 : "Parki rozrywki i zoo",
		19 : "Rekreacja",
		20 : "Centra nauki",
		21 : "Imprezy",
		22 : "Punkty na szlakach"
	},
	atrakcjeWgRodzajow : {},
	params : {},
	mapa : {
		poczX : 50.4539,
		poczY : 19.549,
	},
	googleMap : null,
};
localStorage.removeItem('back');
localStorage.removeItem('rodzaj');
localStorage.removeItem('nazwa');
localStorage.removeItem('atrakcje');
$(document).one("pageshow", ".index", function() {
	//console.log("show index");
	if (!localStorage.atrakcje) {
		Site.wczytajDane();
	} else {
		//console.log("mam dane");
		Site.atrakcje = JSON.parse(localStorage.atrakcje);
		Site.przygotujDane();
		Site.generatePolecamy();
		Site.generateList();
	}
});
$(document).on("pageshow", ".atrakcje", function() {
	//console.log("show atrakcje");
	Site.generateList("atrakcjeListaAtrakcji");
	Site.filtrujWyniki();
	var option = $("<option value=''>Wszystkie</option>");
	$("select#rodzaj").append(option);
	for (var r in Site.rodzaje) {
		if (Site.atrakcjeWgRodzajow[r]) {
			var option = $("<option value='" + r + "'>" + Site.rodzaje[r] + " (" + Site.atrakcjeWgRodzajow[r].length + ")</option>");
			$("select#rodzaj").append(option);
		}
	}
	if (localStorage.back) {
		if (localStorage.rodzaj)
			$("select#rodzaj").val(localStorage.rodzaj);
		if (localStorage.nazwa)
			$("input#nazwa").val(localStorage.nazwa);
		Site.filtrujWyniki();
	} else {
		if (Site.params.rodzaj)
			$("select#rodzaj").val(Site.params.rodzaj);
	}
	$("select#rodzaj").selectmenu('refresh');
	$("select#rodzaj").change(function() {
		Site.filtrujWyniki();
	});
	$("input#nazwa").keyup(function() {
		Site.filtrujWyniki();
	});
});
$(document).on("pageshow", ".atrakcja", function() {
	//console.log("show atrakcja");
	//console.log("ID: "+Site.params.id);
	Site.id_atrakcji = Site.params.id;
	Site.wczytajDaneAtrakcji();
});
$(document).one("pageshow", ".mapa", function() {
	Site.przygotujMape();
});
$(document).one("pagecreate", ".zdjecia", function() {
	console.log("ONE create zdjecia");
	$(document).on("click", ".next", function() {
		navnext(getNext());
	});
	$(document).on("click", ".prev", function() {
		navprev(getPrev());
	});
	$(document).on("swipeleft", ".ui-page", function(event) {
		if ((event.target === $( this )[0] )) {
			navnext(getNext());
		}
	});
	$(document).on("swiperight", ".ui-page", function(event) {
		if ((event.target === $( this )[0] )) {
			navprev(getPrev());
		}
	});
	function navnext(next) {
		console.log("navnext: " + next);
		$(":mobile-pagecontainer").pagecontainer("change", "zdjecia.html?idz=" + next, {
			transition : "slide"
		});
	}

	function navprev(prev) {
		console.log("navprev: " + prev);
		$(":mobile-pagecontainer").pagecontainer("change", "zdjecia.html?idz=" + prev, {
			transition : "slide",
			reverse : true
		});
	}

	function getNext() {
		var next = parseInt(Site.id_zdjecia) + 1;
		if (next > Site.atrakcje.length - 1)
			next = 0;
		return next;
	}

	function getPrev() {
		var prev = parseInt(Site.id_zdjecia) - 1;
		if (prev < 0)
			prev = Site.atrakcje.length - 1;
		return prev;
	}

});
$(document).on("pagecreate", ".zdjecia", function(event) {
	console.log("create zdjecia");
	cel = $(event.target);
	if (Site.params.idz)
		Site.id_zdjecia = Site.params.idz;
	else
		Site.id_zdjecia = 0;
	console.log("Zdjęcie: " + Site.id_zdjecia);
	$(cel).css("background-image", "url(" + Site.atrakcje[Site.id_zdjecia].zdjecia.glowne + ")");
	$("h1", cel).html(Site.atrakcje[Site.id_zdjecia].tytul);
	$("#info", cel).on("click",function() {
		//alert(Site.id_zdjecia);
		$(":mobile-pagecontainer").pagecontainer("change", "atrakcja.html?id=" + Site.id_zdjecia, {
			transition : "slide",
			reverse : true
		});
	});
	
});
$(document).on('pagebeforecreate', function(event, data) {
	return;
	console.log("!pagebeforecreate");
	console.log($(this));
	console.log($(this)[0]);
	//console.log(event);
	//console.log(data);
	console.log($(this)[0].URL);
	var url = $(this)[0].URL.replace("#", "").split("?");
	console.log(url);
	Site.params = {};
	var params = {};
	if (url[1]) {
		var parameters = url[1].split("&");
		for (var p in parameters) {
			var s = parameters[p].split("=");
			params[s[0]] = s[1];
			console.log("Param " + s[0] + ": " + s[1]);
		}
	}
	Site.params = params;

});

$(document).on('pagebeforechange', function(event, data) {
	//return;
	console.log("pagebeforechange");
	//console.log(data);
	if (data.absUrl) {
		var url = data.absUrl.replace("#", "").split("?");
		Site.params = {};
		var params = {};
		if (url[1]) {
			var parameters = url[1].split("&");
			for (var p in parameters) {
				var s = parameters[p].split("=");
				params[s[0]] = s[1];
				//console.log("Param " + s[0] + ": " + s[1]);
			}
		}
		Site.params = params;
		console.log("Params: " + Site.params);
	}
});

Site.init = function() {
	//console.log("init");
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'slide';
	$.mobile.orientationChangeEnabled = false;

	document.addEventListener("menubutton", function() {
		if ($(".ui-page-active").jqmData("panel") !== "open") {
			$(".ui-page-active #nav-panel").panel("open");
		}
	});
	$(document).on("pageshow", function() {
		//console.log("global pageshow");
		localStorage.removeItem('back');
	});
	/*
	 $(document).on("swipeleft", function(e) {
	 if ($(".ui-page-active").jqmData("panel") !== "open") {
	 $(".ui-page-active #nav-panel").panel("open");
	 }
	 });
	 */

};
$(window).on("navigate", function(event, data) {
	if (data.state.direction == 'back') {
		localStorage.back = 1;
	}
});
Site.przygotujMape = function() {
	var myLatlng = new google.maps.LatLng(this.mapa.poczX, this.mapa.poczY);
	var myOptions = {
		zoom : 15,
		center : myLatlng,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		//mapTypeControl : true,
	};
	var markerBounds_wyszukiwarki = new google.maps.LatLngBounds();
	var markery_wyszukiwarki = [];
	Site.googleMap = new google.maps.Map(document.getElementById("google_maps"), myOptions);
	for (a in this.atrakcje) {
		if (this.atrakcje[a].x && this.atrakcje[a].y) {
			var image = {
				url : this.atrakcje[a].zdjecia.lista,
				size : new google.maps.Size(50, 50),
				//origin: new google.maps.Point(25,25),
				anchor : new google.maps.Point(25, 25),
				scaledSize : new google.maps.Size(50, 50),
			};
			var point = new google.maps.LatLng(this.atrakcje[a].x, this.atrakcje[a].y);
			//alert(dane.ikonka);
			var marker = new google.maps.Marker({
				position : point,
				map : Site.googleMap,
				draggable : false,
				title : this.atrakcje[a].tytul,
				id : a,
				icon : image,
				//shadow: cien_wyszukiwarki,
				//animation : google.maps.Animation.DROP,
			});
			google.maps.event.addListener(marker, 'click', function() {
				$.mobile.navigate("atrakcja.html?id=" + this.id);
			});
			markerBounds_wyszukiwarki.extend(point);
		}
		markery_wyszukiwarki.push(marker);
		//markery_wyszukiwarki[dane.i]=marker;
	}
	Site.googleMap.fitBounds(markerBounds_wyszukiwarki);
	var markerCluster = new MarkerClusterer(Site.googleMap, markery_wyszukiwarki, {
		gridSize : 20
	});
};
Site.wczytajDaneAtrakcji = function() {
	if (Site.atrakcje[Site.id_atrakcji].pelne_dane) {
		//console.log('Mam dane atrakcji');
		Site.pokazAtrakcje();
	} else {
		//console.log('Wgrywam dane atrakcji z serwera');
		$.mobile.loading("show", {
			text : "Pobieram dane atrakcji",
			textVisible : true,
			theme : "a",
			html : ""
		});
		$.ajax({
			url : "http://www.polskieszlaki.pl/_a_dane.php?id_atrakcji=" + this.atrakcje[this.id_atrakcji].id,
			dataType : "json",
		}).done(function(dane) {
			Site.atrakcje[Site.id_atrakcji].pelne_dane = true;
			Site.atrakcje[Site.id_atrakcji].tresc = dane.tresc;
			//Site.atrakcje[Site.id_atrakcji].szer_geogr = dane.szer_geogr;
			//Site.atrakcje[Site.id_atrakcji].dl_geogr = dane.dl_geogr;
			Site.pokazAtrakcje();
			$.mobile.loading("hide");
		});
	}
};
Site.pokazAtrakcje = function() {
	this.atrakcja = this.atrakcje[this.id_atrakcji];
	console.log(this.atrakcja);
	$(".ui-page-active div[data-role='header'] h1").html(this.atrakcja.tytul);
	$(".ui-page-active div#tresc").html(this.atrakcja.tresc);
	$('a', $(".ui-page-active div#tresc")).contents().unwrap();
	//$(".ui-page-active div#zdjecie").css("background-image", "url(" + this.atrakcja.zdjecia.glowne + ")");
	var img = $("<img src='" + this.atrakcja.zdjecia.glowne + "'/>");
	$(".ui-page-active .atr_zdjecie").append(img);
	if (this.atrakcja.x) {
		var div = $("<div></div>");
		$(div).addClass("zdj atr_google_maps");
		var a = $("<a></a>");
		$(a).attr("href", "geo:" + this.atrakcja.x + "," + this.atrakcja.y + "?z=15&q=" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "(" + this.atrakcja.tytul + ")");
		var imgSrc = "http://maps.googleapis.com/maps/api/staticmap?center=" + this.atrakcja.x + "," + this.atrakcja.y + "&zoom=15&size=400x300&maptype=roadmap&markers=color:blue%7C" + this.atrakcja.x + "," + this.atrakcja.y + "&sensor=false";
		var img = $("<img src='" + imgSrc + "'/>");
		$(a).append(img);
		$(div).append(a);
		$(".ui-page-active div#tresc").append(div);
		//$(".ui-page-active .atr_google_maps").append(a);
		//<div class=""></div>
	}
};
Site.generatePolecamy = function() {
	var cel = "polecamy";
	for (a in this.atrakcje) {
		if (this.atrakcje[a].wyrozniony) {
			var inner = $('<img src="' + this.atrakcje[a].zdjecia.lista + '"> ' + '<h2>' + this.atrakcje[a].tytul + '</h2>');
			var tag = $('<a href="atrakcja.html?id=' + a + '"></a>').append(inner);
			var li = $("<li data-id='" + a + "' data-rodzaj='" + this.atrakcje[a].rodzaj + "'></li>").append(tag);
			$("#" + cel).append(li);
		}
	}
	$("#" + cel).listview("refresh");
};
Site.generateList = function(cel) {
	if (!cel)
		cel = "mainListaAtrakcji";
	//console.log("Generuję listę "+cel);
	var cl = "";
	if (cel == "mainListaAtrakcji")
		cl = "ui-screen-hidden";
	for (a in this.atrakcje) {
		var inner = $('<img src="' + this.atrakcje[a].zdjecia.lista + '"> ' + '<h2>' + this.atrakcje[a].tytul + '</h2>');
		var tag = $('<a href="atrakcja.html?id=' + a + '"></a>').append(inner);
		var li = $("<li class='" + cl + "' data-id='" + a + "' data-rodzaj='" + this.atrakcje[a].rodzaj + "'></li>").append(tag);
		$("#" + cel).append(li);
	}
	$("#" + cel).listview("refresh");
};
Site.filtrujWyniki = function() {
	$("#atrakcjeListaAtrakcji li:hidden").show();
	var rodzaj = $("select#rodzaj").val();
	var nazwa = $("input#nazwa").val();
	if (nazwa) {
		localStorage.nazwa = nazwa;
		$("#atrakcjeListaAtrakcji li").filter(function(index) {
			return $("h2:Contains('" + nazwa + "')", this).length === 0;
		}).hide();
	}
	if (rodzaj) {
		localStorage.rodzaj = rodzaj;
		$("#atrakcjeListaAtrakcji li").filter(":not([data-rodzaj='" + rodzaj + "'])").hide();
	}
	console.log("LS.rodzaj: " + localStorage.rodzaj);
};
Site.wczytajDane = function() {
	$.mobile.loading("show", {
		text : "Pobieram listę atrakcji",
		textVisible : true,
		theme : "a",
		html : ""
	});
	$.ajax({
		url : "http://www.polskieszlaki.pl/_a_dane.php",
		dataType : "json",
	}).done(function(dane) {
		localStorage.atrakcje = JSON.stringify(dane);
		Site.atrakcje = dane;
		Site.przygotujDane();
		Site.generatePolecamy();
		Site.generateList();
		$.mobile.loading("hide");
	});
};
Site.przygotujDane = function() {
	for (var d in Site.atrakcje) {
		var atr = Site.atrakcje[d];
		if (!Site.atrakcjeWgRodzajow[atr.rodzaj])
			Site.atrakcjeWgRodzajow[atr.rodzaj] = [];
		Site.atrakcjeWgRodzajow[atr.rodzaj].push(d);
	}
};

jQuery.expr[':'].Contains = function(a, i, m) {
	return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

jQuery.fn.extend({
	/**
	 * Returns get parameters.
	 *
	 * If the desired param does not exist, null will be returned
	 *
	 * To get the document params:
	 * @example value = $(document).getUrlParam("paramName");
	 *
	 * To get the params of a html-attribut (uses src attribute)
	 * @example value = $('#imgLink').getUrlParam("paramName");
	 */
	getUrlParam : function(strParamName) {
		strParamName = escape(unescape(strParamName));

		var returnVal = new Array();
		var qString = null;

		if ($(this).attr("nodeName") == "#document") {
			//document-handler

			if (window.location.search.search(strParamName) > -1) {

				qString = window.location.search.substr(1, window.location.search.length).split("&");
			}

		} else if ($(this).attr("src") != "undefined") {

			var strHref = $(this).attr("src")
			if (strHref.indexOf("?") > -1) {
				var strQueryString = strHref.substr(strHref.indexOf("?") + 1);
				qString = strQueryString.split("&");
			}
		} else if ($(this).attr("href") != "undefined") {

			var strHref = $(this).attr("href")
			if (strHref.indexOf("?") > -1) {
				var strQueryString = strHref.substr(strHref.indexOf("?") + 1);
				qString = strQueryString.split("&");
			}
		} else {
			return null;
		}

		if (qString == null)
			return null;

		for (var i = 0; i < qString.length; i++) {
			if (escape(unescape(qString[i].split("=")[0])) == strParamName) {
				returnVal.push(qString[i].split("=")[1]);
			}

		}

		if (returnVal.length == 0)
			return null;
		else if (returnVal.length == 1)
			return returnVal[0];
		else
			return returnVal;
	}
});
