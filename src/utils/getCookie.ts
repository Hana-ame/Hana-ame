export function getCookie(name: string): string | null {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith(`${name}=`)) {
            return trimmedCookie.substring(name.length + 1);
        }
    }
    return null;
}

export function setCookie(name: string, value: string, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/`;
}

/**
* 设置跨域Cookie
* @param name Cookie名称
* @param value Cookie值
* @param days 有效期（天）
* @param domain 顶级域名（如 .example.com），默认自动推导当前域名的顶级域名
*/
export function setCrossDomainCookie(
    name: string,
    value: string,
    days: number = 30,
    domain?: string
) {
    // 参数校验
    if (location.protocol !== 'https:') {
        console.error('跨域Cookie必须使用HTTPS协议');
        return;
    }

    // 自动推导顶级域名（示例：a.example.com → .example.com）
    const autoDomain = domain || `.${window.location.hostname.split('.').slice(-2).join('.')}`;

    // 构建Cookie字符串
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieParts = [
        `${name}=${encodeURIComponent(value)}`,
        `expires=${date.toUTCString()}`,
        `path=/`,
        `domain=${autoDomain}`,
        'SameSite=None', // 允许跨站请求携带Cookie[8](@ref)
        'Secure'         // 必须与SameSite=None配合使用[6](@ref)
    ];
    console.log(cookieParts.join('; ')) 
    document.cookie = cookieParts.join('; ');
}