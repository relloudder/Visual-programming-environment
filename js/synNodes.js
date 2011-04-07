SynExpr = new Class({
    initialize: function() {
       this.symbolName = new SymbolName(0,0,'');
    },
    type: '',
    symbolName: null,
    getValue: function() {
        return 0;
    },
    setValue: function(value) {},
    getType : function() {
        return this.type;
    },
    getPosX: function() {
        return this.symbolName.posX;
    },
    getPosY: function() {
        return this.symbolName.posY;
    },
    setPosX: function(pX) {
        this.symbolName.posX = pX;
    },
    setPosY : function(pY) {
        this.symbolName.posY = pY;
    },
    putPosition: function(pos) {
        this.setPosX(pos[0]);
        this.setPosY(pos[1]);
        if(this instanceof SynBinOp) {
            var pos = this.getSymBinOp().getPosSuch(true);
            var pos1 = this.getSymBinOp().getPosSuch(false);
            this.getLeft().putPosition(pos);
            this.getRight().putPosition(pos1);
        }
    },
    interpretation: function(pos) {
        var varBeg, varEnd, varGo, k;
        if(this instanceof SynBinOp) {
            var expression = this;
            this.getRight().interpretation(this.symBinOp.getPosSuch(false));
            this.getLeft().interpretation(this.symBinOp.getPosSuch(true));
        } else {
            if((this instanceof SynConstInt) || (this instanceof SynConstReal)) {
                varBeg = app.tree.getVarByName(app.tree.treeVar,'1const');
                varBeg.setValue(this.getValue());
            } else varBeg = this.getSymbol();
            var  k = app.treeVis.length - 1;
            varEnd = new SymVar(varBeg.getValue(),this.getPosX(),this.getPosY(),'#999',varBeg.rVar);
            varEnd.setVisible(false);
            app.tree.push(varEnd);
            varGo = new SymVarSeparation(varBeg,varEnd,1/(90));
            app.insertElementVis(k,varGo);
        }
    },
    draw: function(ctx,tools) {
        this.symbolName.draw(ctx,tools);
    },
    findSynExpr: function(pos,tools) {
        var find = this.symbolName.findVar(pos,tools);
        if (find != -1) return this;
        return -1;
    },
    changePos: function(pos,tools) {
        this.symbolName.posX = pos[0]/tools.scale-tools.left;
        this.symbolName.posY = pos[1]/tools.scale-tools.top;
    },
    operation: function(visible) {
        var result,varNew,cVarL,cVarR,varGo,varGoL,varGoR,k,r;
        with (this) {
            if(this instanceof SynBinOp) {
            if(getBinOpType() == '+')
                result = 1*getRight().operation(visible) + 1*getLeft().operation(visible);
            if(getBinOpType() == '-')
                result = getLeft().operation(visible) - getRight().operation(visible);
            if(getBinOpType() == '*')
                result = getLeft().operation(visible) * getRight().operation(visible);
            if (getBinOpType() == '/')
                result = getLeft().operation(visible) / getRight().operation(visible);
            if(getBinOpType() == '<')
                result = getLeft().operation(visible) < getRight().operation(visible);
            if(getBinOpType() == '>')
                result = getLeft().operation(visible) > getRight().operation(visible);
            if(getBinOpType() == 'or')
                result = getLeft().operation(visible) || getRight().operation(visible);
            if(getBinOpType() == 'and')
                result = getLeft().operation(visible) && getRight().operation(visible);
            if(getBinOpType() == '<=')
                result = getLeft().operation(visible) <= getRight().operation(visible);
            if(getBinOpType() == '>=')
                result = getLeft().operation(visible) >= getRight().operation(visible);
            if(getBinOpType() == '<>')
                result = getLeft().operation(visible) != getRight().operation(visible);
            if(visible) {
                varGo = new SymVarOpenClose(symBinOp,false,false);
                cVarL = app.tree.findByPos([this.left.getPosX(),this.left.getPosY()],app.tools);
                cVarR = app.tree.findByPos([this.right.getPosX(),this.right.getPosY()],app.tools);
                varGoL = new SymVarDown(cVarL,symBinOp,0.001);
                varGoR = new SymVarDown(cVarR,symBinOp,0.001);
                varNew = new SymVar(result,symBinOp.getPosX(),symBinOp.getPosY(),'#999',cVarR.rVar);
                r = varNew.rVar;
                varNew.rVar = symBinOp.rVar;
                varNew.setVisible(false);
                app.tree.push(varNew);
                k = app.insertRowVis();
                app.insertElementVis(k,varGoR);
                app.insertElementVis(k,varGoL);
                app.insertElementVis(k,varGo);
                k = app.insertRowVis();
                varGo = new SymVarBiggerSmaller(varNew,r);
                varNew.rVar = r;
                app.insertElementVis(k,varGo);
            }
            return result;
        }
        return getValue();
    }}
});

