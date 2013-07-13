
var markdown = Module.cwrap('emscripten_markdown', 'number', ['number']);
var malloc = Module.cwrap('malloc', 'number', ['number']);
var free = Module.cwrap('free', 'number', ['number']);
var strlen = Module.cwrap('strlen', 'number', ['number']);

var link_regex = /\[\[(([^|\]]+)\|)?(([^:\]]+):)?([^\]]+)\]\]/g;

var escape_as_html = function(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

window.markdown = function(str) {
	str = str.replace(link_regex, function(match, ignore1, display, ignore2, namespace, title) {
		if (!title)
			return match;
		if (!namespace)
			return '<a href="/wiki/read/' + title.replace(/\s+/g, '_') + '">' + escape_as_html(display || title) + '</a>';
		if (namespace == 'problem')
			return '<a class="problem" href="/judge/problem/read/' + title + '">' + escape_as_html(display || title) + '</a>';
		return match;
	});

	var spoiler_open, spoiler_close;
	for (;;)
	{
		spoiler_open = '@@' + Math.random().toString(36).substring(2, 8) + '@@';
		if (str.indexOf(spoiler_open) == -1)
		{
			str = str.replace(/\<spoiler\>/g, spoiler_open);
			break;
		}
	}
	for (;;)
	{
		spoiler_close = '@@' + Math.random().toString(36).substring(2, 8) + '@@';
		if (spoiler_close != spoiler_open && str.indexOf(spoiler_close) == -1)
		{
			str = str.replace(/\<\/spoiler\>/g, spoiler_close);
			break;
		}
	}

	var utf8ed = Utf8.encode(str);
	var src_len = utf8ed.length;
	var src_ptr = malloc(src_len + 1);
	var i = 0;
	while (i < src_len)
	{
		HEAP8[src_ptr + i] = utf8ed.charCodeAt(i);
		i += 1;
	}
	HEAP8[src_ptr + src_len] = 0;

	var result_ptr = markdown(src_ptr);
	free(src_ptr);

	var length = strlen(result_ptr);
	var result = '';
	var MAX_CHUNK = 1024;
	var ptr = result_ptr;
	while (length > 0)
	{
		curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
		result = result ? result + curr : curr;
		ptr += MAX_CHUNK;
		length -= MAX_CHUNK;
	}
	free(result_ptr);

	return Utf8.decode(result).replace(new RegExp(spoiler_open, 'g'), '<div class="spoiler">').replace(new RegExp(spoiler_close, 'g'), '</div>');
};

})();
