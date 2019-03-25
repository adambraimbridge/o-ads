/* eslint valid-jsdoc: 0 */
import config, { init, clear } from './src/js/config';
import slots from './src/js/slots';
import gpt from './src/js/ad-servers/gpt';
import krux from './src/js/data-providers/krux';
import api from './src/js/data-providers/api';
import moat from './src/js/data-providers/moat';
import targeting from './src/js/targeting';
import utils from './src/js/utils';

function Ads() {
	addDOMEventListener();

	if (window && !window.oAds) {
		window.oAds = this;
	}
}

config.init = init;
config.clear = clear;

// bung all our modules on the protoype
Ads.prototype.config = config;
Ads.prototype.slots = slots;
Ads.prototype.gpt = gpt;
Ads.prototype.krux = krux;
Ads.prototype.api = api;
Ads.prototype.moat = moat;
Ads.prototype.targeting = targeting;

Ads.prototype.utils = utils;


/**
* Initialises the ads library and all sub modules
* @param options {object} a JSON object containing configuration for the current page
*/
Ads.prototype.init = function(options) {
	options = options || {};
	this.config.init();
	const configOptions = Object.assign(options, {
		nonPersonalized : !options.disableConsentCookie,
	});
	this.config(configOptions);

	if (options.disableConsentCookie) {
		this.consents = {
			behavioral : true
		};
	}
	else {
		this.consents = getConsents();
	}

	const targetingApi = this.config().targetingApi;
	const validateAdsTraffic = this.config().validateAdsTraffic;

	this.utils.broadcast('startInitialisation');

	// Don't need to fetch anything if no targeting or validateAdsTraffic configured.
	if(!targetingApi && !validateAdsTraffic) {
		return Promise.resolve(this.initLibrary());
	}

	const targetingPromise = targetingApi ? this.api.init(targetingApi, this) : Promise.resolve();
	const validateAdsTrafficPromise = validateAdsTraffic ? this.moat.init() : Promise.resolve();

	/**
	Need to wait for the moat script to load to validate ads
	and the targeting API to return before we initialise the library.
	The targeting values are set on the instance of this.api, therefore
	response is irrelevant
	*/
	return Promise.all([targetingPromise, validateAdsTrafficPromise])
		.then(() => this.initLibrary())
		.catch((e) => {
			// If anything fails, default to load ads without targeting
			this.utils.log.error(e);
			this.utils.log.warn('There was an error with the targeting API or the Moat invalid traffic script. Loading the o-ads library anyway, but the ads may not work as expected...');
			return this.initLibrary();
		});
};

Ads.prototype.updateContext = function(options, isNewPage) {
	this.config(options);

	if(options.targetingApi) {
		this.api.reset();
		return this.api.init(options.targetingApi, this)
			.then(() => {
				this.gpt.updatePageTargeting(this.targeting.get());
				/* istanbul ignore else */
				if(this.config('krux') && this.consents.behavioral) {
					this.krux.setAllAttributes();
					this.krux.sendNewPixel(isNewPage);
				}
			});
	} else {
		return Promise.resolve();
	}

};

Ads.prototype.initLibrary = function() {
	this.slots.init();
	if (this.consents.programmatic) {
		this.config({'nonPersonalized' : false });
		this.targeting.add({"cc" : "y"});
	}
	this.gpt.init();
	this.krux.init(targeting);
	if (this.consents.behavioral) {
		// set krux config option to opt-in /consented
		this.config({'krux': {'consentState' : true}});
	}

	this.utils.on('debug', this.debug.bind(this));
	this.isInitialised = true;
	this.utils.broadcast('initialised', this);
	removeDOMEventListener();
	return this;
};

Ads.prototype.debug = function (){
	let remove = true;
	if (localStorage.getItem('oAds')) {
		remove = false;
	} else {
		localStorage.setItem('oAds', true);
	}
	this.gpt.debug();
	this.krux.debug();
	this.slots.debug();
	this.targeting.debug();

	if (remove) {
		localStorage.removeItem('oAds');
	}
};

Ads.prototype.version = function() {
	this.utils.log.warn('DEPRECATION NOTICE: Ads.version() will be deprecated in favour of Ads.getVersion()');
	this.utils.log(`o-ads version: ${this.utils.getVersion()}`);
};

Ads.prototype.getVersion = function() {
	return this.utils.getVersion();
};

const initAll = function() {
	return ads.init().then(() => {
		const slots = Array.from(document.querySelectorAll('.o-ads, [data-o-ads-name]'));
		slots.forEach(ads.slots.initSlot.bind(ads.slots));
	});
};

Ads.prototype.initAll = initAll;

function getConsents() {
	// derive consent options from ft consent cookie
	const re = /FTConsent=([^;]+)/;
	const match = document.cookie.match(re);
	if (!match) {
		// cookie stasis or no consent cookie found
		return {
			behavioral : false,
			programmatic : false
		};
	}
	const consentCookie = decodeURIComponent(match[1]);
	return {
		behavioral: consentCookie.indexOf('behaviouraladsOnsite:on') !== -1,
		programmatic: consentCookie.indexOf('programmaticadsOnsite:on') !== -1
	};
}

function addDOMEventListener() {
	document.addEventListener('o.DOMContentLoaded', initAll);
}
function removeDOMEventListener() {
	document.removeEventListener('o.DOMContentLoaded', initAll);
}

const ads = new Ads();
export default ads;