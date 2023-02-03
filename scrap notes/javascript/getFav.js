javascript: (
  async function() {
    let url = new URL(location.href);
    let re = /wxw.moe\/web\/@\w+\/(\d+)\/favourites/
    let arr = re.exec(url);
    
    if (arr == null) return;
})();