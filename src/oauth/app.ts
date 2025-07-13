export async function registeApplication(host: string, client_id: string, client_secret: string) {
    const endpoint = `https://${host}/oauth/authorize?client_id=${client_id}`
    const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_name: "MoonChan",
            grant_type: "authorization_code",
            client_id: client_id,
            client_secret: client_secret,
            redirect_uris: "urn:ietf:wg:oauth:2.0:oob",
            scopes: "read write follow push",
            website: "https://page.moonchan.xyz/#/wxw"
        })
    }).then(res => res.json())

    console.log(resp)

    return resp
}



export async function uploadFile(file: File, host: string, access_token: string): Promise<MastodonMediaResponse> {
    const formData = new FormData();
    formData.append('file', file); // 确保使用服务器要求的字段名（通常是 'file'）

    const response = await fetch("https://proxy.moonchan.xyz/api/v2/media", {
        method: "POST",
        headers: {
            "X-Scheme": "https",
            "X-Host": host,
            "X-Referer": `https://${host}/`,
            "Authorization": `Bearer ${access_token}`,
            // "X-Host": `${localStorage.getItem("mastodon_host")}`,
            // "Authorization": `Bearer ${localStorage.getItem("mastodon_access_token")}`,
            // "Content-Type": "multipart/form-data" // 不需要手动设置，浏览器会自动处理
        },
        body: formData
    });

    const data = await response.json();
    console.log(data);

    return data as MastodonMediaResponse;
}
export async function postStatus(host: string, access_token: string, data: StatusProps) {
    const endpoint = `https://proxy.moonchan.xyz/api/v1/statuses`
    const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'X-Scheme': 'https',
            'X-Host': host,
            "X-Referer": `https://${host}/`,

            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify(data)
    }).then(res => res.json())

    console.log(resp)

    return resp
}


export interface MastodonMediaResponse {
    id: string;
    url?: string;
    preview_url: string;
}

export interface MastodonStatusResponse {
    media_attachments: MastodonMediaResponse[];
}

//	{
//	    "status": "wow",
//	    "in_reply_to_id": null,
//	    "media_ids": [
//	        "114839922529179944"
//	    ],
//	    "sensitive": false,
//	    "spoiler_text": "",
//	    "visibility": "private",
//	    "poll": null,
//	    "language": "zh"
//	}
export interface StatusProps {
    status: string;
    in_reply_to_id: string | null;
    media_ids: string[];
    sensitive: boolean;
    spoiler_text: string;
    visibility: "public" | "unlisted" | "private" | "direct";
    poll: null; // 可能是一个 Poll 对象
    language: string;
}

export function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => fallbackCopyText(text)); // 失败时降级
  }
  return fallbackCopyText(text); // 直接使用备用方案
}

function fallbackCopyText(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; // 避免页面滚动
  textArea.style.top = "-1000px";    // 移出视口
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    console.log("复制成功！");
  } catch (err) {
    console.error("复制失败：", err);
  } finally {
    document.body.removeChild(textArea); // 清理临时元素
  }
}