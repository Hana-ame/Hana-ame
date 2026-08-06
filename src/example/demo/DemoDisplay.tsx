import { VnPlayer } from '../../vn';
import type { VnScript } from '../../vn';

// 根路由演示：一个覆盖全部指令的"功能巡检"场景。
// 它是一份可运行的剧本，逐个演示 preload / say / bg / cg / stand / choice / jump / label /
// wait / hook / audio / video / buttons / menu / transition / end，并演示变量分支、
// showWhen / jump.if 条件、全局跨场景状态（end 自动 markSceneSeen）。

const IMG = 'https://ex.moonchan.xyz/s';
const URL = {
  bg1: `${IMG}/44b1bd5866/3191868-4?redirect_to=image`,
  cg1: `${IMG}/22b2e0dd67/3191868-5?redirect_to=image`,
  cg2: `${IMG}/3edd149890/3191868-6?redirect_to=image`,
  cg3: `${IMG}/0385d3ce62/3191868-7?redirect_to=image`,
  standL: `${IMG}/f636d8c3c1/3191868-9?redirect_to=image`,
  bg2: `${IMG}/36be9f5092/3191868-10?redirect_to=image`,
  standR: `${IMG}/664a161ef2/3191868-12?redirect_to=image`,
  cg4: `${IMG}/5fc03d5f46/3191868-18?redirect_to=image`,
};
const VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const BGM = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const SFX = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3';

