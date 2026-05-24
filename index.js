/**
 * index.js — Portfolio interaction layer
 *
 * Version History
 * ---------------
 * 2026-04-08 10:00  Initial version — theme toggle with two-phase radial wipe animation
 * 2026-04-08 12:00  Add auto dark/light mode based on local time of day (06:00–18:00 = light)
 * 2026-04-08 14:00  Add blog slide: manifest fetch, sidebar population, markdown rendering
 * 2026-04-08 16:00  Extract all JavaScript from index.html into this file
 * 2026-04-15 00:00  Port company detail expand view from noJS-rewrite; fix back-button state reset
 * 2026-04-16 00:00  Fix Esc dismiss: move keydown to module level; add keyCode fallback; esc-hint → label; tabindex on labels
 * 2026-05-21 00:00  Add Slide 5 markdown-driven project details (projects/<slug>.md, rendered via marked.js); Esc returns to work summary when the project view is open
 * 2026-05-21 00:00  Vendor marked.js locally (vendor/marked.min.js) — no CDN dependency; add load-failure handling
 */

/* ============================================================
 * THEME DETECTION — runs immediately on script load
 *
 * This block must execute synchronously before the browser
 * paints the first frame. Loading index.js in <head> without
 * defer/async guarantees that.
 * ============================================================ */

/**
 * Reads the user's local hour and sets data-theme on the <html>
 * element before paint so the correct colour scheme is applied on
 * the very first frame — no flash of the wrong theme.
 *
 * The attribute goes on <html> (document.documentElement), not
 * <body>: this script runs in <head> before <body> is parsed, so
 * document.body is still null at this point.
 *
 * Rule: 06:00–17:59 local time → 'light'; 18:00–05:59 → 'dark'.
 */
(function () {
  var h = new Date().getHours();
  document.documentElement.dataset.theme = (h >= 6 && h < 18) ? 'light' : 'dark';
}());

/* ============================================================
 * THEME TOGGLE
 * ============================================================ */

/**
 * Toggles the site between light and dark mode using a two-phase
 * radial wipe animation that originates from the top-right corner.
 *
 * Phase 1 — A fixed overlay div expands its clip-path from
 *            circle(0%) to circle(150%), covering the entire
 *            viewport over 0.6 s.
 * Phase 2 — Once fully covered, the <html> data-theme is switched.
 *            The overlay then contracts back to circle(0%),
 *            revealing the newly-themed page beneath it.
 *
 * Accessibility: if the user has requested reduced motion
 * (prefers-reduced-motion: reduce), the theme switches instantly
 * with no animation.
 *
 * This function is called directly from the theme-toggle button
 * in index.html via onclick="toggleTheme()".
 */
function toggleTheme() {
  var isDark      = document.documentElement.dataset.theme === 'dark';
  var targetTheme = isDark ? 'light' : 'dark';
  var targetBg    = isDark ? '#ffffff' : '#000000';

  /* Instant fallback for reduced-motion preference. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.theme = targetTheme;
    return;
  }

  /* Create a full-screen overlay that starts as a point at top-right. */
  var overlay = document.createElement('div');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText =
    'position:fixed;inset:0;background:' + targetBg +
    ';clip-path:circle(0% at 100% 0%);z-index:99998;pointer-events:none;';
  document.body.appendChild(overlay);

  /* Phase 1: expand overlay to cover screen (next frame to trigger transition). */
  requestAnimationFrame(function () {
    overlay.style.transition = 'clip-path 0.6s cubic-bezier(0.77, 0, 0.175, 1)';
    overlay.style.clipPath = 'circle(150% at 100% 0%)';
  });

  overlay.addEventListener('transitionend', function onExpand() {
    overlay.removeEventListener('transitionend', onExpand);

    /* Apply the theme while the screen is fully covered. */
    document.documentElement.dataset.theme = targetTheme;

    /* Phase 2: contract overlay to reveal the new theme. */
    requestAnimationFrame(function () {
      overlay.style.transition = 'clip-path 0.6s cubic-bezier(0.77, 0, 0.175, 1)';
      overlay.style.clipPath = 'circle(0% at 100% 0%)';
    });

    /* Remove the overlay once the contraction is complete. */
    overlay.addEventListener('transitionend', function () {
      overlay.remove();
    }, { once: true });
  });
}

