var DrawForVis = function(ctx){

    var radialGradient = function(x0,y0,r,col,pos){
        var gradient = ctx.createRadialGradient(x0+r/4,y0-r*1/3,r/15,x0,y0,r);
        gradient.addColorStop(0,'#ffffff');
        gradient.addColorStop(pos,col);
        ctx.fillStyle = gradient;
    }

    var linearGradient = function(col1,col2,w,w1,h){
        var gradient = ctx.createLinearGradient(w1,0,0,h);
        gradient.addColorStop(0,col1);
        gradient.addColorStop(1,col2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,w,h);
    }

    var colorBall = function (x0,y0,r,col){
        radialGradient(x0,y0,r,col,0.85)
        ctx.strokeStyle = col;
    }

    var colorText = function (x0,y0,r,col){
	    radialGradient(x0,y0,r,col,0.42)
    }

    var backFlag = function(col1,col2,w,h){
        ctx.save();
        linearGradient(col1,col2,w,w/2,h)
        ctx.restore();
    }

    var radians = function(alpha){
        return alpha*Math.PI/180;
    }

    var MathCalculations = function(x0,y0,alpha1,alpha2,r){
        this.x = x0 + Math.cos(alpha1)*r;
        this.y = y0 + Math.sin(alpha1)*r;
        this.dx = x0 + Math.cos(alpha2)*r/2;
        this.dy = y0 + Math.sin(alpha2)*r/2;
    }

    return{

        back : function(col1,col2,w,h){
            ctx.save();
            linearGradient(col1,col2,w,0,h)
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
            ctx.beginPath();
            ctx.save();
            ctx.beginPath(); //задняя стенка
            var calcs = new MathCalculations(x0,y0,radians(alpha),4/3*radians(alpha),r);
            var x1 = calcs.x;
            var y1 = calcs.y;
            var dx = calcs.dx;
            var dy = calcs.dy;
            ctx.moveTo(x1,y1);
            ctx.quadraticCurveTo(dx,dy,x0-0.1*r,y0-0.1*r);
            calcs = new MathCalculations(x0,y0,-radians(alpha+180),-radians(2/3*alpha+180),r);
            x = calcs.x;
            y = calcs.y;
            dx = calcs.dx;
            dy = calcs.dy;
            ctx.quadraticCurveTo(dx,dy,x,y);
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.quadraticCurveTo(x0+r/2,y0+r,x1,y1);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
            ctx.beginPath(); //передняя стенка
            ctx.arc(x0,y0,r,radians(alpha),-radians(alpha+180),false);
            calcs = new MathCalculations(x0,y0,-radians(alpha+180),-radians(4/3*alpha+180),r);
            x = calcs.x;
            y = calcs.y;
            dx = calcs.dx;
            dy = calcs.dy;
            ctx.moveTo(x,y);
            ctx.quadraticCurveTo(dx,dy,0.1*r+x0,0.1*r+y0);
            calcs = new MathCalculations(x0,y0,radians(alpha),2/3*radians(alpha),r);
            x = calcs.x;
            y = calcs.y;
            dx = calcs.dx;
            dy = calcs.dy;
            ctx.quadraticCurveTo(dx,dy,x,y);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
            ctx.closePath();
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
        },

        connect : function(x0,y0,r,n,col,alpha){
            ctx.save();
            ctx.translate(x0,y0);
            ctx.rotate(alpha);
            ctx.beginPath();
            ctx.moveTo(0,0);
            for (var k = 1; k < n; k++){
                ctx.quadraticCurveTo(r,k*r+2/3*r,r,k*r-r/2);
                ctx.quadraticCurveTo(r,k*r-2/3*r,0,k*r);
            }
            ctx.strokeStyle = col;
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        },

        hat : function(x0,y0,r,col,val){
            ctx.save();
            colorText(x0-r/2,y0-r/4,r*2,col);
            ctx.beginPath();
            ctx.translate(x0,y0+1.3*r+r);
            ctx.moveTo(0,-2*r);
            var x = (r+1)*Math.cos(Math.PI/4*5);
            var y = (r+1)*Math.sin(Math.PI/4*5);
            ctx.lineTo(x,y);
            ctx.quadraticCurveTo(0,0-1/3*r,-x,y);
            ctx.lineTo(0,-2*r);
            ctx.fill();
            colorText(0,r/4,r,'#000');
            ctx.font = r/4*3 + 'px Arial';
            ctx.fillText(val,-r/8,-r*0.7);
            ctx.closePath();
            ctx.restore();
        }

    };

}
