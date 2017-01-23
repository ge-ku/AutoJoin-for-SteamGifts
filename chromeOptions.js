document.addEventListener("DOMContentLoaded", function () {
    var thisVersion = 20170123;
    chrome.storage.sync.get({
        lastLaunchedVersion: thisVersion
    }, function(version) {
        if (version.lastLaunchedVersion < thisVersion){
            //this version is old, we need to convert settings to new format:
            var oldFormatSettings;
            chrome.storage.sync.get(null, function(oldSettings){
                oldFormatSettings = oldSettings;
                chrome.storage.sync.clear(function(){
                    chrome.storage.sync.set({
                        InfiniteScrolling: (oldFormatSettings.infiniteScrolling == "true"),
                        ShowPoints: (oldFormatSettings.showPoints == "true"),
                        ShowButtons: (oldFormatSettings.showButtons == "true"),
                        LoadFive: (oldFormatSettings.loadFive == "true"),
                        HideDlc: (oldFormatSettings.hideDlc == 'true'),
                        RepeatIfOnPage: (oldFormatSettings.repeatIfOnPage == 'true'),
                        NightTheme: (oldFormatSettings.nightTheme == 'true'),
                        LevelPriority: (oldFormatSettings.levelPriority == 'true'),
                        LevelPriorityBG: (oldFormatSettings.LevelPriorityBG == 'true'),
                        OddsPriorityBG: (oldFormatSettings.OddsPriorityBG == 'true'),
                        BackgroundAJ: (oldFormatSettings.BackgroundAJ == 'true'),
                        HideEntered: (oldFormatSettings.HideEntered == 'true'),
                        IgnoreGroups: (oldFormatSettings.IgnoreGroups == 'true'),
                        IgnorePinned: (oldFormatSettings.IgnorePinned == 'true'),
                        IgnoreGroupsBG: (oldFormatSettings.IgnoreGroupsBG == 'true'),
                        IgnorePinnedBG: (oldFormatSettings.IgnorePinnedBG == 'true'),
                        HideGroups: (oldFormatSettings.HideGroups == 'true'),
                        PlayAudio: (oldFormatSettings.PlayAudio == 'true'),
                        RepeatHours: parseInt(oldFormatSettings.repeatHours),
                        RepeatHoursBG: parseInt(oldFormatSettings.RepeatHoursBG),
                        PagesToLoad: parseInt(oldFormatSettings.Pagestoload),
                        PagesToLoadBG: parseInt(oldFormatSettings.PagestoloadBG),
                        PageForBG: oldFormatSettings.PageForBG,
                        DelayBG: parseInt(oldFormatSettings.DelayBG),
                        MinLevelBG: parseInt(oldFormatSettings.MinLevelBG),
                        ShowChance: (oldFormatSettings.ShowChance == 'true'),
                        lastLaunchedVersion: thisVersion,
                        LastKnownLevel: parseInt(oldFormatSettings.LastKnownLevel)
                    }, function(){
                        loadSettings();
                    });
                });
            });
        } else {
            loadSettings();
        }
    });
});