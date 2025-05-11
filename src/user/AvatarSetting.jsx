
export function AvatarSetting() {
    const [avatar, setAvatar] = useState('https://example.com/default-avatar.jpg');

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        // 调用上传API[2](@ref)
        const newUrl = await uploadAvatar(formData);
        setAvatar(newUrl);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">头像设置</h2>
            <div className="flex items-center space-x-8">
                <Avatar
                    size={128}
                    src={avatar}
                    className="border-2 border-gray-200"
                    icon={<UserIcon className="h-16 w-16 text-gray-400" />}
                />

                <Upload
                    beforeUpload={handleUpload}
                    showUploadList={false}
                    className="space-y-4"
                >
                    <Button
                        icon={<CloudArrowUpIcon className="h-4 w-4 mr-2" />}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        上传新头像
                    </Button>
                    <p className="text-sm text-gray-500">支持JPG/PNG格式，大小不超过2MB</p>
                </Upload>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`cursor-pointer p-1 rounded-lg ${avatar.endsWith(i + '.jpg') ? 'ring-2 ring-blue-500' : 'hover:ring-1'
                            }`}
                        onClick={() => setAvatar(`/default-avatars/${i}.jpg`)}
                    >
                        <Avatar
                            size={64}
                            src={`/default-avatars/${i}.jpg`}
                            className="mx-auto"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}