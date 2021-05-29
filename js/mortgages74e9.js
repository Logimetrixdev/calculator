
/* [ Refinancing ] ---------------------------------------------------------- */

function debt_payments_remaining(principal, annual_rate, compounding_frequency, payment, payment_frequency) {
	var rate = nominal_to_effective(annual_rate, compounding_frequency);
	rate = effective_to_nominal(rate, payment_frequency) / payment_frequency;

	var num = (1 - (principal*rate) / payment);
	if(num <= 0)
		return Infinity;
	return -Math.log(num) / Math.log(1+rate);
}

function payments_remaining(principal, nominal_rate, payment, payment_frequency) {
	return debt_payments_remaining(principal, nominal_rate, 2, payment, payment_frequency);
}

function available_equity (home_value, mtg_value) {
	var max_LTV = 0.80;
	return (home_value*max_LTV)-mtg_value;
}

function days_between(original_mortgage_date, refinance_date) {
	// The number of milliseconds in one day
    var one_day = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = refinance_date.getTime();
    var date2_ms = original_mortgage_date.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms/one_day);
}

function term_remaining(original_mortgage_date, refinance_date) {
	// Days between two days / 365.25, rounded to nearest year
	var days = days_between(original_mortgage_date, refinance_date);
	return Math.round(days/365.25);
}

function get_months_remaining(original_mortgage_date, refinance_date, original_term_length) {
	// Months remaining in term
	var total_months = original_term_length * 12;
	var months_passed = days_between(original_mortgage_date, refinance_date)/(365.25/12);
	var months_remaining = total_months - months_passed;
	return Math.round(months_remaining);
}

function get_pay_periods(payment_frequency) {
	if (payment_frequency === "monthly") {
		return 12;
	} else if (payment_frequency === "semi_monthly") {
		return 12*2;
	} else if (payment_frequency === "weekly") {
		return 52;
	} else if(payment_frequency === "yearly") {
		return 1;
	} else {
		return 52/2;
	}
}

function get_divisor(payment_frequency) {
	if (payment_frequency === "monthly") {
		return 365.25/12;
	} else if (payment_frequency === "semi_monthly") {
		return (365.25/12) *2;
	} else if (payment_frequency === "weekly") {
		return 7;
	} else if(payment_frequency === "yearly") {
		return 365.25;
	} else {
		return 14;
	}
}

function get_i(original_mortgage_rate, payment_frequency) {
	var periods_per_year = get_pay_periods(payment_frequency);
	var effective_rate = nominal_to_effective(original_mortgage_rate, 2);
	var i = effective_to_nominal(effective_rate, periods_per_year);
	return i;
}

function remaining_mortgage_balance(original_balance, annual_rate, payment, payment_frequency, years_passed) {
	var rate = effective_to_nominal(nominal_to_effective(annual_rate, 2), payment_frequency) / payment_frequency;
	var periods_passed = years_passed * payment_frequency;
	var compounding_factor = Math.pow(1+rate, periods_passed);
	var debt_compounded = original_balance * compounding_factor;
	var payments_compounded = payment * (compounding_factor - 1) / rate;
	return debt_compounded - payments_compounded;
}

function get_remaining_mortgage_balance(mortgage_balance, mortgage_rate, original_mortgage_date, refinance_date, payment_frequency, original_term_length) {

	var periods_per_year = get_pay_periods(payment_frequency);
	var days_per_payment = get_divisor(payment_frequency);
	var i = get_i(original_mortgage_rate, payment_frequency);

	var t = days_between(original_mortgage_date, refinance_date) / days_per_payment;
	var n = original_term_length * periods_per_year;

	var t_factor = (1+i)^t -1;
	var n_factor = (1+i)^n - 1;

	return original_mortgage_balance * (1 - t_factor/n_factor);
}

function get_3month_penalty(balance_outstanding, rate) {
	return balance_outstanding * rate * 3/12;
}

/* [ Mortgage principal and payments ] -------------------------------------- */

function annuity_payment(principal, annual_rate, periods_per_year, num_years) {
	var total_payments = periods_per_year * num_years;
	var periodic_rate = annual_rate / periods_per_year;
	var periodic_payment = principal * (periodic_rate + (periodic_rate / (Math.pow(1 + periodic_rate, total_payments) - 1)));

	return periodic_payment;
}

function annuity_present_value(payment, annual_rate, periods_per_year, num_years) {
	var total_payments = periods_per_year * num_years;
	var periodic_rate = annual_rate / periods_per_year;
	var present_value = payment * ((1 - (1 / Math.pow(1 + periodic_rate, total_payments))) / periodic_rate);

	return present_value;
}

function nominal_to_effective(nominal_rate, periods_per_year) {
	var effective_rate = Math.pow(1 + nominal_rate / periods_per_year, periods_per_year) - 1;

	return effective_rate;
}

function effective_to_nominal(effective_rate, periods_per_year) {
	var nominal_rate = periods_per_year * (Math.pow(effective_rate + 1, 1 / periods_per_year) - 1);

	return nominal_rate;
}

function can_mortgage_payment(principal, annual_rate, num_years, periods_per_year, divisor) {
	var effective_rate = nominal_to_effective(annual_rate, 2);
	var nominal_rate = effective_to_nominal(effective_rate, periods_per_year);

	var payment = annuity_payment(principal, nominal_rate, periods_per_year, num_years) / divisor;

	return payment;
}

function can_mortgage_principal_purchase(home_price, downpayment, num_years) {
	var downpayment_percent = null;
	if (downpayment >= 1) {
		downpayment_percent = downpayment / home_price;
	} else if (downpayment > 0) {
		downpayment_percent = downpayment;
		downpayment = home_price * downpayment_percent;
	} else {
		return null;
	}

	if (downpayment_percent.round(4) < 0.05 || (home_price >= 1000000 && downpayment_percent.round(4) < 0.2)) {
		return null;
	}

	var loan_to_value = 1 - downpayment_percent;
	var principal = home_price - downpayment;
	principal = principal + principal * (cmhc_premium(loan_to_value) + cmhc_surcharge(loan_to_value, num_years));

	return principal;
}

