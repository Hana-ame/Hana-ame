import CanvasManager from "../Tools/canvas/canvasmanager";

export class AVDManager extends CanvasManager {
    private images?: Record<string, HTMLImageElement>;
    private clickCount: number = 0;  // 用于记录点击次数，控制绘制顺序
    private dialogueData: { name: string, text: string }[] = [];  // 对话数据列表
    private currentIndex: number = 0;  // 当前显示的对话索引

    // 初始化点击事件
    async initInput() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const rawX = event.clientX - rect.left; // 鼠标点击的 X 坐标
            const rawY = event.clientY - rect.top;  // 鼠标点击的 Y 坐标
        
            const [x, y] = this.transformCoordinates(rawX,rawY);

            console.log(`鼠标点击位置: (${x}, ${y})`);

            this.onClick();
        });
    }

    // 点击事件的实现，按顺序展示背景、对话框和角色名
    onClick() {
        if (!this.images || this.dialogueData.length === 0) return;

        switch (this.clickCount) {
            case 0:
                // 第一次点击，显示背景
                this.drawBackgroundImage();
                break;
            default:
                // 显示对话框和姓名
                this.showDialogue();
                break;
        }

        this.clickCount++;
        console.log(this)
    }

    // 初始化对话数据
    initDialogue(dialogueData: { name: string; text: string }[]) {
        this.dialogueData = dialogueData;
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

    // 绘制背景图像
    drawBackgroundImage() {
        if (this.images && this.images['background']) {
            this.clear();  // 清空画布
            this.drawImage(this.images['background'], 0, 0, this.baseWidth, this.baseHeight);
        }
    }

    // 显示当前对话和角色姓名
    showDialogue() {
        if (this.currentIndex >= this.dialogueData.length) {
            // 所有对话结束，重置或停止
            this.clear();
            this.clickCount = 0;  // 重置点击计数
            this.currentIndex = 0;  // 重置对话索引
            return;
        }

        // 清空画布，重新绘制背景
        this.drawBackgroundImage();

        // 显示对话框
        this.drawDialogueBox();

        // 显示角色姓名和对话
        const { name, text } = this.dialogueData[this.currentIndex];
        this.drawCharacterName(name);
        this.drawDialogueText(text);

        // 进入下一条对话
        this.currentIndex++;
    }

    // 绘制对话框
    drawDialogueBox() {
        if (this.images && this.images['dialogueBox']) {
            // 假设对话框位于画布的下方
            const dialogueBoxHeight = this.baseHeight * 0.25;
            this.drawImage(this.images['dialogueBox'], 50, this.baseHeight - dialogueBoxHeight - 20, this.baseWidth - 100, dialogueBoxHeight);
        }
    }

    // 绘制对话文字
    drawDialogueText(text: string) {
        const textX = 70;
        const textY = this.baseHeight - 100;
        const maxWidth = this.baseWidth - 140;  // 给对话框内的文字留出边距
        this.drawText(text, textX, textY, maxWidth, 'white');
    }

    // 绘制角色姓名
    drawCharacterName(name: string) {
        const nameX = 70;
        const nameY = this.baseHeight - 150;  // 姓名显示在对话框上方
        this.drawText(name, nameX, nameY, 200, 'white');
    }
}

export default AVDManager;