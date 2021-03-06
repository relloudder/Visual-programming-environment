SymDinamicVisible = new Class({
    Extends: SymVar,
    initialize: function(symV, val) {
        this.symVisible = symV;
        this.showVisible = val;
    },
    symVisible : null,
    showVisible : null,
    draw: function(ctx,tools) {
        this.symVisible.show = this.showVisible;
        return 0;
    }
});

SymVarModifiable = new Class ({
    Extends: SymVar,
    initialize: function(val,pX,pY,cVar,rVar,numberOfMove) {
        this.parent(val,pX,pY,cVar,rVar);
        this.numberOfMove = numberOfMove;
        this.angle = 0;
    },
    numberOfMove: null,
    angle: 0,
    type: 'int'
});

SymVarMove = new Class ({
    Extends: SymVarModifiable,
    initialize: function(val,pX,pY,cVar,rVar,endX,endY,g) {
        this.parent(val,pX,pY,cVar,rVar,60);
        this.aY = g; //acceleration
		//increase count of moving if displacement for X is too small
		var dX = Math.abs(pX - endX);
		if (dX < 50) {
		    dX = 100;
		}
		this.numberOfMove = Math.ceil(dX/(app.speed*app.dTime));
		this.timeOneMove = dX/(this.numberOfMove);
		var t = this.timeOneMove*this.numberOfMove;
		this.vX = (endX - pX)/t;
        this.vY = (pY - endY + this.aY*Math.pow(t,2)/2)/t;
        if (pY-Math.pow(this.vY,2)/(2*this.aY) < 0) {
            this.aY = 0.003;
            this.vY = (pY - endY + this.aY*Math.pow(t,2)/2)/t;
        }
    },
    aY: 0,
    vY: 0,
    vX: 0,
    timeOneMove: 0,
    // function running before move
    createSymVar: function(ctx,tools) {
        return 0;
    },
    // function running after move
    deleteSymVar: function(ctx,tools) {
        return 0;
    },
    draw: function(ctx,tools) {
        with(this) {
            var t = timeOneMove; //time of one move
            if(createSymVar(ctx,tools) == 1) return 1;
            if(numberOfMove <= 0) return deleteSymVar(ctx,tools);
            DrawForVis(ctx).ball(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
            DrawForVis(ctx).text(val,tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),angle,'int');
            numberOfMove--;
            vY = vY - aY*t;
            var hx = vX*t;
            var hy = -(vY*t + aY*Math.pow(t,2)/2);
            posX += hx;
            posY += hy;
            var angleOfRotation = Math.sqrt(Math.pow(hx,2) + Math.pow(hy,2))/rVar;
            if (hx > 0) angle += angleOfRotation;
            else angle -= angleOfRotation;
            return 1;
        }
    }
});

