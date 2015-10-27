({
    shouldDeps : [
        { elems : ['avatar', 'content', 'time', 'username', 'time-full', 'container'] },
        { block : 'avatar', mods : { 'size' : 'm' } },
        { block : 'i-users' },
        { block : 'dropdown', mods : { switcher : 'link', theme : 'islands', size : 'm' } },
        { block : 'moment', mods : { language : 'ru' } },
        { block : 'marked' },
        { block : 'parser', mods : { type : 'emoji' } },
        { block : 'tick' }
    ]
});
