var app, xOld = 0, yOld = 0;
var expression;
var editor;

$(function() {
    initApplication();
    runInterface();
    document.getElementById("one").value = 1;
    document.getElementById("uno").value = 1;
    document.getElementById("two").value = 0.3;
    document.getElementById("dos").value = 0.3;
});

function runInterface() {
    $('#drawMenu, #draw').click(function() {
        var sp = app.speed;
        var zoom = app.tools.scale;
        initApplication();
        app.speed = sp;
        var errorProgram = $('#errorPanel');
        var outputProgram = $('#outputPanel');
        var lex = new LexicalAnalyzer(editor,errorProgram);
        lex.getProgram();
        app.tree.treeLocation(app.width,app.height);
        app.tree.treeStatment[0].putPosition([500,50]);
        document.getElementById("one").value = 1;
        document.getElementById("uno").value = 1;
        document.getElementById("two").value = 0.3;
        document.getElementById("dos").value = 0.3;
        app.translation = true;
        app.draw();
    });

    $('#new, #reset').click(function() {
        initApplication();
    });

    /*$('#zoomInMenu').click(function() {
        if( app.showInput) return;
        app.tools.scale += 0.01;
        app.draw();
    });

    $('#zoomOutMenu').click(function() {
        if (app.showInput) return;
        app.tools.scale -= 0.01;
        app.draw();
    });

    $("#rangeinput").change(function() {
        document.getElementById("rangevalue").value = (Math.round(this.value*100)/100).toFixed(2);
        app.tools.scale = (Math.round(this.value*100)/100).toFixed(2);
        app.draw();
    })*/

    $("#one").change(function() {
        document.getElementById('uno').innerHTML = 'Zoom: '+(Math.round(this.value*100)/100).toFixed(2);
        app.tools.scale = (Math.round(this.value*100)/100).toFixed(2);
        app.draw();
    })

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

    $("#play, #playMenu").click(function() {
        if (!app.translation) {
            alert('Draw program, please');
            return;
        }
        if (app.showInput) return;
        if (app.byStep == false) app.visualStatments = app.tree.treeStatment[0];
        app.byStep = false;
        app.pause = false;
        app.nextStatmentForVis().visualization(app.ctx,app.tools);
    });

    $('#pause, #pauseMenu').click(function() {
        if (app.showInput) return;
        app.pause = true;
        app.byStep = true;
    });

    /*$("#SpeedMin").click(function() {
        app.speed -= 0.01;
        $("#SpeedMax").html('Speed (' + Math.ceil(app.speed*100)/100+')');
        $("#SpeedMin").html('Speed (' + Math.ceil(app.speed*100)/100+')');
    });

    $("#SpeedMax").click(function() {
        app.speed += 0.01;
        $("#SpeedMax").html('Speed (' + Math.ceil(app.speed*100)/100+')');
        $("#SpeedMin").html('Speed (' + Math.ceil(app.speed*100)/100+')');
    });

    $("#rangeinput1").change(function() {
        document.getElementById("rangevalue1").value = (Math.round(this.value*100)/100).toFixed(2);
        app.speed = (Math.round(this.value*100)/100).toFixed(2);
    })*/

    $("#two").change(function() {
        document.getElementById('dos').innerHTML = 'Speed: '+(Math.round(this.value*100)/100).toFixed(2);
        app.speed = (Math.round(this.value*100)/100).toFixed(2);
    })

    $("#step, #stepMenu").click(function() {
        if (!app.translation) {
            alert('Draw program, please');
            return;
        }
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
