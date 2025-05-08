import React, { useState } from 'react';
import { text2img, getImage } from '../utils/liblib';
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
    // Add more cards as needed
];

function ImagePromptGenerator() {
    // State for the input prompt
    const [prompt, setPrompt] = useState('');
    // State for the image URL (null initially)
    const [imageUrl, setImageUrl] = useState(null);
    // Optional: Loading state for image generation
    const [isLoading, setIsLoading] = useState(false);

    // --- Event Handlers ---

    // Handles clicking on a prompt card
    const handleCardClick = (promptsToAdd) => {
        // Join the prompts with a space
        const promptsString = promptsToAdd.join(', '); // Using comma + space as separator
        setPrompt((prevPrompt) => {
            // Add a space before new prompts if the input is not empty
            const separator = prevPrompt.trim() ? ', ' : '';
            return prevPrompt + separator + promptsString;
        });
    };

    // Handles changes in the input field
    const handleInputChange = (event) => {
        setPrompt(event.target.value);
    };

    const onUpload = (url = "") => {
        const meta_data = JSON.stringify({ "tags": ["text2pic"] })
        createUploadFile(url, prompt, meta_data);
    }

    // Handles clicking the "Generate" button (placeholder action)
    const handleGenerateClick = () => {
        if (!prompt.trim()) {
            alert('请输入或选择一些提示词！');
            return;
        }
        console.log('Generating image with prompt:', prompt);
        setIsLoading(true);
        setImageUrl(null); // Clear previous image

        // // Simulate an API call or image generation process
        // setTimeout(() => {
        //   // Replace with your actual image generation logic/API call result
        //   const generatedImageUrl = `https://via.placeholder.com/600x400.png/007bff/ffffff?text=Generated+Image+for+${encodeURIComponent(prompt.substring(0, 30))}...`;
        //   setImageUrl(generatedImageUrl);
        //   setIsLoading(false);
        // }, 2000); // Simulate 2 seconds delay
        text2img({
            prompt: prompt,
        }).then(r => {
            console.log(r)
            const uuid = r.data.generateUuid;
            if (!uuid) {
                setError('生成失败');
                return;
            }

            getImage(uuid, (url) => { setImageUrl(url); setIsLoading(false); onUpload(url)})
        })
    }



    // --- Render Logic ---

    // Outer container: Takes full height, uses flex column layout
    return (
        <div className="flex flex-col min-h-screen bg-gray-50   text-gray-900  ">

            {/* Main content area: Takes remaining space, allows scrolling */}
            <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto">

                {/* Prompt Cards Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">选择提示词模板</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {promptCardsData.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(card.prompts)}
                                className="bg-white   p-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out cursor-pointer border border-gray-200  "
                            >
                                <h3 className="text-xl font-bold mb-2 text-blue-600  ">{card.title}</h3>
                                <p className="text-gray-600  ">{card.text}</p>
                                {/* Optional: Show the actual prompts */}
                                {/* <div className="mt-3 text-xs text-gray-500   break-words">
                  提示: {card.prompts.join(', ')}
                </div> */}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Image Display Area */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">生成结果</h2>
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200   rounded-lg flex items-center justify-center min-h-[300px] overflow-hidden">
                        {isLoading ? (
                            <div className="text-center p-8">
                                {/* Simple Spinner */}
                                <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg font-medium text-gray-700  ">正在生成图片...</p>
                            </div>
                        ) : imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={`Generated image based on prompt: ${prompt}`}
                                className="object-contain w-full h-full"
                            />
                        ) : (
                            <button
                                onClick={handleGenerateClick}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 shadow-lg"
                            >
                                点击生成图片
                            </button>
                        )}
                    </div>
                </section>

            </main>

            {/* Fixed Input Area at the bottom */}
            {/* Using 'sticky' is often better than 'fixed' within a flex container to avoid overlap issues */}
            <footer className="sticky bottom-0 left-0 right-0 w-full bg-white   p-4 shadow-lg border-t border-gray-200  ">
                <div className="container mx-auto flex items-center gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={handleInputChange}
                        placeholder="输入你的提示词，或点击上方卡片添加..."
                        className="flex-grow px-4 py-2 border border-gray-300   rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500   bg-white   text-gray-900   placeholder-gray-500  "
                    />
                    {/* Optional: Add a dedicated generate button here as well */}
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || !prompt.trim()} // Disable if loading or prompt is empty
                        className={`px-5 py-2 rounded-md text-white font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2   ${isLoading || !prompt.trim()
                            ? 'bg-gray-400   cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
                            }`}
                    >
                        {isLoading ? '生成中...' : '生成'}
                    </button>
                    {/* Optional: Clear button */}
                    {prompt && (
                        <button
                            onClick={() => { setPrompt(''); setImageUrl(null); }} // Clear prompt and image
                            title="清空输入框"
                            className="p-2 text-gray-500 hover:text-red-500     transition-colors duration-200 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}

export default ImagePromptGenerator;