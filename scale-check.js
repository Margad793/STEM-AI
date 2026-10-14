const { chromium } = require('playwright-core')

const EXE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:3111/'
const DESIGN = 296
const LONG_NAME = 'Maximiliana Featherstoneworth-Harrington III'
const LONG_COMPANY = 'International Consortium for Advanced Sustainable Nanotechnology'
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

let failures = 0
const check = (label, ok, detail = '') => {
  if (ok) console.log('   ok  ' + label)
  else { failures++; console.log(' FAIL  ' + label + (detail ? '  [' + detail + ']' : '')) }
}
const near = (label, got, want) => check(label, Math.abs(got - want) <= Math.max(1, want * 0.06), `got ${Math.round(got)} want ~${Math.round(want)}`)

function openLive(page) {
  return page.evaluate(() => {
    document.querySelectorAll('header button')[2].click()
    return true
  })
}

const collectEditor = (page) => page.evaluate(() => {
  const aside = document.querySelector('aside')
  const card = document.querySelector('.flip-card')
  const face = card ? card.querySelector(':scope > div').children[0] : null
  const social = (label) => {
    const a = aside && aside.querySelector(`a[aria-label="${label}"]`)
    return !!(a && a.querySelector('svg'))
  }
  const nameEl = face && face.querySelector('[data-fit="1"]')
  return {
    cardW: card ? card.getBoundingClientRect().width : 0,
    nameFs: nameEl ? parseFloat(getComputedStyle(nameEl).fontSize) : NaN,
    shadow: face ? getComputedStyle(face).boxShadow : 'missing',
    socials: social('Instagram') && social('Viber') && social('Facebook'),
    legacySocials: !!(aside && aside.querySelector('a[aria-label="WhatsApp"], a[aria-label="Website"]')),
    locationInputs: [...document.querySelectorAll('input')].filter((i) => i.value === 'Brooklyn, NY').length,
    uploadBtn: [...document.querySelectorAll('button')].some((b) => /Upload photo|Change photo/.test(b.textContent)),
    savePreview: !!(aside && [...aside.querySelectorAll('button')].some((b) => b.textContent.includes('Save Contact'))),
    previewThumb: !!(aside && aside.querySelector('img[alt="Photo preview"]')),
    qrInPreview: !!(aside && aside.querySelector('[data-qr] svg')),
  }
})

