import CanvasManager from "../Tools/canvas/canvasmanager";
import DialogManager from "./DialogManager";

class AVDManager extends CanvasManager {
    private images?: Record<string, HTMLImageElement>;
    private clickCount: number = 0; // 用于记录点击次数，控制绘制顺序
    private dialogManager?: DialogManager; // 使用对话管理器

    // 初始化点击事件
    async initInput() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const rawX = event.clientX - rect.left; // 鼠标点击的 X 坐标
            const rawY = event.clientY - rect.top;  // 鼠标点击的 Y 坐标

            const [x, y] = this.transformCoordinates(rawX, rawY);

            console.log(`鼠标点击位置: (${x}, ${y})`);

            this.onClick();
        });
    }

    // 点击事件的实现
    onClick() {
        if (!this.images || !this.dialogManager) return;

        if (this.clickCount === 0) {
            // 第一次点击，显示背景
            this.drawBackgroundImage();
        } else {
            // 显示对话框和姓名
            const dialogue = this.dialogManager.getNextDialogue();
            if (dialogue) {
                this.showDialogue(dialogue.name, dialogue.text);
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

    // 绘制对话框和文字
    showDialogue(name: string, text: string) {
        // 清空画布，重新绘制背景
        this.drawBackgroundImage();

        // 显示对话框
        this.drawDialogueBox();

        // 显示角色姓名和对话
        this.drawCharacterName(name);
        this.drawDialogueText(text);
    }

    // 绘制背景图像
    drawBackgroundImage() {
        if (this.images && this.images['background']) {
            this.clear();  // 清空画布
            this.drawImage(this.images['background'], 0, 0, this.baseWidth, this.baseHeight);
        }
    }

    // 绘制对话框
    drawDialogueBox() {
        if (this.images && this.images['dialogueBox']) {
            const dialogueBoxHeight = this.baseHeight * 0.25;
            this.drawImage(this.images['dialogueBox'], 50, this.baseHeight - dialogueBoxHeight - 20, this.baseWidth - 100, dialogueBoxHeight);
        }
    }

    // 绘制对话文字
    drawDialogueText(text: string) {
        const textX = 70;
        const textY = this.baseHeight - 100;
        const maxWidth = this.baseWidth - 140;
        this.drawText(text, textX, textY, maxWidth, 'white');
    }

    // 绘制角色姓名
    drawCharacterName(name: string) {
        const nameX = 70;
        const nameY = this.baseHeight - 150;
        this.drawText(name, nameX, nameY, 200, 'white');
    }
}

export default AVDManager;