function can_mortgage_payment_purchase(home_price, downpayment, annual_rate, num_years, periods_per_year, divisor) {
	var principal = can_mortgage_principal_purchase(home_price, downpayment, num_years);

	if (!periods_per_year) periods_per_year = 12;
	if (!divisor) divisor = 1;

	var payment = can_mortgage_payment(principal, annual_rate, num_years, periods_per_year, divisor);
	return payment;
}

function can_mortgage_principal(payment, annual_rate, num_years, periods_per_year, divisor) {
	var effective_rate = nominal_to_effective(annual_rate, 2);
	var nominal_rate = effective_to_nominal(effective_rate, periods_per_year);

	var principal = annuity_present_value(payment * divisor, nominal_rate, periods_per_year, num_years);

	return principal;
}

/* [ CMHC premium calculations ] -------------------------------------------- */

function cmhc_premium(loan_to_value) {
	if (loan_to_value < 0.0 || loan_to_value.round(4) > 0.95)
		return -1;

	if (loan_to_value.round(4) <= 0.80)
		return 0.0;
	else if (loan_to_value.round(4) <= 0.85)
		return 0.0280;
	else if (loan_to_value.round(4) <= 0.90)
		return 0.0310;
	else if (loan_to_value.round(4) <= 0.95)
		return 0.0400;
}

function cmhc_surcharge(loan_to_value, num_years) {
	if (loan_to_value < 0.0 || loan_to_value > 1.0 || num_years < 1)
		return -1;

	if (loan_to_value.round(4) <= 0.80) {
		return 0.0;
	}
	else {
		if (num_years > 30)
			return 0.004;
		else if (num_years > 25)
			return 0.002;
		else
			return 0.0;
	}
}

function cmhc_rate(loan_to_value, num_years) {
	return cmhc_premium(loan_to_value) + cmhc_surcharge(loan_to_value, num_years);
}

function cmhc_pst(cmhc_amt, province) {
	var tax_rates = { 'SK': 0.06, 'ON': 0.08, 'QC': 0.09 };

	if (typeof(tax_rates[province]) == 'undefined') {
		return 0;
	}

	return cmhc_amt * tax_rates[province];
}

/* [ Amortization table display on calc extensions ] ------------------------ */

function can_amortization_table(principal, annual_rate, num_years, periods_per_year, divisor) {
	if (isNaN(principal) || annual_rate == null || isNaN(num_years) || periods_per_year == null || divisor == null)
		return;

	var periodic_payment = can_mortgage_payment(principal, annual_rate, num_years, periods_per_year, divisor);
	// accelerated
	if (divisor == 2 && periods_per_year == 12) {
		periods_per_year = 26;
	}

	var effective_rate = nominal_to_effective(annual_rate, 2);
	var nominal_rate = effective_to_nominal(effective_rate, periods_per_year);
	var periodic_rate = nominal_rate / periods_per_year;

	var total_periods = num_years * periods_per_year;

	var table = [];

	var balance = principal;
	var annual_payment = 0;
	var annual_interest = 0;
	var annual_principal = 0;

	var done = false;
	for (var i = 1; i <= total_periods && !done; ++i) {
		var interest = balance * periodic_rate;
		var principal = periodic_payment - interest;
		var payment = periodic_payment;
		if (principal > balance) {
			payment -= (principal - balance);
			principal = balance;
			done = true;
		}

		balance -= principal;
		annual_payment += payment;
		annual_interest += interest;
		annual_principal += principal;

		if (i % periods_per_year == 0 || done) {

			if (i == total_periods && balance < 1)
				balance = 0;

			table.push({ 'payment': annual_payment, 'principal': annual_principal, 'interest': annual_interest, 'balance': balance });

			annual_payment = 0;
			annual_interest = 0;
			annual_principal = 0;
		}
	}

	return table;
}

/* [ Affordability calculator ] --------------------------------------------- */

