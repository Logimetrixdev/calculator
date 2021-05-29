function calculatorResized() {
	if (typeof(window.adjustWidgetFrame) == 'function')
		window.adjustWidgetFrame({ 'height': $('#payment-calc').height() });
}

jQuery(function($) {
	window.clearSelectedRates = function clearSelectedRates() {
		$("#payment-calc form .mortgage-rate .rate-value, #payment-calc form .mortgage-type td.col4")
			.each(function(index, element) {
				$(element).text("");
			});
		clearPayments();
	};

	window.clearPayments = function clearPayments() {
		$(".ratehub-calc form .total-mortgage-payment td.col4")
			.find(".details").each(function(index, anchor) {
				$(anchor)
					.removeClass('active')
					.find(".amount").text("$-");
			});
	};

	window.updateRate = function updateRate(activeCell, activeIndex, rate) {
		var isCustom = !rate.provider;
		var rateValue = (rate.value / 100).round(4);

		var rateDisplay = activeCell.find(".rate-value");
		setPercentValue(rateDisplay, rateValue);
		rateDisplay.data("rate", rate);
		var logo = activeCell.find("img");
		if (logo.length && !isCustom) {
			logo.attr("src", ratehub.serverUri + rate.provider._logo + "?size=95").attr("title", rate.provider.name).css('display', 'block');
		}

		// Set mortgage type field
		var types = $(".ratehub-calc form .mortgage-type td.col4");
		var type = "";

		if (typeof(rate.description) != 'undefined') {
			type = rate.description;
		} else if(isCustom){
			type = "N/A";
		}
		$(types[activeIndex]).text(type);

		var payments = $(".ratehub-calc form .total-mortgage-payment a.details");
		if (typeof(rate.href) != 'undefined')
			attachRateDetailsDialog($(payments[activeIndex]), rate, null, true);
		else
			detachRateDetailsDialog($(payments[activeIndex]), true);

		$("#payment-calc form .mortgage-rate td.col4").each(function(index, cell) {
			cell = $(cell);
			rateDisplay = cell.find(".rate-value");
			if (cell[0] != activeCell[0] && isNaN(getPercentValue(rateDisplay))) {
				setPercentValue(rateDisplay, rateValue);
				rateDisplay.data("rate", rate);
				if (typeof(type) != 'undefined')
					$(types[index]).text(type);
				if (typeof(rate.href) != 'undefined')
					attachRateDetailsDialog($(payments[index]), rate, null, true);
				else
					detachRateDetailsDialog($(payments[index]), true);
			}
		});
	};

	$(".ratehub-calc form input[name='dp_pc[]']").blur(function(event) {
		var input = $(event.currentTarget);
		if (input.val() != input.data("undoValue"))
			onDownpaymentPercentChanged(event.currentTarget);
	});

	$(".ratehub-calc form input[name='dp_dol[]']").blur(function(event) {
		var input = $(event.currentTarget);
		if (input.val() != input.data("undoValue"))
			onDownpaymentDollarsChanged(event.currentTarget);
	});

	$(".ratehub-calc form select[name='amort[]']").change(function(event) {
		var amort = $(event.currentTarget);
		var newValue = amort.val();
		if (newValue != null && newValue != "" && newValue != "other") {
			amort.data("undoValue", newValue);
			updateAllSelects(newValue);
			updateCalculations();
		} else if (amort.data("undoValue") != null && amort.data("undoValue") != "") {
			amort.val(amort.data("undoValue")).change();
		}
	});

	$(".ratehub-calc form select[name='amort[]']").bind('replaced', function(event, text) {
		$(text).blur( function() {
			updateAllSelects(text.value);
			updateCalculations();
		});
	});

	function updateAllSelects(newValue) {
		$("#payment-calc form select[name='amort[]']").each(function(index, item) {
			item = $(item);
			if (item.val() == null || item.val() == "") {
				if (newValue == "35" && item.find('option[value=35]').attr('disabled') ||
				    newValue == "30" && item.find('option[value=30]').attr('disabled')) {
					item.val("25").change();
					item.data("undoValue", "25");
				} else if (newValue % 5 != 0) {
					if ($(this).select2) {
						$(this).select2('destroy');
					}
					replaceElement(this, newValue);
					updateCalculations();
				} else {
					item.val(newValue).change();
					item.data("undoValue", newValue);
				}
			}
		});
	}

	$(".rh-rate-selector").bind("rateSelected", function () {
		if (!$.colorbox.result)
			return;

		var rate = $.colorbox.result;
		var activeCell = $.colorbox.element().closest("td");
		var activeIndex = $('.ratehub-calc form .mortgage-rate td.col4').index(activeCell);
		updateRate(activeCell, activeIndex, rate);

		// update location when a rate is selected
		if ($("#rs-province").length) {
			var provinceCode = $("#rs-province").val();
			var provinceSelector = $("#rh-calc-province");
			if (provinceCode && provinceSelector.val() != provinceCode) {
				provinceSelector.val(provinceCode).change();
			}
		} else if ($("#rs-location").length) {
			var location = $("#rs-location").select2("data");
			$("#ltt-location").select2('data', location, true);
		}
		updateCalculations();
	});

	$("#freq, #home_type").change(function(event) {
		updateCalculations();
	});

	$("#rh-calc-province").change(function(event) {
		var provinceCode = $(this).val();

		// Update rate selector province
		$("#rs-province").val(provinceCode);
		updateCalculations();
	});

	$("#rh-calc-city").change(function(event) {
		updateCalculations();
	});

	$("#ltt-location").on('select2-selecting', function(event) {
		var location = event.choice;
		var citySlug = location.name;
		if (citySlug) {
			$.cookie('location', location.id, {expires: 365, domain: '.ratehub.ca', path: '/; SameSite=None', secure: true});
		}
		setTimeout(updateCalculations);
		$("#rs-location").select2('data', location);
	});

	$("#fthb").change(function(event) {
		updateCalculations();
	});

	$("#pcp").change(function(event) {
		updateCalculations();
	});

	$("#home_type").change(function(event) {
		updateCalculations();
	});

	function onAskChanged(input) {
		var dpCalculated = ratehub.displayVersion === 1 ? "#a7a7a7" : "#528C94";
		var dpSet = ratehub.displayVersion === 1 ? "#000" : "#0a596b";

		input = $(input);
		var ask = getDollarValue(input);
		if (ask) {
			input.data("askChanged", true);
			setDollarValue(input, ask);

			updateCalculations();
		}
		else if (input.val() == "") {
			updateCalculations();
		} else {
			input.val(input.data("undoValue"));
		}
	}

	function onDownpaymentPercentChanged(input) {
		const isLoap = isRatehubLoap();

		var dpCalculated = ratehub.displayVersion === 1 ? "#a7a7a7" : "#528C94";
		var dpSet = ratehub.displayVersion === 1 ? "#000" : "#0a596b";

		if(isLoap) {
			dpCalculated = ratehub.colors ? ratehub.colors.blueberry : "#000";
			dpSet = ratehub.colors ? ratehub.colors.berry : "#000";
		}

		var input = $(input);

		var percent = input.is("input") ? input.val() : input.text();
		percent = percent.replace("%", "");
		percent = Globalize.parseFloat(percent) / 100;

		if (percent != null && !isNaN(percent)) {
			if (percent < 0.05)
				percent = 0.05;
			else if (percent > 1)
				percent = 1;

			input.data("unrounded", percent);
			setPercentValue(input, percent, "p2");

			input.css("color", dpSet);
			$("#dp_dol" + input.attr("id").charAt(input.attr("id").length - 1)).data("setbyuser", false).css("color", dpCalculated);

			updateCalculations();
		}
		else {
			setPercentValue(input, input.data("undoValue"), "p2");
		}
	}

	function onDownpaymentDollarsChanged(input) {
		const isLoap = isRatehubLoap();

		var dpCalculated = ratehub.displayVersion === 1 ? "#a7a7a7" : "#528C94";
		var dpSet = ratehub.displayVersion === 1 ? "#000" : "#0a596b";

		if(isLoap) {
			dpCalculated = ratehub.colors ? ratehub.colors.blueberry : "#000";
			dpSet = ratehub.colors ? ratehub.colors.berry : "#000";
		}

		input = $(input);
		var dollar = getDollarValue(input);
		if (dollar != null && !isNaN(dollar)) {
			setDollarValue(input, dollar);
			input.data("setbyuser", true).css("color", dpSet);
			$("#dp_pc" + input.attr("id").charAt(input.attr("id").length - 1)).css("color", dpCalculated);
			updateCalculations();
		}
		else {
			input.val(input.data("undoValue"));
		}
	}

	$(".ratehub-calc form").submit(function(event) {
		event.preventDefault();
		/*
		if ($(document.activeElement).is("input[type='text']")) {
			var input = document.activeElement;
			if (input.name == "dp_pc[]")
				onDownpaymentPercentChanged(input);
			else if (input.name == "dp_dol[]")
				onDownpaymentDollarsChanged(input);
			else if (input.name == "ask")
				onAskChanged(input);
		}
		*/
		forceBlur();
	});

	window.forceBlur = function forceBlur() {
		var focused = $(document.activeElement);
		if (focused.is("input[type='text']")) {
			focused.blur();
		}
	};

	$(".ratehub-calc input").focus(function(event) {
		var target = $(event.currentTarget);
		var oldValue = target.data("unrounded") ? target.data("unrounded") : target.val();
		target.data("undoValue", oldValue);
	});

	$(".ratehub-calc form input[name='ask']")
		.blur(function(event) {
			var input = $(event.currentTarget);
			if (input.val() != input.data("undoValue"))
				onAskChanged(event.currentTarget);
		})
		.filter('.focus').focus().end();

	$(".ratehub-calc form input[name='rate_value']")
		.blur(function(event) {
			var input = $(this);
			if (input.val() != input.data("undoValue")) {
				var rate = getPercentValue(input);
				if (rate) {
					setPercentValue(input, rate);
				} else {
					input.val(input.data("undoValue"));
				}
				var activeCell = input.closest("td");
				var activeIndex = $('.ratehub-calc form .mortgage-rate td.col4').index(activeCell);
				updateRate(activeCell, activeIndex, { 'value' : rate * 100 });
				updateCalculations();
			}
		});

	$("#payment-calc .total-mortgage-payment .details a").click(function(event) {
		event.preventDefault();
	});

});
