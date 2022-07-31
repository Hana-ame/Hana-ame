javascript:(function(){
  var host = document.location.host;
  var url = encodeURIComponent(document.location.href);
  console.log(`read://https_${host}/?url=${url}`);
  /* window.location.href = `read://https_${host}/?url=${url}`; */
  navigator.clipboard.writeText(`read://https_${host}/?url=${url}`);
})();