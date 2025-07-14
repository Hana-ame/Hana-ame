import { useEffect, useState } from "react";
import useLocalStorage from "../Tools/localstorage/useLocalStorageStatus";
import Upload from "./Upload";
import { MastodonMediaResponse, StatusProps, postStatus, uploadFile, copyText } from "./app";
import Image from "./Image";
import ButtonGroup from "./ButtonGroup";

export default function Wxw() {
    const [mastodonConfig, setMastodonConfig] = useLocalStorage("mastodon", {
        host: "",
        access_token: "",
        sensitive: false,
        spoiler_text: "",
        visibility: "public",
    });
    const [moonchanConfig, setMoonchanConfig] = useLocalStorage("moonchan", {
        bid: 23,
        tid: 0,
    });
    const [status, setStatus] = useState("");
    const [inReplyToID, setInReplyToID] = useState<string | null>(null);
    const [imageArray, setImageArray] = useState<MastodonMediaResponse[]>([]);
    const [mediaIDs, setMediaIDs] = useState<string[]>([]);
    useEffect(() => {
        setMoonchanEnabled(true);
        setMediaIDs(imageArray.map((data) => data.id));
    }, [imageArray]);
    // const [sensitive, setSensitive] = useState(false);
    // const [spoilerText, setSpoilerText] = useState("");
    // const [visibility, setVisibility] = useState("public");
    const [moonchanEnabled, setMoonchanEnabled] = useState(true);

    const [responseMediaArray, setResponseMedia] = useState<MastodonMediaResponse[]>([]);

    const onSucceed = (o: MastodonMediaResponse) => {
        console.log("上传成功:", o);
        setImageArray(prev => [...prev, o]);
    }

    const onPost = () => {
        const data = {
            status,
            in_reply_to_id: inReplyToID,
            media_ids: mediaIDs,
            sensitive: mastodonConfig.sensitive,
            spoiler_text: mastodonConfig.spoiler_text,
            visibility: mastodonConfig.visibility,
            poll: null,
            language: "zh",
        } as StatusProps;
        console.log(data);

        // postStatus("mstdn.jp", "7UyxiXr0UsxaXWMOALFXoLEtXrbqVaI8SxlwW5Nhh40", data)
        postStatus(mastodonConfig.host, mastodonConfig.access_token, data)
            .then((resp) => {
                console.log("发布成功:", resp);
                setStatus("");
                setInReplyToID(null);
                setImageArray([]);
                setResponseMedia(resp.media_attachments || []);
            })
            .catch((error) => {
                console.error("发布失败:", error);
            });
    }

    const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        const files: File[] = []; // 创建一个空数组来存放提取的文件

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // 正确的逻辑：检查 item.kind 是否为 'file'
            if (item.kind === 'file') {
                // 正确的逻辑：使用 getAsFile() 获取文件
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }
        // 将提取出的文件数组传递给核心处理函数
        handleFiles(files);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // 必须阻止默认行为，否则浏览器会直接打开文件
        const fileList = e.dataTransfer.files;

        // FileList 是一个 "类数组" 对象，而不是真正的数组。
        // 使用 Array.from() 将其转换为标准的文件数组。
        const files = Array.from(fileList);

        // 将转换后的文件数组传递给核心处理函数
        handleFiles(files);
    };

    //    统一的核心处理函数，接收一个标准的文件数组
    async function handleFiles(files: File[]) {
        if (files.length === 0) {
            return; // 如果没有文件，则直接返回
        }

        console.log(`处理 ${files.length} 个文件...`);

        for (const file of files) {
            // file 在这里已经是 File 对象，可以直接使用
            console.log('文件名:', file.name);
            console.log('文件类型:', file.type);
            console.log('文件大小:', file.size, 'bytes');

            // 在这里添加您的文件处理逻辑，例如上传或显示预览
            // e.g., uploadFile(file);
            const data = await uploadFile(file, mastodonConfig.host, mastodonConfig.access_token)
            onSucceed(data);
        }
    }

    async function postToMoonChan() {
        setMoonchanEnabled(false);
        const array = imageArray.length !== 0 ? imageArray : responseMediaArray;
        // Use the bid from the config state
        const url = `https://moonchan.xyz/api/v2/?bid=${moonchanConfig.bid}&tid=${moonchanConfig.tid}`;
        const headers = {
            "Content-Type": "application/json" // 指定请求体是 JSON 格式
        };
        const body = JSON.stringify({
            p: array[0]?.url || "",
            txt: status,
        });
        const response = await fetch(url, {
            method: "POST", // 使用 POST 方法
            credentials: 'include',
            headers: headers,
            body: body
        });
        console.log(response)
        if (!response.ok) {
            setMoonchanEnabled(true);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await fetch(url).then(r => r.json());
        console.log(data);
        if (!data || (Array.isArray(data) ? data.length === 0 : false)) {
            setMoonchanEnabled(true);
            throw new Error("No data returned from MoonChan API");
        }
        const tid = (Array.isArray(data) ? data[0] : data).no! as number
        for (const media of array.slice(1)) {
            const mediaBody = JSON.stringify({
                p: media.url || "",
                txt: ""
            });
            const mediaResponse = await fetch(`https://moonchan.xyz/api/v2/?bid=${moonchanConfig.bid}&tid=${tid}`, {
                method: "POST",
                credentials: 'include',
                headers: headers,
                body: mediaBody
            });
            if (!mediaResponse.ok) {
                setMoonchanEnabled(true);
                throw new Error(`HTTP error! status: ${mediaResponse.status}`);
            }
        }
    }

    // 居中魔咒
    return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
        onPaste={onPaste}
        onDragOver={(e) => e.preventDefault()} // 阻止默认行为以允许拖放
        onDrop={onDrop}
    >
        <input type="text"
            className="block w-full max-w-md text-sm text-gray-700
            mr-4 py-2 px-4
            rounded-lg border-0
            text-sm font-medium"
            placeholder="Host"
            value={mastodonConfig.host} onChange={(e) => setMastodonConfig({ ...mastodonConfig, host: e.target.value })}
        ></input>
        <input type="text"
            className="block w-full max-w-md text-sm text-gray-700
            mr-4 py-2 px-4
            rounded-lg border-0
            text-sm font-medium"
            placeholder="Access Token"
            value={mastodonConfig.access_token} onChange={(e) => setMastodonConfig({ ...mastodonConfig, access_token: e.target.value })}
        ></input>

        <Upload onSucceed={onSucceed} />

        <MediaGallery responseMedia={imageArray} setImageArray={setImageArray} />

        <div className="mt-4 w-full max-w-md space-y-4">
            <ButtonGroup buttons={[
                { label: "公开", value: "public" },
                { label: "不公开", value: "unlisted" },
                { label: "私密", value: "private" },
                { label: "私信", value: "direct" },
            ]} value={mastodonConfig.visibility} setValue={(value) => setMastodonConfig({ ...mastodonConfig, visibility: value })} />
            <ButtonGroup buttons={[
                { label: "true (blur)", value: true },
                { label: "false", value: false },
            ]} value={mastodonConfig.sensitive} setValue={(value) => setMastodonConfig({ ...mastodonConfig, sensitive: value })} />
            <input type="text"
                className="block w-full max-w-md text-sm text-gray-700
                        mr-4 py-2 px-4
                        rounded-lg border-0
                        text-sm font-medium"
                placeholder="spoiler"
                value={mastodonConfig.spoiler_text} onChange={(e) => setMastodonConfig({ ...mastodonConfig, spoiler_text: e.target.value })}
            ></input>
            <textarea
                className="block w-full max-w-md text-sm text-gray-700
                        mr-4 py-2 px-4
                        rounded-lg border-0
                        text-sm font-medium"
                placeholder="status"
                rows={4}
                value={status} onChange={(e) => setStatus(e.target.value)}
            ></textarea>

            {/* START: Added input bars for Moonchan */}
            <div className="flex w-full space-x-4">
                <input
                    type="number"
                    className="block w-full text-sm text-gray-700 py-2 px-4 rounded-lg border-0 font-medium"
                    placeholder="Moonchan BID"
                    value={moonchanConfig.bid}
                    onChange={(e) => setMoonchanConfig({ ...moonchanConfig, bid: parseInt(e.target.value, 10) || 0 })}
                />
                <input
                    type="number"
                    className="block w-full text-sm text-gray-700 py-2 px-4 rounded-lg border-0 font-medium"
                    placeholder="Moonchan TID (for reply)"
                    value={moonchanConfig.tid || ''}
                    onChange={(e) => setMoonchanConfig({ ...moonchanConfig, tid: parseInt(e.target.value, 10) || 0 })}
                />
            </div>
            {/* END: Added input bars for Moonchan */}

            <button
                className={`${moonchanEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"} w-full px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={postToMoonChan}
                disabled={!moonchanEnabled}
            >
                发布到月岛
            </button>
            <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onPost}
            >
                发布
            </button>

            <MediaGallery responseMedia={responseMediaArray} />

        </div>
    </div>
}

// The MediaGallery component remains the same
const MediaGallery = ({ responseMedia, setImageArray }: { responseMedia: MastodonMediaResponse[], setImageArray?: (o: MastodonMediaResponse[]) => void }) => (
    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
        {responseMedia.map((data) => (
            <div
                key={data.id}
                className="relative group bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                    width: '200px', // 固定宽度
                    height: '200px', // 固定高度，形成方形
                    aspectRatio: '1/1' // 确保宽高比
                }}
            >

                <Image data={data} onClick={(deletedData) => {
                    // if (setImageArray) setImageArray(responseMedia.filter((data) => data.id !== deletedData.id));
                    // else copyText(deletedData.url || "error")
                    copyText(deletedData.url || "error")
                }} />

                {setImageArray && <button
                    className={`absolute top-2 right-2 bg-red-500 text-white 
                        rounded-full p-1.5 opacity-0 group-hover:opacity-100
                        transition-opacity duration-200
                        `}
                    // ${setImageArray ? "" : "hidden"}`}
                    onClick={() => {
                        if (setImageArray) setImageArray(responseMedia.filter((d) => d.id !== data.id));
                    }}
                    aria-label="删除图片"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>}
            </div>
        ))}
    </div>
)