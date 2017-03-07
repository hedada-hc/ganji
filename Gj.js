const sa = require("superagent")
const async = require("async")
const request = require("request")
const fs = require('fs')
const config = require("./config")

class Gj{

	//登录开始
	Login(){
		var login = new Gj()
		async.waterfall([
			function(callback){
				login.__hash(callback)
			}
		])
	}

	//登录初始化
	__hash(callback){
		var login = new Gj()
		var url = "https://passport.ganji.com/login.php"
		sa.get(url)
			.set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36")
			.end((err,msg)=>{
				if(/id="need_checkcode"\sstyle="([\w:?]+)"/.exec(msg.text)[1] == "display:none"){
						v.__hash__ = /"__hash__":"(.*?)"\}/.exec(msg.text)[1]
						console.log(msg)
						callback(null,v.__hash__)
						var codeurl = /<img\sid="login_img_checkcode"\swidth="120"\sheight="36"\sdata-role="reflesh"\salign="absmiddle"\ssrc="(.*?)"\s\/>/.exec(msg.text)[1]
						login.getcode(codeurl)
				}else{
					var codeurl = /<img\sid="login_img_checkcode"\swidth="120"\sheight="36"\sdata-role="reflesh"\salign="absmiddle"\ssrc="(.*?)"\s\/>/.exec(msg.text)[1]
					console.log("有验证码:"+codeurl)
					callback(null,v.__hash__)
				}
			})
	}

	getcode(url){
		sa.get(url).end((error,msg)=>{
			fs.writeFile('./code.png',msg.body,(err)=>{
				console.log("code save success !")
				v.cookie = msg.header['set-cookie'][0].split(";")[0]
				v.GANJISESSID = msg.header['set-cookie'][0].split(";")[0]
				v.codeurl = `./code.png?${new Date().getTime()}`
				console.log(v.cookie)
			})

		})
	}

	getLoginUrl(){
		var login = new Gj()
		var times = new Date().getTime()
		var url = `https://passport.ganji.com/login.php?callback=hezone&username=${v.username}&password=${v.password}&checkCode=${v.code}&setcookie=14&second=&parentfunc=&redirect_in_iframe=&next=%2F&__hash__=${v.__hash__}&_=${times}`
		request({url:url,headers:{Cookie:v.cookie}}, function(err, response, body) {
			v.cookie = login.StrCookie(response.headers['set-cookie'])
			var json = JSON.parse(/hezone\((.*?)\)/.exec(body)[1])
			console.log(v.cookie,json)
			login.startLogin(json.next,login)
		})
	}

	startLogin(url,gj){
		console.log(url)
		sa.get(url)
			.set("Cookie",v.cookie)
			.set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36")
			.end((error,msg)=>{
				console.log(msg,v.cookie)
				var SetCookieUrl = /<script\s?src="(.*?)"><\/script><\/head>/.exec(msg.text)[1]
				gj.LoginCookie(SetCookieUrl)
			})
	}

	LoginCookie(url){
		sa.get(url)
			.set("cookie",v.cookie)
			.end((err,msg)=>{															
				v.cookie += `${new Gj().StrCookie(msg.header['set-cookie'])};ganji_uuid=1234567891234567891234`
				console.log(v.cookie)
			})
	}

	StrCookie(cookie){
		var tmp = ''
		for(var i=0;i<cookie.length;i++){
				if(tmp == ''){
					tmp += `${cookie[i].split(";")[0]}`
				}else{
					tmp += `; ${cookie[i].split(";")[0]}`
				}
		}
		return tmp
	}

	PostAi(){
		var url = "http://www.ganji.com/pub/pub.php?cid=3&mcid=&act=pub&method=submit&domain=bj&from=uc&puid="
		sa.post(url)
			.set('cookie',v.cookie)
			.set('Content-Type','multipart/form-data; boundary=----WebKitFormBoundaryyORp4mMwpr1YzYcp')
			.send(config)
			.end((err,msg)=>{
				if(/发布成功了/.test(msg.text)){
					console.log(/class="suc-job-tip-txt">(.*?)<\/p>/.exec(msg.text)[1])
					console.log(msg)
				}else{
					console.log("发布失败！")
				}
			})
	}

	//获取id
	GetInfo(){
		var url = "http://www.ganji.com/ajax.php?dir=zhaopin&module=get_user_company_info"
		sa.get(url)
			.set('cookie',v.GANJISESSID)
			.end((err,msg)=>{
				var json = JSON.parse(msg.text)
				if(new Gj().UserInitInfo(json)){
					console.log(v.work_address_info,v.info)
				}
			})
	}

	//设置info值
	UserInitInfo(json){
		if(json.login == true){

			json.work_address_info = json.work_address_info[0]

			v.info.login = json.login
			//发布量
			v.userPostLimit.limit = json.userPostLimit.limit
			v.userPostLimit.count = json.userPostLimit.count

			//账户信息
			v.work_address_info.city = json.work_address_info.city
			v.work_address_info.district_id = json.work_address_info.district_id
			v.work_address_info.id = json.work_address_info.id
			v.work_address_info.latlng = json.work_address_info.latlng
			v.work_address_info.work_address = json.work_address_info.work_address

			v.info.street = json.info.street
			v.info.contact_phone = json.info.contact_phone
			v.info.district = json.info.district
			return true
		}
		return false
	}
}


module.exports = new Gj()