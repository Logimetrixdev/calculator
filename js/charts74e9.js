$(function() {
	// Format to machine-friendly integer
	ko.subscribable.fn.int = function() {
		var target = this;
		return ko.computed({
			read: function() {
				return target();
			},
			write: function(newVal) {
				var v = parseInt(newVal, 10);
				if(isNaN(v) || newVal === null) {
					target(null);
				}else{
					target(v);
				}
			}
		});
	};

	var overnightRate = Globalize.localize('overnight-rate');
	var primeRate = Globalize.localize('prime-rate-title');
	var discountedToPrime = Globalize.localize('discounted-to-prime');
	var governmentBondYields = Globalize.localize('government-bond-yields');
	var fixedMortgageRates = Globalize.localize('fixed-mortgage-rates');
	var variableMortgageRates = Globalize.localize('variable-mortgage-rates');
	var helocRates = Globalize.localize('heloc-rates-title');
	var bankOfCanada = Globalize.localize('bank-of-canada');
	var discounted = Globalize.localize('discounted-title');
	var StrYear = Globalize.localize('year');
	var StrYears = Globalize.localize('years');

	var model = new Model();
	var chartTimeoutId;

	ko.applyBindings(model, document.getElementById('chart_configurator'));

	$('a[data-toggle="tab"]').on('shown shown.bs.tab', function (e) {
	  if (e.target == $('a[href$="#get-chart"]')[0] ) {
	  		if (!$('a#copy-snippet').data('zclip')) {
				$('a#copy-snippet').zclip({
					path: '/utilities/ZeroClipboard.swf',
					copy: function() {
						return $('#html_snippet').val();
					},
					afterCopy: animateText
				});
				$('a#copy-snippet').data('zclip', 'initialized');
			}
		}
	});
	$('.continue, .previous').on('click', function(e) {
		e.preventDefault();

		href = $(this).attr('href')
		$(".nav a[href='"+href+"']").tab('show');
	});
	$('.nav.nav-tabs a:last').click(function() {
		displayChart();
	})

	$('#chart_configurator select').chosen({disable_search_threshold: 20});

	$('.dimensions input').keyup(function() { cleanInput($(this)) });
	$('.dimensions input:first').blur(function() { cleanInput($(this), 'width') });
	$('.dimensions input:last').blur(function() { cleanInput($(this), 'height') });

	function cleanInput(selector, input) {
		var value = selector.val().replace(/[^\d]/g, '');
		var value = parseInt(value);
		if (isNaN(value)) value = "";
		if (input == 'width') {
			if(value != "" && value < 300) value = 300
				model.chart_width(value)
		} else if (input == 'height') {
			if (value != "" && value < 200) value = 200
			model.chart_height(value)
		}
		selector.val(value);
	}

	function animateText() {
		var object = $('#html_snippet');
		var o = object.clone().appendTo('body');
		o.css({
			'background': 'none',
			'border': 'none',
			'position': 'absolute',
			'top': object.offset().top,
			'left': object.offset().left
		});
		o.animate({top: '-=40', opacity: 0}, 500, function() { o.remove(); });
	}

	// Knockout Functions
	// Series function holds the information for the data series select fields
	function Series() {
		this.series = [
			{name: overnightRate, terms: null, providers: bankOfCanada, yData: 'boc.overnight-target'},
			{name: primeRate, terms: null, providers: bankOfCanada, yData: 'boc.prime'},
			{name: discountedToPrime, terms: [5], defaultTerm: 5, providers: discounted + ' (Ratehub.ca)', yData: 'best.prime-discount'},
			{name: governmentBondYields, terms: [2,3,5,7,10], defaultTerm: 3, providers: bankOfCanada, yData: "boc.[term]y-bond"},
			{name: fixedMortgageRates, terms: [1,2,3,4,5,6,7,8,9,10], defaultTerm: 5, yData: "[provider].[term]y-fixed[-posted]", providers: {
				1: [discounted + ' (Ratehub.ca)', bankOfCanada + ' (Posted)'],
				2: [discounted + ' (Ratehub.ca)'],
				3: [discounted + ' (Ratehub.ca)', bankOfCanada + ' (Posted)'],
				4: [discounted + ' (Ratehub.ca)'],
				5: [discounted + ' (Ratehub.ca)', bankOfCanada + ' (Posted)'],
				6: [discounted + ' (Ratehub.ca)'],
				7: [discounted + ' (Ratehub.ca)'],
				8: [discounted + ' (Ratehub.ca)'],
				9: [discounted + ' (Ratehub.ca)'],
				10: [discounted + ' (Ratehub.ca)'] }},
			{name: variableMortgageRates, terms: [3,5], defaultTerm: 5, yData: "[provider].[term]y-variable", providers: {
				3: [discounted + ' (Ratehub.ca)'],
				5: [discounted + ' (Ratehub.ca)'] }},
			{name: helocRates, terms: null, providers: discounted + ' (Ratehub.ca)', yData: 'best.heloc'}
		];
		this.chosenSeries = ko.observable(this.series[4]);
		this.chosenTerm = ko.observable(5);
		this.formattedTerm = ko.computed({
			read: function () {
				if (term = this.chosenTerm()) {
					return (term == 1) ? term + " " + StrYear : term + " " + StrYears
				} else {
					return "N/A";
				}
			},
			write: function(value) {
				if (value == "N/A") {
					this.chosenTerm(null);
				} else {
					this.chosenTerm(parseInt(value));
				}
			},
			owner: this
		});
		this.availableTerms = ko.computed(function() {
			if (this.chosenSeries()) {
				var terms = [];
				if (t = this.chosenSeries().terms) {
					for (var i = 0; i < t.length; i++) {
						if (t[i] == 1) {
							terms[i] = '1 ' + StrYear
						} else {
							terms[i] = t[i] + ' ' + StrYears
						}
					};
					return terms;
				} else {
					return ["N/A"];
				}
			}
		}, this);
		this.chosenProvider = ko.observable();
		this.availableProviders = ko.computed(function() {
			if (this.chosenSeries()) {
				if (providers = this.chosenSeries().providers) {
					if (typeof(providers) === 'string') {
						return [this.chosenSeries().providers];
					} else if (term = this.chosenTerm()) {
						return this.chosenSeries().providers[term];
					} else {
						return null;
					}
				} else {
					return null;
				}
			}
		}, this);
		this.yData = ko.computed(function() {
			var x = this.chosenSeries().yData;
			if(provider = this.chosenProvider()) { // Specify the provider
				bocRegex = new RegExp(bankOfCanada + '|BoC')
				if (provider.match(bocRegex)) {
					x = x.replace('[provider]', 'boc')
					x = x.replace('[-posted]', '-posted')
				} else if (provider.match(/Ratehub\.ca/)) {
					x = x.replace('[provider]', 'best')
				} else if (provider.match(/BMO/)) {
					x = x.replace('[provider]', 'bank-of-montreal')
				} else if (provider.match(/CIBC/)) {
					x = x.replace('[provider]', 'cibc')
				} else if (provider.match(/TD/)) {
					x = x.replace('[provider]', 'td-bank')
				} else if (provider.match(/ING/)) {
					x = x.replace('[provider]', 'ing-direct')
				} else if (provider.match(/RBC/)) {
					x = x.replace('[provider]', 'rbc-royal-bank')
				} else if (provider.match(/Scotiabank/)) {
					x = x.replace('[provider]', 'scotiabank')
				} else if (provider.match(/PC Financial/)) {
					x = x.replace('[provider]', 'pc-financial')
				}
			}
			x = x.replace('[term]', this.chosenTerm()) // Specify the Term
			x = x.replace(/(\[.*\])/, '') // Removes anything still in square brackets
			return x;
		}, this);

		this.chosenSeries.subscribe(function(newValue) {
			if (newValue.defaultTerm) this.chosenTerm(newValue.defaultTerm);
			displayChart();
			setTimeout(function() {
				$('select.term, select.provider').trigger('liszt:updated');
			});
		}, this);
		this.chosenTerm.subscribe(function() {
			displayChart();
			setTimeout(function() {
				$('select.provider').trigger('liszt:updated');
			});
		});
		this.chosenProvider.subscribe(displayChart);
	}

	// dataObservable handles the reading and writting of dates input fields and propper formatting
	function dateObservable(date) {
		return ko.computed({
			read: function () {
				year = date().getFullYear();
				month = date().getMonth() + 1;
				dateString = month + "/" + year;
				if (dateString.length == 6) // Adds 0 prefix when necessary
					dateString = "0" + dateString;
				return dateString;
			},
			write: function(value) {
				// value formate must be: mm/yyyy
				var dateArray = value.split('/');
				var newDate = new Date(dateArray[1], dateArray[0] - 1);
				date(newDate);
			}
		});
	}

	// Main Model that holds series, as well as properties for the entire chart
	function Model() {
		this.dataSeries = ko.observableArray([new Series()]);

		this.intervalType = ko.observable('most-recent');

		var currentDate = new Date;
		this.startDate = ko.observable(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
		this.endDate = ko.observable(currentDate);
		this.ongoingEndDate = ko.observable(true);

		this.startYearsAgo = ko.observable(2);
		this.startMonthsAgo = ko.observable(0);

		this.chart_width = ko.observable();
		this.chart_height = ko.observable();
		this.title = ko.observable();
		this.xTitle = ko.observable();
		this.yTitle = ko.observable();
		this.showLegend = ko.observable(true);
		this.subscribe = displayChart;

		this.formattedStartDate = dateObservable(this.startDate);
		this.formattedEndDate = dateObservable(this.endDate);
		this.addSeries = function() {
			var series = new Series()
			this.dataSeries.push(series);
			$('#chart_configurator select').chosen({disable_search_threshold: 20});
		};

		this.removeSeries = function(s) {
			this.dataSeries.remove(s);
		};

		this.selectDropdown = function (value) {
			$('#chart-select').select2('val', value);
		};

		// this.chart_width.subscribe(displayChart);
		// this.chart_height.subscribe(displayChart);

		// Subscrible all the inputs to display the chart
		this.intervalType.subscribe(displayChart);
		this.startYearsAgo.subscribe(displayChart);
		this.startMonthsAgo.subscribe(displayChart);
		this.startDate.subscribe(displayChart);
		this.endDate.subscribe(displayChart);
		this.ongoingEndDate.subscribe(displayChart);
		this.title.subscribe(displayChart);
		this.xTitle.subscribe(displayChart);
		this.yTitle.subscribe(displayChart);
		this.showLegend.subscribe(displayChart);
		this.dataSeries.subscribe(displayChart);

		this.startMonth = ko.computed({
			read: function() {
				var d = this.startDate();
				return d? d.getMonth() + 1 : null;
			},
			write: function(newVal) {
				var d = this.startDate();
				if(d && d.getMonth() + 1 != newVal) {
					d.setMonth(newVal - 1);
					this.startDate.valueHasMutated();
				}
			}
		}, this);
		this.startYear = ko.computed({
			read: function() {
				var d = this.startDate();
				return d? d.getFullYear() : null;
			},
			write: function(newVal) {
				var d = this.startDate();
				if(d && d.getFullYear() != newVal) {
					d.setFullYear(newVal);
					this.startDate.valueHasMutated();
				}
			}
		}, this);
		this.endMonth = ko.computed({
			read: function() {
				var d = this.endDate();
				return d? d.getMonth() + 1 : null;
			},
			write: function(newVal) {
				var d = this.endDate();
				if(d && d.getMonth() + 1 != newVal) {
					d.setMonth(newVal - 1);
					this.endDate.valueHasMutated();
				}
			}
		}, this);
		this.endYear = ko.computed({
			read: function() {
				var d = this.endDate();
				return d? d.getFullYear() : null;
			},
			write: function(newVal) {
				var d = this.endDate();
				if(d && d.getFullYear() != newVal) {
					d.setFullYear(newVal);
					this.endDate.valueHasMutated();
				}
			}
		}, this);

		this.yearList = ko.computed(function() {
			var start = 1935;
			var end = currentDate.getFullYear();
			var ret = [];
			for(var i = start; i <= end; i++)
				ret.push(i);
			return ret;
		});
	}

	function displayChart() {
		clearTimeout(chartTimeoutId);
		chartTimeoutId = setTimeout(function() {

			// Start the params
			var params = { snippet: 'snippet' };

			// Specify the Data Series
			var series = [];
			ko.utils.arrayForEach(model.dataSeries(), function(s) {
				var value = s.yData();
				if(value)
					series.push(value);
			});
			params.series = series.join(' ');

			// Specify the Date Range
			if (model.intervalType() === 'most-recent') {
				params.startMonthsAgo = (parseInt(model.startYearsAgo()) * 12) + parseInt(model.startMonthsAgo());
			} else if (model.intervalType() === 'from-to') {
				params.start = formatDate(model.startDate());
				if(model.endDate() && !model.ongoingEndDate()) {
					params.end = formatDate(model.endDate());
				}
			}

			function formatDate(date) {
				return date.getFullYear() + "-" +  (date.getMonth() + 1) + "-" + date.getDate()
			}

			// Specify the Chart Style
			params.hl = !model.showLegend(); // hl stands for hide legend
			params.title = model.title();
			params.xtitle = model.xTitle();
			params.ytitle = model.yTitle();
			if (model.chart_width() != "")
				params.width = model.chart_width();
			if (model.chart_height() != "")
				params.height = model.chart_height();

			// Make the request for the chart
			$.ajax({
				url: '/widgets/chart.php',
				data: params,
				typr: 'GET',
				success: function(result) {
					result = result.replace(/[\t\r\n]*/g, "");
					updateChart = true;
					if (original_params = $('#html_snippet').val().match(/ratehub_chart_.*?&(.*?)>/)) {
						new_params = result.match(/ratehub_chart_.*?&(.*?)>/)
						updateChart = original_params[1] != new_params[1]
					}

					$('#html_snippet').text(result);
					if (updateChart) {
						// Modify the result by removing width and height for the chart preview
						result = result.replace(/width.*?&/, '');
						result = result.replace(/height.*?&/, '');
						result = result.replace(/top.*?;/, '');
						result = result.replace(/left.*?;/, '');
						$('#chart_preview').html(result);
					}
				}
			});
		}, 50);
	}
});


// this.series = [
// 	{name: overnightRate, terms: null, providers: bankOfCanada, yData: 'boc.overnight-target'},
// 	{name: primeRate, terms: null, providers: bankOfCanada, yData: 'boc.prime'},
// 	{name: 'Discount to prime on 5-year variable', terms: [5], defaultTerm: 5, providers: discounted + ' (RateHub)', yData: 'best.prime-discount'},
// 	{name: governmentBondYields, terms: [2,3,5,7,10], defaultTerm: 3, providers: bankOfCanada, yData: "boc.[term]y-bond"},
// 	{name: fixedMortgageRates, terms: [1,2,3,4,5,6,7,8,9,10], defaultTerm: 5, yData: "[provider].[term]y-fixed[-posted]", providers: {
// 		1: [discounted + ' (RateHub)',bankOfCanada + ' (Posted)', 'BMO','CIBC','TD','ING','RBC','Scotiabank'],
// 		2: [discounted + ' (RateHub)', 'BMO','CIBC','TD','ING','RBC','Scotiabank','PC Financial'],
// 		3: [discounted + ' (RateHub)',bankOfCanada + ' (Posted)', 'BMO','CIBC','TD','ING','RBC','Scotiabank','PC Financial'],
// 		4: [discounted + ' (RateHub)','BMO','CIBC','TD','ING','RBC','Scotiabank','PC Financial'],
// 		5: [discounted + ' (RateHub)',bankOfCanada + ' (Posted)', 'BMO','CIBC','TD','ING','RBC','Scotiabank','PC Financial'],
// 		6: [discounted + ' (RateHub)','BMO','TD','PC Financial'],
// 		7: [discounted + ' (RateHub)','BMO','CIBC','TD','ING','RBC','Scotiabank','PC Financial'],
// 		8: [discounted + ' (RateHub)','PC Financial'],
// 		9: [discounted + ' (RateHub)','PC Financial'],
// 		10: [discounted + ' (RateHub)','BMO','CIBC','TD','ING','RBC','Scotiabank','PC Financial'] }},
// 	{name: variableMortgageRates, terms: [3,5], defaultTerm: 5, yData: "[provider].[term]y-variable", providers: {
// 		3: [discounted + ' (RateHub)'],
// 		5: [discounted + ' (RateHub)','BMO','CIBC','TD','ING','RBC','Scotiabank','PC Financial'] }},
// 	{name: 'HELOC rates', terms: null, providers: discounted + ' (RateHub)', yData: 'best.heloc'}
// ];

