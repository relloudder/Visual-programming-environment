var DrawForVis = function(ctx){

    var colorBall = function (x0,y0,r,col){
        var gradient = ctx.createRadialGradient(x0+r/4,y0-r*1/3,r/15,x0,y0,r);
        gradient.addColorStop(0,'#ffffff');
        gradient.addColorStop(0.85,col);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = col;
    }

    var colorText = function (x0,y0,r,col){
	    var gradient = ctx.createRadialGradient(x0+r/4,y0-r*1/3,r/15,x0,y0,r);
	    gradient.addColorStop(0,'#ffffff');
	    gradient.addColorStop(0.42,col);
	    ctx.fillStyle = gradient;
    }

    var backFlag = function(col1,col2,w,h){
        ctx.save();
        var g = ctx.createLinearGradient(w/2,0,0,h);
        g.addColorStop(0,col1);
        g.addColorStop(1,col2);
        ctx.fillStyle = g;
        ctx.fillRect(0,0,w,h);
        ctx.restore();
    }

    var radians = function(alpha){
        return alpha*Math.PI/180;
    }

    return{

        back : function(col1,col2,w,h){
            ctx.save();
            var g = ctx.createLinearGradient(0,0,0,h);
            g.addColorStop(0,col1);
            g.addColorStop(1,col2);
            ctx.fillStyle = g;
            ctx.fillRect(0,0,w,h);
            ctx.restore();
        },

        ball : function(x0,y0,r,col){
            ctx.save();
            ctx.beginPath();
            colorBall(x0,y0,r,col); //создаем градиент для закраски шарика
            ctx.arc(x0,y0,r,0,2*Math.PI,false); //рисуем шарик
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        },

        halfBall : function(x0,y0,r,col){
            ctx.save();
            colorBall(x0,y0,r,col);
            ctx.beginPath(); //передняя стенка
            ctx.arc(x0,y0,r,0,Math.PI,false);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath(); //задняя стенка
            ctx.moveTo(x0-r,y0);
            ctx.quadraticCurveTo(x0,y0+r/4,x0+r,y0);
            ctx.quadraticCurveTo(x0,y0-r/4,x0-r,y0);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        },

        alphaBall : function(x0,y0,r,col,alpha){
            ctx.save();
            colorBall(x0,y0,r,col);
            with (Math) {
            ctx.beginPath();
            ctx.save();
            ctx.beginPath(); //задняя стенка
            var x1 = x0 + cos(radians(alpha))*r;
            var y1 = y0 + sin(radians(alpha))*r;
            var dx = x0 + cos(4/3*radians(alpha))*r/2;
            var dy = y0 + sin(4/3*radians(alpha))*r/2;
            ctx.moveTo(x1,y1);
            ctx.quadraticCurveTo(dx,dy,x0-0.1*r,y0-0.1*r);
            var x = x0 + cos(-radians(alpha+180))*r;
            var y = y0 + sin(-radians(alpha+180))*r;
            var dx = x0 + cos(-radians(2/3*alpha+180))*r/2;
            var dy = y0 + sin(-radians(2/3*alpha+180))*r/2;
            ctx.quadraticCurveTo(dx,dy,x,y);
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.quadraticCurveTo(x0+r/2,y0+r,x1,y1);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
            ctx.beginPath(); //передняя стенка
            ctx.arc(x0,y0,r,radians(alpha),-radians(alpha+180),false);
            x = x0 + cos(-radians(alpha+180))*r;
            y = y0 + sin(-radians(alpha+180))*r;
            dx = x0 + cos(-radians(4/3*alpha+180))*r/2;
            dy = y0 + sin(-radians(4/3*alpha+180))*r/2;
            ctx.moveTo(x,y);
            ctx.quadraticCurveTo(dx,dy,0.1*r+x0,0.1*r+y0);
            x = x0 + cos(radians(alpha))*r;
            y = y0 + sin(radians(alpha))*r;
            dx = x0 + cos(2/3*radians(alpha))*r/2;
            dy = y0 + sin(2/3*radians(alpha))*r/2;
            ctx.quadraticCurveTo(dx,dy,x,y);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
            ctx.closePath();
            }
            ctx.restore();
        },

        text : function(val,x0,y0,r,alpha){
            ctx.save();
            ctx.translate(x0,y0);
            ctx.rotate(alpha);
            colorText(0,0,r,'#000');
	        //размещение числового значения в шарике
	        var stringVal = val.toString(10);
	        if (stringVal.indexOf('.') >= 0){
	            val = Math.ceil(val*10)/10;
		        stringVal = val.toString(10);
	        }
	        var lengthVal = stringVal.length;
	        if (lengthVal > 5){
	            stringVal = stringVal.substring(0,5);
	            lengthVal = 5;
	        }
	        var arrFont = new Array(0,1,1,4/5,2.5/4,1.5/3);
	        var arrR = new Array(0,0.35,0.5,0.65,0.6,0.65);
	        var arrPos = new Array(0,1/2,1/2,1/2,1/4,1/4);
	        ctx.font = 'bold ' + arrFont[lengthVal]*r + 'px Courier New';
            ctx.fillText(stringVal,-arrR[lengthVal]*r,arrPos[lengthVal]*r);
            ctx.restore();
        },

        flag : function(x0,y0,rSpring,n,col,name,rFont,alpha){
	        ctx.save();
	        ctx.beginPath();
            ctx.translate(x0,y0);
            ctx.rotate(alpha);
	        ctx.moveTo(0,0);
            for (var k=1; k<n; k++){
		        ctx.quadraticCurveTo(rSpring,k*rSpring+2/3*rSpring,rSpring,k*rSpring-rSpring/2);
		        ctx.quadraticCurveTo(rSpring,k*rSpring-2/3*rSpring,0,k*rSpring);
	        }
	        ctx.strokeStyle = col;
	        ctx.stroke();
            if (name.length > 5){
                name = name.substring(0,5);
                name = name+'~';
            }
            var w = name.length*0.6*rFont + 2;
            var h = rFont + 2;
	        ctx.translate(0,n*rSpring-rSpring/2);
	        backFlag('#aaa','#fff',w,h);
	        ctx.rotate(Math.PI);
	        ctx.font = rFont+'px Courier New';
	        ctx.fillText(name,-w+2,-rFont/4);
            ctx.closePath();
            ctx.restore();
        }

    };

}