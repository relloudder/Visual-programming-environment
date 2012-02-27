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
            var main = this.getBlock(app.tree.treeVar);
            main.mainBlock = true;
            app.tree.treeStatment.push(main);
            if (this.currentLexeme.name!='.')
                this.exception.error('expect . ',this.currentLexeme);
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
        } else if (this.currentLexeme.name.toLowerCase() == 'string') {
            return this.getDeclarationString();
        } else if(this.currentLexeme.name.toLowerCase() == 'record') {
            return this.getDeclarationRecord();
        } else {
            this.exception.error('error type ',this.currentLexeme);
        }
    },
    getDeclarationArray: function() {
        var pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != '[')
            this.exception.error('expect [ ',this.currentLexeme);
        var bounder = this.getBounders();
        if (this.currentLexeme.name != ']')
            this.exception.error('expect ] ',this.currentLexeme);
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name.toLowerCase() != 'of')
            this.exception.error('expect of ',this.currentLexeme);
        return new SymArray(0,0,(bounder[1]-bounder[0]),bounder[0]*1,this.getType(),'');
    },
    getDeclarationString: function() {
        var pos = this.currentLexeme.nextLexemePos;
        var noB = Scanner.next(this.currentLexeme.nextLexemePos);
        if (noB.name == ';') return new SymString(0,0,-1,20,'');
        this.currentLexeme = noB;
        if (this.currentLexeme.name != '[')
            this.exception.error('expect [ ',this.currentLexeme);
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.type != 'NumberInt')
            this.exception.error('must be INTEGER constant  ',this.currentLexeme);
        var len = this.currentLexeme.name;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != ']')
            this.exception.error('expect ] ',this.currentLexeme);
        return new SymString(0,0,-1,len,'');
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
                else if (this.currentLexeme.name == 'read') synBlock.push(this.parseRead(tree));
                else if (this.currentLexeme.name == 'writeln') synBlock.push(this.parseWrite(tree,true));
                else if (this.currentLexeme.name == 'write') synBlock.push(this.parseWrite(tree,false));
                else if (this.currentLexeme.name == 'while') synBlock.push(this.parseWhile(tree));
                else if (this.currentLexeme.name == 'begin') synBlock.push(this.getBlock(tree));
            } else this.exception.error('error statment ',this.currentLexeme);
            if (this.currentLexeme.name != ';')
                this.exception.error('expected ; ',this.currentLexeme);
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
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
            if (this.currentLexeme.name == 'read') return this.parseRead(tree);
            if (this.currentLexeme.name == 'writeln') return this.parseWrite(tree,true);
            if (this.currentLexeme.name == 'write') return this.parseWrite(tree,false);
            if (this.currentLexeme.name == 'while') return this.parseWhile(tree);
            if (this.currentLexeme.name == 'begin' ) {
                var block = this.getBlock(tree);
                return block;
            }
        }
        return new Statment(new SymStatment(0,0,'red','1null'),[0,0]);
    },
    parseRead: function(tree) {
        var pos = [this.currentLexeme.currentLexemePos];
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != '(')
            this.exception.error('expected (',this.currentLexeme);
        var listRead = [];
        while (this.currentLexeme.name != ')') {
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            if (this.currentLexeme.type != 'Identifier')
                this.exception.error('expected identifier',this.currentLexeme);
            listRead.push(this.parseIdentifier(tree));
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            if ((this.currentLexeme.name != ',') && ((this.currentLexeme.name != ')')))
                this.exception.error('expected , or ) ',this.currentLexeme);
        }
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var symRead = new SymRead(0,0,'#66CC99',Scanner.popCodePart(''));
        pos.push(this.currentLexeme.currentLexemePos);
        return new StmtRead(listRead,symRead,pos);
    },
    parseWrite: function(tree,ln) {
        var pos = [this.currentLexeme.currentLexemePos];
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != '(')
            this.exception.error('expected (',this.currentLexeme);
        var listWrite = [];
        while (this.currentLexeme.name != ')') {
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            listWrite.push(this.parseExpr(tree,',)'));
            if ((this.currentLexeme.name != ',') && ((this.currentLexeme.name != ')')))
            this.exception.error('expected , or ) ',this.currentLexeme);
        }
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var symWrite = new SymWrite(0,0,'#66CC99',Scanner.popCodePart(''));
        pos.push(this.currentLexeme.currentLexemePos);
        if (ln == false) return new StmtWrite(listWrite,symWrite,false,pos);
        else return new StmtWrite(listWrite,symWrite,true,pos);
    },
    parseAssignment: function (tree) {
        var pos = [this.currentLexeme.currentLexemePos];
        var varLeft = this.parseIdentifier(tree);
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != ':=')
        this.exception.error('expect := ',this.currentLexeme);
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var expression = this.parseExpr(tree,';');
        var typeCompare = expression.compareType(varLeft.type,expression.type);
        if (((typeCompare == 'real') && (varLeft.type == 'int')) || ((typeCompare == 'string') && (varLeft.type == 'char') && 
            (expression.getValue().length != 1)) || (typeCompare == -1)) {
                this.exception.error('Incompatible types in assignment '+varLeft.type+' and '+expression.type,this.currentLexeme);
        }
        if ((typeCompare == 'real') && (expression.type =='int')) expression.setType('real');
        var st2 = new SymAssignment(0,0,'#66CC99',Scanner.popCodePart(''));
        pos.push(this.currentLexeme.currentLexemePos);
        var statment = new StmtAssignment(varLeft,expression,st2,pos);
        return statment;
    },
    parseIfElse : function (tree){
        Scanner.popCodePart('');
        var pos = [this.currentLexeme.currentLexemePos];
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var expression = this.parseExpr(tree,'then');
        if (this.currentLexeme.name!='then')
            this.exception.error('expected then ',this.currentLexeme);
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
        else stElse = new Statment(new SymStatment(0,0,'red','1null'),pos);
        return new StmtIf(expression,stThen,stElse,symIf,pos);
    },
    parseWhile: function(tree) {
        Scanner.popCodePart('');
        var pos = [this.currentLexeme.currentLexemePos];
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var expression = this.parseExpr(tree,'do');
        if (this.currentLexeme.name != 'do')
            this.exception.error('expected do ',this.currentLexeme);
        var text = Scanner.popCodePart('');
        var symWhile = new SymWhile(0,0,'#66CC99',text.substring(0,text.length-2));
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        var stDo = this.getStatment(tree);
        var stElse = new Statment(new SymStatment(0,0,'red','1null'),pos);
        return new StmtWhile(expression,stDo,stElse,symWhile,pos);
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
			if (((left.type == 'string') || (left.type == 'char')) && (this.currentLexeme.name != '+'))
			    this.exception.error('invalid operation '+this.currentLexeme.name,this.currentLexeme);
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
            (this.currentLexeme.name.toLowerCase() == 'and') || (this.currentLexeme.name.toLowerCase() == 'div')
            || (this.currentLexeme.name.toLowerCase() == 'mod')) {
                if ((left.type == 'string') || (left.type == 'char'))
                    this.exception.error('invalid operation '+this.currentLexeme.name,this.currentLexeme);
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
		if (this.currentLexeme.name == null)
		    this.exception.error('error in token ', this.currentLexeme);
        if (this.currentLexeme.type == 'Identifier') {
	        result = this.parseIdentifier(treeVar);
        } else if (this.currentLexeme.type == 'NumberReal') {
            result = new SynConstReal(this.currentLexeme.name);
        } else if (this.currentLexeme.type == 'NumberInt') {
            result = new SynConstInt(this.currentLexeme.name);
        } else if (this.currentLexeme.type == 'StringConst') {
            result = new SynConstString(this.currentLexeme.name.substr(1,this.currentLexeme.name.length-2));
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
            else if (endLexeme.indexOf(this.currentLexeme.name) >= 0) {}
            else this.exception.error('error in token ', this.currentLexeme);
        }
        return result;
    },
    parseCallFunction: function(item,treeVar) {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if (this.currentLexeme.name != '(') {
            this.exception.error('expect ( ',this.currentLexeme);
        }
        text1 = Scanner.popCodePart('');
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        return this.parseCallParam(item,treeVar);
    },
    parseCallParam: function(item,treeVar) {
        var newSynExpr = [];
        for (var i = 0; i < item.listParam.length; i++) {
            var endLexeme = ',';
            if (i == (item.listParam.length-1)) endLexeme = ')';
            var param = this.parseExpr(treeVar,endLexeme);
            newSynExpr.push(param);
            param.symbolName.text = Scanner.popCodePart('');
            text1+=param.symbolName.text;
            param.symbolName.text = param.symbolName.text.substr(0,param.symbolName.text.length-1);
            if (this.currentLexeme.name != endLexeme)
                this.exception.error('error parametr',this.currentLexeme);
            if (i < (item.listParam.length-1))
                this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            }
            Scanner.popCodePart(text1);
            var synF = new SynCallFunction(item,newSynExpr);
            if (synF.errorType != '')
                this.exception.error(synF.errorType,this.currentLexeme);
            return synF;
    },
    parseIdentifier: function(treeVar) {
        var item = app.tree.getVarByName(treeVar,this.currentLexeme.name);
		if (item == -1) this.exception.error('variable has no name ',this.currentLexeme);
		if (item instanceof SymString) {
		    return this.parseSymString(item,treeVar);
        } else if (item instanceof SymArray) {
            return this.parseSymArr(item,treeVar);
        } else if (item instanceof SymRecord) {
            return this.parseSymRecord(item,treeVar);
        } else if (item instanceof SymFunction) {
            return this.parseCallFunction(item,treeVar);
        } else if (item instanceof SymVarName) {
            return new SynVar(item);
        } else {
            this.exception.error('error type ',this.currentLexeme);
        }
    },
    parseSymString: function(item,treeVar) {
        var noB = Scanner.next(this.currentLexeme.nextLexemePos);
        if (noB.name != '[') return new SynVar(item);
        return this.parseSymArr(item,treeVar);
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
        if (item.type != 'string') item = item.itemsElement[0];
        else item = new SymVarName(' ',0,0,'char','');
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
