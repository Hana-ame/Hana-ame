
export default function NftTabContent() {
    const list = [
        "https://proxy.moonchan.xyz/large/006v119zgy1i160nm4if8j30z025swrt.jpg?proxy_host=wx1.sinaimg.cn&proxy_referer=http%3A%2F%2Fweibo.com",
        "https://proxy.moonchan.xyz/large/006v119zgy1i160nmlyddj30z025s15b.jpg?proxy_host=wx3.sinaimg.cn&proxy_referer=http%3A%2F%2Fweibo.com",
        "https://proxy.moonchan.xyz/large/006v119zgy1i160fhrq6oj30wi1ycwqg.jpg?proxy_host=wx3.sinaimg.cn&proxy_referer=http%3A%2F%2Fweibo.com",
        "https://proxy.moonchan.xyz/large/006v119zgy1i15z7vimvoj30z025sqpe.jpg?proxy_host=wx4.sinaimg.cn&proxy_referer=http%3A%2F%2Fweibo.com",
        "https://proxy.moonchan.xyz/large/006v119zgy1i15z7w4eg0j30z025sau6.jpg?proxy_host=wx4.sinaimg.cn&proxy_referer=http%3A%2F%2Fweibo.com",

    ]
    return (
        <div className="grid grid-cols-3 gap-4">
            {/* NFT缩略图 */}
            {list.map((v,i) => (
                <img
                    key={i}
                    src={v}
                    className="w-full h-32 object-cover rounded-lg"
                    alt={`NFT #${i}`}
                />
            ))}
        </div>
    );
}