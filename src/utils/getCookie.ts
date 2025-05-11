export default function getCookie(name: string): string | null {
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