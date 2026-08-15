/* Coinfish - site interactions */
(function () {
  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('armed'); io.observe(el); });

  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---- Kit (newsletter / free Playbook) ----
  var KIT_ENDPOINT = 'https://app.kit.com/forms/9564802/subscriptions';

  function kitSubscribe(email, firstName) {
    var body = 'email_address=' + encodeURIComponent(email);
    if (firstName) body += '&first_name=' + encodeURIComponent(firstName);
    return fetch(KIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body
    });
  }
  window.__cfKit = kitSubscribe;

  // Custom-styled Kit signup forms (home + Playbook page). Class: kit-form
  document.querySelectorAll('form.kit-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = f.querySelector('input[type=email]');
      var name = f.querySelector('input[name=name]');
      var btn = f.querySelector('[type=submit]');
      if (!email || !email.value) return;
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      var done = function () { if (btn) btn.textContent = 'Check your email to confirm.'; f.reset(); };
      kitSubscribe(email.value, name ? name.value : '').then(done, done);
    });
  });

  // Contact form: also subscribe to Kit when the newsletter box is checked,
  // then let the form post normally to contact.php.
  var cf = document.querySelector('form[action="contact.php"]');
  if (cf) {
    cf.addEventListener('submit', function () {
      var optin = cf.querySelector('input[name=optin]');
      var email = cf.querySelector('input[type=email]');
      if (optin && optin.checked && email && email.value && navigator.sendBeacon) {
        try {
          var blob = new Blob(['email_address=' + encodeURIComponent(email.value)], { type: 'application/x-www-form-urlencoded' });
          navigator.sendBeacon(KIT_ENDPOINT, blob);
        } catch (e) {}
      }
    });
  }

  // Remaining demo forms (e.g., member login) - front-end only
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('[type=submit]');
      if (btn) { btn.textContent = 'Sent. We will be in touch.'; btn.disabled = true; }
      f.reset();
    });
  });
})();

/* Site-wide email capture bar (subscribes to Kit) */
(function () {
  var path = (location.pathname.split('/').pop() || 'index.html');
  var suppress = ['playbook.html', 'contact.html', 'login.html'];
  if (suppress.indexOf(path) !== -1) return;
  var dismissed = false;
  try { dismissed = localStorage.getItem('cf_bar') === '1'; } catch (e) {}
  if (dismissed) return;

  var bar = document.createElement('div');
  bar.className = 'sticky-bar';
  bar.innerHTML =
    '<div class="inner">' +
      '<div class="msg"><b>Free Options Playbook.</b> The defined-risk framework we trade, in your inbox.</div>' +
      '<form>' +
        '<input type="email" name="email" placeholder="you@email.com" required aria-label="Email">' +
        '<button type="submit" class="btn">Get it</button>' +
      '</form>' +
      '<button class="close" aria-label="Dismiss">&times;</button>' +
    '</div>';
  document.body.appendChild(bar);

  var close = function () {
    bar.classList.remove('show');
    try { localStorage.setItem('cf_bar', '1'); } catch (e) {}
  };
  bar.querySelector('.close').addEventListener('click', close);

  bar.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = bar.querySelector('input[type=email]');
    var b = bar.querySelector('button[type=submit]');
    if (!email || !email.value) return;
    if (b) { b.disabled = true; b.textContent = '...'; }
    var done = function () { if (b) b.textContent = 'Check your email'; setTimeout(close, 1600); };
    if (window.__cfKit) { window.__cfKit(email.value).then(done, done); } else { done(); }
  });

  setTimeout(function () { bar.classList.add('show'); }, 1200);
})();

/* Fix anchor jumps: lazy images + reveal sections shift layout after the
   browser's initial #hash jump, so re-scroll once everything has loaded. */
(function () {
  if (!location.hash) return;
  var id = location.hash.slice(1);
  var jump = function () {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  window.addEventListener('load', function () { setTimeout(jump, 80); });
})();

/* Platform logo marquee: clone the set once so the CSS loop is seamless */
(function () {
  var track = document.getElementById('lc-track');
  if (!track) return;
  var originals = track.children;
  var n = originals.length;
  for (var i = 0; i < n; i++) {
    var clone = originals[i].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    track.appendChild(clone);
  }
})();
