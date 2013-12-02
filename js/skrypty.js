Site = {
	atrakcje : null,
	id_atrakcji : null,
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
};
var mapa;
var marker;
localStorage.removeItem('atrakcje');
Site.init = function() {
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'slide';
	if (!localStorage.atrakcje) {
		//alert('Wgrywam dane z serwera');
		Site.wczytajDane();
	} else {
		//alert('Mam dane lokalnie');
		this.atrakcje = JSON.parse(localStorage.atrakcje);
		this.generatePolecamy();
		this.generateList();
		//}
	}
	$(document).on('pagebeforeshow', function(event, data) {
		//console.log("pagebeforeshow");
	});
	$(document).on('pagechange', function(event, data) {
		console.log("pagechange");
		console.log("url: " + data.absUrl);
		console.log("LS.href: " + localStorage.href);
		var url = data.absUrl.split("?");
		var params = {};
		if (url[1]) {
			//console.log(url);
			var parameters = url[1].split("&");
			for (var p in parameters) {
				var s = parameters[p].split("=");
				//console.log(s[0]+" = "+s[1]);
				params[s[0]] = s[1];
				//alert(localStorage.id);
			}
			//console.log(parameters);
			for (d in params) {
				//console.log(d+" "+params[d]);
			}
		}
		Site.id_atrakcji = params.id;
		//localStorage.id;
		//Site.rodzaj = localStorage.rodzaj;
		if (params.rodzaj) localStorage.rodzaj=params.rodzaj;
		//localStorage.removeItem('id');
		//localStorage.removeItem('rodzaj');
		//var url=plikURL(data.absUrl);
		//console.log("url: "+url);
		//if (url=='atrakcje.html') {
		console.log("LS.rodzaj: "+localStorage.rodzaj);
		if ($("select#rodzaj").length != 0 && $("select#rodzaj option").length == 0) {
			console.log("tworzę select");
			var option = $("<option value=''>Wszystkie</option>");
			$("select#rodzaj").append(option);
			for (var r in Site.rodzaje) {
				if (Site.atrakcjeWgRodzajow[r]) {
					var option = $("<option value='" + r + "'>" + Site.rodzaje[r] + "</option>");
					$("select#rodzaj").append(option);
				}
			}
			if (localStorage.rodzaj) {
				console.log("rodzaj: "+localStorage.rodzaj);
				//$("select#rodzaj").val(localStorage.rodzaj);
				//console.log("select: "+$("select#rodzaj").val());
			}
			if (params.rodzaj) {
				$("select#rodzaj").val(params.rodzaj);
			}
			$("select#rodzaj").selectmenu('refresh');
			$("select#rodzaj").change(function() {
				Site.filtrujWyniki();
			});
		}
		if (Site.id_atrakcji) {
			//alert('k'+Site.id_atrakcji);
			Site.wczytajDaneAtrakcji();
		} else if ($("#listaAtrakcji").length > 0) {
			console.log("generuję listę");
			Site.generateList();
			Site.filtrujWyniki();
		}
	});

	$(window).resize(function() {
		resize();
	});
	$(window).on("orientationchange", function(event) {
		resize();
	});
	resize();
	//Site.dzialanieA();
};
/*
Site.dzialanieA = function() {
	return;
	console.log("dzialanie A");
	$("a").on("click", function(event) {
		console.log("A klik");
		event.preventDefault();
		var href = $(this).attr("href");
		console.log(href);

		var url = href.split("?");
		var parameters = url[1].split("&");
		for (var p in parameters) {
			var s = parameters[p].split("=");
			localStorage[s[0]] = s[1];
			//alert(localStorage.id);
		}
		$.mobile.navigate(url[0]);
	});
};
*/
Site.wczytajDaneAtrakcji = function() {
	//
	if (this.atrakcje[this.id_atrakcji].pelne_dane) {
		//alert('Mam dane atrakcji');
		Site.pokazAtrakcje();
	} else {
		//alert('Wgrywam dane atrakcji z serwera');
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
			//alert(dane);
			Site.atrakcje[Site.id_atrakcji].pelne_dane = true;
			Site.atrakcje[Site.id_atrakcji].tresc = dane.tresc;
			Site.atrakcje[Site.id_atrakcji].szer_geogr = dane.szer_geogr;
			Site.atrakcje[Site.id_atrakcji].dl_geogr = dane.dl_geogr;
			Site.pokazAtrakcje();
			$.mobile.loading("hide");
		});
	}
};
Site.pokazAtrakcje = function() {
	//alert('Pokazuję atrakcję: '+this.id_atrakcji);
	//var page=$(".ui-page-active[data-role='page']");
	this.atrakcja = this.atrakcje[this.id_atrakcji];
	$(".ui-page-active div[data-role='header'] h1").html(this.atrakcja.tytul);
	$(".ui-page-active div.tresc .txt").html(this.atrakcja.tresc);
	resize();
	var wysTresci = $(".ui-page-active div.tresc").height();
	var wysOkna = $(".ui-page-active div.tresc").parent().height();
	var podstSzerOkna = $(".ui-page-active div.tresc").parent().parent().width();
	//alert(wysTresci+' '+wysOkna+' '+podstSzerOkna);
	if (wysTresci > wysOkna) {
		var ileRazy = Math.ceil(wysTresci / wysOkna);
		$(".ui-page-active div.tresc").parent().parent().width(podstSzerOkna * ileRazy + 'px');
		resize();
		$(".ui-page-active div.tresc").attr("style", "-webkit-column-count:" + ileRazy);
	}
	$(".ui-page-active .hero").css("background-image", "url(" + this.atrakcja.zdjecia.hero + ")");
	if (this.atrakcja.szer_geogr) {
		this.mapaGoogle();
	}
};
Site.mapaGoogle = function() {
	$("#google_maps a").attr("href", "geo:" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "?z=15&q=" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "(" + this.atrakcja.tytul + ")");
	var imgSrc = "http://maps.googleapis.com/maps/api/staticmap?center=" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "&zoom=15&size=300x200&maptype=roadmap&markers=color:blue%7C" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "&sensor=false";
	var img = $("<img src='" + imgSrc + "'/>");
	$("#google_maps a").append(img);
	/*
	 var myLatLng = new google.maps.LatLng(this.atrakcja.szer_geogr, this.atrakcja.dl_geogr);
	 var myOptions = {
	 zoom : 15,
	 center : myLatLng,
	 mapTypeId : google.maps.MapTypeId.ROADMAP,
	 };
	 map = new google.maps.Map(document.getElementById("google_maps"), myOptions);
	 var point = myLatLng;
	 marker = new google.maps.Marker({
	 position : point,
	 map : map,
	 });
	 */
};
Site.generatePolecamy = function() {
	var i = 0;
	for (a in this.atrakcje) {
		if (this.atrakcje[a].wyrozniony) {
			i++;
			var inner = $('<a href="atrakcja.html?id=' + a + '"><img src="' + this.atrakcje[a].zdjecia.lista_glowna + '"> ' + '<h2>' + this.atrakcje[a].tytul + '</h2></a>');
			var div = $("<div></div>").append(inner);
			/*
			 if (i % 2 == 0)
			 var cl = "grid-1";
			 else
			 var cl = "grid-2";
			 $(div).addClass(cl);
			 */
			$(".polecamy").append(div);
		}
	}
};
Site.generateList = function() {
	for (a in this.atrakcje) {
		var inner = $('<img src="' + this.atrakcje[a].zdjecia.lista + '"> ' + '<h2>' + this.atrakcje[a].tytul + '</h2>');
		var tag = $('<a href="atrakcja.html?id=' + a + '"></a>').append(inner);
		var li = $("<li data-id='" + a + "' data-rodzaj='" + this.atrakcje[a].rodzaj + "'></li>").append(tag);
		$("#listaAtrakcji").append(li);
	}
	$("#listaAtrakcji").listview("refresh");
	//Site.dzialanieA();
};
Site.filtrujWyniki = function() {
	//alert('k');
	$("#listaAtrakcji li:hidden").show();
	var rodzaj = $("select#rodzaj").val();
	if (rodzaj) {
		localStorage.rodzaj = rodzaj;
		//console.log("LS.rodzaj: "+localStorage.rodzaj);
		$("#listaAtrakcji li").filter(":not([data-rodzaj='" + rodzaj + "'])").hide();
	}
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
		//alert(dane);
		//alert('mam');

		//$(".strona").show();
		//$(".wgrywam").hide('fast');
		localStorage.atrakcje = JSON.stringify(dane);
		Site.atrakcje = dane;
		for (var d in dane) {
			var atr = dane[d];
			if (!Site.atrakcjeWgRodzajow[atr.rodzaj])
				Site.atrakcjeWgRodzajow[atr.rodzaj] = [];
			Site.atrakcjeWgRodzajow[atr.rodzaj].push(d);
		}
		//alert(Site.atrakcjeWgRodzajow[1]);
		Site.generatePolecamy();
		Site.generateList();
		//alert(this.atrakcje);
		$.mobile.loading("hide");
	});
};
function resize() {
	//var page=$(".ui-page-active[data-role='page']");
	$(".ui-page-active div[data-role='content']").height(($(window).height()) + 'px');
	var szer = 0;
	//var wysOkna=0;
	var wysOkna = $(window).height();
	$(".ui-page-active div[data-role='okno']").each(function(index) {
		szer += $(this).outerWidth(true);
		//if ($(this).height()>wysOkna) wysOkna=$(this).height();
	});

	//var szer = $(".ui-page-active div[data-role='okno']").length * $(".ui-page-active div[data-role='okno']").outerWidth(true);
	//alert($(".ui-page-active div[data-role='okno']").length+' '+$(".ui-page-active div[data-role='okno']").outerWidth(true));
	//alert(szer);
	$(".ui-page-active div[data-role='ekran']").width(szer + 'px');
	//wysOkna=$(".ui-page-active div[data-role='okno']").height();
	//alert(wysOkna);
	//alert($(".ui-page-active div[data-role='okno'] h2").outerHeight(true));
	$(".ui-page-active div[data-role='wnetrze']").height((wysOkna - $(".ui-page-active div[data-role='okno'] h2").outerHeight(true) + 5) + 'px');
	//alert($(".ui-page-active div[data-role='wnetrze']").height());
}

function plikURL() {
	var loc = window.location;
	var pathName = loc.pathname.substring(loc.pathname.lastIndexOf('/') + 1);
	return pathName;
	//loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
}