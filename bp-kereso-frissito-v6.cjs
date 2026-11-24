const { chromium } = require('playwright');
const { writeFile, rename } = require('node:fs/promises');
const { join } = require('node:path');

const site = 'https://dev.budapestpszichologia.hu/munkatarsak/';
const clinics = {
  haller: /Haller utca 88/i,
  bartok: /Bartók Béla út 9/i,
  aradi: /Aradi utca 38/i,
  pesti: /Pesti út 70/i
};
const profiles = [
  {"name": "Ágics Enikő", "path": "agics-eniko", "expected": ["bartok", "haller"]},
  {"name": "Balázs Eszter", "path": "balazs-eszter", "expected": ["aradi"]},
  {"name": "Barta Beatrix", "path": "barta-beatrix", "expected": ["bartok", "haller"]},
  {"name": "Békefi Róbert", "path": "bekefi-robert", "expected": ["aradi", "haller"]},
  {"name": "Béres Orsolya", "path": "beres-orsolya", "expected": ["pesti"]},
  {"name": "Buzás Barnabás", "path": "buzas-barnabas", "expected": ["bartok"]},
  {"name": "Csigó Bianka", "path": "csigo-bianka", "expected": ["pesti"]},
  {"name": "Dudás Krisztián", "path": "dudas-krisztian-sandor", "expected": ["aradi", "haller"]},
  {"name": "Fodor Gellért", "path": "fodor-gellert", "expected": ["haller"]},
  {"name": "Fülöp Kinga", "path": "fulop-kinga", "expected": ["aradi", "haller"]},
  {"name": "Gaál Bertalan", "path": "gaal-bertalan", "expected": ["bartok"]},
  {"name": "Garaj Zsuzsanna", "path": "garaj-zsuzsanna", "expected": ["bartok"]},
  {"name": "Géczi-Répássy Helga", "path": "geczy-repassy-helga", "expected": ["haller"]},
  {"name": "Gusztonyi Péter", "path": "gusztonyi-peter", "expected": ["aradi"]},
  {"name": "Györki Brigitta", "path": "gyorki-brigitta", "expected": ["aradi"]},
  {"name": "Hámornyik László", "path": "hamornyik-laszlo", "expected": ["haller"]},
  {"name": "Hegedűs Éva", "path": "hegedus-eva", "expected": ["haller"]},
  {"name": "Homoki Lilla", "path": "homoki-lilla", "expected": ["bartok"]},
  {"name": "Homonnai Mónika", "path": "homonnai-monika", "expected": ["aradi", "haller"]},
  {"name": "Jancsó Réka Adél", "path": "jancso-reka", "expected": ["aradi"]},
  {"name": "Kálmán Rita", "path": "kalman-rita", "expected": ["haller"]},
  {"name": "Károly Fruzsina", "path": "karoly-fruzsina", "expected": ["haller"]},
  {"name": "Kertész Erika", "path": "kertesz-erika", "expected": ["bartok"]},
  {"name": "Kim Karina", "path": "kim-karina", "expected": ["haller"]},
  {"name": "Kovács Sándor", "path": "kovacs-sandor", "expected": ["pesti"]},
  {"name": "Lepedus Orsolya", "path": "lepedus-orsolya", "expected": ["haller"]},
  {"name": "Lőrincz Gergő", "path": "lorincz-gergo", "expected": ["bartok"]},
  {"name": "Lukács-Figula Fruzsina", "path": "lukacs-figula-fruzsina", "expected": ["pesti"]},
  {"name": "Máté Zsuzsa", "path": "mate-zsuzsa", "expected": ["aradi", "bartok", "haller"]},
  {"name": "Molnár Gabriella", "path": "molnar-gabriella", "expected": ["bartok", "haller"]},
  {"name": "Morák Tímea", "path": "morak-timea", "expected": ["aradi", "haller"]},
  {"name": "Nagy Dóra", "path": "nagy-dora", "expected": ["pesti"]},
  {"name": "Nagy Eszter", "path": "nagy-eszter", "expected": ["bartok"]},
  {"name": "Németh-Dene Zsófia", "path": "nemeth-dene-zsofia", "expected": ["pesti"]},
  {"name": "Oszik Márta", "path": "oszik-marta", "expected": ["haller"]},
  {"name": "Pál Janka", "path": "pal-janka", "expected": ["haller"]},
  {"name": "Patai Veronika", "path": "patai-veronika", "expected": ["bartok"]},
  {"name": "Puly-Hernádi Judit", "path": "hernadi-judit", "expected": ["haller"]},
  {"name": "Rubóczki Klaudia", "path": "ruboczki-klaudia", "expected": ["bartok", "haller"]},
  {"name": "Sápi Andrea", "path": "sapi-andrea", "expected": ["bartok"]},
  {"name": "Séra Krisztina", "path": "sera-krisztina", "expected": ["bartok", "haller", "pesti"]},
  {"name": "Soós Tekla Sára", "path": "soos-tekla-sara", "expected": ["aradi"]},
  {"name": "Szabó Alexandra", "path": "szabo-alexandra", "expected": ["bartok"]},
  {"name": "Szabó Luca", "path": "szabo-luca", "expected": ["haller"]},
  {"name": "Szépvölgyi Doroti", "path": "szepvolgyi-doroti-pszichologus", "expected": ["bartok", "haller"]},
  {"name": "Szűcs Dániel", "path": "szucs-daniel", "expected": ["bartok"]},
  {"name": "Tóth Adél", "path": "toth-adel", "expected": ["haller"]},
  {"name": "Varga Ágnes", "path": "varga-agnes", "expected": ["aradi", "haller"]},
  {"name": "Sarkadi Bálint", "path": "sarkadi-balint", "expected": []}
];
const from = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Budapest' }).format(new Date());
const end = new Date(from + 'T00:00:00Z');
end.setUTCDate(end.getUTCDate() + 12);
const until = end.toISOString().slice(0, 10);
const clinicKeys = label => Object.keys(clinics).filter(key => clinics[key].test(label));
const exactButton = (page, name) => page.getByRole('button', { name, exact: true });

