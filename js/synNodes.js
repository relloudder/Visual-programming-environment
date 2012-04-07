SynExpr = new Class({
    initialize: function() {
       this.symbolName = new SymbolName(0,0,'');
       this.show = false;
    },
    type: '',
    errorType: '',
    symbolName: null,
    selectPos: null,
    show: null,
    setVisible: function (flag) {},
    getValue: function() {
        return 0;
    },
    clearText: function(text) {
        //while(text.indexOf(' ',0) != -1)
        //    text = text.substr(0,text.indexOf(' ',0))+text.substr(text.indexOf(' ',0)+1,text.length-1);
        if (text.indexOf('{',0) != -1)
            text = text.substr(0,text.indexOf('{',0))+text.substr(text.indexOf('}',0)+1,text.length-1);
        return text;
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
        if ((expr2 == 'char') && (expr1 == 'string')) return 'string';
        if ((expr2 == 'string') && (expr1 == 'char')) return 'string';
        return -1;
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
            this.getLeft().interpretation(this.symBinOp.getPosSuch(true));
            this.getRight().interpretation(this.symBinOp.getPosSuch(false));
        } else if (this instanceof SynCallFunction) {
            k = app.treeVis.length - 1;
            for (var i = 0; i < this.listFactParam.length; i++)
                if (this.listFactParam[i] instanceof SynBinOp) this.listFactParam[i].interpretation();
            else  if (this.listFactParam[i] instanceof SynCallFunction) this.listFactParam[i].interpretation();
            else {
                varBeg = this.listFactParam[i].getSymbol();
                varBeg.jump = true;
                var pos = this.symCallFunction.getPosSuch(i+1);
                varEnd = new SymVar(varBeg.getValue(),pos[0],pos[1],'#999',varBeg.rVar);
                varEnd.setVisible(false);
                app.tree.push(varEnd);
                if ((this.listFactParam[i] instanceof SynConstInt) || (this.listFactParam[i] instanceof SynConstReal)) {}
                else {
                    varGo = new SymVarSeparation(varBeg,varEnd,1/90);
                    varGo.visualConnect = true;
                    app.insertElementVis(k,varGo);
                }
            }
        } else {
            k = app.treeVis.length - 1;
            varBeg = this.getSymbol();
            varBeg.jump = true;
            if (( varBeg instanceof SymString) || (varBeg instanceof SynConstString)) {
                var size = varBeg.getValue().length;
                varEnd = new SymString(this.getPosX(),this.getPosY(),size-1,size-1,1);
                varEnd.setValue(varBeg.getValue());
            }
            else varEnd = new SymVar(varBeg.getValue(),this.getPosX(),this.getPosY(),'#999',varBeg.rVar);
            varEnd.setVisible(false);
            if ((this instanceof SynConstInt) || (this instanceof SynConstReal) || (this instanceof SynConstString)) {}
            else {
                varGo = new SymVarSeparation(varBeg,varEnd,1/90);
                varGo.visualConnect = true;
                app.insertElementVis(k,varGo);
            }
            app.tree.push(varEnd);
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
    operation: function(visible,type) {
        var result,varNew,cVarL,cVarR,varGo,varGoL,varGoR,k,r,part1,part2;
        with(this) {
            if (this instanceof SynBinOp) {
                part2 = getRight().operation(visible,type);
                part1 = getLeft().operation(visible,type);
                if ((type != 'char') && (type != 'string')) {
                    part1 = part1*1;
                    part2 = part2*1;
                }
                if (getBinOpType() == '+') result = part1 + part2;
                if (getBinOpType() == '-') result = part1 - part2;
                if (getBinOpType() == '*') result = part1 * part2;
                if (getBinOpType() == '/') result = part1 / part2;
                if (getBinOpType() == '<') result = part1 < part2;
                if (getBinOpType() == '>') result = part1 > part2;
                if (getBinOpType() == 'or') result = part1 || part2;
                if (getBinOpType() == 'and') result = part1 && part2;
                if (getBinOpType() == '<=') result = part1 <= part2;
                if (getBinOpType() == '>=') result = part1 >= part2;
                if (getBinOpType() == '<>') result = part1 != part2;
                if (getBinOpType() == '=') result = part1 == part2;
                if (getBinOpType() == 'mod') result = part1 - Math.floor(part1/part2)*part2;
                if (getBinOpType() == 'div') result = Math.floor(part1/part2);
                if (visible) {
                    varGo = new SymVarOpenClose(symBinOp,false,false);
                    cVarL = app.tree.findSymbolByPos([this.left.getPosX(),this.left.getPosY()]);
                    cVarR = app.tree.findSymbolByPos([this.right.getPosX(),this.right.getPosY()]);
                    varGoL = new SymVarDown(cVarL,symBinOp,0.001);
                    varGoR = new SymVarDown(cVarR,symBinOp,0.001);
                    if ((type != 'char') && (type!='string')) {
                        varNew = new SymVar(result,symBinOp.getPosX(),symBinOp.getPosY(),'#999',Math.max(cVarR.rVar,cVarL.rVar));
                    } else {
                        varNew = new SymString(symBinOp.getPosX(),symBinOp.getPosY(),result.length-1,result.length-1,1);
                        varNew.setValue(result);
                    }
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
            } else if (this instanceof SynCallFunction) {
                var part = [];
                for (var i = 0; i < listFactParam.length; i++)
                    part.push(listFactParam[i].operation(visible,'int'));
                if (symCallFunction.name == 'random') result = Math.floor(Math.random()*part[0]);
                else {
                    var name = (symCallFunction.name == 'trunc')?'floor':symCallFunction.name;
                    result = eval('Math.'+name+'('+part[0]+')');
                }
                if (visible) {
                    varGo = new SymChangeCallFunction(symCallFunction,symCallFunction.rVar*2,0);
                    r = symCallFunction.rVar;
                    k = app.insertRowVis();
                    for (var i = 0; i < listFactParam.length; i++) {
                        cVarL = app.tree.findSymbolByPos([this.listFactParam[i].getPosX(),this.listFactParam[i].getPosY()]);
                        varGoL = new SymVarDown(cVarL,symCallFunction,0.001);
                        app.insertElementVis(k,varGoL);
                    }
                    app.insertElementVis(k,varGo);
                    varNew = new SymVar(result,symCallFunction.getPosX(),symCallFunction.getPosY(),'#999',varGoL.rVar);
                    varNew.setVisible(false);
                    app.tree.push(varNew);
                    k = app.insertRowVis();
                    varGo = new SymVarBiggerSmaller(varNew,r);
                    app.insertElementVis(k,varGo);
                }
                return result;
            }
            return getValue();
        }
    }
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
        this.symbolName = new SymbolName(0,0,this.left.name+'[');
    },
    left: null, //link for synArray
    right: null, //expression for index
    symbolArray: null, //type of array's items
    setValue: function(value) {
        this.getSymbol().setValue(value);
    },
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
        var result = this.right.operation(false,'int'); //create calculating index expression
        if (Math.ceil(result) != result) {
            alert('Error type of index of array '+this.left.name); error;
        }
        this.symbolName.text=this.getAllName(this.left.name+'[');
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
        var index = this.right.operation(false,'int');
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
        if (this.symbolName.visible) {
            this.symConst.draw(ctx,tools);
        }
    },
    getPosX: function() {
        return this.symConst.posX;
    },
    getPosY: function() {
        return this.symConst.posY;
    },
    setPosX: function(pX) {
        this.symConst.setPosX(pX);
    },
    setPosY : function(pY) {
        this.symConst.setPosY(pY);
    },
    getSymbol : function(){
         return this.symConst;
    }
});

