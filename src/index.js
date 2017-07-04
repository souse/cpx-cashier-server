import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, IndexRedirect } from 'react-router';

import store, { history } from './store/configureStore';
import { getCookie } from './utils';


import Login from './views/Login';
import App from './views/App';

import Home from './views/Home';

import Cashier from './views/Cashier';
import ChooseTable from './components/ChooseTable';
import OpenTable from './components/OpenTable';
import Ordered from './components/Ordered';
import ModifyDishs from './components/ModifyDishs';
import Payment from './components/Payment';

import Bill from './views/Bill';
import Billing from './components/Billing';

import Statistics from './views/Statistics';
import DailyBusDatas from './components/DailyBusDatas';
import Dailydishdata from './components/Dailydishdata';
import DailyComprehensive from './components/Dailycomprehensive';
import DailyRecord from './components/DailyRecord';
import TurnJob from './components/TurnJob';
import Dailydayout from './components/Dailydayout';
import Dailyhandle from './components/DailyHandle';
import RefundDishReport from './components/RefundDishReport';
import DishComboReport from './components/DishComboReport';
import PresentDishReport from './components/PresentDishReport';


import More from './views/More';
import UpdateDatas from './components/UpdateDatas';
import SiteSet from './components/SiteSet';
import DownloadApp from './components/DownloadApp';
import SellOutManage from './components/SellOutManage';
import MoreDaily from './components/MoreDaily';
import ComboOrder from './components/ComboOrder';

// import {express} from 'express';
// var app=express();
// app.use('/', require('connect-history-api-fallback')()); // Add
// app.use('/', express.static('./cpx-cashier/src'));

// var server = app.listen(4000, function() {
//   var port = server.address().port;
//   console.log('Open http://localhost:%s', port);
// });


const validate = (next, replace, callback) => {
	const isLoginedIn = !!getCookie('uid');

	if (!isLoginedIn && next.location.pathname != '/login') {
		replace('/login');
	}
	callback();
}

render(
	<Provider store={store}>
		<Router history={history}>
			<Route path="/">
				<IndexRedirect to="/login" />
				<Route component={App}>
					{/** <Route path="/home" component={Home} /> **/}
					<Route path="/cashier" component={Cashier}>
						{/** 选桌子开单/换桌子 */}
						<Route path="/cashier/choosetable" component={ChooseTable} />
						{/** 开单 */}
						<Route path="/cashier/opentable/:tableId/:tableName" component={OpenTable} />
						{/** 点菜 */}
						<Route path="/cashier/ordered" component={Ordered} />
						{/** 退菜 */}
						<Route path="/cashier/modifydishs" component={ModifyDishs} />
						{/** 结账 */}
						<Route path="/cashier/payment(/:isreversed)" component={Payment} /> 
					    {/** 选择套餐 */}
						<Route path="/cashier/comboorder" component={ComboOrder} />
					</Route>
					<Route path="/bill" component={Bill} >
						<Route path="/bill/billing" component={Billing} />	
					</Route>
					<Route path="/statistics" component={Statistics} >
						<Route path="/statistics/daystic" component={DailyBusDatas} />
						<Route path="/statistics/Dailydishdata" component={Dailydishdata} />
						<Route path="/statistics/DailyComprehensive" component={DailyComprehensive} />
						{/** 退菜统计 */}
						<Route path="/statistics/refunddishreport" component={RefundDishReport} />
						{/** 套餐销售统计 */}
						<Route path="/statistics/dishcomboreport"components={DishComboReport} />
						{/** 赠菜统计 */}
						<Route path="/statistics/presentdishreport"components={PresentDishReport} />
						<Route path="/statistics/DailyRecord" component={DailyRecord} />
						<Route path="/statistics/Dailydayout" component={Dailydayout} />
						<Route path="/statistics/Dailyhandle"components={Dailyhandle} />
					</Route>
					<Route path="/more" component={More} >
						<Route path="/more/updatedatas" component={UpdateDatas} />
						<Route path="/more/selloutmanage" component={SellOutManage} />	
						<Route path="/more/siteset" component={SiteSet} />
						<Route path="/more/download" component={DownloadApp} />
						<Route path="/more/TurnJob" component={TurnJob} />
						<Route path='/more/MoreDaily' component={MoreDaily} />
					</Route>
				</Route>
				<Route path="/login" component={Login} />
			</Route>	
		</Router>
	</Provider>,
	document.getElementById('root')
);


