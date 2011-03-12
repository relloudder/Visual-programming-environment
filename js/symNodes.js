Symbol = new Class({
    initialize: function(pX,pY) {
        this.posX = pX;
        this.posY = pY;
        this.owner = 'none';
    },
    visible: true,
    transp: 1,
    turn: 0,
    posX: 0,
    posY: 0,
    owner: '',
    draw: function(ctx) {},
    setVisible: function(vis) {
        this.visible = vis;
    },
    getVisible: function() {
        return this.visible;
    },
    getPosX: function() {
        return this.posX;
    },
    getPosY: function() {
        return this.posY;
    },
    setPosX: function(pX) {
        this.posX = pX;
    },
    setPosY: function(pY) {
        this.posY = pY;
    },
    clone: function() {
        return new Symbol(this.posX,this.posY);
    }
});

SymVar = new Class({
    Extends: Symbol,
    initialize: function(val,pX,pY,colVar,rVar) {
        this.parent(pX, pY);
        this.val = val;
        this.colVar = colVar;
        this.rVar = rVar;
    },
    val: 0,
    colVar: 0,
    rVar: 0,
    getRVar: function() {
        return this.rVar;
    },
    setRVar: function(r) {
        this.rVar = r;
    },
    getValue: function() {
        return this.val;
    },
    setValue: function(v) {
        this.val = v;
    },
    getColVar: function() {
        return this.colVar;
    },
	inputRandom: function(maxValue) {
	    this.val = Math.floor(Math.random() * maxValue);
	},
    clone: function() {
        return new SymVar(this.val, this.posX, this.posY, this.colVar, this.rVar);
    },
    draw: function(ctx) {
        with(app.tools) {
            DrawForVis(ctx).ball(getAdjustedX(this.posX),getAdjustedY(this.posY),getAdjustedR(this.rVar), this.colVar);
            if (this.val == '') return;
            DrawForVis(ctx).text(this.val,getAdjustedX(this.posX),getAdjustedY(this.posY),getAdjustedR(this.rVar),0,this.type);
	    }
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (Math.pow(x - this.getPosX(), 2) + Math.pow(y - this.getPosY(), 2) <= 1.5 * Math.pow(this.rVar, 2))
            return this;
        return -1;
    },
    changePos: function(pos,tools) {
        this.posX = pos[0]/tools.scale - tools.left;
	    this.posY = pos[1]/tools.scale - tools.top;
    }
});

SymVarName = new Class({
    Extends: SymVar,
    initialize: function (v,pX,pY,type,nameV) {
    	var colorAndRadius = function(color, radius) {
    		this.color = color;
    		this.radius = radius;
    	}
    	var typeAndValue = {
    	    'int': new colorAndRadius('green', 20),
    	    'real': new colorAndRadius('red', 25),
    	    'record': new colorAndRadius('grey', 20),
    	    'boolean': new colorAndRadius('blue', 15),
    	    'char': new colorAndRadius('pink', 15),
    	    'array': new colorAndRadius('black', 20)
    	}
    	var t = typeAndValue[type];
        this.parent(v,pX,pY,t.color,t.radius);
        this.name = nameV;
        this.type = type;
    },
    name: '',
    type: 'int',
    getName: function() {
        return this.name;
    },
    setName: function(name) {
        this.name = name;
    },
    inputRandom: function (maxValue) {
        if (this.type == 'char')
        	this.val = "'" + String.fromCharCode(48 + Math.floor(Math.random() * 80)) + "'";
	    else if (this.type == 'boolean')
	    	this.val = Math.round(Math.random()) == 0 ? 'F' : 'T';
	    else
	    	this.val = Math.floor(Math.random() * maxValue);
	},
    clone: function() {
        var element = new SymVarName(this.val, this.posX, this.posY, this.type, this.name);
        element.owner = this.owner;
        return element;
    },
    draw: function(ctx) {
        with(app.tools) {
            DrawForVis(ctx).ball(getAdjustedX(this.posX),getAdjustedY(this.posY),getAdjustedR(this.rVar),this.colVar);
            DrawForVis(ctx).text(this.val,getAdjustedX(this.posX),getAdjustedY(this.posY),getAdjustedR(this.rVar),0,this.type);
            if (this.owner == 'array')
                DrawForVis(ctx).hat(getAdjustedX(this.posX),getAdjustedY(this.posY-2.25*this.rVar),getAdjustedR(this.rVar),'yellow',this.name);
            else if (this.owner == 'record')
                DrawForVis(ctx).hatRecord(getAdjustedX(this.posX),getAdjustedY(this.posY),getAdjustedR(this.rVar),
                    this.colVar,this.name,this.turn);
            else DrawForVis(ctx).flag(getAdjustedX(this.posX-this.rVar),getAdjustedY(this.posY-4),4,6,this.colVar,
                this.name,getAdjustedR(this.rVar),155*Math.PI/180);
        }
    }
})

