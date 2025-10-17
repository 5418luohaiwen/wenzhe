//首次加载动画 
document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    // 检查是否是首次访问
    if (!sessionStorage.getItem('pageLoaded')) {
        // 首次访问 - 显示加载动画
        let pageFullyLoaded = false;
        const startTime = Date.now();
        const maxDuration = 10000; // 10秒最大持续时间
        // 更新进度条和文本
        function updateProgress() {
            const elapsed = Date.now() - startTime;
            const progressPercent = Math.min(95, (elapsed / maxDuration) * 100);
            progressBar.style.width = progressPercent + '%';
            // 动态更新loading文本
            const loadingStates = [
                { threshold: 12.5, text: "loading.." },
                { threshold: 25, text: "loading..." },
                { threshold: 37.5, text: "loading." },
                { threshold: 50, text: "loading..." },
                { threshold: 62.5, text: "loading." },
                { threshold: 75, text: "loading.." },
                { threshold: 87.5, text: "loading..." },
                { threshold: 95, text: "准备就绪！" }
            ];
            // 根据进度选择对应的文本
            for (let i = loadingStates.length - 1; i >= 0; i--) {
                if (progressPercent >= loadingStates[i].threshold) {
                    loadingText.textContent = loadingStates[i].text;
                    break;
                }
            }
            // 如果页面还未加载完成，继续更新进度
            if (!pageFullyLoaded && elapsed < maxDuration) {
                requestAnimationFrame(updateProgress);
            } else if (pageFullyLoaded) {
                // 页面加载完成，立即完成进度条
                completeLoading();
            }
        }
        // 完成加载并隐藏界面
        function completeLoading() {
            progressBar.style.width = '100%';
            loadingText.textContent = "准备就绪！";
            // 延时隐藏以确保用户看到100%状态
            setTimeout(function() {
                loadingOverlay.style.opacity = '0';
                setTimeout(function() {
                    loadingOverlay.style.display = 'none';
                    // 标记页面已加载
                    sessionStorage.setItem('pageLoaded', 'true');
                }, 500);
            }, 500);
        }
        // 监听页面完全加载
        window.addEventListener('load', function() {
            pageFullyLoaded = true;
            // 如果进度条已经完成，直接隐藏
            if (Date.now() - startTime >= maxDuration) {
                completeLoading();
            }
        });
        // 开始进度更新
        updateProgress();
        // 安全机制：10秒后强制完成
        setTimeout(function() {
            if (!pageFullyLoaded) {
                pageFullyLoaded = true;
                completeLoading();
            }
        }, maxDuration);
    } else {
        // 非首次访问 - 直接隐藏加载动画
        loadingOverlay.style.display = 'none';
    }
});
 
//网页时间显示
var timeElement = document.getElementById('timeElement');
const WEEK_ARRAY = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'];
function updateTime(){
    var time = new Date(),
        year = time.getFullYear(),
        month = time.getMonth()+1,
        month = month > 9 ? month : `0${month}`;
        date = time.getDate(),
        date = date > 9 ? date : `0${date}`
        week = time.getDay(),
    week = WEEK_ARRAY[week];
    timeElement.textContent = `${year}年${month}月${date}日 ${week}`;
};
updateTime();
setInterval(updateTime, 1000);

//网页天气显示
var liveweather = document.querySelector('#weatherElement');
window.onload = function (){
    var weather = sessionStorage.getItem('weather');
    if(weather){
        updateWeatherUI(JSON.parse(weather).lives[0]);
    }
    else{
        var ajax = new XMLHttpRequest;
        ajax.open('get','https://restapi.amap.com/v3/weather/weatherInfo?city=310118&key=ace0df2a278be67a0b88bee5ad01099d',true);
        ajax.send();
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 4){
                if (ajax.status == 200){
                    weather = ajax.responseText;
                    sessionStorage.setItem('weather', weather);
                    updateWeatherUI(JSON.parse(weather).lives[0]);
                }
                else{
                    console.log('天气api调用失败');
                }
            }
        }
    }
}
function updateWeatherUI(weatherdata) {
    liveweather.textContent = `${weatherdata.city} ${weatherdata.temperature}℃ ${weatherdata.weather} ${weatherdata.humidity}%`;
}

// 企业二维码获取元素
const logoContainer = document.querySelector('.logo');
const qrcode = document.querySelector('.qrcode');
// 点击 Logo 切换二维码显示
logoContainer.addEventListener('click', (e) => {
     e.stopPropagation(); // 阻止事件冒泡
     qrcode.classList.toggle('active');
 });
// 点击页面其他区域关闭二维码
document.addEventListener('click', (e) => {
     if (!logoContainer.contains(e.target)) {
        qrcode.classList.remove('active');
     }
 })
// 移动端适配：添加触摸支持
logoContainer.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    qrcode.classList.toggle('active');
});

