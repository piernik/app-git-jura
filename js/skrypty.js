Site = {
	atrakcje : null,
};
//localStorage.removeItem( 'atrakcje');
Site.init = function() {
	$.support.cors=true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition  = 'flip';
	if (!localStorage.atrakcje) {
		//alert('Wgrywam dane z serwera');
		Site.wczytajDane();
	} else {
		//alert('Mam dane lokalnie');
		//if (plikURL()=='index.html') {
			//$.mobile.navigate( "main.html" );
		//} else {
			//alert(localStorage.atrakcje);
			this.atrakcje=JSON.parse(localStorage.atrakcje);
			this.generateList();
		//}
	}
	$( window ).resize(function() {
		resize();
	});
	resize();
	var szer=$( "div[data-role='okno']" , $("div[data-role='ekran']")).length*$( "div[data-role='okno']").outerWidth(true);
	$("div[data-role='ekran']").width(szer+'px');
	$("div[data-role='wnetrze']").height(($("div[data-role='okno']").height()-$("div[data-role='okno'] h2").outerHeight(true)-50)+'px');
};
Site.generateList = function() {
	for (a in this.atrakcje) {
		var inner = $('<img src="' + this.atrakcje[a].zdjecia.lista + '"> ' + '<h2>' + this.atrakcje[a].tytul + '</h2>');
		var a = $("<a></a>").append(inner);
		var li = $("<li></li>").append(a);
		$("#listaAtrakcji").append(li);
	}
	$("#listaAtrakcji").listview("refresh");
};
Site.wczytajDane = function () {
	$.mobile.loading("show", {
		text : "Wczytuję",
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
	$("div[data-role='content']").height(($( window ).height())+'px');
}
function plikURL() {
    var loc = window.location;
    var pathName = loc.pathname.substring(loc.pathname.lastIndexOf('/') + 1);
    return pathName;//loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
}