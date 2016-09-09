/* globals QUnit: false: false */

'use strict'; //eslint-disable-line

const fetchMock = require('fetch-mock');

QUnit.module('ads API config', {});

QUnit.skip("tests that no calls have been made to the api", function(assert) {

});

QUnit.test("makes api call to correct user url and adds correct data to targeting", function(assert) {
  const done = assert.async();
	const userJSON = JSON.stringify(this.fixtures.user);

  fetchMock.get('https://ads-api.ft.com/v1/user', userJSON)

  const ads = this.ads.init({
		targetingApi: {
			user: 'https://ads-api.ft.com/v1/user',
    },
    krux: {
      id: '1234'
    }
	});


  // wait for a second as we need that time to fire the krux script
	setTimeout(function() {
    const targeting = ads.targeting.get();
    const config = ads.config();
    const dfp_targeting =  {
          "device_spoor_id": "cis61kpxo00003k59j4xnd8kx",
          "guid": "d1359df2-4fe6-4dd6-bb11-eb4342f352ec",
          "slv": "int",
          "loggedIn": true,
          "gender": "F"
    };
    const krux_targeting =  {
            "user": {
            "device_spoor_id": "cis61kpxo00003k59j4xnd8kx",
            "guid": "d1359df2-4fe6-4dd6-bb11-eb4342f352ec",
            "subscription_level": "int",
            "loggedIn": true,
            "gender": "F"
          }
    };

    Object.keys(dfp_targeting).forEach((key) => {
      assert.equal(dfp_targeting[key], targeting[key], 'the dfp is added as targeting');
    });
    assert.deepEqual(ads.krux.customAttributes.user, krux_targeting.user, 'the krux attributes are correct');
  	done();
	}, 1050);
});

QUnit.test("does not overwrite existing data in user config", function(assert) {
  const done = assert.async();
  const userJSON = JSON.stringify(this.fixtures.user);

  fetchMock.get('https://ads-api.ft.com/v1/user', userJSON)

  const ads = this.ads.init({
    targetingApi: {
      user: 'https://ads-api.ft.com/v1/user',
    },
    dfp_targeting: "custom_key=custom_value",
    krux: {
      id: '1234',
      attributes: {
        user: {
          custom_key: 'custom value'
        }
      }
    }
	});

  // wait for a second as we need that time to fire the krux script
	setTimeout(function() {
		const targeting = ads.targeting.get();
    const config = ads.config();
    const dfp_targeting =  {
          "custom_key": "custom_value",
          "device_spoor_id": "cis61kpxo00003k59j4xnd8kx",
          "guid": "d1359df2-4fe6-4dd6-bb11-eb4342f352ec",
          "slv": "int",
          "loggedIn": true,
          "gender": "F"
    };
    const krux_targeting =  {
          "custom_key": "custom value",
          "device_spoor_id": "cis61kpxo00003k59j4xnd8kx",
          "guid": "d1359df2-4fe6-4dd6-bb11-eb4342f352ec",
          "subscription_level": "int",
          "loggedIn": true,
          "gender": "F"
    };

    Object.keys(dfp_targeting).forEach((key) => {
        assert.equal(dfp_targeting[key], targeting[key], 'the dfp is added as targeting');
    });

    assert.deepEqual(ads.krux.customAttributes.user, krux_targeting, 'the krux attributes are correct');

    done();
	}, 1050);
});

QUnit.test("makes api call to correct page/content url and adds correct data to targeting", function(assert) {
  const done = assert.async();
	const pageJSON = JSON.stringify(this.fixtures.content);

  fetchMock.get('https://ads-api.ft.com/v1/concept/MTI1-U2VjdGlvbnM=', pageJSON)

  const ads = this.ads.init({
		targetingApi: {
			page: 'https://ads-api.ft.com/v1/concept/MTI1-U2VjdGlvbnM='
    },
    krux: {
      id: '1234'
    }
	});


  // wait for a second as we need that time to fire the krux script
	setTimeout(function() {
    const targeting = ads.targeting.get();
    const config = ads.config();
    const dfp_targeting =  {
          "auuid": "13abbe62-70db-11e6-a0c9-1365ce54b926",
          "ad": "ft11,s03,sm01,s05,s04,ft13",
          "ca": "finance,company,business"
    };
    const krux_targeting =  {
      "authors": ["Jung-a Song"],
      "genre": ["News"],
      "primarySection": ["Technology"],
      "specialReports": [],
      "topics": ["Mobile devices", "Batteries"]
    };

    Object.keys(dfp_targeting).forEach((key) => {
      assert.equal(dfp_targeting[key], targeting[key], 'the dfp is added as targeting');
    });

    assert.deepEqual(ads.krux.customAttributes.page, krux_targeting, 'the krux attributes are correct');
  	done();
	}, 1050);
  // expect(withoutAttrs.krux.attributes.page.unitName).to.equal('5887/ft.com/testDfpSite/testDfpZone');


});

QUnit.test("does not overwrite existing data in page config", function(assert) {
  const done = assert.async();
	const userJSON = JSON.stringify(this.fixtures.user);
	const pageJSON = JSON.stringify(this.fixtures.content);

  fetchMock.get('https://ads-api.ft.com/v1/user', userJSON)
  fetchMock.get('https://ads-api.ft.com/v1/concept/MTI1-U2VjdGlvbnM=', pageJSON)

  const ads = this.ads.init({
		targetingApi: {
			user: 'https://ads-api.ft.com/v1/user',
			page: 'https://ads-api.ft.com/v1/concept/MTI1-U2VjdGlvbnM='
    },
    dfp_targeting: "custom_key=custom_value",
    krux: {
      id: '1234',
      attributes: {
        page: {
          custom_key: 'custom_value'
        }
      }
    }
	});


  // wait for a second as we need that time to fire the krux script
	setTimeout(function() {
    const targeting = ads.targeting.get();
    const config = ads.config();
    const dfp_targeting =  {
          "custom_key": "custom_value",
          "auuid": "13abbe62-70db-11e6-a0c9-1365ce54b926",
          "ad": "ft11,s03,sm01,s05,s04,ft13",
          "ca": "finance,company,business"
    };
    const krux_targeting =  {
      "custom_key": "custom_value",
      "authors": ["Jung-a Song"],
      "genre": ["News"],
      "primarySection": ["Technology"],
      "specialReports": [],
      "topics": ["Mobile devices", "Batteries"]
    };

    Object.keys(dfp_targeting).forEach((key) => {
      assert.equal(dfp_targeting[key], targeting[key], 'the dfp is added as targeting');
    });

    assert.deepEqual(ads.krux.customAttributes.page, krux_targeting, 'the krux attributes are correct');
  	done();
	}, 1050);
  // expect(withoutAttrs.krux.attributes.page.unitName).to.equal('5887/ft.com/testDfpSite/testDfpZone');
});