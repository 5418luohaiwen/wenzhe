//放大图片
function enlarge(event){
    if(event.currentTarget.style.width == '800px'){
        event.currentTarget.style.width = '';
    }else{
        event.currentTarget.style.width = '800px';
    };
    event.cancelBubble = true;
    event.stopPropagation();
};

//阻止右键菜单
document.addEventListener('contextmenu', function(event) {
    if (event.target.tagName === 'IMG') {
        event.preventDefault();
        return false;
    }
});

// document.addEventListener('contextmenu', function(e) {
//     if (e.target.tagName === 'IMG') {
//         e.preventDefault();
//         return false;
//     }
// });