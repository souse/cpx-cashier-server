(function($) {
	var inputObj = {
		id: 'serverIp',
		value: ''
	};

	$('input[type="text"]').on('focus', function() {
		var $this = $(this);
		var id = $this.attr('id'), value = $this.val();

		inputObj = { id: id, value: value };
	});

	$('.btn-number').on('click', function() {
		var $this = $(this), value = $this.data('val');
		var id = inputObj.id, preValue = inputObj.value;
		var currentValue = preValue + value;

		inputObj['value'] = currentValue;

		$('#' + id).val(currentValue);
	});
	$('#delete').on('click', function() {
		var id = inputObj.id, preValue = inputObj.value;
		var currentValue = preValue.substr(0, preValue.length - 1);

		inputObj['value'] = currentValue;

		$('#' + id).val(currentValue);
	});
	$('#clear').on('click', function() {
		var id = inputObj.id;
		
		inputObj['value'] = '';

		$('#' + id).val('');		
	});

	$('input[name="siteType"]').on('click', function() {
		var $this = $(this);
		var value = $this.val();

		if (value == 0) {//服务器
			$('.app-input').show();	
		} else {
			$('.app-input').hide();	
			$('#comKey, #storeId').val('');
		}	
	});

	$('#cancle').on('click', function() {
		//.NET 退出
	});
	$('#submit').on('click', function() {
		//提交
	});
})(jQuery);