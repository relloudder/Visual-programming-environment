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
    draw: function(ctx,tools) {},
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
    setNewPosX: function(pX) {
        this.posX = pX;
    },
    setNewPosY: function(pY) {
        this.posY = pY;
    },
    clone: function() {
        return new Symbol(this.posX,this.posY);
    }
});

SymbolName = new Class({
    Extends: Symbol,
    initialize: function(pX,pY,text) {
        this.text = text;	
        this.turn = -Math.PI;
    },
    text: null,
    draw: function(ctx,tools) {
        if (this.visible)
            DrawForVis(ctx).flag(tools.getAdjustedX(this.posX+this.text.length*4),tools.getAdjustedY(this.posY+8),
                tools.getAdjustedR(10),1,'black',this.text,tools.getAdjustedR(20),this.turn);
    },
    findVar: function(pos, tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if ((this.posX > x) && ((this.posX-20) < x) && ((this.posY-30) < y) && ((this.posY) > y)) {
            return this;
        }
        return -1;
    }

});

SymVar = new Class({
    Extends: Symbol,
    initialize: function(val,pX,pY,colVar,rVar) {
        this.parent(pX,pY);
        this.val = val;
        this.colVar = colVar;
        this.rVar = rVar;
        this.jump = false;
    },
    val: 0,
    colVar: 0,
    rVar: 0,
    jump: false,
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
    setType: function(type) {
        this.type = type;
        this.rVar  = 15;
        if (type == 'real') this.rVar = 25;
        if (type == 'int') this.rVar = 20;
    },
	inputRandom: function(maxValue) {
	    this.val = Math.floor(Math.random() * maxValue);
	},
    clone: function() {
        return new SymVar(this.val, this.posX, this.posY, this.colVar, this.rVar);
    },
    draw: function(ctx,tools) {
        DrawForVis(ctx).ball(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY),tools.getAdjustedR(this.rVar), this.colVar);
        if (this.val == '') {
            return;
        }
        DrawForVis(ctx).text(this.val,tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY),tools.getAdjustedR(this.rVar),0,this.type);
    },
    findVar: function(pos,tools) {
        var x = pos[0]/tools.scale - tools.left;
        var y = pos[1]/tools.scale - tools.top;
        if (Math.pow(x - this.getPosX(), 2) + Math.pow(y - this.getPosY(), 2) <= 1.5 * Math.pow(this.rVar, 2)) {
            return this;
        }
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
            'int': new colorAndRadius('rgba(255,0,0,1)', 15),
            'real': new colorAndRadius('rgba(0,128,0,1)', 20),
            'record': new colorAndRadius('rgba(160,160,160,1)', 20),
            'boolean': new colorAndRadius('rgba(0,0,255,1)', 10),
            'char': new colorAndRadius('rgba(255,153,255,1)', 10),
            'array': new colorAndRadius('rgba(0,0,0,1)', 20),
            'string': new colorAndRadius('rgba(255,153,255,1)', 20),
            'binOp': new colorAndRadius('IndianRed', 25),
            'const': new colorAndRadius('gray', 20)
        }
        var t = typeAndValue[type];
        this.parent(v,pX,pY,t.color,t.radius);
        this.name = nameV;
        this.type = type;
    },
    name: '',
    type: 'int',
    input: false,
    posStatment: [0,0],
    getName: function() {
        return this.name;
    },
    setName: function(name) {
        this.name = name;
    },
    inputRandom: function (maxValue) {
        if (this.type == 'char') {
            this.val =  maxValue ==0 ? this.val = ' ': String.fromCharCode(48 + Math.floor(Math.random() * 80));
        } else if (this.type == 'boolean') {
            this.val =  maxValue == 0 ? 'false': Math.round(Math.random()) == 0 ? 'false' : 'true';
        } else {
            this.val = Math.floor(Math.random() * maxValue);
        }
    },
    clone: function() {
        var element = new SymVarName(this.val, this.posX, this.posY, this.type, this.name);
        element.owner = this.owner;
        return element;
    },
    draw: function(ctx,tools) {
        var dY = 0;
        if (this.jump) dY = 1;
        var y = -dY + Math.ceil(Math.random()*2*dY);
        if (this.input) {
            app.showInput = true;
            DrawForVis(ctx).halfBall(tools.getAdjustedX(this.posX),
                tools.getAdjustedY(this.posY),tools.getAdjustedR(this.rVar),this.colVar);
            // вычисляем, где вывести поле для ввода
            var x = tools.getAdjustedX(this.posX)-tools.getAdjustedR(this.rVar)*1.2+$("#wCanvas").offset().left;
            var y = tools.getAdjustedY(this.posY)-tools.getAdjustedR(this.rVar)*1.2+$("#wCanvas").offset().top;
            $('#input').css('top',y+'px').css('left',x+'px').css('display','inline');
            $("#editInput").val('');
            $('#editInput').focus();
            DrawForVis(ctx).lineVar(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY),
            tools.getAdjustedX(this.posStatment[0]),tools.getAdjustedY(this.posStatment[1]),tools.getAdjustedR(4),'rgba(255,106,106,0.7)');
            return 0;
        }
        DrawForVis(ctx).ball(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY+y/2),tools.getAdjustedR(this.rVar+y/4),this.colVar);
        DrawForVis(ctx).text(this.val,tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY+y/2),
            tools.getAdjustedR(this.rVar+y/4),0,this.type);
        if (this.owner == 'array') {
            DrawForVis(ctx).hat(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY-2.25*this.rVar+y/2),
                tools.getAdjustedR(this.rVar),'yellow',this.name);
        } else if (this.owner == 'record') {
            DrawForVis(ctx).hatRecord(tools.getAdjustedX(this.posX),tools.getAdjustedY(this.posY+y/2),tools.getAdjustedR(this.rVar),
                this.colVar,this.name,this.turn+y*Math.PI/180);
        } else {
            DrawForVis(ctx).flag(tools.getAdjustedX(this.posX-this.rVar),tools.getAdjustedY(this.posY-4+y/2),tools.getAdjustedR(this.rVar/5),tools.getAdjustedR(6),this.colVar,
                this.name,tools.getAdjustedR(this.rVar),(155+y)*Math.PI/180);
        }
    },
    setValueWithIf: function(value) {
        var reInt = /^\-?\d+/g;
        var reReal = /^\-?\d+[.]\d+/g;
        var reChar = /^\'.\'/;
        var reString = /^[^\'\n]*/g;
        if ((this.type == 'int') && (reInt.exec(value) != value)) {
            alert('invalid input, must be integer number');
            return 'null';
        }
        else if ((this.type == 'real') && (reReal.exec(value) != value) && (reInt.exec(value) != value)) {
            alert('invalid input, must be real number');
            return 'null';
        }
        else if ((this.type == 'char') && (reString.exec(value) != value)) {
            alert('invalid input, must be char number');
            return 'null';
        }
        else return value;
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
            item.setNewPosX(x);
            item.setNewPosY(y);
            item.setName(i + this.firstIndex);
		    this.itemsElement.push(item);
	    }
    },
    firstIndex: 0,
    sizeElement: 0,
    itemsElement: null,
    setNewPosX: function(pX) {
        with(this) {
            posX = pX;
            for (var i = 0; i <= sizeElement; i++) {
                itemsElement[i].setPosX(posX + itemsElement[i].rVar*i*2.2);
            }
        }
    },
    setNewPosY: function(pY) {
        with(this) {
            posY = pY;
            for (var i = 0; i <= sizeElement; i++) {
                itemsElement[i].setPosY(posY + i*itemsElement[i].rVar*Math.sin(this.turn)*1.2);
            }
        }
    },
    setPosX: function(pX) {
        with(this) {
            for (var i = 0; i <= sizeElement; i++) {
                itemsElement[i].setPosX(itemsElement[i].getPosX()-posX +pX);
            }
            posX = pX;
        }
    },
    setPosY: function(pY) {
        with(this) {
            for (var i = 0; i <= sizeElement; i++) {
                itemsElement[i].setPosY(itemsElement[i].getPosY()-posY +pY);
            }
            posY = pY;
        }
    },
    setName: function(name) {
        this.name = name;
        for (var i = 0; i <= this.sizeElement; i++) {
            this.itemsElement[i].name = this.name + ' ' + (i + this.firstIndex);
        }
    },
    clone: function() {
        var element = new SymArray(this.posX,this.posY,this.sizeElement,this.firstIndex,this.itemsElement[0],this.name);
        element.turn = this.turn;
        element.owner = this.owner;
        return element;
    },
    draw: function(ctx,tools) {
        with(this) {
	        for (var i = sizeElement-1; i >= 0; i--) {
			    DrawForVis(ctx).connect(tools.getAdjustedX(itemsElement[i+1].posX),tools.getAdjustedY(itemsElement[i+1].posY),
			        tools.getAdjustedX(itemsElement[i].posX),tools.getAdjustedY(itemsElement[i].posY),tools.getAdjustedR(rVar/5),'yellow');
			}
            if (sizeElement != -1) {
                for (var i = sizeElement; i >= 0; i--) {
                    if (itemsElement[i].visible) itemsElement[i].draw(ctx,tools);
                }
            }
            else DrawForVis(ctx).nullString(tools.getAdjustedX(posX-rVar),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
		    if (typeof(this.name) != 'number') {
                 DrawForVis(ctx).flag(tools.getAdjustedX(posX-rVar/2),tools.getAdjustedY(posY),tools.getAdjustedR(rVar/5),tools.getAdjustedR(6),colVar,name,
                     tools.getAdjustedR(rVar),155*Math.PI/180);
            }
	    }
    },
    inputRandom: function(maxValue) {
        for(var i = 0; i <= this.sizeElement; i++) {
            this.itemsElement[i].inputRandom(maxValue);
        }
    },
    findVar: function(pos,tools) {
        var find = this.parent(pos,tools);
        if (find != -1) {
            return this;
        }
        for (var k = 0; k <= this.sizeElement; k++) {
            find = this.itemsElement[k].findVar(pos,tools);
            if (find != -1) {
                return find;
            }
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
    },
    getItemArrByNum : function(num) {
        if (((num - this.firstIndex) < 0) || ((num - this.firstIndex) > this.sizeElement)) {
            app.exception.error('Element with number ' + num + ' does not exist');
            return -1;
        }
        return this.itemsElement[num - this.firstIndex];
    }
})

