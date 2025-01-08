// 要做成什么样啊

import React, { useEffect } from 'react';
import { useState } from 'react';
import { fetchWithProxy } from '../Tools/Proxy/utils';

const AbstractCard = ({ url, alt }) => {
    const [title, setTitle] = useState("title");
    const [favicon, setFavicon] = useState("//favicon.ico");
    const [abstract, setAbstract] = useState("abstract");

    useEffect(() => {

        const checkImage = async () => {
            try {
                const response = await fetchWithProxy(url);

            } catch (e) {
                console.log(e)
            }
        }

        checkImage()

        return

    }, [url])

    return <div>{url}</div>

};

export default AbstractCard;