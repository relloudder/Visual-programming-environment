Symbol = new Class({
    initialize: function(pX,pY){
        this.posX = pX;
        this.posY = pY;
    },
    visible : true,
    transp : 1,
	draw : function(ctx){
	},
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
	draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            if (val != '') DrawForVis(ctx).text(val,posX,posY,rVar,s0);
        }
    }
});

SymVarName = new Class({
    Extends: SymVar,
    initialize: function (v,pX,pY,cVar,cR,nameV){
        this.parent(v,pX,pY,cVar,cR);
        this.name = nameV;
    },
    getName : function (){
        return this.name;
    },
    draw : function(ctx){
        with(this){
            DrawForVis(ctx).ball(posX,posY,rVar,colVar);
            DrawForVis(ctx).text(val,posX,posY,rVar,0);
            DrawForVis(ctx).flag(posX-rVar,posY-4,4,6,colVar,name,rVar,155*Math.PI/180);
        }
    }
})
