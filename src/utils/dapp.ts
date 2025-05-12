import { getCookie } from "./getCookie";

// 假设 getCookie 函数已经存在并可以获取指定名称的 cookie 值
// 如果没有，你需要自己实现一个或引入相应的库
// 例如，一个简单的 getCookie 实现可能如下：
/*
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null; // Or undefined, or ''
}
*/

/**
 * 根据提供的URL创建一个新的上传/帖子条目。
 * 数据结构基于 Go struct Post { ID, Username, URL, Content, Owner, MetaData }。
 * ID 通常由服务器生成，所以创建时不需要发送。
 * Content, Owner, MetaData 在这个函数中没有来源，使用默认值或空字符串。
 * Username 通过 getCookie("username") 获取，并同时放在 body 和 Dapp-username header 中。
 *
 * @param {string} url - 上传文件或资源的 URL。
 * @returns {Promise<object>} - 一个 Promise，成功时 resolve 服务器返回的数据，失败时 reject 错误。
 */
export function createUploadFile(url = "", content = "", meta_data= "{}") {
    const username = getCookie("username"); // 从 cookie 获取 username

    if (!username) {
        console.error("错误：无法从 cookie 中获取 username。请确保已登录。");
        // 返回一个 rejected 的 Promise，以便调用者可以捕获错误
        // return Promise.reject(new Error("Username not found in cookie."));
    }

    // 构建请求体数据对象，对应 Go struct Post (不含 ID)
    // Content, Owner, MetaData 暂时使用空字符串或默认值
    const postData = {
        username: username || "", // username 放在 body 中
        url: url,
        content: content,     // 根据需要填充或保留为空
        owner: "", // 通常创建者也是所有者，或者根据实际业务填充
        meta_data: meta_data    // 根据需要填充或保留为空
    };

    // console.log("正在发送创建帖子的请求，数据:", postData);

    return fetch("https://chat.moonchan.xyz/dapp/post/create", {
        method: "POST",
        // 关键：设置 Content-Type 为 application/json
        // 关键：设置自定义 header Dapp-username
        headers: {
            "Content-Type": "application/json",
            "Dapp-Username": username || "" // username 放在 Dapp-username 这个 header 中
        },
        // 将 JavaScript 对象转换为 JSON 字符串作为请求体
        body: JSON.stringify(postData)
    })
    .then(response => {
        console.log("收到响应，状态码:", response.status);
        // 检查响应状态码，如果不是 2xx，则抛出错误
        if (!response.ok) {
            // 尝试读取错误信息体并包含在错误中
            return response.text().then(text => {
                 throw new Error(`HTTP 错误! 状态: ${response.status}, 响应体: ${text}`);
            });
        }
        // 解析 JSON 响应体
        return response.json();
    })
    .then(data => {
        // 请求成功，处理返回的数据
        console.log("帖子创建成功:", data);
        return data; // 返回服务器返回的数据（可能包含新生成的 ID 等）
    })
    .catch(error => {
        // 捕获请求或处理过程中的任何错误
        console.error("创建帖子时发生错误:", error);
        // 重新抛出错误，以便调用者可以处理
        throw error;
    });
}

// 示例用法（假设你调用这个函数并处理其结果）：
/*
async function exampleUsage() {
    const fileUrl = "https://example.com/some/uploaded/file.jpg";
    try {
        const createdPost = await createUploadFile(fileUrl);
        console.log("成功创建帖子，详情:", createdPost);
        // 可以在这里更新 UI 或进行其他操作
    } catch (error) {
        console.error("创建帖子失败:", error);
        // 可以在这里向用户显示错误消息
    }
}

// 调用示例函数
// exampleUsage();
*/

// 关于跨域 (CORS) 的说明：
// 1. 你的浏览器在发送带有自定义 header (Dapp-username) 或 Content-Type: application/json 的 POST 请求到不同源的地址时，
//    会自动触发一个“预检请求”(OPTIONS)。
// 2. 服务器 (https://chat.moonchan.xyz) 必须配置 CORS，以响应这个 OPTIONS 请求，允许来自你网站源的访问，
//    允许 POST 方法，并允许 Content-Type 和 Dapp-username 这两个 header。
// 3. 如果服务器配置正确，预检请求成功后，浏览器才会发送实际的 POST 请求。
// 4. 如果服务器没有正确配置 CORS，fetch 请求会在预检阶段或实际请求阶段失败，并在浏览器控制台显示 CORS 错误。
//    客户端代码本身无需额外处理 CORS，这是服务器的责任。