SymArray = new Class({
    Extends: SymVarName,
    initialize: function (pX,pY,sArray,fIndex,cloneItem,nameV) {
        this.parent(0,pX,pY,cloneItem.type,nameV);
        this.firstIndex = fIndex;
        this.sizeElement = sArray;
        this.type = 'array';
        this.turn = Math.PI/4; //для красоты
        this.itemsElement = new Array(); //для хранения каждого элемнта массива
        cloneItem.owner = 'array';
        if (cloneItem instanceof SymArray) {
            this.turn = cloneItem.turn + Math.PI/1.2;
        }
        for (var i = 0; i <= this.sizeElement; i++) {
	        var x = this.posX + this.rVar*2.2*i; //положение каждого шарика по x
		    var y = this.posY - i*this.rVar*Math.sin(this.turn);
            var item  =  cloneItem.clone();
            item.setPosX(x);
            item.setPosY(y);
            item.setName(i + this.firstIndex);
		    this.itemsElement.push(item);
	    }
    },
    firstIndex: 0,
    sizeElement: 0,
    itemsElement: null,
    setPosX: function(pX) {
        with(this) {
            posX = pX;
            for (var i = 0; i <= sizeElement; i++)
                itemsElement[i].setPosX(posX + itemsElement[i].rVar*i*2.2);
        }
    },
    setPosY: function(pY) {
        with(this) {
            posY = pY;
            for (var i = 0; i <= sizeElement; i++)
                itemsElement[i].setPosY(posY + i*itemsElement[i].rVar*Math.sin(this.turn)*1.2);
        }
    },
    setName: function(name) {
        this.name = name;
        for (var i = 0; i <= this.sizeElement; i++)
            this.itemsElement[i].name = this.name + ' ' + (i + this.firstIndex);
    },
    clone: function() {
        var element = new SymArray(this.posX,this.posY,this.sizeElement,this.firstIndex,this.itemsElement[0],this.name);
        element.turn = this.turn;
        element.owner = this.owner;
        return element;
    },
    draw: function(ctx) {
        with(this)with(app.tools) {
	        for(var i = sizeElement-1; i >= 0; i--) {
			    DrawForVis(ctx).connect(getAdjustedX(itemsElement[i+1].posX),getAdjustedY(itemsElement[i+1].posY),
			        getAdjustedX(itemsElement[i].posX),getAdjustedY(itemsElement[i].posY),getAdjustedR(rVar/5),'yellow');
			}
		    for(var i = sizeElement; i >= 0; i--) {
		       itemsElement[i].draw(ctx);
		    }
		    if (typeof(this.name) != 'number')
                 DrawForVis(ctx).flag(getAdjustedX(posX-rVar),getAdjustedY(posY),getAdjustedR(rVar/5),6,colVar,name,
                     getAdjustedR(rVar),155*Math.PI/180);
	    }
    },
    inputRandom: function(maxValue) {
        for(var i = 0; i <= this.sizeElement; i++) {
            this.itemsElement[i].inputRandom(maxValue);
        }
    },
    findVar: function(pos,tools) {
        var find = this.parent(pos,tools);
        if (find != -1) return this;
        for (var k = 0; k <= this.sizeElement; k++) {
            find = this.itemsElement[k].findVar(pos,tools);
            if (find != -1) return find;
        }
        return -1;
    },
    changePos: function(pos,tools) {
        var dx =-this.itemsElement[0].getPosX()+pos[0]/tools.scale-tools.left;;
        var dy =-this.itemsElement[0].getPosY()+pos[1]/tools.scale-tools.top;
        for (var i = 0; i <= this.sizeElement; i++) {
            this.itemsElement[i].setPosX(this.itemsElement[i].posX + dx);
            this.itemsElement[i].setPosY(this.itemsElement[i].posY + dy);
        }
        this.posX = this.itemsElement[0].posX;
        this.posY = this.itemsElement[0].posY;
    }
})

