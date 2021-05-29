$('#myTab a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

$('#more-reviews').click(function () {
	$('a[href="#reviews"]').tab('show');
});