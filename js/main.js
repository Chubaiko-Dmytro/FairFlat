/**
 * FairFlat — main.js
 * Vanilla JS only.
 * Features:
 *   1. Search widget tab switching (Buy / Rent)
 *   2. Interactive ML block:
 *      - Real House Prices dataset columns template generator & downloader
 *      - Demo CSV file loader with preview of extracted flat parameters
 *      - Guest authentication check (isUserLoggedIn = false)
 *      - 600ms simulated LightGBM inference calculation with corridor ±5%
 *   3. Favorite button toggling (🤍 / ❤️)
 *   4. Smooth anchor navigation
 *
 * No external frameworks, no bundlers, no external dependencies.
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   USER AUTHENTICATION STATE
   isUserLoggedIn = false — режим Гостя.
   Завантаження власних файлів блокується з повідомленням.
   ════════════════════════════════════════════════════════════ */
const isUserLoggedIn = false;

/* ════════════════════════════════════════════════════════════
   HOUSE PRICES DATASET CONFIGURATION & DEMO DATA
   Реальні ознаки датасету House Prices (Kaggle / LightGBM)
   ════════════════════════════════════════════════════════════ */
const HOUSE_PRICES_COLUMNS = [
  'MSSubClass',
  'MSZoning',
  'LotArea',
  'Neighborhood',
  'BldgType',
  'HouseStyle',
  'OverallQual',
  'OverallCond',
  'YearBuilt',
  'TotalBsmtSF',
  'GrLivArea',
  'FullBath',
  'BedroomAbvGr',
  'TotRmsAbvGrd',
  'GarageCars',
  'SalePrice'
];

/**
 * Тестовий запис квартири на Оболоні (Київ)
 */
const DEMO_FLAT_RECORD = {
  MSSubClass: 20,
  MSZoning: 'RL',
  LotArea: 7500,
  Neighborhood: 'Obolon',
  BldgType: '1Fam',
  HouseStyle: '1Story',
  OverallQual: 7,
  OverallCond: 6,
  YearBuilt: 2015,
  TotalBsmtSF: 732,
  GrLivArea: 732, // ~68 м²
  FullBath: 1,
  BedroomAbvGr: 2,
  TotRmsAbvGrd: 4,
  GarageCars: 1,
  SalePrice: 78500
};

/**
 * Текстовий вміст CSV-файлу шаблону
 */
const TEMPLATE_CSV_CONTENT =
  HOUSE_PRICES_COLUMNS.join(',') + '\r\n' +
  HOUSE_PRICES_COLUMNS.map(col => DEMO_FLAT_RECORD[col]).join(',');

/* ════════════════════════════════════════════════════════════
   DOM UTILITIES
   ════════════════════════════════════════════════════════════ */
function qs(selector, parent = document) {
  const el = parent.querySelector(selector);
  return el;
}

function qsAll(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Форматування числа у валюту USD з нерозривним пробілом
 * @param {number} num
 * @returns {string}
 */
function formatUSD(num) {
  return '$' + Math.round(num).toLocaleString('uk-UA').replace(/\u202F/g, '\u00A0');
}

/* ════════════════════════════════════════════════════════════
   1. SEARCH WIDGET — ПЕРЕМИКАННЯ ТАБІВ (Купити / Орендувати)
   ════════════════════════════════════════════════════════════ */
function initSearchTabs() {
  const tabContainer = qs('[data-search-tabs]');
  if (!tabContainer) return;

  const tabs = qsAll('[data-tab]', tabContainer);
  const panels = qsAll('[data-tab-panel]', document);

  function activateTab(activeTab) {
    const targetPanel = activeTab.dataset.tab;

    tabs.forEach(tab => {
      const isActive = tab === activeTab;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach(panel => {
      panel.hidden = panel.dataset.tabPanel !== targetPanel;
    });
  }

  if (tabs.length > 0) {
    activateTab(tabs[0]);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', e => {
      const idx = tabs.indexOf(document.activeElement);
      if (idx === -1) return;

      let next = idx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (idx + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (idx - 1 + tabs.length) % tabs.length;
      } else {
        return;
      }

      e.preventDefault();
      tabs[next].focus();
      activateTab(tabs[next]);
    });
  });
}

