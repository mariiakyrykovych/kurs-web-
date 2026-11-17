// Форма запису: вибір напряму з картки, перевірка полів, подяка
(function () {
  var form = document.getElementById('signup-form');
  var thanks = document.getElementById('signup-thanks');
  if (!form) return;

  var fields = {
    direction: { input: form.elements.direction, error: document.getElementById('err-direction'), text: 'Оберіть екскурсію або курс.' },
    name: { input: form.elements.name, error: document.getElementById('err-name'), text: 'Вкажіть ім’я.' },
    phone: { input: form.elements.phone, error: document.getElementById('err-phone'), text: 'Вкажіть номер телефону.' },
    consent: { input: form.elements.consent, error: document.getElementById('err-consent'), text: 'Щоб надіслати заявку, дайте згоду на обробку персональних даних.' }
  };

  function isEmpty(input) {
    return input.type === 'checkbox' ? !input.checked : !input.value.trim();
  }

  function setError(field, message) {
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    field.error.textContent = message;
    field.error.hidden = !message;
  }

  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    var clear = function () { setError(field, ''); };
    field.input.addEventListener('input', clear);
    field.input.addEventListener('change', clear);
  });

  document.querySelectorAll('[data-direction]').forEach(function (link) {
    link.addEventListener('click', function () {
      form.hidden = false;
      thanks.hidden = true;
      fields.direction.input.value = link.getAttribute('data-direction');
      Object.keys(fields).forEach(function (key) { setError(fields[key], ''); });
    });
  });

  // Перехід зі сторінки курсів: index.html?course=crs1#signup
  var preset = new URLSearchParams(window.location.search).get('course');
  if (preset && fields.direction.input.querySelector('option[value="' + preset + '"]')) {
    fields.direction.input.value = preset;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var firstInvalid = null;
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      var empty = isEmpty(field.input);
      setError(field, empty ? field.text : '');
      if (empty && !firstInvalid) firstInvalid = field.input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    // TODO: надсилання заявки на сервер — спосіб ще не обрано
    form.hidden = true;
    thanks.hidden = false;
  });
})();

// Перемикач UA / EN у шапці й підвалі показує однаковий стан
(function () {
  var groups = document.querySelectorAll('.lang');
  groups.forEach(function (group) {
    group.querySelectorAll('button').forEach(function (button, index) {
      button.addEventListener('click', function () {
        groups.forEach(function (g) {
          g.querySelectorAll('button').forEach(function (b, i) {
            b.setAttribute('aria-pressed', i === index ? 'true' : 'false');
          });
        });
      });
    });
  });
})();

// Панель «Записатися на екскурсію» на телефоні з'являється після першого екрана
(function () {
  var bar = document.getElementById('mobile-bar');
  var hero = document.querySelector('.hero');
  if (!bar || !hero) return;

  function update() {
    bar.classList.toggle('is-visible', hero.getBoundingClientRect().bottom < 0);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
