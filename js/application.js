VariableTree = new Class({
    initialize: function() {
        this.treeVar = [];
    },
    treeVar: null,
    varMove: null,
    flagMove: false,
    draw: function(ctx) {
        DrawForVis(ctx).back("#7cb7e3","#cccccc",canvas.width,canvas.height);
        for (var i = 0; i < this.treeVar.length; i++)
            this.treeVar[i].draw(ctx);
    },
    push: function(item) {
        this.treeVar.push(item);
    },
    findByPos: function(pos) {
        for (var k = this.treeVar.length - 1; k >= 0; k--) {
            var findSymbol = this.treeVar[k].findVar(pos);
            if (findSymbol != -1) {
            	var index = this.treeVar.length - 1;
                var a = this.treeVar[index];
                this.treeVar[index] = this.treeVar[k];
                this.treeVar[k] = a;
                return findSymbol;
            }
        }
        return -1;
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
    },
    tree: null,
    tools: null,
    width: 0,
    height: 0,
    ctx: null
});