SynConstString = new Class({
    Extends: SynConstInt,
    initialize: function(constValue) {
        this.constValue = constValue.substr(1,constValue.length-2);
        if (this.constValue.length == 1) this.type = 'char';
        else this.type = 'string';
        this.symbolName = new SymbolName(0,0,constValue);
        this.symConst = new SymString(0,0,constValue.length-1,constValue.length-1,1);
        this.symConst.setValue(constValue);
    },
    getValue: function() {
        return this.symConst.getValue();
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
        if (this.type == 'char') this.type = 'string';
        if (this.type == -1) this.errorType  = 'Incompatible type ' + typeLeft + ' ' + typeRight;
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
    },
    setVisible: function (flag) {
        this.symBinOp.visible = flag;
        this.symBinOp.val = this.binOp;
        this.getLeft().setVisible(flag);
        this.getRight().setVisible(flag);
    }
});

SynCallFunction = new Class({
    Extends: SynExpr,
    initialize: function(symbol,listFactParam) {
        this.symbolName = new SymbolName(0,0,'');
        this.symCallFunction = symbol.clone();
        this.symCallFunction.visible = true;
        this.listFactParam = listFactParam;
        this.type = this.symCallFunction.type;
        for (var i = 0; i < this.listFactParam.length; i++)
            if (this.compareType(this.listFactParam[i].type,this.symCallFunction.listParam[i]) == -1)
                this.errorType = 'Incompatible type ' + this.listFactParam[i].type + ' ' + this.symCallFunction.listParam[i];
    },
    symCallFunction: null,
    listFactParam: null,
    draw: function(ctx,tools) {},
    getPosX: function() {
        return this.symCallFunction.posX;
    },
    getPosY: function() {
        return this.symCallFunction.posY;
    },
    setPosX: function(pX) {
        var x = this.symCallFunction.posX;
        this.symCallFunction.posX = pX;
        for (var i = 0; i < this.listFactParam.length; i++)
            this.listFactParam[i].setPosX(this.listFactParam[i].getPosX() - x + this.symCallFunction.posX);
    },
    setPosY: function(pY) {
        var y = this.symCallFunction.posY;
        this.symCallFunction.posY = pY;
        for (var i = 0; i < this.listFactParam.length; i++)
            this.listFactParam[i].setPosY(this.listFactParam[i].getPosY() - y + this.symCallFunction.posY);
    },
    putPosition: function(pos) {
        this.parent(pos);
        for (var i = 0; i < this.listFactParam.length; i++)
            this.listFactParam[i].putPosition(this.symCallFunction.getPosSuch(i+1));
    },
    getSymbol: function() {
        return this.listFactParam[0].getSymbol();
    },
    draw: function(ctx,tools) {
        if (this.symCallFunction.visible) {
            for (var i = 0; i < this.listFactParam.length; i++) {
                DrawForVis(ctx).connect(tools.getAdjustedX(this.getPosX()),tools.getAdjustedY(this.getPosY()),
                    tools.getAdjustedX(this.listFactParam[i].getPosX()),tools.getAdjustedY(this.listFactParam[i].getPosY()),
                    tools.getAdjustedR(20/4),'black');
                this.listFactParam[i].draw(ctx,tools);
            }
            this.symCallFunction.draw(ctx,tools);
        }
    },
    setVisible: function(flag) {
        this.symCallFunction.visible = true;
        this.symCallFunction.rVar = 20;
        this.symCallFunction = this.symCallFunction.clone();
    }
});

