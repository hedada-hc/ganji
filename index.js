const sa = require("superagent")
const async = require("async")
const request = require("request")
const fs = require('fs')
const config = require("./config")
const Gj = require("./Gj")

const v = new Vue({
	el:"#app",
	data:{
		username:"15629011973",
		password:"hedada0313",
		__hash__:'',
		cookie:'',
		code:'',
		codeurl:'',
		title:'',
		zhiwei:'',
		GANJISESSID:''
	},methods:{
		Login(){
			async.waterfall([
				function(callback){
					v.__hash(callback)
				}
			])
		},__hash(callback){
			var url = "https://passport.ganji.com/login.php?next=http%3A%2F%2Fwww.ganji.com%2Fuser%2Fregister.php%3Fnext%3Dhttp%253A%252F%252Fpassport.ganji.com%253A443%252Flogin.php%253Fnext%253D%252F"
			sa.get(url)
				.set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36")
				.end((err,msg)=>{
					if(/id="need_checkcode"\sstyle="([\w:?]+)"/.exec(msg.text)[1] == "display:none"){
						v.__hash__ = /__hash__\s=\s'(.*?)';/.exec(msg.text)[1]
						console.log(v.__hash__)
						callback(null,v.__hash__)
						var codeurl = /<img\sid="login_img_checkcode"\swidth="120"\sheight="36"\sdata-role="reflesh"\salign="absmiddle"\ssrc="(.*?)"\s\/>/.exec(msg.text)[1]
						v.getcode(codeurl)
						
					}else{
						var codeurl = /<img\sid="login_img_checkcode"\swidth="120"\sheight="36"\sdata-role="reflesh"\salign="absmiddle"\ssrc="(.*?)"\s\/>/.exec(msg.text)[1]
						console.log("有验证码:"+codeurl)
						callback(null,v.__hash__)
					}
				})
		},getcode(url){
			sa.get(url).end((error,msg)=>{
				fs.writeFile('./code.png',msg.body,(err)=>{
					console.log("code save success !")
					v.cookie = msg.header['set-cookie'][0].split(";")[0]
					v.codeurl = `./code.png?${new Date().getTime()}`
				})

			})
		},getLoginUrl(){
			var times = new Date().getTime()
			var url = `https://passport.ganji.com/login.php?callback=hezone&username=${this.username}&password=${this.password}&checkCode=${this.code}&setcookie=14&second=&parentfunc=&redirect_in_iframe=&next=http%3A%2F%2Fwww.ganji.com%2Fuser%2Fregister.php%3Fnext%3Dhttp%253A%252F%252Fpassport.ganji.com%253A443%252Flogin.php%253Fnext%253D%252F&__hash__=${this.__hash__}&_=${times}`
			request({url:url,headers:{Cookie:v.cookie}}, function(err, response, body) {
				var json = JSON.parse(/hezone\((.*?)\)/.exec(body)[1])
				if(json.status == 1 && json.next != undefined){
					v.cookie = v.StrCookie(response.headers['set-cookie'])
					console.log(`登录成功！`)
					v.startLogin(json.next)
				}else{
					console.log(`登录失败！返回json：${json}`)
				}
				
			})
		},startLogin(url){
			console.log(url)
			sa.get(url)
				.set("Cookie",v.cookie)
				.set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36")
				.end((error,msg)=>{
					if(/<title>【(.*?)】-赶集网<\/title>/.exec(msg.text)[1] == "登录成功"){
						console.log(msg,msg.header['set-cookie'])
						v.cookie += v.StrCookie(msg.header['set-cookie']) +'; ganji_uuid=1234567891234567891234'
						console.log("登录成功啦，可以发帖啦！")
						console.log(v.cookie)
					}else{
						console.log(msg.text)
						console.log("没能登录成功，还不能发布帖子！")
					}
				})
		},PostIng(){
			var url = 'http://www.ganji.com/pub/pub.php?cid=2&mcid=&act=pub&method=submit&domain=wh&source=select&from=uc&puid='
			var data = config.replace(/-title-/,this.title)
			data = data.replace(/-zhiwei-/,this.zhiwei)
			sa.post(url)
				.set("Content-Type","multipart/form-data; boundary=----WebKitFormBoundaryyORp4mMwpr1YzYcp")
				.set('Cookie',v.cookie)
				.set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36")
				.set("Referer","http://www.ganji.com/pub/pub.php?act=pub&method=load&cid=2&domain=wh&from=uc&_pdt=zhaopin")
				.send(data)
				.end((err,msg)=>{
					if(/<title>(.*?)<\/title>/.exec(msg.text)[1] == "招聘发布成功"){
						if(/您需要先完善公司信息/.test())
						console.log(msg.text,"招聘发布成功")
						v.GetLimit()
					}else{
						console.log(v.cookie,"招聘发布失败！")
					}
					console.log(msg.text)
				})
		},GetLimit(){
			var url = `http://www.ganji.com/ajax.php?dir=zhaopin&module=get_user_company_info`
			sa.get(url)
				.set("Cookie",v.cookie)
				.set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36")
				.end((err,msg)=>{
					console.log(msg.text)
				})
		},StrCookie(cookie){
			var tmp = ''
			for(var i=0;i<cookie.length;i++){
					if(tmp == ''){
						tmp += `${cookie[i].split(";")[0]}`
					}else{
						tmp += `; ${cookie[i].split(";")[0]}`
					}
			}
			return tmp
		},test(){
			Gj.Login()
		},get(){
			Gj.getLoginUrl()
		},Posts(){
			Gj.PostAi()
		},Getinfo(){
			Gj.GetInfo()
		}

	}
})







