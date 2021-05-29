(function(b){b.tools=b.tools||{};b.tools.scrollable={version:"1.1.2",conf:{size:5,vertical:false,speed:400,keyboard:true,keyboardSteps:null,disabledClass:"disabled",hoverClass:null,clickable:true,activeClass:"active",easing:"swing",loop:false,items:".items",item:null,prev:".prev",next:".next",prevPage:".prevPage",nextPage:".nextPage",api:false}};var c;function a(o,m){var r=this,p=b(this),d=!m.vertical,e=o.children(),k=0,i;if(!c){c=r}b.each(m,function(s,t){if(b.isFunction(t)){p.bind(s,t)}});if(e.length>1){e=b(m.items,o)}function l(t){var s=b(t);return m.globalNav?s:o.parent().find(t)}o.data("finder",l);var f=l(m.prev),h=l(m.next),g=l(m.prevPage),n=l(m.nextPage);b.extend(r,{getIndex:function(){return k},getClickIndex:function(){var s=r.getItems();return s.index(s.filter("."+m.activeClass))},getConf:function(){return m},getSize:function(){return r.getItems().size()},getPageAmount:function(){return Math.ceil(this.getSize()/m.size)},getPageIndex:function(){return Math.ceil(k/m.size)},getNaviButtons:function(){return f.add(h).add(g).add(n)},getRoot:function(){return o},getItemWrap:function(){return e},getItems:function(){return e.children(m.item)},getVisibleItems:function(){return r.getItems().slice(k,k+m.size)},seekTo:function(s,w,t){if(s<0){s=0}if(k===s){return r}if(b.isFunction(w)){t=w}if(s>r.getSize()-m.size){return m.loop?r.begin():this.end()}var u=r.getItems().eq(s);if(!u.length){return r}var v=b.Event("onBeforeSeek");p.trigger(v,[s]);if(v.isDefaultPrevented()){return r}if(w===undefined||b.isFunction(w)){w=m.speed}function x(){if(t){t.call(r,s)}p.trigger("onSeek",[s])}if(d){e.animate({left:-u.position().left},w,m.easing,x)}else{e.animate({top:-u.position().top},w,m.easing,x)}c=r;k=s;v=b.Event("onStart");p.trigger(v,[s]);if(v.isDefaultPrevented()){return r}f.add(g).toggleClass(m.disabledClass,s===0);h.add(n).toggleClass(m.disabledClass,s>=r.getSize()-m.size);return r},move:function(u,t,s){i=u>0;return this.seekTo(k+u,t,s)},next:function(t,s){return this.move(1,t,s)},prev:function(t,s){return this.move(-1,t,s)},movePage:function(w,v,u){i=w>0;var s=m.size*w;var t=k%m.size;if(t>0){s+=(w>0?-t:m.size-t)}return this.move(s,v,u)},prevPage:function(t,s){return this.movePage(-1,t,s)},nextPage:function(t,s){return this.movePage(1,t,s)},setPage:function(t,u,s){return this.seekTo(t*m.size,u,s)},begin:function(t,s){i=false;return this.seekTo(0,t,s)},end:function(t,s){i=true;var u=this.getSize()-m.size;return u>0?this.seekTo(u,t,s):r},reload:function(){p.trigger("onReload");return r},focus:function(){c=r;return r},click:function(u){var v=r.getItems().eq(u),s=m.activeClass,t=m.size;if(u<0||u>=r.getSize()){return r}if(t==1){if(m.loop){return r.next()}if(u===0||u==r.getSize()-1){i=(i===undefined)?true:!i}return i===false?r.prev():r.next()}if(t==2){if(u==k){u--}r.getItems().removeClass(s);v.addClass(s);return r.seekTo(u,time,fn)}if(!v.hasClass(s)){r.getItems().removeClass(s);v.addClass(s);var x=Math.floor(t/2);var w=u-x;if(w>r.getSize()-t){w=r.getSize()-t}if(w!==u){return r.seekTo(w)}}return r},bind:function(s,t){p.bind(s,t);return r},unbind:function(s){p.unbind(s);return r}});b.each("onBeforeSeek,onStart,onSeek,onReload".split(","),function(s,t){r[t]=function(u){return r.bind(t,u)}});f.addClass(m.disabledClass).click(function(){r.prev()});h.click(function(){r.next()});n.click(function(){r.nextPage()});if(r.getSize()<m.size){h.add(n).addClass(m.disabledClass)}g.addClass(m.disabledClass).click(function(){r.prevPage()});var j=m.hoverClass,q="keydown."+Math.random().toString().substring(10);r.onReload(function(){if(j){r.getItems().hover(function(){b(this).addClass(j)},function(){b(this).removeClass(j)})}if(m.clickable){r.getItems().each(function(s){b(this).unbind("click.scrollable").bind("click.scrollable",function(t){if(b(t.target).is("a")){return}return r.click(s)})})}if(m.keyboard){b(document).unbind(q).bind(q,function(t){if(t.altKey||t.ctrlKey){return}if(m.keyboard!="static"&&c!=r){return}var u=m.keyboardSteps;if(d&&(t.keyCode==37||t.keyCode==39)){r.move(t.keyCode==37?-u:u);return t.preventDefault()}if(!d&&(t.keyCode==38||t.keyCode==40)){r.move(t.keyCode==38?-u:u);return t.preventDefault()}return true})}else{b(document).unbind(q)}});r.reload()}b.fn.scrollable=function(d){var e=this.eq(typeof d=="number"?d:0).data("scrollable");if(e){return e}var f=b.extend({},b.tools.scrollable.conf);d=b.extend(f,d);d.keyboardSteps=d.keyboardSteps||d.size;this.each(function(){e=new a(b(this),d);b(this).data("scrollable",e)});return d.api?e:this}})(jQuery);

