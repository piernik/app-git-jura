Site = {
	atrakcje : null,
	id_atrakcji : null,
	atrakcja : null,
};
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
			//alert('mam');
			Site.atrakcje[Site.id_atrakcji].pelne_dane = true;
			Site.atrakcje[Site.id_atrakcji].tresc = dane.tresc;
			Site.atrakcje[Site.id_atrakcji].szer_geogr = dane.szer_geogr;
			Site.atrakcje[Site.id_atrakcji].dl_geogr = dane.dl_geogr;
			Site.pokazAtrakcje();
			//$(".strona").show();
			//$(".wgrywam").hide('fast');
			//localStorage.atrakcje = JSON.stringify(dane);
			//Site.atrakcje = dane;
			//Site.generateList();
			//alert(this.atrakcje);
			$.mobile.loading("hide");
		});
	}
};
Site.pokazAtrakcje = function() {
	//alert('Pokazuję atrakcję: '+this.id_atrakcji);
	//var page=$(".ui-page-active[data-role='page']");
	this.atrakcja = this.atrakcje[this.id_atrakcji];
	$(".ui-page-active div[data-role='header'] h1").html(this.atrakcja.tytul);
	$(".ui-page-active div.tresc").html(this.atrakcja.tresc);
	//alert(this.atrakcja.zdjecia.hero);
	//setTimeout("Site.uluzAtrakcje()",1000);
	resize();
	var wysTresci=$(".ui-page-active div.tresc").height();
	var wysOkna=$(".ui-page-active div.tresc").parent().height();
	var podstSzerOkna=$(".ui-page-active div.tresc").parent().parent().width();
	//alert(wysTresci+' '+wysOkna+' '+podstSzerOkna);
	if (wysTresci>wysOkna) {
		var ileRazy=Math.ceil(wysTresci/wysOkna);
		//alert(ileRazy);
		$(".ui-page-active div.tresc").parent().parent().width(podstSzerOkna*ileRazy+'px');
		resize();
		//$("div.tresc", page).css("-webkit-column-count",ileRazy);
		$(".ui-page-active div.tresc").attr("style","-webkit-column-count:"+ileRazy);
	}
	$(".ui-page-active .hero").css("background-image","url("+this.atrakcja.zdjecia.hero+")");
};
Site.uluzAtrakcje = function() {
	
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
	var szer=0;
	//var wysOkna=0;
	var wysOkna=$(window).height();
	$(".ui-page-active div[data-role='okno']").each(function (index) {
		szer+=$(this).outerWidth(true);
		//if ($(this).height()>wysOkna) wysOkna=$(this).height();
	});
	
	//var szer = $(".ui-page-active div[data-role='okno']").length * $(".ui-page-active div[data-role='okno']").outerWidth(true);
	//alert($(".ui-page-active div[data-role='okno']").length+' '+$(".ui-page-active div[data-role='okno']").outerWidth(true));
	//alert(szer);
	$(".ui-page-active div[data-role='ekran']").width(szer + 'px');
	//wysOkna=$(".ui-page-active div[data-role='okno']").height();
	//alert(wysOkna);
	//alert($(".ui-page-active div[data-role='okno'] h2").outerHeight(true));
	$(".ui-page-active div[data-role='wnetrze']").height((wysOkna - $(".ui-page-active div[data-role='okno'] h2").outerHeight(true)) + 'px');
	//alert($(".ui-page-active div[data-role='wnetrze']").height());
}

function plikURL() {
	var loc = window.location;
	var pathName = loc.pathname.substring(loc.pathname.lastIndexOf('/') + 1);
	return pathName;
	//loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
}