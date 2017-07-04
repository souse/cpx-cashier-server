
import {
	ADD_ORDERING_DISH,
	DEL_ORDERING_DISH,
	CLEAR_ORDERING_DISH
} from '../actions/orderinglist';

const initialState = {
	dishs: []
};

const addOrderingDish = (state = initialState, action = {}) => {

	switch(action.type) {
		case ADD_ORDERING_DISH:
			return state;
		case DEL_ORDERING_DISH:
			return state;
		case CLEAR_ORDERING_DISH:
			return state;
		default:
			return state;
	}
}