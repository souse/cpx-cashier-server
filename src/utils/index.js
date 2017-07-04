/**
 * 公用的一些函数
 */
import api from '../api';
import { notification } from 'antd';

export const isPromise = value => {
	if (value !== null && typeof value === 'object') {
		return value.promise && typeof value.promise.then === 'function';
	}
}

const setCookie = (name, value, seconds) => {
	let expires = '', date;

	seconds = seconds || 0;   //seconds有值就直接赋值，没有为0。  
	if (seconds != 0 ) {//设置cookie生存时间  
		date = new Date();  
		date.setTime(date.getTime() + (seconds * 1000));  
		expires = '; expires=' + date.toGMTString();  
	}  
	document.cookie = name + '=' + escape(value) + expires + '; path=/';   //转码并赋值  
}

const getCookie = (name) => {
	let nameEQ = name + '=';  
 	let ca = document.cookie.split(';'); //把cookie分割成组  

 	for(let i=0; i < ca.length; i++) {  
		let c = ca[i];  
		while (c.charAt(0) == ' ') {//判断一下字符串有没有前导空格  
			c = c.substring(1, c.length);//有的话，从第二位开始取  
 		}  
	 	if (c.indexOf(nameEQ) == 0) {//如果含有我们要的name  
	 		return unescape(c.substring(nameEQ.length, c.length));//解码并截取我们要值  
	 	}  
	}  
 	return '';  
}

const clearCookie = name => {
	setCookie(name, '', -1);
}

export {setCookie, getCookie, clearCookie};

export const setUser = user =>{
	localStorage.setItem('user', JSON.stringify(user));
}

export const getUser = () => {
	let user = localStorage.getItem('user');

	return JSON.parse(user);
}

//本地存储设备id
export const setDevice=id=>{
	localStorage.setItem('device',JSON.stringify(id));
}
export const getDevice = () => {
	let device = localStorage.getItem('device');
	return JSON.parse(device);
}

// 本地存储菜品dish
export const setDish=dish=>{
	localStorage.setItem('dishlist',JSON.stringify(dish));
}
export const getDish = () => {
	let dishlist = localStorage.getItem('dishlist');
	return JSON.parse(dishlist);
}

export const checkAjaxError = payload => payload.code === 0 ? null : payload.msg;

export const getIntervalTime = oldTime => {
	let seconds = new Date().getTime() / 1000 - oldTime, txt;
	let m = parseInt(seconds / 60), h = parseInt(m / 60), d = parseInt(h / 24);

	return d > 1 ? (d + '天前') : h > 1 ? (h + '小时前') : m > 1 ? (m + '分钟前') : '';
}

/** 格式化呢时间戳 yyyy/mm/dd hh:mm */
export const formatDate = time => {
	const date = new Date(time * 1000);
	const seperator1 = "/";
    const seperator2 = ":";
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    let ss = date.getMinutes();

    if (month >= 1 && month <= 9) {
        month = '0' + month;
    }

    if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
    if (ss >= 0 && ss <= 9) {
    	ss = '0' + ss;	
    }

    return date.getFullYear() + seperator1 +"  "+ month + seperator1 +"  "+ strDate + 
    	' ' + date.getHours() + seperator2 + ss;
}

/**
 * Object to string
 * @param  {[type]} obj [{key: value}]
 * @return {[type]}     [a=1&b=2]
 */
export const objToString = (obj) => {
	let str = '';
	for (let key in  obj) {
		str += key + '=' + obj[key] + '&';
	}
	return str.substring(0, str.length - 1);
}

export const printOrderDetail = obj => {
	let pomise = api.post('/print_order_detail.json', { data: obj });

	pomise.then(
		(resolved = {}) => {
			if (resolved.code === 0) {
				notification.success({
	              	message: '提示信息',
	              	description: resolved.msg
	          	});
			} else {
				notification.error({
	              	message: '提示信息！',
	              	description: resolved.msg
	          	});
			}
		},
		(rejected = {}) => {
			console.log('reject.......print_order_detail: ', rejected);
		}
	);	 
}

/**
 * 获取 orderDetail 中新点的菜
 * @param  {[array]} dishs [订单list]
 * @return {[array]} list  [未落单list]
 */
