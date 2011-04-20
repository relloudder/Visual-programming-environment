VariableTree = new Class({
    initialize: function() {
        this.treeVar = [];
		this.treeStatment = [];
    },
    treeVar: null,
	treeStatment: null,
    varMove: null,
    draw: function(ctx,tools,width,height) {
        DrawForVis(ctx).back("#7cb7e3","#cccccc",width,height);
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
        var length = this.treeVar.length;
        if (length/2 != Math.ceil(length/2)) {
            length++;
        }
        var sizeX = width/4, sizeY = height/length*2;
        var k = 0;
        for(var i = 0; i < 2; i++) {
            for(var j = 0; j < length/2; j++) {
                this.treeVar[k].setPosX(i*sizeX + sizeX/2);
                this.treeVar[k].setPosY(j*sizeY + sizeY/2);
                this.treeVar[k].inputRandom(10);
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
        for(var k = 1; k < this.treeStatment.length; k++) {
            pos[1] += this.treeStatment[k].getHeight();
            this.treeStatment[k].putPosition(pos);
        }
    },
    setPrev: function(pos) {
        var k = 0;
        while ((pos != this.treeStatment[k].symStatment.posY)) {
            k++;
        }
        if (k == 0) {
            return;
        }
        if ((this.treeStatment[k-1].symStatment.posY+70) > this.treeStatment[k].symStatment.posY) {
            this.treeStatment[k].putPosition([this.treeStatment[k].symStatment.posX,this.treeStatment[k-1].symStatment.posY+70]);
        }
        if (k < (this.treeStatment.length-1)) {
            if (this.treeStatment[k].symStatment.posY > (this.treeStatment[k+1].symStatment.posY-70))
                this.treeStatment[k].putPosition([this.treeStatment[k].symStatment.posX,this.treeStatment[k+1].symStatment.posY-70]);
            this.treeStatment[k+1].symStatment.height = this.treeStatment[k+1].symStatment.posY-this.treeStatment[k].symStatment.posY;
        }
        this.treeStatment[k].symStatment.height = this.treeStatment[k].symStatment.posY-this.treeStatment[k-1].symStatment.posY;
    }
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
		this.numberOfStatement = -1;
    },
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
    numberOfStatement: null,
    insertRowVis: function() {
        this.treeVis.push([]);
        return (this.treeVis.length - 1);
    },
    insertElementVis: function(item,symVar) {
		this.treeVis[item].push(symVar);
        return (this.treeVis[item].length - 1);
    },
    paint: function() {
        self = this;
       	this.idTimer = setInterval("self.drawTreeVis()",this.dTime);
    },
    drawTreeVis: function() {
        with(this) {
            DrawForVis(ctx).back('#202020','#aaa',width,height);
            tree.draw(ctx,tools,width,height);
            var stopPaint = 0;
            if(treeVis[0] != null) {
                for (var i = 0; i < treeVis[0].length; i++) {
                    stopPaint += treeVis[0][i].draw(ctx,tools);
                }
            }
            if (stopPaint == 0) {
                clearInterval(idTimer);
                if (treeVis.length > 0) {
                    treeVis.splice(0,1); //delete 0 row
                    selfNew = this;
                    idTimer = setInterval('selfNew.drawTreeVis()',this.dTime);
                } else if (numberOfStatement >= 0) {
                    numberOfStatement++;
                    tree.treeStatment[numberOfStatement].visualization(ctx,tools);
                }
            }
        }
    }
});
