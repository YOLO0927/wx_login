/**
 * Created by Administrator on 2017/1/12.
 */
var express = require('express');
var app = express();
var router = express.Router();
var request = require('request');

/*微信登录*/
//测试号ID和Secret
var AppID = 'wx00802e301588a23a';
var AppSecret = '562310b7d688a709de96441acd22f4bd';

router.get('/wx_login',function(req,res,next){
   //第一步：用户同意授权，获取code
    var router = 'get_wx_access_token';
    //编码后的回调地址
    var return_uri = 'http%3A%2F%2Fwww.1yuansj.cn%3A3000%2Foauth%2F'+router;
    console.log(decodeURIComponent(return_uri));
    var scope = 'snsapi_userinfo';

    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?' +
        'appid=' + AppID +
        '&redirect_uri=' + return_uri +
        '&response_type=code' +
        '&scope=' + scope +
        '&state=STATE#wechat_redirect');
});

router.get('/get_wx_access_token',function(req,res,next){
    //第二步：通过code换取网页授权access_token
    console.log(req.query);
    var code = req.query.code;
    console.log(code);
    request.get(
        {
            url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+AppID+'&secret='+AppSecret+'&code='+code+'&grant_type=authorization_code'
        },
        function(error,response,body){
            if(response.statusCode == 200){
                console.log(body);
                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;
                //第三步：请求用户信息
                request.get(
                    {
                        url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN'
                    },
                    function(error,response,body){
                        if(response.statusCode === 200){
                            //第四步：根据获取的用户信息进行操作
                            var userinfo = JSON.parse(body);
                            console.log('获取信息成功');
                            console.log(userinfo);

                            //测试
                            res.send(
                                "<h1>" + userinfo.nickname + " 的个人信息</h1>" +
                                "<p><img src=" + userinfo.headimgurl + "/></p>" +
                                "<p>" + userinfo.city + "," + userinfo.province + "," + userinfo.country + "</p>"
                            );
                        }
                        else{
                            console.log(response.statusCode);
                        }
                    }
                );
            }
            else{
                console.log(response.statusCode);
            }
        }
    );
});

app.use('/oauth',router);

var server = app.listen(3000,'www.1yuansj.cn',function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
})

