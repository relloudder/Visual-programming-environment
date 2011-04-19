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
            this.exception.error('expect BEGIN ',this.currentLexeme);
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
                this.exception.error('expect , or : ',this.currentLexeme);
            }
            pos = this.currentLexeme.nextLexemePos;
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            if (this.currentLexeme.type != 'Identifier') {
                this.exception.error('expect identifier ',this.currentLexeme);
            }
        }
        if (this.currentLexeme.name != ':') {
            this.exception.error('expect : ',this.currentLexeme);
        }
        pos = this.currentLexeme.nextLexemePos;
        var typeLexeme = this.getType();
        for (var i = 0; i < tableVar.length; i++) {
            var curVar = typeLexeme.clone();
            curVar.name = tableVar[i];
            if (treeVar.push(curVar) == -1) {
                this.exception.error('duplicate variable name ' + curVar.name, this.currentLexeme);
            }
        }
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != ';') {
            this.exception.error('expect ; ',this.currentLexeme);
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
            this.exception.error('error type ',this.currentLexeme);
        }
    },
    getDeclarationArray: function() {
        var pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.name != '[')  
            this.exception.error('expect [ ',this.currentLexeme);
        var bounder = this.getBounders();
        if(this.currentLexeme.name != ']') 
            this.exception.error('expect ] ',this.currentLexeme);
        pos = this.currentLexeme.nextLexemePos;	   
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.name.toLowerCase() != 'of') 
            this.exception.error('expect of ',this.currentLexeme);
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
            this.exception.error('expect .. ',this.currentLexeme);
        }
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.type != 'NumberInt') {
            this.exception.error('must be INTEGER constant ',this.currentLexeme);
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
        Scanner.popCodePart('');
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var symBeg = new SymBegin(400,5,'#E8E8E8',0,0);
        var synBeg = new SynBegin(symBeg);
        app.tree.treeStatment.push(synBeg);
        while (this.currentLexeme.name != 'end') {
            if (this.currentLexeme.type == 'Identifier') {
                var varLeft = this.parseIdentifier(app.tree.treeVar);
                this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
                if (this.currentLexeme.name != ':=') {
                    this.exception.error('expect := ',this.currentLexeme);
                }
                this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
                var expression = this.parseExpr(app.tree.treeVar,';');
                var typeCompare = expression.compareType(varLeft.type,expression.type);
                if (((typeCompare == 'real') && (varLeft.type == 'int')) || (typeCompare == -1)) {
                    this.exception.error('Incompatible types ' + varLeft.type + ' and ' + expression.type,this.currentLexeme);
                }
                if ((typeCompare == 'real') && (expression.type == 'int')) {
                    expression.setType('real');
                }
                var st2 = new SymAssignment(440,200,'#66CC99',Scanner.popCodePart(''),470,5);
                var statment = new StmtAssignment(varLeft,expression,st2);
                app.tree.treeStatment.push(statment);
                this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            } else {
                this.exception.error('missing identifier',this.currentLexeme);
            }
        }
        var symEnd = new SymEnd(440,200,'#E8E8E8',470,200);
        var synEnd = new SynEnd(symEnd);
        app.tree.treeStatment.push(synEnd);
    },
    parseExpr: function(treeVar,endLexeme) {
        return this.parseCompare(treeVar,endLexeme);
    },
    parseCompare: function(treeVar,endLexeme) {
        var left = this.parseAdd(treeVar,endLexeme);
        while (this.currentLexeme.type == 'Comparison') {
            var binOp = new SymBinOp(this.currentLexeme.name,0,0,'#5500ff',Math.random()-0.5);
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            left = new SynBinOp(binOp,left,this.parseAdd(treeVar,endLexeme));
            if (left.errorType != '') {
                this.exception.error(left.errorType,this.currentLexeme);
            }
            left.type = 'boolean';
        }
        return left;
    },
    parseAdd: function(treeVar,endLexeme) {
        var left = this.parseTerm(treeVar,endLexeme);
        while ((this.currentLexeme.name == '+') || (this.currentLexeme.name == '-') ||
	        (this.currentLexeme.name.toLowerCase() == 'or')) {
		    var binOp = new SymBinOp(this.currentLexeme.name,0,0,'#5500ff',Math.random()-0.5);
		    this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            left = new SynBinOp(binOp,left,this.parseTerm(treeVar,endLexeme));
            if (left.errorType != '') {
                this.exception.error(left.errorType,this.currentLexeme);
            }
        }
        return left;
    },
    parseTerm: function(treeVar,endLexeme) {
        var left = this.parseFactor(treeVar,endLexeme);
        while ((this.currentLexeme.name == '*') || (this.currentLexeme.name == '/')||
            (this.currentLexeme.name.toLowerCase() == 'and') || (this.currentLexeme.name.toLowerCase() == 'div')) {
            var binOp = new SymBinOp(this.currentLexeme.name,0,0,'#5500ff',Math.random()-0.5);
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            left = new SynBinOp(binOp,left,this.parseFactor(treeVar,endLexeme));
            if (left.errorType != '') {
                this.exception.error(left.errorType,this.currentLexeme);
            }
        }
        return left;
    },
    parseFactor: function(treeVar,endLexeme){
        var result;
        if (this.currentLexeme.type == 'Identifier') {
	        result = this.parseIdentifier(treeVar);
        } else if (this.currentLexeme.type == 'NumberReal') {
            result = new SynConstReal(this.currentLexeme.name);
        } else if (this.currentLexeme.type == 'NumberInt') {
            result = new SynConstInt(this.currentLexeme.name);
        } else if (this.currentLexeme.name == '(') {
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            result = this.parseCompare(treeVar,endLexeme);
        } else {
            this.exception.error('error in token ', this.currentLexeme);
        }
	    this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if ((this.currentLexeme.type != 'MathOperation') && (this.currentLexeme.name !=')')
	        && (this.currentLexeme.type != 'Comparison') && (this.currentLexeme.name != 'or')) {
            if (this.currentLexeme.name == endLexeme) {}
            else {
                this.exception.error('error in token ', this.currentLexeme);
            }
        }
        return result;
    },
    parseIdentifier: function(treeVar) {
        var item = app.tree.getVarByName(treeVar,this.currentLexeme.name);
        if (item == -1) {
            this.exception.error('variable has no name ',this.currentLexeme);
        }
        if (item instanceof SymArray) {
            return this.parseSymArr(item,treeVar);
        } else if (item instanceof SymRecord) {
            return this.parseSymRecord(item,treeVar);
        } else if (item instanceof SymVarName) {
            return new SynVar(item);
        } else {
            this.exception.error('error type ',this.currentLexeme);
        }
    },
    parseSymArr: function(item,treeVar) {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name!='[') {
            this.exception.error('expect [ ',this.currentLexeme);
        }
        text = Scanner.popCodePart('')
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
        arrIndex.symbolName.text = Scanner.popCodePart('');
        Scanner.popCodePart(text + arrIndex.symbolName.text);
	    if (this.currentLexeme.name == ',') {
		    if (!(item instanceof SymArray)) {
		        this.exception.error('error index ',this.currentLexeme);
		    }
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            newSynExpr = this.parseIndexArray(item,treeVar,endLexeme);
        } else if (this.currentLexeme.name == ']') {
            if (item instanceof SymArray) {
                this.exception.error('expect index of array ',this.currentLexeme);
            } else if (item instanceof SymRecord) {
                newSynExpr = this.parseSymRecord(item,item.itemsRecord);
            } else {
                newSynExpr = new SynVar(item);
            }
        } else {
            this.exception.error('expect ] ',this.currentLexeme);
        }
        return new SynArray(itemSymb,arrIndex,newSynExpr);
    },
    parseSymRecord: function(item,treeVar) {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != '.') {
            this.exception.error('expect . ',this.currentLexeme);
        }
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        return new SynRecord(item,this.parseIdentifier(item.itemsElement));
    }
});
