function extend (Child,Parent){
    var F = function(){}
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

//Symbol
Symbol = function(pX, pY){
    with(this){
        posX = pX;
        posY = pY;
        visible = true;
        transp = 1; //прозрачность
    }
}

Symbol.prototype.posX = null;
Symbol.prototype.posY = null;
Symbol.prototype.visible = null;
Symbol.prototype.transp = null;

Symbol.prototype.draw = function(ctx){};

Symbol.prototype.setVisible = function(vis){
    this.visible = vis;
}

Symbol.prototype.getVisible = function(){
    return this.visible;
}

Symbol.prototype.getPosX = function(){
    return this.posX;
}

Symbol.prototype.getPosY = function(){
    return this.posY;
}

//SymVar
SymVar = function (v, pX, pY, cVar){
    SymVar.superclass.constructor.apply(this,[pX,pY]);
	with (this){
        val = v;
        colVar = cVar;
        rVar = 20;
    }
}

extend(SymVar,Symbol);

SymVar.prototype.val = null;
SymVar.prototype.rVar = null;
SymVar.prototype.colVar = null;

SymVar.prototype.getRVar = function(){
    return this.rVar;
}

SymVar.prototype.setRVar = function(r){
    this.rVar = r; 
}

SymVar.prototype.getValue = function(){
    return this.val;
}

SymVar.prototype.setValue = function(v){
    this.val = v;
}

SymVar.prototype.getColVar = function(){
    return this.colVar;
}

SymVar.prototype.draw = function(ctx){
    with(this){
        DrawForVis(ctx).ball(posX,posY,rVar,colVar);
        if (val != '') DrawForVis(ctx).text(val,posX,posY,rVar,0);
    }
}

//SymVarName
SymVarName = function (v,pX,pY,cVar,nameV){
    SymVarName.superclass.constructor.apply(this,[v,pX,pY,cVar]);
    this.name = nameV;
}

extend(SymVarName,SymVar);

SymVarName.prototype.name = null;

SymVarName.prototype.getName = function (){
    return this.name;
}

SymVarName.prototype.draw = function(ctx){
    with(this){
        DrawForVis(ctx).ball(posX,posY,rVar,colVar);
        DrawForVis(ctx).text(val,posX,posY,rVar,0);
        DrawForVis(ctx).flag(posX-rVar,posY-4,4,6,colVar,name,rVar,155*Math.PI/180);
    }
}