Statment = new Class ({
    Extends: SynExpr,
    initialize: function(symStatment,pos) {
        this.selectPos = pos;
        this.symbolName = new SymbolName(0,0,'');
        this.symStatment = symStatment;
        if (pos instanceof Array) {
            var program = $('#programPanel');
            this.symStatment.value = this.clearText(program.val().substr(this.selectPos[0],this.selectPos[1]-this.selectPos[0]));
        }
    },
    parentStatment: null,
    symStatment: null,
    showVisual: true,
    getValue: function() {
        return this.constValue;
    },
    getPosY: function() {
        return this.symStatment.getPosY();
    },
    getPosX: function() {
        return this.symStatment.getPosX();
    },
    drawLine: function(ctx,tools) {
        with (this.symStatment)
        DrawForVis(ctx).connect(tools.getAdjustedX(posX),tools.getAdjustedY(posY-height),
            tools.getAdjustedX(posX),tools.getAdjustedY(posY), tools.getAdjustedR(6),'#555555');
    },
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
    },
    getHeight: function() {
        return this.symStatment.getHeight();
    },
    getHeightStatment: function() {
        return this.symStatment.heightStatment;
    },
    setHeightStatment: function(val) {
        this.symStatment.heightStatment = val;
    },
    getWidth: function(){
	    return this.symStatment.width;
    },
    setWidth: function(width) {
        this.symStatment.width = width;
    },
    putPosition: function(pos) {
        this.symStatment.posX = pos[0];
        this.symStatment.posY = pos[1];
    },
    findSynExpr: function(pos,tools) {
        var find = this.symStatment.findVar(pos,tools);
        if (find != -1) {
            this.showVisual =! this.showVisual;
            this.symStatment.showVisual = this.showVisual;
            return this;
        }
        return -1;
    },
    treeLocation: function() {},
    changePosStatment: function(pos) {
        this.symStatment.posX -= pos[0];
        this.symStatment.posY -= pos[1];
    },
    visualization: function(ctx,tools) {
        var y = this.selectPos[1];
        var program = $('#programPanel');
        while (program.val()[y-1] == ' ') y--;
        program.get(0).setSelectionRange(this.selectPos[0],y);
    },
    goStatment: function() {
        this.symStatment.color =  'rgba(102,204,153,1)';
        this.symStatment.angleOfRotation = 0;
        this.symStatment.transp = 1;
    }
});

