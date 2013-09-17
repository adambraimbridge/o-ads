/**
 * Created with JetBrains WebStorm.
 * User: andrew.tekle-cadman
 * Date: 05/04/2013
 * Time: 16:31
 * To change this template use File | Settings | File Templates.
 */

/*jshint strict: false */

/*globals FT, clientAds */

/*members onVisibilityChange, enableVisibilitySupportForOlderBrowsers, pop,
 event, isVisible, type, addEventListener, onblur, onfocus, onfocusin,
 onfocusout, hasOwnProperty, detectPageVisibility, Refresh, refreshTime, runningTimer, log,
  startRefreshTimer, handleW3CVisibility, handleAlentyVisibility, getElementById, innerHTML,
  env,asset, handleRefreshLogic, name, pageVisibilityScope,decorateHandler, pageVisibilityScope,
 refreshDelayMs,pageRefresh,userInteracting,cookie, location,href,reloadWindow,userInteractionTimer,
 reload, PageVisibility, isPageVisible, refreshOnVisibilityChange, preservedRefreshScope */

FT.Refresh = (function () {

    function returnPreservedScope () {
        if (typeof FT.preservedRefreshScope !== "undefined")  {
            return FT.preservedRefreshScope;
        }  else {
            return null;
        }
    }

    return {

        refreshTime: null,
        runningTimer: null,
        refreshDelayMs: 2000,

        /** handle refresh logic migrated from FT.advertising */
        handleRefreshLogic: function (obj, timeout) {
            clientAds.log("FT.Refresh.handleRefreshLogic(" + obj.name + ", " + timeout + ")");
            FT.preservedRefreshScope = this;
            // TODO: no test case for this yet.
            timeout = timeout || 30 * 60 * 1000;  // give it 30 minutes
            if ((obj.name === 'refresh') && (FT.env.asset !== 'story')) {
                this.refreshTime = timeout;
            }
        },

        /** startRefreshTimer logic transferred from FT.advertising namespace */
        startRefreshTimer: function (delay) {
            clientAds.log("FT.Refresh.startRefreshTimer(" + delay + ")");
            var scope = returnPreservedScope() || this;

            this.runningTimer = setTimeout(function () {
                // call doTrackRefresh from Track.js
                clientAds.log("refreshTimer callback()");
                scope.pageRefresh(delay);
            }, delay);
        },

        /**

        /** pageRefresh logic transferred from FT.advertising namespace */
        pageRefresh: function(delay) {
            var scope = returnPreservedScope() || this;
            if (!FT.userInteracting && FT.PageVisibility.isPageVisible()) {
                document.cookie = "TRK_REF=" + window.location.href;
                setTimeout(function () { scope.reloadWindow(false); }, this.refreshDelayMs);
            } else {
                // Kick page refresh timer off again
                scope.userInteractionTimer = setTimeout(function () {
                    scope.pageRefresh(delay);
                }, delay);

            }

        },

        /** reloadWindow logic transferred from FT.advertising namespace */
        reloadWindow: function(b) {
            window.location.reload(b);
        },

        /** handles refresh when visibility changes */
        refreshOnVisibilityChange: function() {
            var scope = returnPreservedScope() || this;
            if (!FT.PageVisibility.isPageVisible()) {
                //now we stop the timer if it is running down
                if (scope.runningTimer !== null){
                    clearTimeout(scope.runningTimer);
                }
                clientAds.log('The page has lost visibility.');
            } else {
                //restart the timer when visibility is regained
                if (scope.refreshTime !== null)  {
                    scope.startRefreshTimer(scope.refreshTime);
                }
                clientAds.log('The page has gained visibility.');
             }
        }

    };

}());



/**
 * Refresh position creative template
 * https://www.google.com/dfp/5887#delivery/CreateCreativeTemplate/creativeTemplateId=10030129
 *
<script type='text/javascript'>
var obj = {
    "name": "%kpos=!;",
    "type": "empty",
    "flight": "%eaid!", // ad ID
    "adId": "%ecid!", // creative ID
    "adName": "refresh adjustment [%Timeout%]"
};

if (window.FT && window.FT.ads) {
    if (FT.ads.breakout) {
        FT.ads.breakout(obj);
    }

    if (window.FT.ads.handleRefreshLogic) {
        FT.ads.handleRefreshLogic(obj, [%Timeout%] * 1000);
    } else if (window.FT.Refresh) {
        FT.Refresh.handleRefreshLogic(obj, [%Timeout%] * 1000);

        // Uncomment the below to turn on refresh when page is visible 
        if (window.FT.PageVisibility) {
            FT.PageVisibility.setAddlFuncOnVisibilityChange(FT.Refresh.refreshOnVisibilityChange);
        }
    }

    if (window.FT.ads.callback) {
       FT.ads.callback(obj);
    }
}
</script>
<img src="[%Image%]">
 */