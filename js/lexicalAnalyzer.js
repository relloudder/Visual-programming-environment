Exception = new Class({
    initialize: function(textProgram,errorProgram) {
        this.textProgram = textProgram;
        this.errorProgram = errorProgram;
    },
    textProgram: null,
    errorProgram: null,
    error: function(error, currentLexeme) {
        this.textProgram.setSelectionRange(currentLexeme.currentLexemePos,currentLexeme.nextLexemePos);   
        throw this.errorProgram.value = error;
    } 
});

LexicalAnalyzer = new Class({
    initialize: function(textProgram,errorProgram) {
        Scanner.init(textProgram.val());
        this.exception = new Exception(textProgram,errorProgram) ; 
        this.currentLexeme = Scanner.next(0);
    },    
    exception: null,
    currentLexeme: null,
    getProgram: function() {
        if (this.currentLexeme.name.toLowerCase() == 'var') this.getVar();
        if (this.currentLexeme.name.toLowerCase() == 'begin');
        else this.exception.error('except BEGIN',this.currentLexeme);   
    },
    getVar: function() {
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        while(this.currentLexeme.type != 'Keyword')
            this.getDeclaration(app.tree);
    },
    getDeclaration: function(treeVar) {
        var tableVar = new Array();
        while(this.currentLexeme.type == 'Identifier') {
            tableVar.push(this.currentLexeme.name);
            var pos = this.currentLexeme.nextLexemePos;
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            if(this.currentLexeme.name == ':') break;
            if(this.currentLexeme.name != ',') 
                this.exception.error('except , or :',this.currentLex);
            pos = this.currentLexeme.nextLexemePos;
            this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
            if(this.currentLexeme.type != 'Identifier')  
                this.exception.error('except identefier ',this.currentLexeme);
        } 
        if(this.currentLexeme.name != ':') 
            this.exception.error('except :',this.currentLexeme);
        pos = this.currentLexeme.nextLexemePos;
        var typeLexeme = this.getType();
        for (var i = 0; i < tableVar.length; i++) {
            var curVar = typeLexeme.clone();
            curVar.name = tableVar[i];
            if(treeVar.push(curVar) == -1) 
                this.exception.error('duplicate name variable '+ curVar.name, this.currentLexeme);		

        }
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.name != ';') 
            this.exception.error('except ;',this.currentLexeme);
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
    },
    getType: function() {
        var pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.name.toLowerCase() == 'integer')
            return new SymVarName(0,0,0,'int','');
        else if(this.currentLexeme.name.toLowerCase() == 'real')
            return new SymVarName(0,0,0,'real','');
        else if(this.currentLexeme.name.toLowerCase() == 'char')
            return new SymVarName(0,0,0,'char','');
        else if(this.currentLexeme.name.toLowerCase() == 'boolean')
            return new SymVarName(0,0,0,'boolean','');
        else if(this.currentLexeme.name.toLowerCase() == 'array')
            return this.getDeclarationArray();
        else if(this.currentLexeme.name.toLowerCase() == 'record')
            return this.getDeclarationRecord()	
        else this.exception.error('error type of var',this.currentLexeme);
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
        if(this.currentLexeme.type != 'NumberInt')
            this.exception.error('must be INTEGER constant  ',this.currentLexeme);
        var low = this.currentLexeme.name;
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.name != '..')
            this.exception.error('except .. ',this.currentLexeme);
        pos = this.currentLexeme.nextLexemePos;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        if(this.currentLexeme.type != 'NumberInt')
            this.exception.error('must be INTEGER constant  ',this.currentLexeme);
        var hi = this.currentLexeme.name;
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        return [low,hi];
    },
    getDeclarationRecord: function() {
        var rec = new SymRecord(0,0,'record','');
        this.currentLexeme = Scanner.next(this.currentLexeme.nextLexemePos);
        while (this.currentLexeme.name.toLowerCase() != 'end')
            this.getDeclaration(rec);
        return rec;
    }
});