//movement from one object (from) to another (to) with g
SymVarInteraction = new Class ({
    Extends: SymVarMove,
    initialize: function(from,to,g) {
        this.parent(from.val,from.posX,from.posY,from.colVar,from.rVar,to.posX,to.posY,g);
        this.from = from;
        this.to = to;
		this.maxNumberOfMerSep = Math.ceil(this.numberOfMove/3);
        this.numberOfMerSep = this.maxNumberOfMerSep; // number of steps of merge and separation
    },
    from: null,
    to: null,
    maxNumberOfMerSep : 0, // max number of steps of merge and separation
    numberOfMerSep: 0,
    directInteractive: 0, // derection for separation or marge
    visualConnect: false,
    draw: function(ctx,tools) {
        with(this) {
            if (this.visualConnect)  {
                DrawForVis(ctx).lineVar(tools.getAdjustedX(this.from.posX),tools.getAdjustedY(this.from.posY),
                tools.getAdjustedX(this.to.posX),tools.getAdjustedY(this.to.posY),tools.getAdjustedR(4),'rgba(255,106,106,0.7)');
            }
            var t = timeOneMove; //time of one move
            if (createSymVar(ctx,tools) == 1) return 1;
            if (numberOfMove <= 0) return deleteSymVar(ctx,tools);
            var k;
            if (!(this.from instanceof SymString)) {
                DrawForVis(ctx).ball(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
                DrawForVis(ctx).text(val,tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),angle,type);
            } else {
                for (var i = this.from.sizeElement; i >= 0 ; i--) {
                    if (k < 0.5) k = Math.random()*5;
                    else k =- Math.random()*5;
                    DrawForVis(ctx).ball(tools.getAdjustedX(posX+k),tools.getAdjustedY(posY+k),tools.getAdjustedR(rVar),colVar);
                    DrawForVis(ctx).text(val.charAt(i),tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),angle,'char');
                }
            }
            numberOfMove--;
            vY = vY - aY*t;
            var hx = vX*t;
            var hy = -(vY*t + aY*Math.pow(t,2)/2);
            posX += hx;
            posY += hy;
            var angleOfRotation = Math.sqrt(Math.pow(hx,2) + Math.pow(hy,2))/rVar;
            if (hx > 0) angle += angleOfRotation;
            else angle -= angleOfRotation;
            return 1;
        }
    }
});

SymVarSeparation = new Class ({
    Extends: SymVarInteraction,
    initialize: function(from,to,g) {
        this.parent(from,to,g);
        this.angle = - Math.PI/2;
        this.to.setVisible(false);
        this.directInteractive = - Math.PI/2;
        if (this.vX != 0) {
            this.directInteractive = Math.atan(-this.vY/this.vX);
        }
        if (this.vX < 0) {
            this.directInteractive += Math.PI;
        }
		this.val = from.getValue();
		this.type = from.type;
    },
    createSymVar: function (ctx,tools) {
        with(this) {
		    if (numberOfMerSep == 0) {
                numberOfMerSep--;
                angle = 0;
                colVar = to.colVar;
                var t = this.timeOneMove*this.numberOfMove;;
                vX = (to.posX - posX)/t;
                vY = -(to.posY - posY - aY*Math.pow(t,2)/2)/t;
                return 0;
            }
            if (numberOfMerSep > 0) {
                DrawForVis(ctx).divBall(tools.getAdjustedX(from.posX),tools.getAdjustedY(from.posY),
                    tools.getAdjustedR(rVar),colVar,angle,directInteractive,0);
                DrawForVis(ctx).divBall(tools.getAdjustedX(posX),tools.getAdjustedY(posY),
                    tools.getAdjustedR(rVar),colVar,angle,directInteractive,Math.PI);
                posX += 2*rVar/maxNumberOfMerSep*(Math.cos(directInteractive));
                posY += 2*rVar/maxNumberOfMerSep*(Math.sin(directInteractive));
                numberOfMerSep--;
                angle += Math.PI/(2*maxNumberOfMerSep);
                return 1;
            }
        }
    },
    deleteSymVar: function (ctx,tools) {
        this.to.setVisible(true);
        this.from.jump = false;
        return 0;
    },

});