const visible = locator => locator.filter({ visible: true });
const emptyMonth = page => visible(page.getByText(/No slot available this month/i));

async function selectMonth(page, date) {
  const fields = page.locator('select:visible');
  const month = fields.filter({ has: page.locator('option').filter({ hasText: /^January$/ }) });
  const year = fields.filter({ has: page.locator('option').filter({ hasText: /^2027$/ }) });
  const yearValue = String(date.getUTCFullYear());
  const monthValue = String(date.getUTCMonth());

  if (await year.inputValue() !== yearValue) await year.selectOption(yearValue);
  if (await month.inputValue() !== monthValue) await month.selectOption(monthValue);
  if (await year.inputValue() !== yearValue || await month.inputValue() !== monthValue) {
    throw Error('A foglaló nem állt a keresett hónapra: ' + date.toISOString().slice(0, 7));
  }
}

async function firstAvailableDate(page) {
  const day = page.locator('td.selectable.selected[data-id]:visible');
  const empty = emptyMonth(page);

  await day.or(empty).first().waitFor();
  if (!(await empty.count())) {
    await page.locator('li.widgets-time-slot:visible').first().waitFor();
    const date = await day.getAttribute('data-id');
    return date >= from && date < until ? date : null;
  }

  const month = new Date(from.slice(0, 7) + '-01T00:00:00Z');
  while (month.toISOString().slice(0, 10) < until) {
    await selectMonth(page, month);
    const monthKey = month.toISOString().slice(0, 7);
    const selectedDay = page.locator(`td.selectable.selected[data-id^="${monthKey}-"]:visible`);
    await selectedDay.or(empty).first().waitFor();
    if (!(await empty.count())) {
      await page.locator('li.widgets-time-slot:visible').first().waitFor();
      const date = await selectedDay.getAttribute('data-id');
      if (date >= from && date < until) return date;
    }
    month.setUTCMonth(month.getUTCMonth() + 1);
  }
  return null;
}

