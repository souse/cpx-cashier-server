
import api from '../api';
export const GET_DAYDETAIL_LIST = 'GET_DAYDETAIL_LIST';
export const GET_DAYDETAIL_LIST_SUCCESS = 'GET_DAYDETAIL_LIST_SUCCESS';

// 每日营收模块
export const getDayDetail = obj => {
	return {
		type: GET_DAYDETAIL_LIST,
		payload: {
			promise: api.get('/statistics/day_revenue.json', { params: obj })
		}
	}
}