function can_mortgage_affordability(contract_rate, qualifying_rate, num_years, downpayment, annual_income, monthly_living, monthly_finance) {
	var monthly_income = annual_income / 12;

	var gds = 0.39 * monthly_income - monthly_living;
	var tds = 0.44 * monthly_income - (monthly_living + monthly_finance);
	var max_payment = Math.min(gds, tds);

	if (qualifying_rate) {
		var qualifyingAffordability = calculateAffordability(max_payment, contract_rate, qualifying_rate, num_years, downpayment, annual_income, monthly_living, monthly_finance);

		// update payment to use actual rate rather than qualifying rate
		if (qualifyingAffordability) {
			qualifyingAffordability.payment = can_mortgage_payment_purchase(
				qualifyingAffordability.home_price, qualifyingAffordability.downpayment[1], contract_rate, num_years, 12, 1);
		}

		if (qualifyingAffordability) {
			return qualifyingAffordability;
		}
	}

	return calculateAffordability(max_payment, contract_rate, qualifying_rate, num_years, downpayment);

	function calculateAffordability(max_payment, contract_rate, qualifying_rate, num_years, downpayment) {
		var annual_rate = qualifying_rate;
		var principal = can_mortgage_principal(max_payment, annual_rate, num_years, 12, 1);
		var downpayment_percent = null;
		var payment = max_payment;
		var home_value = null;

		var originalDownpayment = downpayment;
		if (originalDownpayment > 0 && originalDownpayment < 1) {
			downpayment_percent = originalDownpayment;
			downpayment = (principal * downpayment_percent) / (1 - downpayment_percent);
		}

		if (downpayment >= 1) {
			home_value = principal + downpayment;
			downpayment_percent = downpayment / home_value;

			// if amortization >25yrs these mortgages are not insurable
			// must use greater of contract rate +2% and qualifying rate and down payment must be at least 20%
			if (num_years > 25 || home_value >= 1000000) {

				// if we could afford a 1M home without the stricter rules then the minimum we can afford is 999K
				var min_value = Number.MIN_VALUE;
				if (num_years <= 25 && home_value >= 1000000) {
					min_value = 999999;
				}

				// update affordability to use contract rate +2%, if >qualifying rate
				if (qualifying_rate < (contract_rate + 0.02)) {
					annual_rate = contract_rate + 0.02;
					principal = can_mortgage_principal(max_payment, annual_rate, num_years, 12, 1);

					// if original downpayment was passed as percent we want to maintain that
					if (originalDownpayment > 0 && originalDownpayment < 1) {
						downpayment_percent = originalDownpayment;
						downpayment = (principal * downpayment_percent) / (1 - downpayment_percent);
					}
					home_value = principal + downpayment;
					downpayment_percent = downpayment / home_value;
				}

				// enforce minimum down of 20%
				if (downpayment_percent.round(4) < 0.2) {
					home_value = downpayment * 5;
					downpayment_percent = 0.2;
					payment = can_mortgage_payment_purchase(home_value, downpayment, annual_rate, num_years, 12, 1);
					principal = home_value - downpayment;

				}

				// if adjusted affordability is less than the minimum established above, use the minimum
				if (home_value < min_value) {
					home_value = min_value;
					payment = can_mortgage_payment_purchase(home_value, downpayment, qualifying_rate, num_years, 12, 1);

					// if original downpayment was passed as percent we want to maintain that
					if (originalDownpayment > 0 && originalDownpayment < 1) {
						downpayment_percent = originalDownpayment;
						downpayment = (principal * downpayment_percent) / (1 - downpayment_percent);
					}
					principal = home_value - downpayment;
					downpayment_percent = downpayment / home_value;
				}
			}

			if (num_years <= 25 && home_value < 1000000) {
				// enforce minimum down between 5% and 7.5% for homes between 500K and 1M
				var min_downpayment = (home_value - 500000) / 10 + 25000;
				if (home_value > 500000 && downpayment < min_downpayment) {
					home_value = (downpayment - 25000) * 10 + 500000;
					payment = can_mortgage_payment_purchase(home_value, downpayment, annual_rate, num_years, 12, 1);
					principal = home_value - downpayment;
					downpayment_percent = downpayment / home_value;
				}

				// minimum down is always 5%
				if (downpayment_percent.round(4) < 0.05) {
					home_value = downpayment * 20;
					downpayment_percent = 0.05;
					payment = can_mortgage_payment_purchase(home_value, downpayment, annual_rate, num_years, 12, 1);
					principal = home_value - downpayment;
				}

				// if cmhc insurance applies, need to figure out the principal that will give the
				// appropriate mortgage amount
				if (downpayment_percent.round(4) < 0.2 && payment >= max_payment) {
					var cmhc_percent = cmhc_rate(1 - downpayment_percent);

					// til i'm not very good at math anymore
					var mortgage = principal;
					downpayment_percent = (1 + cmhc_percent) * downpayment / (mortgage + downpayment + cmhc_percent * downpayment);

					// paying cmhc affects the downpayment percent which can affect the cmhc rate
					var new_cmhc_percent = cmhc_rate(1 - downpayment_percent);
					if (new_cmhc_percent != cmhc_percent) {
						var new_downpayment_percent = (1 + new_cmhc_percent) * downpayment / (mortgage + downpayment + new_cmhc_percent * downpayment);
						if (cmhc_rate(1 - new_downpayment_percent) == new_cmhc_percent) {
							downpayment_percent = new_downpayment_percent;
						}
					}

					principal = downpayment / downpayment_percent - downpayment;
				}
			}
		} else {
			return null;
		}

		var cmhc_percent = cmhc_rate(1 - downpayment_percent, num_years);
		var cmhc = principal * cmhc_percent;
		var adjusted = principal + cmhc;
		var home_value = principal + downpayment;

		return {
			'payment': payment, 'home_price': home_value,
			'downpayment': [downpayment_percent, downpayment], 'mortgage': principal,
			'cmhc': cmhc, 'adjusted': adjusted
		};
	}
}

/* [ Land Transfer Tax calculations and tables ] ---------------------------- */

function provincial_ltt(province, home_price) {
	var functionName = province.toLowerCase() + '_ltt'; 

	// LTT in QC and NS is always municipal
	if (typeof window[functionName] !== 'function' || province === 'QC' || province === "NS") {
		return 0;
	} else {
		return window[functionName](home_price);
	}
}

function municipal_ltt(province, city, home_price) {
	if (province == 'ON' && in_toronto(city)) {
		return to_ltt(home_price);
	} else if (province == 'QC') {
		if (in_montreal(city)) {
			return mtl_ltt(home_price);	
		} else {
			return qc_ltt(home_price);
		}
		
	} else if (province == 'NS') {
		return ns_ltt(home_price, city);
	}

	return 0;
}

var toronto_districts = [
	'toronto', 'east-york', 'north-york', 'york', 'etobicoke', 'scarborough'
];
function in_toronto(city) {
	for (var i = 0; i < toronto_districts.length; i++) {
		var district = toronto_districts[i]
		if (city == district) return true;
	}

	return false;	
}

var montreal_districts = [
	'montreal', 'pierrefonds', 'roxboro', 'saint-laurent', 'lachine', 'lasalle',
	'verdun', 'ville-marie', 'outremont', 'mont-royal', 'st-leonard', 'montreal-nord',
	'anjou'
];
function in_montreal(city) {
	for (var i = 0; i < montreal_districts.length; i++) {
		var district = montreal_districts[i];
		if (city == district) return true;
	}

	return false;
}

