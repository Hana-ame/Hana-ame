export interface Img2ImgParams {
    prompt?: string;
    image?: string;
    width?: number;
    height?: number;
    imgCount?: number;
    steps?: number;
    controlNet?: never[];
}

/**
 * Defines the parameters for a Text2Image request.
 */
export interface Text2ImgParams {
    /**
     * The main prompt describing the desired image.
     * Default: "1 girl,cat girl,masterpiece,best quality,finely detail,highres,8k,beautiful and aesthetic,no watermark"
     */
    prompt?: string;

    /**
     * The width of the generated image in pixels.
     * Default: 768
     */
    width?: number;

    /**
     * The height of the generated image in pixels.
     * Default: 1024
     */
    height?: number;

    /**
     * The number of images to generate.
     * Default: 1
     */
    imgCount?: number;

    /**
     * The number of sampling steps.
     * Default: 30
     */
    steps?: number;

    /**
     * ControlNet parameters, if any.
     * This should be an object representing the ordered map, or null.
     * Example: { "module": "canny", "model": "control_canny-fp16 [e3fe7712]", "weight": 1, "image": "base64_encoded_image_string" }
     * Default: null
     */
    controlNet?: never[];
}

export interface Post {
    id: string;
    username: string;
    url: string;
    content: string;
    owner?: string;
    meta_data?: string;
}


export interface Owner {
    id: string;
    onsale: boolean;
    owner: string;
    price: string;
}

export interface User {
    avatar: string;
    banner: string;
    deposit: string;
}