({
    shouldDeps : [
        { block : 'current-user' },
        { block : 'image' },
        { block : 'avatar', mods : { size : 's' } },
        {
            block : 'user',
            elems : ['avatar', 'title', 'nick', 'status', 'container'],
            mods : { presence : ['active', 'away', 'local'] }
        }
    ]
});
