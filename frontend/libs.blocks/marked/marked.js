modules.define(
    'marked',
    ['loader_type_js', 'BEMHTML'],
    function(provide, loader, BEMHTML){

        loader(
            'https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.5/marked.min.js',
            function(){

                marked.setOptions({
                    renderer : _setupRenderer(),
                    gfm : true,
                    tables : true,
                    breaks : false,
                    pedantic : false,
                    sanitize : true,
                    smartLists : true,
                    smartypants : false
                });

                provide(marked);

                function _setupRenderer(){
                    var renderer = new marked.Renderer();

                    renderer.link = function(href, title, text){
                        var extension = href.split('.').pop();
                        if(['jpg', 'jpeg', 'png', 'bmp', 'gif'].indexOf(extension) > -1) {
                            return BEMHTML.apply({
                                block : 'image',
                                attrs: {
                                  onerror: 'this.src="static/images/ghost.png"'
                                },
                                mix : { block : 'message', elem : 'container' },
                                url : href,
                                title : title || text || ''
                            });
                        }

                        if(this.options.sanitize) {
                            try {
                                var prot = decodeURIComponent(unescape(href))
                                    .replace(/[^\w:]/g, '')
                                    .toLowerCase();
                            } catch(e) {
                                return '';
                            }
                            if(prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
                                return '';
                            }
                        }
                        var out = '<a href="' + href + '"';
                        if(title) {
                            out += ' title="' + title + '"';
                        }
                        out += '>' + text + '</a>';
                        return out;
                    };

                    return renderer;
                }
            });


    }
);
