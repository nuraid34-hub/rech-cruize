document.addEventListener("DOMContentLoaded", () => {
  // --- Настройка Supabase ---
  const SUPABASE_URL = "https://bimdhkjomfmajymqktjd.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbWRoa2pvbWZtYWp5bXFrdGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDE2ODksImV4cCI6MjA5MzM3NzY4OX0.Y9RVhufF6c_Y8gvAj0-sc-Cm1e_osCG9mgcdHhcstpo";

  const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // --- Глобальные элементы ---
  const headerAuthControls = document.getElementById("header-auth-controls");

  // --- Глобальные функции ---

  /**
   * Обновляет шапку сайта в зависимости от статуса авторизации.
   * @param {object|null} session - Сессия пользователя от Supabase.
   */
  const updateHeader = (session) => {
    if (!headerAuthControls) return;

    if (session && session.user) {
      // Пользователь вошел в систему
      const userName = session.user.user_metadata?.name || session.user.email;
      headerAuthControls.innerHTML = `
        <span class="user-greeting">Привет, ${userName}!</span>
        <a href="booking.html" class="btn btn-primary">Забронировать</a>
        <button id="logout-btn" class="btn btn-logout">Выйти</button>
      `;
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
    } else {
      // Пользователь не авторизован
      headerAuthControls.innerHTML = `
        <button id="login-btn" class="btn btn-outline">Войти</button>
        <button id="header-book-btn" class="btn btn-primary">Забронировать</button>
      `;
      const loginBtn = document.getElementById("login-btn");
      const bookBtn = document.getElementById("header-book-btn");
      if (loginBtn) loginBtn.addEventListener("click", redirectToLogin);
      if (bookBtn) bookBtn.addEventListener("click", handleBookingClick);
    }
  };

  /**
   * Выполняет выход пользователя из системы.
   */
  const handleLogout = async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) {
      showNotification("Ошибка при выходе: " + error.message, "error");
    } else {
      showNotification("Вы вышли из аккаунта.", "success");
    }
  };

  /**
   * Обрабатывает клик по кнопке "Забронировать".
   * Если пользователь авторизован, переходит на страницу бронирования.
   * Если нет - показывает уведомление и перенаправляет на главную для входа.
   */
  const handleBookingClick = async (event) => {
    event.preventDefault();
    const {
      data: { session },
    } = await _supabase.auth.getSession();

    if (session) {
      window.location.href = "booking.html";
    } else {
      showNotification(
        "Пожалуйста, войдите в аккаунт, чтобы продолжить",
        "error",
      );
      // Через небольшую задержку перенаправляем, чтобы пользователь успел увидеть уведомление
      setTimeout(redirectToLogin, 500);
    }
  };

  /**
   * Перенаправляет на главную страницу с указанием открыть модальное окно.
   */
  const redirectToLogin = () => {
    // Сохраняем текущую страницу, чтобы можно было вернуться (пока не реализовано, но задел на будущее)
    const isIndexPage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.endsWith("/index.html");

    if (isIndexPage) {
      // Если мы на главной, отправляем кастомное событие, чтобы ее собственный скрипт открыл окно
      document.dispatchEvent(new CustomEvent("openAuthModal"));
    } else {
      window.location.href = "index.html#login"; // Иначе, перенаправляем
    }
  };

  // --- Инициализация ---
  _supabase.auth.onAuthStateChange((_event, session) => {
    updateHeader(session);
  });
});
