ExceptionForApplication = new Class({
    initialize: function() {},
    error: function(error) {
        alert(error);
        jQuery.error();
    }
});

VariableTree = new Class({
    initialize: function() {
        this.treeVar = [];
        this.treeVar.push(new SymFunction(0,0,'real','sqrt',['real']));
        this.treeVar.push(new SymFunction(0,0,'int','trunc',['real']));
        this.treeVar.push(new SymFunction(0,0,'int','round',['real']));
        this.treeVar.push(new SymFunction(0,0,'real','sin',['real']));
        this.treeVar.push(new SymFunction(0,0,'real','cos',['real']));
        this.treeVar.push(new SymFunction(0,0,'real','tan',['real']));
        this.treeVar.push(new SymFunction(0,0,'int','random',['int']));
        this.treeVar.push(new SymFunction(0,0,'string','copy',['string','int','int']));
        this.treeVar.push(new SymFunction(0,0,'int','pos',['string','string']));
        this.treeVar.push(new SymFunction(0,0,'int','length',['string']));
        this.treeVar.push(new SymFunction(0,0,'string','delete',['string','int','int']));
        this.treeStatment = [];
    },
    treeVar: null,
    treeStatment: null,
    varMove: null,
    draw: function(ctx,tools,width,height) {
        DrawForVis(ctx).back("#7cb7e3","#cccccc",width,height);
        //DrawForVis(ctx).back("#FFFFFF","#FFFFFF",width,height);
        for (var i = 0; i < this.treeStatment.length; i++) {
            this.treeStatment[i].drawLine(ctx,tools);
        }
        for (var i = 0; i < this.treeStatment.length; i++) {
            this.treeStatment[i].draw(ctx,tools);
        }
        for (var i = 0; i < this.treeVar.length; i++) {
            if ( this.treeVar[i].visible) this.treeVar[i].draw(ctx,tools);
        }
    },
    push: function(item) {
        this.treeVar.push(item);
        for(var i = 0; i < this.treeVar.length-1; i++)
            if (item.name == this.treeVar[i].name) return -1;
        return 0;
    },
    findByPos: function(pos,tools) {
        for (var k = this.treeVar.length - 1; k >= 0; k--) {
            var findSymbol = this.treeVar[k].findVar(pos,tools);
            if (findSymbol != -1) {
            	var index = this.treeVar.length - 1;
                var a = this.treeVar[index];
                this.treeVar[index] = this.treeVar[k];
                this.treeVar[k] = a;
                return findSymbol;
            }
        }
        for (var k = this.treeStatment.length - 1; k >= 0 ; k--) {
            var findSyn = this.treeStatment[k].findSynExpr(pos,tools);
            if (findSyn != -1) {
                return findSyn;
            }
		}
        return -1;
    },
    treeLocation: function(width,height) {
        for (var i = 0; i < this.treeStatment.length; i++) {
            var w = this.treeStatment[i].symStatment.width;
            var wNew = this.treeStatment[i].getWidth();
            if (w < wNew) this.treeStatment[i].symStatment.width = wNew;
	    }
        for (var i = 0; i < this.treeStatment.length; i++) {
            this.treeStatment[i].treeLocation();
        }
        var length = this.treeVar.length;
        if (length/2 != Math.ceil(length/2)) {
            length++;
        }
        var sizeX = width/12, sizeY = height/length*2;
        var k = 0;
        for(var i = 0; i < 2; i++) {
            for(var j = 0; j < length/2; j++) {
                this.treeVar[k].setPosX(i*sizeX + sizeX/2);
                this.treeVar[k].setPosY(j*sizeY + sizeY/2);
                this.treeVar[k].inputRandom(0);
                k++;
                if (k == this.treeVar.length) {
                    return;
                }
            }
        }
    },
	getVarByName: function(tree,name) {
	    for (var k = tree.length - 1; k >= 0; k--) {
	        if (tree[k].name == name) {
	            return tree[k];
	        }
	    }
		return -1;
    },
    findSymbolByPos: function(pos) {
        for (var k = this.treeVar.length - 1; k >= 1 ; k--) {
            if ((pos[0] == this.treeVar[k].getPosX()) && (pos[1] == this.treeVar[k].getPosY())) {
                return this.treeVar[k];
            }
        }
        return -1;
    },
    putPosition: function(pos) {
        for (var j = 0; j < this.treeVar.length; j++) {
            this.treeVar[j].setPosX(this.treeVar[j].getPosX()+pos[0]);
            this.treeVar[j].setPosY(this.treeVar[j].getPosY()+pos[1]);
        }
    }
    //setPrev: function(pos) {}
});

Tools = new Class({
    initialize: function(top,left,scale) {
        this.top = top;
        this.left = left;
        this.scale = scale;
    },
    top: 0,
    left: 0,
    scale: 1,
    setTop: function(top) {
        this.top = top;
    },
    getTop: function() {
        return this.top;
    },
    setLeft: function(left) {
        this.left = left;
    },
    getLeft: function() {
        return this.left;
    },
    setScale: function(scale) {
        this.scale = scale;
    },
    getScale: function() {
        return this.scale;
    },
    getAdjustedX: function(x) {
        return (x + this.left)*this.scale;
    },
    getAdjustedY: function(y) {
        return (y + this.top)*this.scale;
    },
    getAdjustedR: function(r){
        return (r*this.scale);
    }
});

