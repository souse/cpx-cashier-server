import cloneDeep from 'lodash/cloneDeep';

import { GET_CARTE, GET_CARTE_SUCCESS, CHANGE_DISH_CATEGORY, UPDATE_DISH_SURPLUS ,CHANGE_DISH} from '../actions/carte';

import { checkAjaxError } from '../utils';

const initialState = {
	dish_category: [],
	dish: [],
	cur_category_dish: [],
	ajaxError: null,
	only_category_dish:[]
};

const getCarte = (state = initialState, action = {}) => {
	switch (action.type) {
		case GET_CARTE_SUCCESS:
			let dish_category = action.payload.data.dish_category;

			dish_category.unshift({
				category_id: 'all',
				name: '全部',
				weight: 'all' 	
			});
			
			return Object.assign({}, state, { 
				dish_category: dish_category, 
				only_category_dish:action.payload.data.dish,
				dish: action.payload.data.dish,
				cur_category_dish: action.payload.data.dish,
				ajaxError: checkAjaxError(action.payload)
			});
		case CHANGE_DISH_CATEGORY:
			const newState = cloneDeep(state);

			return setCurrentDishCategoryDishs(newState, action.payload.id);
		case UPDATE_DISH_SURPLUS:
			const dishs = cloneDeep(state.dish);
			const cdishs = cloneDeep(state.cur_category_dish);

			return Object.assign({}, state, { 
				dish: updateDishSurplus(dishs, action.payload),
				cur_category_dish: updateDishSurplus(cdishs, action.payload)
			});
		case CHANGE_DISH:
		    const newdishs = cloneDeep(state.only_category_dish);
		    return Object.assign({},state,{
		    	cur_category_dish:getnewdish(newdishs,action.payload.val)
		    });
		default:
			return state;
	}
}

export default getCarte;

const setCurrentDishCategoryDishs = (state, id) => {
	let dishs = state.dish, newDishs = [];

	if(id == 'all') return {...state, cur_category_dish: dishs};

	dishs.forEach((dish) => {
		if (dish.category_id == id) newDishs.push(dish);
	});

	return {...state, cur_category_dish: newDishs };
} 

const updateDishSurplus = (dishs, obj) =>{
	for (let i = 0; i < dishs.length; i++) {
		const dish = dishs[i];

		if (dish.dish_id == obj.id) {
			dishs[i].surplus = obj.surplus;
			break;
		}
	};

	return dishs;
}

const getnewdish=(obj,invalue)=>{
	let newlistmsg=[];
      for (var i = 0; i < obj.length; i++) {
		 	     if (obj[i].pinyin.indexOf(invalue)!==-1||obj[i].dish_name.indexOf(invalue)!==-1||obj[i].first_letter.indexOf(invalue)!==-1||obj[i].identifier.indexOf(invalue)!==-1) {
		 	     		newlistmsg.push(obj[i]);
		 	     }
		 }
     return newlistmsg;
}

