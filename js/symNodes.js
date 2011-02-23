Symbol = new Class({
    initialize: function(pX,pY){
        this.posX = pX;
        this.posY = pY;
    },
    visible : true,
    transp : 1,
    turn : 0,
    posX : 0,
    posY : 0,
    draw : function(ctx){},
    setVisible : function(vis){
        this.visible = vis;
    },
    getVisible : function(){
        return this.visible;
    },
    getPosX : function(){
        return this.posX;
    },
    getPosY : function(){
        return this.posY;
    },
    setPosX : function(pX){
        this.posX = pX;
    },
    setPosY : function(pY){
        this.posY = pY;
    },
    clone : function(){
        return new Symbol(this.posX,this.posY);
    }
});

SymVar = new Class({
    Extends: Symbol,
    initialize: function (v,pX,pY,cVar,cR){
        with(this){
            parent(pX,pY);
            val = v;
            colVar = cVar;
            rVar = cR;
        }
    },
    val : 0,
    colVar : 0,
    rVar : 0,
    getRVar : function(){
        return this.rVar;
    },
    setRVar : function(r){
        this.rVar = r;
    },
    getValue : function(){
        return this.val;
    },
    setValue : function(v){
        this.val = v;
    },
    getColVar : function(){
        return this.colVar;
    },
	inputRandom : function (maxValue){
	    this.val = Math.floor(Math.random()*maxValue);
	},
    clone : function(){
        return new SymVar(this.val,this.posX,this.posY,this.colVar,this.rVar);
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            if (val != '') DrawForVis(ctx).text(val,posX,posY,rVar,0,type);
        }
    }
});

SymVarName = new Class({
    Extends: SymVar,
    initialize: function (v,pX,pY,type,nameV){
        var cR = 15, cVar = 'pink';
        if (type == 'int') {
            cR = 20;
            cVar = 'green';
        }
        else if (type == 'real') {
            cR = 25;
            cVar = 'red';
        }
        else if (type == 'record') {
            cR = 20;
            cVar = 'grey';
        }
        this.parent(v,pX,pY,cVar,cR);
        this.name = nameV;
        this.type = type;
    },
    name : '',
    type : 'int',
    getName : function(){
        return this.name;
    },
    setName : function(n){
        this.name = n;
    },
    inputRandom : function (maxValue){
        if (this.type == 'char') this.val = "'" + String.fromCharCode(48 + Math.floor(Math.random()*80)) + "'";
	    else this.val = Math.floor(Math.random()*maxValue);
	},
    clone : function(){
        return new SymVarName(this.val,this.posX,this.posY,this.type,this.name);
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            DrawForVis(ctx).text(val,posX,posY,rVar,0,type);
            DrawForVis(ctx).flag(posX-rVar,posY-4,4,6,colVar,name,rVar,155*Math.PI/180);
        }
    }
})

SymVarArrayIndex = new Class({
    Extends: SymVarName,
    initialize: function (v,pX,pY,type,nameV){
        this.parent(v,pX,pY,type,nameV);
    },
    clone : function(){
        return  new SymVarArrayIndex(this.val,this.posX,this.posY,this.type,this.name);
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            DrawForVis(ctx).text(val,posX,posY,rVar,0,type);
            DrawForVis(ctx).hat(posX,posY-2.25*rVar,rVar,'yellow',name);
        }
    }
})

SymVarItemRecord = new Class({
    Extends: SymVarName,
    initialize: function (v,pX,pY,type,nameV){
        this.parent(v,pX,pY,type,nameV);
        this.turn = Math.PI;
    },
    clone : function(){
        return  new SymVarItemRecord(this.val,this.posX,this.posY,this.type,this.name);
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            DrawForVis(ctx).text(val,posX,posY,rVar,0,type);
            DrawForVis(ctx).hatRecord(posX,posY,rVar,colVar,name,turn);
        }
    }
})

