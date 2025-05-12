import { useState } from "react";
import { uploadFile } from "../utils/upload";
import { getStatus, img2img } from "../utils/liblib";

const Editor = () => {
    const [imageSrc, setImageSrc] = useState<string>("");
    const [generatedImageSrc, setGeneratedImageSrc] = useState<string>("");


    const [error, setError] = useState<string>();
    const [prompt, setPrompt] = useState<string>("");

    function getImage(uuid: string) {
        console.log(uuid)
        getStatus(uuid).then(r => {
            console.log(r)
            const src = r.data?.images[0]?.imageUrl
            if (src) {
                setGeneratedImageSrc(src);
            } else {
                setTimeout(getImage, 1000, uuid);
            }
        })
    }
    
    function postImage() {
        console.log(prompt, imageSrc);
        img2img({ prompt, image: imageSrc }).then(r => {
            console.log(r)
            const uuid = r.data!.generateUuid!;
            if (!uuid) {
                setError('生成失败');
                return;
            }
            setTimeout(getImage, 1000, uuid);
        })
    }

    return (
        <div className="flex flex-col h-screen p-4">
            {/* 图片展示区域 */}
            <div className="flex flex-1 gap-4 mb-4">
                {/* 左列上传 */}
                <ImageUploader imageSrc={imageSrc} setImageSrc={setImageSrc}></ImageUploader>

                {/* 右列上传 */}
                <div
                    className="relative flex items-center justify-center w-1/2 max-h-140"
                    style={{
                        // width: '50%',    
                        // height: '200px',
                        borderRadius: '16px',
                        border: imageSrc ? 'none' : '2px dashed #d1d5db',
                        backgroundColor: imageSrc ? 'transparent' : '#f3f4f6'
                    }}
                >
                    <button
                        onClick={postImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {generatedImageSrc ? (
                        <img
                            src={generatedImageSrc}
                            alt="generated image"
                            className="w-full h-full object-cover rounded-[14px]"
                        />
                    ) : (
                        <div className="flex flex-col items-center space-y-2">
                            {/* 加号图标 */}
                            {/* <div className="relative w-12 h-12">
                        <div className="absolute inset-0">
                            <div className="w-full h-1 bg-gray-500 transform translate-y-[5.5px] rounded-full" />
                            <div className="h-full w-1 bg-gray-500 transform translate-x-[5.5px] rounded-full" />
                        </div>
                    </div> */}
                            <span className="text-gray-600 text-sm">点击生成图片</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 底部输入框 */}
            <div className="pt-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="1 girl,masterpiece"
                    className="w-full p-2 border rounded"
                    rows={3}
                />
                {/* <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
                    提交并生成图片
                </button> */}
            </div>
            {error && error}
        </div>



    )
}

export default Editor

const ImageUploader = ({ imageSrc, setImageSrc }: { imageSrc: string, setImageSrc: React.Dispatch<React.SetStateAction<string>> }) => {

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        uploadFile(e.target!.files![0]);
    }
    const uploadFile = async (file: File) => {
        if (!file) {
            // setError('请选择文件');
            return;
        }
        // setLeftLoading(true);
        const leftImageUrl = await uploadFile(file)
        // setLeftLoading(false);
        setImageSrc(leftImageUrl);
    };

    return (
        <div
            className="relative flex items-center justify-center w-1/2 max-h-140"
            style={{
                // width: '50%',    
                // height: '200px',
                borderRadius: '16px',
                border: imageSrc ? 'none' : '2px dashed #d1d5db',
                backgroundColor: imageSrc ? 'transparent' : '#f3f4f6'
            }}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt="Upload preview"
                    className="w-full h-full object-cover rounded-[14px]"
                />
            ) : (
                <div className="flex flex-col items-center space-y-2">
                    {/* 加号图标 */}
                    {/* <div className="relative w-12 h-12">
                        <div className="absolute inset-0">
                            <div className="w-full h-1 bg-gray-500 transform translate-y-[5.5px] rounded-full" />
                            <div className="h-full w-1 bg-gray-500 transform translate-x-[5.5px] rounded-full" />
                        </div>
                    </div> */}
                    <span className="text-gray-600 text-sm">点击上传图片</span>
                </div>
            )}
        </div>
    );
};


//   export default ImageUploader;
