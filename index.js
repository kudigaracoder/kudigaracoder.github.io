/**
 * index.js — Portfolio interaction layer
 *
 * Version History
 * ---------------
 * 2026-04-08 10:00  Initial version — theme toggle with two-phase radial wipe animation
 * 2026-04-08 12:00  Add auto dark/light mode based on local time of day (06:00–18:00 = light)
 * 2026-04-08 14:00  Add blog slide: manifest fetch, sidebar population, markdown rendering
 * 2026-04-08 16:00  Extract all JavaScript from index.html into this file
 */

/* ============================================================
 * THEME DETECTION — runs immediately on script load
 *
 * This block must execute synchronously before the browser
 * paints the first frame. Loading index.js in <head> without
 * defer/async guarantees that.
 * ============================================================ */

/**
 * Reads the user's local hour and sets body[data-theme] before
 * paint so the correct colour scheme is applied on the very first
 * frame — no flash of the wrong theme.
 *
 * Rule: 06:00–17:59 local time → 'light'; 18:00–05:59 → 'dark'.
 */
(function () {
  var h = new Date().getHours();
  document.body.dataset.theme = (h >= 6 && h < 18) ? 'light' : 'dark';
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
 * Phase 2 — Once fully covered, body[data-theme] is switched.
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
  var isDark      = document.body.dataset.theme === 'dark';
  var targetTheme = isDark ? 'light' : 'dark';
  var targetBg    = isDark ? '#ffffff' : '#000000';

  /* Instant fallback for reduced-motion preference. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.dataset.theme = targetTheme;
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
    document.body.dataset.theme = targetTheme;

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
 * Flag that tracks whether marked.js has been loaded from CDN.
 * Avoids appending a second <script> tag on subsequent post loads.
 * @type {boolean}
 */
var markedReady = false;

/**
 * Lazily loads the marked.js Markdown-to-HTML parser from jsDelivr CDN.
 *
 * On the first call a <script> tag is injected into <head>. Once the
 * script fires its onload event, markedReady is set to true and the
 * callback is invoked. Subsequent calls skip the injection and invoke
 * the callback immediately.
 *
 * @param {Function} cb - Function to call once marked.js is available.
 */
function loadMarked(cb) {
  if (markedReady) { cb(); return; }
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
  s.onload = function () { markedReady = true; cb(); };
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
 * INITIALISATION — deferred until the DOM is fully parsed
 * ============================================================ */

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