SynStop = new Class ({
    Extends: Statment,
        initialize: function(pos) {
        this.parent(new SymStatment(0,0,'red','1null'),pos);
        this.symStatment.height = 0;
        this.symStatment.width = 0;
    }
});

SynEnd = new Class ({
    Extends: Statment,
    initialize: function(symStatment) {
        this.parent(symStatment);
        this.symStatment.height = 32;
    },
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
    },
    changePos: function(pos,tools) {
        this.symStatment.posY = pos[1]/tools.scale - tools.top;
    },
    visualization: function(ctx,tools) {
        app.paint();
    },
    goStatment: function() {}
});

StmtAssignment = new Class ({
    Extends: Statment,
    initialize: function(aLeft,aRight,symStatment,pos) {
        this.parent(symStatment,pos);
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
    putPosition: function(pos) {
       this.parent(pos);
       this.aRight.putPosition([pos[0],pos[1]-20]);
    },
    changePos: function(pos,tools) {
        this.symStatment.posY = pos[1]/tools.scale - tools.top;
        var pos1 = [this.symStatment.posX,this.symStatment.posY - 15];
        this.aRight.putPosition(pos1);
    },
    visualization: function(ctx,tools) {
        this.parent(ctx,tools);
        var k, varBeg, varGo, var1, st;
        with(this) {
            if (showVisual) {
                this.aRight.setVisible(true);
                k = app.insertRowVis();
                st = new SymChangeStatment(this,0.4,1);
                app.insertElementVis(k,st);
                varBeg = aLeft.getSymbol();
                varBeg.jump = true;
                k = app.insertRowVis();
                aRight.interpretation([symStatment.getPosX(),symStatment.getPosY()]);
                aRight.operation(true,varBeg.type);
                aRight.symbolName.visible = false;
                var1 = app.tree.treeVar[app.tree.treeVar.length-1];
                k = app.insertRowVis();
                varGo = new SymVarMerge(var1,varBeg,1/90);
                app.insertElementVis(k,varGo);
                k = app.insertRowVis();
                st = new SymChangeStatment(this,-0.4,1);
                app.insertElementVis(k,st);
            } else {
                var setVal = aRight.operation(false,aLeft.type);
                if (aLeft.type == 'string') aLeft.getSymbol().setNewString(setVal);
                else aLeft.setValue(setVal);
                symStatment.color = 'rgba(49,79,79,1)';
            }
        }
        app.paint();
        return -1;
    },
    changePosStatment: function(pos,tools) {
        this.parent(pos);
        this.aRight.putPosition([this.symStatment.posX,this.symStatment.posY-20])
    }
});

StmtIf = new Class({
    Extends: Statment,
    initialize: function(exprIf,sThen,sElse,symStatment,pos) {
        this.parent(symStatment,pos);
        this.exprIf = exprIf;
        this.stmtThen = sThen;
        this.stmtElse = sElse;
        this.begThenHeight = this.stmtThen.symStatment.height;
        this.begElseHeight = this.stmtElse.symStatment.height;
        this.symStatment.value = this.symStatment.value.replace('if','');
	},
	result: true,
    exprIf: null,
    stmtThen: null,
    stmtElse: null,
    begThenHeight: null,
    begElseHeight: null,
    getExprIf: function() {
        return this.exprIf;
    },
    drawLine: function(ctx,tools) {
        with(this.symStatment) {
            DrawForVis(ctx).connect(tools.getAdjustedX(posX),tools.getAdjustedY(posY - height),
                tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(6),'#555555');
            this.stmtThen.drawLine(ctx,tools);
            DrawForVis(ctx).connect(tools.getAdjustedX(posX+width),tools.getAdjustedY(this.getPosLastThen()),
                tools.getAdjustedX(posX+width),tools.getAdjustedY(posY + heightStatment),tools.getAdjustedR(6),'#555555');
            this.stmtElse.drawLine(ctx,tools);
            DrawForVis(ctx).connect(tools.getAdjustedX(posX-width),tools.getAdjustedY(this.getPosLastElse()-5),
                tools.getAdjustedX(posX-width),tools.getAdjustedY(posY + heightStatment),tools.getAdjustedR(6),'#555555')  ;
        }
    },
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
        if (this.exprIf.show) this.exprIf.draw(ctx,tools);
        this.stmtThen.draw(ctx,tools);
        if (this.stmtElse != null) this.stmtElse.draw(ctx,tools);
    },
    putPosition: function(pos) {
        this.parent(pos);
        var x = pos[0] + this.getWidth();
        var y = pos[1] + this.stmtThen.getHeight();
        this.exprIf.putPosition([pos[0],pos[1]-70]);
        this.stmtThen.putPosition([x,y]);
        this.symStatment.setPosMaxX(this.getPosX()-pos[0]+this.stmtThen.symStatment.width-10);
        x -= 2*this.getWidth();
        y = pos[1] + this.stmtElse.getHeight();
        this.stmtElse.putPosition([x,y]);
        pos[1] = pos[1] + this.symStatment.heightStatment;
    },
    getPosLastThen: function() {
        if (this.stmtThen instanceof StmtBlock)
            return this.stmtThen.treeStatment[this.stmtThen.treeStatment.length-1]
                .symStatment.posY+this.stmtThen.treeStatment[this.stmtThen.treeStatment.length-1].symStatment.heightStatment;
        return this.stmtThen.symStatment.posY+this.stmtThen.symStatment.heightStatment;
    },
    getPosLastElse: function() {
        if (this.stmtElse instanceof StmtBlock)
            return this.stmtElse.treeStatment[this.stmtElse.treeStatment.length-1]
                .symStatment.posY+this.stmtElse.treeStatment[this.stmtElse.treeStatment.length-1].symStatment.heightStatment;
        return this.stmtElse.symStatment.posY+this.stmtElse.symStatment.heightStatment;;
    },
    getHeightStatment: function() {
        var hElse = this.stmtElse.getHeightStatment() + this.stmtElse.getHeight();
		    var hThen = this.stmtThen.getHeightStatment() + this.stmtThen.getHeight();
        return (this.symStatment.heightStatment + Math.max(hElse,hThen));
    },
    setHeightStatment: function(val) {
        this.symStatment.heightStatment = val - 20;
        this.stmtThen.setHeightStatment(this.stmtThen.getHeightStatment());
        if (this.stmtElse != null)this.stmtElse.setHeightStatment(this.stmtElse.getHeightStatment());
    },
    treeLocation: function() {
        this.stmtThen.treeLocation();
        if (this.stmtElse != null) this.stmtElse.treeLocation();
    },
    visualization: function(ctx,tools) {
        this.parent(ctx,tools);
        var k, varBeg, varGo, var1,st, varInput;
        with (this) {
            if (showVisual) {
                this.exprIf.setVisible(true);
                k = app.insertRowVis();
                st = new SymChangeStatment(this,0.2,1);
                app.insertElementVis(k,st);
                k = app.insertRowVis();
                exprIf.interpretation([0,0]);
                exprIf.operation(true,'int');
                exprIf.symbolName.visible = false;
                var1 = app.tree.treeVar[app.tree.treeVar.length-1];
                k = app.insertRowVis();
                varIf = new SymChangeIf(symStatment,stmtThen,stmtElse,var1.getValue());
                var var2 = new Symbol(symStatment.posX+80,this.symStatment.posY);
                result = var1.getValue();
                if (result == false)
                    var2 = new Symbol(symStatment.posX-80,this.symStatment.posY);
                varGo = new SymVarDown(var1,var2,0);
                app.insertElementVis(k,varGo);
                app.insertElementVis(k,varIf);
                st = new SymChangeStatment(this,-0.2,1);
                app.insertElementVis(k,st);
            } else {
                result = exprIf.operation(false,'int');
                symStatment.color = 'rgba(49,79,79,1)';
                symStatment.angleOfRotation = Math.PI/9;
                var d = Math.abs(Math.cos(Math.PI/9))*symStatment.width/2.5;
                stmtThen.symStatment.height = begThenHeight;
                stmtElse.symStatment.height = begElseHeight;
                if (!result) {
                    d = -d;
                    symStatment.angleOfRotation = -symStatment.angleOfRotation
                }
                stmtThen.symStatment.height -= d;
                stmtElse.symStatment.height += d;
            }
            app.paint();
        }
    },
    changePosStatment: function(pos) {
       this.parent(pos);
       this.exprIf.putPosition([this.symStatment.posX,this.symStatment.posY-70]);
       this.stmtThen.changePosStatment(pos);
       this.stmtElse.changePosStatment(pos);
    },
    getWidth: function() {
        return Math.max(this.symStatment.width,this.stmtElse.getWidth()+this.stmtThen.getWidth());
    },
    getPosX: function() {
        return this.stmtThen.getPosX();
    },
    setWidth: function(width) {
        this.parent(this.getWidth());
    },
    findSynExpr: function(pos,tools) {
        var find = this.parent(pos,tools);
        if (find != -1) return find;
        find = this.stmtThen.findSynExpr(pos,tools);
        if (find != -1) return find;
        return this.stmtElse.findSynExpr(pos,tools);
    },
    goStatment: function() {
        this.parent();
        this.stmtThen.symStatment.height = this.begThenHeight;
        this.stmtElse.symStatment.height = this.begElseHeight;
        this.stmtThen.goStatment();
        this.stmtElse.goStatment();
    }
});

