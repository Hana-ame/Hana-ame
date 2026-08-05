import { chromium } from 'playwright';

const BASE = process.env.E2E_BASE || 'http://localhost:5173/';
const results = [];
const ok = (label, cond, detail = '') => {
  results.push({ label, cond });
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch();
const ctxPc = await browser.newContext();
const ctxMobile = await browser.newContext();
const pc = await ctxPc.newPage();
const mob = await ctxMobile.newPage();
const errs = [];
const watch = (p, tag) => {
  p.on('pageerror', (e) => errs.push(`${tag}: ${e.message}`));
  p.on('console', (m) => {
    if (m.type() === 'error') errs.push(`${tag} [error]: ${m.text()}`);
  });
};
watch(pc, 'PC');
watch(mob, 'MOBILE');

try {
  await pc.goto(BASE + '#/pc');
  await pc.waitForSelector('#pc-roomcode', { state: 'visible' });
  await pc.waitForFunction(() => document.querySelector('#pc-roomcode').textContent !== '------', null, { timeout: 15000 });
  const code = await pc.textContent('#pc-roomcode');
  ok('PC 生成房间码', /^[A-Z0-9]{5}$/.test(code), code);

  await pc.waitForFunction(() => ['已广播', '等待手机', '已连接'].some((s) => document.querySelector('#pc-status').textContent.includes(s)), null, { timeout: 20000 });
  const status = await pc.textContent('#pc-status');
  ok('PC MQTT 广播', true, status);

  await mob.goto(BASE + '#/mobile?sim=1');
  await mob.waitForSelector('#screen-mobile', { state: 'visible' });
  ok('Mobile 屏幕', true);

  const listItem = mob.locator('.device-item', { hasText: code }).first();
  const sawList = await listItem.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  ok('Mobile 在列表中看到 PC (MQTT)', sawList, `房间 ${code}`);

  await mob.fill('#mobile-code', code);
  await mob.click('#mobile-join');
  await mob.waitForSelector('#screen-calibrate', { state: 'visible', timeout: 20000 });
  ok('Mobile 进入校准', true);

  const calibBtn = mob.locator('#calib-do');
  await calibBtn.waitFor({ state: 'visible', timeout: 20000 });
  await calibBtn.click();
  await mob.waitForSelector('#screen-calib2', { state: 'visible', timeout: 10000 });
  await mob.waitForFunction(() => document.querySelector('#calib2-step').textContent.includes('校准完成'), null, { timeout: 40000 });
  ok('Mobile 引导校准完成(10方向)', true);

  await mob.click('#calib2-do', { force: true });
  await mob.waitForSelector('#screen-remote', { state: 'visible' });
  ok('Mobile 进入遥控界面', (await mob.textContent('#remote-status')).includes('挥舞'), await mob.textContent('#remote-status'));

  await pc.waitForFunction(() => !document.querySelector('#pc-start').disabled, null, { timeout: 20000 });
  ok('PC 开始按钮可用(已连接)', true);

  await pc.click('#pc-start', { force: true });
  await pc.waitForSelector('#hud:not(.hidden)', { state: 'visible', timeout: 5000 });
  ok('PC 进入游戏画面', true);

  await pc.waitForFunction(() => !!window.__beatriftDebug?.getGame()?.swordVisible, null, { timeout: 20000 });
  ok('网络 motion 流到达 PC(光剑可见)', true);

  await pc.waitForTimeout(2500);
  const scoreBefore = await pc.textContent('#score');
  const injected = await pc.evaluate(async () => {
    const d = window.__beatriftDebug;
    const pivot = { x: 0, y: 0.7, z: 1.6 };
    let swings = 0;
    for (let i = 0; i < 80; i++) {
      const game = d.getGame();
      let best = null, bestP = Infinity;
      if (game) {
        for (const n of game.notes) {
          if (n.dead) continue;
          const z = n.mesh.position.z;
          if (z < -2.2 || z > 1.6) continue;
          const dist = n.mesh.position.distanceToSquared(new (n.mesh.position.constructor)(pivot.x, pivot.y, pivot.z));
          if (dist < bestP) { bestP = dist; best = n; }
        }
        if (best) {
          const dir = best.mesh.position.clone().sub(new (best.mesh.position.constructor)(pivot.x, pivot.y, pivot.z)).normalize();
          d.handleMotion({ dir: { x: dir.x, y: dir.y, z: dir.z }, omega: 4, hit: 4 });
          swings++;
        }
      }
      await new Promise((r) => setTimeout(r, 90));
    }
    return swings;
  });
  await pc.waitForTimeout(800);
  const scoreAfter = await pc.textContent('#score');
  ok('PC 计分增长(注入命中)', Number(scoreAfter) > Number(scoreBefore), `注入 ${injected} 次挥击, ${scoreBefore} -> ${scoreAfter}`);

  const lives = await pc.textContent('#lives');
  ok('PC 生命显示', lives.length > 0, lives);

  const ping = await mob.textContent('#remote-ping');
  ok('Mobile 收到 ping 延迟', /\d+\s*ms/.test(ping), ping);
} catch (e) {
  ok('EXCEPTION', false, e.message);
}

console.log('\n--- page errors ---');
if (errs.length === 0) console.log('  (none)');
else errs.forEach((e) => console.log('  ' + e));

const passed = results.filter((r) => r.cond).length;
console.log(`\nPass ${passed}/${results.length}`);
await browser.close();
process.exit(passed === results.length ? 0 : 1);
