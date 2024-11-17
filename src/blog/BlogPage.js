import { useEffect, useState } from "react";
import BlogCardLazy from "./BlogCardLazy";
import { fetchWithProxy } from "../Tools/utils";

const Blog = ({ prefix, url }) => {
    const [blogs, setBlogs] = useState([])
    useEffect(() => {
        async function getResponse() {
            const response = await fetchWithProxy(url, {
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
            {blogs.map((blog) => (
                <BlogCardLazy
                    key={blog.path}
                    url={prefix + blog.path}
                    title={blog.file_name}
                />
            ))}
        </div>
    );
};

export default Blog;