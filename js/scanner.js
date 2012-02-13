var Lexeme = function(name, type, nextLexemePos, currentLexemePos) {
    this.name = name;
    this.type = type;
    this.nextLexemePos = nextLexemePos;
    this.currentLexemePos = currentLexemePos;
}


var Scanner = (function() {

    var keywords = [
        /^real/gi,
        /^char/gi,
        /^string/gi,
        /^const/gi,
        /^var/gi,
        /^integer/gi,
        /^array/gi,
        /^of/gi,
        /^begin/gi,
        /^for/gi,
        /^while/gi,
        /^repeat/gi,
        /^if/gi,
        /^then/gi,
        /^else/gi,
        /^do/gi,
        /^to/gi,
        /^end/gi,
        /^until/gi,
        /^record/gi,
        /^div/gi,
        /^mod/gi,
        /^and/gi,
        /^or/gi,
        /^not/gi,
        /^read/gi,
        /^writeln/gi,
        /^write/gi
    ],

    separators = [
        /^:=/g,
        /^\.\./g,
        /^[:,.;()\[\]]/g
    ],

    comparisons = [
        /^>=/g,
        /^<=/g,
        /^<>/g,
        /^[><=]/g
    ],

    mathOperations = [
        /^[+\-*\/]/g
    ],

    numbersReal = [
        /^\-?\d+[.]\d+/g,
        /^\-?\d+[.]\d*E\-\d+/g
    ],

    numbersInt = [
        /^\-?\d+/g
    ],

    identifiers = [
        /^[a-z]+[a-z0-9_]*/gi
    ],

    position = 0,
    code = null,
    program = null;
	codePart = null;


    var updateCodeAndPosition = function(pos) {
        position += pos;
        code = program.slice(position);
    };

    var escape = function(){
        var regexps = [
            /^\s*\{[^\}]*\}/g,
            /^\s*\/\/(.)*\n/g,
            /^(\s){1,}/g
        ];

        regexps.every(function(regexp) {
            regexp.lastIndex = 0;
            regexp.exec(code);
            updateCodeAndPosition(regexp.lastIndex);
            return true;
        });
    };

    var match = function() {
        escape();

        var LexemeType = function(name, regexps) {
            this.name = name;
            this.regexps = regexps;
        };

        var precedence = [
            new LexemeType('Keyword', keywords),
            new LexemeType('Separator', separators),
            new LexemeType('Comparison', comparisons),
			new LexemeType('MathOperation', mathOperations),
            new LexemeType('NumberReal', numbersReal),
            new LexemeType('NumberInt', numbersInt),
            new LexemeType('Identifier', identifiers)
        ];

        var lexemeType = null,
            lexemeName = null,
            lexemeEndPos = 0;

        precedence.every(function(type) {
            lexemeType = type.name;
            return type.regexps.every(function(regexp) {
                regexp.lastIndex = 0;
                matches = regexp.exec(code);
                if (matches !== null) {
                    lexemeName = matches[matches.length-1];
                    lexemeEndPos = regexp.lastIndex;
                }
                return matches === null;
            });
        });

        updateCodeAndPosition(lexemeEndPos);
        if ((lexemeName != 'else') && (lexemeName != 'end')) codePart += lexemeName;
        return new Lexeme(lexemeName, lexemeType, position, position - lexemeEndPos);
    };


    return {
        init: function(prog) {
            program = prog;
        },

        next: function(pos) {
            position = 0;
            updateCodeAndPosition(pos);
            return match();
        },

		popCodePart: function(text) {
		    var part = codePart;
			codePart = text;
			return part;
		}
    };

})();