SymVarMerge = new Class ({
    Extends: SymVarInteraction,
    initialize: function(from,to,g) {
        this.parent(from,to,g);
        //finding place for ball's union
        var y = this.to.posY;
        var x = this.to.posX;
        var t;
        while(Math.sqrt(Math.pow(x - this.to.posX,2) + Math.pow(y - this.to.posY,2)) < 2*this.rVar) {
	        this.numberOfMove--;
            t = this.numberOfMove*this.timeOneMove;
            y = this.from.posY - this.vY*t + this.aY*Math.pow(t,2)/2;
            x = this.from.posX + this.vX*t;
        }
        this.directInteractive = -Math.PI/2;
        if ((x - this.to.posX) != 0) {
            this.directInteractive = Math.atan((y - this.to.posY)/(x - this.to.posX));
        }
        if ((x - this.to.posX) < 0) {
            this.directInteractive += Math.PI;
        }
		this.type = to.type;
    },
    createSymVar: function (ctx,tools) {
        this.from.setVisible(false);
        this.val = this.from.getValue();
        this.rVar = this.to.rVar;
        return 0;
    },
    deleteSymVar: function (ctx,tools) {
        with(this) {
            if (numberOfMerSep == maxNumberOfMerSep) {
                if (this.to instanceof SymString)
                    if (this.to.sizeElement == 0) numberOfMerSep = 0;
                angle = 0;
            }
            if (numberOfMerSep == 0) {
                to.setValue(from.getValue());
                if (this.to instanceof SymString) this.to.setNewString(this.val);
                to.jump = false;
                return 0;
            }
            posX += (to.posX - posX)/numberOfMerSep;
            posY += (to.posY - posY)/numberOfMerSep;
            DrawForVis(ctx).divBall(tools.getAdjustedX(to.posX),tools.getAdjustedY(to.posY), tools.getAdjustedR(rVar),to.colVar,angle,directInteractive,0);
            DrawForVis(ctx).divBall(tools.getAdjustedX(posX),tools.getAdjustedY(posY), tools.getAdjustedR(rVar),to.colVar,angle,directInteractive,Math.PI);
            numberOfMerSep--;
            angle -= Math.PI/(2*maxNumberOfMerSep);
            return 1;
        }
    }
});

SymVarChange = new Class ({
    Extends: SymVarModifiable,
    initialize: function(change) {
        this.parent(change.val,change.posX,change.posY,change.colVar,change.rVar,20);
        this.changeableObject = change;
        this.rVar = change.rVar;
    },
    changeableObject: null
});

SymVarBiggerSmaller = new Class ({
    Extends: SymVarChange,
    initialize: function(change,changeEnd) { // changeEnd - finite size
        this.parent(change);
        this.deltaRadius = (changeEnd - change.rVar)/this.numberOfMove;
        this.val = change.getValue();
    },
    deltaRadius: null,
    draw: function(ctx,tools) {
        with(this) {
            changeableObject.setVisible(false);
            DrawForVis(ctx).ball(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
            DrawForVis(ctx).text(val,tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),0,changeableObject.type);
            if(numberOfMove == 0) {
                changeableObject.setVisible(true);
                changeableObject.rVar = rVar;
                return 0;
            }
            numberOfMove--;
            rVar += deltaRadius;
            return 1;
        }
    }
});

SymVarOpenClose = new Class ({
    Extends: SymVarChange,
    initialize: function(change,open,visible) {
        this.parent(change);
        this.numberOfMove = Math.ceil(4/app.speed);
        this.visible = visible;
        if (open) {
            this.angle = -90;
            this.angleOfRotation = (-5 - this.angle)/this.numberOfMove;
        } else {
            this.angle = -5;
            this.angleOfRotation = (-85 - this.angle)/this.numberOfMove;
        }
    },
    draw: function(ctx,tools) {
        with(this) {
            changeableObject.setVisible(false);
            DrawForVis(ctx).alphaBall(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar,angle);
            if (numberOfMove == 0) {
                var newSym = changeableObject;
                if (changeableObject instanceof SymString) newSym = changeableObject.itemsElement[0];
                newSym.input = true;
                if (angleOfRotation < 0)
                    if (newSym.input) {
                        newSym.input = false;
                        var vv = newSym.setValueWithIf($('#editInput').val());
                        if (vv == 'null') {
                            changeableObject.setVisible(true);
                            return -1;
                        }
                        if (changeableObject instanceof  SymString) changeableObject.setNewString(vv);
                        else if(changeableObject.type =='char') changeableObject.setValue(vv.charAt(0));
                        else changeableObject.setValue(vv);
                    }
                changeableObject.setVisible(visible);
                return 0;
            }
            numberOfMove--;
            angle += angleOfRotation;
            return 1;
        }
    }
});

