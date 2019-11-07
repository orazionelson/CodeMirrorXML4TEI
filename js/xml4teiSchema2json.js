	/**
	 * jQuery plugin to convert a given $.ajax response xml object to json.
	 *
	 * @example var json = $.xml2json(response);
	 * 
	 * source: GitHub: https://github.com/Sorebo/jQuery-xml2json
	 * 
	 * modified for this script from Alfredo Cosco
	 */
	(function() {
		$.fn.xml4teiSchema2json = function(options) {

		var defaultOptions = {
			schema: false,
			xml: false,
			normalize: true,
		};
		
		
		
		var settings = $.extend({}, defaultOptions, options);
        if (this.length > 1) {
            this.each(function() { $(this).pluginName(options) });
            return this;
        }
	
		var attrkey = 'attrs';
		var schema=settings.schema;		
		var xml=settings.xml;		
		
		// private methods
		var parseXML=function(data) {
			
			var xml, tmp;
			if (!data || typeof data !== "string") {
				return null;
			}
			try {
				if (window.DOMParser) { // Standard
					tmp = new DOMParser();
					xml = tmp.parseFromString(data, "text/xml");
				} else { // IE
					xml = new ActiveXObject("Microsoft.XMLDOM");
					xml.async = "false";
					xml.loadXML(data);
				}
			} catch (e) {
				xml = undefined;
			}
			if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
				throw new Error("Invalid XML: " + data);
			}
			return xml;
		}
	
		var normalize=function(value){
			if (!!settings.normalize){
				return (value || '').trim();
			}
			return value;
		}
	
		var schema2jsonImpl=function(xml) {
	        
			var i, result = {}, attrs = {}, node, child, name;
			result[attrkey] = attrs;			
			
			if (xml.attributes && xml.attributes.length > 0) {
				
				for (i = 0; i < xml.attributes.length; i++){
					var item = xml.attributes.item(i);
					
					if(item.value.split(",").length > 1)
						{attrs[item.nodeName] = item.value.split(",");}
					else 
						{attrs[item.nodeName] = [item.value];}	 
				}
			}
			
	        	        
			for (i = 0; i < xml.childNodes.length; i++) {
				node = xml.childNodes[i];
				
				if (node.nodeType === 1) {
					if (node.attributes.length === 0 && node.childElementCount === 0){
						child = normalize(node.textContent, settings);
						//console.log(child);
						
					} else {
						child = schema2jsonImpl(node);
					}
					name = node.nodeName;
					
					if (result.hasOwnProperty(name)) {
						// For repeating elements, cast/promote the node to array
						var val = result[name];
						
						if (!Array.isArray(val)) {
							val = [val];
							result[name] = val;
						}
						val.push(child);
						
					} else {
					    if(child.children){
					        if (typeof(child.children) === 'string' || child.children instanceof String)
	                            {
	                                child={children:[child.children]};
	                            }
					        }  
					    if(node.nodeName=='children' && child.length==0){child={children:[""]};}
						result[name] = child;					
					}
				}
			}
	        
			return result;
		}
	
		/**
		 * Converts an xml document or string to a JSON object.
		 *
		 * @param xml
		 */
		this.schema2json=function(xml) {
			
			var n;
			
			if (!xml) {
				return xml;
			}

	
			if (typeof xml === 'string') {
				
				xml = parseXML(xml).documentElement;
			}
	
			var root = {};
			
			if (xml.attributes && xml.attributes.length === 0 && xml.childElementCount === 0){
			  root[xml.nodeName] = normalize(xml.textContent, settings);
			  
			  
			} else {
			    
			  root[xml.nodeName] = schema2jsonImpl(xml);
			  
			}

	        root=root['#document']['cm_tei_schema'];
	              
	        var topValue=root['top'];
	        delete root['top'];
	        root=Object.assign({ "!top": [topValue] },root);
	
	
			return root;
		}
	
	
	return this.schema2json(xml);	
}
})(jQuery);
