/**
 * FairFlat — listings.js
 * Скрипт для сторінки каталогу та детального перегляду оголошень (listings.html).
 * Чистий нативний Vanilla JavaScript (без сторонніх фреймворків).
 *
 * Відповідає суворій ER-схемі БД:
 *   Таблиці: LISTING, LISTING_PHOTO, USER, VIEWING_REQUEST, FAVORITE
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   БАЗА ДАНИХ: 4 ВІЗУАЛЬНІ ПРИКЛАДИ ОБ'ЄКТІВ (ER-SCHEMA)
   ════════════════════════════════════════════════════════════ */
const LISTINGS_DATABASE = [
  // ── Приклад #1: Купівля, Квартира, Оцінено AI ─────────────
  {
    listing_id: 1,
    deal_type: 'SALE',
    property_type: 'Квартира',
    title: '2-кімнатна квартира на Оболоні',
    description: `Світла та затишна 2-кімнатна квартира в престижному Оболонському районі поруч із набережною Дніпра. Раціональне двостороннє планування: дві окремі спальні, простора кухня з виходом на засклений балкон, роздільний санвузол.

У квартирі виконано якісний євроремонт із заміною всієї мідної проводки, сантехнічних труб та радіаторів опалення. Встановлено енергозберігаючі двокамерні склопакети, лічильники на воду, газ та теплову енергію.

Будинок 2014 року побудови, охайне парадне з консьєржем, два швидкісні ліфти Otis. Доглянута прибудинкова територія зі шлагбаумом та закріпленим паркомісцем у дворі. У пішій доступності (7 хвилин) станція метро «Мінська», ТРЦ Dream Berry, супермаркети Сільпо та Novus, дитячі садки та ліцей.

Об'єкт успішно пройшов верифікацію алгоритмом LightGBM v3.3 на основі повного інженерно-технічного паспорта (79 ознак). Розрахована вартість повністю відповідає чесній ринковій ціні.`,
    price: 72000,
    status: 'ACTIVE',
    created_at: '2026-10-18',
    // 6 полів характеристик:
    area_sqm: 48.0,
    rooms: 2,
    floor: 3,
    floors_total: 9,
    year_built: 2014,
    has_parking: true,
    repair_state: 'Євроремонт',
    // Геолокація:
    city: 'Київ',
    district: 'Оболонський',
    address: 'вул. Маршала Тимошенка, 21',
    latitude: 50.5126,
    longitude: 30.4998,
    // ML верифікація (лише для SALE):
    data_source: 'CSV_AUTOFILL',
    is_ml_verified: true,
    ml_predicted_price: 72000,
    ml_evaluated_at: '2026-10-18 11:42:15',
    // LISTING_PHOTO:
    photos: [
      {
        photo_url: '',
        alt_text: 'Вітальня з панорамними вікнами',
        is_cover: true,
        sort_order: 1,
        icon: '🛋',
        title: 'Вітальня'
      },
      {
        photo_url: '',
        alt_text: 'Кухня-їдальня з вбудованою технікою',
        is_cover: false,
        sort_order: 2,
        icon: '🍳',
        title: 'Кухня'
      },
      {
        photo_url: '',
        alt_text: 'Затишна спальна кімната',
        is_cover: false,
        sort_order: 3,
        icon: '🛏',
        title: 'Спальня'
      }
    ],
    // USER (owner_id):
    owner: {
      user_id: 101,
      full_name: 'Олександр Мельник',
      role: 'USER', // Власник
      is_verified: false,
      phone: '+380671234567'
    }
  },

  // ── Приклад #2: Купівля, Будинок / Дуплекс, Оцінено AI ────
  {
    listing_id: 2,
    deal_type: 'SALE',
    property_type: 'Будинок',
    title: 'Сучасний дуплекс у Голосієві',
    description: `Енергоефективний 2-поверховий дуплекс у котеджній частині Голосіївського району поруч із Національним природним парком. Побудований за індивідуальним архітектурним проєктом у 2019 році з керамоблоку із базальтовим утепленням 150 мм.

Планування 1-го поверху: простора кухня-вітальня 38 м² з виходом на літню терасу, кабінет/гостьова спальня, санвузол з душовою, котельня. 2-й поверх: master-bedroom із власною гардеробною кімнатою, дві дитячі спальні, велика ванна кімната.

Виконано преміальний авторський дизайнерський ремонт: дубовий паркет, керамограніт із водяним підігрівом підлоги, канальне кондиціонування Daikin, тепловий насос повітря-вода, система рекуперації повітря.

Окрема приватизована ділянка 3.5 сотки з ландшафтним озелененням, автополивом, зоною BBQ та навісом для 2 автомобілів із зарядним портом для електрокара (Type 2, 22 кВт).

Ціна повністю підтверджена моделлю LightGBM за всіма конструктивними та геопросторовими ознаками датасету.`,
    price: 145000,
    status: 'ACTIVE',
    created_at: '2026-10-21',
    // 6 полів характеристик:
    area_sqm: 110.0,
    rooms: 4,
    floor: 2,
    floors_total: 2,
    year_built: 2019,
    has_parking: true,
    repair_state: 'Дизайнерський',
    // Геолокація:
    city: 'Київ',
    district: 'Голосіївський',
    address: 'вул. Васильківська, 45',
    latitude: 50.3924,
    longitude: 30.4938,
    // ML верифікація:
    data_source: 'CSV_AUTOFILL',
    is_ml_verified: true,
    ml_predicted_price: 145000,
    ml_evaluated_at: '2026-10-21 15:10:04',
    // LISTING_PHOTO:
    photos: [
      {
        photo_url: '',
        alt_text: 'Фасад дуплексу та тераса',
        is_cover: true,
        sort_order: 1,
        icon: '🏡',
        title: 'Фасад дуплексу'
      },
      {
        photo_url: '',
        alt_text: 'Кухня-вітальня з каміном',
        is_cover: false,
        sort_order: 2,
        icon: '🛋',
        title: 'Кухня-вітальня'
      },
      {
        photo_url: '',
        alt_text: 'Master-bedroom з ванною',
        is_cover: false,
        sort_order: 3,
        icon: '🛏',
        title: 'Master-спальня'
      }
    ],
    // USER (owner_id):
    owner: {
      user_id: 102,
      full_name: 'Ірина Бойко',
      role: 'USER', // Власник
      is_verified: true,
      phone: '+380509876543'
    }
  },

  // ── Приклад #3: Купівля, Квартира, Авторська ціна (без AI) ─
  {
    listing_id: 3,
    deal_type: 'SALE',
    property_type: 'Квартира',
    title: 'Видова 3-кімнатна квартира на Печерську',
    description: `Ексклюзивні апартаменти в історичній частині Липок (Печерськ) у добротному цегляному спецпроєкті. Висота стель — 3.15 м. Вікна виходять на зелений сквер та історичну архітектуру урядового кварталу.

У квартирі виконано дорогий дизайнерський ремонт у стилі сучасної класики з використанням мармуру, італійського текстилю та вбудованих меблів індивідуального замовлення. Усі побутові прилади лінійки Miele, сантехніка Villeroy & Boch.

Зручне двостороннє планування: простора камінна зала, затишна спальня зі звукоізоляцією, кабінет-бібліотека, 2 санвузли.

Оскільки даний об'єкт має ексклюзивний авторський ремонт, антикварні елементи та унікальну локацію, власник встановив ціну самостійно в ручному режимі (MANUAL), відмовившись від автоматичної базової ML-оцінки. Оголошення публікується як базове з авторською вартістю.`,
    price: 310000,
    status: 'ACTIVE',
    created_at: '2026-10-24',
    // 6 полів характеристик:
    area_sqm: 72.0,
    rooms: 3,
    floor: 5,
    floors_total: 7,
    year_built: 2016,
    has_parking: false,
    repair_state: 'Дизайнерський',
    // Геолокація:
    city: 'Київ',
    district: 'Печерський',
    address: 'бул. Лесі Українки, 7Б',
    latitude: 50.4358,
    longitude: 30.5342,
    // ML верифікація:
    data_source: 'MANUAL',
    is_ml_verified: false,
    ml_predicted_price: null,
    ml_evaluated_at: null,
    // LISTING_PHOTO:
    photos: [
      {
        photo_url: '',
        alt_text: 'Камінна зала з вітражними вікнами',
        is_cover: true,
        sort_order: 1,
        icon: '🏛',
        title: 'Камінна зала'
      },
      {
        photo_url: '',
        alt_text: 'Елегантна спальня з гардеробною',
        is_cover: false,
        sort_order: 2,
        icon: '🛏',
        title: 'Головна спальня'
      },
      {
        photo_url: '',
        alt_text: 'Мармурова ванна кімната',
        is_cover: false,
        sort_order: 3,
        icon: '🛁',
        title: 'Ванна кімната'
      }
    ],
    // USER (owner_id):
    owner: {
      user_id: 205,
      full_name: 'Агентство «Kyiv Luxury Homes» (Сергій Коваль)',
      role: 'REALTOR', // Перевірений рієлтор
      is_verified: true,
      phone: '+380442345678'
    }
  },

  // ── Приклад #4: Оренда, Квартира/Студія, Авторська ціна ───
  {
    listing_id: 4,
    deal_type: 'RENT',
    property_type: 'Квартира',
    title: 'Затишна 1-кімнатна студія на Подолі',
    description: `Атмосферна смарт-студія в історичному центрі Подолу, всього 4 хвилини спокійної ходьби до Контрактової площі та станції метро. Будинок після повної капітальної реновації.

Простір оптимізовано провідними дизайнерами: зручна зона сну з ортопедичним матрацом, ергономічна кухня з індукційною плитою, посудомийною машиною та духовою шафою, робоче місце для віддаленої роботи біля вікна.

Високошвидкісний оптоволоконний інтернет (працює при відключеннях світла завдяки безперебійному живленню у будинку). Індивідуальне електричне опалення, кондиціонер інверторного типу на тепло/холод.

Зверніть увагу: наша алгоритмічна модель LightGBM спеціалізується виключно на цінах купівлі-продажу житла (SalePrice). Орендні ставки формуються власниками індивідуально, тому це оголошення має статус «Авторська ціна».`,
    price: 650, // 650 $/міс
    status: 'ACTIVE',
    created_at: '2026-10-27',
    // 6 полів характеристик:
    area_sqm: 35.0,
    rooms: 1,
    floor: 3,
    floors_total: 5,
    year_built: 2017,
    has_parking: false,
    repair_state: 'Євроремонт',
    // Геолокація:
    city: 'Київ',
    district: 'Подільський',
    address: 'вул. Сагайдачного, 14',
    latitude: 50.4612,
    longitude: 30.5218,
    // ML верифікація (для RENT завжди false, оскільки AI модель навчена на SalePrice):
    data_source: 'MANUAL',
    is_ml_verified: false,
    ml_predicted_price: null,
    ml_evaluated_at: null,
    // LISTING_PHOTO:
    photos: [
      {
        photo_url: '',
        alt_text: 'Затишний загальний план студії',
        is_cover: true,
        sort_order: 1,
        icon: '🏙',
        title: 'Студія загальний план'
      },
      {
        photo_url: '',
        alt_text: 'Кухонна зона та барна стійка',
        is_cover: false,
        sort_order: 2,
        icon: '🍳',
        title: 'Кухонний острів'
      },
      {
        photo_url: '',
        alt_text: 'Робоча зона з видом на Поділ',
        is_cover: false,
        sort_order: 3,
        icon: '💻',
        title: 'Робоча зона'
      }
    ],
    // USER (owner_id):
    owner: {
      user_id: 104,
      full_name: 'Олена Грищенко',
      role: 'USER', // Власник
      is_verified: true,
      phone: '+380637778899'
    }
  }
];

