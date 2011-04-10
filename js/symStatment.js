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
    },
    value: null,
	color: null,
	r: null,
	begX: null,
	begY: null,
	angleOfRotation: null,
    getValue: function() {
        return this.val;
    },
    setValue: function(value) {
        this.value = value;
    },
    getColor: function() {
        return this.color;
    },
    getR: function() {
        return this.r;
    },
    draw: function(ctx,tools) {}
});

SymProgram = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color,beginOrEnd,begX,begY) {
        this.parent(pX,pY,color,"",begX,begY);
        this.beginOrEnd = beginOrEnd;
    },
    beginOrEnd: null,
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).roundedRect(tools.getAdjustedX(posX),tools.getAdjustedY(posY),
                60,20,4,color,"#C8C8C8",3);
            if (beginOrEnd) {
                DrawForVis(ctx).text("begin",tools.getAdjustedX(this.posX)+25,tools.getAdjustedY(this.posY)+5,25,0,"");
            } else {
                DrawForVis(ctx).connect(tools.getAdjustedX(begX),tools.getAdjustedY(begY)+18,
                    tools.getAdjustedX(posX)+30,tools.getAdjustedY(posY),6,'#555555');
                DrawForVis(ctx).text("end",tools.getAdjustedX(this.posX)+25,tools.getAdjustedY(this.posY)+5,18,0,"");
            }

        }
    }
});

SymAssignment = new Class ({
    Extends: SymStatment,
    initialize: function(pX,pY,color,value,begX,begY) {
        this.parent(pX,pY,color,value,begX,begY);
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).connect(tools.getAdjustedX(begX),tools.getAdjustedY(begY)+18,
                tools.getAdjustedX(posX),tools.getAdjustedY(posY),6,'#555555');
            DrawForVis(ctx).rect(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedX(r)/2,3,6,color,value,0);
        }
    }
});

