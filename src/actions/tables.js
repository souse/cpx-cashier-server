import api from '../api'

export const GET_TABLES = 'GET_TABLES';
export const GET_TABLES_SUCCESS = 'GET_TABLES_SUCCESS';
export const SET_CURRENT_TABLE_ID = 'SET_CURRENT_TABLE_ID';
export const SET_CURRENT_TABLE = 'SET_CURRENT_TABLE';
export const CLEAR_CURRENT_TABLE = 'CLEAR_CURRENT_TABLE';

export const getTables = (obj) => {
	return {
		type: GET_TABLES,
		payload: {
			promise: api.get('/get_tablestatus.json', { params: obj })
		}
	}
}

export const setCurrentTable = id => {
	return {
		type: SET_CURRENT_TABLE_ID,
		payload: {
			id
		}
	}
}

export const clearCurrentTable = () => {
	return {
		type: CLEAR_CURRENT_TABLE
	}
}