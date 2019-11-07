(function($) {
    $.fn.xml4teiHelp = function(options) {
        var defaults = {
			container : '.buttons-nav',
            langs: ['it','en'],
			jsondriver : "proxy",
			proxy : "https://cors-anywhere.herokuapp.com/"
        };
        var settings = $.extend({}, defaults, options);
        if (this.length > 1) {
            this.each(function() { $(this).pluginName(options) });
            return this;
        }
		
		
		// private variables
        var tags;
		var jsonsource="http://www.tei-c.org/release/xml/tei/odd/p5subset.json";

		var docUrl="http://www.tei-c.org/release/doc/tei-p5-doc/";
        // private methods
        
        //Get an array of n objects with tags
		//by each schema nested with class .tei-editor
        var getTags=function(){
			var tags=[];

			$('.tei-editor').each(function(){
		
				var xmlschema=$(this).data('xmlschema');
				tags.push($.fn.getCmJson(xmlschema));
	
			});

			return tags;
			
		}	
		//Parse the tags object 
		var getSchemaTags=function(tags){
			var ob0=tags[0];
			var ob1=tags[1];
			//Mege tags objects
			var schemaTags = Object.assign( {}, ob0, ob1 );
			return schemaTags;
		}
		//Get a raw object of tags
		var getRawTags=function(tags){
			var schemaTags=getSchemaTags(tags)
		
			var rawTags=Object.keys(schemaTags);
				rawTags.shift();
				rawTags = rawTags.filter(item => item !== 'attrs');
	
			return rawTags;	 	
		}
		//Parse the tags object 
		//in a json string
		var getJsonTags=function(tags){
			
			var schemaTags=getSchemaTags(tags)
				
			//this clones the tag object 
			var newTags = JSON.parse(JSON.stringify(schemaTags));
			delete newTags['!top'];
			
			return newTags;	 	
		}		
		//Get tag allwed children
		var allowedChildren=function(tag){
		    var tgchildren='';
			if(tag.children.length){
			var tgchildren='<p><strong>Allowed children</strong></p>';
			tgchildren+='<ul>'
			$.each(tag.children, function(key, value) {		
				tgchildren+='<li>'+value+'</li>';//key+": "
			});
			tgchildren+='</ul>';
			}
			return tgchildren;		
		}
		//Get tag allwed attributes
		var allowedAttributes=function(tag){
			var tgattrs='';
		    if(!($.isEmptyObject(tag.attrs))){
				var tgattrs='<p><strong>Allowed attributes</strong></p>';
		        $.each(tag.attrs, function(key, value) {
		            var val='';
		            val+='<ul>'
					$.each(value,function (ky,va){
					if(va.length==0){
						val+='<li><i>freetext</i></li>';
						}
					else{
						val+='<li>'+va+'</li>';
						}
					});
					val+='</ul>';            
		            tgattrs+='<span class="text-danger"><strong>'+key+'</strong></span>: '+val+'<br/>';
		        });
				}
			return tgattrs;	
			}		
		//Build setup for description driver
		var driverSetup=function(){
			var setup={};

		if(settings.jsondriver == "proxy"){
			var setup={
			    url: settings.proxy+jsonsource, 
			    type: "GET",
			    'cache': false,
			    "async": true,
			    dataType: 'json',
			    headers: {
		        'X-Requested-With': 'XMLHttpRequest',
		        'Content-Type':'application/json'
				}
				};
			
			}
		else if(settings.jsondriver == "local"){
			var setup={
			    url: "teiresources/p5subset.json",
			    type: "GET",
			    'cache': false,
			    "async": true,
			    dataType: 'json',
				};
			}
		return setup;
		}
		//Get the description: from local or remote
		var	getDesc=function(){
		$('.get-desc').on('click',function(e){
			var setup=driverSetup();
		    e.preventDefault();
		    var desklink=$(this);
		    var target = $(this).data(target);
		    var ident = $(this).data(ident);
		    //console.log(ident.ident);
		    
		    $.ajax(
				setup
			)
			    .done(function(result) {
					
					var data=result.elements;
					//console.log(result);	
					$.each(data, function(i,item){
		
					if(item.ident==ident.ident){
		            //console.log(item.ident);
						$('#'+target.target).find('.desc-content').empty().append(item.desc);
						$('#'+target.target).show();
		            }  
		        });
			})
			    .fail(function(jqXHR, textStatus, errorThrown) {
			        console.log(textStatus);
			        console.log(jqXHR);
			        console.log(errorThrown);
				})    
			});		
		}
		//Build tag panels		
		var makePanels=function(){
			var langs=settings.langs;
			var tags=getTags();
			var langsLink=[];
			var elements = $();
			var rawTags = getRawTags(tags);
			var newTags = getJsonTags(tags);
			for(x = 0; x < rawTags.length; x++) {
				var tg=newTags[rawTags[x]];
				
				var tgattrs=allowedAttributes(tg);
				var tgchildren=allowedChildren(tg);
		
				for(i = 0; i < langs.length; i++) {
					langUrl = docUrl+langs[i]+'/html/ref-'+rawTags[x]+'.html';
					langsLink.push('<a href="'+langUrl+'" target="_blank">'+langs[i]+'</a>');
				}
		
				var panel_heading='<div class="panel-heading"><span class="lead text-primary"><strong>'+rawTags[x]+'</strong></span> <a href="#" data-target="'+rawTags[x]+'-desc" class="get-desc" data-ident="'+rawTags[x]+'">: <strong>TEI DESCRIPTION</strong></a></div>';
			    	    
			    var panel_body='<div class="panel-body"><div id="'+rawTags[x]+'-desc" style="display:none" class="desc well"><p class="lead desc-content"></p>(More info: '+langsLink.join(', ')+')</div><div class="row"><div class="col-md-6">'+tgattrs+'</div><div class="col-md-6">'+tgchildren+'</div></div>';
			
			    elements = elements.add('<div class="panel panel-default tags-panel" id="'+rawTags[x]+'-panel" data-ident="'+rawTags[x]+'">'+panel_heading+panel_body+'</div>');		
				
				$('#allowed-tags').append('<a href="#" class="link-tag">'+rawTags[x]+'</a> - ');
				langsLink=[];
			}	
			
			$('#tei-help').append(elements); 
			
			$('#search-tag').on("keyup",function(){
			    $('.tags-panel').hide();
			    var txt = $('#search-tag').val();
			    $('.tags-panel').each(function(){
			       if($(this).data('ident').indexOf(txt) != -1){
			           $(this).show();
			       }
			    });
			});
			
			$('.link-tag').on("click",function(e){
			    e.preventDefault();
			    $('.tags-panel').hide();
			    var txt = $(this).text();
			    $('.tags-panel').each(function(){
			       if($(this).data('ident').indexOf(txt) != -1){
			           $(this).show();
			       }
			    });
			});
			
			}

        // Initialize all
        this.initialize = function() {
			
			$('body').append('<!--Help Panel-->'+
			'<div id="help_panel" class="panel panel-primary" role="document" style="display:none; position: fixed; top: 0; right: 0;  z-index: 10040; height:450px; width:600px;">'+
				'<div class="panel-heading">'+
					'<div class="row">'+
						'<div class="col-sm-5">'+
							'<input id="search-tag" class="form-control" type="text" placeholder="Search tag"/>'+
						'</div>'+
						'<button type="button" style="margin-right:5px" class="btn btn-danger btn-sm open-help pull-right">'+
							'<span class="glyphicon glyphicon-off" aria-hidden="true"/>'+
						'</button>'+
					'</div>'+
				'</div>'+
				'<div class="panel-body" style="position:absolute;width:100%;height:380px;overflow: auto; overflow-y: auto;">'+
					'<div id="allowed-tags" />'+
					'<div id="tei-help"/>'+
				'</div><!-- /.panel-body -->'+
			'<!-- /#help_panel -->'+ 
			'</div>'); 

			$(settings.container).find("#buttons-panel").append('<button class="open-help btn btn-default" title="Help"><span class="glyphicon glyphicon-question-sign"></button>');

			$('.open-help').on("click",function(e){
		     e.preventDefault();
		     $('#help_panel').toggle();
		     //$('#allowed-tags').toggle();
			});
		
			$( document ).on( 'keydown', function ( e ) {
				if ( e.keyCode === 27 ) { // ESC
		        $( "#help_panel" ).hide();
				}
			});

			makePanels();
			getDesc();
			
            return this;
        };
        
        return this.initialize();
    }
})(jQuery);
