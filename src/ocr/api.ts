const END_POINT = "https://chat.moonchan.xyz"

export async function freeOCR(content: string) {
    const path = "/siliconflow/deepseek-ocr"
    try {
        // 构建请求体（根据不同的OCR服务调整结构）[2](@ref)
        const body = JSON.stringify({
            image_url: content,        // 多数服务接受纯Base64数据
            text: "free ocr."
        });

        // 构建请求头
        const headers = {
            'Content-Type': 'application/json',
        };

        // 发送POST请求[6,8](@ref)
        const response = await fetch(END_POINT+path, {
            method: 'POST',
            headers: headers,
            body: body
        });

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`OCR API错误: ${response.status} ${response.statusText}`);
        }

        // 解析并返回JSON结果
        const result = await response.json();
        return result.choices[0].message.content;

    } catch (error) {
        console.error('OCR处理失败:', error);
        return `${error}`;
    }

}

export async function describeImage(content: string) {
    const path = "/siliconflow/deepseek-ocr"
    try {
        // 构建请求体（根据不同的OCR服务调整结构）[2](@ref)
        const body = JSON.stringify({
            image_url: content,        // 多数服务接受纯Base64数据
            text: "describe this image in detail."
        });

        // 构建请求头
        const headers = {
            'Content-Type': 'application/json',
        };

        // 发送POST请求[6,8](@ref)
        const response = await fetch(END_POINT+path, {
            method: 'POST',
            headers: headers,
            body: body
        });

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`OCR API错误: ${response.status} ${response.statusText}`);
        }

        // 解析并返回JSON结果
        const result = await response.json();
        return result.choices[0].message.content;

    } catch (error) {
        console.error('OCR处理失败:', error);
        return `${error}`;
    }

}

export async function translateContent(content: string) {
    const path = "/siliconflow/qwen2.5-7b-Instruct/translate"
    try {
        // 构建请求头
        const headers = {
            'Content-Type': 'application/json',
        };

        // 发送POST请求[6,8](@ref)
        const response = await fetch(END_POINT+path, {
            method: 'POST',
            headers: headers,
            body: content
        });

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`translate API错误: ${response.status} ${response.statusText}`);
        }

        // 解析并返回JSON结果
        const result = await response.json();
        return result.choices[0].message.content;

    } catch (error) {
        console.error('translate处理失败:', error);
        return `${error}`;
    }

}