Site = {
	atrakcje : null,
	id_atrakcji : null,
	atrakcja : null,
};
var mapa;
var marker;
//localStorage.removeItem( 'atrakcje');
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
	$(document).on('pagechange', function() {
		Site.id_atrakcji = localStorage.id;
		localStorage.removeItem('id');
		if (Site.id_atrakcji) {
			Site.wczytajDaneAtrakcji();
		}
	});

	$("a").on("click", function(event) {
		event.preventDefault();
		var href = $(this).attr("href");

		var url = href.split("?");
		var parameters = url[1].split("&");
		for (var p in parameters) {
			var s = parameters[p].split("=");
			localStorage[s[0]] = s[1];
			//alert(localStorage.id);
		}
		$.mobile.navigate(url[0]);
	});
	$(window).resize(function() {
		resize();
	});
	$(window).on("orientationchange", function(event) {
		resize();
	});
	resize();
};
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
	$("#google_maps a").attr("href","geo:"+this.atrakcja.szer_geogr+","+this.atrakcja.dl_geogr);
	var imgSrc="http://maps.googleapis.com/maps/api/staticmap?center="+this.atrakcja.szer_geogr+","+this.atrakcja.dl_geogr+"&zoom=15&size=300x200&maptype=roadmap&markers=color:blue%7C"+this.atrakcja.szer_geogr+","+this.atrakcja.dl_geogr+"&sensor=false";
	var img=$("<img src='"+imgSrc+"'/>");
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
		var a = $('<a href="atrakcja.html?id=' + a + '"></a>').append(inner);
		var li = $("<li></li>").append(a);
		$("#listaAtrakcji").append(li);
	}
	$("#listaAtrakcji").listview("refresh");
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
	$(".ui-page-active div[data-role='wnetrze']").height((wysOkna - $(".ui-page-active div[data-role='okno'] h2").outerHeight(true) + 10) + 'px');
	//alert($(".ui-page-active div[data-role='wnetrze']").height());
}

function plikURL() {
	var loc = window.location;
	var pathName = loc.pathname.substring(loc.pathname.lastIndexOf('/') + 1);
	return pathName;
	//loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
}