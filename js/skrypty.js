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
	params:{},
};
localStorage.removeItem('back');
localStorage.removeItem('rodzaj');
localStorage.removeItem('nazwa');
//localStorage.removeItem('atrakcje');
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
	if (Site.params.id) {
		Site.id_atrakcji=Site.params.id;
		Site.wczytajDaneAtrakcji();
	}
});
Site.init = function() {
	//console.log("init");
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'slide';
	$.mobile.orientationChangeEnabled = false;

	$(document).on("pageshow", function() {
		//console.log("global pageshow");
		localStorage.removeItem('back');
	});
	$(document).on('pagechange', function(event, data) {
		//console.log("pagechange");
		var url = data.absUrl.replace("#", "").split("?");
		Site.params={};
		var params = {};
		if (url[1]) {
			var parameters = url[1].split("&");
			for (var p in parameters) {
				var s = parameters[p].split("=");
				params[s[0]] = s[1];
				console.log("Param " + s[0] + ": " + s[1]);
			}
		}
		Site.params=params;
	});
};
$(window).on("navigate", function(event, data) {
	if (data.state.direction == 'back') {
		localStorage.back = 1;
	}
});
Site.wczytajDaneAtrakcji = function() {
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
	this.atrakcja = this.atrakcje[this.id_atrakcji];
	$(".ui-page-active div[data-role='header'] h1").html(this.atrakcja.tytul);
	$(".ui-page-active div#tresc").html(this.atrakcja.tresc);
	$('a', $(".ui-page-active div#tresc")).contents().unwrap();
	//$(".ui-page-active div#zdjecie").css("background-image", "url(" + this.atrakcja.zdjecia.glowne + ")");
	var img = $("<img src='" + this.atrakcja.zdjecia.glowne + "'/>");
	$(".ui-page-active div#zdjecie").append(img);
	if (this.atrakcja.szer_geogr) {
		var a = $("<a></a>");
		$(a).attr("href", "geo:" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "?z=15&q=" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "(" + this.atrakcja.tytul + ")");
		var imgSrc = "http://maps.googleapis.com/maps/api/staticmap?center=" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "&zoom=15&size=400x300&maptype=roadmap&markers=color:blue%7C" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "&sensor=false";
		var img = $("<img src='" + imgSrc + "'/>");
		$(a).append(img);
		$("#google_maps").append(a);
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
	console.log("LS.rodzaj: "+localStorage.rodzaj);
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
Site.przygotujDane=function () {
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