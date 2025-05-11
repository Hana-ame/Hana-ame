// ProfileSetting

import { useCallback, useState, useRef, useEffect } from 'react'
import { uploadfile } from '../utils/upload';
import { getCookie } from '../utils/getCookie'
import { useNavigate, NavLink } from 'react-router';

function ProfileSetting() {

    const navigate = useNavigate();
    const username = getCookie("username");


    const [avatar, setAvatar] = useState('https://example.com/default-avatar.jpg');
    const [banner, setBanner] = useState('https://example.com/default-banner.jpg');

    useEffect(() => {
        if (username) {
            fetch("https://chat.moonchan.xyz/dapp/user/" + username).then(resp => resp.json()).then(data => {
                console.log(data, data.avatar, data.banner);
                setAvatar(data.avatar);
                setBanner(data.banner);
            })
        } else {
            navigate("/login")
        }
    }, [])


    const setAvatarCallback = useCallback((url) => {
        setAvatar(url);
        fetch("https://chat.moonchan.xyz/dapp/user/" + username, {
            method: "PATCH",
            body: JSON.stringify({
                avatar: url,
                banner: banner
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

    }
        , [banner, avatar]);
    const setBannerCallback = useCallback((url) => {
        setBanner(url);
        fetch("https://chat.moonchan.xyz/dapp/user/" + username, {
            method: "PATCH",
            body: JSON.stringify({
                avatar: avatar,
                banner: url
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }
        , [banner, avatar]);
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 w-full">
            <NavLink to={"/user/" + username + "/home"} className="text-gray-600 underline decoration-blue-500 underline-offset-4 hover:decoration-2">去主页</NavLink>
            <h1 className="text-2xl font-bold mb-4">头像设置</h1>
            <ImageUploader emitter={setAvatarCallback} initImage={avatar} />
            <h1 className="text-2xl font-bold mb-4">banner设置</h1>
            <ImageUploader emitter={setBannerCallback} initImage={banner} />
        </div>
    );
    // return (
    //     <div className="flex flex-col items-center justify-center h-screen bg-gray-100 w-full">
    //         <h1 className="text-2xl font-bold mb-4">头像设置</h1>
    //         <ImageUploader />
    //         <h1 className="text-2xl font-bold mb-4">banner设置</h1>
    //         <ImageUploader />
    //     </div>
    // );
}


function ImageUploader({ emitter, initImage }) {
    const [previewImage, setPreviewImage] = useState(null)

    const fileInputRef = useRef(null);

    // 处理文件选择
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 添加文件验证逻辑（参考网页6）
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('仅支持JPG/PNG格式');
                return;
            }

            uploadfile(file).then((url) => {
                setPreviewImage(url);
                emitter(url);
            }).catch((error) => {
                console.error('上传失败:', error);
                alert('上传失败，请重试');
            });
        }
    };

    const isDragActive = false;
    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 bg-white rounded-xl shadow-md">
            {/* 左侧上传区域 */}
            <div
                className={`w-full md:w-48 h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => fileInputRef.current.click()}
            >
                {/* 隐藏的input元素（参考网页4） */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png" // 限制文件类型（参考网页6）
                />

                <div className="text-center space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600">
                        点击上传图片
                    </p>
                    <p className="text-sm text-gray-500">支持JPG, PNG格式</p>
                </div>
            </div>

            {/* 右侧预览区域 */}
            <div className="w-full md:w-48">
                {(previewImage) ? (
                    <div className="relative group">
                        <img
                            src={previewImage}
                            alt="图片预览"
                            className="w-full h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity opacity-0 group-hover:opacity-100"
                        >
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <span className="text-gray-400">等待图片上传...</span>
                    </div>
                )}
            </div>
        </div>
    )
}









export default ProfileSetting;
