// Booking page logic
let currentStep = 1;
let selectedCruise = null;
let selectedCabin = null;

// Initialize booking page
document.addEventListener("DOMContentLoaded", function () {
  // Загружаем круизы в select
  const cruiseSelect = document.getElementById("cruise-select");
  cruises.forEach((cruise) => {
    const option = document.createElement("option");
    option.value = cruise.id;
    option.textContent = `${cruise.title} (${cruise.duration} дней) - от ${formatPrice(cruise.price)}`;
    cruiseSelect.appendChild(option);
  });

  // Проверяем, есть ли ID круиза в URL
  const cruiseId = getCruiseIdFromUrl();
  if (cruiseId) {
    cruiseSelect.value = cruiseId;
    loadCruiseDetails(cruiseId);
  }

  // Устанавливаем минимальную дату (завтра)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  document.getElementById("date-input").min = minDate;

  // Event listeners
  cruiseSelect.addEventListener("change", function () {
    if (this.value) {
      loadCruiseDetails(this.value);
    }
  });

  document.getElementById("next-btn").addEventListener("click", nextStep);
  document.getElementById("back-btn").addEventListener("click", prevStep);

  // Инициализация логики оплаты, если мы на странице бронирования
  initializePaymentLogic();

  // Update summary when inputs change
  document
    .getElementById("adults-input")
    .addEventListener("input", updateSummary);
  document
    .getElementById("children-input")
    .addEventListener("input", updateSummary);
  document
    .getElementById("date-input")
    .addEventListener("change", updateSummary);
});

// Функция для получения изображения каюты по ее типу
function getCabinImage(cabinType) {
  const type = cabinType.toLowerCase();
  if (type.includes("стандарт")) {
    return "./img/standart.jpg";
  }
  if (type.includes("полулюкс")) {
    return "./img/semi.jpg";
  }
  if (type.includes("люкс")) {
    return "./img/lux.jpg";
  }
  return ""; // Возвращаем пустую строку, если изображение не найдено
}
// Load cruise details
function loadCruiseDetails(cruiseId) {
  selectedCruise = getCruiseById(cruiseId);
  if (!selectedCruise) return;

  // Show cabin types
  const cabinTypesContainer = document.getElementById("cabin-types-container");
  const cabinTypesDiv = document.getElementById("cabin-types");
  const cabinImagePreview = document.getElementById("cabin-image-preview");
  const cabinImage = cabinImagePreview.querySelector("img");
  cabinTypesContainer.style.display = "block";

  cabinTypesDiv.innerHTML = selectedCruise.cabinTypes
    .map(
      (cabin, index) => `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 20px; border: 2px solid ${index === 0 ? "#2563eb" : "#d1d5db"}; border-radius: 8px; cursor: pointer; ${index === 0 ? "background: #eff6ff;" : ""}">
            <div style="display: flex; align-items: center; gap: 15px; flex: 1;" data-cabin-image="${getCabinImage(cabin.type)}">
                <input type="radio" name="cabin" value="${index}" ${index === 0 ? "checked" : ""} required style="width: 20px; height: 20px;">
                <div>
                    <div style="font-weight: 600; margin-bottom: 5px;">${cabin.type}</div>
                    <div style="font-size: 14px; color: #6b7280;">${cabin.description}</div>
                </div>
            </div>
            <div style="color: #2563eb; font-weight: 600; font-size: 18px;">
                ${formatPrice(cabin.price)}
            </div>
        </label>
    `,
    )
    .join("");

  // Set default cabin
  selectedCabin = selectedCruise.cabinTypes[0];
  const defaultImage = getCabinImage(selectedCabin.type);
  if (defaultImage) {
    cabinImage.src = defaultImage;
    cabinImagePreview.style.display = "block";
  } else {
    cabinImagePreview.style.display = "none";
  }

  // Add event listeners to cabin radio buttons
  document.querySelectorAll('input[name="cabin"]').forEach((radio, index) => {
    radio.addEventListener("change", function () {
      selectedCabin = selectedCruise.cabinTypes[index];
      const newImage = this.parentElement.dataset.cabinImage;
      cabinImage.src = newImage;
      cabinImagePreview.style.display = newImage ? "block" : "none";
      updateSummary();

      // Update border styling
      document.querySelectorAll('input[name="cabin"]').forEach((r, i) => {
        const label = r.closest("label");
        if (i === index) {
          label.style.borderColor = "#2563eb";
          label.style.background = "#eff6ff";
        } else {
          label.style.borderColor = "#d1d5db";
          label.style.background = "white";
        }
      });
    });
  });

  updateSummary();
}