/* ============================================================
 * BLOG
 * ============================================================ */

/**
 * Cached result of the blog/manifest.json fetch.
 * Null until the blog slide is first visited; prevents duplicate fetches.
 * @type {{ posts: Array<{ title: string, date: string, file: string }> } | null}
 */
var blogManifest = null;

/**
 * Flag that tracks whether marked.js has been loaded.
 * Avoids appending a second <script> tag on subsequent loads.
 * @type {boolean}
 */
var markedReady = false;

/**
 * Lazily loads the marked.js Markdown-to-HTML parser.
 *
 * marked is vendored locally at vendor/marked.min.js so the site has
 * no runtime CDN dependency — it works offline and on GitHub Pages
 * regardless of network. On the first call a <script> tag is injected;
 * once it loads, markedReady is set and cb runs. Subsequent calls
 * invoke cb immediately. If the script fails to load, onErr (when
 * supplied) is invoked so callers can surface an error instead of
 * waiting forever.
 *
 * @param {Function} cb - Called once marked.js is available.
 * @param {Function} [onErr] - Called if the script fails to load.
 */
function loadMarked(cb, onErr) {
  if (markedReady) { cb(); return; }
  var s = document.createElement('script');
  s.src = './vendor/marked.min.js';
  s.onload = function () { markedReady = true; cb(); };
  s.onerror = function () { if (onErr) onErr(); };
  document.head.appendChild(s);
}

/**
 * Converts an ISO 8601 date string to a human-readable date-and-time string
 * using the browser's built-in Intl formatter.
 *
 * Example: "2026-04-08T10:00:00" → "April 8, 2026 · 10:00 AM"
 *
 * @param {string} iso - ISO date string from the blog manifest.
 * @returns {string} Formatted string in the form "Month D, YYYY · HH:MM AM/PM".
 */