export const getUnOrderedDishs = dishs => {
	let list = [];

	for (let i = 0; i < dishs.length; i++) {
		const dish = dishs[i];

		if (dish.order_dish_id == undefined&&dish.senteId== undefined) {
			list.push(dish);
		}
	};

	return list; 
}



// 禁止鼠标右键和一些默认事件

export const disableMenuNSelection=()=>{
	   let omitformtags = ["input", "textarea", "select", "img"]
        omitformtags = omitformtags.join("|")
        function disableselect(e) {
            if (omitformtags.indexOf(e.target.tagName.toLowerCase()) == -1)
                return false
        }

        function reEnable() {
            return true
        }

        if (typeof document.onselectstart != "undefined")
            document.onselectstart = new Function("return false")
        else {
            document.onmousedown = disableselect
            document.onmouseup = reEnable
        }

        if (typeof document.oncontextmenu != "undefined")
            document.oncontextmenu = new Function("return false")
        else {
            document.onmousedown = reEnable
        }

        if (typeof document.ondragstart != "undefined") {
            document.ondragstart = new Function("return false")
        }
}



export const banBackSpace=(e)=>{
        var ev = e || window.event;//获取event对象 
		var obj = ev.target || ev.srcElement;//获取事件源 

		var t = obj.type || obj.getAttribute('type');//获取事件源类型 

		//获取作为判断条件的事件类型 
		var vReadOnly = obj.getAttribute('readonly'); 
		var vEnabled = obj.getAttribute('enabled'); 
		//处理null值情况 
		vReadOnly = (vReadOnly == null) ? false : vReadOnly; 
		vEnabled = (vEnabled == null) ? true : vEnabled; 

		//当敲Backspace键时，事件源类型为密码或单行、多行文本的， 
		//并且readonly属性为true或enabled属性为false的，则退格键失效 
		var flag1=(ev.keyCode == 8 && (t=="password" || t=="text" || t=="textarea") 
		&& (vReadOnly==true || vEnabled!=true))?true:false; 

		//当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效 
		var flag2=(ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea") 
		?true:false; 

		//判断 
		if(flag2){ 
		return false; 
		} 
		if(flag1){ 
		return false; 
		} 
} 

export const getExportString = object => {
	let str = '';

	for (let key of Object.keys(object)) {
		str += key + '=' + object[key] + '&';
	}

	return str.substring(0, str.length - 1);
}


export const updateDialog = function() {
	return new newDialog();
}

const newDialog = function() {
	this.init();
}

newDialog.prototype = {
	init: function() {
		if (document.getElementById('confirmDialog')) {
			return false;
		};

		this.addDiv();
		this.initEvent();
	},
	initEvent: function(){
		var confirm = document.getElementById('confirm');
		var confirmDialog = document.getElementById('confirmDialog');

		confirm.removeEventListener('click', function() {});
		confirm.addEventListener('click', function() {
			document.getElementsByTagName('body')[0].removeChild(confirmDialog);
			try{ Utils.Restart(); }catch(e){ console.log(e); }
		});
	},
	addDiv: function() {
		var htm = this.createHtm();

		htm.innerHTML = this.createDialog();
		document.getElementsByTagName('body')[0].appendChild(htm);
	},
	createHtm: function(){
		var div = document.createElement('div');

		div.setAttribute('id', 'confirmDialog');
		//div.setAttribute('style', 'display: box; display: -webkit-box; display: -moz-box; position: fixed; left: 0; right: 0; top: 0; bottom: 0; -webkit-box-pack:center; -moz-box-pack:center; -webkit-box-align:center; -moz-box-align:center; z-index:9999; background: rgba(0,0,0,0.3);');
		
		return div;
	},
	createDialog: function (){
		return '<div class="zoomIn animated update-dg">' +
			'<div class="update-dg-tip">提示信息</div>' +
  			'<p style="font-size: 18px;">检测到有新版本，请立即更新！</p>' +
  			'<div style="text-align:center">' +
				'<button id="confirm">确 认</button>' +
			'</div>' +
		'</div>';
	}
};








