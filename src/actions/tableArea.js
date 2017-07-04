import api from '../api'

export const GET_TABLE_AREA = 'GET_TABLE_AREA';
export const GET_TABLE_AREA_SUCCESS = 'GET_TABLE_AREA_SUCCESS';
export const SET_CURRENT_TABLE_AREA_ID = 'SET_CURRENT_TABLE_AREA_ID';

export const getTableArea = (obj) => {
	return {
		type: GET_TABLE_AREA,
		payload: {
			promise: api.get('/get_areas.json')
		}
	}
}

export const setTableAreaId = (id, tablearea) => {
	return {
		type: SET_CURRENT_TABLE_AREA_ID,
		payload: {
			id,
			tablearea
		}
	}
}