let c = document.getElementsByClassName(`display-name__account`);
let re = /^(?:\s|\n)*(@\w+)/g; 
for (let i=0;i<c.length;i++){
    let e = c.item(i);
    /* console.log(e.textContent); */
    re.lastIndex = 0;
    let arr = re.exec(e.textContent);
    /* console.log(arr); */
    e.textContent = arr[1];
}