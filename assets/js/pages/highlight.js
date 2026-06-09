document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. 单级场贩菜单切换逻辑（中控核心）
  // ==========================================
  const tabGroup = document.querySelector(".goods-tab-group");

  if (tabGroup) {
    tabGroup.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".goods-tab-btn");
      if (!tabBtn || tabBtn.classList.contains("active")) return;

      tabGroup.querySelector(".goods-tab-btn.active")?.classList.remove("active");
      tabBtn.classList.add("active");

      // 联动 1：切换对应的 Banner 大图
      const targetBannerId = tabBtn.dataset.banner;
      const targetBanner = document.getElementById(targetBannerId);
      if (targetBanner) {
        document.querySelectorAll(".g-banner.active").forEach(el => el.classList.remove("active"));
        targetBanner.classList.add("active");
      }

      // 联动 2：同步刷新下方的制品详情/信息面板
      const targetInfoId = "info-" + targetBannerId;
      const targetInfoPane = document.getElementById(targetInfoId);
      if (targetInfoPane) {
        document.querySelectorAll(".info-pane-content.active").forEach(el => el.classList.remove("active"));
        targetInfoPane.classList.add("active");
      }
    });
  }

  // ==========================================
  // 2. 左右方向键轮播逻辑
  // ==========================================
  const prevBtn = document.getElementById("hub-banner-prev");
  const nextBtn = document.getElementById("hub-banner-next");

  function handleBannerSlide(direction) {
    const tabButtons = Array.from(document.querySelectorAll(".goods-tab-btn"));
    if (tabButtons.length === 0) return;

    const currentActiveIndex = tabButtons.findIndex(btn => btn.classList.contains("active"));
    if (currentActiveIndex === -1) return;
    
    let targetIndex;
    if (direction === "next") {
      targetIndex = (currentActiveIndex + 1) % tabButtons.length;
    } else {
      targetIndex = (currentActiveIndex - 1 + tabButtons.length) % tabButtons.length;
    }

    tabButtons[targetIndex].click();
  }

  if (nextBtn) nextBtn.addEventListener("click", () => handleBannerSlide("next"));
  if (prevBtn) prevBtn.addEventListener("click", () => handleBannerSlide("prev"));


  // ==========================================
  // 3-A. 数据池：【SECTION_01】赛事组委会制品
  // ==========================================
  const committeeGoods = [
    {
      id: "com-01",
      name: "Cipher:Antares II 入场手环",
      tag: "AURORA_GEAR | 无料发放",
      cardImg: "../../assets/images/goods/shouhuan.jpg",   // 渲染在上方滚动卡片里的图
    detailImg: "../../assets/images/about/banner.png", // 点击后注入到下方大框里的图
      desc: "采用轻量、防水、抗撕裂的杜邦纸（Tyvek®）材质制作。首次验票入场时由工作人员免费为您佩戴。本手环为活动期间有效的再入场凭证，请妥善保管，遗失恕不补发，感谢您的妥善珍藏。",
      specs: [
        "材质: 杜邦 Tyvek® 特种纸材质",
        "定价: 非卖品（仅限现场入场时领取）",
        "出品: Cipher:Antares II 赛事组委会官方运营组"
      ]
    }
  ];

  // ==========================================
  // 3-B. 数据池：【SECTION_02】Raia Project 专属制品
  // ==========================================
  const raiaGoods = [
    {
      id: "raia-01",
      name: "RAIA PROJECT 拉链卫衣",
      tag: "RAIA_PROJECT | 受注预定",
      cardImg: "../../assets/images/goods/shouhuan.jpg",   // 渲染在上方滚动卡片里的图
    detailImg: "../../assets/images/about/banner.png", // 点击后注入到下方大框里的图
      desc: "",
      specs: [
        "材质: ",
        "尺寸: ",
        "定价: ",
        "出品: Sakakiraia"
      ]
    }
  ];


