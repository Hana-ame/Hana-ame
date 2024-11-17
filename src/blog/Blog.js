import { useEffect, useState } from "react";
import BlogCard from "./BlogCard";
import BlogCardLazy from "./BlogCardLazy";
import { fetchWithProxy } from "../Tools/utils";

const Blog = () => {
    const [blogs, setBlogs] = useState([])
    useEffect(() => {
        async function getResponse() {
            const response = await fetchWithProxy("https://raw.githubusercontent.com/Hana-ame/Hana-ame/notes/json/1.json", {
                method: "GET",
                headers: {
                    "Cache-Control": "no-store",
                }
            })

            const blogs = await response.json();

            setBlogs(blogs)
        }

        getResponse()
    }, [])

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">我的博客</h1>
            {blogs.map((blog) => (
                <BlogCardLazy
                    key={blog.path}
                    url={"https://raw.githubusercontent.com/Hana-ame/Hana-ame/notes/" + blog.path}
                    title={blog.file_name}
                />
            ))}
        </div>
    );
};

export default Blog;