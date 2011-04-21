SymStatment = new Class ({
    Extends: Symbol,
    initialize: function(pX,pY,color,value) {
        this.parent(pX,pY);
        this.value = value;
	    this.color = color;
	    this.r = 25;
	    this.angleOfRotation = 0;
	    this.height = 100;
		this.width = 0;
    },
    value: null,
	color: null,
	r: null,
	angleOfRotation: null,
	height: null,
	width: null,
	heightStatment: 0,
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
    getWidth: function(){
        return this.width;
    },
    draw: function(ctx,tools) {}
});

SymBegin = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color) {
        this.parent(pX,pY,color,"");
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).roundedRect(tools.getAdjustedX(posX-30),tools.getAdjustedY(posY),
                tools.getAdjustedR(60),tools.getAdjustedR(20),4,color,"#C8C8C8",3);
            DrawForVis(ctx).text("begin",tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY+5),
			    tools.getAdjustedR(20),0,"");
        }
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (((this.posX-30) < x) && ((this.posX+30) > x) && ((this.posY-5) < y) && ((this.posY+15) > y)) {
            return this;
        }
        return -1;
    }
});

SymEnd = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color) {
        this.parent(pX,pY,color,"");
		this.height = 50;
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).roundedRect(tools.getAdjustedX(posX-r),tools.getAdjustedY(posY),
		        tools.getAdjustedR(60),tools.getAdjustedR(20),4,color,"#C8C8C8",3);
            DrawForVis(ctx).text("end",tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY+5),
		        tools.getAdjustedR(20),0,"");
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
		this.height = 70;
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).rect(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(r)/2,3,tools.getAdjustedR(6),color,value,0,transp);
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

SymIf = new Class ({
    Extends: SymStatment,
    initialize : function (pX,pY,color,value) {
        this.parent(pX,pY,color,value);
        this.width = 100;
        this.heightStatment = 50;
    },
    draw: function(ctx,tools) {
        DrawForVis(ctx).conditionIf(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY),tools.getAdjustedR(this.r/4*3),
            2,tools.getAdjustedR(6),this.color,this.value,this.angleOfRotation,this.transp,tools.getAdjustedR(this.width),
            tools.getAdjustedR(this.heightStatment));
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
