modules.define(
    'parser_type_emoji',
    ['BEMHTML', 'emoji-icon__data'],
    function(provide, BEMHTML, emojiData){

        var emojiRegExp = /:(\w{2,30}):/gim;

        var createImageUrl = function(emoji){
            if(!emoji.length) {
                return '';
            }

            return BEMHTML.apply({
                block : 'image',
                width : 24,
                height : 24,
                url : 'https://cdn.jsdelivr.net/emojione/assets/png/' + emojiData[emoji].unicode + '.png',
                title : (':' + emoji + ':') || ''
            });
        };

        var detectEmoji = function(messageText){
            return messageText.replace(emojiRegExp, function(emoji, cleanEmoji){
                if(emojiData[cleanEmoji]) {
                    return createImageUrl(cleanEmoji);
                }
                return emoji;
            });
        };

        provide(function(messageText){
            if(!messageText.length) {
                return messageText;
            }

            return detectEmoji(messageText);
        });
    });
