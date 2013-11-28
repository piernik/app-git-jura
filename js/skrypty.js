Site = {
	atrakcje : null,
	id_atrakcji:null,
	atrakcja:null,
};
//localStorage.removeItem( 'atrakcje');
Site.init = function() {
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'flip';
	if (!localStorage.atrakcje) {
		//alert('Wgrywam dane z serwera');
		Site.wczytajDane();
	} else {
		//alert('Mam dane lokalnie');
		//if (plikURL()=='index.html') {
		//$.mobile.navigate( "main.html" );
		//} else {
		//alert(localStorage.atrakcje);
		this.atrakcje = JSON.parse(localStorage.atrakcje);
		this.generatePolecamy();
		this.generateList();
		//}
	}
	$(document).on('pagebeforeshow', function () {
		Site.id_atrakcji=localStorage.id;
		localStorage.removeItem('id');
		if (Site.id_atrakcji) {
			Site.wczytajDaneAtrakcji();
		}
  }); 
	
	$("a").on("click", function(event) {
		event.preventDefault();
		var href=$(this).attr("href");
		
		var url = href.split("?");
		var parameters = url[1].split("&");
		for (var p in parameters) {
			var s=parameters[p].split("=");
			localStorage[s[0]] = s[1];
			//alert(localStorage.id);
		}
		$.mobile.navigate(url[0]);
	});
	$(window).resize(function() {
		resize();
	});
	resize();
	var szer = $("div[data-role='okno']", $("div[data-role='ekran']")).length * $("div[data-role='okno']").outerWidth(true);
	$("div[data-role='ekran']").width(szer + 'px');
	$("div[data-role='wnetrze']").height(($("div[data-role='okno']").height() - $("div[data-role='okno'] h2").outerHeight(true) - 50) + 'px');
};
Site.wczytajDaneAtrakcji=function() {
	//
	if (this.atrakcje[this.id_atrakcji].pelne_dane) {
		Site.pokazAtrakcje();
	} else {
		$.mobile.loading("show", {
			text : "Pobieram dane atrakcji",
			textVisible : true,
			theme : "a",
			html : ""
		});
		$.ajax({
			url : "http://www.polskieszlaki.pl/_a_dane.php?id_atrakcji="+this.atrakcje[this.id_atrakcji].id,
			dataType : "json",
		}).done(function(dane) {
			//alert(dane);
			//alert('mam');
			Site.atrakcje[Site.id_atrakcji].pelne_dane=true;
			Site.atrakcje[Site.id_atrakcji].tresc=dane.tresc;
			Site.atrakcje[Site.id_atrakcji].szer_geogr=dane.szer_geogr;
			Site.atrakcje[Site.id_atrakcji].dl_geogr=dane.dl_geogr;
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
Site.pokazAtrakcje=function() {
	this.atrakcja=this.atrakcje[this.id_atrakcji];
	$("div[data-role='header'] h1").html(this.atrakcja.tytul);
	$("div.tresc").html(this.atrakcja.tresc);
};
Site.generatePolecamy = function() {
	var i = 0;
	for (a in this.atrakcje) {
		if (this.atrakcje[a].wyrozniony) {
			i++;
			var inner = $('<a href="atrakcja.html?id=' + a + '"><img src="' + this.atrakcje[a].zdjecia.lista_glowna + '"> ' + '<h2>' + this.atrakcje[a].tytul + '</h2></a>');
			var div = $("<div></div>").append(inner);
			if (i % 2 == 0)
				var cl = "grid-1";
			else
				var cl = "grid-2";
			$(div).addClass(cl);
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
		Site.generateList();
		//alert(this.atrakcje);
		$.mobile.loading("hide");
	});
};
function resize() {
	$("div[data-role='content']").height(($(window).height()) + 'px');
}

function plikURL() {
	var loc = window.location;
	var pathName = loc.pathname.substring(loc.pathname.lastIndexOf('/') + 1);
	return pathName;
	//loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
}