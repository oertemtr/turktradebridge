/* ExportTurk AI Assistant — v2
 * Intent-driven, knowledge-aware sourcing chat.
 * Drop-in replacement for the existing inline chat script.
 *
 * Deploy: upload this file to the repo root, then on every HTML page
 * delete the old chat <script>...</script> block (the one that contains
 * the function sendInquiryEmail) and replace it with:
 *   <script src="chatbot-v2.js" defer></script>
 *
 * The HTML markup (.chat-bubble, .chat-window, .chat-messages,
 * .chat-footer input, .chat-footer button) stays exactly the same.
 */
(function () {
  'use strict';

  // ============== KNOWLEDGE BASE ==============
  // One entry per product family. Add or refine entries here as needed —
  // every change is reflected across all pages instantly.
  const KB = {
    'sea bass': {
      keys: ['sea bass', 'seabass', 'levrek', ' bass'],
      name: 'European Sea Bass (Levrek)',
      page: 'fish-seafood.html',
      forms: 'Chilled · Frozen · Fillet (skin-on, skinless, butterfly, twin)',
      sizes: 'Whole gutted: 200/300 · 300/400 · 400/600 · 600/800 · 800/1000 · 1000/1500 g. Fillets: 50/80 · 80/100 · 100/140 · 140/180 g.',
      certs: 'EU approved, HACCP, BRC, IFS, ASC, halal on request, FDA registered.',
      shelfLife: '8–10 days from packing with unbroken cold chain.',
      examples: ['Form (chilled / frozen / fillet)', 'Size grade (e.g. 400/600 g)', 'Destination port or airport (e.g. ICN, NRT, DXB)', 'Required certifications']
    },
    'sea bream': {
      keys: ['sea bream', 'seabream', 'cipura', 'çipura', ' bream', 'gilthead', 'orata'],
      name: 'Gilthead Sea Bream (Çipura)',
      page: 'fish-seafood.html',
      forms: 'Chilled · Frozen · Fillet (skin-on, skinless, butterfly, twin)',
      sizes: '200/300 · 300/400 · 400/600 · 600/800 · 800/1000 · 1000/1500 g (whole gutted).',
      examples: ['Form', 'Size grade', 'Destination', 'Certifications required']
    },
    'trout': {
      keys: ['trout', 'rainbow trout', 'alabalik', 'alabalık'],
      name: 'Rainbow Trout',
      page: 'fish-seafood.html',
      forms: 'Whole · Fillet · Smoked · Retail packs',
      sizes: 'Whole: 200/300 · 300/400 · 400/600 g. Fillets: 50/80 · 80/120 g.',
      examples: ['Form', 'Size', 'Destination', 'Retail vs bulk packing']
    },
    'meagre': {
      keys: ['meagre', 'corvina', 'royal sea bass', 'argyrosomus'],
      name: 'Mediterranean Meagre / Corvina',
      page: 'fish-seafood.html',
      forms: 'Whole gutted · Fillet skin-on (PBO / PBI)',
      sizes: '800/1000 · 1000/2000 · 2000/3000 · 3000/4000 · 4000/5000 g.',
      examples: ['Size grade', 'Form', 'Destination', 'Certifications']
    },
    'tuna': {
      keys: ['tuna', 'bluefin', 'thunnus'],
      name: 'Bluefin Tuna · Sashimi Grade',
      page: 'fish-seafood.html',
      forms: 'Whole · Loin · Block cut · Sashimi grade only',
      examples: ['Grade required (#1 / #2)', 'Cut (whole / loin / saku)', 'Destination']
    },
    'hazelnut': {
      keys: ['hazelnut', 'hazelnuts', 'findik', 'fındık'],
      name: 'Turkish Hazelnuts',
      page: 'nuts-biscuits.html',
      forms: 'Raw in-shell · Shelled · Roasted · Blanched · Paste · Flour · Chopped/diced/sliced',
      sizes: 'Calibres 9/11, 11/13, 13/15 mm shelled; in-shell by grade.',
      certs: 'BRC, IFS, organic available, halal, kosher on request.',
      examples: ['Form (in-shell / shelled / roasted / paste)', 'Calibre (e.g. 11/13 mm)', 'Crop year preference', 'Packing (25 kg bag / 12.5 kg vacuum / 50 kg jumbo)', 'Quantity (kg / containers)']
    },
    'pistachio': {
      keys: ['pistachio', 'pistachios', 'antep', 'fistik'],
      name: 'Antep Pistachios',
      page: 'nuts-biscuits.html',
      forms: 'In-shell roasted salted · Shelled raw kernels · Green peeled · Paste',
      examples: ['Form', 'Size grade', 'Roasted/salted/raw', 'Quantity']
    },
    'dried fig': {
      keys: ['dried fig', 'figs', 'incir', 'fig'],
      name: 'Turkish Dried Figs (Aydın / Nazilli)',
      page: 'nuts-biscuits.html',
      forms: 'Natural sun-dried · Layer pack · Lerida · Pulled',
      examples: ['Grade (Lerida #1, #2, etc.)', 'Packing (5 kg layer, 10 kg bulk)', 'Quantity']
    },
    'bumper': {
      keys: ['bumper', 'bumpers'],
      name: 'Automotive Bumpers',
      page: 'auto-parts.html',
      forms: 'Front · Rear · OEM original · Aftermarket replacement · Raw primer · Pre-painted',
      certs: 'OEM tooling from Ford, Toyota, Hyundai production lines available.',
      examples: [
        'Vehicle make / model / year (e.g. Ford Focus 2018, Toyota Corolla 2020)',
        'Front or rear',
        'OEM part number if available',
        'With or without parking sensor / fog lamp / camera holes',
        'Finish: raw (paint-ready primer) or pre-painted',
        'Quantity per model / monthly volume',
        'Destination port'
      ]
    },
    'auto parts': {
      keys: ['auto part', 'auto parts', 'car part', 'car parts', 'spare part', 'spare parts', 'vehicle part'],
      name: 'Auto Parts & Vehicle Components',
      page: 'auto-parts.html',
      forms: 'Body (bumpers, fenders, doors), drivetrain (axles, CV joints), brakes, suspension, engine (pistons, turbos), wheels, alternators, lighting, harness, exhaust',
      examples: ['Vehicle make / model / year', 'Part name + OEM number', 'OEM original or aftermarket', 'Quantity per part', 'Destination']
    },
    'headlight': {
      keys: ['headlight', 'headlamp', 'head lamp', 'taillight', 'rear light'],
      name: 'Headlights & Tail Lights',
      page: 'auto-parts.html',
      forms: 'Halogen · LED · Xenon HID · OEM original · Aftermarket replacement',
      examples: ['Vehicle make / model / year', 'Halogen / LED / Xenon', 'Left / right or pair', 'OEM number if known', 'Quantity']
    },
    'wheel': {
      keys: ['wheel', 'wheels', 'rim', 'alloy wheel'],
      name: 'Alloy & Steel Wheels',
      page: 'auto-parts.html',
      forms: 'Forged alloy · Cast alloy · Steel · 14"–22"',
      examples: ['Diameter & width (e.g. 18"x7.5")', 'Bolt pattern (PCD)', 'Offset (ET)', 'Forged or cast', 'Quantity']
    },
    'transformer': {
      keys: ['transformer', 'transformers', 'distribution transformer', 'power transformer'],
      name: 'Power Transformers',
      page: 'transformers-cables.html',
      forms: 'Distribution (50 kVA – 2,500 kVA), Power transmission (10 MVA – 100 MVA+), Dry-type, Oil-immersed, Pole-mounted, Pad-mounted, Cast resin',
      certs: 'IEC 60076 / IEEE / GOST / SABS — full compliance package available.',
      examples: [
        'kVA / MVA rating',
        'Primary / secondary voltage (e.g. 33 / 0.4 kV)',
        'Cooling type (ONAN / ONAF / dry-type cast resin)',
        'Vector group (e.g. Dyn11)',
        'Standard (IEC 60076 / IEEE / GOST)',
        'Country of installation',
        'Quantity'
      ]
    },
    'cable': {
      keys: ['cable', 'cables', 'conductor', ' wire'],
      name: 'Power Cables & Conductors',
      page: 'transformers-cables.html',
      forms: 'XLPE insulated (LV / MV / HV), PVC, armoured (SWA / AWA), fire-resistant, submarine, solar PV, ACSR / AAC / AAAC overhead conductors',
      examples: ['Voltage rating', 'Number of cores + cross-section (e.g. 3 × 240 mm²)', 'Insulation type (XLPE / PVC)', 'Armoured or not', 'Length (km)']
    },
    'copper': {
      keys: ['copper', 'cathode', 'wire rod', 'brass'],
      name: 'Copper Products & Brass Alloys',
      page: 'copper-products.html',
      forms: 'LME Grade A cathode 99.99%, copper wire rod 8 mm, ACR tubes, plumbing tubes, copper-nickel marine tubes, brass rods/sheets/valves',
      examples: ['Form (cathode / rod / tube / fitting)', 'Purity / grade', 'Quantity (tons)', 'Destination port', 'Pricing reference (LME date)']
    },
    'petroleum': {
      keys: ['petroleum', 'diesel', 'jet fuel', 'bitumen', 'lpg', 'base oil', 'gasoline', 'fuel oil', 'naphtha'],
      name: 'Refined Petroleum',
      page: 'petroleum-aromatics.html',
      forms: 'Gasoline (RON 92/95/98), Diesel EN 590, Jet A-1, Fuel oil, LPG, Bitumen 60/70 / 80/100, Base oils (SN150/SN500), Lubricants, Naphtha',
      examples: ['Product + specification', 'Quantity & lifting schedule', 'Discharge port', 'Inspection company (SGS / BV)', 'Payment terms (LC / TT)']
    },
    'mining': {
      keys: ['mining', 'metal', 'metals', 'zinc', 'chromium', 'chrome', 'ferro', 'cobalt', 'chromite', 'feldspar', 'boron'],
      name: 'Mining & Metals',
      page: 'mining-metals.html',
      forms: 'Zinc ingot SHG 99.995%, ferro-chromium (HC / LC), ferro-silicon, ferro-manganese, cobalt carbonate, chromite ore, feldspar, boron minerals, silicon metal',
      examples: ['Product + grade (e.g. HC FeCr 60–70% Cr)', 'Quantity (tons)', 'Specification certificate required', 'Destination', 'Inspection']
    }
  };

  // ============== INTENT DETECTION ==============
  const INTENTS = {
    catalog:  /\bcatalog(ue|s)?\b|\bbrochur|\bdata\s*sheet|product\s*(list|sheet|range)|pdf/i,
    price:    /\bprice|\bpricing|\bcost|\brate\b|\bquote|how\s+much|\busd|\beur\b|\$|tariff|expensive|cheap/i,
    spec:     /\bspec|specification|\bdetail|tell me about|describe|info on|info about|what.*available|examples?/i,
    sample:   /\bsample|\btrial|test order|small order|first order/i,
    shipping: /\bship|deliver|freight|logistic|incoterm|\bfob\b|\bcif\b|\bcfr\b|\bair\b|\bsea\s*freight|\bcontainer|reefer|lead\s*time/i,
    cert:     /\bcertif|\biso\b|\bhaccp\b|\bce\b|\bfda\b|\bbrc\b|\bhalal\b|kosher|organic|origin\s*cert/i,
    payment:  /payment|\blc\b|letter of credit|\btt\b|\bt\/t\b|advance|deposit|terms/i,
    contact:  /human|person|talk to|speak to|representative|sales|agent|whatsapp/i,
    greet:    /^(hi|hello|hey|good (morning|afternoon|evening)|hola|salaam|namaste|merhaba|你好|안녕)/i,
    thanks:   /^(thank|thanks|cheers|appreciate)/i,
    bye:      /^(bye|goodbye|see you|see ya)/i,
    no:       /^(no|nope|not (yet|now)|later|maybe)\b/i,
    yes:      /^(yes|yeah|yep|sure|okay|ok|please|definitely)\b/i,
    email:    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    newInquiry: /^(new (inquiry|product|question)|another|different product|change)/i
  };

  function detectProduct(msg) {
    const lower = ' ' + msg.toLowerCase() + ' ';
    let best = null, bestLen = 0;
    for (const [productKey, info] of Object.entries(KB)) {
      for (const k of info.keys) {
        if (lower.includes(k) && k.length > bestLen) {
          best = productKey;
          bestLen = k.length;
        }
      }
    }
    return best;
  }

  function detectIntent(msg) {
    const hits = [];
    for (const [name, pattern] of Object.entries(INTENTS)) {
      if (pattern.test(msg)) hits.push(name);
    }
    return hits;
  }

  // ============== STATE ==============
  const state = {
    product: null,
    quantity: null,
    country: null,
    email: null,
    infoDelivered: false,        // Has the user received product info yet?
    expectingEmailNext: false,   // Are we specifically waiting for an email reply?
    history: []
  };

  // ============== RESPONSE BUILDERS ==============
  function respondCatalog(productKey) {
    if (productKey && KB[productKey]) {
      const info = KB[productKey];
      return 'Our <strong>' + info.name + '</strong> catalogue is on the dedicated product page — ' +
        '<a href="' + info.page + '" target="_blank" style="color:#0d7377;font-weight:600;">' + info.page + '</a>. ' +
        'I can also email the full PDF catalogue. If you\'d like that, just share your email address.';
    }
    return 'We have detailed product pages and PDF catalogues for each line:<br>' +
      '• <a href="fish-seafood.html" style="color:#0d7377;">Fish &amp; Seafood</a><br>' +
      '• <a href="auto-parts.html" style="color:#0d7377;">Auto Parts &amp; Vehicle Components</a><br>' +
      '• <a href="nuts-biscuits.html" style="color:#0d7377;">Hazelnuts, Pistachios &amp; Dried Fruits</a><br>' +
      '• <a href="transformers-cables.html" style="color:#0d7377;">Power Transformers &amp; Cables</a><br>' +
      '• <a href="copper-products.html" style="color:#0d7377;">Copper Products</a><br>' +
      '• <a href="petroleum-aromatics.html" style="color:#0d7377;">Petroleum &amp; Aromatics</a><br>' +
      '• <a href="mining-metals.html" style="color:#0d7377;">Mining &amp; Metals</a><br><br>' +
      'Which line interests you most?';
  }

  function respondSpec(productKey) {
    if (!productKey) {
      return 'Sure — which product line are you looking at? We cover <strong>auto parts (incl. bumpers, headlights, wheels), fish &amp; seafood, hazelnuts &amp; nuts, transformers, copper, petroleum products and mining metals</strong>. Tell me the product and I\'ll share examples.';
    }
    const info = KB[productKey];
    let s = 'Here\'s an overview of our <strong>' + info.name + '</strong> range:';
    if (info.forms)     s += '<br><br><strong>Forms / variants:</strong> ' + info.forms;
    if (info.sizes)     s += '<br><strong>Typical sizes:</strong> ' + info.sizes;
    if (info.certs)     s += '<br><strong>Certifications:</strong> ' + info.certs;
    if (info.shelfLife) s += '<br><strong>Shelf life:</strong> ' + info.shelfLife;
    s += '<br><br>To prepare a tailored quotation we usually need:<br>• ' + info.examples.join('<br>• ');
    s += '<br><br>For pricing, MOQ and lead time, please contact our trade team at <a href="mailto:info@exportturk.com" style="color:#0d7377;font-weight:600;">info@exportturk.com</a> with the details above — they will return a formal quotation within 24 hours. You can also share your email here and I will route the inquiry to them.';
    return s;
  }

  function respondPrice(productKey) {
    const subject = (productKey && KB[productKey]) ? KB[productKey].name : 'our products';
    let s = 'Pricing for <strong>' + subject + '</strong> is set per inquiry. It depends on exact specification, volume, packing, Incoterm (FOB / CIF / CFR), destination port, certifications, delivery timeline and current market conditions.';
    s += '<br><br>For a formal quotation, please email <a href="mailto:info@exportturk.com" style="color:#0d7377;font-weight:600;">info@exportturk.com</a> with your product details, target quantity and destination — our trade team will respond within 24 hours.';
    s += '<br><br>Or share your email here and I will route the inquiry to them on your behalf.';
    return s;
  }

  function respondMoq(productKey) {
    const subject = (productKey && KB[productKey]) ? KB[productKey].name : 'our products';
    return 'Minimum order quantities for <strong>' + subject + '</strong> depend on the exact specification, packing and destination. For an accurate MOQ specific to your inquiry, please contact our trade team at <a href="mailto:info@exportturk.com" style="color:#0d7377;font-weight:600;">info@exportturk.com</a> with your product details — they will confirm what works for your shipment.';
  }

  function respondShipping() {
    return 'We arrange both <strong>air freight</strong> (perishables &amp; high-value parts — 2–4 day door-to-door globally) and <strong>sea freight</strong> (20 ft / 40 ft / reefer containers — 15–35 day transit). We quote on <strong>FOB Turkey</strong>, <strong>CFR</strong> or <strong>CIF</strong> any major port. Customs, certificates of origin, veterinary &amp; health certificates and pre-shipment inspection (SGS / BV) are handled by our team. What\'s your destination port or airport?';
  }

  function respondCert() {
    return 'Our supplier network covers <strong>ISO 9001 &amp; 14001, CE, HACCP, BRC, IFS, FDA registration, ASC, halal &amp; kosher</strong> certifications depending on the product. We can issue Certificate of Origin (Turkish Chamber of Commerce), EUR.1, A.TR movement certificates, and book pre-shipment inspection by SGS or Bureau Veritas. Which certification do you need specifically?';
  }

  function respondSample(productKey) {
    const subject = (productKey && KB[productKey]) ? KB[productKey].name : 'the product you are sourcing';
    return 'Sample availability for <strong>' + subject + '</strong> depends on the supplier, season and specification. To request a sample please email <a href="mailto:info@exportturk.com" style="color:#0d7377;font-weight:600;">info@exportturk.com</a> with the product, target specification and your delivery address — our trade team will confirm whether a sample shipment is possible and the terms.';
  }

  function respondPayment() {
    return 'Payment terms are agreed per transaction based on order size and customer history. Common arrangements include T/T (telegraphic transfer) and LC (letter of credit). For exact terms on your order, please contact our trade team at <a href="mailto:info@exportturk.com" style="color:#0d7377;font-weight:600;">info@exportturk.com</a>.';
  }

  function respondContact() {
    return 'Of course. You can reach our team directly:<br>' +
      '• Email: <strong>info@exportturk.com</strong><br>' +
      '• WhatsApp: <a href="https://wa.me/905323541129" target="_blank" style="color:#25D366;font-weight:bold;">+90 532 354 11 29</a><br><br>' +
      'Or share your email here and our trade specialist will reach out within 24 hours.';
  }

  function summaryAfterEmail() {
    const productInfo = state.product && KB[state.product] ? KB[state.product].name : (state.product || 'your inquiry');
    return 'Thank you! I\'ve forwarded your inquiry on <strong>' + productInfo + '</strong> to our trade team at <strong>' + state.email + '</strong>. ' +
      'You\'ll hear from us within 24 hours.<br><br>' +
      'In the meantime, feel free to ask anything else — more specs, alternative products, certifications, lead times, or you can WhatsApp us at <a href="https://wa.me/905323541129" target="_blank" style="color:#25D366;font-weight:bold;">+90 532 354 11 29</a>.';
  }

  // ============== MAIN HANDLER ==============
  function handleMessage(msg) {
    state.history.push({ user: msg });

    // Update product context if mentioned
    const product = detectProduct(msg);
    if (product) state.product = product;

    const intents = detectIntent(msg);

    // Reset for new inquiry
    if (intents.includes('newInquiry')) {
      state.product = null;
      state.infoDelivered = false;
      state.expectingEmailNext = false;
      return 'No problem — fresh start. What product line are you sourcing this time? <strong>Auto parts, seafood, hazelnuts, transformers, copper, petroleum, or mining metals</strong>.';
    }

    // Email detection — only consume as email if the user clearly typed one
    const emailMatch = msg.match(INTENTS.email);
    if (emailMatch && (state.infoDelivered || state.expectingEmailNext)) {
      state.email = emailMatch[0];
      state.expectingEmailNext = false;
      sendInquiryEmail();
      return summaryAfterEmail();
    }

    // Pure greeting
    if (intents.includes('greet') && !state.product) {
      return 'Hello! I\'m the ExportTurk sourcing assistant. I can share <strong>product specifications, available forms, certifications, shipping options and catalogues</strong> for our seven lines: auto parts, fish &amp; seafood, hazelnuts &amp; nuts, transformers &amp; cables, copper, petroleum, and mining metals. For pricing and formal quotations, our trade team handles inquiries directly at info@exportturk.com. What are you sourcing today?';
    }

    if (intents.includes('thanks')) {
      return 'You\'re welcome. Anything else — product specifications, shipping options, certifications, or shall I route your inquiry to our trade team?';
    }

    if (intents.includes('bye')) {
      return 'Goodbye! Reach us any time at <strong>info@exportturk.com</strong> or WhatsApp <strong>+90 532 354 11 29</strong>.';
    }

    if (intents.includes('catalog')) {
      state.infoDelivered = true;
      state.expectingEmailNext = true;
      return respondCatalog(state.product);
    }
    if (intents.includes('spec'))     { state.infoDelivered = true; return respondSpec(state.product); }
    if (intents.includes('price'))    { state.infoDelivered = true; return respondPrice(state.product); }
    if (intents.includes('moq'))      { state.infoDelivered = true; return respondMoq(state.product); }
    if (intents.includes('shipping')) { state.infoDelivered = true; return respondShipping(); }
    if (intents.includes('cert'))     { state.infoDelivered = true; return respondCert(); }
    if (intents.includes('sample'))   { state.infoDelivered = true; return respondSample(state.product); }
    if (intents.includes('payment'))  { state.infoDelivered = true; return respondPayment(); }
    if (intents.includes('contact'))  { state.expectingEmailNext = true; return respondContact(); }

    // Product mentioned but no specific intent — give the spec overview as default
    if (state.product && !state.infoDelivered) {
      state.infoDelivered = true;
      return respondSpec(state.product) + '<br><br>I can also share our <strong>PDF catalogue</strong>, certifications, or shipping options — just ask. For pricing and quotations, our trade team handles inquiries at info@exportturk.com.';
    }

    // Yes/No follow-ups after offering pricing or catalogue
    if (intents.includes('yes') && state.product) {
      return respondPrice(state.product);
    }
    if (intents.includes('no')) {
      return 'No problem. Is there anything else I can help with — different product, certifications, shipping options?';
    }

    // Soft ask for email — only after info has been delivered
    if (state.infoDelivered && !state.email) {
      state.expectingEmailNext = true;
      return 'If you\'d like a tailored quotation in writing, share your email and I\'ll route this to our trade team — they\'ll respond within 24 hours. Or WhatsApp us at <strong>+90 532 354 11 29</strong>.';
    }

    // Truly unrecognised input
    return 'Let me help — are you looking for product <strong>specifications</strong>, <strong>certifications</strong>, <strong>shipping options</strong>, or a <strong>catalogue</strong>? Or you can name the product (e.g. "front bumper Ford Focus 2018", "11/13 mm shelled hazelnut", "1000 kVA distribution transformer") and I\'ll share what I have. For pricing and quotations, our trade team replies within 24 hours at info@exportturk.com.';
  }

  // ============== EMAIL SUBMIT ==============
  function sendInquiryEmail() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/69b53c158db9d43da53fbec96388447c';
    form.style.display = 'none';

    const transcript = state.history.map(h => '> ' + h.user).join('\n');

    const fields = {
      _subject: 'New AI Assistant Inquiry — ExportTurk (' + (state.product || 'General') + ')',
      _cc: 'tamer.gundogan@gmail.com',
      _captcha: 'false',
      _template: 'table',
      _autoresponse: 'Thank you for your inquiry! Our ExportTurk team will contact you within 24 hours.',
      'Product Line': state.product ? (KB[state.product] ? KB[state.product].name : state.product) : 'Not specified',
      'Customer Email': state.email || 'Not provided',
      'Chat Transcript': transcript,
      Source: 'AI Assistant v2',
      Page: window.location.href
    };

    for (const k in fields) {
      const i = document.createElement('input');
      i.type = 'hidden';
      i.name = k;
      i.value = fields[k];
      form.appendChild(i);
    }

    const iframe = document.createElement('iframe');
    iframe.name = 'sub-iframe-' + Date.now();
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    form.target = iframe.name;
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => {
      try { document.body.removeChild(form); document.body.removeChild(iframe); } catch (e) {}
    }, 3000);
  }

  // ============== UI WIRING ==============
  function init() {
    // Use IDs (present on every page) with class-name fallbacks
    const oldBubble = document.getElementById('chat-toggle') || document.querySelector('.chat-bubble');
    const oldWindow = document.getElementById('chat-window') || document.querySelector('.chat-window');
    if (!oldBubble || !oldWindow) {
      console.warn('[chatbot-v2] missing chat-bubble or chat-window — init aborted');
      return;
    }
    console.log('[chatbot-v2] init OK — replacing chat widget');

    // CLONE the entire bubble AND chat-window. This is what breaks the old
    // inline chat: the old script's references (chatToggle, chatWindow,
    // chatSend, chatInput, chatMessages) and the MutationObserver on
    // chat-window all become attached to DETACHED elements after replaceChild.
    const newBubble = oldBubble.cloneNode(true);
    oldBubble.parentNode.replaceChild(newBubble, oldBubble);

    const newWindow = oldWindow.cloneNode(true);
    oldWindow.parentNode.replaceChild(newWindow, oldWindow);
    newWindow.style.display = 'none';  // start hidden regardless of old state

    // Re-acquire children from the CLONED window
    const chatWindow = newWindow;
    const chatMessages = newWindow.querySelector('#chat-messages')
      || newWindow.querySelector('.chat-messages');
    const chatInput = newWindow.querySelector('#chat-input')
      || newWindow.querySelector('.chat-footer input')
      || newWindow.querySelector('.chat-input-area input')
      || newWindow.querySelector('input[type="text"]');
    const newSendBtn = newWindow.querySelector('#chat-send')
      || newWindow.querySelector('.chat-footer button')
      || newWindow.querySelector('.chat-input-area button')
      || newWindow.querySelector('button');
    const newInput = chatInput;

    if (!chatMessages || !chatInput || !newSendBtn) {
      console.warn('[chatbot-v2] could not find children inside cloned chat-window', {
        chatMessages: !!chatMessages, chatInput: !!chatInput, newSendBtn: !!newSendBtn
      });
      return;
    }

    // Clear any messages the old code may have queued
    chatMessages.innerHTML = '';

    let opened = false;
    function addMsg(text, sender) {
      const div = document.createElement('div');
      div.className = 'message ' + sender;
      div.innerHTML = '<div class="message-bubble">' + text + '</div>';
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    newBubble.addEventListener('click', () => {
      const visible = chatWindow.style.display === 'flex';
      chatWindow.style.display = visible ? 'none' : 'flex';
      if (!visible && !opened) {
        addMsg('Hi! I\'m the ExportTurk sourcing assistant. Ask me about <strong>specifications, available forms, certifications, shipping options or catalogues</strong> for any of our product lines (auto parts, fish &amp; seafood, hazelnuts, transformers, copper, petroleum, mining metals). For pricing and formal quotations, our trade team replies within 24 hours at <strong>info@exportturk.com</strong>. What are you sourcing today?', 'bot');
        opened = true;
      }
    });

    function handleSend() {
      const msg = newInput.value.trim();
      if (!msg) return;
      addMsg(msg, 'user');
      newInput.value = '';
      setTimeout(() => {
        const reply = handleMessage(msg);
        addMsg(reply, 'bot');
      }, 250);
    }

    newSendBtn.addEventListener('click', handleSend);
    newInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

    // RFQ form on category pages — make it actually deliver to FormSubmit + show success message
    const rfqForm = document.getElementById('rfq-form');
    if (rfqForm) {
      // Ensure the form posts into a hidden iframe so the page doesn't redirect
      let iframe = document.getElementById('rfq-target-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'rfq-target-iframe';
        iframe.name = 'rfq-target-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }
      rfqForm.target = 'rfq-target-iframe';

      // Replace any existing submit listeners by cloning
      const newForm = rfqForm.cloneNode(true);
      newForm.target = 'rfq-target-iframe';
      rfqForm.parentNode.replaceChild(newForm, rfqForm);

      newForm.addEventListener('submit', function () {
        // Let the form submit naturally to FormSubmit (no preventDefault)
        const formMessage = document.getElementById('form-message');
        if (formMessage) {
          formMessage.textContent = 'Thank you! Your RFQ has been submitted. We will contact you within 24 hours.';
          formMessage.className = 'form-message success';
          setTimeout(() => { formMessage.className = 'form-message'; }, 6000);
        }
        setTimeout(() => { newForm.reset(); }, 800);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
