import { chromium } from 'playwright-core';
const edge='/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const browser=await chromium.launch({executablePath:edge,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:4321/zh/',{waitUntil:'networkidle'});
// Verify chapter links in 日本语能力测试 sheet
const openSheet = async (key) => { await page.evaluate(k=>document.querySelector('[data-content-sheet-trigger="'+k+'"]')?.click(),key); await page.waitForTimeout(500); };
await openSheet('post:日本语能力测试');
console.log('jp links', await page.evaluate(()=>[...document.querySelectorAll('[data-content-sheet-content] .detail-body a')].slice(0,8).map(a=>a.getAttribute('href'))));
await page.keyboard.press('Escape'); await page.waitForTimeout(350);
await openSheet('post:线性代数笔记');
console.log('math sheet', await page.evaluate(()=>({title:document.querySelector('[data-content-sheet-content] h1')?.textContent, katex:document.querySelectorAll('[data-content-sheet-content] .katex').length, chapters:document.querySelectorAll('[data-content-sheet-content] .sheet-chapter').length, imgs:document.querySelectorAll('[data-content-sheet-content] img').length})));
await page.screenshot({path:'/tmp/zes4u-math-sheet.png'});
console.log('errors',errors.slice(0,8));
await browser.close();
