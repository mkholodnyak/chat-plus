/**
 * SlackController
 *
 * @description :: Server-side logic for managing slacks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * `SlackController.api()`
     */
    api : function(req, res){
        var options = req.method === 'POST'? req.body : req.query;
        var data = {};

        var slackInstance = sails.slackInstances[req.user.id];

        function respond(data){
            sails.sockets.blast(req.params.method, data);
            res.json(data);
        }

        if(slackInstance && slackInstance.api) {
            slackInstance.api(req.params.method, options, function(error, response){
                data = { error : error, data : response };
                respond(data);
            });
        } else {
            data.error = 'Slack service was\'t properly inited. Can\'t perform request.';
            console.log('Slack controller error: ', data.error);
            respond(data);
        }

    }
};
