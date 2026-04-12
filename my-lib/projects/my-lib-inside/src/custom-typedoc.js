/**
 * @fileoverview TypeDoc sidebar fix - Clean version
 * @version 3.6.0 - Dynamic SVG colors + site-menu scroll fix
 */

(function () {
  var _processing = false;
  var _observer = null;

  function getSvgColorFromGradient(gradient) {
    var match = gradient.match(/#[0-9a-f]{6}/g);
    return match ? match[0] : '#3b82f6';
  }

  var CATEGORY_ICONS = {
  'Components': { gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
  'Services': { gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  'Interfaces': { gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)' },
  'Pipes': { gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  'Constants': { gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  'Utils': { gradient: 'linear-gradient(135deg, #49ae5d, #1c8f33)' },
  'Other': { gradient: 'linear-gradient(135deg, #5776a2, #64748b)' }
};

  var DEFAULT_ICON = { gradient: 'linear-gradient(135deg, #94a3b8, #64748b)' };

  function saveSidebarScroll() {
    var siteMenu = document.querySelector('.site-menu');
    if (siteMenu) {
      sessionStorage.setItem('typedoc_sidebar_scroll', siteMenu.scrollTop);
    }
  }

  function restoreSidebarScroll() {
    var saved = sessionStorage.getItem('typedoc_sidebar_scroll');
    if (saved !== null) {
      var siteMenu = document.querySelector('.site-menu');
      if (siteMenu) {
        siteMenu.scrollTop = parseInt(saved);
      }
    }
  }

  function saveOpenCategories() {
    var openCategories = [];
    var container = document.querySelector('#tsd-nav-container');
    if (!container) return;

    var details = container.querySelectorAll('details.tsd-accordion');
    details.forEach(function (detail) {
      if (detail.open) {
        var summary = detail.querySelector('.tsd-accordion-summary');
        if (summary) {
          var catText = summary.textContent.trim();
          var catMatch = catText.match(/[A-Za-z]+/);
          if (catMatch) openCategories.push(catMatch[0]);
        }
      }
    });
    sessionStorage.setItem('typedoc_open_categories', JSON.stringify(openCategories));
  }

  function restoreOpenCategories(container) {
    var saved = sessionStorage.getItem('typedoc_open_categories');
    if (!saved) return;
    var openCategories = JSON.parse(saved);
    var details = container.querySelectorAll('details.tsd-accordion');
    details.forEach(function (detail) {
      var summary = detail.querySelector('.tsd-accordion-summary');
      if (summary) {
        var catText = summary.textContent.trim();
        if (openCategories.some(function (cat) { return catText.includes(cat); })) {
          detail.setAttribute('open', '');
        }
      }
    });
  }

  function getCleanNameFromUrl(url) {
    var filename = url.split('/').pop().replace(/\.html$/, '');
    var clean = filename
      .replace(/^[a-z]+_/, '')
      .replace(/\.component$/, '')
      .replace(/\.service$/, '')
      .replace(/\.directive$/, '')
      .replace(/\.pipe$/, '')
      .replace(/\.interface$/, '')
      .replace(/\.model$/, '')
      .replace(/\.enum$/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2');

    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  
function getCategoryFromLink(link) {
  var href = link.getAttribute('href') || '';
  var name = href.toLowerCase();
  var text = link.textContent.trim().toLowerCase();
  var fullText = link.textContent.trim();

  // REGOLA SPECIFICA PER InputComponentMap
  if (fullText === 'InputComponentMap') {
    return 'Utils';
  }

  // CONSTANTS
  if (name.includes('utils_constants_') || name.includes('constants_') || 
      text.includes('constant') || text.includes('constants') || 
      name.includes('.constant')) {
    return 'Constants';
  }
  
  // UTILS
  if (text.includes('util') || text.includes('utils') || name.includes('.util') || name.includes('utils')) {
    return 'Utils';
  }

  // 1 PRIORITÀ: filename
  if (name.includes('.component')) return 'Components';
  if (name.includes('.service')) return 'Services';
  if (name.includes('.pipe')) return 'Pipes';
  if (name.includes('.interface')) return 'Interfaces';
  
  // 2 FALLBACK: tipo TypeDoc
  var kindIcon = link.querySelector('.tsd-kind-icon');
  if (kindIcon) {
    var label = (kindIcon.getAttribute('aria-label') || '').toLowerCase();

    if (label.includes('class') || label.includes('component')) return 'Components';
    if (label.includes('service')) return 'Services';
    if (label.includes('interface')) return 'Interfaces';
    if (label.includes('pipe')) return 'Pipes';
    if (label.includes('constant')) return 'Constants';
    if (label.includes('util') || label.includes('utils')) return 'Utils';
    if (label.includes('function') || label.includes('method') || label.includes('call')) return 'Utils';
    if (label.includes('variable')) return 'Constants';
  }

  // FALLBACK PER FILE CON INPUT-COMPONENT-MAP NEL NOME
  if (name.includes('input-component-map')) {
    return 'Utils';
  }

  return 'Other';
}

  function extractEntriesFromSidebar() {
    var categoryMap = {};
    var processed = {};
    var allLinks = document.querySelectorAll('#tsd-nav-container a');

    allLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || processed[href]) return;
      if (href.match(/\/modules\/[^\/]+\.html$/) && !href.includes('#')) {
        processed[href] = true;
        return;
      }

      var category = getCategoryFromLink(link);
      var cleanName = getCleanNameFromUrl(href);
      var label = link.textContent.trim();

      if (!label || label === cleanName.toLowerCase() || label.includes('/')) {
        label = cleanName;
      }

      label = label
        .replace(/\.component$/i, '')
        .replace(/\.service$/i, '')
        .replace(/\.directive$/i, '')
        .replace(/\.pipe$/i, '')
        .replace(/\.interface$/i, '')
        .replace(/\.model$/i, '')
        .replace(/\.enum$/i, '');

      var isCurrent =
        link.classList.contains('current') ||
        link.getAttribute('aria-current') === 'page' ||
        window.location.pathname === href;

      if (!categoryMap[category]) categoryMap[category] = [];

      var exists = categoryMap[category].some(function (e) { return e.label === label; });
      if (!exists) {
        categoryMap[category].push({ href: href, label: label, isCurrent: isCurrent });
      }
      processed[href] = true;
    });

    return categoryMap;
  }

  function getCategoryOrderFromDOM(categoryMap) {
    var order = [];
    var container = document.querySelector('#tsd-nav-container');

    if (container) {
      var topDetails = container.querySelectorAll(':scope > li > details.tsd-accordion');
      topDetails.forEach(function (detail) {
        var summary = detail.querySelector(':scope > summary');
        if (summary) {
          var summaryText = summary.textContent.trim();
          var catMatch = summaryText.match(/[A-Z][a-z]+/g);
          if (catMatch && catMatch[0] && categoryMap[catMatch[0]]) {
            order.push(catMatch[0]);
          }
        }
      });
    }

    Object.keys(categoryMap).forEach(function (cat) {
      if (order.indexOf(cat) === -1) order.push(cat);
    });

    return order;
  }

  function rebuildSidebar() {
    if (_processing) return;

    var container = document.querySelector('#tsd-nav-container');
    if (!container) return;

    _processing = true;
    var categoryMap = extractEntriesFromSidebar();

    var total = Object.keys(categoryMap).reduce(function (s, k) { return s + categoryMap[k].length; }, 0);
    if (total === 0) {
      _processing = false;
      return;
    }

    var sortedCats = getCategoryOrderFromDOM(categoryMap);
    var newUl = document.createElement('ul');
    newUl.className = container.className;
    newUl.id = 'tsd-nav-container';

    sortedCats.forEach(function (catName) {
      var entries = categoryMap[catName];
      if (!entries || entries.length === 0) return;

      var info = CATEGORY_ICONS[catName] || DEFAULT_ICON;
      var hasActive = entries.some(function (e) { return e.isCurrent; });

      var li = document.createElement('li');
      var details = document.createElement('details');
      details.className = 'tsd-accordion';
      if (hasActive) details.setAttribute('open', '');

      var summary = document.createElement('summary');
      summary.className = 'tsd-accordion-summary';
      summary.style.cssText = 'cursor:pointer;user-select:none;';

      var svgColor = getSvgColorFromGradient(info.gradient);

      summary.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="pointer-events:none;transition:transform 0.2s;stroke:' + svgColor + ';stroke-width:2;">' +
          '<path d="M6 9l6 6 6-6" stroke="' + svgColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<span style="display:inline-flex;align-items:center;gap:10px;font-weight:600;padding:6px 0;pointer-events:none">' +
        '<span style="background:' + info.gradient + ';background-clip:text;-webkit-background-clip:text;color:transparent;font-size:1rem;">' + catName + '</span>' +
        '<span style="margin-left:auto;font-size:0.7rem;color:#64748b;">' + entries.length + '</span>' +
        '</span>';

      var div = document.createElement('div');
      div.className = 'tsd-accordion-details';

      var ul = document.createElement('ul');
      ul.className = 'tsd-nested-navigation';

      entries.sort(function (a, b) { return a.label.localeCompare(b.label); });

      entries.forEach(function (entry) {
        var eLi = document.createElement('li');
        var a = document.createElement('a');
        a.href = entry.href;
        if (entry.isCurrent) {
          a.className = 'current';
          a.setAttribute('aria-current', 'page');
        }
        a.innerHTML = '<span>' + entry.label + '</span>';
        eLi.appendChild(a);
        ul.appendChild(eLi);
      });

      div.appendChild(ul);
      details.appendChild(summary);
      details.appendChild(div);
      li.appendChild(details);
      newUl.appendChild(li);
    });

    container.parentNode.replaceChild(newUl, container);

    restoreOpenCategories(document.querySelector('#tsd-nav-container'));
    restoreSidebarScroll();
    
    _processing = false;
  }

  function setupClickHandlers() {
    var container = document.querySelector('#tsd-nav-container');
    if (!container) return;

    container.addEventListener('click', function (e) {
      var summary = e.target.closest('.tsd-accordion-summary');
      if (summary) {
        e.preventDefault();
        e.stopPropagation();
        var details = summary.closest('details.tsd-accordion');
        if (details) {
          if (details.hasAttribute('open')) {
            details.removeAttribute('open');
          } else {
            details.setAttribute('open', '');
          }
          saveOpenCategories();
          saveSidebarScroll();
        }
        return false;
      }
      saveOpenCategories();
      saveSidebarScroll();
    }, true);
  }

  function observeSidebar() {
    var container = document.querySelector('#tsd-nav-container');
    if (!container) return;
    if (_observer) _observer.disconnect();

    setupClickHandlers();
}

  function init() {
    function checkAndInit() {
      var container = document.querySelector('#tsd-nav-container');
      if (container && container.querySelector('a')) {
        rebuildSidebar();
        observeSidebar();
        return true;
      }
      return false;
    }

    if (checkAndInit()) return;

    var observer = new MutationObserver(function (mutations, obs) {
      if (checkAndInit()) obs.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () {
      observer.disconnect();
      checkAndInit();
    }, 5000);
  }

  window.addEventListener('beforeunload', function () {
    saveOpenCategories();
    saveSidebarScroll();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ========================================
  // SEZIONE "ON THIS PAGE" - COLORI E ICONE
  // ========================================
  
  function colorizeOnThisPageIcons() {
    var summaries = document.querySelectorAll('.tsd-page-navigation .tsd-accordion-summary[data-key]');
    
    var colors = {
      'section-Constructors': '#2563eb',
      'section-Properties': '#7c3aed',
      'section-Methods': '#dc2626'
    };
    
    summaries.forEach(function(summary) {
      var dataKey = summary.getAttribute('data-key');
      var color = colors[dataKey];
      
      if (color) {
        var textNode = Array.from(summary.childNodes).find(function(node) {
          return node.nodeType === 3 && node.textContent.trim().length > 0;
        });
        
        if (textNode) {
          var text = textNode.textContent;
          var span = document.createElement('span');
          span.textContent = text;
          span.style.color = color;
          summary.replaceChild(span, textNode);
        } else {
          var textSpan = summary.querySelector('span:not([style*="margin"])');
          if (textSpan && !textSpan.querySelector('svg')) {
            textSpan.style.color = color;
          }
        }
        
        var svg = summary.querySelector('svg');
        if (svg) {
          var useElement = svg.querySelector('use');
          if (useElement) {
            var newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            newSvg.setAttribute('width', '16');
            newSvg.setAttribute('height', '16');
            newSvg.setAttribute('viewBox', '0 0 24 24');
            newSvg.setAttribute('fill', 'none');
            newSvg.style.stroke = color;
            newSvg.style.transition = 'transform 0.2s ease';
            
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M6 9l6 6 6-6');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.setAttribute('fill', 'none');
            
            newSvg.appendChild(path);
            svg.parentNode.replaceChild(newSvg, svg);
          }
        }
      }
    });
  }

  function resizeAndAlignIcons() {
    // Solo ridimensiona e centra le icone esistenti
    var icons = document.querySelectorAll('.tsd-page-navigation-section .tsd-kind-icon');
    
    icons.forEach(function(icon) {
      // Ridimensiona l'icona a 16x16 (più piccola)
      icon.setAttribute('width', '16');
      icon.setAttribute('height', '16');
      
      // Centra verticalmente
      icon.style.verticalAlign = 'middle';
      
      // Spazio a destra per separare dall'etichetta
      icon.style.marginRight = '6px';
      
      // Evita che si restringa
      icon.style.flexShrink = '0';
      
      // Assicura che mantenga le proporzioni
      icon.style.display = 'inline-block';
    });
  }
  
  function initOnThisPageColors() {
    colorizeOnThisPageIcons();
    resizeAndAlignIcons();
    
    var observer = new MutationObserver(function() {
      colorizeOnThisPageIcons();
      resizeAndAlignIcons();
    });
    
    var pageNav = document.querySelector('.tsd-page-navigation');
    if (pageNav) {
      observer.observe(pageNav, { childList: true, subtree: true });
    }
  }
  
  // Avvia l'inizializzazione quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnThisPageColors);
  } else {
    // Se il DOM è già caricato, esegui subito
    initOnThisPageColors();
  }
  
  // Fallback: esegui anche dopo un breve ritardo per sicurezza
  setTimeout(function() {
    initOnThisPageColors();
  }, 500);

})();