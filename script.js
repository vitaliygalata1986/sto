'use strict';

document.body.classList.add('js');

// Navigation remains usable as normal anchors if JavaScript is unavailable.
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(restoreFocus = false) {
  navigation.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Відкрити меню');
  if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Закрити меню' : 'Відкрити меню');
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.header')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
});
window.matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...navigation.querySelectorAll('a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of navLinks) {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-18% 0px -65% 0px', threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}

const filters = [...document.querySelectorAll('[data-filter]')];
const rows = [...document.querySelectorAll('.price-row')];
const checkboxes = [...document.querySelectorAll('.price-row input')];
const formatter = new Intl.NumberFormat('uk-UA');
document.querySelector('.price-filters').hidden = false;

function filterPrices(category) {
  for (const filter of filters) {
    const active = filter.dataset.filter === category;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  }
  for (const row of rows) row.hidden = category !== 'all' && row.dataset.category !== category;
}
filters.forEach((filter) =>
  filter.addEventListener('click', () => filterPrices(filter.dataset.filter)),
);
document.querySelectorAll('[data-category-link]').forEach((link) => {
  link.addEventListener('click', () => filterPrices(link.dataset.categoryLink));
});

// Selected rows stay selected when switching categories. Calculation uses the
// input values in HTML; keep each value in sync with its visible row price.
const selectedServices = () => checkboxes.filter((input) => input.checked);
const selectedTotal = () => selectedServices().reduce((sum, input) => sum + Number(input.value), 0);
const resetButton = document.querySelector('#reset-selection');
const reviewButton = document.querySelector('#review-selection');
reviewButton.hidden = false;

function updateEstimate() {
  const count = selectedServices().length;
  document.querySelector('#estimate-total').textContent = formatter.format(selectedTotal());
  document.querySelector('#selection-count').textContent = count
    ? `Обрано послуг: ${count}`
    : 'Послуги ще не обрані';
  resetButton.hidden = count === 0;
}
checkboxes.forEach((input) => input.addEventListener('change', updateEstimate));
resetButton.addEventListener('click', () => {
  checkboxes.forEach((input) => {
    input.checked = false;
  });
  updateEstimate();
  reviewButton.focus();
});
window.addEventListener('pageshow', updateEstimate);
updateEstimate();

// This build has no backend: a service list is prepared locally, while the
// actual booking is made by telephone. No fake "request sent" state is shown.
const dialog = document.querySelector('#selection-dialog');
const copyButton = document.querySelector('#copy-selection');
const copyStatus = document.querySelector('#copy-status');
const fallback = document.querySelector('#copy-fallback');
reviewButton.addEventListener('click', () => {
  const selected = selectedServices();
  const list = document.querySelector('#dialog-services');
  list.replaceChildren();
  for (const input of selected) {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const price = document.createElement('strong');
    name.textContent = input.dataset.service;
    price.textContent = `від ${formatter.format(Number(input.value))} грн`;
    item.append(name, price);
    list.append(item);
  }
  document.querySelector('#dialog-intro').textContent = selected.length
    ? 'Збережіть список і погодьте деталі візиту телефоном.'
    : 'Послуги ще не обрані. Позначте їх у прайсі або обговоріть потрібні роботи телефоном.';
  document.querySelector('#dialog-total').textContent = selected.length
    ? `Орієнтовно: від ${formatter.format(selectedTotal())} грн`
    : '';
  copyButton.hidden = selected.length === 0;
  copyStatus.textContent = '';
  fallback.hidden = true;
  dialog.showModal();
  document.body.classList.add('dialog-open');
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  )
    dialog.close();
});

// Без підтримки dialog або JavaScript залишається звичайне посилання для дзвінка.
const contactDialog = document.querySelector('#contact-dialog');
const contactTrigger = document.querySelector('[data-contact-open]');
if (contactDialog && contactTrigger && typeof contactDialog.showModal === 'function') {
  contactTrigger.setAttribute('role', 'button');
  contactTrigger.setAttribute('aria-haspopup', 'dialog');
  contactTrigger.setAttribute('aria-controls', 'contact-dialog');
  contactTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    contactDialog.showModal();
    document.body.classList.add('dialog-open');
  });
  contactTrigger.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      contactTrigger.click();
    }
  });
  contactDialog.querySelector('.dialog-close').addEventListener('click', () => contactDialog.close());
  contactDialog.addEventListener('close', () => {
    document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]')));
    contactTrigger.focus({ preventScroll: true });
  });
  contactDialog.addEventListener('click', (event) => {
    const bounds = contactDialog.getBoundingClientRect();
    if (event.target === contactDialog &&
        (event.clientX < bounds.left || event.clientX > bounds.right ||
         event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      contactDialog.close();
    }
  });
}

