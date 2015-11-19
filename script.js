'use strict';

// Utility functions

const $ = (selector, context) => (context || document).querySelector(selector);
const $$ = (selector, context) => (context || document).querySelectorAll(selector);

function on(el, event, cb) {
	if (typeof el === 'string') {
		return on($(el), event, cb);
	}

	el.addEventListener(event, cb);
}

function escapeForRegex(string) {
	return string.replace(/([\/\[\].\\])/g, '\\$1');
}

function getDomain(includeLocalhost) {
	const lmn = 'https?:\\/\\/www\\.lostmy\\.name';
	const local = 'https?:\\/\\/localhost(?::\\d{1,5})?';
	return includeLocalhost ? `(?:${lmn}|${local})` : lmn;
}

function insertBefore(el, before) {
	before.parentNode.insertBefore(el, before);
}



// Handle form

on('form', 'click', onChange);
on('form', 'keyup', onChange);

function onChange() {
	$('#output').value = generateExpression();
}

function generateExpression() {
	let output = '';
	const flags = [];

	if (!$('#flag-i').checked) {
		flags.push('i');
	}

	if ($('#flag-g').checked) {
		flags.push('g');
	}

	if ($('#flag-m').checked) {
		flags.push('m');
	}

	// Handle https://www.lostmy.name
	if ($('#fulldomain').checked) {
		output += '^' + getDomain($('#localhost').checked);
	}

	const path = $('#path').value;

	// Handle locale and /test
	if (path) {
		if ($('#locale').checked) {
			// This check is to avoid conflicting with #fulldomain
			if (!output) {
				output = '^';
			}
			output += '(?:\\/[a-z]{2}(?:\\-[A-Z]{2})?)?';
		}

		output += $('#noescape').checked ? path : escapeForRegex(path);
	}

	// Handle ?foo=bar
	Array.from($$('#query li:not(.addmore)')).forEach(function (item) {
		const key = escapeForRegex($('.key', item).value);
		const value = escapeForRegex($('.value', item).value);

		if (key) {
			output += `(?=.*[?&]${key}=${value}(?:$|&))`;
		}
	});

	// Should never output a comment
	if (!output) {
		output = '(?:)';
	}

	return `/${output}/${flags.join('')}`;
}



// Handle other query addition

on('.addmore a', 'click', function (e) {
	e.preventDefault();

	const filler = this.parentElement.previousElementSibling;

	const newNode = filler.cloneNode(true);
	newNode.classList.remove('filler');

	insertBefore(newNode, filler);
});



// Select all on textarea click

on('#output', 'focus', function () {
	this.select();
});