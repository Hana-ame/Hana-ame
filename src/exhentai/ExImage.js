import React, { useEffect, useState } from "react";
import { delay } from "@/Tools/utils.ts";

const ExImage = ({ path, showNext }) => {
    const host = "https://ehwv.moonchan.xyz";

    const [imageSrc, setImageSrc] = useState(null);
    const [onError, setOnError] = useState(false);
    const [onErrorPath, setOnErrorPath] = useState(null);
    const [nextPath, setNextPath] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3; // Maximum retry attempts
    const [id, setId] = useState(-1);
    const [abort, setAbort] = useState(false); // Track abort state
    const [loaded, setLoaded] = useState(false); // Track abort state

    // Helper function to extract the `src` attribute of the image
    const extractImageSrc = (doc) => {
        const e = doc.getElementById("img");
        return e?.src || null;
    };

    // Helper function to extract the path for the onError fallback
    const extractOnErrorPath = (doc) => {
        const e = doc.getElementById("loadfail");
        const s = e.getAttribute('onclick');
        if (!s) return null;

        const trimmed = s.replace(/^return nl\('/, "").replace(/'\)$/, "");
        const url = new URL(path, host);
        url.searchParams.append("nl", trimmed);

        return url.pathname + url.search;
    };

    // Helper function to extract the `href` attribute of the "next" button
    const extractNextPath = async (doc) => {
        const e = doc.getElementById("next");
        try {
            const url = new URL(e?.href || ''); // Handle null or undefined href
            await delay(1000);
            return url.pathname;
        } catch (error) {
            console.error("Invalid URL:", error);
            return null;
        }
    };

    // Fetch and parse HTML from the given path
    useEffect(() => {
        const fetchHtml = async () => {
            if (abort) return; // Abort if the abort state is true

            try {
                const response = await fetch(host + path);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                const imgSrc = extractImageSrc(doc);
                const errorPath = extractOnErrorPath(doc);
                extractNextPath(doc).then((next) => {
                    setNextPath(next);
                });

                setImageSrc(imgSrc);
                setOnErrorPath(errorPath);
                setError(null); // Clear any previous error

                if (id >= 0) clearInterval(id);
                setId(setInterval(() => {
                    setOnError(true);
                }, 10000));

            } catch (err) {
                setError(err.message);
                if (retryCount < maxRetries) {
                    setRetryCount(retryCount + 1);
                }
            }
        };

        fetchHtml();
    }, [path, retryCount, abort]); // Include abort in dependencies

    return (
        <>
            {!abort && imageSrc && (
                <div>
                    <img
                        className="w-full"
                        src={imageSrc}
                        alt="加载失败，请点击重新加载并等待至多10秒"
                        onLoad={() => {
                            if (id >= 0) clearInterval(id);
                            setLoaded(true);
                        }}
                        onError={() => setOnError(true)}
                    />
                    {!loaded && <>
                        <button
                            onClick={() => setAbort(true)}
                            className="px-6 py-3 bg-blue-500 text-white font-bold rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                        >
                            重新加载
                        </button>
                        <a href={host + path}>{host + path}</a>
                    </>
                    }
                </div>
            )}
            {abort && onErrorPath && (
                <ExImage path={onErrorPath} showNext={false} />
            )}
            {showNext && nextPath && nextPath !== path && (
                <ExImage path={nextPath} showNext={true} />
            )}
        </>
    );
};

export default ExImage;