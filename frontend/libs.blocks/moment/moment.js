modules.define(
    'moment',
    ['loader_type_js'],
    function(provide, loader){

        loader(
            'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js',
            function(){
                provide(moment);
            });
    }
);
