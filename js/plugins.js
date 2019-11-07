// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


(function ( $ ) {


	function parseVar(selector,settings,varname){
		var value='';
		if($(selector).data(varname)){
			value = $(selector).data(varname);
		}
		else{
			value=settings[varname];
		}
		return value;
		}

/*****
 * Make a pretty 'pre' for your code
 * by Alfredo Cosco 2016
 * @orazio_nelson
 * alfredo.cosco@gmail.com
 * source of inspiration 
 * http://stackoverflow.com/questions/4631646/how-to-preserve-whitespace-indentation-of-text-enclosed-in-html-pre-tags-exclu
 * https://perishablepress.com/perfect-pre-tags/
 * */
	$.fn.prettyPre = function (){
		var preEl = $(this);
		for (var i = 0; i < preEl.length; i++)
			{	
			var content = $(preEl[i]).html()
					.replace(/[<>]/g, function(m) { return {'<':'&lt;','>':'&gt;'}[m]})
					.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1">$1</a>')
					;						
			var tabs_to_remove = '';
			//console.log(content.indexOf('\t'));
			while (content.indexOf('\t') == '0')
			{			
			  tabs_to_remove += '\t';
			  content = content.substring(1);			  
			}
			var re = new RegExp('\n' + tabs_to_remove, 'g');
			content = content.replace(re, '\n');              
			$(preEl[i]).html(content);
			}	
		};



/***********************
 * Tocfy plugin
 * by Alfredo Cosco 2016
 * @orazio_nelson
 * alfredo.cosco@gmail.com
 * options:
 *	tocside: right|left|top
 *	tocbehavior: fixed|scrollFixed|scroll
 **********************/

	$.fn.tocfy = function (options){
		var defaults = {
			tocside : 'right',
            tocposition: 'scroll',
            
        };
        var settings = $.extend({}, defaults, options);
        if (this.length > 1) {
            this.each(function() { $(this).pluginName(options) });
            return this;
        }		
		
		var s=parseVar(this,settings,'tocside');
		var p=parseVar(this,settings,'tocbehavior');
		

		if(s=='right'){var pull='pull-right';}
		else {var pull='';}
		
		if(s=='top') {var col1='12'; var col2='12';}
		else  {var col1='9'; var col2='3';}
		

		
		var fixed='';
		if(s!='top'){
			if(p=='fixed') {fixed=' data-spy = "affix"';}
			else if(p=='scrollFixed') {fixed=' id="menuBlock"';}
		}
		//console.log(fixed);
		$(this).wrap( '<div class="row"></div>' )
		.before('<nav class="toc list-group hidden-print hidden-xs hidden-sm"'+fixed+' />')
		.wrap('<div class="col-md-'+col1+'" role="main" />');
		
		$('.toc').wrap('<div class="col-md-'+col2+' '+pull+'" role="complementary" />');

		var i=1;
		
		$(this).find(':header' ).each(function() {
			var id = $(this).closest( ".tocfy" ).attr('id');
			$(this).attr('id', id+i++);
			$(this).addClass('toc-item');
			});//.clone().appendTo('.toc');
		var selector = '.toc-item';
		var all = $(selector);
		var nodes = []; 
		for(var i = all.length; i--; nodes.unshift(all[i]));
		var result = document.createElement("ul");
		buildRec(nodes, result, 2);
		$(result).addClass('nav scrollnav nav-stacked');
		$(".toc").append(result);
		
		if(p=='scrollFixed') {
			
			var nh=0;
			
			if($('.navbar-fixed-top')[0]){
				nh=$('nav.navbar').height();
			}
			
			var mbw=$('#menuBlock').width();
			var pos = $('#menuBlock').offset().top;// - parseFloat($('#menuBlock').css('marginTop').replace(/auto/, 0));
			
			
			$(window).scroll(function() {
				var menu = $('#menuBlock');   
			    if ($(window).scrollTop() > pos-nh)
			      {
					menu.css({
			        'position': 'fixed',
			        'top': nh+5,
			        'z-index':1300,
			        'width':mbw+'px'
			      });
				}
			    else{
			      menu.css({
			        'position': 'relative',
			        'top': 'auto',
			        'width':mbw+'px'
			      });
			   }
			});
		}
	};
	
	/**
	 * Build Toc
	 * buildRec() http://jsfiddle.net/fA4EW/
	 * **/
	function buildRec(nodes, elm, lv) {
	    var node;
	    // filter
	    do {
	        node = nodes.shift();
	    } while(node && !(/^h[123456]$/i.test(node.tagName)));
	    // process the next node
	    
	    if(node) {
	        var ul, li, cnt;
	        var curLv = parseInt(node.tagName.substring(1));
	        
		        if(curLv == lv) { // same level append an il
		            cnt = 0;
		        } else if(curLv < lv) { // walk up then append il
		            cnt = 0;
		            do {
						//console.log(elm);
		                elm = elm.parentNode.parentNode;
		                cnt--;
		            } while(cnt > (curLv - lv));
		        } else if(curLv > lv) { // create children then append il
		            cnt = 0;
		            do {
		                li = elm.lastChild;
		                if(li == null)
		                    li = elm.appendChild(document.createElement("li"));
		                elm = li.appendChild(document.createElement("ul"));
		                cnt++;
		            } while(cnt < (curLv - lv));
		        }
		        li = elm.appendChild(document.createElement("li"));
		        
		        // replace the next line with archor tags or whatever you want
		        li.innerHTML = '<a href="#'+node.id+'" role="menuitem">'+node.innerHTML+'</a>';
		        // recursive call
		        buildRec(nodes, elm, lv + cnt);
	    }
	}	


/*********************
 * Scroller
 * by Alfredo Cosco 2016
 * @orazio_nelson
 * alfredo.cosco@gmail.com
 ********************/
	$.fn.scroller = function (options){
		
		var defaults = {
			selector : '.scrollnav',
            delta: 0,
            
        };
        var settings = $.extend({}, defaults, options);
		
		var delta=parseVar(this,settings,'delta');
		var selector=parseVar(this,settings,'selector');


		$(selector).find("a[href^='#']").on('click', function(e) {
			// prevent default anchor click behavior
			e.preventDefault();
			history.pushState({}, '', this.href);
			// store hash
			var hash = this.hash;
	
		   //create and define the target
		   var target;
		   if(hash=='#home') target=0;
		   else target = $(hash).offset().top;
	   
	   var ntop=target-(delta*2);
	   //console.log(ntop);
	   // animate
	   $('html, body').animate({
	       scrollTop: target-delta
	     }, 1000);
	
		});

	};
//}( jQuery ));

/***********************
 * Tabfy plugin
 * by Alfredo Cosco 2016
 * @orazio_nelson
 * alfredo.cosco@gmail.com
 **********************/
//(function ( $ ) {
	$.fn.tabfy = function (selector){
		var nav = $(this).data('tabNav');
		if(!nav) nav='tab';

		var fade = $(this).data('tabFade');
		
		var fading='';
		if(fade==true) {fading='fade';}

		var labels = [];
		var contents = [];
		var i=0;

		$(this).wrapInner('<div class="original-text" />')
		.prepend('<ul class="nav nav-'+nav+'s" role="tablist" />')
		.find('ul.nav').after('<div class="tab-content" />');

		$(this).find(selector).each(function() {
			var connector= $(this).text();
			connector=connector.replace(/ /g, '');
			var label = '<li role="presentation"><a href="#'+connector+'" aria-controls="'+connector+'" role="tab" data-toggle="'+nav+'">'+$(this).text()+'</a></li>';		
			var content= '<div role="tabpanel" class="tab-pane '+fading+'" id="'+connector+'">'+$(this).next().html()+'</div>';	
			labels.push(label);
			contents.push(content);
			i++
		});
		
		var tabs = labels.join('');
		var tcont = contents.join('');

		$(this).find('ul.nav').append(tabs);
		$(this).find('.tab-content').append(tcont);	
		
		$(this).find('ul.nav a:first').tab('show');

		$(this).find( ".original-text" ).remove();
	}	
//}( jQuery ));

/***********************
 * Fullpage plugin
 * set element min-height to 100% of page
 * should be combined with css background:cover
 * by Alfredo Cosco 2016
 * @orazio_nelson
 * alfredo.cosco@gmail.com
 **********************/
//(function ( $ ) {
	$.fn.fullpage = function (delta){
		if(!delta) delta=0;
		var wh = $(window).height();
		$('.fullpage').css('min-height',(wh-delta));
	}	
//}( jQuery ));
		
		
/*********************
 * Footnotes
 * by Alfredo Cosco 2016
 * @orazio_nelson
 * alfredo.cosco@gmail.com
 ********************/
//(function ( $ ) {
	$.fn.footnotes = function (options){
		
		//default options.
        var settings = $.extend({
            viewNotes: true, 		// true,false,'collapse',
            popover: true,	
            buttonLabel: "See footnotes",
            delta: 70, 
            container: 'body',
            //popover settings
            html : true,
            trigger: "hover",
			placement: "auto bottom"
        }, options );
		
		var i=1;
		
		//Show/hide the footnotes block
		if(!settings.viewNotes) {
			settings.popover=true;
			$('#footnotes').hide();
			settings.trigger='click';
			}
		else if(settings.viewNotes=='collapse'){
			$('#footnotes').addClass('collapse').before('<a class="btn btn-primary" data-toggle="collapse" href="#footnotes" aria-expanded="false" aria-controls="footnotes">'+settings.buttonLabel+'</a>');
			}
		
		//Build reverse links and fill-in popovers			
		$('.bs-footnote').each(function (index, value){
			//wrap the link in <sup> and square brackets
			$(this).wrap("<sup>").before('[').after(']');
			//add unique id to your footnote links
			$(this).attr('id', "bs-footnote-a-"+i);
			
			//get the target, or the footnote id			
			var lnk = $(this).attr('href');
						
			//create reverse (bottom-top) link in the footnote
			var aid = $(this).attr('id');
			$(lnk).find('span').wrapInner('<a class="bs-footnote-r" id="bs-footnote-r-'+i+'" href="#'+aid+'"></a>');

			//get the footnote content	
			var fn = $(lnk).html();
			//add this content to data-content attribute
			$(this).data('content', fn);
			
			//show the footnote as a popover
			if(settings.popover){
			$(this).popover({
				container: settings.container,
				html : settings.html,
				trigger: settings.trigger,
				placement: settings.placement
				});
			}
			
			//Manage notes view
			if(settings.viewNotes) {	
			$(this).on('click', function(e) {
				e.preventDefault();
				if(settings.viewNotes=="collapse"){$('.collapse').addClass('in');}
				
				var hash = this.hash;				
				var target = $(hash).offset().top;
				//console.log(hash);
				target = target-settings.delta
				$('html, body').animate({
					scrollTop: target
					}, 1000, function(){
					$("#footnotes div").removeClass('selected');
					$(lnk).addClass('selected');
					});
				});	
			
			$('#bs-footnote-r-'+i).on('click', function(e) {
				e.preventDefault();
				if(settings.viewNotes=="collapse"){$('.collapse').removeClass('in');}
				
				var hash = this.hash;				
				var target = $(hash).offset().top;
				target = target-settings.delta
				$('html, body').animate({
					scrollTop: target
					}, 1000, function(){
					$("#footnotes div").removeClass('selected');
					});
				});
				}		
		
		i++;});
		
	}
	//trigger the function
	//$().footnotes();	
}( jQuery ));

