modules.define(
    'moment_language_ru',
    ['loader_type_js', 'moment'],
    function(provide, loader, moment){

        loader(
            'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/locale/ru.js',
            function(){
                provide(moment);
            });
    }
);
