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
  if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
    var s5 = document.getElementById('s5_fwd');
    if (s5 && s5.checked) {
      var s5back = document.getElementById('s2_from5_bwd');
      if (s5back) s5back.checked = true;
      return;
    }
    var coNone = document.getElementById('co_none');
    if (coNone) coNone.checked = true;
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
