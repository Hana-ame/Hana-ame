import React, { useState } from 'react';
// import ReactPlayer from 'react-player';
import ReactHlsPlayer from "react-hls-player";


function App() {
    const [hlsUrl, setHlsUrl] = useState(
        "https://video.twimg.com/ext_tw_video/1833063769888657408/pu/pl/avc1/1280x720/JvPHqGcLXy5xiQhY.m3u8"
    );

    return (
        <div className="w-auto">
            <input
                type="text"
                className="form-control w-full m-2 my-4"
                placeholder="HLS Url... 只支持m3u8,麻了"
                value={hlsUrl}
                aria-label="hls-url"
                aria-describedby="set-hls-url"
                onChange={(e) => setHlsUrl(e.target.value)}
            />
            <ReactHlsPlayer
                src={hlsUrl}
                autoPlay={false}
                controls={true}
                width="60%"
                height="auto"
            />
        </div>
    );
}

export default App;