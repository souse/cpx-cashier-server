import superagent from 'superagent';
import { getDevice, updateDialog } from '../utils';

const methods = [
  'get',
  'head',
  'post',
  'put',
  'del',
  'options',
  'patch'
];

class _Api {

  constructor(opts) {

    this.opts = opts || {};

    if (!this.opts.baseURI)
      throw new Error('baseURI option is required');

    methods.forEach(method =>
      this[method] = (path, { params, data } = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](this.opts.baseURI + path);
        const deviced=getDevice();
        if (params) {
          
          params['platform']='pc';
          params['appVersion']=VERSION;
          params['device_id']=deviced;
          request.query(params);
        }

        if (this.opts.headers) {
          request.set(this.opts.headers);
        }

        if (data) {
           request.type('form');
           data['platform']='pc';
           data['appVersion']=VERSION;
           data['device_id']=deviced;
           request.send(data);
        }

        request.end((err, { body } = {}) => {
          //err ? reject(body || err) : resolve(body)
          if (err) { 
            reject(body || err);
          } else {
            // body { code, data, msg} code: 10006=>检测到新版本
            if (body.code === 10006) {
              // 全局 弹窗提示更新
              updateDialog();
              reject(body || error);
            } else {
              resolve(body);
            }  
          }
        });
      })
    );

  }

}

const Api = _Api;

export default Api;
