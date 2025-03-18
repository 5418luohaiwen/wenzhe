//网页时钟显示
const canvas = document.getElementById("myCanvas"); 
const ctx = canvas.getContext("2d");

var radius = canvas.height * 0.5;
ctx.translate(radius, radius);
radius = radius * 0.90 

function drawFace(){
    var grad = ctx.createRadialGradient(0, 0, radius*0.95, 0, 0, radius*1.05);
    grad.addColorStop(0, "antiquewhite");
    grad.addColorStop(0.5, "white");
    grad.addColorStop(1, "antiquewhite");
    
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    ctx.fillStyle = "white";
    ctx.fill()
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius*0.1;
    ctx.stroke();

    ctx.beginPath()
    ctx.arc(0, 0, 0.1*radius, 0, 2*Math.PI);
    ctx.fillStyle = "rgba(128, 128, 128, 0.3)"
    ctx.fill()
}
function drawNumbers(){
    for(var num= 1; num<7; num++){
        var ang = num * Math.PI / 3;
        var roman = ['Ⅰ', 'Ⅳ','Ⅵ','Ⅷ','Ⅹ','Ⅻ'];
        ctx.rotate(ang);
        ctx.translate(0, -0.85*radius);
        ctx.rotate(-ang);
        ctx.fillStyle = "grey";
        ctx.font = radius*0.3 + "px arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(roman[num-1], 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, 0.85*radius);
        ctx.rotate(-ang);
        }
    }

    function drawTime() {
        var now = new Date();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        hour = hour%12;
        hour = hour * Math.PI/6 + minute * Math.PI/(6*60) + second * Math.PI/(6*60*60);

        drawPointer(hour, 0.5*radius, 0.07*radius);
        minute = minute * Math.PI/30 + second * Math.PI/(30*60);
        drawPointer(minute, 0.8*radius, 0.07*radius)
        second = second * Math.PI/30;
        drawPointer(second, 0.9*radius, 0.02*radius)

        function drawPointer(pos, length, width){
            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.lineCap = "round";
            ctx.moveTo(0, 0);
            ctx.rotate(pos);
            ctx.lineTo(0, -length);
            ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
            ctx.stroke()
            ctx.rotate(-pos);
        }
    }

function drawClock(){
    drawFace();
    drawNumbers();
    drawTime();
}
setInterval(drawClock, 1000)

//<canvas id="myCanvas" width="100" height="100"></canvas> 