const collectLive = (page) => page.evaluate(() => {
  const card = document.querySelector('.flip-card')
  const rect = card.getBoundingClientRect()
  const u = rect.width / 296
  const wrap = card.querySelector(':scope > div')
  const front = wrap.children[0]
  const back = wrap.children[1]
  const fs = (el) => (el ? parseFloat(getComputedStyle(el).fontSize) : NaN)
  const wd = (el) => (el ? parseFloat(getComputedStyle(el).width) : NaN)
  const lines = (el) => {
    const cs = getComputedStyle(el)
    const f = parseFloat(cs.fontSize)
    let lh = parseFloat(cs.lineHeight)
    if (!lh || lh < f * 0.5) lh = f * 1.25
    return Math.max(1, Math.round(el.scrollHeight / lh))
  }
  const name = front.querySelector('[data-fit="1"]')
  const company = front.querySelector('[data-fit="2"]')
  const badge = front.querySelector('[class*="28*var"]')
  const avatar = front.querySelector('.rounded-full.border-2')
  const arc = [...front.querySelectorAll('div')].find((d) => typeof d.className === 'string' && d.className.includes('size-[calc(160*var(--u))]'))
  const fits = [...back.querySelectorAll('[data-fit]')]
  const rowsCol = fits[1] && fits[1].parentElement
  const band = rowsCol && rowsCol.parentElement
  const footer = fits[4] && fits[4].parentElement
  const qr = back.querySelector('[data-qr]')
  const icon = fits[1] && fits[1].querySelector('svg')
  const tap = [...document.querySelectorAll('p')].find((p) => p.textContent.includes('Tap the card'))
  const tel = document.querySelector('a[href^="tel:"]')
  const grid = tel && tel.parentElement
  const social = (label) => {
    const a = document.querySelector(`a[aria-label="${label}"]`)
    return !!(a && a.querySelector('svg'))
  }
  const overflowOf = (face) => {
    const fr = face.getBoundingClientRect()
    let worst = 0
    for (const el of face.querySelectorAll('*')) {
      if (typeof el.className === 'string' && el.className.includes('pointer-events-none')) continue
      const r = el.getBoundingClientRect()
      if (!r.width && !r.height) continue
      worst = Math.max(worst, fr.top - r.top, r.bottom - fr.bottom, fr.left - r.left, r.right - fr.right)
    }
    return Math.round(worst * 10) / 10
  }
  const tapRect = tap ? tap.getBoundingClientRect() : null
  const gridRect = grid ? grid.getBoundingClientRect() : null
  const fitsOver = fits.map((el) => el.scrollWidth - el.clientWidth)
  return {
    u,
    cardW: rect.width,
    cardBottom: rect.bottom,
    nameFs: fs(name),
    nameOver: name ? name.scrollWidth - name.clientWidth : 99,
    companyFs: fs(company),
    companyLines: company ? lines(company) : 99,
    companyOver: company ? company.scrollWidth - company.clientWidth : 99,
    avatar: wd(avatar),
    avatarText: avatar ? avatar.textContent.trim() : '',
    avatarHasImg: !!(avatar && avatar.querySelector('img')),
    badge: wd(badge),
    badgeLetter: badge ? badge.textContent.trim() : '',
    arcBorder: arc ? parseFloat(getComputedStyle(arc).borderTopWidth) : NaN,
    arcSize: wd(arc),
    backCompanyFs: fs(fits[0]),
    backFitsOver: Math.max(...fitsOver.map((n) => Math.max(0, n))),
    backIcon: icon ? wd(icon) : NaN,
    qrSize: wd(qr),
    qrSvg: !!(qr && qr.querySelector('svg') && qr.querySelector('svg').innerHTML.length > 100),
    qrRight: !!(qr && rowsCol && qr.offsetLeft >= rowsCol.offsetLeft + rowsCol.offsetWidth - 2),
    locBelow: !!(band && footer && band.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1.5),
    companyAbove: !!(band && fits[0] && fits[0].getBoundingClientRect().bottom <= band.getBoundingClientRect().top + 1.5),
    noCardly: !back.textContent.includes('CARDLY'),
    shadow: getComputedStyle(front).boxShadow,
    gapTop: tapRect ? tapRect.top - rect.bottom : NaN,
    gapBottom: tapRect && gridRect ? gridRect.top - tapRect.bottom : NaN,
    tapFs: tap ? parseFloat(getComputedStyle(tap).fontSize) : 0,
    tapMt: tap ? parseFloat(getComputedStyle(tap).marginTop) : 0,
    tapMb: tap ? parseFloat(getComputedStyle(tap).marginBottom) : 0,
    gridW: gridRect ? gridRect.width : 0,
    socials: social('Instagram') && social('Viber') && social('Facebook'),
    overflow: Math.max(overflowOf(front), overflowOf(back)),
    saveBtn: !!([...document.querySelectorAll('button')].find((b) => b.textContent.includes('Save Contact'))),
  }
})

