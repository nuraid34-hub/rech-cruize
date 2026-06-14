// Функция для форматирования цены
function formatPrice(price) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
}

// Переход к странице круиза
function goToCruise(cruiseId) {
  window.location.href = `cruise-detail.html?id=${cruiseId}`;
}

// Переход к странице бронирования
function goToBooking(cruiseId) {
  window.location.href = `booking.html?id=${cruiseId}`;
}

// Получение ID из URL
function getCruiseIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Получение круиза по ID
function getCruiseById(id) {
  return cruises.find((cruise) => cruise.id === id);
}

// Получение корабля по ID
function getShipById(id) {
  return ships.find((ship) => ship.id === id);
}

// Сохранение данных в localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Получение данных из localStorage
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Фильтрация круизов
function filterCruises(
  searchQuery,
  selectedRiver,
  selectedDuration,
  selectedPrice,
) {
  return cruises.filter((cruise) => {
    // Поиск по названию и маршруту
    const matchesSearch =
      searchQuery === "" ||
      cruise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cruise.route.toLowerCase().includes(searchQuery.toLowerCase());

    // Фильтр по реке
    const matchesRiver =
      selectedRiver === "all" || cruise.river.includes(selectedRiver);

    // Фильтр по длительности
    let matchesDuration = true;
    if (selectedDuration === "5-7") {
      matchesDuration = cruise.duration >= 5 && cruise.duration <= 7;
    } else if (selectedDuration === "8-10") {
      matchesDuration = cruise.duration >= 8 && cruise.duration <= 10;
    } else if (selectedDuration === "11-14") {
      matchesDuration = cruise.duration >= 11 && cruise.duration <= 14;
    } else if (selectedDuration === "15+") {
      matchesDuration = cruise.duration >= 15;
    }

    // Фильтр по цене
    let matchesPrice = true;
    if (selectedPrice === "0-60000") {
      matchesPrice = cruise.price < 60000;
    } else if (selectedPrice === "60000-100000") {
      matchesPrice = cruise.price >= 60000 && cruise.price <= 100000;
    } else if (selectedPrice === "100000-150000") {
      matchesPrice = cruise.price >= 100000 && cruise.price <= 150000;
    } else if (selectedPrice === "150000+") {
      matchesPrice = cruise.price >= 150000;
    }

    return matchesSearch && matchesRiver && matchesDuration && matchesPrice;
  });
}

const showNotification = (() => {
  // Эта часть выполнится только один раз
  const style = document.createElement("style");
  style.textContent = `
      @keyframes slideIn {
          from { transform: translateX(110%); }
          to { transform: translateX(0); }
      }
      @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(110%); }
      }
  `;
  document.head.appendChild(style);

  // Возвращаем саму функцию, которая будет вызываться
  return function (message, type = "success") {
    const notification = document.createElement("div");
    notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 20px 30px;
          background: ${type === "success" ? "#10b981" : "#ef4444"};
          color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 1001;
          animation: slideIn 0.3s ease-out forwards;
      `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out forwards";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };
})();

// Подсветка активной страницы в навигации
function highlightCurrentPage() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("header nav a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (
      linkPage === currentPage ||
      (currentPage === "" && linkPage === "index.html")
    ) {
      link.classList.add("active");
    }
  });
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  highlightCurrentPage();
});