const demoScript: VnScript = {
  meta: {
    title: 'Hana VN · 功能演示',
    typeSpeed: 24,
    ui: {
      dialog: {
        left: '4%',
        right: '4%',
        bottom: 24,
        bg: 'rgba(10,10,30,0.85)',
        color: '#fff',
        textSize: 20,
        animate: true,
      },
      choice: { align: 'center', itemBg: 'rgba(20,20,40,0.9)', itemColor: '#fff', animate: true },
    },
  },
  lines: [
    // ── ① preload（wait:true 严格等待）+ bg + 旁白 ─────────────────────────
    { type: 'label', name: 'demo_start' },
    {
      type: 'preload',
      wait: true,
      assets: [
        { key: 'bg1', url: URL.bg1 },
        { key: 'bg2', url: URL.bg2 },
        { key: 'cg1', url: URL.cg1 },
        { key: 'cg2', url: URL.cg2 },
        { key: 'cg3', url: URL.cg3 },
        { key: 'cg4', url: URL.cg4 },
        { key: 'standL', url: URL.standL },
        { key: 'standR', url: URL.standR },
      ],
    },
    { type: 'bg', key: 'bg1', fadeMs: 800 },
    { type: 'say', speaker: '', text: 'Hana VN 引擎 —— 剧本驱动视觉小说框架·功能演示。' },
    {
      type: 'say',
      speaker: '',
      text: '本演示串起全部指令：preload / bg / cg / say / stand / wait / choice / jump / label / hook / audio / video / buttons / menu / transition / end。',
    },

    // ── ② cg 层 + say.cg + fadeMs + effect ──
    { type: 'cg', key: 'cg1', fadeMs: 600 },
    { type: 'say', speaker: '向导', text: '这是 cg 层，用 cg 指令切换（contain 看全），带 600ms 淡入。' },
    { type: 'say', speaker: '', cg: 'cg2', fadeMs: 500, text: 'say 也可以直接带 cg：这条台词顺带换了 CG，还带了 500ms 淡入。' },
    { type: 'say', speaker: '', cg: 'cg3', effect: 'flash', text: '这条带 effect:flash（白屏闪）。' },

    // ── ③ stand 指令：立绘进出场演出 ──
    { type: 'say', speaker: '', bg: 'bg2', text: '下面用 stand 指令做立绘演出。' },
    { type: 'stand', key: 'standL', pos: 'left', effect: 'slide-left', fadeMs: 500 },
    { type: 'stand', key: 'standR', pos: 'right', effect: 'slide-right', fadeMs: 500 },
    { type: 'say', speaker: '向导', text: '左右立绘分别 slide 进场。点击立绘可切换显示/隐藏。' },
    { type: 'stand', pos: 'left', action: 'hide', effect: 'slide-down', fadeMs: 400 },
    { type: 'say', speaker: '向导', text: '左侧立绘 slide-down 退场。' },
    { type: 'stand', pos: 'right', action: 'hide', effect: 'zoom', fadeMs: 400 },

    // ── ④ choice.set + 变量 + showWhen + jump.if ──
    { type: 'label', name: 'demo_choice_start' },
    {
      type: 'choice',
      options: [
        { text: '选 A（set flag=a）', to: 'demo_choice_done', set: { flag: 'a' } },
        { text: '选 B（set flag=b）', to: 'demo_choice_done', set: { flag: 'b' } },
      ],
    },
    { type: 'label', name: 'demo_choice_done' },
    { type: 'say', speaker: '', text: '你做了选择，变量 flag 已写入。下面的选项会根据 flag 条件显示。' },
    {
      type: 'choice',
      options: [
        { text: '查看隐藏项（showWhen:$flag==\'a\'）', to: 'demo_hidden', showWhen: "$flag == 'a'" },
        { text: '直接继续', to: 'demo_after' },
      ],
    },
    { type: 'label', name: 'demo_hidden' },
    { type: 'say', speaker: '', text: '只有你刚才选 A，这个隐藏选项才会出现 —— 依赖 choice.set + showWhen。' },
    { type: 'label', name: 'demo_after' },
    { type: 'jump', to: 'demo_jumped', if: "$flag == 'a'" },
    { type: 'say', speaker: '', text: '（jump.if 条件不满足，本行被跳过）你选的是 B。' },
    { type: 'label', name: 'demo_jumped' },

    // ── ⑤ wait 挂起 + hook（run）──
    { type: 'say', speaker: '', text: 'wait 指令：停在当前画面直到点击（这里带了 effect:flash）。' },
    { type: 'wait', effect: 'flash' },
    {
      type: 'hook',
      wait: true,
      key: 'demo_hook',
      run: (vn) => {
        const n = Number(vn.getGlobalVar('demo_visits') ?? 0) + 1;
        vn.setGlobalVar({ demo_visits: n });
        vn.setVar({ hookNote: n });
        vn.shake();
      },
    },
    { type: 'say', speaker: '', text: 'hook 指令执行：我让画面抖了一下（vn.shake），并把全局变量 demo_visits 加 1（跨场景持久化，localStorage）。' },

    // ── ⑥ buttons 非阻塞按钮层 ──
    {
      type: 'buttons',
      layout: 'row',
      position: 'top-right',
      dismissible: true,
      buttons: [
        { label: '跳转 #port', action: { type: 'jump', to: '#port' } },
        { label: '写变量', action: { type: 'set', set: { viaButtons: true } } },
        { label: '打开标题', action: { type: 'href', url: '#vn-title' } },
      ],
    },
    { type: 'say', speaker: '', text: 'buttons 指令：非阻塞按钮层 —— 这行台词在按钮存在时照样推进。' },
    { type: 'say', speaker: '', text: '「写变量」写入 viaButtons；有 dismissible 时可点空白关闭；剧情继续后我用 buttons:[] 清掉。' },
    { type: 'buttons', buttons: [] },
    { type: 'say', speaker: '', text: '按钮层已清除。' },

    // ── ⑦ audio（bgm/sfx）+ video ──
    { type: 'audio', key: BGM, channel: 'bgm', loop: true, volume: 0.5 },
    { type: 'say', speaker: '', text: 'audio 指令：开始循环播放 BGM（音量可在设置面板调节）。' },
    { type: 'audio', key: SFX, channel: 'sfx', volume: 0.3 },
    { type: 'say', speaker: '', text: '再放一个 SFX。' },
    { type: 'video', key: VIDEO, fit: 'contain', wait: true },
    { type: 'say', speaker: '', text: 'video 指令：全屏视频演出，播完自动继续（flower.mp4，CC0 样例）。' },
    { type: 'audio', key: BGM, action: 'stop' },

    // ── ⑧ transition + menu（grid / list）──
    { type: 'transition', effect: 'wipe-left', fadeMs: 600 },
    { type: 'say', speaker: '', text: 'transition 指令：全屏转场（wipe-left），播完自动继续。' },
    { type: 'transition', effect: 'circle', fadeMs: 700, color: '#1a1030' },
    { type: 'say', speaker: '', text: '再来一个 circle 转场。' },
    { type: 'cg', key: 'cg4', fadeMs: 400 },
    {
      type: 'menu',
      layout: 'grid',
      items: [
        { id: 'demo_restart', title: '重新看一遍', cover: URL.bg1 },
        { id: 'demo_replay_choice', title: '重玩选择支', cover: URL.cg1 },
        { id: '#port', title: '去 H-Scene 菜单', cover: URL.cg2 },
      ],
    },
    {
      type: 'menu',
      layout: 'list',
      items: [
        { id: 'demo_secret_menu', title: '（仅当 flag==a）隐藏条目', showWhen: "$flag == 'a'" },
        { id: 'demo_restart', title: '回到开头' },
        { id: '#vn-title', title: '返回标题' },
      ],
    },

    // ── ⑨ end：回标题；自动 markSceneSeen('demo') ──
    { type: 'label', name: 'demo_replay_choice' },
    { type: 'jump', to: 'demo_choice_start' },
    { type: 'label', name: 'demo_restart' },
    { type: 'jump', to: 'demo_start' },
    { type: 'label', name: 'demo_secret_menu' },
    { type: 'say', speaker: '', text: '菜单条目也能用 showWhen（只有 flag==a 才显示）。本场景到此结束。' },
    { type: 'end', goto: '#vn-title' },
  ],
};

export function VnDemoDisplay() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={demoScript} scriptKey="demo" />
    </div>
  );
}

VnDemoDisplay.head = {
  title: '功能演示',
  description: '根示例 · 全覆盖指令集的完整 VN 场景',
};

export default VnDemoDisplay;