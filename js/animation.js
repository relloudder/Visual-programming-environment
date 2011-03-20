SymVarModifiable = new Class ({
    Extends: SymVar,
    initialize: function(val,pX,pY,cVar,rVar,numberOfMove) {
        this.parent(val,pX,pY,cVar,rVar);
        this.numberOfMove = numberOfMove;
        this.angle = 0;
    },
    numberOfMove: null,
    angle: 0
});

SymVarMove = new Class ({
    Extends: SymVarModifiable,
    initialize: function(val,pX,pY,cVar,rVar,endX,endY,g) {
        this.parent(val,pX,pY,cVar,rVar,60);
        this.aY = g; //acceleration
        var t = this.numberOfMove*6;
        this.vX = (endX - pX)/t;
        this.vY = (pY - endY + this.aY*Math.pow(t,2)/2)/t;
    },
    aY: 0,
    vY: 0,
    vX: 0,
    draw: function(ctx,tools) {
        with(this) {
            var t = 6; //time of one move
            if(numberOfMove <= 0) return 0;
            DrawForVis(ctx).ball(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
            DrawForVis(ctx).text(val,tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),angle,'int');
            numberOfMove--;
            vY = vY - aY*t;
            var hy = -(vY*t + aY*Math.pow(t,2)/2);
            posX += vX*t;
            posY += hy;
            var angleOfRotation = Math.sqrt(Math.pow(hx,2) + Math.pow(hy,2))/rVar;
            if(hx > 0) angle += angleOfRotation;
            else angle -= angleOfRotation;
            return 1;
        }
    }
});
?