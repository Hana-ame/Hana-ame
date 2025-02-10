// src/services/messageService.js
const API_URL = 'https://chat.moonchan.xyz/api/message/me';

export async function fetchNewMessages(lastId) {
    try {
        const response = await fetch(`${API_URL}?after=${lastId || ''}`);
        if (!response.ok) throw new Error('请求失败');
        return await response.json();
    } catch (error) {
        console.error('获取消息失败:', error);
        return [];
    }
}

export function getLatestId(messages) {
    // 方案1：直接字符串比较（适用于定长时间戳字符串）
    return messages.reduce((maxId, msg) => {
        return msg.id > maxId ? msg.id : maxId;
    }, '0');

    // 方案2：转换为数字比较（适用于纯数字时间戳）
    // return Math.max(...messages.map(msg => parseInt(msg.id, 10))).toString();
}