// ==========================================
  // 4-A. 初始化执行：【组委会面板】数据清洗与绑定
  // ==========================================
  const comGrid = document.getElementById("com-gallery-grid");
  if (comGrid) {
    // 🎯 核心改动 1：使用 item.cardImg 渲染上方小图，并改用 data-index 绑定下标防止 ID 重复 Bug
    comGrid.innerHTML = committeeGoods.map((item, index) => `
      <div class="gallery-item-card ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="thumb-wrap"><img src="${item.cardImg}" alt="${item.name}"></div>
        <div class="item-meta"><span class="item-tag">${item.tag}</span><div class="item-name">${item.name}</div></div>
      </div>
    `).join('');

    function updateComDetail(product) {
      if (!product) return;
      // 🎯 核心改动 2：详情大图赋值改为 product.detailImg
      document.getElementById("inj-com-main-img").src = product.detailImg;
      document.getElementById("inj-com-tag").innerText = product.tag;
      document.getElementById("inj-com-title").innerText = product.name;
      document.getElementById("inj-com-desc").innerText = product.desc;
      document.getElementById("inj-com-specs").innerHTML = product.specs.map(s => `<li>${s}</li>`).join('');
    }
    
    // 初始化渲染第一个制品
    updateComDetail(committeeGoods[0]);

    comGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".gallery-item-card");
      if (!card || card.classList.contains("active")) return;
      comGrid.querySelector(".gallery-item-card.active")?.classList.remove("active");
      card.classList.add("active");
      
      // 🎯 核心改动 3：通过绑定的 index 索引直接去数据池捞数据，精准对应
      const targetIndex = card.dataset.index;
      updateComDetail(committeeGoods[targetIndex]);
    });
  }

  // ==========================================
  // 4-B. 初始化执行：【Raia Project面板】数据清洗与绑定
  // ==========================================
  const raiaGrid = document.getElementById("raia-gallery-grid");
  if (raiaGrid) {
    // 🎯 核心改动 1：使用 item.cardImg 渲染上方小图，并绑定 data-index
    raiaGrid.innerHTML = raiaGoods.map((item, index) => `
      <div class="gallery-item-card ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="thumb-wrap"><img src="${item.cardImg}" alt="${item.name}"></div>
        <div class="item-meta"><span class="item-tag">${item.tag}</span><div class="item-name">${item.name}</div></div>
      </div>
    `).join('');

    function updateRaiaDetail(product) {
      if (!product) return;
      // 🎯 核心改动 2：详情大图赋值改为 product.detailImg
      document.getElementById("inj-raia-main-img").src = product.detailImg;
      document.getElementById("inj-raia-tag").innerText = product.tag;
      document.getElementById("inj-raia-title").innerText = product.name;
      document.getElementById("inj-raia-desc").innerText = product.desc;
      document.getElementById("inj-raia-specs").innerHTML = product.specs.map(s => `<li>${s}</li>`).join('');
    }

    // 初始化渲染第一个制品
    updateRaiaDetail(raiaGoods[0]);

    raiaGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".gallery-item-card");
      if (!card || card.classList.contains("active")) return;
      raiaGrid.querySelector(".gallery-item-card.active")?.classList.remove("active");
      card.classList.add("active");
      
      // 🎯 核心改动 3：通过 index 索引精准切换
      const targetIndex = card.dataset.index;
      updateRaiaDetail(raiaGoods[targetIndex]);
    });
  }

  // ==========================================
  // 5. 首屏强校验对齐
  // ==========================================
  const initTabBtn = document.querySelector(".goods-tab-btn.active");
  if (initTabBtn) {
    initTabBtn.classList.remove("active");
    initTabBtn.click();
  }
});

// 图片点击放大核心逻辑（全局）
function zoomImage(imgElement) {
  const overlay = document.getElementById('image-zoom-overlay');
  const zoomedImg = document.getElementById('zoomed-image');
  if (overlay && zoomedImg) {
    zoomedImg.src = imgElement.src; 
    overlay.classList.add('active'); 
    document.body.style.overflow = 'hidden'; 
  }
}
function closeZoom() {
  const overlay = document.getElementById('image-zoom-overlay');
  if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
}

/**
 * 🎛️ 双端自适应：控制小图画廊【精准单张步进】平滑切换
 * @param {string} gridId - 对应画廊容器的ID ('com-gallery-grid' 或 'raia-gallery-grid')
 * @param {string} direction - 滚动方向 ('left' 或 'right')
 */
function scrollGallery(gridId, direction) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  
  const cards = Array.from(grid.querySelectorAll('.gallery-item-card'));
  if (cards.length === 0) return;

  // 📐 1. 移动端小屏幕逻辑 (<= 768px)：基于几何中心定位，单张强制屏幕正中吸附
  if (window.innerWidth <= 768) {
    const gridCenter = grid.getBoundingClientRect().left + grid.clientWidth / 2;
    let minDistance = Infinity;
    let currentActiveIndex = 0;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(gridCenter - cardCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        currentActiveIndex = index;
      }
    });

    let targetIndex = currentActiveIndex;
    if (direction === 'left') {
      targetIndex = Math.max(0, currentActiveIndex - 1);
    } else {
      targetIndex = Math.min(cards.length - 1, currentActiveIndex + 1);
    }

    cards[targetIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center' // 强制横向居中对齐
    });
    
    // 可选：如果在移动端点击箭头切换时，希望下方大图和文本跟着同步联动刷新，可解开下行注释：
    // cards[targetIndex].click();
  } 
  
  // 🖥️ 2. 宽屏桌面端逻辑 (> 768px)：基于精确物理像素步进，一次平滑推移刚好一张卡片的完整宽度
  else {
    const firstCard = cards[0];
    const cardWidth = firstCard.clientWidth; // 获取单张卡片的实时渲染宽度
    
    // 动态提取当前 CSS 中配置的 gap 间距值，确保加减法绝对精准
    const computedGap = parseInt(window.getComputedStyle(grid).gap) || 16;
    
    // 📢 精准步进单位 = 一张卡片的宽度 + 间距线宽度
    const stepScrollAmount = cardWidth + computedGap; 
    
    if (direction === 'left') {
      grid.scrollBy({ left: -stepScrollAmount, behavior: 'smooth' });
    } else {
      grid.scrollBy({ left: stepScrollAmount, behavior: 'smooth' });
    }
  }
}



/**
 * 🔍 点击唤醒全屏巨幕放大灯箱
 * @param {HTMLElement} imgElement - 被点击的图片DOM节点
 */
function zoomImage(imgElement) {
  // 确保图片源有效才执行
  if (!imgElement || !imgElement.src) return;

  const lightbox = document.getElementById('global-matrix-lightbox');
  const lightboxImg = document.getElementById('lightbox-render-target');
  
  if (lightbox && lightboxImg) {
    lightboxImg.src = imgElement.src; // 动态同步当前大画幅图片
    lightbox.classList.add('active');
    
    // 📢 细节控优化：放大期间锁死底层 body 的滚动条，避免手机或电脑滚轮误触导致背景位移
    document.body.style.overflow = 'hidden'; 
  }
}

/**
 * ❌ 关闭全屏灯箱
 */
function closeMatrixZoom() {
  const lightbox = document.getElementById('global-matrix-lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    
    // 📢 释放底层 body 的滚动条
    document.body.style.overflow = ''; 
  }
}