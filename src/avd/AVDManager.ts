import CanvasManager from "../Tools/canvas/canvasmanager";

export class AVDManager extends CanvasManager {
    private images?: Record<string, HTMLImageElement>;
    private clickCount: number = 0;  // 用于记录点击次数，控制绘制顺序
    private dialogueText: string = "这是一段对话文字";
    private characterName: string = "名称";

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
        if (!this.images) return;

        switch (this.clickCount) {
            case 0:
                // 第一次点击，显示背景
                this.drawBackgroundImage();
                break;
            case 1:
                // 第二次点击，显示对话框
                this.drawDialogueBox();
                break;
            case 2:
                // 第三次点击，显示姓名
                this.drawCharacterName();
                break;
            default:
                // 超过三次点击后，重置显示
                this.clear();
                this.clickCount = -1; // 把计数器重置为-1，因为后面会自增成0
                break;
        }

        this.clickCount++;

        console.log(this)
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

    // 绘制对话框
    drawDialogueBox() {
        if (this.images && this.images['dialogueBox']) {
            // 假设对话框位于画布的下方
            const dialogueBoxHeight = this.baseHeight * 0.25;
            this.drawImage(this.images['dialogueBox'], 50, this.baseHeight - dialogueBoxHeight - 20, this.baseWidth - 100, dialogueBoxHeight);
            this.drawDialogueText(); // 绘制对话文字
        }
    }

    // 绘制对话文字
    drawDialogueText() {
        const textX = 70;
        const textY = this.baseHeight - 100;
        const maxWidth = this.baseWidth - 140;  // 给对话框内的文字留出边距
        this.drawText(this.dialogueText, textX, textY, maxWidth, 'white');
    }

    // 绘制角色姓名
    drawCharacterName() {
        const nameX = 70;
        const nameY = this.baseHeight - 150;  // 姓名显示在对话框上方
        this.drawText(this.characterName, nameX, nameY, 200, 'white');
    }
}

export default AVDManager;