function ltt_rebate(province, city, fthb, home_price, pcp) {
	var rebate = 0;

	switch(province) {
		case "BC":
			if (fthb) {
				rebate = bc_rebate(home_price, 'fthb')
			}
			if (pcp) {
				rebate = bc_rebate(home_price, 'pcp'); // override fthb if there is one, larger rebate.
			}
			break;
		case "ON":
			if (fthb) {
				rebate = on_rebate(home_price);
				if (in_toronto(city)) {
					rebate += to_rebate(home_price);
				}
			}
			break;
		case "PE":
			if (fthb) {
				rebate = pe_rebate(home_price);
			}
			break;

		case "QE":
			if (in_montreal(city)) {
				rebate = null;
			}
			break;

		default:
			rebate = 0;
			break;
	}
	return rebate;
}

function total_ltt(home_price, province, city) {
	var total = provincial_ltt(province, home_price) + municipal_ltt(province, city, home_price) - ltt_rebate(province, city, home_price);
	return total;
}

function bc_ltt(home_price) {
	if (home_price > 2000000)
		return (home_price - 2000000) * 0.03 + 38000;
	else if (home_price > 200000)
		return (home_price - 200000) * 0.02 + 2000;

	else
		return home_price * 0.01;
}

function mb_ltt(home_price) {

	if (home_price > 200000)
		return (home_price - 200000) * .02 + 1720;

	else if (home_price > 150000)
		return (home_price - 150000) * 0.015 + 970;

	else if (home_price > 90000)
		return (home_price - 90000) * 0.01 + 370;

	else if (home_price > 30000)
		return (home_price - 30000) * 0.005 + 70;

	else
		return 70;
}

function on_ltt(home_price) {

	if (home_price > 2000000)
		return (home_price - 2000000) * 0.025 + 36475;

	else if (home_price > 400000)
		return (home_price - 400000) * 0.02 + 4475;

	else if (home_price > 250000)
		return (home_price - 250000) * 0.015 + 2225;

	else if (home_price > 55000)
		return (home_price - 55000) * 0.01 + 275;

	else
		return home_price * 0.005;
}

function to_ltt(home_price) {
	return on_ltt(home_price);
}

function qc_ltt(home_price) {
	if (home_price > 250000)
		return (home_price - 250000) * 0.015 + 2250;

	else if (home_price > 50000)
		return (home_price - 50000) * 0.01 + 250;

	else
		return home_price * 0.005;
}

function mtl_ltt(home_price) {
	if (home_price > 1000000)
		return qc_ltt(home_price) + (home_price - 1000000) * 0.01 + 2500;

	if (home_price > 500000)
		return qc_ltt(home_price) + (home_price - 500000) * 0.005;

	return qc_ltt(home_price);
}

function nb_ltt(home_price){
	return home_price * 0.01;
}

function pe_ltt(home_price) {

	if (home_price > 30000)
		return home_price * 0.01;

	else
		return 0;
}

function nl_ltt(home_price) {

	if (home_price > 500)
		return (home_price - 500) * 0.004 + 100;

	else
		return 100;
}

