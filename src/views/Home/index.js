import React, { Component, PropTypes } from 'react';

class Home extends Component {
	constructor() {
		super();
	}

	render() {
		return (
			<h6>这是个人信息页面</h6>
		)
	}
}

Home.contextTypes = {
	router: PropTypes.object.isRequired,
	store: PropTypes.object.isRequired
};

export default Home;