StmtBlock = new Class ({
    Extends: Statment,
    initialize: function () {
        var symStatment = new SymBegin(0,0,'#E8E8E8');
        this.parent(symStatment);
        this.treeStatment = [];
        this.symStatment.height = 20;
        this.currentStatment = -1;
    },
    treeStatment: null,
    currentStatment: null,
    mainBlock: false,
    draw: function (ctx,tools) {
        with(this.symStatment)
            for (var i = 0; i < this.treeStatment.length; i++)
            this.treeStatment[i].drawLine(ctx,tools);
            this.symStatment.draw(ctx,tools);
            for (var i = 0; i < this.treeStatment.length; i++)
                this.treeStatment[i].draw(ctx,tools);
    },
    push: function(statment) {
        this.treeStatment.push(statment);
    },
    putPosition: function(pos) {
        this.parent(pos);
        for(var k = 0; k < this.treeStatment.length; k++) {
            pos[1] += this.treeStatment[k].getHeight();
            this.treeStatment[k].putPosition(pos);
            this.treeStatment[k].symStatment.setPosMaxX(this.treeStatment[k].getPosX()-pos[0]+this.treeStatment[k].symStatment.width);
        }
    },
    getHeightStatment: function() {
        this.symStatment.heightStatment = 20;
        for (var k = 0; k < this.treeStatment.length; k++) {
            this.symStatment.heightStatment += (this.treeStatment[k].symStatment.heightStatment+this.treeStatment[k].getHeight());
        }
        return this.symStatment.heightStatment;
    },
    setHeightStatment: function(val) {
        this.symStatment.heightStatment = val;
    },
    treeLocation: function() {
        for (var i = 0; i < this.treeStatment.length; i++) {
            this.treeStatment[i].setWidth(this.treeStatment[i].getWidth());
        }
        for (var i = 0; i < this.treeStatment.length; i++) {
            this.treeStatment[i].treeLocation();
            this.treeStatment[i].setHeightStatment(this.treeStatment[i].getHeightStatment());
        }
    },
    changePos: function(pos,tools) {
        var y = pos[1]/tools.scale - tools.top;
        var x = pos[0]/tools.scale - tools.left;
        var dx = this.symStatment.posX - x;
        var dy = this.symStatment.posY - y;
        this.symStatment.posY = y;
        this.symStatment.posX = x;
        for (var i = 0; i < this.treeStatment.length; i++)
            this.treeStatment[i].changePosStatment([dx, dy]);
    },
    changePosStatment: function(pos) {
	      this.symStatment.posY -= pos[1];
        this.symStatment.posX -= pos[0];
        for (var i = 0; i < this.treeStatment.length; i++)
            this.treeStatment[i].changePosStatment(pos);
    },
    getWidth: function() {
        var width = 0;
        for (var i = 0; i < this.treeStatment.length; i++)
            width = Math.max(width,this.treeStatment[i].getWidth());
        return width;
    },

    findSynExpr: function(pos,tools) {
        var find = this.symStatment.findVar(pos,tools);
        if (find != -1) {
            for (var k = this.treeStatment.length - 1; k >= 0 ; k--) {
                this.treeStatment[k].showVisual =! this.treeStatment[k].showVisual;
                this.treeStatment[k].symStatment.showVisual = this.treeStatment[k].showVisual;
            }
            return this;
        }
        for (var k = this.treeStatment.length - 1; k >= 0 ; k--) {
            var findSyn = this.treeStatment[k].findSynExpr(pos,tools);
            if (findSyn != -1) return findSyn;
        }
        return -1;
    },
    goStatment: function() {
        for (var i = 0; i < this.treeStatment.length; i++)
            this.treeStatment[i].goStatment();
        this.currentStatment =- 1;
    }
});

