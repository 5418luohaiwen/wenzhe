
// emas-sdk-loader.js
(function() {
    // 避免重复初始化
    if (window.EMAS_APM_LOADED) {
        return;
    }
    window.EMAS_APM_LOADED = true;
    
    // 异步加载SDK
    var script = document.createElement('script');
    script.src = 'https://o.alicdn.com/alicloud-ams/alibabacloud-apm-h5-sdk/index.js'; // 使用官方CDN:cite[1]
    script.onload = function() {
        // 确保SDK加载完毕后再初始化
        if (window.EMAS && window.EMAS.APM) {
            var apm = new window.EMAS.APM({
                    appKey: '335613291', // EMAS 控制台创建应用后分配
                    appSecret: '2920e9431c594fd497495215dececfca', // EMAS 控制台创建应用后分配
                    appVersion: '1.0.0', // 应用版本号
                    channel: 'official', // 应用渠道号
                    userNick: 'ergouzi', // 用户昵称
                    userId: '123456', // 用户id
            });
            // 启动SDK
            var plugins = apm.start();
            // 将实例挂载到window，方便其他脚本使用（如果需要）
            window.EMAS_APM_INSTANCE = apm;
        }
    };
    document.head.appendChild(script);
})();