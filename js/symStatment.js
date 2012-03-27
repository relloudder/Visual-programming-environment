SymStatment = new Class ({
    Extends: Symbol,
    initialize: function(pX,pY,color,value) {
        this.parent(pX,pY);
        this.value = value;
        this.color = 'rgba(102,204,153,1)';
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
    showVisual: true,
    posMaxX: 0,
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
    getPosMaxX: function() {
        return this.posMaxX;
    },
    setPosMaxX: function(val) {
        this.posMaxX+=val;
    },
    draw: function(ctx,tools) {},
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (((this.posX-3*this.r) < x) && ((this.posX-this.r+90) > x) && ((this.posY-20) < y) && ((this.posY+20) > y)) return this;
        return -1;
    }
});

SymBegin = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color) {
        this.parent(pX,pY,color,"");
        this.color = color;
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).roundedRect(tools.getAdjustedX(posX-30),tools.getAdjustedY(posY),
                tools.getAdjustedR(60),tools.getAdjustedR(20),4,color,"#C8C8C8",tools.getAdjustedR(3));
            DrawForVis(ctx).textStatment("begin",tools.getAdjustedX(this.posX-r*3/2),tools.getAdjustedY(this.posY+r/2),
                tools.getAdjustedR(12),8);
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
        this.color = color;
		this.height = 50;
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).roundedRect(tools.getAdjustedX(posX-r),tools.getAdjustedY(posY),
                tools.getAdjustedR(60),tools.getAdjustedR(20),4,color,"#C8C8C8",3);
            DrawForVis(ctx).textStatment("end",tools.getAdjustedX(this.posX-r),tools.getAdjustedY(this.posY+r/2),
                tools.getAdjustedR(12),4);
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
            DrawForVis(ctx).rect(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(r)/2,3,tools.getAdjustedR(6),color,value,0,transp,this.showVisual);
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
    initialize : function (pX, pY, color,value){
        this.parent(pX, pY, color, value);
        this.width = 100;
        this.heightStatment = 50;
        this.height = 70;
    },
    draw : function(ctx, tools){
        DrawForVis(ctx).conditionIf(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY),
            tools.getAdjustedR(this.r/4*3),2,tools.getAdjustedR(6),this.color,this.value,this.angleOfRotation,
            this.transp,tools.getAdjustedR(this.width),tools.getAdjustedR(this.heightStatment),this.showVisual,
            false,tools.getAdjustedR(this.getPosMaxX()));
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (((this.posX-this.r) < x) && ((this.posX+this.r) > x) && ((this.posY+this.r*0.5) < y) && ((this.posY+this.r*2) > y))
            return this;
        return -1;
    }
});

SymChangeStatment = new Class ({
    Extends: SymStatment,
    initialize: function(synSt,biggerOrSmaller,transp) {
        with(this) {
            numberOfMove  = Math.ceil(4/app.speed);
            if (numberOfMove < 10) numberOfMove = 10;
            if (numberOfMove > 25) numberOfMove = 25;
            maxNumberOfMove  = numberOfMove;
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
            if (synChange instanceof StmtAssignment) synChange.aRight.show = true;
            if (synChange instanceof StmtIf) synChange.exprIf.show = true;
            synChange.symStatment.r = r;
            synChange.symStatment.transp = transp;
            synChange.draw(ctx,tools);
            if (numberOfMove == maxNumberOfMove) {
                dr = r*dr/numberOfMove;
            }
            if (numberOfMove > 0) {
                numberOfMove--;
                r += dr;
                if (dr < 0) transp -= 0.01;
                return 1;
            } else {
                synChange.symStatment.color = 'rgba(49,79,79,1)';
                return 0;
            }
        }
    }
});

SymChangeIf = new Class ({
    Extends: SymStatment,
    initialize: function(aSymIf,aLeft,aRight,direct) {
        this.parent(aSymIf.posX,aSymIf.posY,aSymIf.color,aSymIf.getValue());
        with(this) {
            numberOfMove  = Math.ceil(4/app.speed);
            if (numberOfMove < 10) numberOfMove = 10;
            if (numberOfMove > 25) numberOfMove = 25;
            symChange = aSymIf;
            dfi = Math.PI/12/numberOfMove;
            if (!direct) dfi=-dfi;
            leftSt = aLeft;
            rightSt = aRight;
        }
    },
    dfi: null,
    numberOfMove: null,
    symChange: null,
    leftSt: null,
    rightSt: null,
    draw: function(ctx,tools) {
        with(this) {
            symChange.angleOfRotation = angleOfRotation;
            symChange.draw(ctx,tools);
            if (numberOfMove > 0) {
                var d = Math.abs(Math.cos(dfi))*symChange.width/80;;
                if (dfi > 0) {
                    leftSt.symStatment.height-=d;
                    rightSt.symStatment.height+=d;
                } else {
                    leftSt.symStatment.height+=d;
                    rightSt.symStatment.height-=d;
                }
                numberOfMove--;
                angleOfRotation+=dfi;
                return 1;
            } else  {
                return 0;
            }
        }
    }
});

SymRead = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color,value) {
        this.parent(pX,pY,color,value);
        this.heightStatment = 50;
        this.height = 70;
    },
    draw : function(ctx,tools) {
        with (this) {
            DrawForVis(ctx).oval(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(r)*2.5,3,
                tools.getAdjustedR(6),color,value,0,transp,true);
        }
    }
});

SymWrite = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color,value) {
        this.parent(pX,pY,color,value);
        this.heightStatment = 50;
        this.height = 70;
    },
    draw : function(ctx,tools) {
        with (this) {
            DrawForVis(ctx).oval(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(r)*2.5,3,
                tools.getAdjustedR(6),color,value,0,transp,this.showVisual);
        }
    }
});

SymWhile = new Class ({
    Extends: SymStatment,
    initialize : function (pX,pY,color,value){
        this.parent(pX, pY, color, value);
        this.width = 100;
        this.heightStatment = 50;
        this.height = 70;
    },
    draw : function(ctx, tools){
        DrawForVis(ctx).conditionWhile(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY),
            tools.getAdjustedR(this.r/4*3),2,tools.getAdjustedR(6),this.color,this.value,this.angleOfRotation,
            this.transp,tools.getAdjustedR(this.width),tools.getAdjustedR(this.heightStatment),this.showVisual,true,tools.getAdjustedR(this.getPosMaxX()));
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (((this.posX-this.r) < x) && ((this.posX+this.r) > x) && ((this.posY+this.r*0.5) < y) && ((this.posY+this.r*2) > y))
            return this;
        return -1;
    }
});
