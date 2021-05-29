
if(!window.rho) {
	// Inititalize RateHub namespace
	window.rho = {};
}

(function($) {
	"use strict";
	
	if(rho.Chart)
		return;	// module already initialized
	
	var Chart = {
		'charts': {},
		series: {},
		jsonpCallbacks: {}
	};
	window.rho['Chart'] = Chart;
	
	Chart.jsonpDispatch = function(data) {
		Chart.jsonpCallbacks[data.reflection.id](data);
	};
	
	Chart.fetchData = function(id) {
		var chart = Chart.charts[id];
		var series = Chart.series[id];
		var fields = [];
		var startDate = null;
		var endDate = null;

		if (typeof(chart.options) != 'undefined' && typeof(chart.options.dateRange) != 'undefined') {
			startDate = chart.options.dateRange.start;
			endDate = chart.options.dateRange.end;
		}

		for (var j = 0; j < series.length; j++) {
			if (typeof(series[j].data) == 'string') {
				var field = series[j].data;
				fields.push(field);
			} else {
				Chart.addSeries(chart, series[j]);
			}
		}
		if (fields.length == 0) {
			return;
		}

		if (chart instanceof Highcharts.Chart) {
			chart.redraw();
		}

		var queryString = 'id=' + id + '&callback=rho.Chart.jsonpDispatch&series=' + fields.join('+');
		if (startDate)
			queryString += '&start=' + startDate;
		if (endDate)
			queryString += '&end=' + endDate;
		var url = ratehub.serverUri + '/api/charts?' + queryString;
		(function (id, url) {	// Preserve the original values of i and url in the callback closure
			Chart.jsonpCallbacks[id] = function(data) {
				if(data['error']) {
					return;
				}

				var chart = Chart.charts[id];
				var series = Chart.series[id];
				var dates = data['date'];
				for(var j = 0; j < series.length; j++) {
					try{
						if(typeof(series[j].data) == 'string') {
							var a = series[j].data.split('.', 3);
							var seriesName = a[0] + '-' + a[1];
							var plotData = [];
							if(a.length == 2) {
								// Data for series
								var d = data[seriesName];
								for(var k = 0; k < d.length; k++) {
									if(d[k] !== null)
										plotData.push([dates[k], d[k]]);
								}
							}else{
								// Data for stats
								var stat = a[2];
								plotData.push([dates[0], data.stats[seriesName][stat]]);
								plotData.push([dates[dates.length-1], data.stats[seriesName][stat]]);
							}

							series[j].data = plotData;
							Chart.addSeries(Chart.charts[id], series[j]);
						}
					}catch(e){
						// Ignore
					}
				}
				
				if (chart instanceof Highcharts.Chart) {
					chart.redraw();
				}
			};

			jQuery.ajax({
				url: url,
				type: 'GET',
				dataType: 'script',
				cache: true,
				callback: null,
				data: null});	
		})(id, url);
	};
	
	Chart.addSeries = function(chart, series) {
		if (chart instanceof Highcharts.Chart) {
			chart.addSeries(series, false, true);
		} else {
			chart.series.push(series);
		}
	};
	
	Chart.newChart = function(id, title, options, delayed) {
	
		if(options == 'error' || options === null) {
			return;
		}

		if(typeof(options.chart) == 'undefined') {
			options.chart = {};
		}
		if(typeof(options.title) == 'undefined') {
			options.title = {};
		}
		if(title != null) {
			options.title.text = title;
		}
	
		options.chart.renderTo = id;
	
		var series = options.series;
		options.series = [];

		options.chart.events = {
			load: function() { setTimeout(function() { Chart.fetchData(id); });	}
		};
	
		if (!delayed) {
			var chart = new Highcharts.Chart(options);
		} else {
			var chart = options;
		}

		this.charts[id] = chart;
		this.series[id] = series;		
	};
	
	Chart.renderDelayed = function(chart) {
		if (!(chart instanceof Highcharts.Chart)) {
			var options = chart;
			chart = new Highcharts.Chart(options);
			this.charts[options.chart.renderTo] = chart;
		}
	};
})(jQuery);