SymString = new Class({
    Extends: SymArray,
    initialize: function (pX,pY,sArray,maxS,nameV) {
        var cloneItem = new SymVarName(0,0,0,'char','');
        cloneItem.owner = 'string';
        this.parent(pX,pY,sArray,1,cloneItem,nameV);
        this.maxSize = maxS;
        this.type='string';
    },
    maxSize:0,
    clone: function() {
        var element = new SymString(this.posX,this.posY,this.sizeElement,this.maxSize,this.name);
        element.turn = this.turn;
        element.owner = this.owner;
        return element;
    },
    getValue: function() {
        var s = '';
        for(var i = 0; i <= this.sizeElement; i++) {
            s = s+this.itemsElement[i].getValue();
        }
        return s;
    },
    setValue: function (str) {
        for (var i = 0; i <= this.sizeElement; i++) {
            this.itemsElement[i].setValue(str.charAt(i));
        }
    },
    setNewString: function(str) {
        this.turn = Math.PI/4;
        this.itemsElement = new Array();
        var cloneItem = new SymVarName(0,0,0,'char','');
        cloneItem.owner = 'array';
        this.sizeElement = str.length - 1;
        var k = 0;
        for (var i = 0; i <= this.sizeElement; i++) {
            var x = this.posX + this.rVar*k;
            var y = this.posY - this.rVar*Math.sin(this.turn)*k/1.1;
            var item  =  cloneItem.clone();
            item.setPosX(x);
            item.setPosY(y);
            item.setName(i + 1);
            item.setValue(str.charAt(i));
            this.itemsElement.push(item);
            k = k+1.1*1/(i/4+1);
        }
    },
    setNewPosX: function(pX) {
        with(this) {
            posX = pX;
            for (var i = 0; i <= sizeElement; i++) {
                itemsElement[i].setPosX(posX + itemsElement[i].rVar*i*1.1);
            }
        }
    },
    setNewPosY: function(pY) {
        with(this) {
            posY = pY;
            for (var i = 0; i <= sizeElement; i++) {
                itemsElement[i].setPosY(posY - i*itemsElement[i].rVar*Math.sin(this.turn));
            }
        }
    }
});

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
            for (var i = 0; i < sizeElement; i++) {
                if (itemsElement[i].getName().toLowerCase() == vItem.getName().toLowerCase()) {
                    return -1;
                }
            }
            vItem.owner = 'record';
            itemsElement.push(vItem);
            sizeElement+=1;
            for (var i = 0; i < sizeElement; i++) {
                var property = getItemProperty(i);
                itemsElement[i].turn = property[0];
                itemsElement[i].setPosX(property[1]);
                itemsElement[i].setPosY(property[2]);
            }
        }
    },
    setPosX: function(vX) {
        with(this) {
            var x = posX;
            posX = vX;
            for (var i = 0; i < sizeElement; i++) {
                itemsElement[i].setPosX(itemsElement[i].posX - x + posX);
            }
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
    setNewPosX:function(vX) {
        this.setPosX(vX);
    },
    setNewPosY:function(vY) {
        this.setPosY(vY);
    },
    clone: function() {
        var record =  new SymRecord(this.posX,this.posY,this.type,this.name);
        record.owner = this.owner;
        for (var i = 0; i < this.sizeElement; i++)
            record.push(this.itemsElement[i].clone());
        return record;
    },
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).record(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar/2.5),colVar,name);
            var dx = rVar*2/sizeElement;
            var x = posX + rVar - dx/2;
            for (var i = 0; i < sizeElement; i++) {
                DrawForVis(ctx).connect(tools.getAdjustedX(itemsElement[i].posX),tools.getAdjustedY(itemsElement[i].posY),
                    tools.getAdjustedX(x),tools.getAdjustedY(posY-rVar/2),4,colVar);
                x-=dx;
                if (itemsElement[i].visible) itemsElement[i].draw(ctx,tools);
            }
        }
    },
    inputRandom: function(maxValue) {
        for(var i = 0; i < this.sizeElement; i++)
            this.itemsElement[i].inputRandom(maxValue);
    },
    findVar: function(pos,tools) {
        var find = this.parent(pos,tools);
        if (find != -1) {
            return this;
        }
        for (var k = 0; k < this.sizeElement; k++) {
            find = this.itemsElement[k].findVar(pos,tools);
            if (find != -1) {
                return find;
            }
        }
        return -1;
    },
    changePos: function(pos,tools) {
        var x = this.posX;
		var y = this.posY;
        this.posX = pos[0]/tools.scale-tools.left;
        this.posY = pos[1]/tools.scale-tools.top;
        for (var i = 0; i < this.sizeElement; i++) {
            this.itemsElement[i].setPosY(this.itemsElement[i].posY - y + this.posY);
            this.itemsElement[i].setPosX(this.itemsElement[i].posX - x + this.posX);
        }
    },
    getItemByName: function(name) {
        for (var i = 0; i < this.sizeElement; i++) {
            if (this.itemsElement[i].getName() == name) {
                return this.itemsElement[i];
            }
        }
        return -1;
    },
});

SymConst = new Class({
    Extends: SymVarName,
    initialize: function (v,pX,pY,type) {
        this.parent(v,pX,pY,type,'');
        this.colVar = '#999';
    },
    draw: function(ctx, tools) {
    with(this) {
        DrawForVis(ctx).ball(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
        DrawForVis(ctx).text(val,tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),0,type);
    }}
});

SymFunction = new Class({
    Extends: SymVarName,
    initialize: function (pX,pY,type,name,listParam) {
        this.parent('',pX,pY,type,name);
        this.listParam = listParam;
        this.visible = false;
        this.transp = 0.6;
    },
    listParam: null,
    draw: function(ctx, tools) {
        with(this) {
            DrawForVis(ctx).functionBall(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar, transp);
            DrawForVis(ctx).text(name,tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),0,type);
        }
    },
    getPosSuch: function(n) {
        var dx, dy
        dx = this.rVar*2*Math.cos(Math.PI/(this.listParam.length+1)*n);
        dy = this.rVar*2*Math.sin(Math.PI/(this.listParam.length+1)*n);
        return new Array(this.posX - dx,this.posY - dy);
    },
    clone: function() {
        return new SymFunction(this.posX,this.posY,this.type,this.name,this.listParam);
    }
});
