/**
 * 账单
 */
import api from '../api';

export const GET_BILLING_LIST = 'GET_BILLING_LIST';
export const GET_BILLING_LIST_SUCCESS = 'GET_BILLING_LIST_SUCCESS';

export const getBillingList = obj => {
	return {
		type: GET_BILLING_LIST,
		payload: {
			promise: api.get('/v2/get_bill_history.json', { params: obj })
		}
	}
}
