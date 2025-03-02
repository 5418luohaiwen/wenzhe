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

 // 获取元素
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
 });
 // 移动端适配：添加触摸支持
 logoContainer.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    qrcode.classList.toggle('active');
});