// Update booking summary
function updateSummary() {
  const summaryDiv = document.getElementById("booking-summary");

  if (!selectedCruise || !selectedCabin) {
    summaryDiv.innerHTML =
      '<p style="color: #6b7280; text-align: center; padding: 40px 0;">Выберите круиз для начала бронирования</p>';
    return;
  }

  const adults = parseInt(document.getElementById("adults-input").value) || 0;
  const children =
    parseInt(document.getElementById("children-input").value) || 0;
  const date = document.getElementById("date-input").value;
  const totalPrice = selectedCabin.price * adults;

  summaryDiv.innerHTML = `
        <div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Круиз</div>
            <div style="font-weight: 600;">${selectedCruise.title}</div>
        </div>

        ${
          date
            ? `
            <div>
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Дата</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>📅</span>
                    <span>${new Date(date).toLocaleDateString("ru-RU")}</span>
                </div>
            </div>
        `
            : ""
        }

        <div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Пассажиры</div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>👥</span>
                <span>${adults} взр. ${children > 0 ? `+ ${children} дет.` : ""}</span>
            </div>
        </div>

        ${
          selectedCabin
            ? `
            <div>
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Каюта</div>
                <div>${selectedCabin.type}</div>
            </div>
        `
            : ""
        }

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280; font-size: 14px;">Стоимость</span>
                <span>${formatPrice(selectedCabin.price)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">Итого</span>
                <span style="font-size: 28px; color: #2563eb; font-weight: 600;">${formatPrice(totalPrice)}</span>
            </div>
        </div>
    `;
}

// Next step
function nextStep() {
  // Validate current step
  if (currentStep === 1) {
    const cruiseSelect = document.getElementById("cruise-select");
    const dateInput = document.getElementById("date-input");
    const cabinInput = document.querySelector('input[name="cabin"]:checked');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня для корректного сравнения
    const selectedDate = new Date(dateInput.value);

    if (!cruiseSelect.value || !dateInput.value || !cabinInput) {
      showNotification("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }

    if (selectedDate < tomorrow) {
      showNotification(
        "Дата отправления не может быть раньше завтрашнего дня",
        "error",
      );
      return;
    }
  } else if (currentStep === 2) {
    const firstname = document.getElementById("firstname-input").value;
    const lastname = document.getElementById("lastname-input").value;
    const email = document.getElementById("email-input").value;
    const phone = document.getElementById("phone-input").value;

    if (!firstname || !lastname || !email || !phone) {
      showNotification("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }
  } else if (currentStep === 3) {
    // Валидация для шага оплаты
    const activePaymentMethod = document.querySelector(".payment-tab.active")
      ?.dataset.method;
    if (activePaymentMethod === "card") {
      const cardNumber = document.getElementById("card-number").value;
      const cardExpiry = document.getElementById("card-expiry").value;
      const cardCvc = document.getElementById("card-cvc").value;

      // Простая проверка на заполненность и базовый формат
      const cardError = document.getElementById("card-error-message");
      if (cardError && cardError.classList.contains("visible")) {
        showNotification(
          "Тип вашей карты не поддерживается. Пожалуйста, используйте Visa, Mastercard или МИР.",
          "error",
        );
        return;
      }

      if (!isValidCardNumber(cardNumber)) {
        showNotification(
          "Номер карты введен неверно. Пожалуйста, проверьте номер.",
          "error",
        );
        return;
      }
      if (cardExpiry.length < 5 || cardCvc.length < 3) {
        showNotification(
          "Пожалуйста, полностью введите срок действия и CVC-код.",
          "error",
        );
        return;
      }
    }
    // Для других методов (SBP, etc.) можно добавить свою валидацию
  }

  if (currentStep < 3) {
    currentStep++;
    updateSteps();
  } else {
    // Submit booking
    submitBooking();
  }
}

// Previous step
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateSteps();
  }
}

// Update step display
function updateSteps() {
  // Hide all steps
  document.getElementById("step1").classList.add("hidden");
  document.getElementById("step2").classList.add("hidden");
  document.getElementById("step3").classList.add("hidden");

  // Show current step
  document.getElementById("step" + currentStep).classList.remove("hidden");

  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const indicator = document.getElementById("step" + i + "-indicator");
    const text = document.getElementById("step" + i + "-text");
    const line = document.getElementById("line" + i);

    if (i < currentStep) {
      indicator.style.background = "#2563eb";
      indicator.style.color = "white";
      text.style.color = "#2563eb";
      text.style.fontWeight = "600";
      if (line) line.style.background = "#2563eb";
    } else if (i === currentStep) {
      indicator.style.background = "#2563eb";
      indicator.style.color = "white";
      text.style.color = "#2563eb";
      text.style.fontWeight = "600";
      if (line) line.style.background = "#d1d5db";
    } else {
      indicator.style.background = "#d1d5db";
      indicator.style.color = "#6b7280";
      text.style.color = "#6b7280";
      text.style.fontWeight = "normal";
      if (line) line.style.background = "#d1d5db";
    }
  }

  // Update buttons
  const backBtn = document.getElementById("back-btn");
  const nextBtn = document.getElementById("next-btn");

  if (currentStep === 1) {
    backBtn.style.display = "none";
    nextBtn.textContent = "Продолжить →";
  } else if (currentStep === 2) {
    backBtn.style.display = "block";
    nextBtn.textContent = "Продолжить →";
  } else if (currentStep === 3) {
    backBtn.style.display = "block";
    nextBtn.textContent = "Оплатить";
  }
}

// Submit booking
function submitBooking() {
  // Hide form and show success message
  document.getElementById("booking-form").style.display = "none";
  document.getElementById("success-message").classList.remove("hidden");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  showNotification("Бронирование успешно оформлено!", "success");
}

// --- Payment Logic ---

function initializePaymentLogic() {
  const cardNumberInput = document.getElementById("card-number");
  const cardExpiryInput = document.getElementById("card-expiry");
  const paymentTabs = document.querySelectorAll(".payment-tab");
  const paymentContents = document.querySelectorAll(".payment-content");

  if (!cardNumberInput) return; // Выходим, если это не страница бронирования

  cardNumberInput.addEventListener("input", (e) => formatCardNumber(e.target));
  cardExpiryInput.addEventListener("input", (e) => formatCardExpiry(e.target));

  // Логика переключения вкладок оплаты
  paymentTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      paymentTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const targetMethod = tab.dataset.method;
      paymentContents.forEach((content) => {
        content.classList.toggle(
          "active",
          content.id === `payment-${targetMethod}`,
        );
      });
    });
  });
}

