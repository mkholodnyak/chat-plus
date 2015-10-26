({
    mustDeps: [],
    shouldDeps : [
        { block : 'current-user' },
        {
            elems : ['menu', 'current-user', 'title']
        },
        {
            block : 'logo',
            mods : { theme : 'light'}
        },
        {
            block: 'notify'
        }
    ]
});
