import { type Img2ImgParams } from './type';

export function img2img(params: Img2ImgParams) {
    const ENDPOINT = "https://chat.moonchan.xyz/dapp/generate/webui/img2img/ultra";

    const payload = {
        prompt: params.prompt || "1 girl,cat girl,masterpiece,best quality,finely detail,highres,8k,beautiful and aesthetic,no watermark",
        image: params.image,
        width: params.width || (192),
        height: params.height || (256),
        img_count: params.imgCount || 1,
        steps: params.steps || 30,
        control_net: params.controlNet || null,
    };

    return fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

export function getStatus(uuid: string) {
    const ENDPOINT = `https://chat.moonchan.xyz/dapp/generate/webui/status`;

    return fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generateUuid: uuid })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}