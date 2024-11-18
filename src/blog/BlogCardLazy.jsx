import { useEffect, useState } from "react"
import BlogCard from "./BlogCard"
import { fetchWithProxy } from "../Tools/Proxy/utils";

const BlogCardLazy = ({ title, url }) => {
    const [tags, setTags] = useState([]);
    const [content, setContents] = useState("loading");

    useEffect(()=>{
        async function getResponse() {
            const response = await fetchWithProxy(url, {
                method: "GET",
                headers: {
                    "Cache-Control": "no-store",
                }
            });

            const content = await response.text();

            console.log(content)

            setContents(content)
        }

        getResponse()
    }, [])

    if (content === 'loading') return <div>loading...</div>

    return (<BlogCard blog={{title, content, tags}}></BlogCard>)
}

export default BlogCardLazy;