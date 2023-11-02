var layer = document.querySelector(".layer");
var panoviewer = document.querySelector(".viewer");
var container = document.querySelector(".viewer .container");
var hotspots = Array.prototype.slice.call(document.querySelectorAll(".hotspot"));
var currentPage = "1";

function openLayer(img) { //Open hotspot function
  layer.querySelector("img").src = "https://naver.github.io/egjs-view360/v3/examples/panoviewer/etc/img/" + img;
  layer.style.display = "block";
}
function closeLayer(e) { //Exit hotspot function
  if (e.target === layer) {
    layer.style.display = "none";
  }
}
function toRadian(deg) { //Load image
  return deg * Math.PI / 180;
}
function getHFov(fov) { //Load image
  var rect = container.getBoundingClientRect();
  var width = rect.width;
  var height = rect.height;
  return Math.atan(width / height * Math.tan(toRadian(fov) / 2)) / Math.PI * 360;
}
function rotate(point, deg) { //Load image
  var rad = toRadian(deg);
  var cos = Math.cos(rad);
  var sin = Math.sin(rad);

  return [cos * point[0] - sin * point[1], sin * point[0] + cos * point[1]];
}
function setHotspotOffset(hotspot, viewer) { //Load image
  var oyaw = viewer.getYaw();
  var opitch = viewer.getPitch();
  var yaw = parseFloat(hotspot.getAttribute("data-yaw"));
  var pitch = parseFloat(hotspot.getAttribute("data-pitch"));
  var deltaYaw = yaw - oyaw;
  var deltaPitch = pitch - opitch;

  if (deltaYaw < -180) {
    deltaYaw += 360;
  } else if (deltaYaw > 180) {
    deltaYaw -= 360;
  }
  if (Math.abs(deltaYaw) > 90) {
    hotspot.style.transform = "translate(-200px, 0px)";
    return;
  }
  var radYaw = toRadian(deltaYaw);
  var radPitch = toRadian(deltaPitch);

  var fov = viewer.getFov();
  var hfov = getHFov(fov);

  var rx = Math.tan(toRadian(hfov) / 2);
  var ry = Math.tan(toRadian(fov) / 2);


  var point = [
  Math.tan(-radYaw) / rx,
  Math.tan(-radPitch) / ry];


  // Image rotation compensation
  // The original image is about 10 degrees tilted.
  point = point.map(function (p) {
    return p * Math.cos(15 / 180 * Math.PI);
  });
  point[1] = rotate(point, deltaYaw > 0 ? -10 : 10)[1];

  // point[0] /= 1.05;
  var left = viewer._width / 2 + point[0] * viewer._width / 2;
  var top = viewer._height / 2 + point[1] * viewer._height / 2;

  hotspot.style.transform = "translate(" + left + "px, " + top + "px) translate(-50%, -50%)";
}
function setHotspotOffsets(viewer) { //Load image
  hotspots.filter(function (hotspot) {
    return hotspot.getAttribute("data-page") === currentPage;
  }).forEach(function (hotspot) {
    setHotspotOffset(hotspot, viewer);
  });
}
function load(target, page) { //Next image
  if (currentPage == page) {
    return;
  }
  var yaw = target.getAttribute("data-yaw");
  var pitch = target.getAttribute("data-pitch");

  currentPage = "" + page;

  viewer.lookAt({
    yaw: yaw,
    pitch: pitch,
    fov: 30 },
  500);

  setTimeout(function () {
    panoviewer.setAttribute("data-page", currentPage);
    viewer.setImage("../img/thumbnail" + page + ".jpg", {
      projection: "panorama",
      cubemapConfig: {
        tileConfig: { flipHorizontal: true, rotation: 0 } } });


  }, 500);
}
var viewer = new eg.view360.PanoViewer(container, {
  image: "../img/thumbnail1.jpg",
  useZoom: true,
  projection: "panorama",
  cubemapConfig: {
    tileConfig: { flipHorizontal: true, rotation: 0 } } }).

on("ready", function (e) {
  viewer.lookAt({
    fov: 75 });

  setTimeout(function () {
    viewer.lookAt({
      fov: 75 },
    500);
    setHotspotOffsets(viewer);
  });
}).on("viewChange", function (e) {
  setHotspotOffsets(viewer);
}).on("error", function (e) {
  console.error(e);
});

window.addEventListener("resize", function (e) {
  viewer.updateViewportDimensions();
  setHotspotOffsets(viewer);
});

PanoControls.init(panoviewer, viewer);
PanoControls.showLoading();