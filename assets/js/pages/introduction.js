document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. 一级菜单切换逻辑（个人赛 / 共作会）
  // ==========================================
  const primaryButtons = document.querySelectorAll(".primary-menu-pane .menu-btn");
  
  primaryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;

      // 切换一级按钮高亮
      document.querySelector(".primary-menu-pane .menu-btn.active")?.classList.remove("active");
      btn.classList.add("active");

      // 切换对应的二级菜单面板
      const targetPaneId = btn.dataset.tab;
      document.querySelector(".sub-pane-group.active")?.classList.remove("active");
      
      const newActivePane = document.getElementById(targetPaneId);
      if (newActivePane) {
        newActivePane.classList.add("active");
        
        // 先清洗目标群组内可能存在的旧 active，防止 click 拦截
        const subBtns = newActivePane.querySelectorAll(".sub-btn");
        subBtns.forEach(sub => sub.classList.remove("active"));

        // 强行联动第一个二级选框按钮的触发事件
        const firstSubBtn = newActivePane.querySelector(".sub-btn");
        if (firstSubBtn) {
          firstSubBtn.click();
        }
      }
    });
  });

  // ==========================================
  // 2. 二级菜单切换逻辑（多维同步联动：按钮 + 大图 + 信息看板）
  // ==========================================
  const matrixMenuContainer = document.querySelector(".matrix-menu-container");

  if (matrixMenuContainer) {
    matrixMenuContainer.addEventListener("click", (e) => {
      const subBtn = e.target.closest(".sub-btn");
      if (!subBtn || subBtn.classList.contains("active")) return;

      // 定位二级容器清理多余 active
      const currentPane = subBtn.closest(".sub-pane-group");
      if (currentPane) {
        currentPane.querySelector(".sub-btn.active")?.classList.remove("active");
      }
      
      subBtn.classList.add("active");

      // 联动 1：切换对应的 Banner 大图
      const targetBannerId = subBtn.dataset.banner;
      const targetBanner = document.getElementById(targetBannerId);
      if (targetBanner) {
        // 💡 升级：全面清洗所有激活的大图，防止多余的大图叠加叠罗汉
        document.querySelectorAll(".t-banner.active").forEach(el => el.classList.remove("active"));
        targetBanner.classList.add("active");
      }

      // 联动 2：通过前缀拼接，同步刷新下方信息看板
      const targetInfoId = "info-" + targetBannerId;
      const targetInfoPane = document.getElementById(targetInfoId);
      if (targetInfoPane) {
        // 💡 核心修复：全量清洗所有 active 看板。就算你在 HTML 里复制漏了闭合或多写了 active，这里也会被一网打尽
        document.querySelectorAll(".info-pane-content.active").forEach(el => el.classList.remove("active"));
        targetInfoPane.classList.add("active");
      }
    });
  }

  // ==========================================
  // 3. 左右切换方向键逻辑 (新闻 Bar 同款机制)
  // ==========================================
  const prevBtn = document.getElementById("hub-banner-prev");
  const nextBtn = document.getElementById("hub-banner-next");

  function handleBannerSlide(direction) {
    const currentActivePane = document.querySelector(".sub-pane-group.active");
    if (!currentActivePane) return;

    const subButtons = Array.from(currentActivePane.querySelectorAll(".sub-btn"));
    const currentActiveIndex = subButtons.findIndex(btn => btn.classList.contains("active"));
    if (currentActiveIndex === -1) return;
    
    let targetIndex;
    if (direction === "next") {
      targetIndex = (currentActiveIndex + 1) % subButtons.length;
    } else {
      targetIndex = (currentActiveIndex - 1 + subButtons.length) % subButtons.length;
    }

    subButtons[targetIndex].click();
  }

  if (nextBtn) nextBtn.addEventListener("click", () => handleBannerSlide("next"));
  if (prevBtn) prevBtn.addEventListener("click", () => handleBannerSlide("prev"));


  // ==========================================
  // 💡 4. 新增：首屏刷新强制自适应校准逻辑
  // ==========================================
  // 页面加载或刷新时，顺着当前的激活链条，强行重置并点击一次二级按钮，让数据死死对齐
  const initSubBtn = document.querySelector(".sub-pane-group.active .sub-btn.active") || document.querySelector(".sub-btn.active");
  if (initSubBtn) {
    // 技巧：先剥离 active 防止被点击拦截器阻断，随后模拟点击迫使联动逻辑完整跑一遍
    initSubBtn.classList.remove("active");
    initSubBtn.click();
  }
});




// ==========================================
// 💡 新增：图片点击放大核心逻辑
// ==========================================
function zoomImage(imgElement) {
  const overlay = document.getElementById('image-zoom-overlay');
  const zoomedImg = document.getElementById('zoomed-image');
  
  if (overlay && zoomedImg) {
    zoomedImg.src = imgElement.src; // 将原图路径塞给放大容器
    overlay.classList.add('active'); // 激活遮罩层
    document.body.style.overflow = 'hidden'; // 放大期间禁止网页上下滚动
  }
}

function closeZoom() {
  const overlay = document.getElementById('image-zoom-overlay');
  if (overlay) {
    overlay.classList.remove('active'); // 隐藏遮罩层
    document.body.style.overflow = ''; // 恢复网页滚动
  }
}