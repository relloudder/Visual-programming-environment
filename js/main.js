var app, xOld = 0, yOld = 0;

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
        app.tree.draw(app.ctx);
    });

    $('#stop, #new, #reset').click(function() {
        initApplication();
    });

    $('#zoomIn, #zoomInMenu').click(function() {
        app.tools.scale += 0.01;
        app.tree.draw(app.ctx);
    });

    $('#zoomOut, #zoomOutMenu').click(function() {
        app.tools.scale -= 0.01;
        app.tree.draw(app.ctx);
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
        if (app.flagCanvasMove){
            app.tools.setTop(app.tools.getTop() - (yOld - y)/app.tools.getScale());
            app.tools.setLeft(app.tools.getLeft() - (xOld - x)/app.tools.getScale());
            app.tree.draw(app.ctx);
        } else
        if (app.flagMove) {
	        app.tree.varMove.changePos(new Array(x,y),app.tools);
	        app.tree.draw(app.ctx);
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
