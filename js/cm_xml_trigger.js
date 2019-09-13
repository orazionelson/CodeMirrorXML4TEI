CodeMirror.fromTextArea(document.getElementById("code"), {
	mode: "xml",
	lineNumbers: true,
	extraKeys: {
		"'<'": completeAfter,
		"'/'": completeIfAfterLt,
		"' '": completeIfInTag,
		"'='": completeIfInTag,
		"Ctrl-Space": "autocomplete"
	},
	hintOptions: {schemaInfo: $.cm_tei_schema('cm-tei-schema.xml')}
});
