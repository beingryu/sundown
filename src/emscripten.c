#include "markdown.h"
#include "html.h"
#include "buffer.h"

#include <string.h>
#include <stdlib.h>

char *
emscripten_markdown(char *str)
{
	struct buf *ob;
	
	struct sd_callbacks callbacks;
	struct html_renderopt options;
	struct sd_markdown *markdown;

	char *ret;

	ob = bufnew(1024);

	sdhtml_renderer(&callbacks, &options, 0);
	markdown = sd_markdown_new(MKDEXT_STRIKETHROUGH | MKDEXT_NO_INTRA_EMPHASIS | MKDEXT_TABLES | MKDEXT_FENCED_CODE | MKDEXT_AUTOLINK | MKDEXT_SPACE_HEADERS | MKDEXT_SUPERSCRIPT | MKDEXT_SUBSCRIPT , 16, &callbacks, &options);

	sd_markdown_render(ob, (uint8_t *)str, strlen(str), markdown);
	sd_markdown_free(markdown);

	ret = (char *)calloc(ob->size + 1, sizeof(char));
	memcpy(ret, ob->data, ob->size);

	bufrelease(ob);

	return ret;
}
