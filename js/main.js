var ctx;

$(function(){
    initApplication();
    runInterface();
});

//for example
function runInterface(){
    $('#playMenu, #play').click(function(){
        var ballInt = new SymVar('10',200,250,'blue',20);
        ballInt.draw(ctx);
        var ballName = new SymVarName('999',300,300,'green',18,'max');
        ballName.draw(ctx);
        var ExArr = new SymVarArrayIndex(100,500,150,'pink',20,'1');
        var newArray = new SymArray(100,450,5,1,ExArr,'first');
		newArray.inputRandom(100);
        newArray.draw(ctx);
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