copyButton.addEventListener('click', async () => {
  const text = [
    'AUTO FIX — список робіт для обговорення',
    ...selectedServices().map(
      (input) => `• ${input.dataset.service}: від ${formatter.format(Number(input.value))} грн`,
    ),
    `Разом: від ${formatter.format(
      selectedTotal(),
    )} грн (демонстраційний прайс, без деталей та матеріалів).`,
    'Фактичну ціну і запис потрібно підтвердити телефоном: +380 66 056 81 21.',
  ].join('\n');
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Список скопійовано. Його можна зберегти у свої нотатки.';
  } catch {
    fallback.value = text;
    fallback.hidden = false;
    fallback.focus();
    fallback.select();
    copyStatus.textContent = 'Автоматичне копіювання недоступне. Скопіюйте виділений текст вручну.';
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

// Галерея: локальний Swiper, 5 секунд між переходами. Якщо бібліотека
// недоступна, фотографії залишаються звичайним горизонтальним списком.
const gallery = document.querySelector('.gallery-carousel');
const galleryDialog = document.querySelector('#gallery-dialog');
const fullImage = galleryDialog.querySelector('.gallery-full-image');
const imageError = galleryDialog.querySelector('.gallery-image-error');
let galleryTrigger = null;

// Показываем оригинал через img: переход по прямой ссылке на AVIF может
// запускать скачивание, если сервер отдаёт application/octet-stream.
gallery.querySelectorAll('.gallery-photo').forEach((link) => {
  link.setAttribute('aria-haspopup', 'dialog');
  link.setAttribute('aria-controls', 'gallery-dialog');
  link.setAttribute('aria-label', link.getAttribute('aria-label').replace(' (нова вкладка)', ''));
});
gallery.addEventListener('click', (event) => {
  const link = event.target.closest('.gallery-photo');
  if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  galleryTrigger = link;
  imageError.hidden = true;
  fullImage.hidden = false;
  fullImage.alt = link.querySelector('img').alt;
  fullImage.src = link.href;
  galleryDialog.showModal();
  document.body.classList.add('dialog-open');
});
fullImage.addEventListener('error', () => {
  fullImage.hidden = true;
  imageError.hidden = false;
});
galleryDialog.querySelector('.gallery-close').addEventListener('click', () => galleryDialog.close());
galleryDialog.addEventListener('click', (event) => {
  if (event.target === galleryDialog) galleryDialog.close();
});
galleryDialog.addEventListener('close', () => {
  document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]')));
  galleryTrigger?.focus({ preventScroll: true });
});

if (gallery && typeof window.Swiper === 'function') {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pauseButton = gallery.querySelector('.gallery-autoplay');
  const sliderElement = gallery.querySelector('.gallery-swiper');
  let manuallyPaused = motionPreference.matches;
  let pointerInside = false;

  const gallerySwiper = new window.Swiper(sliderElement, {
    slidesPerView: 1.12,
    spaceBetween: 16,
    speed: motionPreference.matches ? 0 : 650,
    loop: true,
    grabCursor: true,
    autoplay: {
      enabled: false,
      delay: 5000,
      disableOnInteraction: false,
    },
    breakpoints: {
      600: { slidesPerView: 2, spaceBetween: 20 },
      1000: { slidesPerView: 3, spaceBetween: 24 },
    },
    navigation: {
      prevEl: gallery.querySelector('.gallery-prev'),
      nextEl: gallery.querySelector('.gallery-next'),
    },
    pagination: {
      el: gallery.querySelector('.gallery-pagination'),
      clickable: true,
      bulletElement: 'button',
    },
    a11y: {
      enabled: true,
      wrapperLiveRegion: false,
      prevSlideMessage: 'Попереднє фото',
      nextSlideMessage: 'Наступне фото',
      paginationBulletMessage: 'Перейти до фото {{index}}',
      slideLabelMessage: '{{index}} з {{slidesLength}}',
      itemRoleDescriptionMessage: 'слайд',
    },
  });

  // Єдина перевірка причин паузи не дає mouseleave відновити прокрутку,
  // якщо відвідувач зупинив її кнопкою або фокус досі всередині галереї.
  function syncGalleryAutoplay() {
    const shouldPause =
      manuallyPaused ||
      pointerInside ||
      document.hidden ||
      gallery.contains(document.activeElement) ||
      document.querySelector('dialog[open]');
    if (shouldPause) gallerySwiper.autoplay.stop();
    else if (!gallerySwiper.autoplay.running) gallerySwiper.autoplay.start();

    pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
    pauseButton.setAttribute(
      'aria-label',
      manuallyPaused
        ? 'Увімкнути автоматичну зміну фотографій'
        : 'Зупинити автоматичну зміну фотографій',
    );
    pauseButton.querySelector('.gallery-autoplay-label').textContent = manuallyPaused
      ? 'Відтворити'
      : 'Пауза';
    pauseButton.firstElementChild.textContent = manuallyPaused ? '▶' : 'Ⅱ';
  }

  pauseButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    syncGalleryAutoplay();
  });
  gallery.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    pointerInside = true;
    syncGalleryAutoplay();
  });
  gallery.addEventListener('pointerleave', () => {
    pointerInside = false;
    syncGalleryAutoplay();
  });
  gallery.addEventListener('focusin', syncGalleryAutoplay);
  gallery.addEventListener('focusout', () => requestAnimationFrame(syncGalleryAutoplay));
  document.addEventListener('visibilitychange', syncGalleryAutoplay);
  motionPreference.addEventListener('change', (event) => {
    gallerySwiper.params.speed = event.matches ? 0 : 650;
    if (event.matches) manuallyPaused = true;
    syncGalleryAutoplay();
  });
  const dialogObserver = new MutationObserver(syncGalleryAutoplay);
  document.querySelectorAll('dialog').forEach((modal) => {
    dialogObserver.observe(modal, { attributes: true, attributeFilter: ['open'] });
  });
  // Swiper відновлює autoplay після свайпу; повторно застосовуємо ручну паузу.
  gallerySwiper.on('sliderFirstMove', () => gallerySwiper.autoplay.stop());
  gallerySwiper.on('touchEnd', () => requestAnimationFrame(syncGalleryAutoplay));
  gallery.querySelector('.gallery-controls').hidden = false;
  syncGalleryAutoplay();
}
