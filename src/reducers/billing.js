import { 
	GET_BILLING_LIST,
	GET_BILLING_LIST_SUCCESS
} from '../actions/billing';

const initialState = {
	billlist: {}
};

const getBillingList = (state = initialState, action = {}) => {

	switch(action.type) {
		case GET_BILLING_LIST_SUCCESS:
			return { billlist: action.payload.data}
		default:
			return state;	
	}
 }

 export default getBillingList;