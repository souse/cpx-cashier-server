import api from '../api'

export const GET_CARTE = 'GET_CARTE';
export const GET_CARTE_SUCCESS = 'GET_CARTE_SUCCESS';
export const CHANGE_DISH_CATEGORY = 'CHANGE_DISH_CATEGORY';
export const UPDATE_DISH_SURPLUS = 'UPDATE_DISH_SURPLUS';
export const CHANGE_DISH='CHANGE_DISH';

export const getCarte = (obj) => {
	return {
		type: GET_CARTE,
		payload: {
			promise: api.get('/get_dishs.json', { params: obj })
		}
	}
}

export const changeCategory = id => {
	return {
		type: CHANGE_DISH_CATEGORY,
		payload: {
			id
		}
	}
}

export const changeDish = val => {
	return {
		type: CHANGE_DISH,
		payload: {
			val
		}
	}
}

export const updateDishSurplus = (id, surplus) => {
	return {
		type: UPDATE_DISH_SURPLUS,
		payload: {
			id,
			surplus
		}
	}
}