ns_ltt_table = {
	'annapolis-county': 0.015,
	'antigonish-county': 0.01,
	'colchester-county': 0.01,
	'cumberland-county': 0.015,
	'guysborough-county': 0.01,
	'inverness-county': 0.015,
	'lunenburg-county': 0.01,
	'pictou-county': 0.01,
	'richmond-county': 0.01,
	'kings-county': 0,
	'shelburne-county': 0.015,
	'victoria-county': 0.01,
	'yarmouth-county': 0.01,

	'barrington-district': 0,
	'digby-district': 0.01,
	'lunenburg-district': 0.0125,
	'west-hants-district': 0.01,
	'east-hants-district': 0.015,
	'st-marys-district': 0.0075,

	'cape-breton': 0.015,
	'halifax': 0.015,
	'queens': 0.01,
	
	'advocate-harbour': 'cumberland-county',
	'amherst': 0.0125,
	'annapolis-royal': 'annapolis-county',
	'antigonish': 0.015,
	'argyle': 'yarmouth-county',
	'arichat': 'richmond-county',
	'aylesford': 'kings-county',
	'baddeck': 'victoria-county',
	'bass-river': 'colchester-county',
	'bear-river': 'annapolis-county',
	'berwick': 0.015,
	'blandford': 'lunenburg-county',
	'boisdale': 'cape-breton',
	'boularderie': 'victoria-county',
	'bridgetown': 'annapolis-county',
	'bridgewater': 'lunenburg-county',
	'brookfield': 'colchester-county',
	'canning': 'kings-county',
	'canso': 0.005,
	'caribou': 'pictou-county',
	'carleton': 'yarmouth-county',
	'chelsea': 'lunenburg-district',
	'chester': 'lunenburg-county',
	'cheticamp': 'inverness-county',
	'cheverie': 'west-hants-district',
	'clarks-harbour': 0.01,
	'clarksville': 'east-hants-district',
	'collingwood-corner': 'cumberland-county',
	'dartmouth': 'halifax',
	'debert': 'colchester-county',
	'digby': 0.0125,
	'dingwall': 'victoria-county',
	'dundee': 'richmond-county',
	'east-bay': 'cape-breton',
	'ecum-secum': 'guysborough-county',
	'elmsdale': 'east-hants-district',
	'freeport': 'digby-district',
	'french-village': 'halifax',
	'gabarus': 'cape-breton',
	'glace-bay': 'cape-breton',
	'goldboro': 'guysborough-county',
	'goshen': 'guysborough-county',
	'grand-etang': 'inverness-county',
	'grand-lake': 'halifax',
	'grand-narrows': 'cape-breton',
	'great-village': 'colchester-county',
	'greenwood': 'kings-county',
	'guysborough': 'guysborough-county',
	'hantsport': 0,
	'heatherton': 'antigonish-county',
	'hopewell': 'pictou-county',
	'hubbards': 'halifax',
	'ingonish': 'victoria-county',
	'inverness': 'inverness-county',
	'kennetcook': 'east-hants-district',
	'kentville': 0,
	'kenzieville': 'pictou-county',
	'ketch-harbour': 'halifax',
	'kingston': 'kings-county',
	'lardoise': 'richmond-county',
	'lahave': 'lunenburg-county',
	'lake-charlotte': 'halifax',
	'larrys-river': 'guysborough-county',
	'lawrencetown': 'halifax',
	'liverpool': 'queens',
	'lockeport': 0.015,
	'louisbourg': 'cape-breton',
	'louisdale': 'richmond-county',
	'lunenburg': 'lunenburg-county',
	'mabou': 'inverness-county',
	'maccan': 'cumberland-county',
	'mahone-bay': 'lunenburg-county',
	'maitland': 'east-hants-district',
	'margaree-forks': 'inverness-county',
	'marion-bridge': 'cape-breton',
	'melrose': 'st-marys-district',
	'merigomish': 'pictou-county',
	'meteghan': 'digby-county',
	'middleton': 'annapolis-county',
	'monastery': 'antigonish-county',
	'mount-uniacke': 'east-hants-district',
	'mulgrave': 'guysborough-county',
	'musquodoboit-harbour': 'halifax',
	'new-germany': 'lunenburg-county',
	'new-glasgow': 'pictou-county',
	'new-ross': 'lunenbury-county',
	'new-waterford': 'cape-breton',
	'noel': 'east-hants-district',
	'north-sydney': 'cape-breton',
	'oxford': 0,
	'parrsboro': 0.01,
	'peggys-cove': 'halifax',
	'pictou': 'pictou-county',
	'port-bickerton': 'st-marys-district',
	'port-dufferin': 'halifax',
	'port-greville': 'cumberland-county',
	'port-hawkesbury': 0.005,
	'port-hood': 'inverness-county',
	'port-la-tour': 'barrington-district',
	'port-maitland': 'yarmouth-county',
	'port-morien': 'cape-breton',
	'port-mouton': 'queens',
	'pubnico': 'yarmouth-county',
	'pugwash': 'cumberland-county',
	'queensport': 'guysborough-county',
	'river-hebert': 'cumberland-county',
	'river-john': 'pictou-county',
	'riverport': 'lunenburg-county',
	'salt-spings': 'pictou-county',
	'saulnierville': 'digby-county',
	'shelburne': 0.01,
	'sherbrooke': 'guysborough-county',
	'shubenacadie': 'east-hants-district',
	'southampton': 'cumberland-county',
	'springfield': 'annapolis-county',
	'springhill': 0.005,
	'st-margaret-village': 'cape-breton',
	'st-peters': 'richmond-county',
	'stellarton': 'pictou-county',
	'stewiacke': 'colchester-county',
	'sydney': 'cape-breton',
	'tangier': 'halifax',
	'tatamagouche': 'colchester-county',
	'thorburne': 'pictou-county',
	'trenton': 'pictou-county',
	'truro': 'colchester-county',
	'tusket': 'yarmouth-county',
	'wallace': 'cumberland-county',
	'walton': 'east-hants-district',
	'waverly': 'halifax',
	'wedgeport': 'yarmouth-county',
	'westville': 'pictou-county',
	'weymouth': 'digby-county',
	'whycocomagh': 'inverness-county',
	'windsor': 0.015,
	'wolfville': 0.015,
	'yarmouth': 'yarmouth-county'
};

function ns_ltt(home_price, city) {
	while (ns_ltt_table[city]) {
		var val = ns_ltt_table[city];
		if (typeof(val) == 'number') {
			return val * home_price;
		} else if (typeof(val) == 'string') {
			city = val;
		} else {
			break;
		}
	}
	return 0;
}

function yt_ltt(home_price) {
	if (home_price > 25000)
		return (home_price - 25000) * 0.00025 + 42.75;

	else if (home_price > 10000)
		return (home_price - 10000) * 0.00075 + 31.5;

	else if (home_price > 5000)
		return (home_price - 5000) * 0.002 + 24;

	else if (home_price > 3000)
		return 24;

	else if (home_price > 1000)
		return 13.5;

	else
		return 6;
}

function nt_ltt(home_price) {
	if (home_price > 1000000)
		return (home_price - 1000000) * 0.001 + 1500;
	else
		return home_price * 0.0015;
}

function registration_fee(province, home_price, mortgage_amount) {
	var functionName = province.toLowerCase() + '_registration_fee';
	if (typeof window[functionName] !== 'function') {
		return 0;
	} else {
		return window[functionName](home_price, mortgage_amount);
	}	
}

function ab_registration_fee(home_price, mortgage_amount) {
	if (mortgage_amount == null) return null;

	return (home_price * 0.0002 + 50) + (mortgage_amount ? mortgage_amount * 0.0002 + 50 : 0);
}

function sk_registration_fee(home_price) {
	if (home_price > 8401)
		return home_price * .003;

	else if (home_price >500)
		return 25;

	else
		return 0;
}

function on_rebate(home_price, fthb) {
	if (on_ltt(home_price) > 4000)
		return 4000;

	else
		return on_ltt(home_price);
}

function to_rebate(home_price) {
	if (to_ltt(home_price) > 4475)
		return 4475;

	else
		return to_ltt(home_price);
}

function bc_rebate(home_price, rebate_type) {
	var rebate = 0;

	switch(rebate_type) {
		case "pcp":
			if (home_price > 750000 && home_price < 800000) {
				rebate = (1 - ((home_price - 750000) / 1000) * 0.02) * bc_ltt(home_price);
			}
			else if (home_price <= 750000) {
				rebate = bc_ltt(home_price);
			}
			break;
		case "fthb":
			if (home_price < 500000)
				rebate = bc_ltt(home_price);
			else if (home_price <= 525000)
				rebate = (525000 - home_price) / 25000 * bc_ltt(home_price);
			else
				rebate = 0;
			break;
		default:
			rebate = 0;
			break;
	}
	return rebate;
}

function pe_rebate(home_price) {
	if (home_price <= 200000)
		return pe_ltt(home_price);

	else
		return 0;
}

