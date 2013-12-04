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
localStorage.removeItem('back');
localStorage.removeItem('rodzaj');
localStorage.removeItem('nazwa');
localStorage.removeItem('atrakcje');
Site.init = function() {
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'slide';
	$.mobile.orientationChangeEnabled = false;
	if (!localStorage.atrakcje) {
		Site.wczytajDane();
	} else {
		this.atrakcje = JSON.parse(localStorage.atrakcje);
		this.generatePolecamy();
		this.generateList();
	}
	/*
	$("body").on("swipeleft", function(event) {
		console.log("swipe left");
		$("div[data-role='content']").animate({scrollLeft: pos - 200} );
	});
	$("body").on("swiperight", function(event) {
		console.log("swipe right");
		$("div[data-role='content']").animate({scrollLeft: pos + 200} );
	});
	*/
	$(document).on('pagechange', function(event, data) {
		//console.log("pagechange");
		//console.log("url: " + data.absUrl);
		//console.log("LS.href: " + localStorage.href);
		//console.log("LS.back: " + localStorage.back);
		//console.log("LS.rodzaj: "+localStorage.rodzaj);
		var url = data.absUrl.replace("#", "").split("?");
		var params = {};
		if (url[1]) {
			var parameters = url[1].split("&");
			for (var p in parameters) {
				var s = parameters[p].split("=");
				params[s[0]] = s[1];
				console.log("Param " + s[0] + ": " + s[1]);
			}
		}
		var plik = plikURL(data.absUrl);
		Site.id_atrakcji = params.id;
		if ($("select#rodzaj").length != 0 && $("select#rodzaj option").length == 0) {
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
			} else {
				if (params.rodzaj)
					$("select#rodzaj").val(params.rodzaj);
			}
			$("select#rodzaj").selectmenu('refresh');
			$("select#rodzaj").change(function() {
				Site.filtrujWyniki();
			});
		}
		$("input#nazwa").keyup(function() {
			Site.filtrujWyniki();
		});
		if (params.hero) {
			$(".ui-page-active .fullScreen").css("background-image", "url(" + Site.atrakcje[params.hero].zdjecia.hero + ")");
		}
		if (Site.id_atrakcji) {
			Site.wczytajDaneAtrakcji();
		}
		if (plik == 'atrakcja.html') {
			$(".hero.klik").click(function() {
				$.mobile.navigate("hero.html?hero=" + Site.id_atrakcji);
			});
		} else if (plik == "atrakcje.html") {
			if ($("#atrakcjeListaAtrakcji").length > 0 && $("#atrakcjeListaAtrakcji li").length == 0) {
				Site.generateList("atrakcjeListaAtrakcji");
				Site.filtrujWyniki();
			}
		}
		localStorage.removeItem('back');
		resize();
	});

	$(window).resize(function() {
		if ($(".ui-page-active div.tresc .txt").length > 0) {
			Site.przeladujAtrakcje();
		} else {
			resize();
		}
	});
	resize();
};
$(window).on("navigate", function(event, data) {
	var direction = data.state.direction;
	if (direction == 'back') {
		localStorage.back = 1;
	}
	if ($("#mainListaAtrakcji").length > 0) {
		var obj = $("#mainListaAtrakcji").parent();
		$("form.ui-listview-filter .ui-input-clear", obj).trigger("click");
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
	$(".ui-page-active div.tresc .txt").html(this.atrakcja.tresc);
	$('a', $(".ui-page-active div.tresc .txt")).contents().unwrap();
	resize();
	var wysTresci = $(".ui-page-active div.tresc").height();
	var wysOkna = $(".ui-page-active div.tresc").parent().height() - 10;
	var podstSzerOkna = $(".ui-page-active div.tresc").parent().parent().width();
	//alert(wysTresci+' '+wysOkna+' '+podstSzerOkna);
	if (wysTresci > wysOkna) {
		var ileRazy = Math.ceil(wysTresci / wysOkna);
		//alert(ileRazy);
		$(".ui-page-active div.tresc").parent().parent().width(podstSzerOkna * ileRazy + 'px');
		resize();
		$(".ui-page-active div.tresc").attr("style", "-webkit-column-count:" + ileRazy);
	}
	//alert("tresc: "+$(".ui-page-active div.tresc").height());
	//alert("wnetrze: "+$(".ui-page-active div.tresc").parent().height());
	//alert("okno: "+$(".ui-page-active div.tresc").parent().parent().height());
	//alert("ekran: "+$(".ui-page-active div.tresc").parent().parent().parent().height());
	$(".ui-page-active div.tresc").parent().parent().width(podstSzerOkna * ileRazy + 'px');
	$(".ui-page-active .hero.klik").css("background-image", "url(" + this.atrakcja.zdjecia.hero + ")");
	if (this.atrakcja.szer_geogr) {
		this.mapaGoogle();
	}
};
Site.przeladujAtrakcje = function() {
	$(".ui-page-active div.tresc .txt").html("");
	$(".ui-page-active div.tresc").parent().parent().width('300px');
	$(".ui-page-active div.tresc").attr("style", "-webkit-column-count:" + 1);
	$("#google_maps").html("");
	this.pokazAtrakcje();
};
Site.mapaGoogle = function() {
	var a = $("<a></a>");
	$(a).attr("href", "geo:" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "?z=15&q=" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "(" + this.atrakcja.tytul + ")");
	var imgSrc = "http://maps.googleapis.com/maps/api/staticmap?center=" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "&zoom=15&size=300x200&maptype=roadmap&markers=color:blue%7C" + this.atrakcja.szer_geogr + "," + this.atrakcja.dl_geogr + "&sensor=false";
	var img = $("<img src='" + imgSrc + "'/>");
	$(a).append(img);
	$("#google_maps").append(a);
};
Site.generatePolecamy = function() {
	var i = 0;
	for (a in this.atrakcje) {
		if (this.atrakcje[a].wyrozniony) {
			i++;
			var inner = $('<a href="atrakcja.html?id=' + a + '"><img src="' + this.atrakcje[a].zdjecia.lista_glowna + '"> ' + '<h2>' + this.atrakcje[a].tytul + '</h2></a>');
			var div = $("<div></div>").append(inner);
			$(".polecamy").append(div);
		}
	}
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
		for (var d in dane) {
			var atr = dane[d];
			if (!Site.atrakcjeWgRodzajow[atr.rodzaj])
				Site.atrakcjeWgRodzajow[atr.rodzaj] = [];
			Site.atrakcjeWgRodzajow[atr.rodzaj].push(d);
		}
		Site.generatePolecamy();
		Site.generateList();
		$.mobile.loading("hide");
	});
};

