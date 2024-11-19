class ScriptManager {
    private dialogueData: {
        name: string;
        text: string;
        characters?: { name: string; positionX: number; positionY: number }[];
    }[] = [];
    private currentIndex: number = 0; // 当前对话索引
    private characterStates: { name: string; positionX: number; positionY: number }[] = []; // 当前立绘状态

    constructor(dialogueData: {
        name: string;
        text: string;
        characters?: { name: string; positionX: number; positionY: number }[];
    }[]) {
        this.dialogueData = dialogueData;
    }

    // 获取当前对话和角色状态
    getCurrentScript() {
        if (this.currentIndex >= this.dialogueData.length) return null;

        const currentDialogue = this.dialogueData[this.currentIndex];
        if (currentDialogue.characters) {
            // 更新立绘状态（完全替换当前立绘）
            this.characterStates = currentDialogue.characters;
        }

        return {
            index: this.currentIndex,
            ...currentDialogue,
            characterStates: this.characterStates, // 当前立绘状态
        };
    }

    // 获取下一条对话
    getNextScript() {
        const script = this.getCurrentScript();
        this.currentIndex++;
        return script;
    }

    // 重置对话和立绘状态
    reset() {
        this.currentIndex = 0;
        this.characterStates = [];
    }
}

export default ScriptManager;