import api from '../api';

export const GET_SELLOUT_LIST = 'GET_SELLOUT_LIST';
export const GET_SELLOUT_LIST_SUCCESS = 'GET_SELLOUT_LIST_SUCCESS';
export const UPDATE_SELLOUT = 'UPDATE_SELLOUT';
export const ADD_SELLOUT = 'ADD_SELLOUT';
export const DELETE_SELLOUT = 'DELETE_SELLOUT';
export const CLEAR_SELLOUT_LIST = 'CLEAR_SELLOUT_LIST';
export const CLEAR_SELLOUT_LIST_SUCCESS = 'CLEAR_SELLOUT_LIST_SUCCESS';
export const UPDATE_CHECKD='UPDATE_CHECKD';

export const getSellOutList = obj => {
	return {
		type: GET_SELLOUT_LIST,
		payload: {
			promise: api.get('/get_surplus.json', { params: obj })
		}
	}
}

export const updateSellOut = (id, surplus, dayLimit) => {
	return {
		type: UPDATE_SELLOUT,
		payload: {
			id,
			surplus,
			dayLimit
		}
	}
}

export const addSellOut = obj => {
	return {
		type: ADD_SELLOUT,
		payload: {
			obj
		}
	}
}

export const deleteSellOut = id => {
	return {
		type: DELETE_SELLOUT,
		payload: {
			id
		}
	}
}

export const updateCheckd = flg => {
	return {
		type: UPDATE_CHECKD,
		payload: {
			flg
		}
	}
}

export const clearSellOutList = (obj) =>{
	return {
		type: CLEAR_SELLOUT_LIST,
		payload: {
			promise: api.post('/clear_surplus.json', { data: obj })
		}
	}
}


