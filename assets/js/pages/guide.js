/**
 * Cipher:Antares II - Guide 页面核心控制脚本
 * 仅保留：1. 单击块切换内容面板  2. 左右方向键联动切换
 */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. 单击块切换页面的控件（Tab 菜单中控核心）
  // ==========================================
  const tabGroup = document.querySelector(".goods-tab-group");

  if (tabGroup) {
    tabGroup.addEventListener("click", (e) => {
      // 捕获点击的菜单块
      const tabBtn = e.target.closest(".goods-tab-btn");
      if (!tabBtn || tabBtn.classList.contains("active")) return;

      // 切换当前菜单块的高亮状态
      tabGroup.querySelector(".goods-tab-btn.active")?.classList.remove("active");
      tabBtn.classList.add("active");

      // 联动 1：切换对应的 Banner 面板（或主文本区域）
      const targetBannerId = tabBtn.dataset.banner;
      const targetBanner = document.getElementById(targetBannerId);
      if (targetBanner) {
        document.querySelectorAll(".g-banner.active").forEach(el => el.classList.remove("active"));
        targetBanner.classList.add("active");
      }

      // 联动 2：同步切换下方的详细指南/介绍信息面板
      const targetInfoId = "info-" + targetBannerId;
      const targetInfoPane = document.getElementById(targetInfoId);
      if (targetInfoPane) {
        document.querySelectorAll(".info-pane-content.active").forEach(el => el.classList.remove("active"));
        targetInfoPane.classList.add("active");
      }
    });
  }

  // ==========================================
  // 2. 左右方向键切换控件（轮播/步进逻辑）
  // ==========================================
  const prevBtn = document.getElementById("hub-banner-prev");
  const nextBtn = document.getElementById("hub-banner-next");

  /**
   * 处理方向键切换逻辑
   * @param {string} direction - 'next' 代表下一页，'prev' 代表上一页
   */
  function handleGuideSlide(direction) {
    if (!tabGroup) return;
    
    // 获取所有的切换块，形成队列
    const tabButtons = Array.from(tabGroup.querySelectorAll(".goods-tab-btn"));
    if (tabButtons.length === 0) return;

    // 找到当前激活的文本块索引
    const currentActiveIndex = tabButtons.findIndex(btn => btn.classList.contains("active"));
    if (currentActiveIndex === -1) return;
    
    // 计算目标索引（支持首尾循环穿梭）
    let targetIndex;
    if (direction === "next") {
      targetIndex = (currentActiveIndex + 1) % tabButtons.length;
    } else {
      targetIndex = (currentActiveIndex - 1 + tabButtons.length) % tabButtons.length;
    }

    // 核心思想：模拟点击目标块，直接复用上面的 Tab 切换联动逻辑
    tabButtons[targetIndex].click();
  }

  // 绑定左右箭头的点击事件
  if (nextBtn) nextBtn.addEventListener("click", () => handleGuideSlide("next"));
  if (prevBtn) prevBtn.addEventListener("click", () => handleGuideSlide("prev"));


  // ==========================================
  // 3. 首屏自动强校验对齐
  // ==========================================
  const initTabBtn = document.querySelector(".goods-tab-btn.active");
  if (initTabBtn) {
    // 先移除 active，再通过 click 触发，确保初始状态下的各区域文本面板完美对齐显示
    initTabBtn.classList.remove("active");
    initTabBtn.click();
  }
});