function closePopWindow() {
  var self = this;
  self.window.close();
}

document.getElementById("startCaptureBtn").onclick = function () {
  localStorage.setItem(
    "intervalShotTime",
    document.getElementById("popTimeInterval").value
  );
  localStorage.setItem(
    "intervalShotNum",
    document.getElementById("popTimeScord").value
  );
  localStorage.setItem("intervalShotFlag", "shot");
  closePopWindow();
};

document.getElementById("closeBtn").onclick = function () {
  closePopWindow();
};

document.getElementById("popTimeInterval").value =
  localStorage.getItem("intervalShotTime");
document.getElementById("popTimeScord").value =
  localStorage.getItem("intervalShotNum");
