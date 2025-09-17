class DialogManager {
    private dialogueData: { name: string; text: string }[] = [];
    private currentIndex: number = 0;

    // 初始化对话数据
    constructor(dialogueData: { name: string; text: string }[]) {
        this.dialogueData = dialogueData;
    }

    // 提取下一条对话
    getNextDialogue(): { index: number; name: string; text: string } | null {
        if (this.currentIndex >= this.dialogueData.length) {
            return null; // 对话结束
        }

        const { name, text } = this.dialogueData[this.currentIndex];
        const result = { index: this.currentIndex, name, text };
        this.currentIndex++;
        return result;
    }

    // 重置对话管理器
    reset() {
        this.currentIndex = 0;
    }

    // 检查是否还有剩余对话
    hasMore(): boolean {
        return this.currentIndex < this.dialogueData.length;
    }
}


export default DialogManager;