modules.define(
    'parser__system-message',
    ['i-users'],
    function(provide, Users){

        var regexp = {
            system : /<@(.*)\|(.*)>/g,
            pm : /<@(.*)>/g
        };

        var parseSystemMessage = function(message){

            var matchSystem = regexp.system.exec(message);
            var matchPm = regexp.pm.exec(message);

            if(matchSystem) {
                message = '@' + matchSystem[2] + message.replace(regexp.system, '');
            } else if(matchPm) {
                message = '@' + Users.getUser(matchPm[1]).name + message.replace(regexp.pm, '');
            }

            return message;
        };

        provide(function(messageText){
            return parseSystemMessage(messageText);
        });
    });


