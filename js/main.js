var app, xOld = 0, yOld = 0;
var expression;

$(function() {
    initApplication();
    runInterface();
});

function runInterface() {
    $('#playMenu, #play').click(function() {
        var sp = app.speed;
        initApplication();
        app.speed = sp;
        var textProgram = $('#programPanel');
        var errorProgram = $('#errorPanel');
        var lex = new LexicalAnalyzer(textProgram,errorProgram);
        lex.getProgram();
        app.tree.treeLocation(app.width,app.height);
		app.tree.treeStatment[0].changePos([500,10],app.tools);
		app.paint();
    });

    $('#new, #reset').click(function() {
        initApplication();
    });

    $('#stop').click(function() {
        DrawForVis(app.ctx).conditionIf(200,200,15,2,6,'#66CC99','a[i]>1',0,1,100,120);
    });

    $('#zoomIn, #zoomInMenu').click(function() {
        app.tools.scale += 0.01;
        app.paint();
    });

    $('#zoomOut, #zoomOutMenu').click(function() {
        app.tools.scale -= 0.01;
        app.paint();
    });

    $("#canvas").mousedown(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        app.tree.varMove = app.tree.findByPos([x,y],app.tools);
        if (app.tree.varMove != -1) {
            app.flagMove = true;
        }
        if (app.move) {
            app.flagCanvasMove = true;
        }
        xOld = x;
        yOld = y;
    });

    $("#canvas").mousemove(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        if (app.flagCanvasMove) {
            app.tools.setTop(app.tools.getTop() - (yOld - y)/app.tools.getScale());
            app.tools.setLeft(app.tools.getLeft() - (xOld - x)/app.tools.getScale());
			app.paint();
        } else if (app.flagMove) {
	        app.tree.varMove.changePos(new Array(x,y),app.tools);
	        if (app.tree.varMove instanceof Statment) {
	            app.tree.setPrev(app.tree.varMove.symStatment.posY);
	        }
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
        if (app.move) {
            $("#canvas").css("cursor","move");
        } else {
            $("#canvas").css("cursor","default");
        }
    });

    $("#move").click(function() {
        app.numberOfStatement += 2;
        app.tree.treeStatment[app.numberOfStatement].visualization(app.ctx,app.tools);
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
    $('#errorPanel').attr('value','');
    canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        canvas.width = $(window).width()*0.65;
        canvas.height = $(window).height()*0.895;
        app = new Application(ctx,canvas.width,canvas.height);
        DrawForVis(app.ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
    }
}
