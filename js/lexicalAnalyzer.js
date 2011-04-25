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
        this.exception = new Exception(textProgram,errorProgram);
        this.currentLexeme = Scanner.next(0);
    },
    exception: null,
    currentLexeme: null,
    getProgram: function() {
        if (this.currentLexeme.name.toLowerCase() == 'var') {
            this.getVar();
        }
        if (this.currentLexeme.name.toLowerCase() == 'begin') {
            app.tree.treeStatment.push(this.getBlock(app.tree.treeVar));
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
    getBlock: function(tree) {
        Scanner.popCodePart('');
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var synBlock = new StmtBlock();
        while (this.currentLexeme.name != 'end') {
            if (this.currentLexeme.type == 'Identifier')
                synBlock.push(this.parseAssignment(tree));
            else if (this.currentLexeme.type == 'Keyword') {
                if (this.currentLexeme.name == 'if') synBlock.push(this.parseIfElse(tree));
                else if (this.currentLexeme.name == 'begin') synBlock.push(this.getBlock(tree));
            } else this.exception.error('error statment ',this.currentLexeme);
        }
        var symEnd = new SymEnd(0,0,'#E8E8E8');
        var synEnd = new SynEnd(symEnd);
        synBlock.push(synEnd);
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        return synBlock;
    },
    getStatment: function(tree) {
        if (this.currentLexeme.type == 'Identifier') return this.parseAssignment(tree);
        if (this.currentLexeme.type == 'Keyword') {
            if (this.currentLexeme.name == 'if') return this.parseIfElse(tree);
            if (this.currentLexeme.name == 'begin' ) {
                var block = this.getBlock(tree);
                return block;
            }
        }
    },
	parseAssignment: function (tree){
	    var varLeft = this.parseIdentifier(tree);
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != ':=') 
        this.exception.error('expect := ',this.currentLexeme);
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var expression = this.parseExpr(tree,';');
		var typeCompare = expression.compareType(varLeft.type,expression.type);
		if (((typeCompare == 'real') && (varLeft.type == 'int')) || (typeCompare == -1)) {
		    this.exception.error('Incompatible types in assignment '+varLeft.type+' and '+expression.type,this.currentLexeme);
		}
		if((typeCompare == 'real')&&(expression.type =='int'))expression.setType('real');
        var st2 = new SymAssignment(0,0,'#66CC99',Scanner.popCodePart(''));
        var statment = new StmtAssignment(varLeft,expression,st2);
        var name = this.currentLexeme.name;
        if (this.currentLexeme.name != 'else')
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if ((name == ';') && (this.currentLexeme.name == 'else'))
            this.exception.error('unexpected ; ',this.currentLexeme);
        return statment;
	},
	parseIfElse : function (tree){
        Scanner.popCodePart('');
	    this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
	    var expression = this.parseExpr(tree,'then');
        var text = Scanner.popCodePart('');
		var symIf = new	SymIf(0,0,'#66CC99',text.substring(0,text.length-4));
	    this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
		var stThen = this.getStatment(tree);
		var stElse = null;
		if (this.currentLexeme.name == 'else') {
		    Scanner.popCodePart('');
		    this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
		    stElse = this.getStatment(tree);
		}
		return new StmtIf(expression,stThen,stElse,symIf);
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
            && (this.currentLexeme.type != 'Comparison') && (this.currentLexeme.name != 'or')
            && (this.currentLexeme.name != 'and')) {
            if ((this.currentLexeme.name == endLexeme) || (this.currentLexeme.type =='Keyword')) {}
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
