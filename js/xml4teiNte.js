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
		$.fn.xml4teiNte = function(options) {

		//var defaultOptions = {};
		
		var editor=options.editor;
		
		var query = /<ref.*?\/>/gm;

		this.noteMarker=function(cmInstance,query){
			cmInstance.refresh();
			var cursor = cmInstance.getSearchCursor(query, CodeMirror.Pos(cmInstance.firstLine(), 0), {caseFold: true, multiline: true})

			while (cmatch = cursor.findNext()) {
			//console.log(cursor.from());
			var mk = cmInstance.markText(
						cursor.from(),
						cursor.to(),
						{ 
						atomic: true,
						}
					);
			
			//console.log(cursor.to());
			noteLinkMaker(cmInstance, cursor.from(),cursor.to())		

				};
			
			}

		
		// private methods
		var createLink=function(target){
			var a = document.createElement("a"); 
			//a.className = "btn btn-primary btn-sm btn-note";
			a.className = "btn-note";
			a.setAttribute("href", '#');
			a.setAttribute("data-xmlid", target);
			a.setAttribute("data-toggle", 'modal');
			a.setAttribute("data-target", '#notes_panel');
			a.innerHTML=target;
			//data-toggle="modal" data-target="#myModal"
			//button.setAttribute("data-note-type", 'integer')
			
			return a;
		
		}


	var noteLinkMaker=function(cmInstance,from,to,ref){
			cmInstance.refresh();
			//
			if(ref==null){
			ref= cmInstance.getRange(from, to);
			
			}

			var target=$(ref).attr('target'); 
			
			var start='<ref target="';
			var start=start.length;
			 
			var a=createLink(target)
			//cursor.from()
			
			
			start = from.ch+start;
			end = start+target.length;
			
			from.ch = start;
			to.ch = end;

				
				var mkt = cmInstance.markText(
						from,
						to,
						{ 
						//atomic: true,
						//readOnly:true,
						//handleMouseEvents: true,
						replacedWith: a
						}
					);		
		}		
		


	 this.initialize = function() {
		
		//Make button to add notes before the textarea with class .nte 
		var nteId=$('.nte').attr('id');
		var nh=$('nav.navbar').height();
		//$('.nte').before('<button data-target="'+nteId+'" class="btn btn-primary add-note">Note</button>');
		$('#functions-panel').append('<button data-target="'+nteId+'" class="btn btn-success btn-block add-note" title="Add note"><span class="glyphicon glyphicon-comment"/></button>');
		 
		 //Make notes panel
		 $('body').append(
		 '<div id="notes_panel" class="modal fade" role="dialog">'+
			'<div class="panel panel-primary pull-right" role="document" style="width:50%;margin-top: '+nh+'px;">'+
				'<div class="panel-heading">'+

					'<span class="text-center">Note</span>'+
					'<button type="button" style="margin-right:5px" class="btn btn-danger btn-sm pull-right" data-dismiss="modal" title="Close window">'+
						'<span class="glyphicon glyphicon-off" aria-hidden="true"/>'+
					'</button>'+
				'</div>'+
				'<div class="panel-body">'+
				'</div>'+
				'<div class="panel-footer">'+
				'</div>'+
			'</div>'+
		'</div>'
		 );
		 
		//Prevent notes duplication	
		editor.on("beforeChange", function(editor, e) {
			var ref=e.text[0];
			if (e.origin == 'paste' && ref.startsWith("<ref target=")) {
				var searchRef = editor.getSearchCursor(ref, CodeMirror.Pos(editor.firstLine(), 0), {caseFold: true, multiline: true});
				if(searchRef.find()){
					console.log("You can't duplicate notes reference");
					e.cancel();
					alert("You can't duplicate notes reference");
				}	
			}
		})	
		
		//Paste or drag&drop notes reference with link
		editor.on("change", function (myeditor, e) {
			var ref=e.text[0];
			if (e.origin == 'paste' && ref.startsWith("<ref target=")) {
				var searchRef = myeditor.getSearchCursor(ref, CodeMirror.Pos(myeditor.firstLine(), 0), {caseFold: true, multiline: true});
				if(searchRef.find()){
					var target = $(ref).attr('target');
					editor.refresh();
					var findTarget = editor.getSearchCursor(target, CodeMirror.Pos(editor.firstLine(), 0), {caseFold: true, multiline: true});
					var a=createLink(target);
					//Mark the target value as an anchor
					while (cmatch = findTarget.find()) {
						var tg = editor.markText(
							findTarget.from(),
							findTarget.to(),
							{ 
							replacedWith: a
							}
						);
					}
					//Mark as atomic the pasted reference
					var mk = editor.markText(
						searchRef.from(),
						searchRef.to(),
						{ 
						atomic: true,
						}
					);	
				}
			}
		});	
					
		 
		 
		 //Events on show and hide note modal window
		 $('.modal').on('show.bs.modal', function(e){
			$('#notes_panel').find('.CodeMirror-code').html(''); 
				
			//Create delete button
			$('#notes_panel').find('.panel-footer').append('<div><button type="button" style="margin-right:5px" class="btn btn-warning btn-sm delete-note" title="Delete note" data-dismiss="modal">'+
					'<span class="glyphicon glyphicon-trash" aria-hidden="true"/>'+
				'</button></div>');
			
			//Fill panel-body with textarea
			$('#notes_panel').find('.panel-body').append('<textarea id="notes" name="notes" class="notes" cols="10"><!-- write notes below --></textarea>'); 
			
			//Trigger Codemirror on the note taxtarea
			var notes = document.getElementById("notes");  
			var ed_notes = CodeMirror.fromTextArea(notes, {
				mode: "xml",
				styleActiveLine: true,
				lineNumbers: false,
				lineWrapping: true,
				foldGutter: true,
				matchTags: {bothTags: true},
				styleSelectedText: true,
				autoRefresh: true,
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
				});
					
			
			//Mirrorize note in model window
			var xmlId = $(e.relatedTarget).data('xmlid');
			//var xmlId=$(this).attr("data-xmlid");
			var xmlId=xmlId.replace("#",'');
			var queryNte = '<note xml:id="'+xmlId+'".*?>([\\s\\S]*?)<\/note>';
			var queryNte = new RegExp(queryNte);
			var cursorNte = editor.getSearchCursor(queryNte, CodeMirror.Pos(editor.firstLine(), 0), {caseFold: true, multiline: true});
			while (cmatch = cursorNte.findNext()) {
				var from = cursorNte.from().line;
				var to = cursorNte.to().line+1;
				var note = editor.linkedDoc({from:from, to:to, sharedHist: true});
				ed_notes.swapDoc(note);
				}
			
			//Delete note action
			$('body').find(".delete-note").on('click', function(e){
				e.preventDefault();

				if (confirm('Are you sure you want to delete this note?')) {
					//Remove note
					editor.replaceRange("", CodeMirror.Pos(from, 0), CodeMirror.Pos(to, 0))
					
					//Remove ref
					var refNte = '<ref target="#'+xmlId+'".*?/>';

					var refNte = new RegExp(refNte,"gm");
					var refCursorNte = editor.getSearchCursor(refNte, CodeMirror.Pos(editor.firstLine(), 0), {caseFold: true, multiline: true});

					while (crmatch = refCursorNte.findNext()) {
						var refFromLine = refCursorNte.from().line;
						var refFromCh = refCursorNte.from().ch;
						var refToLine = refCursorNte.to().line;
						var refToCh = refCursorNte.to().ch;

						editor.replaceRange("", CodeMirror.Pos(refFromLine, refFromCh), CodeMirror.Pos(refToLine, refToCh));
					}
				
				//Close modal window:
				//done by data-dismiss in the button
				
				} else {
					// Do nothing!
				}
				
				});	
				//End of delet node action
				
				
			}).on('hide.bs.modal', function(){
				//Remove all dynamic
				$('#notes_panel').find('.panel-body').html(''); 
				$('.delete-note').remove();	 
			});
		 
		 //Add a note
	 	$('.add-note').on('click', function(e){
			e.preventDefault();
			var id = '#' + Math.random().toString(36).substr(2, 9);
			
			var target = $(this).data('target');
			
			//var cmInstance = getCodeMirrorNative('#'+target)
			var cursor = editor.getCursor();
			
			var  ref = '<ref target="'+id+'" type="integer"/>';
			editor.replaceRange(ref, cursor);
			
			$.fn.noteMarker(editor, ref);				
			
			var queryx = /<note.*?>([\s\S]*?)<\/note>/gm;	

			var cursorx = editor.getSearchCursor(queryx, CodeMirror.Pos(editor.firstLine(), 0), {caseFold: true, multiline: true})
			
			var  notelines=[];
			while (cmatch = cursorx.findNext()) {	
					
					notelines.push(cursorx.to().line);
					
				}
			
			var newline = notelines[notelines.length-1];
			//console.log(newline);	
			var xmlid = id.replace("#", '')
			//editor.replaceRange("\n", { line: newline });
			var  note =  '\n<note xml:id="'+xmlid+'" type="integer">\n\n</note>';
			editor.replaceRange(note, { line: newline });					
			
			editor.refresh();	
			});	
			
			
		 
			this.noteMarker(editor, query);
		 
		 
		 return this;
		 }
	
	return this.initialize();	
}
})(jQuery);
