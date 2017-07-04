




import api from '../api';

export const GET_DAYOUT_LIST = 'GET_DAYOUT_LIST';
export const GET_DAYOUT_LIST_SUCCESS = 'GET_DAYOUT_LIST_SUCCESS';

// 统计模块。 日结日志
export const getdayoutlist = obj => {
	return {
		type: GET_DAYOUT_LIST,
		payload: {
			promise: api.get('/get_daily_bill_record.json', { params: obj })
		}
	}
}