function resize() {
	var szer = 0;
	var wysOkna = $(window).height();
	$(".ui-page-active div[data-role='okno']").each(function(index) {
		szer += $(this).outerWidth(true);
	});
	$("div[data-role='ekran']").width(szer + 'px');
	$("div[data-role='wnetrze']").height((wysOkna - $("div[data-role='okno'] h2").outerHeight(true) - 10) + 'px');
}

function plikURL() {
	var loc = window.location;
	var pathName = loc.pathname.substring(loc.pathname.lastIndexOf('/') + 1);
	return pathName;
}

jQuery.expr[':'].Contains = function(a, i, m) {
	return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};
$.event.special.swipe = $.extend($.event.special.swipe, {
	start : function(event) {
		var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
		return {
			time : (new Date() ).getTime(),
			coords : [data.pageX, data.pageY],
			origin : $(event.target),
			offset : $('body').scrollTop()
		};
	},

	stop : function(event) {
		var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
		return {
			time : (new Date() ).getTime(),
			coords : [data.pageX, data.pageY],
			offset : $('body').scrollTop()
		};
	},

	handleSwipe : function(start, stop) {
		var swipe = $.event.special.swipe, x = Math.abs(start.coords[0] - stop.coords[0]), y = Math.abs(start.coords[1] - stop.coords[1]), offset = Math.abs(start.offset - stop.offset), time = stop.time - start.time;
		if (time < swipe.durationThreshold && x > swipe.horizontalDistanceThreshold && (y + offset ) < swipe.verticalDistanceThreshold) {

			start.origin.trigger("swipe").trigger((start.coords[0] - stop.coords[0] ) > 0 ? "swipeleft" : "swiperight");
		}
	}
}); 