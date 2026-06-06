// ==========================================================================
// CIPHER:ANTARES II - 全局音频生命周期与同站续播控制系统 (智能状态锁版)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const bgmBtn = document.getElementById('bgm-btn');
    const graphicLogo = document.querySelector('.graphic-logo-permanent');

    if (!audio || !bgmBtn) return; // 安全防御

    const STORAGE_TIME_KEY = 'cipher_bgm_current_time';
    const STORAGE_STATE_KEY = 'cipher_bgm_is_playing';

    // 1. 浏览器导航行为精确判定
    const navEntries = performance.getEntriesByType("navigation");
    const isReload = (navEntries.length > 0 && navEntries[0].type === 'reload') || 
                     (window.performance && window.performance.navigation && window.performance.navigation.type === 1);

    // 2. 读取上一页留下的会话缓存
    const hasSessionRecord = sessionStorage.getItem(STORAGE_STATE_KEY) !== null;
    let savedTime = sessionStorage.getItem(STORAGE_TIME_KEY);
    let wasPlaying = sessionStorage.getItem(STORAGE_STATE_KEY) === 'true';

    // 3. 具名解锁函数（用户被浏览器拦截时的手动兜底）
    const unlock = () => {
        if (!audio.paused) {
            removeUnlockListeners();
            return;
        }
        audio.play().then(() => {
            bgmBtn.classList.add('playing');
            fadeIn(audio, savedTime && wasPlaying ? 1000 : 4000);
            removeUnlockListeners();
        }).catch(() => {});
    };

    function removeUnlockListeners() {
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
    }

    // 4. 丝滑淡入内核
    function fadeIn(audioElement, duration = 4000) {
        audioElement.volume = 0;
        const targetVolume = 1;
        const step = 0.02; 
        const intervalTime = duration * step; 

        const timer = setInterval(() => {
            if (audioElement.volume < targetVolume) {
                audioElement.volume = Math.min(audioElement.volume + step, targetVolume);
            } else {
                clearInterval(timer);
            }
        }, intervalTime);
    }

    // 5. 核心播放函数
    function startMusic(isContinuation = false) {
        if (!audio.paused) return; 

        audio.play().then(() => {
            bgmBtn.classList.add('playing');
            fadeIn(audio, isContinuation ? 1000 : 4000);
        }).catch(err => {
            console.log("浏览器拦截自动播放，已挂载全局点击解锁器...");
            document.addEventListener('click', unlock);
            document.addEventListener('touchstart', unlock);
        });
    }

    // 6. 默认自动播放策略（用于首次进入或刷新页面）
    function triggerDefaultAutoPlay() {
        if (graphicLogo) {
            // Index 页面：绑定硬核 Logo 入场动画
            graphicLogo.addEventListener('animationend', (e) => {
                if (e.animationName === 'graphic-emerge') {
                    startMusic(false);
                }
            });
        } else {
            // Waiting 等无 Logo 页面：2.6秒后备份启动
            setTimeout(() => startMusic(false), 2600);
        }
    }

    // ==========================================
    // 核心修正：三路分流控制中枢
    // ==========================================
    if (isReload) {
        // 【场景一：用户主动刷新页面】 -> 斩断一切缓存，强行洗牌从头来过
        console.log("检测到用户执行了【刷新】操作，音频状态已重置，将从头播放。");
        sessionStorage.removeItem(STORAGE_TIME_KEY);
        sessionStorage.removeItem(STORAGE_STATE_KEY);
        triggerDefaultAutoPlay();

    } else if (hasSessionRecord) {
        // 【场景二：通过站内链接正常跳转过来】
        if (wasPlaying && savedTime) {
            // 子情况 A：上一页走的时候音乐是在播的 -> 丝滑无缝续播
            console.log(`检测到同站跳转，正在从 ${parseFloat(savedTime).toFixed(2)} 秒处恢复音频...`);
            audio.currentTime = parseFloat(savedTime);
            startMusic(true); 
        } else {
            // 子情况 B：上一页走的时候用户手动暂停了音乐 -> 严格保持安静，不调用任何播放逻辑
            console.log("检测到同站跳转，但由于上一页音频为【暂停】状态，本页将维持静音。");
        }

    } else {
        // 【场景三：用户第一次敲网址进入网站 (无任何会话记录)】 -> 默认自动播放
        triggerDefaultAutoPlay();
    }

    // 7. BGM 开关手动控制
    bgmBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        removeUnlockListeners();

        if (audio.paused) {
            audio.play().then(() => {
                bgmBtn.classList.add('playing');
                if (audio.volume < 0.1) audio.volume = 1; 
                // 手动恢复播放，同步纠正会话缓存状态
                sessionStorage.setItem(STORAGE_STATE_KEY, 'true');
            }).catch(err => console.error("手动播放失败:", err));
        } else {
            audio.pause();
            bgmBtn.classList.remove('playing');
            // 用户既然手动暂停了，同步打入死锁状态，防止跳转到下一页又自动响起来
            sessionStorage.setItem(STORAGE_STATE_KEY, 'false');
        }
    });

    // 8. 离场快照记录
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem(STORAGE_TIME_KEY, audio.currentTime);
        sessionStorage.setItem(STORAGE_STATE_KEY, !audio.paused ? 'true' : 'false');
    });
});




