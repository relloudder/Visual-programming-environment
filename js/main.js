var ctx;

$(document).ready(function(){
    initApplication();
    runInterface();
});

function runInterface(){
    $('#playMenu, #play').click(function(){
        var r = 12;
        var y = 50;
        var col = "#ff0000";
        for (var j = 1; j<=3; j++){
            DrawForVis.ball(ctx,50,y,r,col);
            var i = -85;
            var x = 100;
            while(i < 0){
                DrawForVis.alphaBall(ctx,x,y,r,col,i);
                x+=50;
                i+=10;
            }
            DrawForVis.halfBall(ctx,x,y,r,col);
            r*=1.25;
            y+=50;
        } 
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
        DrawForVis.back(ctx,"#7cb7e3","#cccccc",canvas.width,canvas.height);
    }
}