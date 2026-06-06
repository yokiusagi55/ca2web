// 页面加载完成后执行 向下滚动加载
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.15 // 当元素出现 15% 的时候触发
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 元素进入视口，加上 active 类触发 CSS 动画
                entry.target.classList.add('active');
                // 如果只想加载一次，可以取消监听
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 绑定所有带有 .reveal 类的元素
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
});