function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, "");
  let formattedValue = "";
  let cardType = "unknown";

  if (value.startsWith("4")) {
    cardType = "visa";
  } else if (value.match(/^(5[1-5])/)) {
    cardType = "mastercard";
  } else if (value.match(/^(220[0-4])/)) {
    cardType = "mir";
  } else if (value.match(/^(34|37)/)) {
    cardType = "amex";
  }

  const cardTypeIcon = input
    .closest(".card-number-wrapper")
    .querySelector(".card-type-icon");
  if (cardTypeIcon) {
    const cardError = document.getElementById("card-error-message");
    const cardNumberWrapper = input.closest(".card-number-wrapper");
    const cardInput = cardNumberWrapper.querySelector("input");

    // Убедитесь, что у вас есть изображения иконок карт в папке /img/
    // Например: img/visa.svg, img/mastercard.svg, img/mir.svg
    if (cardType !== "unknown") {
      cardTypeIcon.style.backgroundImage = `url("./img/${cardType}.svg")`;
      cardTypeIcon.style.display = "block";
    } else {
      cardTypeIcon.style.backgroundImage = "none";
      cardTypeIcon.style.display = "none";
    }

    // Показываем ошибку, если карта не поддерживается (например, Amex или другая)
    // и номер введен достаточно длинный для определения
    if (
      (cardType === "amex" || (cardType === "unknown" && value.length >= 4)) &&
      cardType !== "visa" &&
      cardType !== "mastercard" &&
      cardType !== "mir"
    ) {
      cardError.textContent = "Принимаются только карты Visa, Mastercard, МИР";
      cardError.classList.add("visible");
    } else {
      cardError.classList.remove("visible");
    }
  }

  // Ограничиваем длину номера карты (стандартно 16, Amex 15)
  const maxLength = cardType === "amex" ? 15 : 16;
  value = value.slice(0, maxLength);

  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += " ";
    }
    formattedValue += value[i];
  }
  input.value = formattedValue;
}

function formatCardExpiry(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 2) {
    // Проверяем, чтобы месяц был корректным (01-12)
    let month = parseInt(value.substring(0, 2), 10);
    if (month > 12) {
      month = 12;
    }
    if (month < 1 && value.length >= 2) {
      month = 1;
    }
    const monthStr = month.toString().padStart(2, "0");

    value = monthStr + value.substring(2, 4);
    value = value.substring(0, 2) + "/" + value.substring(2);
  }
  input.value = value;
}

/**
 * Проверяет номер карты по алгоритму Луна.
 * @param {string} cardNumber - Номер карты для проверки.
 * @returns {boolean} - true, если номер валидный.
 */
function isValidCardNumber(cardNumber) {
  const value = cardNumber.replace(/\D/g, ""); // Удаляем все нецифровые символы

  if (value.length < 13 || value.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  // Идем по строке справа налево
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
