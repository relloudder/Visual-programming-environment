//локальные процедуры модуля рисования
var DrawingHelpers = (function() {

	colorBall = function (ctx,x0,y0,r,col){
	    var gradient = ctx.createRadialGradient(x0+r/4,y0-r*1/3,r/15,x0,y0,r);
 	    gradient.addColorStop(0,'#ffffff');
  	    gradient.addColorStop(0.85,col);
  	    ctx.fillStyle = gradient;
  	    ctx.strokeStyle = col;
    }
    
    return {
		colorBall : colorBall
    };

})();


//глобальные процедуры модуля рисования
var DrawForVis = (function(){

    back = function(ctx,col1,col2,w,h){
	    ctx.save();
        var g = ctx.createLinearGradient(0,0,0,h);
        g.addColorStop(0,col1);
        g.addColorStop(1,col2);
        ctx.fillStyle = g;
        ctx.fillRect(0,0,w,h);
	    ctx.restore();
    }
    
    ball = function(ctx,x0,y0,r,col){
        ctx.save();  //сохраняем контест рисования
	    ctx.beginPath(); //создаем начало пути, используется, если нужно рисовать какие-то объекты, красить их
	    DrawingHelpers.colorBall(ctx,x0,y0,r,col); //создаем градиент для закраски шарика
	    ctx.arc(x0,y0,r,0,2*Math.PI,false); //рисуем шарик
	    ctx.fill(); //закраиваем его тем что установлено в ctx.fillStyle (функция colorBall)
	    ctx.closePath();
	    ctx.restore(); //восстанавливаем контекст рисования
	}
	
	halfBall = function(ctx,x0,y0,r,col){
	    ctx.save();	
  		DrawingHelpers.colorBall(ctx,x0,y0,r,col);
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
	}
	
    alphaBall = function(ctx,x0,y0,r,col,alpha){
	    ctx.save();
    	DrawingHelpers.colorBall(ctx,x0,y0,r,col);	
    	with (Math) {  
        	ctx.beginPath();
        	ctx.save();
        	ctx.beginPath(); //задняя стенка
        	var x1 = x0 + cos(alpha*PI/180)*r; 
        	var y1 = y0 + sin(alpha*PI/180)*r; 
        	var dx = x0 + cos(4/3*alpha*PI/180)*r/2;
        	var dy = y0 + sin(4/3*alpha*PI/180)*r/2;
        	ctx.moveTo(x1,y1);
        	ctx.quadraticCurveTo(dx,dy,x0-0.1*r,y0-0.1*r);
	    	var x = x0 + cos(-(alpha+180)*PI/180)*r; 
	    	var y = y0 + sin(-(alpha+180)*PI/180)*r; 
	    	var dx = x0 + cos(-(2/3*alpha+180)*PI/180)*r/2;
	    	var dy = y0 + sin(-(2/3*alpha+180)*PI/180)*r/2;
	    	ctx.quadraticCurveTo(dx,dy,x,y);
        	ctx.stroke();
        	ctx.fillStyle = "#ffffff";
        	ctx.quadraticCurveTo(x0+r/2,y0+r,x1,y1);
        	ctx.fill();
        	ctx.closePath();
        	ctx.restore();
        	ctx.beginPath(); //передняя стенка
        	ctx.arc(x0,y0,r,alpha*PI/180,-(alpha+180)*PI/180,false);
        	x = x0 + cos(-(alpha+180)*PI/180)*r; 
        	y = y0 + sin(-(alpha+180)*PI/180)*r; 
        	dx = x0 + cos(-(4/3*alpha+180)*PI/180)*r/2;
        	dy = y0 + sin(-(4/3*alpha+180)*PI/180)*r/2;
        	ctx.moveTo(x,y);
        	ctx.quadraticCurveTo(dx,dy,0.1*r+x0,0.1*r+y0);
        	x = x0 + cos(alpha*PI/180)*r; 
        	y = y0 + sin(alpha*PI/180)*r; 
        	dx = x0 + cos(2/3*alpha*PI/180)*r/2;
        	dy = y0 + sin(2/3*alpha*PI/180)*r/2;
        	ctx.quadraticCurveTo(dx,dy,x,y);
        	ctx.stroke();
        	ctx.fill();
        	ctx.closePath();
        	ctx.closePath();
    	}
		ctx.restore();
	}	
    
    return {
        back : back,
        ball : ball,
        halfBall : halfBall,
        alphaBall : alphaBall
    };

})();