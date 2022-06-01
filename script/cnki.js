javascript: (function () {
    if (location.href.startsWith("https://oversea.cnki.net")) /* oversea */ 
        t = location.href.replace("https://oversea.cnki.net", "https://kns.cnki.net");  
    else if (location.href.startsWith("https://kns.cnki.net"))
        t = location.href.replace("https://kns.cnki.net", "https://oversea.cnki.net"); 
    else if (!location.href.startsWith("https://www.cnki.net/"))
        t = "https://www.cnki.net/"
    location.href = t;
}());