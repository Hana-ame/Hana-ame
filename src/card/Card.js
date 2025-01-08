import React, { useEffect } from 'react';
import { useState } from 'react';
import { fetchWithProxy } from '../Tools/Proxy/utils';

const Card = ({ url, alt }) => {
    const [isImage, setIsImage] = useState(false);

    useEffect(() => {

        const checkImage = async () => {
            try {
                const response = await fetchWithProxy(url, { method: 'HEAD' });
                const contentType = response.headers.get('Content-Type');
                console.log(contentType, url);
                if (contentType && contentType.startsWith('image/')) {
                    setIsImage(true);
                } else {
                    setIsImage(false);
                }
            } catch (e) {
                console.log(e)
            }
        }

        checkImage()

        return

    }, [url])

    if (isImage) return <img src={url} alt={alt} />

    return <div>{url}</div>

};

export default Card;