StmtRead = new Class ({
    Extends: Statment,
    initialize: function(arrayRead,symStatment,pos) {
        this.parent(symStatment,pos);
        this.arrayRead = arrayRead;
    },
    arrayRead: null,
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
    },
    visualization: function(ctx,tools) {
        var k, varBeg, varGo, st;
        with (this) {
            k = app.insertRowVis();
            st = new SymChangeStatment(this,0.4,1);
            app.insertElementVis(k,st);
            for (var i = 0; i < arrayRead.length; i++) {
                k = app.insertRowVis();
                varBeg = arrayRead[i].getSymbol();
                var pos = [symStatment.posX,symStatment.posY];
                if (varBeg instanceof SymString) {
                    arrayRead[i].symStatment = arrayRead[i].getSymbol().setNewString(' ');
                    arrayRead[i].getSymbol().itemsElement[0].posStatment = pos;
                    varBeg = arrayRead[i].getSymbol();
                    varBeg.setVisible(false);
                }
                varBeg.posStatment = pos;
                varGo = new SymVarOpenClose(varBeg,true,true);
                app.insertElementVis(k,varGo);
                k = app.insertRowVis();
                varGo = new SymVarOpenClose(varBeg,false,true);
                app.insertElementVis(k,varGo);
            }
            k = app.insertRowVis();
            st = new SymChangeStatment(this,-0.4,1);
            app.insertElementVis(k,st);
            app.paint();
        }
    }
});

