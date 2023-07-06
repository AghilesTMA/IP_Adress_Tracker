let map = L.map("map").fitWorld();
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
let locationIcon = L.icon({
  iconUrl: "../images/icon-location.png",
  iconSize: [46, 56],
  iconAnchor: [23, 56],
  popupAnchor: [0, 0],
});

function getCurrPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
async function getInitialCoords() {
  try {
    let initialCoords = await getCurrPosition();
    initialCoords = [
      initialCoords.coords.latitude,
      initialCoords.coords.longitude,
    ];
    map.setView(initialCoords, 15);
    L.marker(initialCoords, { icon: locationIcon, alt: "marker for location" })
      .addTo(map)
      .bindPopup(`You are within ${1000}  meters from this point`)
      .openPopup();
    L.circle(initialCoords, 1000).addTo(map);
  } catch {
    console.error("couldn't find initial location!");
  }
}
getInitialCoords();

map.addEventListener("click", (e) => {
  let popup = L.popup();
  popup
    .setLatLng(e.latlng)
    .setContent(`You clicked the map at ${e.latlng.toString()}`)
    .openOn(map);
});

async function getLocation(apiKey, ipAddress) {
  let response = await fetch(
    `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}&ipAddress=${ipAddress}`
  );
  let data = await response.json();
  return data;
}

let ipPattern =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
let ipInput = document.querySelector(".ipInput");
let inputBtn = document.querySelector(".inputBtn");
let ipAdd = document.querySelector(".ipAddress");
let loc = document.querySelector(".location");
let timeZone = document.querySelector(".timezone");
let isp = document.querySelector(".isp");
let locCash = new Set();

inputBtn.addEventListener("click", () => {
  if (!ipPattern.test(ipInput.value) && ipInput.value != "") {
    ipInput.value = "";
    ipInput.classList.add("notValid");
    ipInput.placeholder = "Your IP Address is not valid";
    setTimeout(() => {
      ipInput.classList.remove("notValid");
      ipInput.placeholder = "Search for any IP Address";
    }, 2000);
  } else {
    getLocation("Your api key", ipInput.value).then( //use your api key here
      (data) => {
        const {
          isp: ispProp,
          ip: ipProp,
          location: {
            lat: latProp,
            lng: lngProp,
            city: cityProp,
            timezone: timeZoneProp,
          },
        } = data;
        ipAdd.innerHTML = ipProp;
        loc.innerHTML = cityProp;
        timeZone.innerHTML = `UTC ${timeZoneProp}`;
        isp.innerHTML = ispProp;

        if (locCash.has(`${latProp},${lngProp}`)) {
          return;
        } else {
          map.setView([latProp, lngProp]);
          L.marker([latProp, lngProp], {
            icon: locationIcon,
            alt: "marker for location",
          })
            .addTo(map)
            .bindPopup(
              `The Adress "${ipProp}" is within ${1000} meters from this point`
            )
            .openPopup();
          L.circle([latProp, lngProp], 1000).addTo(map);
          locCash.add(`${latProp},${lngProp}`);
        }
      }
    );
  }
});
