/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/' : 'IndexPageController.index',

    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     *  If a request to a URL doesn't match any of the custom routes above, it  *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

    // AuthController
    'get /login' : 'AuthController.login',
    'get /logout' : 'AuthController.logout',
    'get /register' : 'AuthController.register',

    'post /auth/local' : 'AuthController.callback',
    'post /auth/local/:action' : 'AuthController.callback',

    'get /auth/:provider' : 'AuthController.provider',
    'get /auth/:provider/callback' : 'AuthController.callback',
    'get /auth/:provider/:action' : 'AuthController.callback',

    // Slack
    'get  /slack/:method' : 'SlackController.api',
    'post /slack/:method' : 'SlackController.api',

    // WebRtc
    'post /webrtc/message' : 'WebrtcController.message',

    // Users
    'get /user/:id' : 'UserController.show',
    'get /user/:id/edit' : 'UserController.edit',
    'post /user/:id/update' : 'UserController.update',

    // Files
    'get /uploading' : 'FileController.upload',
    'post /uploading' : 'FileController.upload',

    // static
    'get /static/:directory/:file' : 'FileController.getStatic'
};