async function booking(page, url, rooms, fallback, record) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await exactButton(page, 'Tovább').click();
  if (rooms) {
    const select = visible(exactButton(page, 'Select'));
    await select.nth(rooms.index).click();
    if (await exactButton(page, 'Tovább').isVisible()) await exactButton(page, 'Tovább').click();
    const chosen = page.locator('#cart-location-container').getByText(rooms.label, { exact: true });
    await chosen.waitFor();
  }
  const date = await firstAvailableDate(page);
  if (date) record(rooms?.key ?? fallback, date);
}

async function checkProfile(context, { name, path, expected }, incomplete) {
  const result = { name, path, waitlistOnly: false, availability: {} };
  const page = await context.newPage();
  const record = (key, date) => {
    if (key && (!result.availability[key] || date < result.availability[key])) result.availability[key] = date;
  };
  try {
    await page.goto(site + path + '/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name, exact: true }).first().waitFor();
    const links = [...new Set(await page.locator('a[href^="https://api.leadconnectorhq.com/booking/"][href*="/sv/"]:visible').evaluateAll(nodes => nodes.map(node => node.href)))];
    const keys = clinicKeys(await page.locator('body').innerText());
    result.waitlistOnly = !links.length && await page.getByRole('link', { name: /jelentkezés a várólistára/i })
      .or(page.getByRole('button', { name: /jelentkezés a várólistára/i }))
      .filter({ visible: true }).first().isVisible();
    if (result.waitlistOnly) return result;
    if (!links.length) throw Error('Foglalógomb nem található');
    for (const url of links) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await exactButton(page, 'Tovább').click();
        const select = visible(exactButton(page, 'Select'));
        const date = page.locator('td.selectable.selected[data-id]:visible');
        await select.first().or(date).or(emptyMonth(page)).first().waitFor();
        const rooms = await select.evaluateAll(buttons => buttons.map(button => {
          for (let row = button.parentElement; row; row = row.parentElement) {
            const labels = row.innerText.split('\n').map(s => s.trim()).filter(s => /szoba/i.test(s));
            if (labels.length === 1) return labels[0];
            if (labels.length > 1) break;
          }
          return '';
        }));
        if (!rooms.length) {
          if (keys.length !== 1) throw Error('A foglaló nem jelzi egyértelműen a rendelőt');
          const value = await firstAvailableDate(page);
          if (value) record(keys[0], value);
        }
        for (const [index, label] of rooms.entries()) {
          const [key] = clinicKeys(label);
          if (!key) throw Error('Ismeretlen szoba');
          try { await booking(page, url, { index, key, label }, null, record); }
          catch (error) { incomplete.add(key); console.error(name, label, error.message); }
        }
      } catch (error) {
        for (const key of keys.length ? keys : expected) incomplete.add(key);
        console.error(name, page.url(), error.message);
      }
    }
  } catch (error) {
    for (const key of expected.length ? expected : Object.keys(clinics)) incomplete.add(key);
    console.error(name, error.message);
  } finally {
    await page.close();
  }
  return result;
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.BP_CHROMIUM });
  try {
    const context = await browser.newContext({ timezoneId: 'Europe/Budapest' });
    context.setDefaultTimeout(20000);
    const incomplete = new Set();
    const selectedPath = process.argv[2];
    const selected = selectedPath ? profiles.filter(profile => profile.path === selectedPath) : profiles;
    if (!selected.length) throw Error('Ismeretlen profil: ' + selectedPath);
    const results = [];
    for (const [index, profile] of selected.entries()) {
      console.log(`[${index + 1}/${selected.length}] ${profile.name}`);
      results.push(await checkProfile(context, profile, incomplete));
    }
    const output = join(__dirname, selectedPath ? 'bp-kereso-adatok-celzott.json' : 'bp-kereso-adatok-bovitett.json');
    await writeFile(output + '.tmp', JSON.stringify({ from, until, incomplete: [...incomplete], profiles: results }, null, 2) + '\n');
    await rename(output + '.tmp', output);
    console.log(output);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
