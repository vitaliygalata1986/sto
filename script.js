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
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
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

copyButton.addEventListener('click', async () => {
  const text = [
    'ОБЕРТ — список робіт для обговорення',
    ...selectedServices().map(
      (input) => `• ${input.dataset.service}: від ${formatter.format(Number(input.value))} грн`,
    ),
    `Разом: від ${formatter.format(
      selectedTotal(),
    )} грн (демонстраційний прайс, без деталей та матеріалів).`,
    'Фактичну ціну і запис потрібно підтвердити телефоном: +380 98 891 24 54.',
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
