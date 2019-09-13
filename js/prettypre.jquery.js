/*****
 * Make a pretty 'pre' for your code
 * by Alfredo Cosco 2015
 * @orazio_nelson
 * alfredo.cosco@gmail.com
 * source of inspiration 
 * http://stackoverflow.com/questions/4631646/how-to-preserve-whitespace-indentation-of-text-enclosed-in-html-pre-tags-exclu
 * https://perishablepress.com/perfect-pre-tags/
 * */
(function ( $ ) {

	$.fn.prettyPre = function (){
		var preEl = $(this);
		for (var i = 0; i < preEl.length; i++)
			{	
			var content = $(preEl[i]).html()
					.replace(/[<>]/g, function(m) { return {'<':'&lt;','>':'&gt;'}[m]})
					;						
			var tabs_to_remove = '';
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

}( jQuery ));
