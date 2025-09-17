// 感觉太不安全了，弃用。

import React, { useState, useEffect } from 'react';
import { fetchWithProxy } from '@/Tools/Proxy/utils'

const Torrents = ({ t, gid }) => {
    const [state, setState] = useState("loading")
    const [torrents, setTorrents] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchWithProxy(
                `https://ex.moonchan.xyz/gallerytorrents.php?gid=${gid}&t=${t}`,
                {
                    method: 'GET',
                    headers: {
                        'X-Cookie': "",
                    }
                }
            );
        }
    })


    if (state === "loading") return { state }



    return (
        <div>
            {torrents.map(torrent => {
                return <div>{torrent}</div>
            })}
        </div>
    )
}


export default Torrents;