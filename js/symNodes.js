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
            if (val != '') DrawForVis(ctx).text(val,posX,posY,rVar,0);
        }
    }
});

SymVarName = new Class({
    Extends: SymVar,
    initialize: function (v,pX,pY,cVar,cR,nameV){
        this.parent(v,pX,pY,cVar,cR);
        this.name = nameV;
    },
    name : '',
    getName : function(){
        return this.name;
    },
    setName : function(n){
        this.name = n;
    },
    clone : function(){
        return new SymVarName(this.val,this.posX,this.posY,this.colVar,this.rVar,this.name);
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            DrawForVis(ctx).text(val,posX,posY,rVar,0);
            DrawForVis(ctx).flag(posX-rVar,posY-4,4,6,colVar,name,rVar,155*Math.PI/180);
        }
    }
})

SymVarArrayIndex = new Class({
    Extends: SymVarName,
    initialize: function (v,pX,pY,cVar,cR,nameV){
        this.parent(v,pX,pY,cVar,cR,nameV);
    },
    cloneVar : function(){
        return  new SymVarArrayIndex(this.val,this.posX,this.posY,this.colVar,this.rVar,this.name);
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            DrawForVis(ctx).text(val,posX,posY,rVar,0);
            DrawForVis(ctx).hat(posX,posY-2.25*rVar,rVar,'yellow',name);
        }
    }
})

SymVarItemRecord = new Class({
    Extends: SymVarName,
    initialize: function (v,pX,pY,cVar,cR,nameV){
        this.parent(v,pX,pY,cVar,cR,nameV);
        this.turn = Math.PI;
    },
    cloneVar : function(){
        return  new SymVarItemRecord(this.val,this.posX,this.posY,this.colVar,this.rVar,this.name);
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            DrawForVis(ctx).text(val,posX,posY,rVar,0);
            DrawForVis(ctx).hatRecord(posX,posY,rVar,colVar,name,turn);
        }
    }
})

SymArray = new Class({
    Extends: SymVarName,
    initialize: function (pX,pY,sArray,fIndex,cloneItem,nameV){
        this.parent(0,pX,pY,cloneItem.colVar,cloneItem.rVar,nameV);
        this.firstIndex = fIndex;
        this.sizeArray = sArray;
        this.turn = Math.PI/6; //для красоты
        this.itemsElement = new Array(); //для хранения каждого элемнта массива
        for (var i = 0; i <= this.sizeArray; i++){
	        var x = this.posX + this.rVar*2.2*i; //положение каждого шарика по x
		    var y = this.posY - i*this.rVar*Math.sin(this.turn);
            var item  =  cloneItem.cloneVar();
            item.setPosX(x);
            item.setPosY(y);
            item.setName(i+this.firstIndex);
		    this.itemsElement.push(item);
	    }
    },
    firstIndex : 0,
    sizeArray : 0,
    itemsElement : null,
    draw : function(ctx){
        with(this) {
	        for(var i = sizeArray-1; i >= 0; i--){
			    DrawForVis(ctx).connect(itemsElement[i+1].posX,itemsElement[i+1].posY,
			        itemsElement[i].posX,itemsElement[i].posY,rVar/5,'yellow');
			}
		    for(var i = sizeArray; i >= 0; i--){
		       itemsElement[i].draw(ctx);
		    }
            DrawForVis(ctx).flag(posX-rVar,posY,rVar/5,6,colVar,name,rVar,155*Math.PI/180);
	    }
    },
    inputRandom : function(maxValue){
        for(var i = 0; i <= this.sizeArray; i++){
            this.itemsElement[i].inputRandom(maxValue);
        }
    }
})
