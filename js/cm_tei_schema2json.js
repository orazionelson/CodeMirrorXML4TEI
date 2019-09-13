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

		var defaultOptions = {
			//attrkey: '$',
			charkey: '_',
			normalize: false,
			explicitArray: false
		};
	
		// extracted from jquery
		function parseXML(data) {
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
	
		function normalize(value, options){
			if (!!options.normalize){
				return (value || '').trim();
			}
			return value;
		}
	
		function cm_tei_schema2jsonImpl(xml, options) {
	        
			var i, result = {}, attrs = {}, node, child, name;
			//result[options.attrkey] = attrs;
	
			if (xml.attributes && xml.attributes.length > 0) {
				for (i = 0; i < xml.attributes.length; i++){
					var item = xml.attributes.item(i);
					attrs[item.nodeName] = item.value;
				}
			}
	
			// element content
			if (xml.childElementCount === 0) {
			    
				result[options.charkey] = normalize(xml.textContent, options);
			}
	        
	        //console.log(xml.childNodes); 
	        
			for (i = 0; i < xml.childNodes.length; i++) {
				node = xml.childNodes[i];
				if (node.nodeType === 1) {
				    
	                    //console.log(node.length);
					if (node.attributes.length === 0 && node.childElementCount === 0){
						child = normalize(node.textContent, options);
					} else {
						child = cm_tei_schema2jsonImpl(node, options);
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
						
					} else if(options.explicitArray === true) {
					    
						result[name] = [child];
					} else {
					    //
					    if(child.children){
					        if (typeof(child.children) === 'string' || child.children instanceof String)
	                            {
	                                //console.log(node.nodeName+"--"+child.children);
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
	
		/*
		 * Converts an xml document or string to a JSON object.
		 *
		 * @param xml
		 */
		function cm_tei_schema2json(xml, options) {
			var n;
	
			if (!xml) {
				return xml;
			}
	
			options = options || {};
	
			for(n in defaultOptions) {
				if(defaultOptions.hasOwnProperty(n) && options[n] === undefined) {
					options[n] = defaultOptions[n];
				}
			}
	
			if (typeof xml === 'string') {
				xml = parseXML(xml).documentElement;
			}
	
			var root = {};
			
			if (xml.attributes && xml.attributes.length === 0 && xml.childElementCount === 0){
			  root[xml.nodeName] = normalize(xml.textContent, options);
			} else {
			    
			  root[xml.nodeName] = cm_tei_schema2jsonImpl(xml, options);
			  
			}
			
	
	        root=root['#document']['cm_tei_schema'];
	                
	        var topValue=root['top'];
	        delete root['top'];
	        root=Object.assign({ "!top": [topValue] },root);
	
	
			return root;
		}
		
		function cm_tei_schema(schema){
		    var tags;
	        //Call the XML file
	        $.ajax({
	            'async': false,
	            url: schema,//defaultOptions.url,
	            dataType: 'xml',
	                success: function(response) {
	                //parse the xml schema to create a json Object according to CodeMirror style
	                tags = $.cm_tei_schema2json(response);
	            }
	        });
		    return tags;
		    
		}
	
		if (typeof jQuery !== 'undefined') {
			jQuery.extend({cm_tei_schema2json: cm_tei_schema2json});
			jQuery.extend({cm_tei_schema: cm_tei_schema});
		} else if (typeof module !== 'undefined') {
			module.exports = cm_tei_schema2json;
			module.exports = cm_tei_schema;
		} else if (typeof window !== 'undefined') {
			window.cm_tei_schema2json = cm_tei_schema2json;
			window.cm_tei_schema = cm_tei_schema;
		}
	})();
