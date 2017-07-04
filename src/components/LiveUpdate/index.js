import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getTables } from '../../actions/tables';
import { getCarte } from '../../actions/carte';

import { getUser } from '../../utils';
import {message,Button,notification} from 'antd';

let ws;
let lockReconnect = false; //避免重复连接
// const origin = window.location.hostname;
// const port=window.location.port;

// const wsUrl = 'ws://'+origin+':'+(Number(port)+1);
// const wsUrl='ws://192.168.8.122:8091';
const NODE_ENV = process.env.NODE_ENV;
const origin = window.location.hostname;
const port=window.location.port;
// export const DoMain=NODE_ENV == 'production' ? origin : 'http://192.168.8.122:8091';

const wsOriginurl = 'ws://'+origin+':'+(Number(port)+1); 
const wsUrl =NODE_ENV == 'production'? wsOriginurl:'ws://192.168.0.235:8091';

const info = function (data) {
  let newdata=eval('(' + data + ')');
  // newdata.name+'||'+newdata.ip+'||'+newdata.status
  notification.error({
    message: '打印机故障',
    description:'打印机: '+newdata.name+' 它的IP地址是: '+newdata.ip+' 发生了故障，原因是: '+newdata.status,
    duration:6,
  });
};

class LiveUpdate extends Component{
	constructor(props) {
		super(props);	
	}

	componentWillMount() {}

	componentDidMount() {
		createWebSocket(wsUrl, this.props);
	}

	render() {
		return (<span className="hide"></span>);
	}
}

const mapStateToProps = (state) => {
	return {
		tables: state.tables,
		dish: state.carte.dish
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({ getTables, getCarte }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveUpdate);

const createWebSocket = (url, props) => {
	try {
        ws = new WebSocket(url);
        initEventHandle(props);
    } catch (e) {
        reconnect(url);
    }	
}

const initEventHandle = (props) => {
	ws.onclose = function () {
        reconnect(wsUrl);
    };
    ws.onerror = function () {
        reconnect(wsUrl);
    };
    ws.onopen = function () {
        // ws.send('大家好');
        //心跳检测重置
        heartCheck.reset().start();
    };
    ws.onmessage = function (event) {
        //如果获取到消息，心跳检测重置
        //拿到任何消息都说明当前连接是正常的
        //这里监听到后端给客户端发送的消息，三种类型 桌台数据，菜品数据和打印机状态

        // tablestatus 重新拉取桌台数据    （点菜宝、收银）请求：get_tablestatus.json
        // dishesupdate    重新拉取所有菜品    （点菜宝、收银）请求：get_dishs.json
        // backupdate  大后台更新数据 更新服务处理
        // systemwatcher   监控数据    
        // open_cashbox    打开钱箱    打印服务处理
        // printstatus 打印机状态   根据返回的data处理是否要显示（收银）

        if (event.data=='pong') {
            return;
        }else{
            // let data;
            // try{
            //   data = JSON.parse(event.data);    
            // }catch(){

            // }
            // if(!data)return;
            try{
              var data = JSON.parse(event.data);
              const type = data.type;
              const { getTables, getCarte } = props;
              const user = getUser();

              if (type == 'tablestatus') getTables({ ...user, area_id: '', status: '' });
        
              if (type == 'dishesupdate') getCarte({ ...user });

              if (type == 'printstatus') {
                  console.log('socket message: ' + type);
                  info(data.data);
               }
            }catch(e){
        
            }
             heartCheck.reset().start();
        }
       
    }
}

const reconnect = url => {
	if (lockReconnect) return;

    lockReconnect = true;
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout(function () {
        createWebSocket(url);
        lockReconnect = false;
    }, 2000);	
}

//心跳检测
const heartCheck = {
    timeout: 60000, //60秒
    timeoutObj: null,
    reset: function(){
        clearTimeout(this.timeoutObj);
        return this;
    },
    start: function(){
        this.timeoutObj = setTimeout(function(){
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            ws.send('ping');
        }, this.timeout)
    }
}
