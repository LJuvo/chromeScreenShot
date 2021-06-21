var startDate;
var timer = null;
var id = 100;

var capturing = false;
chrome.contextMenus.create({
  title: "定时截图",
  contexts: ["all"],
  id: "initCapture",
  documentUrlPatterns: ["http://*/*"],
});
chrome.contextMenus.create({
  title: "单张截图",
  contexts: ["all"],
  id: "initPicture",
  documentUrlPatterns: ["http://*/*"],
});
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "initCapture") {
    initCapture();
  }
  if (info.menuItemId === "initPicture") {
    initPicture();
  }
});

chrome.browserAction.onClicked.addListener(() => {
  initPicture();
});

function initCapture() {
  localStorage.setItem("intervalShotFlag", "");
  localStorage.setItem("intervalShotTime", 2);
  localStorage.setItem("intervalShotNum", 2);
  const winTop = parseInt(screen.availHeight / 2 - 150);
  const winLeft = parseInt(screen.availWidth / 2 - 150);
  const winOptions = {
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    height: 300,
    width: 300,
    top: winTop,
    left: winLeft,
    focused: true,
  };

  chrome.windows.create(winOptions, function (window) {
    chrome.windows.onRemoved.addListener(function (windowId) {
      if (
        window.id === windowId &&
        localStorage.getItem("intervalShotFlag") === "shot"
      ) {
        startDate = new Date();
        startCapture();
      }
    });
  });
}

var screenshot = {
  content: document.createElement("canvas"),
  data: "",
};
function initPicture() {
  chrome.tabs.captureVisibleTab(
    null,
    {
      format: "png",
      quality: 100,
    },
    function (data) {
      screenshot.data = data;
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { ready: "ready" },
            function (response) {
              if (response.download === "download") {
                var image = new Image();
                image.onload = function () {
                  var canvas = screenshot.content;
                  canvas.width = image.width;
                  canvas.height = image.height;
                  var context = canvas.getContext("2d");
                  context.drawImage(image, 0, 0);

                  // save the image
                  var link = document.createElement("a");
                  link.download =
                    "截屏_" +
                    dateFormat("YYYY-mm-dd HH:MM:SS", new Date()) +
                    ".png";
                  link.href = screenshot.content.toDataURL();
                  link.click();
                  screenshot.data = "";
                };
                image.src = screenshot.data;
              } else {
                screenshot.data = "";
              }
            }
          );
        }
      );
    }
  );
}

function startCapture() {
  capturing = true;
  capture_loop();
}

function stopCapture() {
  capturing = false;
}

function capture_loop() {
  const intervalShotTime = localStorage.getItem("intervalShotTime") * 1000;

  if (capturing) {
    capture().then(() => {
      if (capturing) {
        setTimeout(() => {
          if (capturing) {
            capture_loop();
          }
        }, intervalShotTime);
      }
    });
  }
}

function capture() {
  return new Promise((resolve, reject) => {
    fetchScreenShot();
    resolve();
  });
}

function fetchScreenShot() {
  var timeDiff = new Date().getTime() - startDate.getTime();
  const maxNum = localStorage.getItem("intervalShotNum");
  const times = localStorage.getItem("intervalShotTime");
  if (timeDiff > maxNum * times * 1000) {
    stopCapture();
    alert(`截图完成`);
    return;
  }

  chrome.tabs.captureVisibleTab(
    null,
    {
      format: "png",
    },
    function (screenshotUrl) {
      downloadIamge(screenshotUrl);

      chrome.tabs.onUpdated.addListener(function listener(changedProps) {
        if (changedProps.status != "complete") return;

        chrome.tabs.onUpdated.removeListener(listener);
      });
    }
  );
}

function downloadIamge(path) {
  var image = new Image();
  image.setAttribute("crossOrigin", "anonymous");
  image.onload = function () {
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, image.width, image.height);
    var url = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    var event = new MouseEvent("click");

    a.download =
      "定时截屏_" + dateFormat("YYYY-mm-dd HH:MM:SS", new Date()) + ".png";
    a.href = url;
    a.dispatchEvent(event);
  };
  image.src = path;
}

function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
}