StmtWrite = new Class ({
    Extends: Statment,
    initialize: function(arrayWrite,symStatment,ln,pos) {
        this.parent(symStatment,pos);
        this.arrayWrite = arrayWrite;
        this.ln = ln;
    },
    arrayWrite: null,
    ln: null,
    putPosition: function(pos) {
        this.parent(pos);
        for (var i = 0; i < this.arrayWrite.length; i++) {
            this.arrayWrite[i].putPosition([pos[0],pos[1]-20]);
        }
    },
    draw: function(ctx,tools) {
        this.symStatment.draw(ctx,tools);
        for (var i = 0; i < this.arrayWrite.length; i++) {
            if (this.arrayWrite[i].show) this.arrayWrite[i].draw(ctx,tools);
        }
    },
    changePosStatment: function(pos,tools) {
        this.parent(pos);
        for (var i = 0; i < this.arrayWrite.length; i++) {
            this.arrayWrite[i].putPosition([this.symStatment.posX,this.symStatment.posY-20]);
        }
    },
    visualization: function(ctx,tools) {
        var k, varEnd, var1, varGo, st, text, n = 0;
        this.parent(ctx,tools);
        with (this) {
            if (showVisual) {
                varEnd = new SymVarName (0,tools.getAdjustedX(30),(app.height+30)/tools.scale,'int','');
                varEnd.setVisible(false);
                k = app.insertRowVis();
                st = new SymChangeStatment(this,0.4,1);
                app.insertElementVis(k,st);
                for (var i = 0; i < arrayWrite.length; i++) {
                    k = app.insertRowVis();
                    varEnd.setPosX(tools.getAdjustedX(30*(i+1)));
                    app.insertElementVis(k, new SymDinamicVisible(this.arrayWrite[i], true));
                    arrayWrite[i].setVisible(true);
                    arrayWrite[i].interpretation([symStatment.getPosX(),symStatment.getPosY()]);
                    arrayWrite[i].operation(true,arrayWrite[i].getType());
                    arrayWrite[i].symbolName.visible = false;
                    var var1 = app.tree.treeVar[app.tree.treeVar.length-1];
                    k = app.insertRowVis();
                    varGo = new SymVarMerge(var1,varEnd,1/120);
                    varGo.numberOfMerSep = 0;
                    app.insertElementVis(k,varGo);
                    k = app.insertRowVis();
                    if (ln == false) text = new SymVarWrite(var1.getValue(),var1.type,false,n);
                    else text = new SymVarWrite(var1.getValue(),var1.type,true,n);
                    app.insertElementVis(k,text);
                    n++;
                }
                k = app.insertRowVis();
                st = new SymChangeStatment(this,-0.4,1);
                app.insertElementVis(k,st);
            } else {
                var str = '';
                for (var i = 0; i < arrayWrite.length; i++) {
                    str = str + arrayWrite[i].operation(false,arrayWrite[i].getType())
                }
                if (ln == false) text = new SymVarWrite(str,'string',false,n);
                else text = new SymVarWrite(str,'string',true,n);
                symStatment.color = 'rgba(49,79,79,1)';
                k = app.insertRowVis();
                app.insertElementVis(k,text);
            }
            app.paint();
        }
    }
});

