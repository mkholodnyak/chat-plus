({
    mustDeps : [
        { block : 'i-chat-api' },
        { block : 'chat-input' },
        { block : 'textarea', mods : { theme : 'islands', size : 'm', focused : true, name : 'msg', disabled : true } },
        { block : 'button', mods : { theme : 'islands', view : 'plain' } },
        { block : 'i-chat-api' },
        { block : 'chat-input', elem : 'emoji-button' },
        { block : 'menu', mods : { theme : 'islands', size : 'm' }, },
        { block : 'menu-item' },
        { block : 'textcomplete' },
        {
            block : 'popup',
            mods : {
                theme : 'islands',
                target : 'anchor',
                directions : ['bottom-left'],
                direction : 'left-center',
                autoclosable : true,
                visible : false
            }
        }
    ],
    shouldDeps : []
});
