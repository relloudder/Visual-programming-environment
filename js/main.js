var ctx;

$(function(){
    initApplication();
    runInterface();
});

//for example
function runInterface(){
    $('#playMenu, #play').click(function(){
        var ballInt = new SymVar('10',50,50,'blue',20);
        ballInt.draw(ctx);
        var ballName = new SymVarName('999',100,100,'green',18,'max');
        ballName.draw(ctx);
        var ExArr = new SymVarArrayIndex(100,200,150,'pink',20,'1');
        var newArray = new SymArray(100,250,5,1,ExArr,'first');
		newArray.inputRandom(100);
        newArray.draw(ctx);
        var record1 = new SymVarItemRecord('9',0,0,'green',18,'r1');
        var record2 = new SymVarItemRecord('99',0,0,'blue',18,'r2');
        var record3 = new SymVarItemRecord('999',0,0,'red',18,'r3');
        var newRecord = new SymRecord(400,400,'grey','smth');
        newRecord.push(record1);
        newRecord.push(record2);
        newRecord.push(record3);
        newRecord.draw(ctx);
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
