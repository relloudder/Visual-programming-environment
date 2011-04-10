var DrawForVis = function(ctx) {

    var radialGradient = function(x0,y0,r,col,pos) {
        var gradient = ctx.createRadialGradient(x0+r/4,y0-r*1/3,r/15,x0,y0,r);
        gradient.addColorStop(0,'#ffffff');
        gradient.addColorStop(pos,col);
        ctx.fillStyle = gradient;
    }

    var linearGradient = function(col1,col2,w,w1,h) {
        var gradient = ctx.createLinearGradient(w1,0,0,h);
        gradient.addColorStop(0,col1);
        gradient.addColorStop(1,col2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,w,h);
    }

    var colorBall = function (x0,y0,r,col) {
        radialGradient(x0,y0,r,col,0.85)
        ctx.strokeStyle = col;
    }

    var colorText = function (x0,y0,r,col) {
	    radialGradient(x0,y0,r,col,0.42)
    }

    var backFlag = function(col1,col2,w,h) {
        ctx.save();
        linearGradient(col1,col2,w,w/2,h);
        ctx.restore();
    }

    var colorFigure = function (col1,col2,w,h) {
        var gradient = ctx.createLinearGradient(-w,-h,w,h);
        gradient.addColorStop(0.3,col1);
        gradient.addColorStop(1,col2);
        ctx.fillStyle = gradient;
    }

    var spring = function(x0,y0,r,n,col,alpha) {
        ctx.save();
        ctx.translate(x0,y0);
        ctx.rotate(alpha);
        ctx.beginPath();
        ctx.moveTo(0,0);
        for (var k = 1; k < n; k++) {
            ctx.quadraticCurveTo(r,k*r+2/3*r,r,k*r-r/2);
            ctx.quadraticCurveTo(r,k*r-2/3*r,0,k*r);
        }
        ctx.strokeStyle = col;
        ctx.stroke();
    }

    var radians = function(alpha) {
        return alpha*Math.PI/180;
    }

    var MathCalculations = function(x0,y0,alpha1,alpha2,r) {
        this.x = x0 + Math.cos(alpha1)*r;
        this.y = y0 + Math.sin(alpha1)*r;
        this.dx = x0 + Math.cos(alpha2)*r/2;
        this.dy = y0 + Math.sin(alpha2)*r/2;
    }

    var getGradient = function(col) {
        var s,s1,s2,s3;
        s = parseInt(col.substring(1,3),16) + 100;
        if (s <= 255) {
            s1=s.toString(16);
        } else {
            s1 = 'ff';
        }
        if (s1.length == 1) {
            s1 = '0' + s1;
        }
        s = parseInt(col.substring(3,5),16) + 100;
        if (s <= 255) {
            s2 = s.toString(16);
        } else {
            s2 = 'ff';
        }
        if (s2.length == 1) {
            s2 = '0' + s2;
        }
        s = parseInt(col.substring(5,7),16) + 100;
        if (s <= 255) {
            s3 = s.toString(16);
        } else {
            s3 = 'ff';
        }
        if (s3.length == 1) {
            s3 = '0' + s3;
        }
        return('#'+s1+s2+s3);
    }

    return {

        back: function(col1,col2,w,h) {
            ctx.save();
            linearGradient(col1,col2,w,0,h)
            ctx.restore();
        },

        ball: function(x0,y0,r,col) {
            ctx.save();
            ctx.beginPath();
            colorBall(x0,y0,r,col); //создаем градиент для закраски шарика
            ctx.arc(x0,y0,r,0,2*Math.PI,false); //рисуем шарик
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        },

        halfBall: function(x0,y0,r,col) {
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

        alphaBall: function(x0,y0,r,col,alpha) {
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

        text: function(val,x0,y0,r,alpha,type) {
            ctx.save();
            ctx.translate(x0,y0);
            ctx.rotate(alpha);
            colorText(0,0,r,'#000');
	        //размещение числового значения в шарике
	        var stringVal = val.toString(10);
	        if (stringVal.indexOf('.') >= 0) {
	            val = Math.ceil(val*10)/10;
		        stringVal = val.toString(10);
	        }
	        if (type == 'real' && stringVal.indexOf('.') < 0) {
	            stringVal += '.0';
	        }
	        var lengthVal = stringVal.length;
	        if (lengthVal > 5) {
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

        flag: function(x0,y0,rSpring,n,col,name,rFont,alpha) {
            spring(x0,y0,rSpring,n,col,alpha);
            if (name.length > 6) {
                name = name.substring(0,5);
                name = name+'~';
            }
            if (typeof(name) == 'number') {
                name = name.toString(10);
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

        union: function(x0,y0,r,n,col,alpha) {
            spring(x0,y0,r,n,col,alpha);
            ctx.closePath();
            ctx.restore();
        },

        connect: function(xBeg,yBeg,xEnd,yEnd,r,col) {
            var rr = Math.sqrt((xBeg-xEnd)*(xBeg-xEnd)+(yBeg-yEnd)*(yBeg-yEnd));
            if ((yBeg-yEnd) == 0) {
                alpha = -Math.PI/2;
            } else {
                alpha = Math.atan((xBeg-xEnd)/(yBeg-yEnd));
            }
            if ((yBeg-yEnd)>0) {
                alpha = Math.PI+alpha;
            }
            n = Math.ceil(rr/(1*r));
            this.union(xBeg,yBeg,r,n,col,-alpha);
        },

        hat: function(x0,y0,r,col,val) {
            ctx.save();
            //исправить на градиент
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
            if (val.length == 1) {
                ctx.font = r/4*3 + 'px Arial';
                ctx.fillText(val,-r/8,-r*0.7);
            } else {
                ctx.font = r/3*2 + 'px Arial';
                ctx.fillText(val,-r/3,-r*0.7);
            }
            ctx.closePath();
            ctx.restore();
        },

        hatRecord: function(x0,y0,r,col,val,alpha) {
            ctx.save();
            ctx.translate(x0-r*Math.sin(alpha)/2,y0+r*Math.cos(alpha)/2);
            ctx.rotate(alpha);
            ctx.beginPath();
            ctx.moveTo(-r*1.5,0);
            ctx.quadraticCurveTo(0,-r/2,r*1.5,0);
            ctx.quadraticCurveTo(0,r*2,-r*1.5,0);
            colorBall(-r/2,0,r*1.3,'rgb(230,230,230)');
            ctx.fill();
            ctx.strokeStyle = 'rgb(200,200,200)';
            ctx.stroke();
            ctx.closePath();
            ctx.rotate(Math.PI);
            ctx.fillStyle = 'black';
            if(val.length > 5) val = val.substr(0,4) + '~';
            ctx.font = r*3/4 + 'px Arial';
            ctx.fillText(val,-r,0);
	        ctx.restore();
        },

        record: function(x0,y0,r,col,val) {
            ctx.save();
            if (typeof(val) == 'number') {
                val = val.toString(10);
            }
            var h = val.length*r/6;
            if (h < 10) {
                h = 10;
            }
            ctx.translate(x0,y0);
            ctx.beginPath();
            ctx.moveTo(-1.5*r-h/2,-r);
            ctx.lineTo(1.5*r+h/2,-r);
            ctx.lineTo(2.5*r+h/2,-2*r);
            ctx.lineTo(-0.5*r-h/2,-2*r);
            ctx.lineTo(-1.5*r-h/2,-r);
            ctx.strokeStyle = col;
            ctx.stroke();
            ctx.fillStyle = 'rgb(230,230,230)';
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(-0.5*r-h/2,-2*r);
            ctx.lineTo(-0.5*r-h/2, 0);
            ctx.strokeStyle = col;
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = col;
            ctx.fillRect(-1.5*r-h/2,-r,3*r+h,2*r);
            ctx.fillStyle = col;
            colorFigure(col,'rgb(200,200,200)',r,r+h/2);
            ctx.moveTo(1.5*r+h/2,r);
            ctx.lineTo(2.5*r+h/2,0);
            ctx.lineTo(2.5*r+h/2,-2*r);
            ctx.lineTo(1.5*r+h/2,-r);
            ctx.fill();
            ctx.closePath();
            ctx.fillStyle = 'black';
            ctx.font = 'bold ' + r*1.5 + 'px Arial';
            ctx.fillText(val,-r-h/2,r/3*2);
            ctx.restore();
        },

        divBall: function(x0,y0,r,col,alpha,angle,rOrLAngle) {
	        ctx.save();
	        ctx.beginPath();
	        ctx.translate(x0, y0);
	        ctx.rotate(angle);
	        colorBall(0,0,r,col);
	        ctx.arc(0,0,r,rOrLAngle-alpha,rOrLAngle+alpha,false);
            ctx.fill();
	        ctx.stroke();
            ctx.closePath();
	        ctx.restore();
        },

        rect: function(x0,y0,r,k,h,col,val,alpha){
            ctx.save();
            ctx.translate(x0,y0);
            ctx.rotate(alpha);
            ctx.beginPath();
            ctx.moveTo(2*k*r,-r);
            ctx.lineTo(2*k*r,-r+h);
            ctx.lineTo(k/2*r,r+h);
            ctx.lineTo(-2*k*r,r+h);
            ctx.lineTo(-2*k*r,r);
            ctx.fillStyle = '#FFCCCC';
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            colorFigure(col,getGradient(col),k*r,r);
            ctx.moveTo(-k/2*r,-r);
            ctx.lineTo(2*k*r,-r);
            ctx.lineTo(k/2*r,r);
            ctx.lineTo(-2*k*r,r);
            ctx.fill();
            ctx.closePath();
            this.roundedRect(-k*r+h,-k*r+h,2.5*k*r,r*2,4,'#E8E8E8','#C8C8C8',3);
            ctx.fillStyle = '#000';
            //найти длинну val.length и либо уменьшить либо обрезать
            ctx.font = r*0.8+'px Arial';
            ctx.fillText(val,-r*k+1.5*h,-r);
            ctx.restore();
        },

        roundedRect: function(x,y,width,height,radius,col1,col2,h) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x+width,y+height);
            ctx.lineTo(x+width+h,y-h+height);
            ctx.lineTo(x+h+width,y-h+radius);
            ctx.quadraticCurveTo(x+h+width,y-h,x+h+width-radius,y-h);
            ctx.lineTo(x+h+radius,y-h);
            ctx.lineTo(x,y);
            ctx.fillStyle = col2;
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(x,y+radius);
            ctx.lineTo(x,y+height-radius);
            ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
            ctx.lineTo(x+width-radius,y+height);
            ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
            ctx.lineTo(x+width,y+radius);
            ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
            ctx.lineTo(x+radius,y);
            ctx.quadraticCurveTo(x,y,x,y+radius);
            ctx.fillStyle = col1;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    };
}