/* ════════════════════════════════════════════════════════════
   2. ML CSV INTERFACE — ЛОГІКА ДЕМО, АВТОРИЗАЦІЇ ТА ОЦІНКИ
   ════════════════════════════════════════════════════════════ */
function initCSVDemo() {
  const form = qs('[data-ml-csv-form]');
  if (!form) return;

  const dropzone     = qs('[data-csv-dropzone]', form);
  const fileInput    = qs('[data-csv-input]', form);
  const authNotice   = qs('[data-csv-auth-notice]', form);
  const authClose    = qs('[data-csv-auth-close]', form);
  const demoBtn      = qs('[data-csv-use-demo]', form);
  const templateLink = qs('[data-csv-download-template]', form);
  const filePill     = qs('[data-csv-file-pill]', form);
  const fileNameEl   = qs('[data-csv-file-name]', form);
  const previewEl    = qs('[data-csv-preview]', form);
  const removeBtn    = qs('[data-csv-remove]', form);
  const resultBox    = qs('[data-ml-demo-result]', form);
  const resultPanel  = qs('[data-csv-result]', form);
  const priceEl      = qs('[data-csv-price]', form);
  const corridorEl   = qs('[data-csv-corridor]', form);
  const submitBtn    = qs('[data-ml-submit]', form);

  // Поточний завантажений файл
  let activeFile = null;

  /* ── Допоміжні функції стану ── */
  function showAuthNotice() {
    if (authNotice) {
      authNotice.hidden = false;
      authNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function hideAuthNotice() {
    if (authNotice) {
      authNotice.hidden = true;
    }
  }

  function resetResult() {
    if (resultPanel) resultPanel.hidden = true;
    if (resultBox) resultBox.classList.remove('has-result');
  }

  function loadDemoFlat() {
    hideAuthNotice();
    activeFile = {
      name: 'sample_flat_kyiv.csv',
      data: DEMO_FLAT_RECORD
    };

    if (fileNameEl) {
      fileNameEl.textContent = activeFile.name;
    }

    if (previewEl) {
      previewEl.innerHTML =
        '<strong>Витягнуто з CSV:</strong> Площа <strong>68 м² (732 sq.ft)</strong> · ' +
        '<strong>2 кімнати</strong> · <strong>2015 рік</strong> · <strong>Паркінг (1 авто)</strong> · ' +
        'Оцінка якості: <strong>7/10</strong>';
    }

    if (filePill) {
      filePill.hidden = false;
    }

    if (dropzone) {
      dropzone.classList.add('has-file');
    }

    resetResult();
  }

  function clearActiveFile() {
    activeFile = null;
    if (fileInput) fileInput.value = '';
    if (filePill) filePill.hidden = true;
    if (dropzone) dropzone.classList.remove('has-file', 'is-dragover');
    resetResult();
  }

  /* ── 1. Обробка кліку по дропзоні (Перевірка авторизації) ── */
  if (dropzone) {
    dropzone.addEventListener('click', e => {
      if (!isUserLoggedIn) {
        e.preventDefault();
        showAuthNotice();
      }
    });

    dropzone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isUserLoggedIn) {
          showAuthNotice();
        } else if (fileInput) {
          fileInput.click();
        }
      }
    });

    // Drag & Drop події
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    dropzone.addEventListener('dragenter', () => dropzone.classList.add('is-dragover'));
    dropzone.addEventListener('dragover',  () => dropzone.classList.add('is-dragover'));
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));

    dropzone.addEventListener('drop', e => {
      dropzone.classList.remove('is-dragover');

      if (!isUserLoggedIn) {
        showAuthNotice();
        return;
      }

      // Якщо користувач авторизований — зчитуємо файл
      const droppedFile = e.dataTransfer?.files?.[0];
      if (droppedFile) {
        if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
          alert('Будь ласка, оберіть файл у форматі .csv');
          return;
        }

        activeFile = {
          name: droppedFile.name,
          data: DEMO_FLAT_RECORD
        };

        if (fileNameEl) fileNameEl.textContent = droppedFile.name;
        if (previewEl) {
          previewEl.innerHTML =
            '<strong>Витягнуто з CSV:</strong> Площа <strong>68 м²</strong> · <strong>2 кімнати</strong> · <strong>Оболонь</strong>';
        }
        if (filePill) filePill.hidden = false;
        dropzone.classList.add('has-file');
        resetResult();
      }
    });
  }

  /* ── 2. Закриття сповіщення авторизації ── */
  if (authClose) {
    authClose.addEventListener('click', hideAuthNotice);
  }

  /* ── 3. Кнопка «Використати демо-файл» ── */
  if (demoBtn) {
    demoBtn.addEventListener('click', e => {
      e.preventDefault();
      loadDemoFlat();
    });
  }

  /* ── 4. Кнопка «Завантажити шаблон CSV» ── */
  if (templateLink) {
    templateLink.addEventListener('click', e => {
      e.preventDefault();

      const blob = new Blob([TEMPLATE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');

      tempLink.href = downloadUrl;
      tempLink.download = 'fairflat_house_features_template.csv';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);
    });
  }

  /* ── 5. Кнопка видалення вибраного файлу ── */
  if (removeBtn) {
    removeBtn.addEventListener('click', clearActiveFile);
  }

  /* ── 6. Сабміт форми: Розрахунок ціни через LightGBM ── */
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Якщо файл ще не обрано — підвантажуємо демо автоматично для зручності
    if (!activeFile) {
      loadDemoFlat();
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ LightGBM аналізує 79 ознак…';
    }

    // Анімація обчислення моделі — рівно 600мс
    setTimeout(() => {
      const predictedPrice = 78500;
      const lowRange  = Math.round(predictedPrice * 0.95); // 74 575
      const highRange = Math.round(predictedPrice * 1.05); // 82 425

      if (priceEl) {
        priceEl.textContent = formatUSD(predictedPrice);
      }

      if (corridorEl) {
        corridorEl.textContent = `${formatUSD(lowRange)} — ${formatUSD(highRange)}`;
      }

      if (resultPanel) {
        resultPanel.hidden = false;
      }

      if (resultBox) {
        resultBox.classList.add('has-result');
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '⚡ Розрахувати справедливу ціну';
      }
    }, 600);
  });
}

/* ════════════════════════════════════════════════════════════
   3. КНОПКА «ОБРАНЕ» (🤍 / ❤️)
   ════════════════════════════════════════════════════════════ */
function initFavoriteButtons() {
  qsAll('[data-fav-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isFav = btn.classList.toggle('is-fav');
      btn.textContent = isFav ? '❤️' : '🤍';
      btn.setAttribute('aria-pressed', String(isFav));
      btn.setAttribute('aria-label', isFav ? 'Видалити з обраного' : 'Додати в обране');
    });
  });
}

/* ════════════════════════════════════════════════════════════
   4. ПЛАВНИЙ СКРОЛ ДЛЯ ЯКІРНИХ ПОСИЛАНЬ
   ════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href').slice(1);
    if (!targetId) return;

    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    e.preventDefault();
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ════════════════════════════════════════════════════════════
   ІНІЦІАЛІЗАЦІЯ ПІСЛЯ ЗАВАНТАЖЕННЯ DOM
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSearchTabs();
  initCSVDemo();
  initFavoriteButtons();
  initSmoothScroll();
});
