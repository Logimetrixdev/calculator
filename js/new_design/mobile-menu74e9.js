jQuery(function($){ 
	$('#mobile_menu > a').click(function () {
		$(this).siblings('ul').slideToggle();
	});
});