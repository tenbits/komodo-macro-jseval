// == Loggers
var log, console;
(function(){
	log = function(){
		logger.apply(null, arguments);
	};
	
	console = {
		log: function(){
			consoleLogger.apply(null, arguments);
			logger = consoleLogger;
		}
	};
	
	// private
	
	var logger = toolbarLogger;
	function toolbarLogger(){
        ko.run.runEncodedCommand(window, 'echo ' + formatMsg(arguments));
	}
	function consoleLogger(){
		var service = Components
			.classes["@mozilla.org/consoleservice;1"]
			.getService(Components.interfaces.nsIConsoleService)
			;
		service.reset();
		window.openDialog('chrome://global/content/console.xul', '_blank');
		consoleLogger = function(){
			service.logStringMessage(formatMsg(arguments));
		};
		consoleLogger.apply(null, arguments);
	}
	function formatMsg(args){
		var msg = '',
			imax = args.length,
			i = -1;
		while ( ++i < imax ) {
			msg += args[i] + ' ';
		}
		return msg;
	}
}());



// === scimoz utils

var scimoz_getSelection,
	scimoz_getLine,
	scimoz_replaceSelection,
	scimoz_replace
(function(){
	scimoz_getSelection = function(){
		return scimoz.selText;
	};
	scimoz_replaceSelection = function(str){
		if (str == null) 
			return;
		
		scimoz.beginUndoAction();
		scimoz.replaceSel(str);
		scimoz.endUndoAction();
	};
	
	/* { start, end, string, position }*/
	scimoz_replace = function(meta){
		scimoz.targetStart = __start + meta.start;
		scimoz.targetEnd = __start + meta.end;
		scimoz.replaceTarget(meta.string.length, meta.string);
		scimoz.gotoPos(__start + meta.position);
	};
	
	scimoz_getLine = function(){
		var pos = scimoz.currentPos;
		__start = pos < 40 ? 0 : pos - 40;
		
        return scimoz.getTextRange(__start, pos);
	};
	
	var view = ko.views.manager.currentView,
		scimoz = view.scimoz,
		
		// current text block start position
		__start = 0;
}());
	
var str_format;
(function(){
	str_format =  function() {
		var args = Array.prototype.slice.call(arguments),
			line = args.shift();
		for (var i = 0; i < args.length; i++) {
			line = line.split('%' + (i + 1)).join(args[i]);
		}
		return line;
	};
}());

// === snippets

var snippet_tryRun;
(function(){
	snippet_tryRun = function(str){
		var imax = snippets.length,
			i = -1,
			snippet;
			
		while ( ++i < imax ) {
			snippet = snippets[i];
			if (snippet.regexp.test(str) == false)
				continue;
			
			
			var replaceMeta = snippet.eval(str);
	 
			scimoz_replace(replaceMeta);
			return true;
		}
		return false;
	};
	
	var snippets = [
		/** (arg?,arg?) -> function(arg,arg){} */
		{ 
			regexp: /(\([\w,\$_ ]*)$/g,
			eval: function(line) {
				var start = line.lastIndexOf('('),
					end = line.length,
					args = line.substring(start + 1, end).replace(' ', '').split(',').join(', ');
	 
				return createReplaceObject(
					str_format('function(%1){}', args)
					, start
					, end + 1
					, -1
				);
			}
			
		},
		
		/** obj!.value -> (obj.value || (obj.value = ?)) */
		{ 
			regexp: /([\w]+!\.[\w]+)$/g,
			eval: function(line, output) {
				var match = /([\w]+)!\.(\w+)$/.exec(line),
					obj = match[1],
					key = match[2];
	 
				return createReplaceObject(
					str_format(';(%1.%2 || (%1.%2 = ))', obj, key)
					, match.index
					, line.length
					, -2
				);
			}
		},
		/** obj?.value -> obj && obj.value */
		{
			regexp: /([\w$_]+\??\.)*([\w$_]+\??)(=)*$/,
			eval: function(line) {
				var match = this.regexp.exec(line),
					regexp = /[\w]+\??\.?/g,
					type = match[3],
					// setter('=') || getter('')
					str = '',
					chain = '',
					parts = (
						type
							? match[0].substring(0, match[0].length - type.length)
							: match[0]
					).split('.');
	 
				var imax = parts.length,
					i = -1,
					x, isSafe, seperator;
				while ( ++i < imax ){
					x = parts[i];
					
					isSafe = x[x.length - 1] == '?';
					if (isSafe)
						x = x.replace('?', '');
						
					chain += (chain.length ? '.' : '') + x;
	 
					seperator = str.length ? '.' : '';
					str += seperator + x + (isSafe ? ' && ' + chain : '');
					if (i == imax - 1) {
						if (type == '=') {
							var index = str.lastIndexOf(' ');
							if (~index) {
								str = str.substring(0, ++index) + '(' + str.substring(index);
							}
							str += ' = )';
						}
						str += ';';
					}
				}
				return createReplaceObject(
					str
					, match.index
					, line.length
					, type == '=' ? -2 : -1
				);
			}
		}
	];
	
	function createReplaceObject(str, start, end, pos) {
		
		var output = {
			start: start,
			end: end,
			position: start + str.length + pos,
			string: str
		};
		return output;
	}
}());


function main(){
	
	var selection = scimoz_getSelection();
	if (selection) {
		// evaluate selection
		try {
		   scimoz_replaceSelection(eval(selection));
		} catch (e) {
		   log('Error:: ' + e);
		}
		return;
	}
	
	// try snippet
	var str = scimoz_getLine();
	if (str === '') {
		log('Empty line under cursor');
		return;
	}
	
	snippet_tryRun(str);
}



// ==== RUN

main();