SymArray = new Class({
    Extends: SymVarName,
    initialize: function (pX,pY,sArray,fIndex,cloneItem,nameV){
        this.parent(0,pX,pY,cloneItem.type,nameV);
        this.firstIndex = fIndex;
        this.sizeElement = sArray;
        this.type = 'array';
        this.turn = Math.PI/4; //для красоты
        this.itemsElement = new Array(); //для хранения каждого элемнта массива
        if (cloneItem instanceof SymArray)
            this.turn = cloneItem.turn + Math.PI / 2;
        for (var i = 0; i <= this.sizeElement; i++){
	        var x = this.posX + this.rVar*2.2*i; //положение каждого шарика по x
		    var y = this.posY - i*this.rVar*Math.sin(this.turn);
            var item  =  cloneItem.clone();
            item.setPosX(x);
            item.setPosY(y);
            item.setName(i + this.firstIndex);
		    this.itemsElement.push(item);
	    }
    },
    firstIndex : 0,
    sizeElement : 0,
    itemsElement : null,
    setPosX : function(pX) {
        with(this) {
            posX = pX;
            for (var i = 0; i <= sizeElement; i++)
                itemsElement[i].setPosX(posX + itemsElement[i].rVar*i*2.2);
        }
    },
    setPosY : function(pY) {
        with(this) {
            posY = pY;
            for (var i = 0; i <= sizeElement; i++)
                itemsElement[i].setPosY(posY + i*itemsElement[i].rVar*Math.sin(this.turn));
        }
    },
    setName : function(name) {
        this.name = name;
        for (var i = 0; i <= this.sizeElement; i++)
            this.itemsElement[i].name = this.name + ' ' + (i + this.firstIndex);
    },
    clone : function() {
        return new SymArray(this.posX,this.posY,this.sizeElement,this.firstIndex,this.itemsElement[0],this.name);
    },
    draw : function(ctx){
        with(this) {
	        for(var i = sizeElement-1; i >= 0; i--){
			    DrawForVis(ctx).connect(itemsElement[i+1].posX,itemsElement[i+1].posY,
			        itemsElement[i].posX,itemsElement[i].posY,rVar/5,'yellow');
			}
		    for(var i = sizeElement; i >= 0; i--){
		       itemsElement[i].draw(ctx);
		    }
		    if (typeof(name) != 'number')
                 DrawForVis(ctx).flag(posX-rVar,posY,rVar/5,6,colVar,name,rVar,155*Math.PI/180);
	    }
    },
    inputRandom : function(maxValue){
        for(var i = 0; i <= this.sizeElement; i++){
            this.itemsElement[i].inputRandom(maxValue);
        }
    }
})

SymRecord = new Class({
    Extends: SymVarName,
    initialize: function (pX,pY,type,nameV){
        this.parent(0,pX,pY,type,nameV);
        this.itemsElement = new Array();
        this.sizeElement = 0;
    },
    sizeElement : 0,
    itemsElement : null,
    clone : function(){
        var rec =  new SymVarRecord(this.val,this.posX,this.posY,this.type,this.name);
        for (var i = 0; i < this.sizeElement; i++){
            var sVar = this.itemsElement[i].clone();
            rec.push(sVar);
        }
        return rec;
    },
    getItemProperty : function(number){
        var itemProperty = new Array();
        with(this){
            itemProperty[0] = -Math.PI/(this.sizeElement+1)*(number+1);//угол
            itemProperty[1] = posX + 40*(1 + itemsElement.length/6)*Math.cos(itemProperty[0]);//позиция по x
            itemProperty[2] = posY + 40*(1 + itemsElement.length/6)*Math.sin(itemProperty[0]);//позиция по y
            itemProperty[0] = itemProperty[0] - Math.PI/2;
        }
        return itemProperty;
    },
    push : function(vItem){
        with(this){
            for(var i = 0; i < sizeElement; i++){
                if (itemsElement[i].getName().toLowerCase() == vItem.getName().toLowerCase()) return -1;
            }
            itemsElement.push(vItem);
            sizeElement+=1;
            for(var i = 0; i < sizeElement; i++){
                var property = getItemProperty(i);
                itemsElement[i].turn = property[0];
                itemsElement[i].setPosY(property[2]);
                itemsElement[i].setPosX(property[1]);
            }
        }
    },
    setPosX : function(vX) {
        with(this) {
            var x = posX;
            posX = vX;
            for(var i = 0; i < sizeElement; i++)
                itemsElement[i].setPosX(itemsElement[i].posX - x + posX);
        }
    },
    setPosY : function(vY){
        with(this){
            var y = posY;
            posY = vY;
            for(var i = 0; i < sizeElement; i++)
                itemsElement[i].setPosY(itemsElement[i].posY - y + posY);
        }
    },
    clone : function(){
        var record =  new SymRecord(this.posX,this.posY,this.type,this.name);
        for (var i = 0; i < this.sizeElement; i++)
            record.push(this.itemsElement[i].clone());
        return record;
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).record(posX,posY,rVar/2.5,colVar,name);
            for(var i = 0; i < sizeElement; i++){
                DrawForVis(ctx).connect(itemsElement[i].posX,itemsElement[i].posY,posX,posY-rVar/2,4,colVar);
                itemsElement[i].draw(ctx);
            }
        }
    },
    inputRandom : function(maxValue){
        for(var i = 0; i < this.sizeElement; i++){
            this.itemsElement[i].inputRandom(maxValue);
        }
    }
})