async function runViewport(browser, width, stress) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2, acceptDownloads: true })
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(400)
  console.log(`\n--- viewport ${width}px${stress ? ' [STRESS: long name/company]' : ''} ---`)

  const ed = await collectEditor(page)
  if (stress) {
    const setInput = async (idx, value) => {
      const input = page.locator('input:not([type=file])').nth(idx)
      await input.fill(value)
      await page.waitForTimeout(250)
      if ((await input.inputValue()) !== value) { await input.fill(value); await page.waitForTimeout(150) }
    }
    await setInput(0, LONG_NAME)
    await setInput(2, LONG_COMPANY)
  } else {
    check('editor: no card shadow', ed.shadow === 'none', ed.shadow)
    check('editor: preview socials are Instagram/Viber/Facebook svg', ed.socials)
    check('editor: legacy globe/website socials gone', !ed.legacySocials)
    check('editor: exactly ONE location input (dup removed)', ed.locationInputs === 1, `got ${ed.locationInputs}`)
    check('editor: photo upload button present', ed.uploadBtn)
    check('editor: Save Contact present in phone preview', ed.savePreview)
    check('editor: QR rendered in preview card', ed.qrInPreview)
    near('editor preview name scales with card', ed.nameFs, 24 * ed.cardW / DESIGN)
  }

  await openLive(page)
  await page.waitForSelector('.flip-card', { timeout: 5000 })
  await page.waitForTimeout(350)
  const m = await collectLive(page)
  const exp = m.u

  if (stress) {
    check('stress: name fits 1 line width', m.nameOver <= 1.5, `overflow ${m.nameOver}px`)
    check('stress: name never wraps (1 line)', m.nameFs > 0)
    check('stress: company fits within 2 lines', m.companyLines <= 2 && m.companyOver <= 1.5, `lines ${m.companyLines}, over ${m.companyOver}`)
    check('stress: back contact rows all fit one line', m.backFitsOver <= 1.5, `overflow ${m.backFitsOver}px`)
    check('stress: badge letter follows company', m.badgeLetter === 'I', `got "${m.badgeLetter}"`)
  } else {
    near('name font = 24u', m.nameFs, 24 * exp)
    near('company font = 12u', m.companyFs, 12 * exp)
    near('avatar = 48u', m.avatar, 48 * exp)
    near('badge box = 28u', m.badge, 28 * exp)
    near('arc ring width = 18u', m.arcBorder, 18 * exp)
    near('arc circle = 160u', m.arcSize, 160 * exp)
    near('back header font = 11u', m.backCompanyFs, 11 * exp)
    near('back row icon = 12u', m.backIcon, 12 * exp)
    near('QR box = 48u', m.qrSize, 48 * exp)
    check('avatar shows initials when no photo (AM)', m.avatarText === 'AM' && !m.avatarHasImg, m.avatarText)
    check('badge letter = first letter of company', m.badgeLetter === 'N', m.badgeLetter)
    check('name fits in 1 line (no width overflow)', m.nameOver <= 1.5, `overflow ${m.nameOver}px`)
    check('company fits in <=2 lines', m.companyLines <= 2 && m.companyOver <= 1.5, `lines ${m.companyLines}`)
    check('back contact rows all fit one line', m.backFitsOver <= 1.5, `overflow ${m.backFitsOver}px`)
  }
  check('back of card: no CARDLY text', m.noCardly)
  check('QR sits right of contact rows', m.qrRight)
  check('location moved below contact band (footer)', m.locBelow)
  check('header company sits above contact band', m.companyAbove)
  check('QR svg actually rendered', m.qrSvg)
  check('no card shadow (removed)', m.shadow === 'none', m.shadow)
  check('tap text >= 15px', m.tapFs >= 15, String(m.tapFs))
  check('tap text has margin top & bottom >= 16', m.tapMt >= 16 && m.tapMb >= 16, `mt ${m.tapMt} mb ${m.tapMb}`)
  check('gap card->tap equals tap->buttons', Math.abs(m.gapTop - m.gapBottom) <= 2, `${m.gapTop} vs ${m.gapBottom}`)
  check('call/email buttons width == card width', Math.abs(m.gridW - m.cardW) <= 2, `${Math.round(m.gridW)} vs ${Math.round(m.cardW)}`)
  check('live socials are Instagram/Viber/Facebook svg', m.socials)
  check('Save Contact button at bottom', m.saveBtn)
  check('no content overflows card faces', m.overflow <= 1.5, `${m.overflow}px`)

  return { page, m }
}

