/**
 * Created by liyan on 17/1/1.
 */
var path = require('path');
var express = require('express');   //web 框架
var session = require('express-session');  //session 中间件
var MongoStore = require('connect-mongo')(session);   //将 session 存储于 mongodb，结合 express-session 使用
var flash = require('connect-flash');   //页面通知提示的中间件，基于 session 实现
var config = require('config-lite'); //读取配置文件
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');  //日志
var expressWinston = require('express-winston');  //基于 winston 的用于 express 的日志中间件
var app = express();


// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');
/**
 * <% code %>：运行 JavaScript 代码，不输出
 <%= code %>：显示转义后的 HTML内容
 <%- code %>：显示原始 HTML 内容
 */
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session 中间件
app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({// 将 session 存储到 mongodb
        url: config.mongodb// mongodb 地址
    })
}));
// flash 中间价，用来显示通知
app.use(flash());
// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'),// 上传文件目录
    keepExtensions: true// 保留后缀
}));
// 设置模板全局常量
app.locals.blog = {
    title: pkg.name,
    description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

/**
 * 记录正常请求日志的中间件要放到 routes(app) 之前，
 * 记录错误请求日志的中间件要放到 routes(app) 之后。
 */
// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));
// 路由
routes(app);
// 错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));

// error page
app.use(function (err, req, res, next) {
    res.render('error', {
        error: err
    });
});
//直接启动 index.js 则会监听端口启动程序，如果 index.js 被 require 了，则导出 app，通常用于测试。
if (module.parent) {
    module.exports = app;
} else {
    // 监听端口，启动程序
    app.listen(config.port, function () {
        console.log(`${pkg.name} listening on port ${config.port}`);
    });
}