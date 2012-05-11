var app, xOld = 0, yOld = 0;
var expression;

$(function() {
    initApplication();
    runInterface();
});

function runInterface() {
    $('#playMenu, #draw').click(function() {
        var sp = app.speed;
        var zoom = app.tools.scale;
        initApplication();
        app.speed = sp;
        var textProgram = $('#programPanel');
        var errorProgram = $('#errorPanel');
        var outputProgram = $('#outputPanel');
        var lex = new LexicalAnalyzer(textProgram,errorProgram);
        lex.getProgram();
        app.tree.treeLocation(app.width,app.height);
		app.tree.treeStatment[0].putPosition([500,10])
		app.draw();
    });

    $('#new, #reset').click(function() {
        initApplication();
    });

    $('#zoomIn, #zoomInMenu').click(function() {
        if( app.showInput) return;
        app.tools.scale += 0.01;
        app.draw();
    });

    $('#zoomOut, #zoomOutMenu').click(function() {
        if (app.showInput) return;
        app.tools.scale -= 0.01;
        app.draw();
    });

    $("#canvas").mousedown(function(event) {
        if (app.showInput) return;
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        app.tree.varMove = app.tree.findByPos([x,y],app.tools);
        if (app.tree.varMove != -1) {
            if (app.tree.varMove instanceof Statment) app.draw();
            else app.flagMove = true;
            if (app.tree.varMove instanceof StmtBlock)
                if (app.tree.varMove.mainBlock) app.flagMove = true;
        }
        if (app.move) {
            app.flagCanvasMove = true;
        }
        xOld = x;
        yOld = y;
    });

    $("#canvas").mousemove(function(event) {
        if (app.showInput) return;
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        if (app.flagCanvasMove) {
            var pos =[app.tools.getLeft() - (xOld - x)/app.tools.getScale(),app.tools.getTop() - (yOld - y)/app.tools.getScale()]
            app.tools.setTop(pos[1]);
            app.tools.setLeft(pos[0]);
            app.tree.putPosition([(xOld - x)/app.tools.getScale(),(yOld - y)/app.tools.getScale()]);
            app.draw();
        } else if (app.flagMove) {
	        app.tree.varMove.changePos([x,y],app.tools);
			app.draw();
	    }
	    xOld = x;
	    yOld = y;
    });

    $("#canvas").mouseup(function(event) {
        if (app.showInput) return;
        app.flagMove = false;
        app.flagCanvasMove = false;
    });

    $("#hand, #handMenu").click(function() {
        if (app.showInput) return;
        app.move = !app.move;
        if (app.move) {
            $("#canvas").css("cursor","move");
        } else {
            $("#canvas").css("cursor","default");
        }
    });

    $("#play").click(function() {
        if (app.showInput) return;
        app.byStep = false;
        app.pause = false;
        app.visualStatments = app.tree.treeStatment[0];
        app.nextStatmentForVis().visualization(app.ctx,app.tools);
    });

    $('#pause, #pauseMenu').click(function() {
        if (app.showInput) return;
        app.pause = true;
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

    $("#step").click(function() {
        if (app.showInput) return;
        app.pause = false;
        if (app.byStep == false)
            app.visualStatments = app.tree.treeStatment[0];
        app.byStep = true;
        if (app.byStep == true) {
            var next = app.nextStatmentForVis();
            if (next != null) next.visualization(app.ctx,app.tools);
        }
    });

    $("#editInput").keydown(function(event) {
        if (event.which == 13) {
            $("#input").css('display','none');
            app.showInput = false;
        };
    });
}

function initApplication() {
    var canvas, ctx;
    $('#errorPanel').attr('value','');
    $('#outputPanel').attr('value','');
    canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        canvas.width = $('#wCanvas').width();
        canvas.height = $('#wCanvas').height();
        app = new Application(ctx,canvas.width,canvas.height);
        DrawForVis(app.ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
        //DrawForVis(app.ctx).back("#FFFFFF","#FFFFFF",canvas.width,canvas.height);
    }
}
