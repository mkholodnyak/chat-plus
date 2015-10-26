/**
 * IndexPageController
 *
 * @description :: Server-side logic for managing indexpages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    /**
     * `IndexPageController.index()`
     */
    index : function(req, res){
        if(!req.user) {
            return res.render({
                data : {
                    title : 'Shriming chat',
                    user : req.session.User || null
                }
            });
        }

        Passport.findOne({
            identifier : req.user.id
        }, function(err, passport){
            if(err) {
                console.log(err);
            }

            if(!passport) {
                console.warn('No passport exist for current user');
            }

            if(!passport.tokens || !passport.tokens.accessToken) {
                console.warn('No token or accessToken exist for current user');
            }
            res.render({
                data : {
                    title : 'Shriming chat',
                    token : passport.tokens.accessToken || '',
                    user : req.session.User || null
                }
            });
        });
    }
};