/* [ Property tax estimates ] ----------------------------------------------- */

function prop_tax(province, city) {

	if (province == "BC")
		return bc_prop_tax(city);

	else if (province == "AB")
		return ab_prop_tax(city);

	else if (province == "SK")
		return sk_prop_tax(city);

	else if (province == "MB")
		return mb_prop_tax(city);

	else if (province == "ON")
		return on_prop_tax(city);

	else if (province == "QC")
		return qc_prop_tax(city);

	else if (province == "NB")
		return nb_prop_tax(city);

	else if (province == "NS")
		return ns_prop_tax(city);

	else if (province == "PE")
		return pe_prop_tax(city);

	else if (province == "NL")
		return nl_prop_tax(city);

	else if (province == "YK")
		return yk_prop_tax(city);

	else if (province == "NT")
		return nt_prop_tax(city);

	else if (province == "NU")
		return nu_prop_tax(city);

	else
		return 0;
}

function bc_prop_tax(city) {

	if (city == "vancouver")
		return 0.0026;

	else
		return 0.0082;
}

function ab_prop_tax(city) {

	if (city == "calgary")
		return 0.0065;

	else
		return 0.0059;
}

function sk_prop_tax(city) {

	if (city == "regina")
		return 0.0093;

	else
		return 0.0164;
}

function mb_prop_tax(city) {

	if (city == "winnipeg")
		return 0.0129;

	else
		return 0.0129;
}

function on_prop_tax(city) {

	if (city == "ajax")
		return 0.0121;

	else if (city == "aurora")
		return 0.0087;

	else if (city == "barrie")
		return 0.01;

	else if (city == "brampton")
		return 0.0107;

	else if (city == "toronto")
		return 0.0066;

	else
		return 0.01;
}

function qc_prop_tax(city) {

	if (city == "montreal")
		return 0.01;

	else
		return 0.0177;
}

function nb_prop_tax(city) {

	if (city == "fredericton")
		return 0.0144;

	else
		return 0.0144;
}

function pe_prop_tax(city) {

	if (city == "charlottetown")
		return 0.01670;

	else
		return 0.01670;
}

function ns_prop_tax(city) {

	if (city == "halifax")
		return 0.0127;

	else
		return 0.0127;
}

function nl_prop_tax(city) {

	if (city == "st-johns")
		return 0.0073;

	else
		return 0.0073;
}

function yk_prop_tax(city) {

	return 0.0126;
}

function nt_prop_tax(city) {

	return 0.0127;
}

function nu_prop_tax(city) {

	return 0.0126;
}

/* [ Income tax calculations ] ---------------------------------------------- */

function income_tax(province, income) {
	return provincial_income_tax(province, income) + federal_income_tax(income);
}

function provincial_income_tax(province, income) {

	if (province == "BC")
		return bc_income_tax(income);

	else if (province == "AB")
		return ab_income_tax(income);

	else if (province == "SK")
		return sk_income_tax(income);

	else if (province == "MB")
		return mb_income_tax(income);

	else if (province == "ON")
		return on_income_tax(income);

	else if (province == "QC")
		return qc_income_tax(income);

	else if (province == "NB")
		return nb_income_tax(income);

	else if (province == "NS")
		return ns_income_tax(income);

	else if (province == "PE")
		return pe_income_tax(income);

	else if (province == "NL")
		return nl_income_tax(income);

	else if (province == "YK")
		return yk_income_tax(income);

	else if (province == "NT")
		return nt_income_tax(income);

	else if (province == "NU")
		return nu_income_tax(income);

	else
		return 0;
}

function federal_income_tax(income) {
	if (income > 128800)
		return (income - 128800) * .29 + 27256.40;

	else if (income > 83088)
		return (income - 83088) * .26 + 15371.28;

	else if (income > 41544)
		return (income - 41544) * .22 + 6231.60;

	else
		return income * .15;
}

function nl_income_tax(income) {

	if (income > 179214)
		return (income - 179214) * .183 + 31004.02;

	else if (income > 128010)
		return (income - 128010) * .173 + 20225.58;

	else if (income > 71701)
		return (income - 71701) * .158 + 10396.64;

	else if (income > 35851)
		return (income - 35851) * .145 + 3119.04;

	else
		return income * .087;
}

function pe_income_tax(income) {

	if (income > 63969)
		return (income - 63969) * .167 + 7548.36;

	else if (income > 31984)
		return (income - 31984) * .138 + 3134.43;

	else
		return income * .098;
}

function ns_income_tax(income) {

	if (income > 150000)
		return (income - 150000) * .21 + 22637;

	else if (income > 93000)
		return (income - 93000) * .175 + 12662;

	else if (income > 59180)
		return (income - 59180) * .1667 + 7025;

	else if (income > 29590)
		return (income - 29590) * .1495 + 2601;

	else
		return income * .0879;
}

function nb_income_tax(income) {

	if (income > 152100)
		return (income - 152100) * .2030 + 27134.64;

	else if (income > 133507)
		return (income - 133507) * .1784 + 22055.36;

	else if (income > 82119)
		return (income - 82119) * .1652 + 12170.04;

	else if (income > 41059)
		return (income - 41059) * .1482 + 3974.51;

	else
		return income * .0968;
}

function on_income_tax(income) {

	if (income > 220000)
		return (income - 220000) * .1316 + 26752;

	else if (income > 150000)
		return (income - 150000) * .1216 + 16740;

	else if (income > 84404)
		return (income - 84404) * .1116 + 7722.97;

	else if (income > 42201)
		return (income - 42201) * .0915 + 2131.15;

	else
		return income * .0505;
}

function mb_income_tax(income) {

	if (income > 68005)
		return (income - 68005) * .174 + 8670.64;

	else if (income > 31465)
		return (income - 31465) * .1275 + 3398.22;

	else
		return income * .1080;
}

function sk_income_tax(income) {

	if (income > 129214)
		return (income - 129214) * .15 + 16797.82;

	else if ( income > 45225)
		return (income - 45225) * .13 + 4974.75;

	else
		return income * .11;
}

