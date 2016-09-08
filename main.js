function Ads() {
	addDOMEventListener();
}

// bung all our modules on the protoype
Ads.prototype.config = require('./src/js/config');
Ads.prototype.slots = require('./src/js/slots');
Ads.prototype.gpt = require('./src/js/ad-servers/gpt');
Ads.prototype.krux = require('./src/js/data-providers/krux');
Ads.prototype.rubicon = require('./src/js/data-providers/rubicon');
Ads.prototype.admantx = require('./src/js/data-providers/admantx');
Ads.prototype.targeting = require('./src/js/targeting');
Ads.prototype.utils = require('./src/js/utils');
Ads.prototype.api = require('./src/js/data-providers/api-call');

/**
* Initialises the ads library and all sub modules
* @param config {object} a JSON object containing configuration for the current page
*/


Ads.prototype.init = function(options) {
	this.config.init();
	this.config(options);

	// if(!options) { options = {}; }
	const targetingApi = this.config().targetingApi
	if(targetingApi) {
		Promise.all([this.api.fetchData(targetingApi.user), this.api.fetchData(targetingApi.page)])
		.then(response => {

			for(let i = 0; i < response.length; i++){
				let keys = ['user', 'page'];
				let kruxObj = {}
				kruxObj[keys[i]] = this.utils.buildObjectFromArray(response[i].krux.attributes)

				this.targeting.add(this.utils.buildObjectFromArray(response[i].dfp.targeting));
				this.krux.add(kruxObj)
			}

		})
		.then(this.initLibrary(this.config()))
		.catch((e) => console.error(e.stack) );
	} else {
		this.initLibrary(this.config());
	}

	return this;
};

Ads.prototype.initLibrary = function (options) {
	// this.config.init();
	// this.config(config);
	this.slots.init();
	this.gpt.init();
	this.krux.init();
	this.rubicon.init();
	this.admantx.init();
	this.utils.on('debug', this.debug.bind(this));
	this.utils.broadcast('initialised', this);
	removeDOMEventListener();
	return this;

};

const initAll = function() {
	const metas = Array.from(document.getElementsByTagName('meta'));
	const stop = metas.filter(function(meta) {
		return meta.name === 'o-ads-stop';
	});
	/* istanbul ignore else  */
	if (!stop.length) {
		ads.init();
		const slots = Array.from(document.querySelectorAll('.o-ads, [data-o-ads-name]'));
		slots.forEach(ads.slots.initSlot.bind(ads.slots));
	}
};

Ads.prototype.debug = function (){
	let remove = true;
	if (localStorage.getItem('oAds')) {
		remove = false;
	} else {
		localStorage.setItem('oAds', true);
	}
	this.admantx.debug();
	this.gpt.debug();
	this.krux.debug();
	this.slots.debug();
	this.targeting.debug();

	if (remove) {
		localStorage.removeItem('oAds');
	}
};

function addDOMEventListener() {
	document.addEventListener('o.DOMContentLoaded', initAll);
}
function removeDOMEventListener() {
	document.removeEventListener('o.DOMContentLoaded', initAll);
}

const ads = new Ads();
module.exports = ads;
