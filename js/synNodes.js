SynExpr = new Class({
    initialize: function() {},
    type: '',
    getValue: function() {
        return 0;
    },
    setValue: function(value) {},
    getType : function() {
        return this.type;
    }
});

SynVar = new Class({
    Extends: SynExpr,
    initialize: function(symVar) {
        this.symVar = symVar;
        this.type = symVar.type;
    },
    symVar: null,
    getValue: function() {
        return this.symVar.getValue();
    },
    setValue: function(value) {
        this.symVar.setValue(value);
    },
    getSymbol: function() {
        return this.symVar;
    },
    getName: function() {
        return this.symVar.name;
    }
});

SynArray = new Class({
    Extends: SynExpr,
    initialize: function(left,right,symbol) {
        this.left = left;
        this.right = right;
        this.symbolArray = symbol;
    },
    left: null, //link for synArray
    right: null, //expression for index
    symbolArray: null, //type of array's items
    getValue: function() {
        return this.getSymbol().getValue();
    },
    getName: function() {
        return this.left.name;
    },
    getType: function() {
        return this.symbolArray.getType();
    },
    getSymbol: function() { //returns sym from treeVar
        var result = this.right.operation(false); //create calculating index expression
        var item = this.left.getItemArrByNum(result);
        if((this.symbolArray instanceof SynArray)||(this.symbolArray instanceof SynRecord)) {
            this.symbolArray.setItemLeft(item);
            return this.symbolArr.getSymbol();
        }
        return item;
    },
    setItemLeft: function(item) {
        this.left = item;
    }
});

SynRecord = new Class({
    Extends: SynExpr,
    initialize: function(left,right) {
        this.left = left; //link for synRecord
        this.right = right; //record's fields
    },
    left: null,
    right: null,
    getValue: function() {
        return this.getSymbol().getValue();
    },
    getType: function() {
        return this.right.getType();
    },
    getSymbol: function() {
        var item = this;
        while(item.right instanceof SynRecord)
	        item  =  item.right;
	    var symb;
	    if(item.right instanceof SynArray)
            symb = item.right.getSymbol();
	    else symb = item.left.getItemByName(item.right.getName());
	    return symb;
    },
    getName: function() {
        return this.left.name;
    },
    setItemLeft = function(item) {
        this.left = item;
        if (this instanceof SynRecord)
            this.right.left = item.getItemByName(this.right.getName());
    }
});

SynConstInt = new Class({
    Extends: SynExpr,
    initialize: function(constValue) {
        this.constValue = constValue;
        this.type = 'int';
    },
    constValue: null,
    getValue: function() {
        return this.constValue;
    }
});

SynConstReal = new Class({
    Extends: SynConstInt,
    initialize: function(constValue) {
        this.type = 'real';
    }
});

SynBinOp = new Class({
    Extends: SynExpr,
    initialize: function(op,left,right) {
        this.symBinOp = op;
        this.left = left;
        this.right = right;
        this.binOp = op.value;
    },
    constValue: null,
    getValue: function() {
        return this.constValue;
    },
    left: null,
    right: null, //SynExpr
    binOp: null, //TBinOpType
    symBinOp: null, // Symbol
    setPosX: function(pX) {
        var x = this.symBinOp.posX;
        this.symBinOp.posX = pX;
        this.left.setPosX(this.left.getPosX() - x + this.symBinOp.posX);
        this.right.setPosX(this.right.getPosX() - x + this.symBinOp.posX);
    },
    setPosY: function(pY) {
        var y = this.symBinOp.posY;
        this.symBinOp.posY = pY;
        this.left.setPosY(this.left.getPosY() - y + this.symBinOp.posY);
        this.right.setPosY(this.right.getPosY() - y +this.symBinOp.posY);
    },
    getPosX: function() {
        return this.symBinOp.posX;
    },
    getPosY: function() {
        return this.symBinOp.posY;
    },
    getSymBinOp: function() {
        return this.symBinOp ;
    },
    getRight: function() {
        return this.right;
    },
    getLeft: function() {
        return this.left;
    },
    draw: function(ctx,tools) {
        this.symBinOp.draw(ctx,tools);
        DrawForVis(cts).connect(tools.getAdjustedX(this.getPosX()),tools.getAdjustedY(this.getPosY()),
            tools.getAdjustedX(this.left.getPosX()),tools.getAdjustedY(this.left.getPosY()),
            tools.getAdjustedR(20/5),this.symBinOp.colVar);
        DrawForVis(ctx).connect(tools.getAdjustedX(this.getPosX()),tools.getAdjustedY(this.getPosY()),
            tools.getAdjustedX(this.right.getPosX()),tools.getAdjustedY(this.right.getPosY()),
            tools.getAdjustedR(20/5),this.symBinOp.colVar);
        this.left.draw(ctx,tools);
        this.right.draw(ctx,tools);
    }
});