function ab_income_tax(income){

	if (income > 303900)
		return (income - 303900) * .15 + 42546;

	else if ( income > 202600)
		return (income - 202600) * .14 + 26338;

	else if ( income > 151950)
		return (income - 151950) * .13 + 18234;

	else if ( income > 126625)
		return (income - 126625) * .12 + 12662.5;

	else
		return income * .10;
}

function bc_income_tax(income){

	if (income > 108460)
		return (income - 108460) * .147 + 13329.73;

	else if (income > 89320)
		return (income - 89320) * .1229 + 9378.6;

	else if (income > 77797)
		return (income - 77797) * .1050 + 5990.37;

	else if (income > 38898)
		return (income - 38898) * .077 + 1968.24;

	else
		return income * .0506;
}

function yk_income_tax(income) {

	if (income > 500000)
		return (income - 500000) * .15 + 64000;

	else if (income > 142353)
		return (income - 142353) * .128 + 15516.48;

	else if (income > 91831)
		return (income - 91831) * .109 + 8264.79;

	else if (income > 45916)
		return (income - 45916) * .09 + 2773.33;

	else
		return income * .0640;
}

function nt_income_tax(income) {

	if (income > 135219)
		return (income - 135219) * .1405 + 16496.72;

	else if (income > 83172)
		return (income - 83172) * .122	+ 7152.79;

	else if (income > 41585)
		return (income - 418585) * .086 + 2453.51;

	else
		return income * .059;
}

function nu_income_tax(income) {

	if (income > 142353)
		return (income - 142353) * .115 + 12811.77;

	else if (income > 87560)
		return (income - 87560) * .09 + 6129.2;

	else if (income > 43780)
		return (income - 43780) * .07 + 1751.2;

	else
		return income * .04;
}

function qc_income_tax(income) {

	if (income > 103915)
		return (income - 103915) * .2575 + 24939.6;

	else if (income > 85405)
		return (income - 85405) * .24 + 17081;

	else if (income > 42705)
		return (income - 42705) * .20 + 6405.75;

	else
		return income * .15;
}

/* [ Utilities estimates ] -------------------------------------------------- */

function utilities_estimate(home_price, heating) {
	if (home_price == null)
		return;

	return heating + heating_estimate(home_price);
}

function heating_estimate(home_price) {
	if (home_price == null)
		return;

	return 0.0025 * home_price / 12;
}

/* [ Useful prototypes & extensions ] --------------------------------------- */

// Number formatting functions
Number.formatFunctions = {count:0};

// Constants useful for controlling the format of numbers in special cases.
Number.prototype.NaN         = 'NaN';
Number.prototype.posInfinity = 'Infinity';
Number.prototype.negInfinity = '-Infinity';

Number.prototype.numberFormat = function(format, context) {
	if (isNaN(this) ) {
		return Number.prototype.NaNstring;
	} else if (this == +Infinity ) {
		return Number.prototype.posInfinity;
	} else if ( this == -Infinity) {
		return Number.prototype.negInfinity;
	} else if (Number.formatFunctions[format] == null) {
		Number.createNewFormat(format);
	}
	return this[Number.formatFunctions[format]](context);
};

Number.createNewFormat = function(format) {
	var funcName = "format" + Number.formatFunctions.count++;
	Number.formatFunctions[format] = funcName;
	var code = "Number.prototype." + funcName + " = function(context){\n";

	// Decide whether the function is a terminal or a pos/neg/zero function
	var formats = format.split(";");
	switch (formats.length) {
		case 1:
				code += Number.createTerminalFormat(format);
				break;
		case 2:
				code += "return (this < 0) ? this.numberFormat(\""
						+ String.escape(formats[1])
						+ "\", 1) : this.numberFormat(\""
						+ String.escape(formats[0])
						+ "\", 2);";
				break;
		case 3:
				code += "return (this < 0) ? this.numberFormat(\""
						+ String.escape(formats[1])
						+ "\", 1) : ((this == 0) ? this.numberFormat(\""
						+ String.escape(formats[2])
						+ "\", 2) : this.numberFormat(\""
						+ String.escape(formats[0])
						+ "\", 3));";
				break;
		default:
				code += "throw 'Too many semicolons in format string';";
				break;
	}
	eval(code + "}");
};

