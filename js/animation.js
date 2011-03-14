SymVarModifiable = new Class ({
    Extends: SymVar,
    initialize: function(val,pX,pY,cVar,rVar,moveNumber) {
        this.parent(val,pX,pY,cVar,rVar);
        this.numberMove = moveNumber;
        this.angleOfRotation = 0;
        this.angle = 0;        
    },
    numberMove: null,
    angleOfRotation: null,
    angle: 0
});

SymVarMove = new Class ({
    Extends: SymVarModifiable,
    initialize: function(val,pX,pY,cVar,rVar,endX,endY,g) {
        this.parent(val,pX,pY,cVar,rVar,60);
        this.aY = g; //acceleration
        this.aX = 0;
        this.vX = 0; //speed
        this.vY = 0;
        var t = this.numberMove*6;
        this.vX = (endX - pX - this.aX*Math.pow(t,2)/2)/t; 
        this.vY = (pY - endY + this.aY*Math.pow(t,2)/2)/t;
    },
    aY: 0,
    aX: 0,
    vY: 0,
    vX: 0,
    draw: function(ctx,tools) {
        with(this) with(tools) {
            var timerSpeed = 6;
            if(numberMove > 0) {
                DrawForVis(ctx).ball(getAdjustedX(posX),getAdjustedY(posY),getAdjustedR(rVar),colVar);
                DrawForVis(ctx).text(val,getAdjustedX(posX),getAdjustedY(posY),getAdjustedR(rVar),angle,'int');
                numberMove--;
                vY = vY - aY*timerSpeed;
                var hy = -(vY*timerSpeed + aY*Math.pow(timerSpeed,2)/2);
                vX = vX + aX*timerSpeed;
                var hx = vX*timerSpeed + aX*Math.pow(timerSpeed,2)/2;
                posX += hx;
                posY += hy; 
                angleOfRotation = Math.sqrt(Math.pow(hx,2) + Math.pow(hy,2))/rVar;
                if(hx > 0) angle += angleOfRotation; 
                else angle -= angleOfRotation;
                return 1;
            } else {
                return 0;
            }
        }
    }
});
