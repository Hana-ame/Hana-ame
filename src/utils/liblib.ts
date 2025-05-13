import { type Img2ImgParams, type Text2ImgParams } from './type';

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

/**
 * Calls the backend API to generate an image from text.
 * @param params - The parameters for the text-to-image generation.
 * @returns A Promise that resolves to the API response (typically an object containing image data).
 */
export async function text2img(params: Text2ImgParams) { // You might want to define a more specific return type
    // IMPORTANT: Adjust this endpoint to your actual text2img API endpoint
    const ENDPOINT = "https://chat.moonchan.xyz/dapp/generate/webui/text2img/ultra";

    const payload = {
        prompt: params.prompt || "1 girl,cat girl,masterpiece,best quality,finely detail,highres,8k,beautiful and aesthetic,no watermark",
        width: params.width || 192,
        height: params.height || 256,
        img_count: params.imgCount || 1, // Maps to imgCount in Go, assuming backend expects snake_case
        steps: params.steps || 30,
        control_net: params.controlNet === undefined ? null : params.controlNet, // Maps to controlNet, handles undefined by sending null
        // If params.controlNet is explicitly null, null is sent.
        // If params.controlNet is an object, the object is sent.
    };

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other necessary headers, like Authorization if required
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorBody = 'Could not retrieve error body.';
            try {
                errorBody = await response.text();
            } catch (e) {
                // Ignore if reading text body fails
                console.error(e)
            }
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        return await response.json(); // Assumes the response is JSON
    } catch (error) {
        console.error("Error in text2img request:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

// Example Usage (you would call this from your application code):
/*
async function generateMyImage() {
    try {
        const result = await text2img({
            prompt: "a futuristic cityscape at sunset",
            width: 512,
            height: 512,
            imgCount: 2,
            steps: 25,
            // controlNet: { // Example if you were using ControlNet
            //   "module": "depth",
            //   "model": "control_depth-fp16 [400750f6]",
            //   "weight": 0.75,
            //   "image": "YOUR_BASE64_ENCODED_CONDITIONING_IMAGE_HERE"
            // }
        });
        console.log("Image generation successful:", result);
        // Process the result, e.g., display images
    } catch (error) {
        console.error("Image generation failed:", error);
    }
}

// generateMyImage();
*/

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

export function getImage(uuid: string, callback = (src: string) => { console.log(src) }) {
    console.log(uuid)
    getStatus(uuid).then(r => {
        console.log(r)
        const src = r.data?.images[0]?.imageUrl
        if (src) {
            return callback(src);
        } else {
            setTimeout(getImage, 1000, uuid, callback);
        }
    })
}
