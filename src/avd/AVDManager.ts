import CanvasManager from "../Tools/canvas/canvasmanager";
import DialogManager from "./DialogManager";

class AVDManager extends CanvasManager {
    private images?: Record<string, HTMLImageElement>;
    private clickCount: number = 0; // 用于记录点击次数，控制绘制顺序
    private dialogManager?: DialogManager; // 使用对话管理器
    private typingInterval: number = 50; // 打字速度（毫秒）
    private isTyping: boolean = false; // 用于控制打字机状态
    private currentText: string = ""; // 当前显示的文字
    private currentName: string = ""; // 当前显示的角色名
    private typingIndex: number = 0; // 打字的当前位置
    private typingTimeout?: number; // 保存当前的定时器 ID

    // 设置打字机速度
    setTypingSpeed(speed: number) {
        this.typingInterval = speed;
    }

    // 初始化点击事件
    async initInput() {
        this.canvas.addEventListener("click", (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const rawX = event.clientX - rect.left; // 鼠标点击的 X 坐标
            const rawY = event.clientY - rect.top; // 鼠标点击的 Y 坐标

            const [x, y] = this.transformCoordinates(rawX, rawY);

            console.log(`鼠标点击位置: (${x}, ${y})`);

            this.onClick();
        });
    }

    // 点击事件的实现
    onClick() {
        if (!this.images || !this.dialogManager) return;

        if (this.isTyping) {
            // 如果文字正在打字机效果中，直接显示完整文字
            this.finishTyping();
            return;
        }

        if (this.clickCount === 0) {
            // 第一次点击，显示背景
            this.drawBackgroundImage();
        } else {
            // 显示对话框和姓名
            const dialogue = this.dialogManager.getNextDialogue();
            if (dialogue) {
                this.startTyping(dialogue.name + " " + dialogue.index, dialogue.text);
            } else {
                // 对话结束，重置状态
                this.clear();
                this.clickCount = 0; // 重置点击计数
                this.dialogManager.reset(); // 重置对话管理器
                return;
            }
        }

        this.clickCount++;
    }

    // 加载图像资源
    async initImages(images: Record<string, string>) {
        const promises: Promise<void>[] = [];
        this.images = {};
        
        for (const key in images) {
            const promise = new Promise<void>((resolve, reject) => {
                const value = images[key];
                const img = new Image();
                img.src = value;
                img.onload = () => {
                    this.images![key] = img;
                    resolve();
                };
                img.onerror = () => reject();
            });
            promises.push(promise);
        }

        await Promise.all(promises);
    }
    
    // 初始化对话管理器
    initDialogue(dialogueData: { name: string; text: string }[]) {
        this.dialogManager = new DialogManager(dialogueData);
    }
    // 开始打字机效果
    startTyping(name: string, text: string) {
        this.isTyping = true;
        this.currentName = name;
        this.currentText = text;
        this.typingIndex = 0;

        // 清空画布并绘制基础内容
        this.drawBackgroundImage();
        this.drawDialogueBox();
        this.drawCharacterName(name);

        // 开始逐字绘制
        this.typeNextCharacter();
    }

    // 完成当前的打字机效果
    finishTyping() {
        this.isTyping = false;

        // 显示完整文本
        this.drawBackgroundImage();
        this.drawDialogueBox();
        this.drawCharacterName(this.currentName);
        this.drawDialogueText(this.currentText);

        // 清除定时器（如果存在）
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }

    // 逐字绘制下一个字符
    typeNextCharacter() {
        if (this.typingIndex < this.currentText.length) {
            // 清空画布并重绘基础内容
            this.drawBackgroundImage();
            this.drawDialogueBox();
            this.drawCharacterName(this.currentName);

            // 绘制当前文字
            const partialText = this.currentText.slice(0, this.typingIndex + 1);
            this.drawDialogueText(partialText);

            this.typingIndex++;

            // 设置下一次调用
            this.typingTimeout = window.setTimeout(
                () => this.typeNextCharacter(),
                this.typingInterval
            );
        } else {
            // 完成打字效果
            this.isTyping = false;
        }
    }

    // 绘制背景图像
    drawBackgroundImage() {
        if (this.images && this.images["background"]) {
            this.clear(); // 清空画布
            this.drawImage(this.images["background"], 0, 0, this.baseWidth, this.baseHeight);
        }
    }

    // 绘制对话框
    drawDialogueBox() {
        if (this.images && this.images["dialogueBox"]) {
            const dialogueBoxHeight = this.baseHeight * 0.25;
            this.drawImage(
                this.images["dialogueBox"],
                50,
                this.baseHeight - dialogueBoxHeight - 20,
                this.baseWidth - 100,
                dialogueBoxHeight
            );
        }
    }

    // 绘制对话文字
    drawDialogueText(text: string) {
        const textX = 70;
        const textY = this.baseHeight - 100;
        const maxWidth = this.baseWidth - 140;
        this.drawText(text, textX, textY, maxWidth, "white");
    }

    // 绘制角色姓名
    drawCharacterName(name: string) {
        const nameX = 70;
        const nameY = this.baseHeight - 150;
        this.drawText(name, nameX, nameY, 200, "white");
    }
}

export default AVDManager;
