import Api from './api';

const NODE_ENV = process.env.NODE_ENV;
const origin = window.location.origin;
export const DoMain=NODE_ENV == 'production' ? origin : 'http://192.168.0.235:8090';
const baseURI =DoMain+'/api';

console.log(VERSION);

const api = new Api({
  	baseURI: baseURI,
  	/**
  	headers: {
    	'Accept': 'application/json',
    	'Content-Type': 'application/json'
  	}
  	**/
})

export default api;