SymBinOp = new Class ({
    Extends: SymVarName,
    initialize: function(val,pX,pY,type,alpha) {
        this.parent(val,pX,pY,'binOp','');
        this.alpha = alpha;
    },
    alpha: null,
    draw: function(ctx,tools) {
        with(this) {
            DrawForVis(ctx).halfBall(tools.getAdjustedX(posX),tools.getAdjustedY(posY),tools.getAdjustedR(rVar),colVar);
            DrawForVis(ctx).text(val,tools.getAdjustedX(posX),tools.getAdjustedY(posY + rVar/2.5),tools.getAdjustedR(rVar),0,type);
        }
    },
    getPosSuch: function(left) {
        var x, y, dx1, dx2, dy1, dy2
        dx1 = this.rVar*2*Math.cos(Math.PI/5*(4+this.alpha)-Math.PI/2);
        dx2 = this.rVar*2*Math.cos(Math.PI/5*(4-this.alpha)-Math.PI/2);
        dy1 = this.rVar*2*Math.sin(Math.PI/5*(4+this.alpha)-Math.PI/2);
        dy2 = this.rVar*2*Math.sin(Math.PI/5*(4-this.alpha)-Math.PI/2);
        x = this.posX - dx2;
        y = this.posY - dy2;
        if (!left) {
            x = this.posX + dx1;
            y = this.posY - dy1;
        }
        return new Array(x,y);
    },
    findVar: function(pos,tools){
        var x = pos[0]/tools.scale - tools.left;
        var  y = pos[1]/tools.scale - tools.top;
        if ((((x-this.getPosX())*(x-this.getPosX())+(y-this.getPosY())*(y-this.getPosY())) <= 2*this.rVar*this.rVar) && (y > this.getPosY())) {
            return this;
        }
        return -1;
    }
});

SymChangeCallFunction = new Class({
    Extends: SymVarChange,
    initialize: function(change,changeEnd, endTransp) {
        this.parent(change);
        this.numberOfMove = 30;
        this.oldR = this.changeableObject.rVar ;
        this.oldTransp = this.changeableObject.transp ;
        this.changeableObject.visible = true;
        this.deltaRadius = (changeEnd - change.rVar)/this.numberOfMove;
        this.deltaTransp = (change.transp - endTransp)/this.numberOfMove;
    },
    oldR: null,
    oldTransp: null,
    deltaTransp: null,
    draw: function(ctx,tools) {
        with(this) {
            if (numberOfMove == 0) {
                this.changeableObject.rVar = this.oldR  ;
                this.changeableObject.transp = this.oldTransp;
                this.changeableObject.visible = false;
                return 0;
            }
            changeableObject.draw(ctx,tools);
            numberOfMove--;
            changeableObject.transp -= deltaTransp;
            changeableObject.rVar += deltaRadius;
            return 1;
        }
    }
});

SymVarDown = new Class ({
    Extends: SymVarInteraction,
    initialize: function(from,to,g) {
        this.parent(from,to,g);
        this.val = from.getValue();
    },
    createSymVar: function(ctx,tools) {
        this.to.setVisible(false);
        this.from.setVisible(false);
        return 0;
    }
});

SymVarWrite = new Class ({
    initialize: function(text,aType,ln,n) {
        this.text = text;
        this.type = aType;
        this.ln = ln;
        this.n = n;
    },
    text: null,
    ln: null,
    type: null,
    n: null,
    draw: function(ctx,tools) {
        var output = $('#outputPanel');
        if (this.type == 'boolean')
            if (this.text == 'F') this.text = 'False';
            else this.text = 'True';
        if (output.val() == '') output.val(this.text);
        else if ((this.ln == true) && (this.n == 0)) output.val(output.val()+'\n'+this.text);
        else output.val(output.val()+this.text);
        return 0;
    }
});
