

import { 
	GET_COMPREHEN_LIST,
	GET_COMPREHEN_LIST_SUCCESS,
} from '../actions/comprehensive';

const initialState = {
	comprehentable: [],
};

// 综合营业收入
const getcomprehensive = (state = initialState, action = {}) => {

	switch(action.type) {
		case GET_COMPREHEN_LIST_SUCCESS:
			return { comprehentable: action.payload.data.list };
		default:
			return state;	
	}
 }

 export default getcomprehensive;