### _Komodo Macro_ JSEval

Evaluates JavaScript code and inserts output back into the editor or geckos console. Is useful not only for the JS development, but also has generic advantages:

- In-editor calculator

	```javascript
	// select expression, e.g
	1024 * .3
	// hit hotkey, and you'll get result
	307.2
	```
- In-editor helper tool. E.g. you want to find out the charcode of the letter `A`. No need to google it, just use the Javascript:

	```javascript
	// type expression
	'A'.charCodeAt(0)
	// select and press the hotkey:
	65
	```

- Moreover, you get the full power of the Javascript: Variables, Functions, etc:

	```javascript
	var json = { a: 'Foo', b: 'Baz' };
	Object.keys(json);

	// select block, press hotkey, get the result:
	["a", "b"]
	```


Contains also some snippets:
- Existential operator

	```javascript
	var a = baz?.foo?.qux

	// place cursor after `qux`, press the hotkey and macro will match the pattern and will transform the expression into:
	var a = baz && baz.foo && baz.foo.qux
	```

- Default value setter

	```javascript
	foo!.baz

	// place cursor after `baz`, press the hotkey and macro transform the expression into:
	foo.baz || (foo.baz = )
	```

- Function creation

	```javascript
	(a, b)

	// place cursor after `b`, press the hotkey and get:
	function (a, b) {  }
	```

- _to be continue_


#### Use gecko console

Any code which contains `console.log` will use geckos console


##### Hotkey
_Default hotkey (windows): `Ctrl+Alt+Enter`_


----
(c) MIT