import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import user from './user';
import menu from './menu';
import tables from './tables';
import tableArea from './tableArea';
import orderDetail from './orderDetail';
import carte from './carte';
import batchDishs from './batchdishs';

import billing from './billing';

import sellout from './sellout';
import comprehensive from './conprehensive'
import dailyRevenue from './DailyRevenue'
import Daildayout from './daildayout'


const rootReducer = combineReducers({
	user, 
	menu, 
	orderDetail,
	tables,
	tableArea,
	carte,
	batchDishs,
	billing,
	sellout,
	routing: routerReducer ,
	comprehensive,
	dailyRevenue,
	Daildayout
});

export default rootReducer;