/**
 * Created by liyan on 17/1/1.
 */
/**
 * app.get(path, callback [, callback ...])
 * http get请求指定路径的回调函数，你可以提供多个回调方法就像中间件那样，除了不能用next方法
 * 你可以使用这种机制给一个路由强加上先决条件，然后没有匹配上的话再控制后来的路由
 *
 * app.use([path,] function [, function...])
 * 在path路径上加载中间件，如果path未指定，则默认指向路径'/'
 * 当一个路径后面跟着'/'时，路由会匹配后面的任何路径，比如，app.use('/signin',...)，路由会匹配'/signin/a','/signin/b'等等
 * 既然路径默认指向'/'，如果不指定路径的时候，任何请求都会加载该中间件，如app.use(function(){})会处理任何请求
 * 中间件方法会顺序执行，因此中间件加载的顺序非常重要
 *
 * @param app
 *
 * 路由设计：
 * signup/register  获取注册页
 * signup/signup    注册用户
 *
 * posts        文章列表页
 */
module.exports = function (app) {

    app.get("/",function (req, res) {
        res.redirect("/posts");
    })
    app.use("/signin",require("./signin"));
    app.use("/signout",require("./signout"));
    app.use("/signup",require("./signup"));
    app.use("/posts", require("./article"));
    // 404 page
    app.use(function (req, res) {
        console.log(res.headersSent);
        if (!res.headersSent) {
            res.render('404');
        }
    });
}

