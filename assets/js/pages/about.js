document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.tactical-drawer-container');
  const pullTab = document.getElementById('tactical-pull-tab');
  const panel = document.getElementById('creator-panel');

  // ⚡️ 彻底废除固定 280px，改为动态变量
  let maxPanelHeight = 0; 
  const TRIGGER_THRESHOLD = 80; // 拖拽超过 80px 自动滑出全开

  let isDragging = false;
  let startY = 0;
  let isOpen = false;

  // 状态雷达：精准区分用户是在“高频拖拽”还是“轻点内部小箭头”
  let isPureClick = true;
  let lastPointerDownTime = 0;

  // 💡 【核心新增】：动态量取面板内部文字的真实渲染高度
  function refreshRealHeight() {
    // 即使面板当前 height 为 0，scrollHeight 也能精准拿到内部撑开所需的完整像素值
    maxPanelHeight = panel.scrollHeight;
  }

  // 辅助函数：更新面板高度与外层拉环基准位移
  function setPanelHeight(height) {
    panel.style.height = `${height}px`;
    // 拉环基准永远死锁在动态计算出的高度像素最底边缘
    pullTab.style.transform = `translateX(-50%) translateY(${height}px)`;
  }

  // 初始化以及窗口缩放时，重新计算真实高度，防范响应式换行导致的高度坍塌
  refreshRealHeight();
  window.addEventListener('resize', () => {
    if (isOpen) {
      refreshRealHeight();
      setPanelHeight(maxPanelHeight);
    }
  });

  // ==========================================================================
  // 复合手势核心事件
  // ==========================================================================
  pullTab.addEventListener('pointerdown', (e) => {
    isDragging = true;
    isPureClick = true; 
    lastPointerDownTime = Date.now();
    startY = e.clientY;
    
    // 拖拽前高频刷新一次实时高度，确保万无一失
    refreshRealHeight();

    // 关闭纯 CSS 过渡，防止鼠标拖拽时产生延迟粘连感
    panel.style.transition = 'none';
    pullTab.style.transition = 'none';
    pullTab.setPointerCapture(e.pointerId);
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const deltaY = e.clientY - startY;
    
    // 判定阈值：移动偏移超过 5px 立即切断点击判定，解锁为纯拖拽物理模式
    if (Math.abs(deltaY) > 5) {
      isPureClick = false;
    }

    if (!isOpen) {
      //【关闭状态下往下拖】
      if (deltaY > 0) {
        const dampedHeight = Math.pow(deltaY, 0.85); 
        // 允许拖拽的最大高度动态锁定为当前文本的真实 scrollHeight
        setPanelHeight(Math.min(dampedHeight, maxPanelHeight));
      }
    } else {
      //【开启状态下往上推】
      if (deltaY < 0) {
        const dampedHeight = maxPanelHeight + deltaY;
        setPanelHeight(Math.max(dampedHeight, 0));
      }
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    pullTab.releasePointerCapture(e.pointerId);

    // 恢复平滑的常规收缩与回弹过渡动画
    panel.style.transition = 'height 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    pullTab.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    
    const clickDuration = Date.now() - lastPointerDownTime;

    // 【单点触发关闭核心】：如果检测到在全开状态下轻点“内部纯净小箭头”
    if (isPureClick && clickDuration < 300 && isOpen) {
      closeDrawer();
      return;
    }

    const deltaY = e.clientY - startY;

    if (!isOpen) {
      if (deltaY > TRIGGER_THRESHOLD) {
        openDrawer();
      } else {
        closeDrawer();
      }
    } else {
      // 往上推过了触发线则关闭，否则弹回全开
      if (deltaY < -TRIGGER_THRESHOLD) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }
  });

  // ==========================================================================
  // 状态控制器
  // ==========================================================================
  function openDrawer() {
    isOpen = true;
    refreshRealHeight(); // 全开时拉取最精准的高度
    setPanelHeight(maxPanelHeight);
    panel.classList.add('is-active');
    container.classList.add('is-open');
  }

  function closeDrawer() {
    isOpen = false;
    setPanelHeight(0);
    panel.classList.remove('is-active');
    container.classList.remove('is-open');
  }
});