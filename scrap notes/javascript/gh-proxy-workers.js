const destinationURL = "https://raw.githubusercontent.com"
const statusCode = 301

addEventListener("fetch",  event => { 
  return event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const urlStr = request.url  // request的域名
  const urlObj = new URL(urlStr) // 同样是域名
  const path = urlObj.href.substr(urlObj.origin.length) // 提取请求域名中的path
  // console.log(path)

  // 不要http!
  if (urlObj.protocol == `http:`){
    // console.log(urlObj.host)
    // console.log(urlObj.pathname)
    // console.log(urlObj.href)

    urlObj.protocol = 'https:'

    // var newhref = `https:`+urlObj.href.split(':')[1]
    // console.log(newhref)
    return Response.redirect(urlObj.href, statusCode)
  }


  // 抓
  const res = await fetch( destinationURL+path, {
      method: request.method,
      headers: request.headers,
      redirect: 'manual',
    })

  // 换头
  newHead = new Headers(res.headers)
  newHead.delete('access-control-allow-origin')
  newHead.set('access-control-allow-origin', '*')
  newHead.delete('content-security-policy')
  newHead.delete('content-security-policy-report-only')
  newHead.delete('clear-site-data')

  newHead.delete(`content-type`)
  newHead.set(`content-type`,`application/javascript`)

  return new Response(res.body,{
      status: res.status,
      headers: newHead
    })
}