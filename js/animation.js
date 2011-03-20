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
    createSymVar: function(ctx,tools) {
        return 0;
    },
    deleteSymVar: function(ctx,tools) {
        return 0;
    },
    draw: function(ctx,tools) {
        with(this) {
            var t = 6; //time of one move
            if(numberOfMove <= 0) return deleteSymVar(ctx,tools);
            if(createSymVar(ctx,tools) == 1) return 1;
            DrawForVis(ctx).ball(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
            DrawForVis(ctx).text(val,tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),angle,'int');
            numberOfMove--;
            vY = vY - aY*t;
            var hx = vX*t;
            var hy = -(vY*t + aY*Math.pow(t,2)/2);
            posX += hx;
            posY += hy;
            var angleOfRotation = Math.sqrt(Math.pow(hx,2) + Math.pow(hy,2))/rVar;
            if(hx > 0) angle += angleOfRotation;
            else angle -= angleOfRotation;
            return 1;
        }
    }
});

//movement from one object to another with g
SymVarInteraction = new Class ({
    Extends: SymVarMove,
    initialize: function(from,to,g) {
        this.parent(from.val,from.posX,from.posY,from.colVar,from.rVar,to.posX,to.posY,g);
        this.from = from;
        this.to = to;
        this.numberOfMerSep = 12; // number of steps of merge and separation
    },
    fromSymbol: null,
    to: null,
    numberOfMerSep: null,
    hXOfMerSep: null, //distance between steps on x
    hYOfMerSep: null,
    angleOfRotation: null
});

SymVarSeparation = new Class ({
    Extends: SymVarInteraction,
    initialize: function(from,to,g) {
        this.parent(from,to,g);
        this.angleOfRotation = Math.PI/(2*this.numberOfMerSep);
        this.angle = -Math.PI/2;
        var angleOfSeparation = Math.atan(-this.vY/this.vX);
		if(this.vX < 0) angleOfSeparation += Math.PI;
        this.hXOfMerSep = 2*this.rVar/this.numberOfMerSep*(Math.cos(angleOfSeparation));
        this.hYOfMerSep = 2*this.rVar/this.numberOfMerSep*(Math.sin(angleOfSeparation));
    },
    createSymVar: function (ctx,tools) {
        with(this) {
            if(numberOfMerSep > 0) {
                var angleChord = Math.atan(hYOfMerSep/hXOfMerSep);
                if(hXOfMerSep < 0) angle += Math.PI;
                DrawForVis(ctx).divBall(tools.getAdjustedX(from.posX),tools.getAdjustedY(from.posY),
                    tools.getAdjustedR(rVar),colVar,angle,angleChord,0);
                DrawForVis(ctx).divBall(tools.getAdjustedX(posX),tools.getAdjustedY(posY),
                    tools.getAdjustedR(rVar),colVar,angle,angleChord,Math.PI);
                posX += hXOfMerSep;
                posY += hYOfMerSep;
                numberOfMerSep--;
                angle += angleOfRotation;
                return 1;
            }
            else if(numberOfMerSep == 0) {
                from.setVisible(true);
                numberOfMerSep--;
                angle = 0;
                colVar ='#999';
                var t = numberOfMove*6;
                vX = (to.posX - posX)/t;
                vY = -(to.posY - posY - aY*Math.pow(t,2)/2)/t;
                return 0;
            }
            else return 0;
        }
    }
});