(function($) { 	
	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.tooltip = {
		
		conf: { 
			
			// default effect variables
			effect: 'toggle',			
			fadeOutSpeed: "fast",
			predelay: 0,
			delay: 30,
			opacity: 1,			
			tip: 0,
            fadeIE: false, // enables fade effect in IE
			
			// 'top', 'bottom', 'right', 'left', 'center'
			position: ['top', 'center'], 
			offset: [0, 0],
			relative: false,
			cancelDefault: true,
			
			// type to event mapping 
			events: {
				def: 			"mouseenter,mouseleave",
				input: 		"focus,blur",
				widget:		"focus mouseenter,blur mouseleave",
				tooltip:		"mouseenter,mouseleave"
			},
			
			// 1.2
			layout: '<div/>',
			tipClass: 'tooltip'
		},
		
		addEffect: function(name, loadFn, hideFn) {
			effects[name] = [loadFn, hideFn];	
		} 
	};
	
	
	var effects = { 
		toggle: [ 
			function(done) { 
				var conf = this.getConf(), tip = this.getTip(), o = conf.opacity;
				if (o < 1) { tip.css({opacity: o}); }
				tip.show();
				done.call();
			},
			
			function(done) { 
				this.getTip().hide();
				done.call();
			} 
		],
		
		fade: [
			function(done) {
				var conf = this.getConf();
				if (!/msie/.test(navigator.userAgent.toLowerCase()) || conf.fadeIE) {
					this.getTip().fadeTo(conf.fadeInSpeed, conf.opacity, done);
				}
				else {
					this.getTip().show();
					done();
				}
			},
			function(done) {
				var conf = this.getConf();
				if (!/msie/.test(navigator.userAgent.toLowerCase()) || conf.fadeIE) {
					this.getTip().fadeOut(conf.fadeOutSpeed, done);
				}
				else {
					this.getTip().hide();
					done();
				}
			}
		]		
	};   

		
	/* calculate tip position relative to the trigger */  	
	function getPosition(trigger, tip, conf) {	

		
		// get origin top/left position 
		var top = conf.relative ? trigger.position().top : trigger.offset().top, 
			 left = conf.relative ? trigger.position().left : trigger.offset().left,
			 pos = conf.position[0];

		top  -= tip.outerHeight() - conf.offset[0];
		left += trigger.outerWidth() + conf.offset[1];
		
		// iPad position fix
		if (/iPad/i.test(navigator.userAgent)) {
			top -= $(window).scrollTop();
		}
		
		// adjust Y		
		var height = tip.outerHeight() + trigger.outerHeight();
		if (pos == 'center') 	{ top += height / 2; }
		if (pos == 'bottom') 	{ top += height; }
		
		
		// adjust X
		pos = conf.position[1]; 	
		var width = tip.outerWidth() + trigger.outerWidth();
		if (pos == 'center') 	{ left -= width / 2; }
		if (pos == 'left')   	{ left -= width; }	 
		
		return {top: top, left: left};
	}		

	
	
	function Tooltip(trigger, conf) {

		var self = this, 
			 fire = trigger.add(self),
			 tip,
			 timer = 0,
			 pretimer = 0, 
			 title = trigger.attr("title"),
			 tipAttr = trigger.attr("data-tooltip"),
			 effect = effects[conf.effect],
			 shown,
				 
			 // get show/hide configuration
			 isInput = trigger.is(":input"), 
			 isWidget = isInput && trigger.is(":checkbox, :radio, select, :button, :submit"),			
			 type = trigger.attr("type"),
			 evt = conf.events[type] || conf.events[isInput ? (isWidget ? 'widget' : 'input') : 'def']; 
		
		
		// check that configuration is sane
		if (!effect) { throw "Nonexistent effect \"" + conf.effect + "\""; }					
		
		evt = evt.split(/,\s*/); 
		if (evt.length != 2) { throw "Tooltip: bad events configuration for " + type; } 
		
		
		// trigger --> show  
		trigger.on(evt[0], function(e) {

			clearTimeout(timer);
			if (conf.predelay) {
				pretimer = setTimeout(function() { self.show(e); }, conf.predelay);	
				
			} else {
				self.show(e);	
			}
			
		// trigger --> hide
		}).on(evt[1], function(e)  {
			clearTimeout(pretimer);
			if (conf.delay)  {
				timer = setTimeout(function() { self.hide(e); }, conf.delay);	
				
			} else {
				self.hide(e);		
			}
			
		}); 
		
		
		// remove default title
		if (title && conf.cancelDefault) { 
			trigger.removeAttr("title");
			trigger.data("title", title);			
		}		
		
		$.extend(self, {
				
			show: function(e) {  

				// tip not initialized yet
				if (!tip) {
					
					// data-tooltip 
					if (tipAttr) {
						tip = $(tipAttr);

					// single tip element for all
					} else if (conf.tip) { 
						tip = $(conf.tip).eq(0);
						
					// autogenerated tooltip
					} else if (title) { 
						tip = $(conf.layout).addClass(conf.tipClass).appendTo(document.body)
							.hide().append(title);

					// manual tooltip
					} else {	
						tip = trigger.find('.' + conf.tipClass);
						if (!tip.length) { tip = trigger.next(); }
						if (!tip.length) { tip = trigger.parent().next(); } 	 
					}
					
					if (!tip.length) { throw "Cannot find tooltip for " + trigger;	}
				} 
			 	
			 	if (self.isShown()) { return self; }  
				
			 	// stop previous animation
			 	tip.stop(true, true); 			 	
			 	
				// get position
				var pos = getPosition(trigger, tip, conf);			
		
				// restore title for single tooltip element
				if (conf.tip) {
					tip.html(trigger.data("title"));
				}

				// onBeforeShow
				e = $.Event();
				e.type = "onBeforeShow";
				fire.trigger(e, [pos]);				
				if (e.isDefaultPrevented()) { return self; }
		
				
				// onBeforeShow may have altered the configuration
				pos = getPosition(trigger, tip, conf);
				
				// set position
				tip.css({position:'absolute', top: pos.top, left: pos.left});					
				
				shown = true;
				
				// invoke effect 
				effect[0].call(self, function() {
					e.type = "onShow";
					shown = 'full';
					fire.trigger(e);		 
				});					

	 	
				// tooltip events       
				var event = conf.events.tooltip.split(/,\s*/);

				if (!tip.data("__set")) {
					
					tip.off(event[0]).on(event[0], function() { 
						clearTimeout(timer);
						clearTimeout(pretimer);
					});
					
					if (event[1] && !trigger.is("input:not(:checkbox, :radio), textarea")) { 					
						tip.off(event[1]).on(event[1], function(e) {
	
							// being moved to the trigger element
							if (e.relatedTarget != trigger[0]) {
								trigger.trigger(evt[1].split(" ")[0]);
							}
						}); 
					} 
					
					// bind agein for if same tip element
					if (!conf.tip) tip.data("__set", true);
				}
				
				return self;
			},
			
			hide: function(e) {

				if (!tip || !self.isShown()) { return self; }
			
				// onBeforeHide
				e = $.Event();
				e.type = "onBeforeHide";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return; }
	
				shown = false;
				
				effects[conf.effect][1].call(self, function() {
					e.type = "onHide";
					fire.trigger(e);		 
				});
				
				return self;
			},
			
			isShown: function(fully) {
				return fully ? shown == 'full' : shown;	
			},
				
			getConf: function() {
				return conf;	
			},
				
			getTip: function() {
				return tip;	
			},
			
			getTrigger: function() {
				return trigger;	
			}		

		});		

		// callbacks	
		$.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","), function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) { 
				$(self).on(name, conf[name]); 
			}

			// API
			self[name] = function(fn) {
				if (fn) { $(self).on(name, fn); }
				return self;
			};
		});
		
	}
		
	
	// jQuery plugin implementation
	$.fn.tooltip = function(conf) {

		conf = $.extend(true, {}, $.tools.tooltip.conf, conf);
		
		// position can also be given as string
		if (typeof conf.position == 'string') {
			conf.position = conf.position.split(/,?\s/);	
		}
		
		// install tooltip for each entry in jQuery object
		// that is not an existing instance
		this.each(function() {
			if (typeof $(this).data("tooltip") === 'undefined'){
			    api = new Tooltip($(this), conf);
			    $(this).data("tooltip", api);
			};
		});
		
		return conf.api ? api: this;		 
	};
		
}) (jQuery);

