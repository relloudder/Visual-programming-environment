var app;

$(function() {
    initApplication();
    runInterface();
});

function runInterface() {
    $('#playMenu, #play').click(function() {
        app.tools.scale = 0.75;
        app.tools.left = 100;
        app.tools.top = 100;
        var ballName = new SymVarName('999',100,100,'int','max');
        app.tree.push(ballName);
        var ExArr = new SymVarName(100,200,150,'char','1');
        var ExArr1 = new SymVarName(0,0,0,'int','1');
        var newArray = new SymArray(100,250,4,2,ExArr,'first');
		newArray.inputRandom(100);
		var newArray1 = new SymArray(200,100,3,1,ExArr1,'max');
		newArray1.inputRandom(100);
		app.tree.push(newArray1);
        var record1 = new SymVarName('9',0,0,'real','r1');
        var record2 = new SymVarName('99',0,0,'int','r2');
        var record3 = new SymVarName('999',0,0,'char','r3');
        var newRecord = new SymRecord(100,300,'record','smth');
        newRecord.push(newArray);
        newRecord.push(record1);
        newRecord.push(record2);
        newRecord.inputRandom(10);
        app.tree.push(newRecord);
        var Ex2Array = new SymArray(400,250,3,1,newArray1,'second');
        Ex2Array.inputRandom(100);
        app.tree.push(Ex2Array);
        var Ex3Array = new SymArray(100,500,3,1,newRecord,'sec');
        Ex3Array.inputRandom(100);
        app.tree.push(Ex3Array);
        var ExArr4 = new SymVarName(4,200,150,'boolean','1');
        var newArray4 = new SymArray(400,100,4,2,ExArr4,'fourth');
        newArray4.inputRandom(2);
        app.tree.push(newArray4);
        app.tree.draw(app.ctx);
    });

    $('#stop, #new, #reset').click(function() {
        initApplication();
    });

    $("#canvas").mousedown(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        app.tree.varMove = app.tree.findByPos([x,y]);
        if (app.tree.varMove != -1) {
            app.tree.flagMove = true;
        }
    });

    $("#canvas").mousemove(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        if (app.tree.flagMove) {
	        app.tree.varMove.changePos(new Array(x,y));
	        app.tree.draw(app.ctx);
	    }
    });

    $("#canvas").mouseup(function(event) {
        app.tree.flagMove = false;
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
