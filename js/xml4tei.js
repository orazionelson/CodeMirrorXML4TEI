(function($) {
    $.fn.xml4tei = function(options) {
       
       var defaults = {			
			buttonsPanel : true,
			examplesBtn : true,
			validatorBtn : true,
			helpBtn : true,
			
            helpLangs: ['it','en'],
			helpJsondriver : "proxy",
			helpProxy : "https://cors-anywhere.herokuapp.com/",
        
			loadExamples: false
        };
        
        var settings = $.extend({}, defaults, options);
        
        if (this.length > 1) {
            this.each(function() { $(this).pluginName(options) });
            return this;
        }
		
		var names=[];
		var econtainer = '#editors-container';
		
		
		$(".tei-editor").each(function(){
			var id=$(this).attr('id');
			names.push(id);
		});
		
		// private variables
		var editors=[];
        
        // private methods
        // Manage line numbers between the two editor panels
        var completeAfter=function(cm, pred) {
			var cur = cm.getCursor();
			if (!pred || pred()) setTimeout(function() {
			  if (!cm.state.completionActive)
				cm.showHint({completeSingle: false});
			}, 100);
			return CodeMirror.Pass;
		}
		
		var completeIfAfterLt=function(cm) {
			return completeAfter(cm, function() {
			  var cur = cm.getCursor();
			  return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
			});
		}
		
		var completeIfInTag=function(cm) {
			return completeAfter(cm, function() {
			  var tok = cm.getTokenAt(cm.getCursor());
			  if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
			  var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
			  return inner.tagName;
			});
		}

        
        
		var manageLines=function(editors){
			var hlines=editors[0].lineCount();
			var hhlines=hlines+1;
			editors[1].setOption('firstLineNumber', hhlines);
			
			editors[0].on('change', function(){
				var lc=editors[0].lineCount();
				var llc=lc+1;
				editors[1].setOption('firstLineNumber', llc);
				});
			
			}
	   
	   var examples=function(names){
		   $('#buttons-panel').prepend('<button class="btn btn-default examples" title="Load Examples"><span class="glyphicon glyphicon-list-alt"/></button>');
		   var query = /<ref.*?\/>/gm;
			$('.examples').on('click',function(e){
				for(x = 0; x < names.length; x++) {
				var example=getExample(names[x]);
				
				var example=prettifyXml(example);
				getCodeMirrorNative('#'+names[x]).setValue(example);
				//getCodeMirrorNative('#'+names[x]).refresh();
				
				}
				var ed= getCodeMirrorNative('#text');

				$.fn.noteMarker(ed,query);
				
			});
		}
		   
		var getExample=function(name){
		//var textArea = 	document.getElementById('#'+name);
		//var editor = CodeMirror.fromTextArea(textArea);
		
		var resp=$.ajax({
				'async': false,
				cache: false,
				url: "teiresources/"+name+"_example.xml",
				dataType: 'xml',
				success: function(response) {
					//console.log(response);
					return response;
					}
				});
		
		
		return resp.responseText;

		}
		
		//Found on
		//https://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
		var prettifyXml = function(sourceXml)
		{
		    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
		    var xsltDoc = new DOMParser().parseFromString([
		        // describes how we want to modify the XML - indent everything
		        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
		        '  <xsl:strip-space elements="*"/>',
		        '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
		        '    <xsl:value-of select="normalize-space(.)"/>',
		        '  </xsl:template>',
		        '  <xsl:template match="node()|@*">',
		        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
		        '  </xsl:template>',
		        '  <xsl:output indent="yes"/>',
		        '</xsl:stylesheet>',
		    ].join('\n'), 'application/xml');
		
		    var xsltProcessor = new XSLTProcessor();    
		    xsltProcessor.importStylesheet(xsltDoc);
		    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
		    var resultXml = new XMLSerializer().serializeToString(resultDoc);
		    return resultXml;
		};   

	        
       var trigger=function(){
		$('.tei-editor').each(function(index, myeditor) {
		    var xmlschema=$(this).data('xmlschema');
		    var ed_id=$(this).attr('id');
			var editor = CodeMirror.fromTextArea(myeditor, {
			    mode: "xml",
			    styleActiveLine: true,
				lineNumbers: true,
				lineWrapping: true,
				foldGutter: true,
				matchTags: {bothTags: true},
				styleSelectedText: true,
			    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
				extraKeys: {
					"'<'": completeAfter,
					"'/'": completeIfAfterLt,
					"' '": completeIfInTag,
					"'='": completeIfInTag,
					"Ctrl-Space": "autocomplete",
					"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); },
					"Ctrl-M": "toMatchingTag",
				},

				hintOptions: {
						schemaInfo : $.fn.getCmJson(xmlschema),
							}    
			});
	
			if(settings.loadExamples){
				var xml = $.ajax({
					'async': false,
					cache: false,
					url: "teiresources/"+ed_id+"_example.xml",
					dataType: 'xml',
					success: function(response) {
					return response;
					}
				});

				if(xml.responseText){
					var xmlText=prettifyXml(xml.responseText);		
					editor.setValue(xmlText);
				}
			}
			
			    //Trigger with bootstrap tab change
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        setTimeout(function() {
            editor.refresh();
        }, 1);

    });
			
			
			editors.push(editor);
			});	


			//Text Maker on note <ref.../>
			var last_editor = editors[editors.length - 1];
			//Parse notes reference and add links in target attribute
			$.fn.xml4teiNte({'editor':last_editor});
					
		manageLines(editors);
			   
		}
		
		
		this.getCmJson=function(schema){
			
		    var tags;
		    //Call the XML file
	        $.ajax({
	            'async': false,
	            url: schema,
	            cache: false,
	            dataType: 'xml',
	            success: function(response) {
					//console.log(response);	
	                //parse the xml schema to create a json Object according to CodeMirror style
	                tags = $.fn.xml4teiSchema2json({xml:response})
	            }
	        });
	        
		    return tags;
		    
		}
		
		// Retrieve a CodeMirror Instance via native JavaScript.
		// https://jsfiddle.net/MrPolywhirl/3phdkg66/
		var getCodeMirrorNative = function(target) {
		    var _target = target;
		    if (typeof _target === 'string') {
		        _target = document.querySelector(_target);
		    }
		    if (_target === null || !_target.tagName === undefined) {
		        throw new Error('Element does not reference a CodeMirror instance.');
		    }
		    
		    if (_target.className.indexOf('CodeMirror') > -1) {
				
		        return _target.CodeMirror;
		    }
		
		    if (_target.tagName === 'TEXTAREA') {
		        return _target.nextSibling.CodeMirror;
		    }
		    
		    return null;
		};
		

		
		/*Validator*/
		var validator=function(){
		$(".validate").on('click', function(e){
			e.preventDefault();

		//Build the document
			var doc=[];
			$(".tei-editor").each(function(index, myeditor){
				var val=getCodeMirrorNative(this).getValue();
				doc.push(val)
			 });
			 
			var txtdoc=doc.join("\n");
		
			var tei='<TEI xmlns="http://www.tei-c.org/ns/1.0">\n'+txtdoc+'\n</TEI>';	
	    //console.log(tei);
       
        //Load validator.php with ajax
	        $.ajax({
				type: "POST",
				//async: true,
				cache: false,
	            url: 'validator.php',
	            data:   'xml=' + encodeURIComponent(tei),
				dataType:   'json',
				//contentType: "application/x-www-form-urlencoded; charset=UTF-8", 
				
				beforeSend: function() {
					$(".loader").show(); 
					$("#validation_response").empty();
				},
	            success: function(response) {
					$(".loader").hide();
					//console.log('success:');
					//console.log(response);
					var badge='';
					if(response.errors){
							
							badge='<span class="badge">'+response.errors[0].length+'</span>';	
							//$(panel).find('.validation-panel-heading').append(badge);
						}
							console.log(panel);
					var nh=$('nav.navbar').height();
					
					var panel='<div class="panel panel-'+response.panel+'" style="position:absolute; top:'+nh+'; right:0;width:50%; z-index:1035" id="validation-panel">'+
						'<div data-toggle="collapse" data-target="#response" class="panel-heading validation-panel-heading">Validation '+badge+'<button type="button" class="close" data-target="#validation-panel" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></div>'+
						'<div class="panel-body collapse" id="response"><p class="lead text-center">'+response.msg+'</p>';
					
					
						
						if(response.panel=='danger'){
							
							
							
						var i = 0;
						
						panel+='<table class="table table-striped">';
						panel+='<tr>';
						panel += '<td>Level</td>';
						panel += '<td>Code</td>';
						panel += '<td>Line</td>';
						panel += '<td>Message</td>';
						panel+='</tr>';
						while (resp=response.errors[0][i]) {
							//console.log(resp);
							
							var line=resp.line;
							if(resp.line!=0){
								line=resp.line-1;
							}
							//console.log(line);
							var matches = resp.message.match(/line\s(\d*)/g);

							if(matches){
								var dig = matches[0].replace("line ","");
								if(dig!=0){
									dig=dig-1;
								}	
								//console.log(dig);
								resp.message=resp.message.replace(/line\s(\d*)/g, "<b>line: "+dig+"</b>");
							}
							
						panel+='<tr>';
						panel += '<td>'+resp.level+'</td>';
						panel += '<td>'+resp.code+'</td>';
						panel += '<td>'+line+'</td>';
						panel += '<td>'+resp.message+'</td>';
						panel+='</tr>';

							//
							//
						//var error=response.errors[i].replace(/\(Line:(\d*)\)/g, "<b>(Line: "+dig-1+")</b>");	
						  //panel += '<li>'+error+ "</li>";
						  i++;
						}
						panel+='</table>';
						}
						
						
						panel+='</div></div>';
						
						$("#validation_response").append(panel); 
						
						
					
					
				},
				error: function(xhr) { 
					console.log("Error occured.please try again");
					console.log(xhr.statusText + xhr.responseText);
					$(".loader").hide();
					$("#validation_response").append(xhr.responseText);
					//$(placeholder).removeClass('loading');
					
					}	
	        });
		});
	}
       	
        // Initialize all
        this.initialize = function() {
			
			if(settings.buttonsPanel){
				
				$(".buttons-nav").prepend('<div id="buttons-panel" class="btn-group"></div>');
				
				
				//console.log(settings.php);
				if(settings.validatorBtn){
					var nh=$('nav.navbar').height();
					$('#buttons-panel').prepend('<button class="btn btn-default validate" title="Validate"><span class="glyphicon glyphicon-ok"></button>');
					
					$(econtainer).prepend('<div class="loader panel panel-warning" style="display:none; position:absolute; top:'+nh+'; right:0;width:30%; z-index:1035"><div class="panel-heading">Validation <img  src="images/loader.gif" style="width:24px;" /></div></div><div id="validation_response"></div>');
		
					validator();
					}
				else{
					$('#buttons-panel').prepend('<button disabled="disabled" title="Validation needs php working on server" class="btn btn-primary validate"><span class="glyphicon glyphicon-ok"></button>');
					}	
				
				if(settings.examplesBtn){					
					examples(names);
					}	
				

				//Call the help
				if(settings.helpBtn){
					$.fn.xml4teiHelp({
						container : ".buttons-nav",
						langs: settings.helpLangs,
						jsondriver : settings.helpJsondriver,
						proxy : settings.helpProxy
					});		
				}
				
				
				$('#buttons-panel').append('<a class="btn btn-default" style="margin-left:40px" data-toggle="tab" href="#teiHeaderTab">teiHeader</a>');
				$('#buttons-panel').append('<a class="btn btn-default" data-toggle="tab" href="#textTab">text</a>');
				
			}
	

	
			trigger();

			var nh=$('nav.navbar').height();
			var d=nh+$('footer').height();
			var eh=$(window).height()-d-10;
			$('.CodeMirror').height(eh);
			$('#editors-container').css('margin-top',nh);	
			
            return this;
        };
        
        this.initialize()
        
        return this;
    }
})(jQuery);
