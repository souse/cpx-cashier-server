




import api from '../api';

export const GET_COMPREHEN_LIST = 'GET_COMPREHEN_LIST';
export const GET_COMPREHEN_LIST_SUCCESS = 'GET_COMPREHEN_LIST_SUCCESS';

// 综合营业收入
export const getcomprehensive = obj => {
	return {
		type: GET_COMPREHEN_LIST,
		payload: {
			promise: api.get('/statistics/composite.json', { params: obj })
		}
	}
}
