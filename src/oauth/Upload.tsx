import { useState } from "react";
import useLocalStorage from "../Tools/localstorage/useLocalStorageStatus";
import { MastodonMediaResponse, uploadFile } from "./app";

export default function Upload({ onSucceed }: { onSucceed: (o: MastodonMediaResponse) => void }) {
    const [mastodonConfig] = useLocalStorage("mastodon", {
        host: "",
        access_token: "",
    });
    const onUpload = (file: File) => uploadFile(file, mastodonConfig.host, mastodonConfig.access_token)
    // const onUpload = (file: File) => uploadFile(file, "wxw.moe", "6tLKQhJWkmqGfKBuPj4LUOSJsWsMUvTGHx_mdCU2z0o")
    // const onUpload = (file: File) => uploadFile(file, "mstdn.jp", "7UyxiXr0UsxaXWMOALFXoLEtXrbqVaI8SxlwW5Nhh40")

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // 阻止表单默认提交行为，避免页面刷新
        if (selectedFile) {
            onUpload(selectedFile).then((data) => {
                onSucceed(data);
                setSelectedFile(null);
            }).catch((error) => {
                console.error("上传失败:", error);
            });
        }
    };

    return <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 w-full 
        max-w-md p-1 bg-white rounded-lg shadow-inner border border-gray-200 
        focus-within:ring-2 focus-within:ring-blue-500 transition-all"
    >
        <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-gray-100 file:text-gray-700
            hover:file:bg-gray-200
            cursor-pointer"
        />
        <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors whitespace-nowrap"
            disabled={selectedFile === null}  // 假设有状态跟踪文件选择
        >
            上传
        </button>
    </form>
}
