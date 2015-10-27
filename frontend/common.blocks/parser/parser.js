modules.define(
    'parser',
    ['parser__emoji', 'parser__system-message', 'marked'],
    function(provide, emojiParser, systemMessageParser, markdownParser){

        provide(function(messageText){
            if(!messageText.length) {
                return messageText;
            }
            // Смахивает на паттерн Декоратор :)
            return emojiParser(markdownParser(systemMessageParser(messageText)));
        });
    });