async function featuresPass(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, acceptDownloads: true })
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(400)
  console.log('\n--- feature pass: photo upload, QR scan, vCard download (1280px) ---')

  await page.setInputFiles('input[type="file"]', { name: 'me.png', mimeType: 'image/png', buffer: PNG_1PX })
  const cropOpened = await page.waitForSelector('text=Crop your photo', { timeout: 5000 }).then(() => true).catch(() => false)
  check('crop: crop dialog opens after choosing an image', cropOpened)
  const sliderCount = await page.locator('input[type="range"]').count()
  check('crop: zoom slider present', sliderCount === 1, 'count ' + sliderCount)
  if (cropOpened) await page.getByRole('button', { name: 'Apply photo' }).click()
  await page.waitForTimeout(500)
  const thumb = await page.evaluate(() => {
    const img = document.querySelector('img[alt="Photo preview"]')
    return { exists: !!img, dataUrl: !!(img && img.src.startsWith('data:image/')), w: img ? img.naturalWidth : 0, dialog: document.body.textContent.includes('Crop your photo') }
  })
  check('crop: dialog closes after applying', !thumb.dialog)
  check('photo: cropped 512px thumbnail in Personal details', thumb.exists && thumb.dataUrl && thumb.w === 512, JSON.stringify(thumb))
  const btnText = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Change photo/.test(x.textContent))
    return !!b
  })
  check('photo: upload button switches to "Change photo"', btnText)

  await openLive(page)
  await page.waitForSelector('.flip-card', { timeout: 5000 })
  await page.waitForTimeout(350)
  const avatar = await page.evaluate(() => {
    const card = document.querySelector('.flip-card')
    const front = card.querySelector(':scope > div').children[0]
    const av = front.querySelector('.rounded-full.border-2')
    const img = av && av.querySelector('img')
    return { hasImg: !!(img && img.src.startsWith('data:image')), text: av ? av.textContent.trim() : '' }
  })
  check('photo: uploaded image shows in card circle (no initials)', avatar.hasImg, JSON.stringify(avatar))

  // flip card and decode the QR from a screenshot
  await page.click('[aria-label="Flip card"]')
  await page.waitForTimeout(1000)
  const qrBox = await page.locator('[data-qr]').boundingBox()
  const shot = await page.locator('[data-qr]').screenshot()
  let decoded = ''
  try {
    const jsQR = require('jsqr')
    const { PNG } = require('pngjs')
    const png = PNG.sync.read(shot)
    const res = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
    decoded = res ? res.data : ''
  } catch (e) {
    decoded = 'DECODER-ERROR: ' + e.message
  }
  check('QR decodes to card URL', decoded === 'https://cardly.co/alex-morgan', `got "${decoded}" (box ${qrBox && Math.round(qrBox.width)}px)`)
  const flipped = await page.evaluate(() => {
    const back = document.querySelector('.flip-card').querySelector(':scope > div').children[1]
    const qr = back.querySelector('[data-qr]')
    const rows = [...back.querySelectorAll('[data-fit]')][1].parentElement
    return { qrLeft: qr.getBoundingClientRect().left, rowsRight: rows.getBoundingClientRect().right }
  })
  check('QR visually sits RIGHT of contact rows when flipped', flipped.qrLeft >= flipped.rowsRight - 1, JSON.stringify(flipped))

  // vCard download
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    page.getByRole('button', { name: 'Save Contact' }).click(),
  ])
  const fname = download.suggestedFilename()
  check('Save Contact downloads a .vcf', fname.endsWith('.vcf'), fname)
  if (fname.endsWith('.vcf')) {
    const path = await download.path()
    const body = require('fs').readFileSync(path, 'utf8')
    check('vCard content valid', body.includes('BEGIN:VCARD') && body.includes('FN:Alex Morgan') && body.includes('END:VCARD'), body.slice(0, 80).replace(/\r?\n/g, '|'))
  }
  await page.close()
}

;(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true })

  for (const width of [320, 414, 768, 1280]) {
    const { page } = await runViewport(browser, width, false)
    await page.close()
  }
  {
    const { page } = await runViewport(browser, 320, true)
    await page.close()
  }
  await featuresPass(browser)

  await browser.close()
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
})().catch((e) => { console.error(e); process.exit(1) })