function formatBlogDate(iso) {
  var d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
         ' · ' +
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Escapes the characters &, <, and > in a string so it is safe to
 * interpolate into an innerHTML assignment without creating unintended
 * HTML or enabling XSS via manifest-supplied post titles.
 *
 * @param {string} s - Untrusted string to sanitise.
 * @returns {string} HTML-entity-escaped string.
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Selects a blog post and renders it in the right content panel (#blog-content).
 *
 * Steps:
 *  1. Marks the corresponding sidebar button as active (adds .blog-nav-item--active).
 *  2. Shows a "Loading…" placeholder in the content panel.
 *  3. Fetches the post's Markdown file from the blog/ directory.
 *  4. Loads marked.js if not already available.
 *  5. Parses the Markdown and injects title, formatted date, and body HTML.
 *     Falls back to an error message if the fetch fails.
 *
 * This function is called from onclick attributes injected into sidebar
 * buttons by initBlog(), so it must remain a global function.
 *
 * @param {number} index - Zero-based index of the post in blogManifest.posts.
 */
function activateBlogPost(index) {
  var post = blogManifest.posts[index];

  /* Highlight the active sidebar item. */
  document.querySelectorAll('.blog-nav-item').forEach(function (el, i) {
    el.classList.toggle('blog-nav-item--active', i === index);
  });

  /* Show loading state immediately. */
  var content = document.getElementById('blog-content');
  content.innerHTML = '<p class="blog-empty">Loading\u2026</p>';

  /* Fetch the Markdown source file and render it. */
  fetch('./blog/' + post.file)
    .then(function (r) { return r.text(); })
    .then(function (md) {
      loadMarked(function () {
        content.innerHTML =
          '<h1 class="blog-post-title">' + escapeHtml(post.title) + '</h1>' +
          '<p class="blog-post-date">' + formatBlogDate(post.date) + '</p>' +
          '<div class="blog-post-body">' + marked.parse(md) + '</div>';
      });
    })
    .catch(function () {
      content.innerHTML = '<p class="blog-empty">Could not load post.</p>';
    });
}

/**
 * Initialises the blog slide by fetching blog/manifest.json and
 * building the sidebar post list.
 *
 * Behaviour:
 *  - Guard: returns immediately if blogManifest is already populated
 *    (prevents re-fetching if the user navigates away and back).
 *  - On success: populates #blog-sidebar with one <button> per post,
 *    each showing the post title and formatted date, then auto-loads
 *    the first post via activateBlogPost(0).
 *  - On empty manifest: shows "No posts yet." in the sidebar.
 *  - On fetch failure: shows "No posts yet." in the sidebar and
 *    clears the content panel.
 */
function initBlog() {
  if (blogManifest) return;

  fetch('./blog/manifest.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      blogManifest = data;
      var sidebar = document.getElementById('blog-sidebar');

      if (!data.posts || !data.posts.length) {
        sidebar.innerHTML = '<p class="blog-empty">No posts yet.</p>';
        return;
      }

      /* Build one nav button per post. */
      sidebar.innerHTML = data.posts.map(function (post, i) {
        return '<button class="blog-nav-item" onclick="activateBlogPost(' + i + ')" aria-label="' + escapeHtml(post.title) + '">' +
          '<span class="blog-nav-title">' + escapeHtml(post.title) + '</span>' +
          '<span class="blog-nav-date">' + formatBlogDate(post.date) + '</span>' +
          '</button>';
      }).join('');

      /* Auto-select the first post. */
      activateBlogPost(0);
    })
    .catch(function () {
      document.getElementById('blog-sidebar').innerHTML = '<p class="blog-empty">No posts yet.</p>';
      document.getElementById('blog-content').innerHTML = '';
    });
}

/* ============================================================
 * PROJECT DETAILS — Slide 5
 *
 * Each company "Read More" label carries a data-project slug and
 * triggers the s5_fwd carousel state. The matching markdown file
 * (projects/<slug>.md) is fetched, rendered with marked.js, and
 * injected into #project-detail-content. Rendered blocks are tagged
 * .project-detail__item so the CSS cascade entrance applies to them.
 * ============================================================ */

/**
 * Ordered project slugs — defines pivot ordering and direction for
 * switchProject and keyboard navigation.
 * @type {string[]}
 */
var PIVOT_SLUGS = ['goldman', 'rga', 'sva', 'torry', 'other'];

/**
 * Display labels for each slug, used when building the pivot header.
 * @type {Object<string,string>}
 */
var PIVOT_LABELS = {
  goldman: 'Goldman Sachs',
  rga:     'R/GA',
  sva:     'SVA',
  torry:   'Torry Harris',
  other:   'Other Work'
};

/**
 * Rendered-HTML cache keyed by project slug. Avoids re-fetching and
 * re-parsing markdown when a project is revisited.
 * @type {Object<string,string>}
 */
var projectCache = {};

/**
 * Slug of the project currently being shown. Used to discard a stale
 * fetch result if the user opens a different project before the
 * previous markdown request resolves.
 * @type {string|null}
 */
var currentProject = null;

/**
 * True while a pivot slide animation is in progress. Prevents a second
 * switchProject call from starting until the pivot has settled and the
 * focus colour has been applied (~500 ms after a click).
 * @type {boolean}
 */
var pivotAnimating = false;

/**
 * Injects rendered markdown into the content container: rewrites
 * relative image paths so markdown can reference files relative to
 * the projects/ directory, then tags each top-level block with
 * .project-detail__item so the staggered cascade entrance applies.
 *
 * @param {HTMLElement} container - The #project-detail-content element.
 * @param {string} html - HTML produced by marked.parse().
 */
function renderProjectContent(container, html) {
  container.innerHTML = html;

  container.querySelectorAll('img').forEach(function (img) {
    var src = img.getAttribute('src') || '';
    if (src && !/^(https?:)?\/\//.test(src) && src.charAt(0) !== '/') {
      img.setAttribute('src', 'projects/' + src.replace(/^\.\//, ''));
    }
  });

  var kids = container.children;
  for (var i = 0; i < kids.length; i++) {
    kids[i].classList.add('project-detail__item');
  }
}

/**
 * Returns how far the active item sits from the track's left edge (in px),
 * accounting for any existing transform already applied to the track.
 * Uses getBoundingClientRect so the existing transform cancels out in
 * the difference (itemRect.left − trackRect.left = natural offset).
 *
 * @param {HTMLElement} track - The .project-detail__pivot-track element.
 * @param {string}      slug  - The slug of the item to measure.
 * @returns {number} Pixels to translateX(-n) to pin slug at the left edge.
 */
function computePivotOffset(track, slug) {
  var idx = PIVOT_SLUGS.indexOf(slug);
  if (idx <= 0) return 0;
  var items = track.querySelectorAll('.project-detail__pivot-item');
  if (!items[idx]) return 0;
  var trackRect = track.getBoundingClientRect();
  var itemRect  = items[idx].getBoundingClientRect();
  return itemRect.left - trackRect.left;
}

/**
 * Ensures the pivot track exists (creates it on the first call) then
 * updates the active class and snaps the track offset — no animation,
 * no DOM reorder. Buttons are created once in canonical PIVOT_SLUGS
 * order and never moved.
 *
 * @param {string} slug - The currently active project slug.
 */
function buildPivotHeader(slug) {
  var header = document.getElementById('project-pivot-header');
  if (!header) return;

  var track = header.querySelector('.project-detail__pivot-track');
  if (!track) {
    track = document.createElement('div');
    track.className = 'project-detail__pivot-track';
    track.innerHTML = PIVOT_SLUGS.map(function (s) {
      return '<button class="project-detail__pivot-item" data-project="' + s +
             '" role="tab" aria-selected="false">' + escapeHtml(PIVOT_LABELS[s]) + '</button>';
    }).join('');
    header.appendChild(track);
    track.querySelectorAll('.project-detail__pivot-item').forEach(function (btn) {
      btn.addEventListener('click', function () { switchProject(this.dataset.project); });
    });
  }

  track.querySelectorAll('.project-detail__pivot-item').forEach(function (btn) {
    var active = btn.dataset.project === slug;
    btn.classList.toggle('project-detail__pivot-item--active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  var offset = computePivotOffset(track, slug);
  track.style.transform = 'translateX(' + (-offset) + 'px)';
}

/**
 * Slides the pivot track so the target item reaches the left edge,
 * then applies the focus colour, then invokes onFocused.
 *
 * Sequence:
 *  1. Remove --active from all items (muted during slide).
 *  2. Compute the translateX needed to bring slug to position 0.
 *  3. Animate the track with a CSS transition (350 ms).
 *  4. After the slide, add --active to slug (colour appears, 150 ms).
 *  5. Invoke onFocused.
 *
 * The track DOM order never changes — items always stay in canonical
 * PIVOT_SLUGS order. Only the track's translateX changes.
 *
 * @param {string}   slug      - The new active project slug.
 * @param {Function} onFocused - Called once the focus colour has settled.
 */
function slidePivotToFocus(slug, onFocused) {
  var header = document.getElementById('project-pivot-header');
  if (!header) { onFocused(); return; }

  var track = header.querySelector('.project-detail__pivot-track');
  if (!track) { buildPivotHeader(slug); onFocused(); return; }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    buildPivotHeader(slug);
    onFocused();
    return;
  }

  /* Step 1: mute all items while sliding */
  track.querySelectorAll('.project-detail__pivot-item').forEach(function (btn) {
    btn.classList.remove('project-detail__pivot-item--active');
    btn.setAttribute('aria-selected', 'false');
  });

  /* Steps 2–3: compute offset and animate the track */
  var offset = computePivotOffset(track, slug);
  track.style.transition = 'transform 350ms var(--ease-metro)';
  track.style.transform  = 'translateX(' + (-offset) + 'px)';

  /* Step 4: after slide — activate focus colour */
  setTimeout(function () {
    track.style.transition = '';
    var slugBtn = track.querySelector('[data-project="' + slug + '"]');
    if (slugBtn) {
      slugBtn.classList.add('project-detail__pivot-item--active');
      slugBtn.setAttribute('aria-selected', 'true');
    }
    /* Step 5: after colour transition (150 ms) — signal content ready */
    setTimeout(onFocused, 150);
  }, 350);
}

/**
 * Loads and displays a company's project case study on Slide 5.
 *
 * Sets the per-company modifier class (which drives the title
 * colour), serves cached HTML when available, otherwise fetches the
 * markdown, loads marked.js, parses, caches, and renders it. A
 * stale-result guard prevents a slow fetch from overwriting a newer
 * selection.
 *
 * @param {string} slug - Project slug, e.g. "rga".
 */
function loadProjectDetail(slug) {
  currentProject = slug;

  document.getElementById('project-detail').className =
    'project-detail project-detail--' + slug;

  buildPivotHeader(slug);

  var content = document.getElementById('project-detail-content');

  if (projectCache[slug]) {
    renderProjectContent(content, projectCache[slug]);
    return;
  }

  content.innerHTML = '<p class="project-detail__empty">Loading…</p>';

  function fail(message) {
    if (currentProject === slug) {
      content.innerHTML = '<p class="project-detail__empty">' + message + '</p>';
    }
  }

  fetch('./projects/' + slug + '.md')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function (md) {
      loadMarked(function () {
        var html = marked.parse(md);
        projectCache[slug] = html;
        if (currentProject === slug) renderProjectContent(content, html);
      }, function () {
        fail('Could not load the page renderer.');
      });
    })
    .catch(function () {
      fail('Could not load this project.');
    });
}

/**
 * Switches to a new project with a three-phase animation:
 *
 *  Phase 1 — FLIP slide (350 ms): pivot items slide to new positions,
 *             target item moves to the far left.
 *  Phase 2 — Focus colour (150 ms): target item's brand colour appears.
 *  Phase 3 — Content swap (250 + 250 ms): scroll container leaves,
 *             new markdown loads, scroll container enters.
 *
 * Guarded by pivotAnimating so rapid clicks / arrow keys during phase 1+2
 * are ignored. Guard releases at the start of phase 3 so a subsequent
 * switch can begin once the pivot has settled.
 *
 * No-op if the requested project is already active.
 *
 * @param {string} slug - Project slug to switch to.
 */
function switchProject(slug) {
  if (slug === currentProject || pivotAnimating) return;

  var oldIndex = PIVOT_SLUGS.indexOf(currentProject);
  var newIndex = PIVOT_SLUGS.indexOf(slug);
  var forward  = newIndex > oldIndex;

  pivotAnimating = true;
  currentProject = slug;
  document.getElementById('project-detail').className =
    'project-detail project-detail--' + slug;

  /* Phase 1+2: track slides left, then focus colour */
  slidePivotToFocus(slug, function () {
    pivotAnimating = false;

    /* Phase 3: content swap */
    var content = document.getElementById('project-detail-content');
    content.classList.remove(
      'project-detail__scroll--leaving-left',
      'project-detail__scroll--leaving-right',
      'project-detail__scroll--entering-from-right',
      'project-detail__scroll--entering-from-left'
    );

    var leavingClass  = forward ? 'project-detail__scroll--leaving-left'
                                : 'project-detail__scroll--leaving-right';
    var enteringClass = forward ? 'project-detail__scroll--entering-from-right'
                                : 'project-detail__scroll--entering-from-left';

    content.classList.add(leavingClass);
    setTimeout(function () {
      content.classList.remove(leavingClass);
      loadProjectDetail(slug);
      content.classList.add(enteringClass);
      setTimeout(function () {
        content.classList.remove(enteringClass);
      }, 250);
    }, 250);
  });
}

/* ============================================================
 * INITIALISATION — deferred until the DOM is fully parsed
 * ============================================================ */

/**
 * Company detail reset on Escape key.
 * Registered at module level (not inside DOMContentLoaded) so it is
 * attached before any user interaction and is not at risk of being
 * skipped if later init code throws. getElementById is called lazily
 * inside the handler so it is safe to attach before the DOM is ready.
 *
 * CSS :has() drives the expand animation; this resets the radio state
 * so the CSS reverts. The "Hit Esc to go back" label elements in the
 * HTML provide a click-based fallback that works purely via CSS.
 *
 * When the project-details slide (Slide 5) is open, Escape instead
 * steps back to the work-summary slide via the s2_from5_bwd state,
 * leaving the company detail expanded.
 */
document.addEventListener('keydown', function (e) {
  var s5 = document.getElementById('s5_fwd');
  var onSlide5 = s5 && s5.checked;

  if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
    if (onSlide5) {
      if (currentProject) {
        var coLast = document.getElementById('co_' + currentProject);
        if (coLast) coLast.checked = true;
      }
      var s5back = document.getElementById('s2_from5_bwd');
      if (s5back) s5back.checked = true;
      return;
    }
    var coNone = document.getElementById('co_none');
    if (coNone) coNone.checked = true;
    return;
  }

  /* Arrow keys on Slide 5 step through the pivot sections (clamp, no wrap). */
  if (onSlide5 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    var idx     = PIVOT_SLUGS.indexOf(currentProject);
    var nextIdx = idx + (e.key === 'ArrowRight' ? 1 : -1);
    if (nextIdx < 0 || nextIdx >= PIVOT_SLUGS.length) return;
    e.preventDefault();
    switchProject(PIVOT_SLUGS[nextIdx]);
  }
});

document.addEventListener('DOMContentLoaded', function () {

  /**
   * Blog lazy-init: listen for the s4_fwd radio input being checked
   * (triggered when the user clicks the "Blog" link on the links slide)
   * and call initBlog() the first time it happens.
   */
  document.getElementById('s4_fwd').addEventListener('change', function () {
    if (this.checked) initBlog();
  });

  /**
   * Wire each company "Read More" label to load its project markdown.
   * The label's `for` attribute drives the s5_fwd turnstile state;
   * this listener loads the matching case study in parallel.
   */
  document.querySelectorAll('.company-detail__read-more[data-project]').forEach(function (el) {
    el.addEventListener('click', function () {
      loadProjectDetail(this.dataset.project);
    });
  });

  /**
   * Persist the last-viewed company when returning via the slide-5
   * back button so the work-summary opens with that company
   * expanded rather than the originally clicked one.
   */
  var s5BackBtn = document.querySelector('.slide-5 .back-btn');
  if (s5BackBtn) {
    s5BackBtn.addEventListener('click', function () {
      if (currentProject) {
        var coLast = document.getElementById('co_' + currentProject);
        if (coLast) coLast.checked = true;
      }
    });
  }

  /**
   * Reset company detail state whenever the user leaves Slide 2, regardless
   * of which carousel state they navigate to. Covers back button (s1_bwd),
   * direct home (s1_fwd via #back hash), and all forward paths away from
   * Slide 2 (s3_fwd, s1_from3_bwd, s4_fwd, s3_from4_bwd).
   */
  ['s1_bwd', 's1_fwd', 's3_fwd', 's1_from3_bwd', 's4_fwd', 's3_from4_bwd'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () {
      var coNone = document.getElementById('co_none');
      if (coNone) coNone.checked = true;
    });
  });

  /**
   * Hash-based backward navigation:
   * If the page URL contains #back (e.g. navigated here from an external
   * link that should land on the index slide), programmatically activate
   * the S2→S1 backward transition by setting s2_bwd then s1_bwd.
   * The double requestAnimationFrame ensures the browser registers
   * both state changes as separate transitions.
   */
  if (location.hash === '#back') {
    var s2bwd = document.getElementById('s2_bwd');
    var s1bwd = document.getElementById('s1_bwd');
    s2bwd.checked = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        s1bwd.checked = true;
      });
    });
  }
});
