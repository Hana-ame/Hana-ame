import traceback
import time

import base64
import urllib
import urllib.request
import urllib.parse

import xml.etree.cElementTree as ET

import sqlite3



headers = {
    "User-Agent"     :  "curl/7.55.1", 
}
urlb64 = b'aHR0cHM6Ly93eHcubW9lL0BIYXJ1VXJhcmEucnNz'
url = base64.b64decode(urlb64).decode()

req = urllib.request.Request(
    url,
    headers=headers,    
)

proxy_support = urllib.request.ProxyHandler({'http' : 'http://localhost:10809/', 
                                             'https': 'http://localhost:10809/'})
opener = urllib.request.build_opener(proxy_support)

con = sqlite3.connect(".db")
cur = con.cursor()
try:
    cur.execute("""
    CREATE TABLE items
    (   guid PRIMARY KEY 
    ,   xmltext
    )
    """)
except Exception:
    print(traceback.format_exc())
con.commit()


def once():
    global headers, urlb64, url, req
    htmlStream = None
    try:
        # with opener.open(req,timeout=5) as response:
        with urllib.request.urlopen(req,timeout=5) as response:
            htmlStream = response.read()
    except Exception:
        print(traceback.format_exc())
        return 'fail'

    html = htmlStream.decode()
    root = ET.fromstring(html)

    l = root.findall('.//item')
    l.reverse()
    for item in l:
        # print(item.find('guid').text, ET.tostring(item,encoding='unicode'))
        cur.execute('INSERT OR IGNORE INTO items(guid, xmltext) values(?, ?)', (item.find('guid').text, ET.tostring(item,encoding='unicode')))
    con.commit()
    return 'success'


if __name__ == '__main__':
    r = ""
    while True:
        r = once()
        if r == 'success':
            print(time.ctime(time.time()))
            time.sleep(300)
        else:
            print('fail', time.ctime(time.time()))