SynVar = new Class({
    Extends: SynExpr,
    initialize: function(symVar) {
        this.symVar = symVar;
        this.type = symVar.type;
        this.symbolName = new SymbolName(0,0,symVar.name);
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
        this.symbolName = new SymbolName(0,0,this.getAllName(this.left.name+'['));
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
            return this.symbolArray.getSymbol();
        }
        return item;
    },
    setItemLeft: function(item) {
        this.left = item;
    },
    getAllName: function(name) {
        if(this.symbolArray instanceof SynArray) {
            name = name + this.right.getValue() + ',';
            return this.symbolArray.getAllName(name);
        }
        else if(this.symbolArray instanceof SynRecord) {
            name = name + this.right.getValue() + ']';
            return this.symbolArray.getAllName(name);
        }
        name = name + this.right.getValue() + ']';
        return name;
    }
});

SynRecord = new Class({
    Extends: SynExpr,
    initialize: function(left,right) {
        this.left = left; //link for symRecord
        this.right = right; //record's fields
        this.symbolName = new SymbolName(0,0,this.getAllName(this.left.name));
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
    setItemLeft: function(item) {
        this.left = item;
        if (this instanceof SynRecord)
            this.right.left = item.getItemByName(this.right.getName());
    },
    getAllName: function(name) {
        if(this.right instanceof SynRecord) {
            name = name + '.' + this.right.left.name;
            return this.right.getAllName(name);
        }
        else if(this.right instanceof SynArray) {
            name = name + '.' + this.right.left.name + '[';
            return this.right.getAllName(name);
        }
        name = name + '.' + this.right.getName();
        return name;
    }
});

SynConstInt = new Class({
    Extends: SynExpr,
    initialize: function(constValue) {
        this.constValue = constValue;
        this.type = 'int';
        this.symbolName = new SymbolName(200,200,constValue);
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
        this.binOp = op.val;
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
        this.right.setPosY(this.right.getPosY() - y + this.symBinOp.posY);
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
    getBinOpType: function() {
        return this.binOp;
    },
    draw: function(ctx,tools) {
        if (this.symBinOp.visible) {
        this.symBinOp.draw(ctx,tools);
        DrawForVis(ctx).connect(tools.getAdjustedX(this.getPosX()),tools.getAdjustedY(this.getPosY()),
            tools.getAdjustedX(this.left.getPosX()),tools.getAdjustedY(this.left.getPosY()),
            tools.getAdjustedR(20/5),this.symBinOp.colVar);
        DrawForVis(ctx).connect(tools.getAdjustedX(this.getPosX()),tools.getAdjustedY(this.getPosY()),
            tools.getAdjustedX(this.right.getPosX()),tools.getAdjustedY(this.right.getPosY()),
            tools.getAdjustedR(20/5),this.symBinOp.colVar);
        this.left.draw(ctx,tools);
        this.right.draw(ctx,tools);}
    },
    findSynExpr: function(pos,tools) {
        var find = this.symBinOp.findVar(pos,tools);
        if (find != -1) return this;
        find = this.left.findSynExpr(pos,tools);
        if (find != -1) return find;
        find = this.right.findSynExpr(pos,tools);
        if (find != -1) return find;
        return -1;
    },
    changePos: function(pos,tools) {
        this.setPosX(pos[0]/tools.scale-tools.left);
        this.setPosY(pos[1]/tools.scale-tools.top);
    }
});
