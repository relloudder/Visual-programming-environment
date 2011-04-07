var app, xOld = 0, yOld = 0;
var expression;

$(function() {
    initApplication();
    runInterface();
});

function runInterface() {
    $('#playMenu, #play').click(function() {
        initApplication();
        var textProgram = $('#programPanel');
        var errorProgram = $('#errorPanel');
        var lex = new LexicalAnalyzer(textProgram,errorProgram);
        lex.getProgram();
        app.tree.treeLocation(app.width,app.height);
        var c = new SymConst(1,600,500);
        app.tree.push(c);
		app.tree.treeStatment.push(expression);
		app.paint();
        //app.tree.draw(app.ctx,app.tools);
    });

    $('#stop, #new, #reset').click(function() {
        initApplication();
    });

    $('#zoomIn, #zoomInMenu').click(function() {
        app.tools.scale += 0.01;
        app.tree.draw(app.ctx,app.tools);
    });

    $('#zoomOut, #zoomOutMenu').click(function() {
        app.tools.scale -= 0.01;
        app.tree.draw(app.ctx,app.tools);
    });

    $("#canvas").mousedown(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        app.tree.varMove = app.tree.findByPos([x,y],app.tools);
        if (app.tree.varMove != -1)
            app.flagMove = true;
        if(app.move) app.flagCanvasMove = true;
        xOld = x;
        yOld = y;
    });

    $("#canvas").mousemove(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        if (app.flagCanvasMove) {
            app.tools.setTop(app.tools.getTop() - (yOld - y)/app.tools.getScale());
            app.tools.setLeft(app.tools.getLeft() - (xOld - x)/app.tools.getScale());
            //app.tree.draw(app.ctx,app.tools);
			app.paint();
        } else
        if (app.flagMove) {
	        app.tree.varMove.changePos(new Array(x,y),app.tools);
	        //app.tree.draw(app.ctx,app.tools);
			app.paint();
	    }
	    xOld = x;
	    yOld = y;
    });

    $("#canvas").mouseup(function(event) {
        app.flagMove = false;
        app.flagCanvasMove = false;
    });

    $("#hand, #handMenu").click(function() {
        app.move = !app.move;
        if (app.move) $("#canvas").css("cursor","move");
        else $("#canvas").css("cursor","default");
    });

    $("#move").click(function() {
        /*var moveBall = app.tree.getVarByName('max');;
        var moveBallEnd =  app.tree.getVarByName('min');
        var ball = new SymVar(0,300,300,"#999",20);
        app.tree.push(ball);
        var divBall = new SymVarSeparation(moveBall,ball,1/50);
        k = app.insertRowVis();
        app.insertElementVis(k,divBall);
        var divBall2 = new SymVarMerge(ball,moveBallEnd,1/50);
        k = app.insertRowVis();
        app.insertElementVis(k,divBall2);
        k = app.insertRowVis();
        app.insertElementVis(k,divBall);
        var divBall3 = new SymVarOpenClose(moveBallEnd,true);
        app.insertElementVis(k,divBall3);
        k = app.insertRowVis();
        app.insertElementVis(k,divBall);
        var divBall4 = new SymVarOpenClose(moveBallEnd,false);
        app.insertElementVis(k,divBall4);
        var binOp = new SymBinOp('+',100,100,'binOp',0);
        app.tree.push(binOp);*/
        k = app.insertRowVis();
        expression.interpretation([300,400]);
        expression.operation(true);
        app.paint();
    });

    $("#SpeedMin").click(function() {
        app.speed -= 0.01;
        $("#SpeedMax").html('Speed (' + Math.ceil(app.speed*100)/100+')');
        $("#SpeedMin").html('Speed (' + Math.ceil(app.speed*100)/100+')');
    });

    $("#SpeedMax").click(function() {
        app.speed += 0.01;
        $("#SpeedMax").html('Speed (' + Math.ceil(app.speed*100)/100+')');
        $("#SpeedMin").html('Speed (' + Math.ceil(app.speed*100)/100+')');
    });
}

function initApplication() {
    var canvas, ctx;
    canvas = document.getElementById("canvas");
    if(canvas.getContext) {
        ctx = canvas.getContext("2d");
        canvas.width = document.body.offsetWidth*2/3;
        canvas.height = document.body.offsetHeight/10*9;
        app = new Application(ctx,canvas.width,canvas.height);
        DrawForVis(app.ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
    }
}
