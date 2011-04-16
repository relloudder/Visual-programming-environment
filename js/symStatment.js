SymStatment = new Class ({
    Extends: Symbol,
    initialize: function(pX,pY,color,value,begX,begY) {
        this.parent(pX,pY);
        this.value = value;
	    this.color = color;
	    this.r = 25;
	    this.begX = begX;
	    this.begY = begY;
	    this.angleOfRotation = 0;
	    this.height = 100;
    },
    value: null,
	color: null,
	r: null,
	begX: null,
	begY: null,
	angleOfRotation: null,
	height : null,
    getValue: function() {
        return this.val;
    },
    setValue: function(value) {
        this.value = value;
    },
    getHeight: function() {
        return this.height;
    },
    setHeight: function(h) {
        this.height = h;
    },
    getColor: function() {
        return this.color;
    },
    getR: function() {
        return this.r;
    },
    draw: function(ctx,tools) {}
});

SymBegin = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color,begX,begY) {
        this.parent(pX,pY,color,"",begX,begY);
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).roundedRect(tools.getAdjustedX(posX-r),tools.getAdjustedY(posY),
                60,20,4,color,"#C8C8C8",3);
            DrawForVis(ctx).text("begin",tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY+5),25,0,"");
        }
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (((this.posX-this.r) < x) && ((this.posX-this.r+60) > x) && ((this.posY-5) < y) && ((this.posY+15) > y)) {
            return this;
        }
        return -1;
    }
});

SymEnd = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color,begX,begY) {
        this.parent(pX,pY,color,"",begX,begY);
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).roundedRect(tools.getAdjustedX(posX-r),tools.getAdjustedY(posY),
                60,20,4,color,"#C8C8C8",3);
            //DrawForVis(ctx).connect(tools.getAdjustedX(begX),tools.getAdjustedY(begY),
            //        tools.getAdjustedX(posX),tools.getAdjustedY(posY),6,'#555555');
            DrawForVis(ctx).text("end",tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY+5),18,0,"");
        }
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (((this.posX-this.r) < x) && ((this.posX-this.r+60) > x) && ((this.posY-5) < y) && ((this.posY+15) > y)) {
            return this;
        }
        return -1;
    }
});

SymAssignment = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color,value,begX,begY) {
        this.parent(pX,pY,color,value,begX,begY);
    },
    draw: function(ctx,tools) {
        with(this) {
            //DrawForVis(ctx).connect(tools.getAdjustedX(begX),tools.getAdjustedY(begY),
            //    tools.getAdjustedX(posX),tools.getAdjustedY(posY),6,'#555555');
            DrawForVis(ctx).rect(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(r)/2,3,6,color,value,0,transp);
        }
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (((this.posX-3*this.r) < x) && ((this.posX-this.r+90) > x) && ((this.posY-20) < y) && ((this.posY+20) > y)) {
            return this;
        }
        return -1;
    }
});

SymChangeStatment = new Class ({
    Extends: SymStatment,
    initialize: function(synSt,biggerOrSmaller,transp) {
        with(this) {
            numberOfMove = 20;
            maxNumberOfMove = 20;
            synChange = synSt;
            r = synChange.symStatment.r;
            dr = biggerOrSmaller;
            transp = transp;
            if (dr < 0) {
                r = (1 - dr)*r;
                dr = dr/(1 - dr);
            }
        }
    },
    dr: null,
    numberOfMove: null,
    maxNumberOfMove: null,
    synChange: null,
    draw: function(ctx,tools) {
        with(this) {
            synChange.aRight.show = true;
            synChange.symStatment.r = r;
            synChange.symStatment.transp = transp;
            synChange.draw(ctx,tools);
            if (numberOfMove == maxNumberOfMove) {
                dr = r*dr/numberOfMove;
            }
            if (numberOfMove > 0) {
                numberOfMove--;
                r += dr;
                if (dr < 0) transp -= 0.02;
                return 1;
            } else {
                return 0;
            }
        }
    }
});
