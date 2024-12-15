// Initialize Map
const map = L.map("map").setView([-7.7709123, 110.3750847], 13);
const addModal = new bootstrap.Modal(document.getElementById("add-location"));
const editModal = new bootstrap.Modal(document.getElementById("edit-location"));
let dataLocation = [];

// Add Tile Layer
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 17,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

map.on("click", (e) => handleMapClick(e));

loadPlaces();

document
  .getElementById("btn-simpan")
  .addEventListener("click", handleSavePlace);

function handleMapClick(event) {
  const { lat, lng } = event.latlng;
  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lng;
  addModal.show();
}

function loadPlaces() {
  const url =
    "https://script.google.com/macros/s/AKfycbyKY5rHRoj_nDfgi_IJSdjKjIZFtvmHrJpcvNDoca4hAYzH91bh2FxbH47P8gbeDwrD1A/exec?sheetName=Map";

  fetch(url)
    .then((response) => response.json())
    .then(({ data }) => {
      dataLocation = data;
      data.forEach(addMarker);
    })
    .catch((error) => console.error("Failed to load places:", error));
}

function addMarker(place) {
  const marker = L.marker([place.latitude, place.longitude]).addTo(map);

  marker.bindPopup(`
   <div class="text-center">
  <div class="mb-2">
    <img src="${place.gambar}" alt="${
    place.nama
  }" style="width: 100px; height: 100px; object-fit: cover;" />
  </div>
  <div>
    <h6>${place.nama}</h6>
    <div class="description-container">
      ${place.deskripsi ? `<p class="text-sm">${place.deskripsi}</p>` : "-"}
    </div>
  </div>
  <div>
    <button class="btn btn-sm btn-warning btn-edit" data-id="${
      place.no
    }">Edit</button>
    <button class="btn btn-sm btn-danger btn-hapus" data-id="${
      place.no
    }">Hapus</button>
  </div>
</div>`);
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-hapus")) {
    const placeId = event.target.dataset.id;
    handleDeletePlace(placeId);
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-edit")) {
    const placeId = event.target.dataset.id;
    handleEditPlace(placeId);
  }
});

function handleSavePlace() {
  addModal.hide();
  const data = collectFormData();
  const url =
    "https://script.google.com/macros/s/AKfycbyKY5rHRoj_nDfgi_IJSdjKjIZFtvmHrJpcvNDoca4hAYzH91bh2FxbH47P8gbeDwrD1A/exec?sheetName=Map";

  fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      const { message } = result;
      resetForm();
      loadPlaces();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: message,
      });
    })
    .catch((error) => {
      console.error("Failed to save place:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save new location.",
      });
    });
}

function collectFormData() {
  return {
    action: "create",
    nama: document.getElementById("nama").value,
    deskripsi: document.getElementById("deskripsi").value,
    alamat: document.getElementById("alamat").value,
    jambuka: document.getElementById("jambuka").value,
    gambar: document.getElementById("gambar").value,
    latitude: document.getElementById("latitude").value,
    longitude: document.getElementById("longitude").value,
  };
}

function collectEditFormData(placeId) {
  return {
    action: "update",
    no: placeId,
    nama: document.getElementById("nama-edit").value,
    deskripsi: document.getElementById("deskripsi-edit").value,
    alamat: document.getElementById("alamat-edit").value,
    jambuka: document.getElementById("jambuka-edit").value,
    gambar: document.getElementById("gambar-edit").value,
    latitude: document.getElementById("latitude-edit").value,
    longitude: document.getElementById("longitude-edit").value,
  };
}

function resetForm() {
  [
    "nama",
    "deskripsi",
    "alamat",
    "jambuka",
    "gambar",
    "latitude",
    "longitude",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
}

function handleDeletePlace(placeId) {
  map.closePopup();
  if (confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) {
    const url =
      "https://script.google.com/macros/s/AKfycbyKY5rHRoj_nDfgi_IJSdjKjIZFtvmHrJpcvNDoca4hAYzH91bh2FxbH47P8gbeDwrD1A/exec?sheetName=Map";

    fetch(url, {
      method: "POST",
      body: JSON.stringify({ action: "delete", no: placeId }),
    })
      .then((response) => response.json())
      .then((result) => {
        const { message } = result;
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: message,
        });
        loadPlaces();
      })
      .catch((error) => {
        console.error("Failed to delete place:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Gagal hapus lokasi.",
        });
      });
  }
}

function handleEditPlace(placeId) {
  map.closePopup();
  const place = dataLocation.find((place) => place.no === Number(placeId));
  if (place) {
    document.getElementById("nama-edit").value = place.nama;
    document.getElementById("deskripsi-edit").value = place.deskripsi;
    document.getElementById("alamat-edit").value = place.alamat;
    document.getElementById("jambuka-edit").value = place.jambuka;
    document.getElementById("gambar-edit").value = place.gambar;
    document.getElementById("latitude-edit").value = place.latitude;
    document.getElementById("longitude-edit").value = place.longitude;
    editModal.show();

    document.getElementById("btn-update").addEventListener("click", () => {
      const formData = collectEditFormData(placeId);
      const url =
        "https://script.google.com/macros/s/AKfycbyKY5rHRoj_nDfgi_IJSdjKjIZFtvmHrJpcvNDoca4hAYzH91bh2FxbH47P8gbeDwrD1A/exec?sheetName=Map";

      fetch(url, {
        method: "POST",
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((result) => {
          const { message } = result;
          editModal.hide();
          loadPlaces();
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: message,
          });
        })
        .catch((error) => {
          console.error("Failed to update place:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Gagal update lokasi.",
          });
        });
    });
  }
}
