var ctx;
var tree;

$(function() {
    initApplication();
    runInterface();
});

//for example
function runInterface() {
    $('#playMenu, #play').click(function() {
        tree = new VariableTree();
        var ballName = new SymVarName('999',100,100,'int','max');
        tree.push(ballName);
        var ExArr = new SymVarName(100,200,150,'char','1');
        var ExArr1 = new SymVarName(0,0,0,'int','1');
        var newArray = new SymArray(100,250,4,2,ExArr,'first');
		newArray.inputRandom(100);
		var newArray1 = new SymArray(200,100,3,1,ExArr1,'max');
		newArray1.inputRandom(100);
		tree.push(newArray1);
        var record1 = new SymVarName('9',0,0,'real','r1');
        var record2 = new SymVarName('99',0,0,'int','r2');
        var record3 = new SymVarName('999',0,0,'char','r3');
        var newRecord = new SymRecord(100,300,'record','smth');
        newRecord.push(newArray);
        newRecord.push(record1);
        newRecord.push(record2);
        //newRecord.push(record3);
        newRecord.inputRandom(10);
        tree.push(newRecord);
        var Ex2Array = new SymArray(400,250,3,1,newArray1,'second');
        Ex2Array.inputRandom(100);
        tree.push(Ex2Array);
        var Ex3Array = new SymArray(100,500,3,1,newRecord,'sec');
        Ex3Array.inputRandom(100);
        tree.push(Ex3Array);
        var ExArr4 = new SymVarName(4,200,150,'boolean','1');
        var newArray4 = new SymArray(400,100,4,2,ExArr4,'fourth');
        newArray4.inputRandom(2);
        tree.push(newArray4);
        tree.draw(ctx);
        var find = tree.findByPos([105,105]);
    });

    $('#stop, #new, #reset').click(function() {
        initApplication();
    });

    $("#canvas").mousedown(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        tree.varMove = tree.findByPos([x,y]);
        if (tree.varMove != -1) {
            tree.flagMove = true;
        }
    });

    $("#canvas").mousemove(function(event) {
        var x = event.pageX - $("#wCanvas").offset().left;
        var y = event.pageY - $("#wCanvas").offset().top;
        if (tree.flagMove) {
	        tree.varMove.changePos(new Array(x,y));
	        tree.draw(ctx);
	    }
    });

    $("#canvas").mouseup(function(event) {
        tree.flagMove = false;
    });
}

function initApplication() {
    var canvas;
    canvas = document.getElementById("canvas");
    if(canvas.getContext) {
        ctx = canvas.getContext("2d");
        canvas.width = document.body.offsetWidth*2/3;
        canvas.height = document.body.offsetHeight/10*9;
        DrawForVis(ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
    }
}
