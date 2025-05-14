import { useState, type ChangeEvent, useRef } from 'react';
import { img2img, getImage } from '../utils/liblib'; // Assuming Text2ImgParams is exported
import type { Img2ImgParams } from '../utils/type'
import { uploadFile } from '../utils/upload'; // Import your upload function
import { createUploadFile } from '../utils/dapp.js'

// Define the data for the prompt cards
const promptCardsData = [
    {
        id: 1,
        title: '风格提示',
        text: '点击添加常见的艺术风格到你的提示词中。',
        prompts: ['cinematic lighting', 'hyperrealistic', 'anime style', 'fantasy art'],
    },
    {
        id: 2,
        title: '画面质量',
        text: '点击添加提升画面质量和细节的提示词。',
        prompts: ['4k resolution', 'highly detailed', 'sharp focus', 'intricate details'],
    },
    {
        id: 3,
        title: '场景氛围',
        text: '点击添加描述特定场景氛围的提示词。',
        prompts: ['moody atmosphere', 'golden hour', 'dramatic shadows', 'ethereal glow'],
    },
];

interface ImageGenerationStudioProps {
    /**
     * Optional callback function that is called with the URL
     * of the successfully uploaded image.
     */
    onImageUploaded?: (url: string) => void;
}

function ImageGenerationStudio({ onImageUploaded }: ImageGenerationStudioProps) {
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

    // --- States for Image Upload ---
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // File selected by user, potentially for upload
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // URL from server after successful upload
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null); // Specific error for upload process

    // --- States for Image Generation (text2img) ---
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCardClick = (promptsToAdd: string[]) => {
        const promptsString = promptsToAdd.join(', ');
        setPrompt((prevPrompt) => {
            const separator = prevPrompt.trim() ? ', ' : '';
            return prevPrompt + separator + promptsString;
        });
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPrompt(event.target.value);
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setUploadError(null); // Clear previous upload errors
        const file = event.target.files && event.target.files[0];

        if (!file) {
            // User cancelled file selection, don't clear selectedFile if an upload was pending/failed
            // Only clear if the input itself is reset.
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (!file.type.startsWith('image/')) {
            setUploadError('请上传图片文件 (例如 PNG, JPG, WEBP)。');
            setSelectedFile(null); // Clear invalid file selection
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
            return;
        }

        if (typeof uploadFile !== 'function') {
            console.error("uploadFile function is not provided or not a function.");
            setUploadError("系统配置错误：无法处理文件上传。");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setSelectedFile(file); // Keep track of the file being processed
        setUploadedImageUrl(null); // Clear previously successfully uploaded image URL
        setIsUploading(true);

        try {
            const url = await uploadFile(file); // Call the imported upload function
            setUploadedImageUrl(url);
            if (onImageUploaded) { // If a handler prop is provided, call it
                onImageUploaded(url);
            }
            setUploadError(null); // Clear any error on success
            setSelectedFile(null); // Clear the selected file object after successful upload
        } catch (err: unknown) {
            console.error("Upload failed:", err);
            const errorMessage = err instanceof Error ? err.message : "文件上传失败，请重试。";
            setUploadError(errorMessage);
            setUploadedImageUrl(null); // Ensure no stale URL on failure
            // Keep selectedFile so user sees which file failed and can clear it
        } finally {
            setIsUploading(false);
            // Reset the file input value so onChange triggers if the same file is re-selected
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveUploadedImage = () => {
        setSelectedFile(null);
        setUploadedImageUrl(null);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleGenerateClick = async () => {
        if (!prompt.trim()) {
            setGenerationError('请输入或选择一些提示词！');
            return;
        }
        setGenerationError(null);
        setUploadError(null); // Clear upload error if user proceeds to generate
        console.log('Generating image with prompt:', prompt, 'Uploaded image for reference:', uploadedImageUrl);
        setIsGenerating(true);
        setGeneratedImageUrl(null);

        try {
            const params: Img2ImgParams = { prompt, image: uploadedImageUrl || "" };
            console.log(params);
            // TODO: Future enhancement: If `uploadedImageUrl` exists,
            // you might want to switch to an img2img API call.
            // For now, `uploadedImageUrl` is just for reference or future use.
            // if (uploadedImageUrl) {
            //   params.image_guidance = uploadedImageUrl; // Example
            // }

            // const response = await img2img(params);
            // console.log('API Response:', response);
            // const uuid = response?.data?.generateUuid || response?.generateUuid;

            // if (!uuid) {
            //     setGenerationError(response?.message || response?.msg || '生成请求失败，未获取到任务ID。');
            //     setIsGenerating(false);
            //     return;
            // }

            // getImage(uuid, (url: string | null, errMessage?: string) => {
            //     if (errMessage) {
            //         setGenerationError(errMessage || '获取图片失败。');
            //         setGeneratedImageUrl(null);
            //     } else if (url) {
            //         setGeneratedImageUrl(url);
            //         setGenerationError(null);
            //         // const onUpload = (url = "") => {
            //         const meta_data = JSON.stringify({ "tags": ["pic2pic"] })
            //         createUploadFile(url, prompt, meta_data);
            //         // }
            //     } else {
            //         setGenerationError('获取图片超时或发生未知错误。');
            //         setGeneratedImageUrl(null);
            //     }
            //     setIsGenerating(false);


            // });


            const meta_data = JSON.stringify({ "tags": ["pic2pic"] })
            setGeneratedImageUrl("https://liblibai-tmp-image.liblib.cloud/img/4ca78abc5faf4a3f8a5dbb4efe105678/6be7f19df3cf04e83c48e098c8a6202cd54f2a5671ce7af4453aafd128146b84.png");
            createUploadFile("https://liblibai-tmp-image.liblib.cloud/img/4ca78abc5faf4a3f8a5dbb4efe105678/6be7f19df3cf04e83c48e098c8a6202cd54f2a5671ce7af4453aafd128146b84.png", prompt, meta_data);
            setIsGenerating(false);

        } catch (apiError: unknown) {
            console.error('Error during image generation call:', apiError);
            if (apiError instanceof Error) {
                setGenerationError(apiError.message || '生成过程中发生错误。');
            } else {
                setGenerationError('生成过程中发生未知错误。');
            }
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
            <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto">
                {/* Prompt Cards Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">选择提示词模板</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {promptCardsData.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(card.prompts)}
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out cursor-pointer border border-gray-200"
                            >
                                <h3 className="text-xl font-bold mb-2 text-blue-600">{card.title}</h3>
                                <p className="text-gray-600">{card.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Image Display and Upload Area */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">创作空间</h2>
                    {/* Display generation errors if any */}
                    {generationError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                            <strong>生成错误:</strong> {generationError}
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Side: Upload Area */}
                        <div className="md:w-1/2 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[300px] aspect-w-4 aspect-h-3 sm:aspect-w-3 sm:aspect-h-4 md:aspect-auto relative">
                            {isUploading ? (
                                <div className="text-center">
                                    <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm font-medium text-gray-700">正在上传: {selectedFile?.name}</p>
                                    <p className="text-xs text-gray-500">请稍候...</p>
                                </div>
                            ) : uploadedImageUrl ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    <img
                                        src={uploadedImageUrl}
                                        alt="已上传图片"
                                        className="object-contain max-w-full max-h-full rounded-md shadow"
                                    />
                                    <button
                                        onClick={handleRemoveUploadedImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors text-xs shadow-md"
                                        title="移除已上传图片"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center w-full p-4">
                                    {uploadError && (
                                        <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-600 rounded-md text-xs">
                                            <strong>上传提示:</strong> {uploadError}
                                            {selectedFile && ` (文件: ${selectedFile.name})`}
                                        </div>
                                    )}
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">上传参考图 (可选)</p>
                                    <p className="text-xs text-gray-500 mb-3">PNG, JPG, GIF, WEBP</p>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        ref={fileInputRef}
                                        accept="image/png, image/jpeg, image/webp, image/gif"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="imageUpload"
                                        className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer`}
                                    >
                                        {isUploading ? '处理中...' : '选择文件'}
                                    </label>
                                    {selectedFile && !isUploading && !uploadedImageUrl && ( // If a file failed upload and is still selected
                                        <div className="mt-2 text-xs text-gray-500">
                                            <p>当前文件: {selectedFile.name}</p>
                                            <button onClick={handleRemoveUploadedImage} className="text-blue-500 hover:text-blue-700 font-semibold">(清除并重试)</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Generated Image Display */}
                        <div className="md:w-1/2 bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px] overflow-hidden aspect-w-4 aspect-h-3 sm:aspect-w-3 sm:aspect-h-4 md:aspect-auto">
                            {isGenerating ? (
                                <div className="text-center p-8">
                                    <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" /* ... spinner SVG ... */ >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-lg font-medium text-gray-700">正在生成图片...</p>
                                </div>
                            ) : generatedImageUrl ? (
                                <img
                                    src={generatedImageUrl}
                                    alt={`Generated based on: ${prompt}`}
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">图片生成区</h3>
                                    <p className="text-sm text-gray-500">
                                        输入提示词并点击下方 "生成" 按钮。
                                        {uploadedImageUrl ? " 已上传参考图。" : " 您也可以先上传一张参考图。"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Fixed Input Area at the bottom */}
            <footer className="sticky bottom-0 left-0 right-0 w-full bg-white p-4 shadow-lg border-t border-gray-200">
                <div className="container mx-auto flex flex-col sm:flex-row items-center gap-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={handleInputChange}
                        placeholder="输入你的提示词，或点击上方卡片添加..."
                        className="flex-grow w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
                        <button
                            onClick={handleGenerateClick}
                            disabled={isGenerating || isUploading || !prompt.trim()}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-md text-white font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isGenerating || isUploading || !prompt.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
                                }`}
                        >
                            {isGenerating ? '生成中...' : (isUploading ? '等待上传...' : '生成')}
                        </button>
                        {(prompt || generatedImageUrl || uploadedImageUrl || selectedFile) && (
                            <button
                                onClick={() => {
                                    setPrompt('');
                                    setGeneratedImageUrl(null);
                                    setGenerationError(null);
                                    handleRemoveUploadedImage(); // Clears uploaded/selected image and upload error
                                }}
                                title="全部清空"
                                className="p-2.5 text-gray-500 hover:text-red-500 transition-colors duration-200 rounded-md border border-gray-300 hover:border-red-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default ImageGenerationStudio;