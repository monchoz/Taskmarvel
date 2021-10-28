document.addEventListener('DOMContentLoaded', function () {
    var tabId;
    const recordButton = document.getElementById("recordBtn");
    recordButton.addEventListener('click', toggleRecording);

    function createTab() {
        chrome.tabs.create({
            url:"taskmarvel.html",
            index: 0
        }, function(newTab) {
            tabId = newTab.id;
            console.log(tabId)
        });
    }

    function toggleRecording() {
        // Avoid creating a duplicate tab
        if (!tabId) createTab();
        else chrome.tabs.reload({ tabId: tabId });
    }
}, false);