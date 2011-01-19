var ctx;

$(function(){
    initApplication();
    runInterface();
});

//for example
function runInterface(){
    $('#playMenu, #play').click(function(){
        var r = 12;
        var y = 50;
        var col = "#ff0000";
        for (var j = 1; j<=3; j++){
            DrawForVis(ctx).ball(50,y,r,col);
            DrawForVis(ctx).text(Math.ceil(Math.random()*100),50,y,r,0);
            var i = -85;
            var x = 100;
            while(i < 0){
                DrawForVis(ctx).alphaBall(x,y,r,col,i);
                x+=50;
                i+=10;
            }
            DrawForVis(ctx).halfBall(x,y,r,col);
            r*=1.25;
            y+=50;
        }

        var ballInt = new SymVar('10',200,250,'blue');
        ballInt.draw(ctx);
        var ballName = new SymVarName('999',300,300,'green','max');
        ballName.draw(ctx);
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
