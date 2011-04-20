SynExpr = new Class({
    initialize: function() {
       this.symbolName = new SymbolName(0,0,'');
       this.show = false;
    },
    type: '',
    symbolName: null,
    show: null,
    getValue: function() {
        return 0;
    },
    setValue: function(value) {},
    getType : function() {
        return this.type;
    },
    setType: function (type) {
        this.type = type;
    },
    compareType: function(expr1,expr2) {
        if (expr1 == expr2) return expr1;
        if ((expr2 == 'real') && (expr1 == 'int')) return 'real';
        if ((expr2 == 'int') && (expr1 == 'real')) return 'real';
        if ((expr1 == 'char') || (expr2 == 'char')) return -1;
        if ((expr1 == 'booblean') || (expr2 == 'boolean')) return -1;
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
    },
    interpretation: function(pos) {
        var varBeg, varEnd, varGo, k;
        if (this instanceof SynBinOp) {
            var expression = this;
            this.getLeft().interpretation(this.symBinOp.getPosSuch(true));
            this.getRight().interpretation(this.symBinOp.getPosSuch(false));
        } else {
            k = app.treeVis.length - 1;
            varBeg = this.getSymbol();
            varBeg.jump = true;
            varEnd = new SymVar(varBeg.getValue(),this.getPosX(),this.getPosY(),'#999',varBeg.rVar);
            varEnd.setVisible(false);
            if ((this instanceof SynConstInt) || (this instanceof SynConstReal)) {
                varGo = new SymVarDown(varBeg,varEnd,0);
            } else {
                varGo = new SymVarSeparation(varBeg,varEnd,1/90);
                varGo.visualConnect = true;
            }
            app.tree.push(varEnd);
            app.insertElementVis(k,varGo);
        }
    },
    draw: function(ctx,tools) {
        this.symbolName.draw(ctx,tools);
    },
    findSynExpr: function(pos,tools) {
        var find = this.symbolName.findVar(pos,tools);
        if (find != -1) {
            return this;
        }
        return -1;
    },
    changePos: function(pos,tools) {
        this.symbolName.posX = pos[0]/tools.scale-tools.left;
        this.symbolName.posY = pos[1]/tools.scale-tools.top;
    },
    operation: function(visible) {
        var result,varNew,cVarL,cVarR,varGo,varGoL,varGoR,k,r;
        with(this) {
            if (this instanceof SynBinOp) {
            if (getBinOpType() == '+') {
                result = 1*getRight().operation(visible) + 1*getLeft().operation(visible);
            }
            if (getBinOpType() == '-') {
                result = getLeft().operation(visible) - getRight().operation(visible);
            }
            if (getBinOpType() == '*') {
                result = getLeft().operation(visible) * getRight().operation(visible);
            }
            if (getBinOpType() == '/') {
                result = getLeft().operation(visible) / getRight().operation(visible);
            }
            if (getBinOpType() == '<') {
                result = getLeft().operation(visible) < getRight().operation(visible);
            }
            if (getBinOpType() == '>') {
                result = getLeft().operation(visible) > getRight().operation(visible);
            }
            if (getBinOpType() == 'or') {
                result = getLeft().operation(visible) || getRight().operation(visible);
            }
            if (getBinOpType() == 'and') {
                result = getLeft().operation(visible) && getRight().operation(visible);
            }
            if (getBinOpType() == '<=') {
                result = getLeft().operation(visible) <= getRight().operation(visible);
            }
            if (getBinOpType() == '>=') {
                result = getLeft().operation(visible) >= getRight().operation(visible);
            }
            if (getBinOpType() == '<>') {
                result = getLeft().operation(visible) != getRight().operation(visible);
            }
            if (visible) {
                varGo = new SymVarOpenClose(symBinOp,false,false);
                cVarL = app.tree.findSymbolByPos([this.left.getPosX(),this.left.getPosY()]);
                cVarR = app.tree.findSymbolByPos([this.right.getPosX(),this.right.getPosY()]);
                varGoL = new SymVarDown(cVarL,symBinOp,0.001);
                varGoR = new SymVarDown(cVarR,symBinOp,0.001);
                varNew = new SymVar(result,symBinOp.getPosX(),symBinOp.getPosY(),'#999',Math.max(cVarR.rVar,cVarL.rVar));
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
        this.type = this.symbolArray.type;
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
        if (Math.ceil(result) != result) {
            alert('Error type of index of array '+this.left.name); error;
        }
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
        var index = this.right.getValue();
        if(index == null) {
            index = this.right.symbolName.text.substring(0,this.right.symbolName.text.length-1);
        }
        if(this.symbolArray instanceof SynArray) {
            name = name + index + ',';
            return this.symbolArray.getAllName(name);
        } else if(this.symbolArray instanceof SynRecord) {
            name = name + index + ']';
            return this.symbolArray.getAllName(name);
        }
        name = name + index + ']';
        return name;
    }
});

SynRecord = new Class({
    Extends: SynExpr,
    initialize: function(left,right) {
        this.left = left; //link for symRecord
        this.right = right; //record's fields
        this.type = right.type;
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
        while (item.right instanceof SynRecord) {
	        item  =  item.right;
	    }
	    var symb;
	    if (item.right instanceof SynArray) {
            symb = item.right.getSymbol();
        } else {
            symb = item.left.getItemByName(item.right.getName());
        }
	    return symb;
    },
    getName: function() {
        return this.left.name;
    },
    setItemLeft: function(item) {
        this.left = item;
        if (this instanceof SynRecord) {
            this.right.left = item.getItemByName(this.right.getName());
        }
    },
    getAllName: function(name) {
        if (this.right instanceof SynRecord) {
            name = name + '.' + this.right.left.name;
            return this.right.getAllName(name);
        } else if (this.right instanceof SynArray) {
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
        this.symbolName = new SymbolName(0,0,constValue);
        this.symConst = new SymConst(constValue,0,0,this.type);
    },
    constValue: null,
    symConst: null,
    getValue: function() {
        return this.constValue;
    },
    draw: function(ctx,tools) {
        this.symConst.draw(ctx,tools)
    },
    getPosX: function() {
        return this.symConst.posX;
    },
    getPosY: function() {
        return this.symConst.posY;
    },
    setPosX: function(pX) {
        this.symConst.posX = pX;
    },
    setPosY : function(pY) {
        this.symConst.posY = pY;
    },
    getSymbol : function(){
         return this.symConst;
    }
});

SynConstReal = new Class({
    Extends: SynConstInt,
    initialize: function(constValue) {
        this.parent(constValue);
        this.type = 'real';
        this.symConst.setType('real');
    }
});

SynBinOp = new Class({
    Extends: SynExpr,
    initialize: function(op,left,right) {
        this.symBinOp = op;
        this.left = left;
        this.right = right;
        this.binOp = op.val;
        this.symbolName = new SymbolName(0,0,'');
        var typeLeft = left.getType();
        var typeRight = right.getType();
        this.setType(this.compareType(typeLeft,typeRight));
        if (this.type == -1) {
            this.errorType  = 'Incompatible type ' + typeLeft + ' ' + typeRight;
        }
    },
    constValue: null,
    errorType: '',
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
            this.right.draw(ctx,tools);
        }
    },
    findSynExpr: function(pos,tools) {
        var find = this.symBinOp.findVar(pos,tools);
        if (find != -1) {
            return this;
        }
        find = this.left.findSynExpr(pos,tools);
        if (find != -1) {
            return find;
        }
        find = this.right.findSynExpr(pos,tools);
        if (find != -1) {
            return find;
        }
        return -1;
    },
    changePos: function(pos,tools) {
        this.setPosX(pos[0]/tools.scale-tools.left);
        this.setPosY(pos[1]/tools.scale-tools.top);
    },
    putPosition: function(pos) {
        this.parent(pos);
        var pos0 = this.getSymBinOp().getPosSuch(true);
        var pos1 = this.getSymBinOp().getPosSuch(false);
        this.getLeft().putPosition(pos0);
        this.getRight().putPosition(pos1);
    }
});

Statment = new Class ({
    Extends: SynExpr,
    initialize: function(symStatment) {
        this.symStatment = symStatment;
    },
    symStatment: null,
    getValue: function() {
        return this.constValue;
    },
    getPosY: function() {
        this.symStatment.getPosY();
    },
    getPosY: function() {
        this.symStatment.getPosX();
    },
    drawLine: function(ctx,tools) {},
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
    },
    getHeight: function() {
        return this.symStatment.getHeight();
    },
    putPosition: function(pos) {
        this.symStatment.posX = pos[0];
        this.symStatment.posY = pos[1];
    },
    findSynExpr: function(pos,tools) {
        var find = this.symStatment.findVar(pos,tools);
        if (find != -1) {
            return this;
        }
        return -1;
    }
});

SynBegin = new Class ({
    Extends: Statment,
    initialize: function(symStatment) {
        this.parent(symStatment);
    },
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
    },
    drawLine: function(ctx,tools) {},
    changePos: function(pos,tools) {
        this.symStatment.posY = pos[1]/tools.scale - tools.top;
        this.symStatment.posX = pos[0]/tools.scale - tools.left;
        app.tree.putPosition(pos);
    }
});

