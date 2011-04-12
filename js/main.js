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
        var c = new SymConst(1,600,500);
        app.tree.push(c);
		//app.tree.treeStatment.push(expression);
		app.tree.putPosition([500,10],[0,0]);
		app.paint();
    });

    $('#stop, #new, #reset').click(function() {
        initApplication();
    });

    $('#stop').click(function() {
        var end = new SymProgram(440,250,'#E8E8E8',false,470,200);
        end.draw(app.ctx,app.tools);
        var st2 = new SymAssignment(470,200,'#66CC99','j:=j*5',470,90);
        st2.draw(app.ctx,app.tools);
        var st1 = new SymAssignment(470,90,'#ff5544','i:=i+1',470,0);
        st1.draw(app.ctx,app.tools);
        var beg = new SymProgram(440,5,'#E8E8E8',true,0,0);
        beg.draw(app.ctx,app.tools);
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
	        if (app.tree.varMove instanceof SynExpr) {
	            app.tree.setPrev();
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
        k = app.insertRowVis();
        expression.interpretation([400,400]);
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
    $('#errorPanel').attr('value','');
    canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        canvas.width = document.body.offsetWidth*2/3;
        canvas.height = document.body.offsetHeight/10*9;
        app = new Application(ctx,canvas.width,canvas.height);
        DrawForVis(app.ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
    }
}
