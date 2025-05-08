export interface Img2ImgParams {
    prompt?: string;
    image?: string;
    width?: number;
    height?: number;
    imgCount?: number;
    steps?: number;
    controlNet?: never[];
}