SymRecord = new Class({
    Extends: SymVarName,
    initialize: function (pX,pY,type,nameV){
        this.parent(0,pX,pY,type,nameV);
        this.itemsElement = new Array();
        this.sizeElement = 0;
    },
    sizeElement: 0,
    itemsElement: null,
    getItemProperty: function(number) {
        var itemProperty = new Array();
        with(this) {
            itemProperty[0] = -Math.PI/(this.sizeElement+1)*(number+1);//угол
            itemProperty[1] = posX + 40*(1 + itemsElement.length/6)*Math.cos(itemProperty[0]);//позиция по x
            itemProperty[2] = posY + 40*(1 + itemsElement.length/6)*Math.sin(itemProperty[0]);//позиция по y
            itemProperty[0] = itemProperty[0] - Math.PI/2;
        }
        return itemProperty;
    },
    push: function(vItem) {
        with(this) {
            for(var i = 0; i < sizeElement; i++)
                if (itemsElement[i].getName().toLowerCase() == vItem.getName().toLowerCase()) return -1;
            vItem.owner = 'record';
            itemsElement.push(vItem);
            sizeElement+=1;
            for(var i = 0; i < sizeElement; i++) {
                var property = getItemProperty(i);
                itemsElement[i].turn = property[0];
                itemsElement[i].setPosY(property[2]);
                itemsElement[i].setPosX(property[1]);
            }
        }
    },
    setPosX: function(vX) {
        with(this) {
            var x = posX;
            posX = vX;
            for(var i = 0; i < sizeElement; i++)
                itemsElement[i].setPosX(itemsElement[i].posX - x + posX);
        }
    },
    setPosY: function(vY) {
        with(this){
            var y = posY;
            posY = vY;
            for(var i = 0; i < sizeElement; i++)
                itemsElement[i].setPosY(itemsElement[i].posY - y + posY);
        }
    },
    clone: function() {
        var record =  new SymRecord(this.posX,this.posY,this.type,this.name);
        record.owner = this.owner;
        for (var i = 0; i < this.sizeElement; i++)
            record.push(this.itemsElement[i].clone());
        return record;
    },
    draw: function(ctx) {
        with(this)with(app.tools){
            DrawForVis(ctx).record(getAdjustedX(posX),getAdjustedY(posY),getAdjustedR(rVar/2.5),colVar,name);
            for(var i = 0; i < sizeElement; i++) {
                DrawForVis(ctx).connect(getAdjustedX(itemsElement[i].posX),getAdjustedY(itemsElement[i].posY),
                    getAdjustedX(posX),getAdjustedY(posY-rVar/2),4,colVar);
                itemsElement[i].draw(ctx);
            }
        }
    },
    inputRandom: function(maxValue) {
        for(var i = 0; i < this.sizeElement; i++)
            this.itemsElement[i].inputRandom(maxValue);
    },
    findVar: function(pos,tools) {
        var find = this.parent(pos,tools);
        if (find != -1) return this;
        for (var k = 0; k < this.sizeElement; k++) {
            find = this.itemsElement[k].findVar(pos,tools);
            if (find != -1) return find;
        }
        return -1;
    },
    changePos: function(pos,tools) {
        var x = this.posX;
		var y = this.posY;
        this.posX = pos[0]/tools.scale-tools.left;
        this.posY = pos[1]/tools.scale-tools.top;
        for(var i = 0; i < this.sizeElement; i++) {
            this.itemsElement[i].setPosY(this.itemsElement[i].posY - y + this.posY);
            this.itemsElement[i].setPosX(this.itemsElement[i].posX - x + this.posX);
        }
    }
})
