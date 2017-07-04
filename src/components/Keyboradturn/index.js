import React, { Component, PropTypes } from 'react';

import { Button } from 'antd';

import './index.less';

const keyNumber = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0','.'];

class KeyBoard extends Component {
	constructor(props) {
		super(props);
		this.state = { inputValue: '' }

		this.selectLevel = this.selectLevel.bind(this);
		this.handleBackspace = this.handleBackspace.bind(this);
		this.handleCancle = this.handleCancle.bind(this);
		this.handleClearPay = this.handleClearPay.bind(this);
		this.handleConfirm = this.handleConfirm.bind(this); 
	}

	selectLevel(e, num) {
		e.preventDefault();

		this.props.onPress(num);
	}
	handleBackspace(e) {
		e.preventDefault();
        this.props.onPress(null, 'backspace');
	}

	handleCancle() {
		this.props.handleCancle && this.props.handleCancle();	
	}

	handleClearPay() {
		this.props.handleClearPay && this.props.handleClearPay();	
	}

	handleConfirm() {
		this.props.handleConfirm && this.props.handleConfirm();
	}

	render() {
		return (
			<div className="keyboard-contentturn">
				<div className="keyboard-number">
					{keyNumber.map((num, i) => 
						<Button 
							className="btn-normal" 
							type="default" 
							key={i} 
							onClick={(e) => this.selectLevel(e, num)}
						>
							{num}
						</Button>		
					)}	
				</div>
				<div className="keyboard-operate">
					<i onClick={(e) => this.handleBackspace(e)}></i>
					<Button className="btn-normal btn-back" type="default" onClick={(e) => this.handleBackspace(e)}>.</Button>
				</div>	
			</div>
		)
	}
}

KeyBoard.propTypes = {
	onPress: PropTypes.func.isRequired
};

export default KeyBoard;