SynEnd = new Class ({
    Extends: Statment,
    initialize: function(symStatment) {
        this.parent(symStatment);
    },
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
    },
    drawLine: function(ctx,tools) {
        with(this.symStatment)
            DrawForVis(ctx).connect(tools.getAdjustedX(posX),tools.getAdjustedY(posY-height),
                tools.getAdjustedX(posX),tools.getAdjustedY(posY),6,'#555555');
    },
    changePos: function(pos,tools) {
        this.symStatment.posY = pos[1]/tools.scale - tools.top;
    }
});

StmtAssignment = new Class ({
    Extends: Statment,
    initialize: function(aLeft,aRight,symStatment) {
        this.parent(symStatment);
        this.aLeft = aLeft;
        this.aRight = aRight;
    },
    aLeft: null,
    aRight: null,
    getLeft: function() {
        return this.aLeft;
    },
    getRight: function() {
        return this.aRight;
    },
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
        if (this.aRight.show) this.aRight.draw(ctx,tools);
    },
    drawLine: function(ctx,tools) {
        with(this.symStatment) {
            DrawForVis(ctx).connect(tools.getAdjustedX(posX),tools.getAdjustedY(posY - height),
                tools.getAdjustedX(posX),tools.getAdjustedY(posY),6,'#555555');
        }
    },
    putPosition: function(pos) {
       this.parent(pos);
       pos[1]-=15;
       this.aRight.putPosition(pos);
    },
    changePos: function(pos,tools) {
        this.symStatment.posY = pos[1]/tools.scale - tools.top;
        var pos1 = [this.symStatment.posX,this.symStatment.posY - 15];
        this.aRight.putPosition(pos1);
    },
    findSynExpr: function(pos,tools) {
        var find = this.symStatment.findVar(pos,tools);
        if (find != -1) {
            return this;
        }
        find = this.aRight.findSynExpr(pos,tools);
        return find;
    },
    visualization: function(ctx,tools) {
        var k, varBeg, varGo, var1, st;
        with(this) {
            k = app.insertRowVis();
            st = new SymChangeStatment(this,0.4,1);
            app.insertElementVis(k,st);
            varBeg = aLeft.getSymbol();
            varBeg.jump = true;
            k = app.insertRowVis();
            aRight.interpretation([symStatment.getPosX(),symStatment.getPosY()]);
            //var1 = new SymVar(aRight.operation(true),symStatment.getPosX(),symStatment.getPosY()-10,'#999',varBeg.rVar);
			aRight.operation(true);
            var1 = app.tree.treeVar[app.tree.treeVar.length-1];
			k = app.insertRowVis();
            varGo = new SymVarMerge(var1,varBeg,1/90);
            app.insertElementVis(k,varGo);
            k = app.insertRowVis();
            st = new SymChangeStatment(this,-0.4,1);
            app.insertElementVis(k,st);
        }
        return -1;
    }
});