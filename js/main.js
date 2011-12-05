var app, xOld = 0, yOld = 0;
var expression;

$(function() {
    initApplication();
    runInterface();
});

function runInterface() {
    $('#playMenu, #draw').click(function() {
        var sp = app.speed;
        initApplication();
        app.speed = sp;
        var textProgram = $('#programPanel');
        var errorProgram = $('#errorPanel');
        var lex = new LexicalAnalyzer(textProgram,errorProgram);
        lex.getProgram();
        app.tree.treeLocation(app.width,app.height);
		app.tree.treeStatment[0].putPosition([500,10])
		app.paint();
    });

    $('#new, #reset').click(function() {
        initApplication();
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
            if (app.tree.varMove instanceof Statment) app.paint();
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
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        if (app.flagCanvasMove) {
            app.tools.setTop(app.tools.getTop() - (yOld - y)/app.tools.getScale());
            app.tools.setLeft(app.tools.getLeft() - (xOld - x)/app.tools.getScale());
			app.paint();
        } else if (app.flagMove) {
	        app.tree.varMove.changePos([x,y],app.tools);
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

    $("#play").click(function() {
        app.byStep = false;
        app.visualStatments = app.tree.treeStatment[0];
        app.nextStatmentForVis().visualization(app.ctx,app.tools);
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
    canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        canvas.width = $(window).width()*0.65;
        canvas.height = $(window).height()*0.895;
        app = new Application(ctx,canvas.width,canvas.height);
        DrawForVis(app.ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
    }
}