// Postscribe for async ads

// An html parser written in JavaScript
// Based on http://ejohn.org/blog/pure-javascript-html-parser/

(function() {
  var supports = (function() {
    var supports = {};

    var html;
    var work = this.document.createElement('div');

    html = "<P><I></P></I>";
    work.innerHTML = html;
    supports.tagSoup = work.innerHTML !== html;

    work.innerHTML = "<P><i><P></P></i></P>";
    supports.selfClose = work.childNodes.length === 2;

    return supports;
  })();



  // Regular Expressions for parsing tags and attributes
  var startTag = /^<([\-A-Za-z0-9_]+)((?:\s+[\w\-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
  var endTag = /^<\/([\-A-Za-z0-9_]+)[^>]*>/;
  var attr = /([\-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
  var fillAttr = /^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noresize|noshade|nowrap|readonly|selected)$/i;

  var DEBUG = false;

  function htmlParser(stream, options) {
    stream = stream || '';

    // Options
    options = options || {};

    for(var key in supports) {
      if(supports.hasOwnProperty(key)) {
        if(options.autoFix) {
          options['fix_'+key] = true;//!supports[key];
        }
        options.fix = options.fix || options['fix_'+key];
      }
    }

    var stack = [];

    var append = function(str) {
      stream += str;
    };

    var prepend = function(str) {
      stream = str + stream;
    };

    // Order of detection matters: detection of one can only
    // succeed if detection of previous didn't
    var detect = {
      comment: /^<!--/,
      endTag: /^<\//,
      atomicTag: /^<\s*(script|style|noscript|iframe|textarea)[\s>]/i,
      startTag: /^</,
      chars: /^[^<]/
    };

    // Detection has already happened when a reader is called.
    var reader = {

      comment: function() {
        var index = stream.indexOf("-->");
        if ( index >= 0 ) {
          return {
            content: stream.substr(4, index),
            length: index + 3
          };
        }
      },

      endTag: function() {
        var match = stream.match( endTag );

        if ( match ) {
          return {
            tagName: match[1],
            length: match[0].length
          };
        }
      },

      atomicTag: function() {
        var start = reader.startTag();
        if(start) {
          var rest = stream.slice(start.length);
          // for optimization, we check first just for the end tag
          if(rest.match(new RegExp("<\/\\s*" + start.tagName + "\\s*>", "i"))) {
            // capturing the content is inefficient, so we do it inside the if
            var match = rest.match(new RegExp("([\\s\\S]*?)<\/\\s*" + start.tagName + "\\s*>", "i"));
            if(match) {
              // good to go
              return {
                tagName: start.tagName,
                attrs: start.attrs,
                content: match[1],
                length: match[0].length + start.length
              };
            }
          }
        }
      },

      startTag: function() {
        var match = stream.match( startTag );

        if ( match ) {
          var attrs = {};

          match[2].replace(attr, function(match, name) {
            var value = arguments[2] || arguments[3] || arguments[4] ||
              fillAttr.test(name) && name || null;

            attrs[name] = value;
          });

          return {
            tagName: match[1],
            attrs: attrs,
            unary: !!match[3],
            length: match[0].length
          };
        }
      },

      chars: function() {
        var index = stream.indexOf("<");
        return {
          length: index >= 0 ? index : stream.length
        };
      }
    };

    var readToken = function() {

      // Enumerate detects in order
      for (var type in detect) {

        if(detect[type].test(stream)) {
          if(DEBUG) { console.log('suspected ' + type); }

          var token = reader[type]();
          if(token) {
            if(DEBUG) { console.log('parsed ' + type, token); }
            // Type
            token.type = token.type || type;
            // Entire text
            token.text = stream.substr(0, token.length);
            // Update the stream
            stream = stream.slice(token.length);

            return token;
          }
          return null;
        }
      }
    };

    var readTokens = function(handlers) {
      var tok;
      while(tok = readToken()) {
        // continue until we get an explicit "false" return
        if(handlers[tok.type] && handlers[tok.type](tok) === false) {
          return;
        }
      }
    };

    var clear = function() {
      var rest = stream;
      stream = '';
      return rest;
    };

    var rest = function() {
      return stream;
    };

    if(options.fix) {
      (function() {
        // Empty Elements - HTML 4.01
        var EMPTY = /^(AREA|BASE|BASEFONT|BR|COL|FRAME|HR|IMG|INPUT|ISINDEX|LINK|META|PARAM|EMBED)$/i;

        // Elements that you can| intentionally| leave open
        // (and which close themselves)
        var CLOSESELF = /^(COLGROUP|DD|DT|LI|OPTIONS|P|TD|TFOOT|TH|THEAD|TR)$/i;


        var stack = [];
        stack.last = function() {
          return this[this.length - 1];
        };
        stack.lastTagNameEq = function(tagName) {
          var last = this.last();
          return last && last.tagName &&
            last.tagName.toUpperCase() === tagName.toUpperCase();
        };

        stack.containsTagName = function(tagName) {
          for(var i = 0, tok; tok = this[i]; i++) {
            if(tok.tagName === tagName) {
              return true;
            }
          }
          return false;
        };

        var correct = function(tok) {
          if(tok && tok.type === 'startTag') {
            // unary
            tok.unary = EMPTY.test(tok.tagName) || tok.unary;
          }
          return tok;
        };

        var readTokenImpl = readToken;

        var peekToken = function() {
          var tmp = stream;
          var tok = correct(readTokenImpl());
          stream = tmp;
          return tok;
        };

        var closeLast = function() {
          var tok = stack.pop();

          // prepend close tag to stream.
          prepend('</'+tok.tagName+'>');
        };

        var handlers = {
          startTag: function(tok) {
            var tagName = tok.tagName;
            // Fix tbody
            if(tagName.toUpperCase() === 'TR' && stack.lastTagNameEq('TABLE')) {
              prepend('<TBODY>');
              prepareNextToken();
            } else if(options.fix_selfClose &&
              CLOSESELF.test(tagName) &&
              stack.containsTagName(tagName)) {
                if(stack.lastTagNameEq(tagName)) {
                  closeLast();
                } else {
                  prepend('</'+tok.tagName+'>');
                  prepareNextToken();
                }
            } else if (!tok.unary) {
              stack.push(tok);
            }
          },

          endTag: function(tok) {
            var last = stack.last();
            if(last) {
              if(options.fix_tagSoup && !stack.lastTagNameEq(tok.tagName)) {
                // cleanup tag soup
                closeLast();
              } else {
                stack.pop();
              }
            } else if (options.fix_tagSoup) {
              // cleanup tag soup part 2: skip this token
              skipToken();
            }
          }
        };

        var skipToken = function() {
          // shift the next token
          readTokenImpl();

          prepareNextToken();
        };

        var prepareNextToken = function() {
          var tok = peekToken();
          if(tok && handlers[tok.type]) {
            handlers[tok.type](tok);
          }
        };

        // redefine readToken
        readToken = function() {
          prepareNextToken();
          return correct(readTokenImpl());
        };
      })();
    }

    return {
      append: append,
      readToken: readToken,
      readTokens: readTokens,
      clear: clear,
      rest: rest,
      stack: stack
    };

  }

  htmlParser.supports = supports;

  htmlParser.tokenToString = function(tok) {
    var handler = {
      comment: function(tok) {
        return '<--' + tok.content + '-->';
      },
      endTag: function(tok) {
        return '</'+tok.tagName+'>';
      },
      atomicTag: function(tok) {
        console.log(tok);
        return handler.startTag(tok) +
              tok.content +
              handler.endTag(tok);
      },
      startTag: function(tok) {
        var str = '<'+tok.tagName;
        for (var key in tok.attrs) {
          var val = tok.attrs[key];
          // escape quotes
          str += ' '+key+'="'+(val ? val.replace(/(^|[^\\])"/g, '$1\\\"') : '')+'"';
        }
        return str + (tok.unary ? '/>' : '>');
      },
      chars: function(tok) {
        return tok.text;
      }
    };
    return handler[tok.type](tok);
  };

  htmlParser.escapeAttributes = function(attrs) {
    var escapedAttrs = {};
    // escape double-quotes for writing html as a string

    for(var name in attrs) {
      var value = attrs[name];
      escapedAttrs[name] = value && value.replace(/(^|[^\\])"/g, '$1\\\"');
    }
    return escapedAttrs;
  };

  for(var key in supports) {
    htmlParser.browserHasFlaw = htmlParser.browserHasFlaw || (!supports[key]) && key;
  }

  this.htmlParser = htmlParser;
})();

//     postscribe.js 1.1.2
//     (c) Copyright 2012 to the present, Krux
//     postscribe is freely distributable under the MIT license.
//     For all details and documentation:
//     http://krux.github.com/postscribe


(function() {

  var global = this;

  if(global.postscribe) {
    return;
  }

  // Debug write tasks.
  var DEBUG = true;

  // Turn on to debug how each chunk affected the DOM.
  var DEBUG_CHUNK = false;

  // # Helper Functions

  var slice = Array.prototype.slice;

  // A function that intentionally does nothing.
  function doNothing() {}


  // Is this a function?
  function isFunction(x) {
    return "function" === typeof x;
  }

  // Loop over each item in an array-like value.
  function each(arr, fn, _this) {
    var i, len = (arr && arr.length) || 0;
    for(i = 0; i < len; i++) {
      fn.call(_this, arr[i], i);
    }
  }

  // Loop over each key/value pair in a hash.
  function eachKey(obj, fn, _this) {
    var key;
    for(key in obj) {
      if(obj.hasOwnProperty(key)) {
        fn.call(_this, key, obj[key]);
      }
    }
  }

  // Set properties on an object.
  function set(obj, props) {
    eachKey(props, function(key, value) {
      obj[key] = value;
    });
    return obj;
  }

  // Set default options where some option was not specified.
  function defaults(options, _defaults) {
    options = options || {};
    eachKey(_defaults, function(key, val) {
      if(options[key] == null) {
        options[key] = val;
      }
    });
    return options;
  }

  // Convert value (e.g., a NodeList) to an array.
  function toArray(obj) {
    try {
      return slice.call(obj);
    } catch(e) {
      var ret = [];
      each(obj, function(val) {
        ret.push(val);
      });
      return ret;
    }
  }

  // Test if token is a script tag.
  function isScript(tok) {
    return (/^script$/i).test(tok.tagName);
  }

  // # Class WriteStream

  // Stream static html to an element, where "static html" denotes "html without scripts".

  // This class maintains a *history of writes devoid of any attributes* or "proxy history".
  // Injecting the proxy history into a temporary div has no side-effects,
  // other than to create proxy elements for previously written elements.

  // Given the `staticHtml` of a new write, a `tempDiv`'s innerHTML is set to `proxy_history + staticHtml`.
  // The *structure* of `tempDiv`'s contents, (i.e., the placement of new nodes beside or inside of proxy elements),
  // reflects the DOM structure that would have resulted if all writes had been squashed into a single write.

  // For each descendent `node` of `tempDiv` whose parentNode is a *proxy*, `node` is appended to the corresponding *real* element within the DOM.

  // Proxy elements are mapped to *actual* elements in the DOM by injecting a data-id attribute into each start tag in `staticHtml`.
  var WriteStream = (function(){

    // Prefix for data attributes on DOM elements.
    var BASEATTR = 'data-ps-';

    // get / set data attributes
    function data(el, name, value) {
      var attr = BASEATTR + name;

      if(arguments.length === 2) {
        // Get
        var val = el.getAttribute(attr);

        // IE 8 returns a number if it's a number
        return val == null ? val : String(val);

      } else if( value != null && value !== '') {
        // Set
        el.setAttribute(attr, value);

      } else {
        // Remove
        el.removeAttribute(attr);
      }
    }

    function WriteStream(root, options) {
      var doc = root.ownerDocument;

      set(this, {
        root: root,

        options: options,

        win: doc.defaultView || doc.parentWindow,

        doc: doc,

        parser: global.htmlParser('', { autoFix: true }),

        // Actual elements by id.
        actuals: [root],

        // Embodies the "structure" of what's been written so far, devoid of attributes.
        proxyHistory: '',

        // Create a proxy of the root element.
        proxyRoot: doc.createElement(root.nodeName),

        scriptStack: [],

        writeQueue: []
      });

      data(this.proxyRoot, 'proxyof', 0);

    }


    WriteStream.prototype.write = function() {
      [].push.apply(this.writeQueue, arguments);
      // Process writes
      // When new script gets pushed or pending this will stop
      // because new writeQueue gets pushed
      var arg;
      while(!this.deferredRemote &&
            this.writeQueue.length) {
        arg = this.writeQueue.shift();

        if(isFunction(arg)) {
          this.callFunction(arg);
        } else {
          this.writeImpl(arg);
        }
      }
    };

    WriteStream.prototype.callFunction = function(fn) {
      var tok = { type: "function", value: fn.name || fn.toString() };
      this.onScriptStart(tok);
      fn.call(this.win, this.doc);
      this.onScriptDone(tok);
    };

    WriteStream.prototype.writeImpl = function(html) {
      this.parser.append(html);

      var tok, tokens = [];

      // stop if we see a script token
      while((tok = this.parser.readToken()) && !isScript(tok)) {
        tokens.push(tok);
      }

      this.writeStaticTokens(tokens);

      if(tok) {
        this.handleScriptToken(tok);
      }
    };


    // ## Contiguous non-script tokens (a chunk)
    WriteStream.prototype.writeStaticTokens = function(tokens) {

      var chunk = this.buildChunk(tokens);

      if(!chunk.actual) {
        // e.g., no tokens, or a noscript that got ignored
        return;
      }
      chunk.html = this.proxyHistory + chunk.actual;
      this.proxyHistory += chunk.proxy;

      this.proxyRoot.innerHTML = chunk.html;

      if(DEBUG_CHUNK) {
        chunk.proxyInnerHTML = this.proxyRoot.innerHTML;
      }

      this.walkChunk();

      if(DEBUG_CHUNK) {
        chunk.actualInnerHTML = this.root.innerHTML; //root
      }

      return chunk;
    };


    WriteStream.prototype.buildChunk = function (tokens) {
      var nextId = this.actuals.length,

          // The raw html of this chunk.
          raw = [],

          // The html to create the nodes in the tokens (with id's injected).
          actual = [],

          // Html that can later be used to proxy the nodes in the tokens.
          proxy = [];

      each(tokens, function(tok) {

        raw.push(tok.text);

        if(tok.attrs) { // tok.attrs <==> startTag or atomicTag or cursor
          // Ignore noscript tags. They are atomic, so we don't have to worry about children.
          if(!(/^noscript$/i).test(tok.tagName)) {
            var id = nextId++;

            // Actual: inject id attribute: replace '>' at end of start tag with id attribute + '>'
            actual.push(
              tok.text.replace(/(\/?>)/, ' '+BASEATTR+'id='+id+' $1')
            );

            // Don't proxy scripts: they have no bearing on DOM structure.
            if(tok.attrs.id !== "ps-script") {
              // Proxy: strip all attributes and inject proxyof attribute
              proxy.push(
                // ignore atomic tags (e.g., style): they have no "structural" effect
                tok.type === 'atomicTag' ? '' :
                  '<'+tok.tagName+' '+BASEATTR+'proxyof='+id+(tok.unary ? '/>' : '>')
              );
            }
          }

        } else {
          // Visit any other type of token
          // Actual: append.
          actual.push(tok.text);
          // Proxy: append endTags. Ignore everything else.
          proxy.push(tok.type === 'endTag' ? tok.text : '');
        }
      });

      return {
        tokens: tokens,
        raw: raw.join(''),
        actual: actual.join(''),
        proxy: proxy.join('')
      };
    };

    WriteStream.prototype.walkChunk = function() {
      var node, stack = [this.proxyRoot];

      // use shift/unshift so that children are walked in document order

      while((node = stack.shift()) != null) {

        var isElement = node.nodeType === 1;
        var isProxy = isElement && data(node, 'proxyof');

        // Ignore proxies
        if(!isProxy) {

          if(isElement) {
            // New actual element: register it and remove the the id attr.
            this.actuals[data(node, 'id')] = node;
            data(node, 'id', null);
          }

          // Is node's parent a proxy?
          var parentIsProxyOf = node.parentNode && data(node.parentNode, 'proxyof');
          if(parentIsProxyOf) {
            // Move node under actual parent.
            this.actuals[parentIsProxyOf].appendChild(node);
          }
        }
        // prepend childNodes to stack
        stack.unshift.apply(stack, toArray(node.childNodes));
      }
    };

    // ### Script tokens

    WriteStream.prototype.handleScriptToken = function(tok) {
      var remainder = this.parser.clear();

      if(remainder) {
        // Write remainder immediately behind this script.
        this.writeQueue.unshift(remainder);
      }

      tok.src = tok.attrs.src || tok.attrs.SRC;

      if(tok.src && this.scriptStack.length) {
        // Defer this script until scriptStack is empty.
        // Assumption 1: This script will not start executing until
        // scriptStack is empty.
        this.deferredRemote = tok;
      } else {
        this.onScriptStart(tok);
      }

      // Put the script node in the DOM.
      var _this = this;
      this.writeScriptToken(tok, function() {
        _this.onScriptDone(tok);
      });

    };

    WriteStream.prototype.onScriptStart = function(tok) {
      tok.outerWrites = this.writeQueue;
      this.writeQueue = [];
      this.scriptStack.unshift(tok);
    };

    WriteStream.prototype.onScriptDone = function(tok) {
      // Pop script and check nesting.
      if(tok !== this.scriptStack[0]) {
        this.options.error({ message: "Bad script nesting or script finished twice" });
        return;
      }
      this.scriptStack.shift();

      // Append outer writes to queue and process them.
      this.write.apply(this, tok.outerWrites);

      // Check for pending remote

      // Assumption 2: if remote_script1 writes remote_script2 then
      // the we notice remote_script1 finishes before remote_script2 starts.
      // I think this is equivalent to assumption 1
      if(!this.scriptStack.length && this.deferredRemote) {
        this.onScriptStart(this.deferredRemote);
        this.deferredRemote = null;
      }
    };

    // Build a script and insert it into the DOM.
    // Done is called once script has executed.
    WriteStream.prototype.writeScriptToken = function(tok, done) {
      var el = this.buildScript(tok);

      if(tok.src) {
        // Fix for attribute "SRC" (capitalized). IE does not recognize it.
        el.src = tok.src;
        this.scriptLoadHandler(el, done);
      }

      try {
        this.insertScript(el);
        if(!tok.src) {
          done();
        }
      } catch(e) {
        this.options.error(e);
        done();
      }
    };

    // Build a script element from an atomic script token.
    WriteStream.prototype.buildScript = function(tok) {
      var el = this.doc.createElement(tok.tagName);

      // Set attributes
      eachKey(tok.attrs, function(name, value) {
        el.setAttribute(name, value);
      });

      // Set content
      if(tok.content) {
        el.text = tok.content;
      }

      return el;
    };


    // Insert script into DOM where it would naturally be written.
    WriteStream.prototype.insertScript = function(el) {
      // Append a span to the stream. That span will act as a cursor
      // (i.e. insertion point) for the script.
      this.writeImpl('<span id="ps-script"/>');

      // Grab that span from the DOM.
      var cursor = this.doc.getElementById("ps-script");

      // Replace cursor with script.
      cursor.parentNode.replaceChild(el, cursor);
    };


    WriteStream.prototype.scriptLoadHandler = function(el, done) {
      function cleanup() {
        el = el.onload = el.onreadystatechange = el.onerror = null;
        done();
      }

      // Error handler
      var error = this.options.error;

      // Set handlers
      set(el, {
        onload: function() { cleanup(); },

        onreadystatechange: function() {
          if(/^(loaded|complete)$/.test( el.readyState )) {
            cleanup();
          }
        },

        onerror: function() {
          error({ message: 'remote script failed ' + el.src });
          cleanup();
        }
      });
    };

    return WriteStream;

  }());






  // Public-facing interface and queuing
  var postscribe = (function() {
    var nextId = 0;

    var queue = [];

    var active = null;

    function nextStream() {
      var args = queue.shift();
      if(args) {
        args.stream = runStream.apply(null, args);
      }
    }


    function runStream(el, html, options) {
      active = new WriteStream(el, options);

      // Identify this stream.
      active.id = nextId++;
      active.name = options.name || active.id;
      postscribe.streams[active.name] = active;

      // Override document.write.
      var doc = el.ownerDocument;

      var stash = { write: doc.write, writeln: doc.writeln };

      function write(str) {
        str = options.beforeWrite(str);
        active.write(str);
        options.afterWrite(str);
      }

      set(doc, {
        write: function(){
          return write(toArray(arguments).join(''));
        },
        writeln: function(str) {
          return write(toArray(arguments).join('') + '\n');
        }
      });

      // Override window.onerror
      var oldOnError = active.win.onerror || doNothing;

      // This works together with the try/catch around WriteStream::insertScript
      // In modern browsers, exceptions in tag scripts go directly to top level
      active.win.onerror = function(msg, url, line) {
        options.error({ msg: msg + ' - ' + url + ':' + line });
        oldOnError.apply(active.win, arguments);
      };

      // Write to the stream
      active.write(html, function streamDone() {
        // restore document.write
        set(doc, stash);

        // restore window.onerror
        active.win.onerror = oldOnError;

        options.done();
        active = null;
        nextStream();
      });

      return active;
    }


    function postscribe(el, html, options) {
      if(isFunction(options)) {
        options = { done: options };
      }
      options = defaults(options, {
        done: doNothing,
        error: function(e) { throw e; },
        beforeWrite: function(str) { return str; },
        afterWrite: doNothing
      });

      el =
        // id selector
        (/^#/).test(el) ? global.document.getElementById(el.substr(1)) :
        // jquery object. TODO: loop over all elements.
        el.jquery ? el[0] : el;


      var args = [el, html, options];

      el.postscribe = {
        cancel: function() {
          if(args.stream) {
            // TODO: implement this
            args.stream.abort();
          } else {
            args[1] = doNothing;
          }
        }
      };

      queue.push(args);
      if(!active) {
        nextStream();
      }

      return el.postscribe;
    }

    return set(postscribe, {
      // Streams by name.
      streams: {},
      // Queue of streams.
      queue: queue,
      // Expose internal classes.
      WriteStream: WriteStream
    });

  }());

  // export postscribe
  global.postscribe = postscribe;

}());



// RateHub functions

function poll(period, limit, predicate, success, count) {
	if (!count)
		count = 0;
	if (!predicate()) {
		if (count < limit)
	    	setTimeout(function() { poll(period, limit, predicate, success, ++count) }, period);
    } else {
    	success();
	}
}

function addScriptRef(src, callback, appendTo, id) {
	if (typeof(jQuery) == 'function') {
		var existing = jQuery('script[src="' + src + '"]');
		if (existing.length) {
			poll(100, 100,
				function() { return jQuery(existing[0]).data("loaded") },
				function() { callback() }
			);

			return;
		}
	}

	var script_tag = document.createElement('script');
	script_tag.setAttribute("type","text/javascript");
	script_tag.setAttribute("src", src);
	if (id)
		script_tag.setAttribute("id", id);

	if (typeof(jQuery) == 'function')
		jQuery(script_tag).data("loaded", false);
	if (typeof(callback) == "function") {
		if (script_tag.addEventListener) {
			script_tag.onload = function () {
				if (typeof(jQuery) == 'function')
					jQuery(script_tag).data("loaded", true);
				callback();
			};
		} else {
			script_tag.onreadystatechange = function () { // Same thing but for IE
				if (this.readyState == 'complete' || this.readyState == 'loaded') {
					if (typeof(jQuery) == 'function')
						jQuery(script_tag).data("loaded", true);
					callback();
				}
			};
		}
	}

	if (appendTo)
		appendTo.appendChild(script_tag);
	else
		document.body.appendChild(script_tag);
}

function parseUrlParams(url) {
	var urlParams = {};
    var e,
        a = /\+/g,  // regex for replacing addition symbol with a space
        r = /([^&#=]+)=?([^&#]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = '';

    if (url) {
    	var questionMarkPos = url.indexOf('?');
    	if (questionMarkPos >= 0) q = url.substring(questionMarkPos + 1);
    } else {
    	q = window.location.search.substring(1);
    }

    while (e = r.exec(q))
       urlParams[d(e[1])] = d(e[2]);
	
    return urlParams;
}

function appendQueryParams(href, params) {
	var currentParams = parseUrlParams(href);
	jQuery.extend(currentParams, params);

	var questionMarkPos = href.indexOf('?');
	if (questionMarkPos !== -1) {
		href = href.substring(0, questionMarkPos);
	}

	if (!jQuery.isEmptyObject(currentParams)) {
		href = href + '?' + jQuery.param(currentParams);
	}

	return href;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function circleDistance(lat1, lng1, lat2, lng2) {
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLng = (lng2-lng1) * Math.PI / 180;
	var lat1 = lat1 * Math.PI / 180;
	var lat2 = lat2 * Math.PI / 180;

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	
	return c;
}

function clearForm(form) {
	form.find(':input').each(function() {
        switch(this.type) {
            case 'password':
            case 'text':
            case 'textarea':
                $(this).val(null);
                break;
            case 'select-multiple':
            case 'select-one':
            	$(this).val(null).change();
            	break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
        }
    });
}

(function($) {
    if (typeof $.cookie !== 'undefined') return;
    $.extend({
		cookie: function(key, value, options) {
		    // key and at least value given, set cookie...
		    if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
		        options = $.extend({}, options);

		        if (value === null || value === undefined) {
		            options.expires = -1;
		        }

		        if (typeof options.expires === 'number') {
		            var days = options.expires, t = options.expires = new Date();
		            t.setDate(t.getDate() + days);
		        }

		        value = String(value);
		        var domain = window.location.hostname.replace(/.*ratehub.ca/, '.ratehub.ca');
		        if (!/\./.test(domain) || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(domain))
		            domain = null;

		        return (document.cookie = [
		            encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
		            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
		            options.path    ? '; path=' + options.path : '',
		            domain  ? '; domain=' + domain : '',
		            options.secure  ? '; secure' : ''
		        ].join(''));
		    }

		    // key and possibly options given, get cookie...
		    options = value || {};
		    var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

		    var pairs = document.cookie.split('; ');
		    for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
		        if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
		    }
		    return null;
		}
    });
})(jQuery);

(function($) {
	if (typeof $.mobile !== 'undefined') return;
	$.extend({
		mobile: {
			any: function() {
				return $.mobile.ios() || $.mobile.android() || $.mobile.bb() || $.mobile.wp();
			},
			ios: function() {
				return $.mobile.iphone() || $.mobile.ipad() || $.mobile.ipod();
			},
			iphone: function() {
				return navigator.userAgent.match(/iPhone/i);
			},
			ipad: function() {
				return navigator.userAgent.match(/iPad/i);
			},
			ipod: function() {
				return navigator.userAgent.match(/iPod/i);
			},		
			android: function() {
				return navigator.userAgent.match(/Android/i);
			},
			bb: function() {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			wp: function() {
				return navigator.userAgent.match(/IEMobile/i);
			}
		}
	});
})(jQuery);

function addMap(brokers, address, reorderBrokers) {
	if (!$.isArray(brokers)) {
		var brokersArray = [];
		for (var index in brokers) {
			brokersArray.push(brokers[index]);
		}
		brokers = brokersArray;
	}
	
	if (!address && brokers.length > 0) {
		address = brokers[0].address[1];
	} else if (!address) {
		address = window.address;
	}

	mapBounds = new google.maps.LatLngBounds();

	geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': address }, function(results, status) {

		if (status != google.maps.GeocoderStatus.OK)
			return;

		var options = {
			zoom: 11,
			scrollwheel: false,
			center: results[0].geometry.location,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		window.map = new google.maps.Map(document.getElementById('map_canvas'), options);
		if (brokers.length === 1) map.selected = true;
		var idle = google.maps.event.addListener(map, 'idle', function() {
			var changed = google.maps.event.addListener(map, 'bounds_changed', function() {
				map.selected = true;
				google.maps.event.removeListener(changed);
			});
			google.maps.event.removeListener(idle);
		});

		function plotBrokerLocation(broker) {
			if (!(broker && broker.lat && broker.lng)) return;

			broker.location = new google.maps.LatLng(broker.lat, broker.lng)
			broker.marker = new google.maps.Marker({
				map: map,
				position: broker.location,
				title: broker.brokerage
			});

			mapBounds.extend(broker.location);
			if (!map.selected) {
				map.fitBounds(mapBounds);
				if (map.zoom > 13) {
					map.setZoom(13);
				}
			}

			var content = $('#infowindow-template').tmpl(broker);
			attachRateDetailsDialog(content.find('a.contact-now'), broker.contact_href, true);
			broker.infowindow = new google.maps.InfoWindow({ 'content': content[0] });
			$(window).trigger('loadedInfowindow');

			google.maps.event.addListener(broker.marker, 'click', function() {
				if (typeof(selectBroker) == 'function') {
					selectBroker(broker, true);
				} else {
					broker.selected = true;
					broker.infowindow.open(map, broker.marker);
				}
				if (typeof(reorderBrokers) != 'undefined') reorderBrokers(brokers);
			});

			google.maps.event.addListener(broker.infowindow, 'closeclick', function() {
				if (typeof(selectBroker) == 'function') {
					selectBroker(null, true);
				}
			});
		}

		for (var i = 0; i < brokers.length; i++) {
			plotBrokerLocation(brokers[i]);			
		}

		if (typeof(reorderBrokers) != 'undefined') {
			centerMarkers(map, brokers);
		}	
	});
}

function centerMarkers(map, brokers) {
	var timeoutId = null;
	google.maps.event.addListener(map, 'center_changed', function() {
		if (timeoutId)
			clearTimeout(timeoutId);
		timeoutId = setTimeout(function() { reorderBrokers(brokers); }, 250);
	});

	if (window.bounds && !map.selected)
		map.fitBounds(bounds);

	reorderBrokers(brokers);
}

function detachRateDetailsDialog(link, clearHref) {
	link.unbind('click').removeClass('cboxElement');
	if(clearHref)
		link.removeAttr("href");
}

function attachRateDetailsDialog(link, href, contact, forceMobilePopup) {

	if (contact) forceMobilePopup = true;
	
	// On mobile devices, do not show the popup but redirect to the page
	if (jQuery(window).width() <= 760 && !forceMobilePopup) {
		link.attr("target", "_blank").attr("href", function(index, val) {
			return appendQueryParams(href || val, params);
		});

		return;
	}

	var version = ratehub.rateDetailsVersion;
	var displayVersion = ratehub.displayVersion;

	var adjustWidgetFrame = function() {};
	if (typeof(window.adjustWidgetFrame) == 'function')
		adjustWidgetFrame = window.adjustWidgetFrame;

	if (typeof href == 'object' && href && href.href) {
		href = ratehub.serverUri + href.href;
	}

	detachRateDetailsDialog(link);

	var size = null;
	var options = { open: true, iframe: true, close: Globalize.localize('close') || "close" };

	var availableWidth = jQuery(document).width();

	if (ratehub.displayVersion !== 1) {
		options.forceV2 = true;
		if (href) link.attr("href", href);
	} else {
		var params = {
			popup: 'popup',
			version: displayVersion
		};

		if (ratehub.user.aff_info) {
			jQuery.extend(params, ratehub.user.aff_info);
		}

		if (availableWidth <= 725) {
			size = "small";
			options.innerWidth = '600px';
			options.innerHeight = '610px';

			jQuery("#colorbox").removeClass("reduced").addClass("small");
			link.attr("href", function(index, val) {
				params.size = 'small';
				return appendQueryParams(href || val, params);
			});
		} else if (availableWidth <= 900) {
			size = "reduced";
			options.width = '725px';
			options.innerHeight = '610px';

			jQuery("#colorbox").removeClass("small").addClass("reduced");
			link.attr("href", function(index, val) {
				params.size = 'small';
				return appendQueryParams(href || val, params);
			});
		} else {
			jQuery("#colorbox").removeClass("reduced").removeClass("small");
			options.width = version ? '762px' : '900px';
			options.innerHeight = contact ? (version ? '600px' : '465px') : (version ? '600px' : '595px');

			link.attr("href", function(index, val) {
				return appendQueryParams(href || val, params);
			});
		};		
	}


	link.click(function(event) {
		event.preventDefault();
		event.stopPropagation();

		if (options.forceV2) {
			rh.Dialog.show(this.href, options);
		} else {
			options.href = this.href;
			options.className = (version ? 'alt white' : '');
			options.onClosed = function() { adjustWidgetFrame({ 'restore_scroll': true }); };
			jQuery.colorbox(options);			
		}


		if (typeof(_gaq) == 'object' && typeof (_gaq.push) == 'function') {
			_gaq.push(['_trackEvent', 'Rate Details Popup', 'clicked', this.href]);
		}
	});
}

function showThankYouDialog() {
	var url = '/thankyou';
	jQuery.colorbox({ open: true, href: url, iframe: true,
		innerWidth: '560px', innerHeight: '365px', className: 'alt white'});
}