StmtWhile = new Class({
    Extends: StmtIf,
    initialize: function(exprIf,sThen,sElse,symStatment,pos) {
        this.parent(exprIf,sThen,sElse,symStatment,pos);
        this.symStatment.value = this.symStatment.value.replace('while','')
    },
    visualization: function(ctx,tools) {
        this.parent(ctx,tools);
        if (this.showVisual) this.goStatment();
        else {
            this.stmtThen.goStatment();
            this.stmtElse.goStatment();
        }
    }
});

StmtFor = new Class({
    Extends: StmtWhile,
    initialize: function(exprIf,synAssign,sThen,sElse,symStatment,pos) {
        this.parent(exprIf,sThen,sElse,symStatment,pos);
        this.synAssign = synAssign;
        this.symStatment.value = this.symStatment.value.replace('for','')
        this.symStatment.value = this.symStatment.value.replace('to','..')
        this.synEndFor = exprIf;
    },
    synAssign: null,
    synEndFor: null,
    init : true,
    visualization: function(ctx,tools) {
        var result, result1;
        if (this.init) {
            result = this.synAssign.aRight.operation(false,'int');
            this.synAssign.aLeft.getSymbol().setValue(result);
            result1 = this.synEndFor.operation(false,'int');
            this.symStatment.value=this.synAssign.aLeft.getSymbol().name+':='+result+'..'+result1;
            var binOp = new SymBinOp('<=',0,0,'#5500ff',Math.random()-0.5);
            this.exprIf = new SynBinOp(binOp,this.synAssign.aLeft,new SynConstInt(result1));
            this.exprIf.putPosition([this.symStatment.posX,this.symStatment.posY-50]);
            this.synAssign.aLeft.getSymbol().setPosX(this.symStatment.posX - 10);
            this.synAssign.aLeft.getSymbol().setPosY(this.symStatment.posY +80);
            this.init = false;
        } else this.synAssign.aLeft.getSymbol().setValue(this.synAssign.aLeft.getSymbol().getValue()*1+1);
        this.parent(ctx,tools);
    }
});
