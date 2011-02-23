var ctx;

$(function(){
    initApplication();
    runInterface();
});

//for example
function runInterface(){
    $('#playMenu, #play').click(function(){
        var ballName = new SymVarName('999',100,100,'int','max');
        ballName.draw(ctx);
        var ExArr = new SymVarArrayIndex(100,200,150,'char','1');
        var ExArr1 = new SymVarArrayIndex(0,0,0,'int','1');
        var newArray = new SymArray(100,250,4,2,ExArr,'first');
		newArray.inputRandom(100);
		var newArray1 = new SymArray(100,250,3,1,ExArr1,'max');
		newArray1.inputRandom(100);
        //newArray.draw(ctx);
        var record1 = new SymVarItemRecord('9',0,0,'real','r1');
        var record2 = new SymVarItemRecord('99',0,0,'int','r2');
        var record3 = new SymVarItemRecord('999',0,0,'char','r3');
        var newRecord = new SymRecord(400,400,'record','smth');
        newRecord.push(newArray);
        newRecord.push(record1);
        newRecord.push(record2);
        //newRecord.push(record3);
        newRecord.inputRandom(10);
        newRecord.draw(ctx);
        var Ex2Array = new SymArray(450,150,3,1,newArray1,'second');
        Ex2Array.inputRandom(100);
        Ex2Array.draw(ctx);
        var Ex3Array = new SymArray(100,350,3,1,newRecord,'sec');
        Ex3Array.inputRandom(100);
        Ex3Array.draw(ctx);
    });

    $('#stop, #new, #reset').click(function(){
        initApplication();
    });
}

function initApplication(){
    var canvas;
    canvas = document.getElementById("firstStep");
    if(canvas.getContext){
        ctx = canvas.getContext("2d");
        canvas.width = document.body.offsetWidth*2/3;
        canvas.height = document.body.offsetHeight/10*9;
        DrawForVis(ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
    }
}
