# Субдомен kurs.mariiakyrykovych.org для сайту курсу

20.11.2026

У зоні mariiakyrykovych.org потрібні два записи: TXT для перевірки домену в GitHub і CNAME `kurs` → `mariiakyrykovych.github.io`. Спершу субдомен прописують у налаштуваннях GitHub Pages сховища `mariiakyrykovych/kurs-web-`, і лише потім створюють CNAME. Так ніхто інший не встигне під'єднати субдомен до свого сайту на GitHub.

## Записи DNS

Обидва записи створюють у зоні `mariiakyrykovych.org` у того DNS-провайдера, на якого вказують NS-записи домену. Якщо панель сама дописує назву зони, у полі «Ім'я» вводять лише ту частину, що в другому стовпці.

| Запис | Ім'я (повне) | Ім'я в панелі | Значення | TTL |
| --- | --- | --- | --- | --- |
| TXT | `_github-pages-challenge-mariiakyrykovych.mariiakyrykovych.org` | `_github-pages-challenge-mariiakyrykovych` | Код, який покаже GitHub (крок 2) | 3600 |
| CNAME | `kurs.mariiakyrykovych.org` | `kurs` | `mariiakyrykovych.github.io` | 3600 |

У значенні CNAME немає назви сховища, `https://` і шляху `/kurs-web-/`: GitHub сам знайде сайт за назвою субдомену. Записів A, AAAA, wildcard (`*.mariiakyrykovych.org`) і записів GitHub для кореня домену не потрібно. На час налаштування TTL можна поставити 300, щоб виправлення швидше набирали чинності.

## Порядок дій

Роботу ділять двоє: **адміністратор** керує DNS, **власниця сховища** — налаштуваннями GitHub. Кроки йдуть строго по черзі.

1. **Адміністратор: підготувати зону.**
   - Переконатися, що для імені `kurs` немає жодного запису (A, AAAA, CNAME, TXT, MX): CNAME не може стояти поруч із іншими записами того самого імені.
   - Якщо в зоні є CAA-записи, додати `0 issue "letsencrypt.org"`: GitHub бере HTTPS-сертифікат у Let's Encrypt. Якщо CAA немає, нічого робити не треба.
2. **Власниця сховища: почати перевірку домену.** GitHub → аватар → Settings → Pages → Add a domain → `mariiakyrykovych.org`. GitHub покаже ім'я й значення TXT-запису; передати їх адміністратору. Перевірка кореня домену покриває й усі його субдомени.
3. **Адміністратор: створити TXT-запис** із таблиці вище й повідомити власниці сховища.
4. **Власниця сховища: натиснути Verify** на тій самій сторінці. Якщо запис ще не поширився, повторити пізніше (іноді до 24 годин). TXT-запис після цього не видаляти.
5. **Власниця сховища: вписати субдомен у сховище.** `mariiakyrykovych/kurs-web-` → Settings → Pages → Custom domain → `kurs.mariiakyrykovych.org` → Save. GitHub додасть у `main` коміт із файлом `CNAME`, тож перед наступним `git push` треба зробити `git pull`. Перевірка DNS на цій сторінці поки червона — це нормально.
6. **Адміністратор: створити CNAME-запис** `kurs` → `mariiakyrykovych.github.io`. Якщо DNS на Cloudflare, увімкнути режим DNS only (сіра хмарка), інакше GitHub не видасть сертифікат.
7. **Власниця сховища: увімкнути HTTPS.** Коли в Settings → Pages з'явиться «DNS check successful» і стане активним прапорець Enforce HTTPS, поставити його. Сертифікат зазвичай готовий за годину, іноді до 24 годин.
8. **Обоє: перевірити результат** за розділом нижче.

## Перевірка

Усе працює, коли виконано п’ять умов нижче. Команди для PowerShell у Windows; у macOS чи Linux замість `Resolve-DnsName … -Server 8.8.8.8` підійде `dig @8.8.8.8 …`.

1. CNAME видно ззовні — у відповіді є `mariiakyrykovych.github.io`:

   ```powershell
   Resolve-DnsName kurs.mariiakyrykovych.org -Type CNAME -Server 8.8.8.8
   ```

2. TXT для перевірки домену повертає код із GitHub:

   ```powershell
   Resolve-DnsName _github-pages-challenge-mariiakyrykovych.mariiakyrykovych.org -Type TXT -Server 8.8.8.8
   ```

3. У сховищі → Settings → Pages зелений напис «DNS check successful» і поставлено Enforce HTTPS; в обліковому записі → Settings → Pages домен позначено як Verified.
4. https://kurs.mariiakyrykovych.org відкриває головну сайту музею зі стилями, фото й замком у адресному рядку без попереджень. Перевірити також сторінки `courses.html`, `exhibits.html`, `articles.html` і одну статтю.
5. Стара адреса https://mariiakyrykovych.github.io/kurs-web-/ сама перенаправляє на нову.

У коді сайту всі посилання відносні, тож на корені субдомену вони працюватимуть без правок.

## Якщо сайт не відкривається

Спершу зачекати годину: нові записи й сертифікат з'являються не одразу. Якщо проблема лишається, знайти свій симптом у таблиці.

| Що видно | Ймовірна причина | Що робити |
| --- | --- | --- |
| Браузер пише, що сайт не знайдено (DNS_PROBE, NXDOMAIN) | Запис ще не поширився, має помилку або створений не в тій зоні | `Resolve-DnsName mariiakyrykovych.org -Type NS` покаже, чиї NS чинні: запис має бути саме в цього провайдера, а не в панелі реєстратора. Перевірити ім'я `kurs` і значення без помилок |
| Сторінка GitHub «404 There isn't a GitHub Pages site here» | Субдомен не вписано в сховище або файл `CNAME` зник із `main` | Власниця сховища повторює крок 5. Файл `CNAME` у корені сховища має містити один рядок `kurs.mariiakyrykovych.org` |
| У Settings → Pages «DNS check unsuccessful» або «improperly configured» | CNAME вказує не туди (з `/kurs-web-` або `https://`), або поруч є A/AAAA-записи для `kurs` | Лишити для `kurs` лише CNAME → `mariiakyrykovych.github.io`, потім у GitHub натиснути Check again |
| Попередження про сертифікат; Enforce HTTPS неактивний більше 24 годин | CAA без `letsencrypt.org`, увімкнений проксі Cloudflare або зайві записи для `kurs` | Виправити CAA чи режим Cloudflare (кроки 1 і 6). Потім у сховищі стерти Custom domain, зберегти, вписати знову — GitHub замовить сертифікат ще раз |
| Verify домену не проходить | Панель дописала зону двічі (…`.mariiakyrykovych.org.mariiakyrykovych.org`) або код скопійовано з пробілом | Ввести в поле «Ім'я» лише `_github-pages-challenge-mariiakyrykovych`, вставити код без лапок і пробілів; перевірити командою 2 з розділу «Перевірка» |
| Сайт відкривається, але старий або без останніх змін | Кеш браузера або публікація ще триває | Оновити сторінку з Ctrl+F5; у вкладці Actions сховища дочекатися зеленого запуску |

**Як відкотити.** Власниця сховища стирає Custom domain у Settings → Pages, адміністратор видаляє CNAME `kurs`. Сайт знову працює за адресою https://mariiakyrykovych.github.io/kurs-web-/. Не видаляти CNAME, поки субдомен вписано в сховище, і навпаки — спершу стирають в GitHub.

Документація GitHub: [налаштування домену](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) · [перевірка домену](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) · [усунення проблем](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages).
