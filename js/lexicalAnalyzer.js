Exception = new Class({
    initialize: function(textProgram,errorProgram) {
        this.textProgram = textProgram;
        this.errorProgram = errorProgram;
    },
    textProgram: null,
    errorProgram: null,
    error: function(error,currentLexeme) {
        this.textProgram.get(0).setSelectionRange(currentLexeme.currentLexemePos,currentLexeme.nextLexemePos);
        this.errorProgram.val(error);
        jQuery.error();
    }
});

LexicalAnalyzer = new Class ({
    initialize: function(textProgram,errorProgram) {
        Scanner.init(textProgram.val());
        this.exception = new Exception(textProgram,errorProgram) ; 
        this.currentLexeme = Scanner.next(0);
    },
    exception: null,
    currentLexeme: null,
    getProgram: function() {
        if (this.currentLexeme.name.toLowerCase() == 'var') {
            this.getVar();
        }
        if (this.currentLexeme.name.toLowerCase() == 'begin') {
            this.getBlock();
        } else {
            this.exception.error('except BEGIN',this.currentLexeme);
        }  
    },
    getVar: function() {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        while (this.currentLexeme.type != 'Keyword') {
            this.getDeclaration(app.tree);
        }
    },
    getDeclaration: function(treeVar) {
        var tableVar = new Array();
        while (this.currentLexeme.type == 'Identifier') {
            tableVar.push(this.currentLexeme.name);
            var pos = this.currentLexeme.nextLexemePos;
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            if (this.currentLexeme.name == ':') {
                break;
            }
            if (this.currentLexeme.name != ',') {
                this.exception.error('except , or :',this.currentLexeme);
            }
            pos = this.currentLexeme.nextLexemePos;
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            if (this.currentLexeme.type != 'Identifier') {
                this.exception.error('except identefier ',this.currentLexeme);
            }
        }
        if (this.currentLexeme.name != ':') {
            this.exception.error('except :',this.currentLexeme);
        }
        pos = this.currentLexeme.nextLexemePos;
        var typeLexeme = this.getType();
        for (var i = 0; i < tableVar.length; i++) {
            var curVar = typeLexeme.clone();
            curVar.name = tableVar[i];
            if (treeVar.push(curVar) == -1) {
                this.exception.error('duplicate name variable ' + curVar.name, this.currentLexeme);
            }
        }
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != ';') {
            this.exception.error('except ;',this.currentLexeme);
        }
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
    },
    getType: function() {
        var pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name.toLowerCase() == 'integer') {
            return new SymVarName(0,0,0,'int','');
        } else if (this.currentLexeme.name.toLowerCase() == 'real') {
            return new SymVarName(0,0,0,'real','');
        } else if (this.currentLexeme.name.toLowerCase() == 'char') {
            return new SymVarName(0,0,0,'char','');
        } else if (this.currentLexeme.name.toLowerCase() == 'boolean') {
            return new SymVarName(0,0,0,'boolean','');
        } else if (this.currentLexeme.name.toLowerCase() == 'array') {
            return this.getDeclarationArray();
        } else if(this.currentLexeme.name.toLowerCase() == 'record') {
            return this.getDeclarationRecord();
        } else {
            this.exception.error('error type of var',this.currentLexeme);
        }
    },
    getDeclarationArray: function() {
        var pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.name != '[')  
            this.exception.error('except [ ',this.currentLexeme);
        var bounder = this.getBounders();
        if(this.currentLexeme.name != ']') 
            this.exception.error('except ] ',this.currentLexeme); 
        pos = this.currentLexeme.nextLexemePos;	   
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.name.toLowerCase() != 'of') 
            this.exception.error('except of ',this.currentLexeme); 
        return new SymArray(0,0,(bounder[1]-bounder[0]),bounder[0]*1,this.getType(),'');
    },
    getBounders: function() {
        var pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.type != 'NumberInt') {
            this.exception.error('must be INTEGER constant  ',this.currentLexeme);
        }
        var low = this.currentLexeme.name;
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != '..') {
            this.exception.error('except .. ',this.currentLexeme);
        }
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.type != 'NumberInt') {
            this.exception.error('must be INTEGER constant  ',this.currentLexeme);
        }
        var high = this.currentLexeme.name;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        return [low,high];
    },
    getDeclarationRecord: function() {
        var rec = new SymRecord(0,0,'record','');
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        while (this.currentLexeme.name.toLowerCase() != 'end') {
            this.getDeclaration(rec);
        }
        return rec;
    },
    getBlock: function() {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        expression = this.parseExpr(app.tree.treeVar,';');
        expression.putPosition([500,400]);
    },
    parseExpr: function(treeVar,endLexeme) {
        return this.parseCompare(treeVar,endLexeme);
    },
    parseCompare: function(treeVar,endLexeme) {
        var left = this.parseAdd(treeVar,endLexeme);
        if (this.currentLexeme.type == 'Comparison') {
            var binOp = new SymBinOp(this.currentLexeme.name,0,0,'#5500ff',Math.random()-0.5);
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            left = new SynBinOp(binOp,left,this.parseCompare(treeVar,endLexeme));
            left.type = 'boolean';
        }
        return left;
    },
    parseAdd: function(treeVar,endLexeme) {
        var left = this.parseTerm(treeVar,endLexeme);
        if ((this.currentLexeme.name == '+') || (this.currentLexeme.name == '-') ||
	        (this.currentLexeme.name.toLowerCase() == 'or')) {
		    var binOp = new SymBinOp(this.currentLexeme.name,0,0,'#5500ff',Math.random()-0.5);
		    this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            left = new SynBinOp(binOp,left,this.parseAdd(treeVar,endLexeme));
        }
        return left;
    },
    parseTerm: function(treeVar,endLexeme) {
        var left = this.parseFactor(treeVar,endLexeme);
        if ((this.currentLexeme.name == '*') || (this.currentLexeme.name == '/')||
            (this.currentLexeme.name.toLowerCase() == 'and') || (this.currentLexeme.name.toLowerCase() == 'div')) {
            var binOp = new SymBinOp(this.currentLexeme.name,0,0,'#5500ff',Math.random()-0.5);
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            left = new SynBinOp(binOp,left,this.parseTerm(treeVar,endLexeme));
        }
        return left;
    },
    parseFactor: function(treeVar,endLexeme){
        var result;
        if (this.currentLexeme.type == 'Identifier') {
	        result = this.parseIdentifier(treeVar);
        } else if (this.currentLexeme.type == 'NumberReal') {
            result = new SynConstReal(this.currentLexeme.name);
        }else if (this.currentLexeme.type == 'NumberInt') {
            result = new SynConstInt(this.currentLexeme.name);
        } else if (this.currentLexeme.name == '(') {
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            result = this.parseCompare(treeVar,endLexeme);
        } else {
            this.exception.error('error in token', this.currentLexeme);
        }
	    this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if ((this.currentLexeme.type != 'MathOperation') && (this.currentLexeme.name !=')')
	        && (this.currentLexeme.type != 'Comparison') && (this.currentLexeme.name != 'or')) {
            if (this.currentLexeme.name == endLexeme) {}
            else {
                this.exception.error('except arithmetic or compare operation',this.currentLexeme);
            }
        }
        return result;
    },
    parseIdentifier: function(treeVar) {
        var item = app.tree.getVarByName(treeVar,this.currentLexeme.name);
        if (item == -1) {
            this.exception.error('variable has no name',this.currentLexeme);
        }
        if (item instanceof SymArray) {
            return this.parseSymArr(item,treeVar);
        } else if (item instanceof SymRecord) {
            return this.parseSymRecord(item,treeVar);
        } else if (item instanceof SymVarName) {
            return new SynVar(item);
        } else {
            this.exception.error('error type lexeme',this.currentLexeme);
        }
    },
    parseSymArr: function(item,treeVar) {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        this.text = this.text + this.currentLexeme.name;
        if (this.currentLexeme.name!='[') {
            this.exception.error('except [ ',this.currentLexeme);
        }
        Scanner.popCodePart()
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        return this.parseIndexArray(item,treeVar,']');
    },
    parseIndexArray: function(itemSymb,treeVar,endLexeme) {
        var newSynExpr;
        var item = itemSymb;
        item = item.itemsElement[0];
	    if (item instanceof SymArray) {
	        endLexeme = ',';
	    } else {
	        endLexeme = ']';
	    }
        var arrIndex = this.parseExpr(treeVar,endLexeme);
        arrIndex.symbolName.text = Scanner.popCodePart();
	    if (this.currentLexeme.name == ',') {
		    if (!(item instanceof SymArray)) {
		        this.exception.error('error index ',this.currentLexeme);
		    }
		    this.text = this.text + this.currentLexeme.name;
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            newSynExpr = this.parseIndexArray(item,treeVar,endLexeme);
        } else if (this.currentLexeme.name == ']') {
            if (item instanceof SymArray) {
                this.exception.error('except index array',this.currentLexeme);
            } else if (item instanceof SymRecord) {
                newSynExpr = this.parseSymRecord(item,item.itemsRecord);
            } else {
                newSynExpr = new SynVar(item);
            }
            this.text = this.text + this.currentLexeme.name;
        } else {
            this.exception.error('except ] ',this.currentLexeme);
        }
        return new SynArray(itemSymb,arrIndex,newSynExpr);
    },
    parseSymRecord: function(item,treeVar) {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        this.text = this.text + this.currentLexeme.name;
        if (this.currentLexeme.name != '.') {
            this.exception.error('except . ',this.currentLexeme);
        }
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        this.text = this.text + this.currentLexeme.name;
        return new SynRecord(item,this.parseIdentifier(item.itemsElement));
    }
});
