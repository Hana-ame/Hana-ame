import CanvasManager from "../Tools/canvas/canvasmanager";
import ScriptManager from "./ScriptManager";

class AVDManager extends CanvasManager {
    private images?: Record<string, HTMLImageElement>;
    private scriptManager?: ScriptManager;

    // 渲染相关数据
    private renderState = {
        background: "background",
        dialogueBox: "dialogueBox",
        characters: [] as { name: string; positionX: number; positionY: number }[],
        dialogueText: "",
        characterName: "",
    };

    private clickCount: number = 0;
    private isTyping: boolean = false;
    private currentText: string = "";
    private typingIndex: number = 0;
    private typingTimeout?: number;
    private lastRenderTime: number = 0;

    private typingInterval: number = 50; // 打字速度（毫秒）

    constructor(canvas: HTMLCanvasElement, baseWidth: number, baseHeight: number) {
        super(canvas, baseWidth, baseHeight);
        this.startRenderLoop(); // 开始渲染循环
    }

    // 初始化图片资源
    async initImages(images: Record<string, string>) {
        const promises: Promise<void>[] = [];
        this.images = {};

        for (const key in images) {
            const promise = new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.src = images[key];
                img.onload = () => {
                    this.images![key] = img;
                    resolve();
                };
                img.onerror = () => reject(new Error(`Failed to load image: ${key}`));
            });
            promises.push(promise);
        }

        await Promise.all(promises);
    }

    // 初始化脚本管理器
    initScriptManager(dialogueData: {
        name: string;
        text: string;
        characters?: { name: string; positionX: number; positionY: number }[];
    }[]) {
        this.scriptManager = new ScriptManager(dialogueData);
    }

    // 点击事件绑定
    async initInput() {
        this.canvas.addEventListener("click", () => {
            this.handleClick();
        });
    }

    // 点击事件处理逻辑
    handleClick() {
        if (this.isTyping) {
            this.finishTyping();
            return;
        }

        if (this.clickCount === 0) {
            this.renderState.background = "background";
        } else {
            const script = this.scriptManager?.getNextScript();
            if (script) {
                this.startTyping(script.name, script.text);
                this.renderState.characters = script.characterStates || [];
            } else {
                this.resetState();
                return;
            }
        }

        this.clickCount++;
    }

    // 重置状态
    resetState() {
        this.clickCount = 0;
        this.renderState = {
            background: "background",
            dialogueBox: "dialogueBox",
            characters: [],
            dialogueText: "",
            characterName: "",
        };
        this.scriptManager?.reset();
    }

    // 开始打字效果
    startTyping(name: string, text: string) {
        this.isTyping = true;
        this.renderState.characterName = name;
        this.currentText = text;
        this.typingIndex = 0;
        this.typeNextCharacter();
    }

    // 完成当前的打字效果
    finishTyping() {
        this.isTyping = false;
        this.renderState.dialogueText = this.currentText;

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }

    // 逐字绘制文字
    typeNextCharacter() {
        if (this.typingIndex < this.currentText.length) {
            this.renderState.dialogueText = this.currentText.slice(0, this.typingIndex + 1);
            this.typingIndex++;
            this.typingTimeout = window.setTimeout(() => this.typeNextCharacter(), this.typingInterval);
        } else {
            this.isTyping = false;
        }
    }

    // 主渲染方法
    private render() {
        this.clear();
        const { background, dialogueBox, characters, dialogueText, characterName } = this.renderState;

        // 绘制背景
        if (this.images && this.images[background]) {
            this.drawImage(this.images[background], 0, 0, this.baseWidth, this.baseHeight);
        }

        // 绘制角色
        characters.forEach(({ name, positionX, positionY }) => {
            if (this.images && this.images[name]) {
                this.drawImage(this.images[name], positionX, positionY);
            }
        });

        // 绘制对话框
        if (this.images && this.images[dialogueBox]) {
            const dialogueBoxHeight = this.baseHeight * 0.25;
            this.drawImage(
                this.images[dialogueBox],
                50,
                this.baseHeight - dialogueBoxHeight - 20,
                this.baseWidth - 100,
                dialogueBoxHeight
            );
        }

        // 绘制角色名字
        if (characterName) {
            const nameX = 70;
            const nameY = this.baseHeight - 150;
            this.drawText(characterName, nameX, nameY, 200, "white");
        }

        // 绘制对话文本
        if (dialogueText) {
            const textX = 70;
            const textY = this.baseHeight - 100;
            const maxWidth = this.baseWidth - 140;
            this.drawText(dialogueText, textX, textY, maxWidth, "white");
        }
    }

    // 启动渲染循环
    private startRenderLoop() {
        const loop = (time: number) => {
            if (time - this.lastRenderTime >= 1000 / 60) {
                this.render();
                this.lastRenderTime = time;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

export default AVDManager;