/* ════════════════════════════════════════════════════════════
   УТИЛІТИ ФОРМАТУВАННЯ
   ════════════════════════════════════════════════════════════ */
function formatCurrency(amount) {
  return '$' + amount.toLocaleString('uk-UA').replace(/\u202F/g, ' ');
}

function formatPhoneDisplay(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12) {
    return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
  }
  return raw;
}

/* ════════════════════════════════════════════════════════════
   ГОЛОВНИЙ МОДУЛЬ: ДЕТАЛЬНИЙ ПЕРЕГЛЯД ТА ВЗАЄМОДІЯ
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Кеш елементів DOM
  const elements = {
    // Таби
    tabsContainer: document.querySelector('[data-examples-tabs]'),
    tabs: document.querySelectorAll('.example-tab'),

    // Хлібні крихти
    bcDeal: document.querySelector('[data-breadcrumb-deal]'),
    bcType: document.querySelector('[data-breadcrumb-type]'),
    bcId: document.querySelector('[data-breadcrumb-id]'),

    // Шапка
    viewDeal: document.querySelector('[data-view-deal]'),
    viewType: document.querySelector('[data-view-type]'),
    viewMlBadge: document.querySelector('[data-view-ml-badge]'),
    viewTitle: document.querySelector('[data-view-title]'),
    viewLocation: document.querySelector('[data-view-location]'),
    viewCreated: document.querySelector('[data-view-created]'),

    // Галерея
    viewCoverBg: document.querySelector('[data-view-cover-bg]'),
    viewCoverIcon: document.querySelector('[data-view-cover-icon]'),
    viewCoverTitle: document.querySelector('[data-view-cover-title]'),
    viewStatus: document.querySelector('[data-view-status]'),
    viewThumbs: document.querySelector('[data-view-thumbs]'),

    // 6 Характеристик
    viewArea: document.querySelector('[data-view-area]'),
    viewRooms: document.querySelector('[data-view-rooms]'),
    viewFloors: document.querySelector('[data-view-floors]'),
    viewYear: document.querySelector('[data-view-year]'),
    viewParking: document.querySelector('[data-view-parking]'),
    viewRepair: document.querySelector('[data-view-repair]'),

    // ML блок
    viewMlBox: document.querySelector('[data-view-ml-box]'),

    // Опис
    viewDescription: document.querySelector('[data-view-description]'),

    // Карта
    viewCoords: document.querySelector('[data-view-coords]'),
    viewLat: document.querySelector('[data-view-lat]'),
    viewLng: document.querySelector('[data-view-lng]'),
    viewMarker: document.querySelector('[data-view-marker]'),
    viewMarkerTitle: document.querySelector('[data-view-marker-title]'),
    viewMarkerPrice: document.querySelector('[data-view-marker-price]'),
    viewDistrictBadge: document.querySelector('[data-view-district-badge]'),

    // Сайдбар
    viewSidebarDeal: document.querySelector('[data-view-sidebar-deal]'),
    viewPrice: document.querySelector('[data-view-price]'),
    viewPriceSqm: document.querySelector('[data-view-price-sqm]'),

    // Обране
    favToggle: document.querySelector('[data-fav-toggle]'),
    favIcon: document.querySelector('[data-fav-icon]'),
    favText: document.querySelector('[data-fav-text]'),

    // Продавець
    viewSellerAvatar: document.querySelector('[data-view-seller-avatar]'),
    viewSellerName: document.querySelector('[data-view-seller-name]'),
    viewSellerRole: document.querySelector('[data-view-seller-role]'),
    phoneToggle: document.querySelector('[data-phone-toggle]'),
    phoneRevealed: document.querySelector('[data-phone-revealed]'),
    viewPhoneLink: document.querySelector('[data-view-phone-link]'),

    // Запис на огляд
    viewingForm: document.querySelector('[data-viewing-form]'),
    viewingResult: document.querySelector('[data-viewing-result]')
  };

  // Поточний стан обраного (зберігаємо у пам'яті/localStorage)
  const favoritesState = new Set();

  /**
   * Відображення конкретного оголошення в каркасі
   * @param {Object} listing - об'єкт із LISTINGS_DATABASE
   */
  function renderListing(listing) {
    if (!listing) return;

    const isRent = listing.deal_type === 'RENT';
    const isSale = listing.deal_type === 'SALE';

    // 1. Хлібні крихти
    if (elements.bcDeal) elements.bcDeal.textContent = isRent ? 'Оренда' : 'Купівля';
    if (elements.bcType) elements.bcType.textContent = listing.property_type;
    if (elements.bcId) elements.bcId.textContent = `ID #${listing.listing_id}`;

    // 2. Шапка
    if (elements.viewDeal) {
      elements.viewDeal.textContent = isRent ? 'ОРЕНДА' : 'КУПІВЛЯ';
      elements.viewDeal.style.backgroundColor = isRent ? '#4F46E5' : 'var(--color-graphite)';
    }

    if (elements.viewType) {
      elements.viewType.textContent = listing.property_type.toUpperCase();
    }

    if (elements.viewMlBadge) {
      if (listing.is_ml_verified) {
        elements.viewMlBadge.className = 'badge-ml';
        elements.viewMlBadge.innerHTML = '✅ ОЦІНЕНО AI · ЧЕСНА ЦІНА';
      } else {
        elements.viewMlBadge.className = 'badge-ml badge-ml--base';
        elements.viewMlBadge.innerHTML = '⚪ АВТОРСЬКА ЦІНА';
      }
    }

    if (elements.viewTitle) elements.viewTitle.textContent = listing.title;
    if (elements.viewLocation) {
      elements.viewLocation.textContent = `м. ${listing.city}, ${listing.district} р-н, ${listing.address}`;
    }
    if (elements.viewCreated) {
      const dateParts = listing.created_at.split('-');
      elements.viewCreated.textContent = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    }

    // 3. Галерея фото (LISTING_PHOTO)
    if (elements.viewStatus) {
      elements.viewStatus.textContent = `Статус: ${listing.status}`;
    }

    // Скидаємо/встановлюємо головне прев'ю
    const coverPhoto = listing.photos.find(p => p.is_cover) || listing.photos[0];
    updateGalleryCover(coverPhoto, listing.listing_id);

    // Рендеримо 3 мініатюри
    if (elements.viewThumbs) {
      elements.viewThumbs.innerHTML = '';
      listing.photos.forEach((photo, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = `gallery-thumb ${photo.is_cover ? 'is-active' : ''}`;
        thumbBtn.setAttribute('role', 'listitem');
        thumbBtn.setAttribute('aria-label', `Фото #${photo.sort_order}: ${photo.title}`);
        thumbBtn.innerHTML = `
          <span class="gallery-thumb__icon" aria-hidden="true">${photo.icon}</span>
          <div class="gallery-thumb__info">
            <span class="gallery-thumb__order">Фото #${photo.sort_order}</span>
            <strong class="gallery-thumb__title">${photo.title}</strong>
          </div>
        `;

        thumbBtn.addEventListener('click', () => {
          document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('is-active'));
          thumbBtn.classList.add('is-active');
          updateGalleryCover(photo, listing.listing_id);
        });

        elements.viewThumbs.appendChild(thumbBtn);
      });
    }

    // 4. СУВОРО 6 характеристик об'єкта (ER: LISTING)
    if (elements.viewArea) elements.viewArea.textContent = `${listing.area_sqm} м²`;
    if (elements.viewRooms) elements.viewRooms.textContent = `${listing.rooms} кімнати`;
    if (elements.viewFloors) elements.viewFloors.textContent = `${listing.floor} з ${listing.floors_total}`;
    if (elements.viewYear) elements.viewYear.textContent = `${listing.year_built} рік`;
    if (elements.viewParking) {
      elements.viewParking.textContent = listing.has_parking ? 'Є паркінг' : 'Немає паркінгу';
    }
    if (elements.viewRepair) elements.viewRepair.textContent = listing.repair_state;

    // 5. Блок ML-верифікації (Правило: ТІЛЬКИ ПРОДАЖ, оренда не оцінюється)
    if (elements.viewMlBox) {
      if (listing.is_ml_verified && isSale) {
        // Смарагдовий блок AI-верифікації
        elements.viewMlBox.innerHTML = `
          <div class="ml-verified-card">
            <div class="ml-verified-card__header">
              <div class="ml-verified-card__title">
                <span aria-hidden="true">✅</span>
                <span>Ціна верифікована моделлю LightGBM під час публікації</span>
              </div>
              <span class="ml-verified-card__pill">Статус: VERIFIED</span>
            </div>

            <div class="ml-verified-card__body">
              <div class="ml-stat-item">
                <span class="ml-stat-item__label">Розрахована чесна ціна (ml_predicted_price):</span>
                <strong class="ml-stat-item__value">${formatCurrency(listing.ml_predicted_price)}</strong>
              </div>
              <div class="ml-stat-item">
                <span class="ml-stat-item__label">Дата та час верифікації (ml_evaluated_at):</span>
                <strong class="ml-stat-item__value ml-stat-item__value--mono">${listing.ml_evaluated_at}</strong>
              </div>
            </div>

            <p class="ml-verified-card__note">
              <strong>Гарантія чесної угоди:</strong> Власник підтвердив відповідність технічних параметрів нерухомості алгоритму машинного навчання та погодився на встановлення рекомендованої ринкової ціни.
            </p>
          </div>
        `;
      } else {
        // Сірий блок: Авторська ціна (для Manual або Оренди)
        const reasonText = isRent
          ? 'Орендні ставки не проходять ML-оцінку алгоритму LightGBM (модель навчена на цінах купівлі-продажу SalePrice датасету House Prices). Вартість щомісячної оренди встановлена орендодавцем самостійно.'
          : 'Власник вказав характеристики об\'єкта вручну (MANUAL) та встановив авторську ціну на власний розсуд через унікальні особливості планування, ексклюзивний ремонт або особисті обставини.';

        elements.viewMlBox.innerHTML = `
          <div class="ml-manual-card">
            <div class="ml-manual-card__header">
              <span aria-hidden="true">⚪</span>
              <span>Базове оголошення · Авторська ціна</span>
            </div>
            <p class="ml-manual-card__text">
              ${reasonText}
            </p>
            <div class="ml-manual-card__alert">
              <strong>Зверніть увагу:</strong> Оголошення публікується без зеленого бейджа якості «Оцінено AI». Ви можете порівняти характеристики цієї нерухомості з подібними верифікованими об'єктами в каталозі.
            </div>
          </div>
        `;
      }
    }

    // 6. Опис
    if (elements.viewDescription) elements.viewDescription.textContent = listing.description;

    // 7. Карта Києва
    if (elements.viewLat) elements.viewLat.textContent = listing.latitude.toFixed(4);
    if (elements.viewLng) elements.viewLng.textContent = listing.longitude.toFixed(4);
    if (elements.viewMarkerTitle) elements.viewMarkerTitle.textContent = listing.title;
    if (elements.viewMarkerPrice) {
      elements.viewMarkerPrice.textContent = isRent
        ? `${formatCurrency(listing.price)}/міс`
        : formatCurrency(listing.price);
    }
    if (elements.viewDistrictBadge) {
      elements.viewDistrictBadge.textContent = `Район: ${listing.district}`;
    }

    // Позиціювання маркера карти за координатами
    if (elements.viewMarker) {
      // Мапування широти/довготи Києва на % у канвасі
      // Київ: lat ~50.38..50.53, lng ~30.40..30.65
      const topPct = Math.min(Math.max(((50.53 - listing.latitude) / 0.15) * 80 + 10, 15), 85);
      const leftPct = Math.min(Math.max(((listing.longitude - 30.40) / 0.25) * 80 + 10, 15), 85);
      elements.viewMarker.style.top = `${topPct}%`;
      elements.viewMarker.style.left = `${leftPct}%`;
    }

    // 8. Сайдбар ціни
    if (elements.viewSidebarDeal) {
      elements.viewSidebarDeal.textContent = isRent ? 'Оренда' : 'Продаж';
    }

    if (elements.viewPrice) {
      elements.viewPrice.textContent = isRent
        ? `${formatCurrency(listing.price)} / міс`
        : formatCurrency(listing.price);
    }

    if (elements.viewPriceSqm) {
      if (isRent) {
        const perSqm = (listing.price / listing.area_sqm).toFixed(1);
        elements.viewPriceSqm.textContent = `$${perSqm} / м² на місяць`;
      } else {
        const perSqm = Math.round(listing.price / listing.area_sqm);
        elements.viewPriceSqm.textContent = `${formatCurrency(perSqm)} / м²`;
      }
    }

    // 9. Стан кнопки «В обране»
    updateFavoriteButton(listing.listing_id);

    // 10. Картка продавця (USER: owner)
    if (elements.viewSellerName) elements.viewSellerName.textContent = listing.owner.full_name;
    if (elements.viewSellerAvatar) {
      elements.viewSellerAvatar.textContent = listing.owner.role === 'REALTOR' ? '🏢' : '👤';
    }
    if (elements.viewSellerRole) {
      const isRealtor = listing.owner.role === 'REALTOR';
      elements.viewSellerRole.innerHTML = isRealtor
        ? `<span class="role-badge role-badge--realtor">Перевірений рієлтор ${listing.owner.is_verified ? '✓' : ''}</span>`
        : `<span class="role-badge">Власник об'єкта</span>`;
    }

    // Телефон
    if (elements.phoneToggle) {
      elements.phoneToggle.hidden = false;
    }
    if (elements.phoneRevealed) {
      elements.phoneRevealed.hidden = true;
    }
    if (elements.viewPhoneLink) {
      elements.viewPhoneLink.textContent = formatPhoneDisplay(listing.owner.phone);
      elements.viewPhoneLink.href = `tel:${listing.owner.phone}`;
    }

    // Скидання форми перегляду
    if (elements.viewingForm) {
      elements.viewingForm.reset();
      // Ставимо дефолтну дату: завтра
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateInput = elements.viewingForm.querySelector('[name="preferred_date"]');
      if (dateInput) {
        dateInput.value = tomorrow.toISOString().split('T')[0];
        dateInput.min = new Date().toISOString().split('T')[0];
      }
    }
    if (elements.viewingResult) {
      elements.viewingResult.hidden = true;
      elements.viewingResult.textContent = '';
      elements.viewingResult.className = 'viewing-result-msg';
    }

    // Оновлення активного класу таба
    elements.tabs.forEach(tab => {
      const isActive = parseInt(tab.dataset.listingId, 10) === listing.listing_id;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    // Оновлення URL без перезавантаження
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('id', listing.listing_id);
    window.history.replaceState({ listingId: listing.listing_id }, '', newUrl);
  }

  /**
   * Оновлення обкладинки галереї
   */
  function updateGalleryCover(photo, listingId) {
    if (!elements.viewCoverBg) return;

    // Градієнти відповідно до типу
    const gradients = [
      'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
      'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
      'linear-gradient(135deg, #831843 0%, #EC4899 100%)',
      'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)'
    ];
    elements.viewCoverBg.style.background = gradients[(listingId - 1) % gradients.length];

    if (elements.viewCoverIcon) elements.viewCoverIcon.textContent = photo.icon;
    if (elements.viewCoverTitle) elements.viewCoverTitle.textContent = `${photo.title} · ${photo.alt_text}`;
  }

  /**
   * Оновлення стану кнопки обраного
   */
  function updateFavoriteButton(listingId) {
    if (!elements.favToggle) return;
    const isFav = favoritesState.has(listingId);
    elements.favToggle.classList.toggle('is-active', isFav);
    elements.favToggle.setAttribute('aria-pressed', String(isFav));
    if (elements.favIcon) elements.favIcon.textContent = isFav ? '❤️' : '🤍';
    if (elements.favText) elements.favText.textContent = isFav ? 'В обраному' : 'Додати в обране';
  }

  /* ════════════════════════════════════════════════════════════
     ОБРОБНИКИ ПОДІЙ
     ════════════════════════════════════════════════════════════ */

  // 1. Клік по табах прикладів
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = parseInt(tab.dataset.listingId, 10);
      const targetListing = LISTINGS_DATABASE.find(item => item.listing_id === id);
      if (targetListing) {
        renderListing(targetListing);
      }
    });
  });

  // 2. Кнопка "В обране" (FAVORITE)
  if (elements.favToggle) {
    elements.favToggle.addEventListener('click', () => {
      const currentId = parseInt(new URL(window.location).searchParams.get('id') || '1', 10);
      if (favoritesState.has(currentId)) {
        favoritesState.delete(currentId);
      } else {
        favoritesState.add(currentId);
      }
      updateFavoriteButton(currentId);
    });
  }

  // 3. Показати номер телефону
  if (elements.phoneToggle) {
    elements.phoneToggle.addEventListener('click', () => {
      elements.phoneToggle.hidden = true;
      if (elements.phoneRevealed) {
        elements.phoneRevealed.hidden = false;
      }
    });
  }

  // 4. Форма запису на перегляд (VIEWING_REQUEST)
  if (elements.viewingForm) {
    elements.viewingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const dateInput = elements.viewingForm.querySelector('[name="preferred_date"]');
      const messageInput = elements.viewingForm.querySelector('[name="message"]');
      const submitBtn = elements.viewingForm.querySelector('.btn--submit-viewing');

      if (!dateInput || !dateInput.value) {
        showViewingResult('Будь ласка, оберіть бажану дату перегляду.', 'error');
        return;
      }

      // Імітація запиту до БД (INSERT INTO VIEWING_REQUEST)
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Збереження запиту у БД...';
      }

      setTimeout(() => {
        const currentId = parseInt(new URL(window.location).searchParams.get('id') || '1', 10);
        showViewingResult(
          `✓ Запит успішно зареєстровано в системі! (Статус: PENDING, ID об'єкта: #${currentId}, Дата: ${dateInput.value}). Власник зв'яжеться з вами за вказаним у вашому профілі телефоном.`,
          'success'
        );

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Надіслати заявку на огляд';
        }

        if (messageInput) messageInput.value = '';
      }, 450);
    });
  }

  function showViewingResult(msg, type) {
    if (!elements.viewingResult) return;
    elements.viewingResult.hidden = false;
    elements.viewingResult.textContent = msg;
    elements.viewingResult.className = `viewing-result-msg viewing-result-msg--${type}`;
  }

  /* ════════════════════════════════════════════════════════════
     ІНІЦІАЛІЗАЦІЯ ПРИ СТАРТІ (ЧИТАННЯ URL ?id=1..4)
     ════════════════════════════════════════════════════════════ */
  const urlParams = new URLSearchParams(window.location.search);
  const initialId = parseInt(urlParams.get('id') || '1', 10);
  const matchedListing = LISTINGS_DATABASE.find(item => item.listing_id === initialId) || LISTINGS_DATABASE[0];

  renderListing(matchedListing);
});
