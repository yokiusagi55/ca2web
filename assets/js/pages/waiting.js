// ==========================================================================
// CIPHER:ANTARES II - 矩阵式流体乱码洗牌动效内核 (老虎机流派)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const targetElement = document.getElementById("scramble-text");
  if (!targetElement) return;

  // 1. 全局动力学配置项
  const options = {
    text: targetElement.textContent.trim(),
    duration: 0.35, // 单个字符滚动动画时长
    stagger: 0.03,  // 字符间交错进场延迟
    ease: "power3.out",
    scrambleCharset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&-+=_[]{}<>", // 乱码噪点集
    triggerOnHover: true, // 是否开启鼠标悬停触发
    loop: true,           // 【新增】是否开启无尽周期循环
    loopDelay: 3000       // 【新增】每轮动画定格展示的静止时间 (3000ms = 3秒)
  };

  let isPlaying = false;
  
  // 挂载全局定时器指针，防止异步重叠
  targetElement.loopTimeout = null;

  // 2. 核心：系统无障碍环境检测（减弱动态效果适配）
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targetElement.classList.add("is-ready");
    return;
  }

  // 3. 核心：拆解真实文本并组装“老虎机胶片”DOM 结构
  function buildAndPlay() {
    if (isPlaying) return;
    isPlaying = true;

    // 每次重新启动时，强行清空挂起的定时器
    if (targetElement.loopTimeout) {
      clearTimeout(targetElement.loopTimeout);
    }

    const chars = options.text.split("");
    targetElement.innerHTML = "";

    // 逐字测量并转换 DOM
    chars.forEach((char) => {
      const dummy = document.createElement("span");
      dummy.className = "shuffle-char";
      dummy.textContent = char === " " ? "\u00A0" : char; // 绝杀空格塌陷 Bug
      targetElement.appendChild(dummy);

      // 获取当前字符在当前浏览器环境下的真实渲染物理宽度
      const w = dummy.getBoundingClientRect().width;
      if (w === 0) return;

      // 创建最外层裁剪框（视口）
      const wrap = document.createElement("span");
      wrap.className = "shuffle-char-wrapper";
      Object.assign(wrap.style, {
        display: "inline-block",
        overflow: "hidden",
        width: `${w}px`,
        verticalAlign: "bottom"
      });

      // 创建内层纵向/横向长条纸条
      const inner = document.createElement("span");
      inner.className = "shuffle-inner-strip";
      Object.assign(inner.style, {
        display: "inline-block",
        whiteSpace: "nowrap"
      });

      // 组装胶片内容：[真实定格字符, 随机生成的乱码, 初始占位字符]
      const realNode = dummy.cloneNode(true);
      realNode.setAttribute("data-orig", "1"); // 标记真实字符，用于终点清理
      
      const scrambleNode = dummy.cloneNode(true);
      scrambleNode.textContent = options.scrambleCharset.charAt(
        Math.floor(Math.random() * options.scrambleCharset.length)
      );

      const initialNode = dummy.cloneNode(true);

      // 严格按照滑入顺序注入纸条
      inner.appendChild(realNode);      // 最终位置: 0
      inner.appendChild(scrambleNode);  // 缓冲位置: -1w
      inner.appendChild(initialNode);   // 初始位置: -2w

      wrap.appendChild(inner);
      targetElement.replaceChild(wrap, dummy);

      // 初始位移：瞬间推到 -2 倍宽度处，完美隐藏真实字和乱码
      gsap.set(inner, { x: -2 * w });
    });

    targetElement.classList.add("is-ready");
    executeAnimation();
  }

  // 4. 核心：执行 GSAP 异步错位交错动画
  function executeAnimation() {
    const strips = Array.from(targetElement.querySelectorAll(".shuffle-inner-strip"));
    if (!strips.length) return;

    // 提取奇数与偶数序列，实现 Even-Odd 阶梯式视觉错位
    const oddStrips = strips.filter((_, i) => i % 2 === 1);
    const evenStrips = strips.filter((_, i) => i % 2 === 0);

    const tl = gsap.timeline({
      onComplete: () => {
        // 【打扫战场】：将复杂的胶片 DOM 结构强行剥离，还原纯净文本，防止网页排版塌陷
        strips.forEach((strip) => {
          const real = strip.querySelector('[data-orig="1"]');
          if (real) {
            const wrap = strip.parentElement;
            wrap.parentElement.replaceChild(real, wrap);
          }
        });
        
        // 释放动画锁
        isPlaying = false;

        // 【核心 Loop 触发器】
        if (options.loop) {
          targetElement.loopTimeout = setTimeout(() => {
            // 双重防御：确保没有在静止期被用户手动 Hover 拦截
            if (!isPlaying) {
              buildAndPlay();
            }
          }, options.loopDelay);
        }
      }
    });

    // 阶梯流一：奇数序列先拔头筹
    tl.to(oddStrips, {
      x: 0,
      duration: options.duration,
      ease: options.ease,
      stagger: options.stagger
    }, 0);

    // 阶梯流二：偶数序列在奇数跑完一大半 (总时长的 70%) 时强行插入，形成极其躁动的咬合感
    const oddTotalDuration = options.duration + Math.max(0, oddStrips.length - 1) * options.stagger;
    const evenStartDelay = oddStrips.length ? oddTotalDuration * 0.7 : 0;

    tl.to(evenStrips, {
      x: 0,
      duration: options.duration,
      ease: options.ease,
      stagger: options.stagger
    }, evenStartDelay);
  }

  // 5. 触发器一：ScrollTrigger 滚动进入视口触发
  ScrollTrigger.create({
    trigger: targetElement,
    start: "top 90%", 
    once: true, // 视口加载仅自动触发第一次，后续交由自身的 Loop 逻辑接管
    onEnter: buildAndPlay
  });

  // 6. 触发器二：鼠标悬停交互
  if (options.triggerOnHover) {
    targetElement.addEventListener("mouseenter", () => {
      // 只要鼠标划入，立刻斩断原有的定时器流，防止双重重播
      if (targetElement.loopTimeout) {
        clearTimeout(targetElement.loopTimeout);
      }
      
      // 如果当前没有在放动画，立刻手动洗牌
      if (!isPlaying) {
        buildAndPlay();
      }
    });
  }
});