async function appendDiv(childNode, favourateUrl){
  let div = await fetch(favourateUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      let div = document.createElement('div');
      for (const item of data){
        let img = document.createElement('img');
        img.src = item['avatar'];
        div.appendChild(img);
      }      
      console.log( div );
      // thisNode.appendChild(div);
      return div;
    });
  
  console.log(div);

  childNode.appendChild(div);
}

async function blurByXpath(xpath){
  // let basicIter = document.evaluate('//*[@class="navigation-bar"]/a', document, null, XPathResult.ANY_TYPE, null );
  // let basicNode = basicIter.iterateNext();
  // console.log(basicNode);
  const basicURL = window.location.hostname
  let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
  console.log(iter)
  try {
    let thisNode = iter.iterateNext();    
    while (thisNode) {
      // console.log( thisNode.textContent );
      // thisNode.style.setProperty('filter','blur(4px)')
      let childIter = document.evaluate('.//*[@class="status__info"]/a', thisNode, null, XPathResult.ANY_TYPE, null );
      let childNode = childIter.iterateNext(); 

      if (childNode == null){
        // thisNode.style.setProperty('background-color', '#FF0000');
        thisNode = iter.iterateNext();
        continue;
      }
      // thisNode.style.setProperty('background-color', 'rgb(49, 53, 67)');

      // console.log( childNode.textContent );
      let url = childNode.href;
      console.log(url);
      
      let re = /.*\/\/([\w\.]+)\/(\@\w+)\/([0-9]+)/g; 
      let arr = re.exec(url);

      // console.log(arr);
      console.log(arr[1]);
      console.log(arr[2]);
      console.log(arr[3]);

      // let favourateUrl = "https://" + basicURL + "/web/" + arr[2] + "/" + arr[3] + "/favourites";
      // if (arr[1] != basicURL){
      //   favourateUrl = "https://" + basicURL + "/web/" + arr[2] + "@" + arr[1] + "/" + arr[3] + "/favourites";
      // }
      let favourateUrl = "https://" + basicURL + "/api/v1/statuses/" + arr[3] + "/favourited_by";
      // https://o3o.ca/api/v1/statuses/108635321072705104/favourited_by
      console.log( favourateUrl );

      await appendDiv(childNode, favourateUrl);


      thisNode = iter.iterateNext();
    }
  }
  catch (e) {
    console.log(e);
  }
}  
blurByXpath('//article')