Application = new Class({
    initialize: function(ctx,width,height) {
        this.tree = new VariableTree();
        this.tools = new Tools(0,0,1);
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.treeVis = [];
        this.dTime = 25;
        this.speed = 0.3;
        this.visualStatments = -1;
        this.byStep = false;
        this.exception = new ExceptionForApplication();
    },
    pause : false,
    showInput: false,
    flagMove: false,
    flagCanvasMove: false,
    move: false,
    tree: null,
    tools: null,
    width: 0,
    height: 0,
    ctx: null,
    idTimer: null,
    speed: null,
    dTime: null,
    treeVis: null,
    visualStatments: null,
    numberOfVisualStatment: -1,
    byStep: false,
    exception: null,
    insertRowVis: function() {
        this.treeVis.push([]);
        return (this.treeVis.length - 1);
    },
    insertElementVis: function(item,symVar) {
		this.treeVis[item].push(symVar);
        return (this.treeVis[item].length - 1);
    },
    paint: function() {
        var x = this;
        this.idTimer = setInterval(function() { x.drawTreeVis(); }, this.dTime);
    },
    draw: function() {
        DrawForVis(this.ctx).back('#202020','#aaa',this.width,this.height);
        //DrawForVis(ctx).back("#FFFFFF","#FFFFFF",width,height);
        this.tree.draw(this.ctx,this.tools,this.width,this.height);
    },
    drawTreeVis: function() {
        if (this.showInput) return;
        DrawForVis(this.ctx).back('#202020','#aaa',this.width,this.height);
        //DrawForVis(ctx).back("#FFFFFF","#FFFFFF",width,height);
        this.tree.draw(this.ctx,this.tools,this.width,this.height);
        var stopPaint = 0;
        if (this.treeVis[0] != null) {
            for (var i = 0; i < this.treeVis[0].length; i++) {
                var result = this.treeVis[0][i].draw(this.ctx, this.tools);
                if (result == -1) {
                    clearInterval(this.idTimer);
                    return;
                }
                stopPaint += result;
            }
        }
        if (stopPaint == 0) {
            clearInterval(this.idTimer);
            if (this.treeVis.length > 0) {
                this.treeVis.splice(0,1); //delete 0 row
                var selfNew = this;
                this.idTimer = setInterval(function() { selfNew.drawTreeVis(); }, this.dTime);
            } else if (this.byStep == false) {
                if (this.pause) return;
                var next = this.nextStatmentForVis();
                if (next instanceof SynStop) {
                    next.visualization(this.ctx,this.tools);
                    clearInterval(this.idTimer);
                    return
                }
                if (next != null) next.visualization(this.ctx,this.tools);
            }
        }
    },
    nextStatmentForVis: function () {
        if (this.visualStatments == -1) return null;
        var pred = null;
        if (this.visualStatments.currentStatment != -1)
            pred = this.visualStatments.treeStatment[this.visualStatments.currentStatment];
        if (pred instanceof SynStop) return pred;
		if (pred instanceof StmtRepeat) {}
        else if (pred instanceof StmtIf)
            if ((pred.result == false) && (pred.stmtElse.symStatment.value == '1null')) {
                if (pred instanceof StmtFor) pred.init = true;
            }
            else if ((pred.result == true) && (pred.stmtThen.symStatment.value == '1null')) {}
        else {
            var next;
            if ((pred.result) && (pred.stmtThen instanceof StmtBlock)) next = pred.stmtThen;
            else if ((pred.result == false) && (pred.stmtElse instanceof StmtBlock)) next = pred.stmtElse;
            else {
                next = new StmtBlock();
                if (pred.result) next.push(pred.stmtThen);
                else next.push(pred.stmtElse);
            }
            next.parent = this.visualStatments;
            next.currentStatment = 0;
            this.visualStatments = next;
            return this.visualStatments.treeStatment[this.visualStatments.currentStatment];
        }
        while (this.visualStatments.currentStatment == (this.visualStatments.treeStatment.length-1)) {
            if ((this.visualStatments.parent instanceof StmtBlock) && (this.visualStatments.repeatBlock)) {
                this.visualStatments = this.visualStatments.parent;
                return this.visualStatments.treeStatment[this.visualStatments.currentStatment];
            } else if (this.visualStatments.treeStatment[this.visualStatments.currentStatment] instanceof StmtWhile) {
                if (this.visualStatments.treeStatment[this.visualStatments.currentStatment].result == false)
                    this.visualStatments = this.visualStatments.parent;
                else break;
            } else  this.visualStatments = this.visualStatments.parent;
        }
		if (this.visualStatments.treeStatment[this.visualStatments.currentStatment] instanceof StmtRepeat) {}
        else if ((this.visualStatments.treeStatment[this.visualStatments.currentStatment] instanceof StmtWhile) &&
           (this.visualStatments.treeStatment[this.visualStatments.currentStatment].result)) {}
        else this.visualStatments.currentStatment++;
        var resultSt = this.visualStatments.treeStatment[this.visualStatments.currentStatment];
        if (resultSt instanceof StmtRepeat)
            if (resultSt.result == false) {
                next = resultSt.stmtThen;
                next.parent = this.visualStatments;
                next.currentStatment = 0;
                this.visualStatments = next;
                return this.visualStatments.treeStatment[this.visualStatments.currentStatment];
            }
        else this.visualStatments.currentStatment++;
        return this.visualStatments.treeStatment[this.visualStatments.currentStatment];
    }
});
