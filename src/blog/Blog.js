import { useEffect, useState } from "react";
import BlogPage from "./BlogPageLazy";
import { fetchWithProxy } from "../Tools/Proxy/utils";

const Blog = () => {
    const URL = "https://raw.githubusercontent.com/Hana-ame/Hana-ame/refs/heads/notes/main.json"
    const [main, setMain] = useState([])
    const [cnt, setCnt] = useState(1)

    useEffect(() => {
        async function getResponse() {
            const response = await fetchWithProxy(URL, {
                method: "GET",
                headers: {
                    "Cache-Control": "no-cache",
                }
            })

            const main = await response.json();

            setMain(main)
        }

        getResponse()
    }, [])

    const handleShowNext = () => {
        setCnt(prevCnt => prevCnt + 1); // 每次点击增加 1
    };


    return (
        <div className="p-4">
            {main && main.files?.slice(0, cnt).map((path) => (
                <BlogPage
                    key={path}
                    prefix={main.prefix}
                    url={main.prefix + path}
                />
            ))}
            {main && main.files?.length > cnt && ( // 如果还有更多文件
                <button
                    onClick={handleShowNext}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                    显示下一页
                </button>
            )}

        </div>
    );
};

export default Blog;