Number.createTerminalFormat = function(format) {
	// If there is no work to do, just return the literal value
	if (format.length > 0 && format.search(/[0#?]/) == -1) {
			return "return '" + String.escape(format) + "';\n";
	}
	// Negative values are always displayed without a minus sign when section
		// separators are used.
	var code = "var val = (context == null) ? new Number(this) : Math.abs(this);\n";
	var thousands = false;
	var lodp = format;
	var rodp = "";
	var ldigits = 0;
	var rdigits = 0;
	var scidigits = 0;
	var scishowsign = false;
	var sciletter = "";
	// Look for (and remove) scientific notation instructions, which can be
		// anywhere
	m = format.match(/\..*(e)([+-]?)(0+)/i);
	if (m) {
			sciletter = m[1];
			scishowsign = (m[2] == "+");
			scidigits = m[3].length;
			format = format.replace(/(e)([+-]?)(0+)/i, "");
	}
	// Split around the decimal point
	var m = format.match(/^([^.]*)\.(.*)$/);
	if (m) {
			lodp = m[1].replace(/\./g, "");
			rodp = m[2].replace(/\./g, "");
	}
	// Look for %
	if (format.indexOf('%') >= 0) {
			code += "val *= 100;\n";
	}
	// Look for comma-scaling to the left of the decimal point
	m = lodp.match(/(,+)(?:$|[^0#?,])/);
	if (m) {
			code += "val /= " + Math.pow(1000, m[1].length) + "\n;";
	}
	// Look for comma-separators
	if (lodp.search(/[0#?],[0#?]/) >= 0) {
			thousands = true;
	}
	// Nuke any extraneous commas
	if ((m) || thousands) {
			lodp = lodp.replace(/,/g, "");
	}
	// Figure out how many digits to the l/r of the decimal place
	m = lodp.match(/0[0#?]*/);
	if (m) {
			ldigits = m[0].length;
	}
	m = rodp.match(/[0#?]*/);
	if (m) {
			rdigits = m[0].length;
	}
	// Scientific notation takes precedence over rounding etc
	if (scidigits > 0) {
			code += "var sci = Number.toScientific(val,"
					+ ldigits + ", " + rdigits + ", " + scidigits + ", " + scishowsign + ");\n"
					+ "var arr = [sci.l, sci.r];\n";
	}
	else {
			// If there is no decimal point, round to nearest integer, AWAY from
			// zero
			if (format.indexOf('.') < 0) {
					code += "val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n";
			}
			// Numbers are rounded to the correct number of digits to the right of
			// the decimal
			code += "var arr = val.round(" + rdigits + ").toFixed(" + rdigits + ").split('.');\n";
			// There are at least "ldigits" digits to the left of the decimal, so
			// add zeros if needed.
			code += "arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "
					+ ldigits + ", '0');\n";
	}
	// Add thousands separators
	if (thousands) {
			code += "arr[0] = Number.addSeparators(arr[0]);\n";
	}
	// Insert the digits into the formatting string. On the LHS, extra digits
		// are copied
	// into the result. On the RHS, rounding has chopped them off.
	code += "arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"
			+ String.escape(lodp.reverse()) + "', true).reverse();\n";
	if (rdigits > 0) {
			code += "arr[1] = Number.injectIntoFormat(arr[1], '" + String.escape(rodp) + "', false);\n";
	}
	if (scidigits > 0) {
			code += "arr[1] = arr[1].replace(/(\\d{" + rdigits + "})/, '$1" + sciletter + "' + sci.s);\n";
	}
	return code + "return arr.join('.');\n";
};

Number.toScientific = function(val, ldigits, rdigits, scidigits, showsign) {
	var result = {l:"", r:"", s:""};
	var ex = "";
	// Make ldigits + rdigits significant figures
	var before = Math.abs(val).toFixed(ldigits + rdigits + 1).trim('0');
	// Move the decimal point to the right of all digits we want to keep,
	// and round the resulting value off
	var after = Math.round(new Number(before.replace(".", "").replace(
			new RegExp("(\\d{" + (ldigits + rdigits) + "})(.*)"), "$1.$2"))).toFixed(0);
	// Place the decimal point in the new string
	if (after.length >= ldigits) {
			after = after.substring(0, ldigits) + "." + after.substring(ldigits);
	}
	else {
			after += '.';
	}
	// Find how much the decimal point moved. This is #places to LODP in the
		// original
	// number, minus the #places in the new number. There are no left-padded
		// zeroes in
	// the new number, so the calculation for it is simpler than for the old
		// number.
	result.s = (before.indexOf(".") - before.search(/[1-9]/)) - after.indexOf(".");
	// The exponent is off by 1 when it gets moved to the left.
	if (result.s < 0) {
			result.s++;
	}
	// Split the value around the decimal point and pad the parts appropriately.
	result.l = (val < 0 ? '-' : '') + String.leftPad(after.substring(0, after.indexOf(".")), ldigits, "0");
	result.r = after.substring(after.indexOf(".") + 1);
	if (result.s < 0) {
			ex = "-";
	}
	else if (showsign) {
			ex = "+";
	}
	result.s = ex + String.leftPad(Math.abs(result.s).toFixed(0), scidigits, "0");
	return result;
};

Number.prototype.round = function(decimals) {
	if (decimals > 0) {
			var m = this.toFixed(decimals + 1).match(
					new RegExp("(-?\\d*)\.(\\d{" + decimals + "})(\\d)\\d*$"));
			if (m && m.length) {
					return new Number(m[1] + "." + String.leftPad(Math.round(m[2] + "." + m[3]), decimals, "0"));
			}
	}
	return this;
};

Number.injectIntoFormat = function(val, format, stuffExtras) {
	var i = 0;
	var j = 0;
	var result = "";
	var revneg = val.charAt(val.length - 1) == '-';
	if ( revneg ) {
			val = val.substring(0, val.length - 1);
	}
	while (i < format.length && j < val.length && format.substring(i).search(/[0#?]/) >= 0) {
			if (format.charAt(i).match(/[0#?]/)) {
					// It's a formatting character; copy the corresponding character
					// in the value to the result
					if (val.charAt(j) != '-') {
							result += val.charAt(j);
					}
					else {
							result += "0";
					}
					j++;
			}
			else {
					result += format.charAt(i);
			}
			++i;
	}
	if ( revneg && j == val.length ) {
			result += '-';
	}
	if (j < val.length) {
			if (stuffExtras) {
					result += val.substring(j);
			}
			if ( revneg ) {
						result += '-';
			}
	}
	if (i < format.length) {
			result += format.substring(i);
	}
	return result.replace(/#/g, "").replace(/\?/g, " ");
};

Number.addSeparators = function(val) {
	return val.reverse().replace(/(\d{3})/g, "$1,").reverse().replace(/^(-)?,/, "$1");
};

if (!String.prototype.reverse) {
	String.prototype.reverse = function() {
		var res = "";
		for (var i = this.length; i > 0; --i) {
			res += this.charAt(i - 1);
		}
		return res;
	};
}

if (!String.prototype.trim) {
	(function() {
		// Make sure we trim BOM and NBSP
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		String.prototype.trim = function() {
			return this.replace(rtrim, '');
		};
	})();
}

String.leftPad = function (val, size, ch) {
	var result = new String(val);
	if (ch == null) {
			ch = " ";
	}
	while (result.length < size) {
			result = ch + result;
	}
	return result;
};

String.escape = function(string) {
	return string.replace(/('|\\)/g, "\\$1");
};

