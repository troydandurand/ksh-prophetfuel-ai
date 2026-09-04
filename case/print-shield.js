// PRINT SHIELD — Attorney Work-Product Print Banner
// Injects print-only header + footer with privilege declaration on every printed page.
// Screen: invisible. Print: bold top + bottom bands on every physical page or PDF export.
// D-S337-EXT7-VAULT · KYLE SCOTT HARRIS DEFENSE
(function () {
  var css = document.createElement('style');
  css.textContent = [
    '@media print {',
    '  html, body { margin: 0 !important; }',
    '  @page { margin: 0.75in 0.6in 0.75in 0.6in; }',
    '  .print-shield-top, .print-shield-bottom {',
    '    position: fixed;',
    '    left: 0; right: 0;',
    '    background: #fff !important;',
    '    color: #000 !important;',
    '    font-family: "Cinzel", Georgia, serif;',
    '    font-weight: 900;',
    '    text-align: center;',
    '    border-style: solid;',
    '    border-color: #000;',
    '    z-index: 999999;',
    '    -webkit-print-color-adjust: exact;',
    '    print-color-adjust: exact;',
    '  }',
    '  .print-shield-top {',
    '    top: 0;',
    '    padding: 4pt 10pt;',
    '    font-size: 8pt;',
    '    letter-spacing: 1.2pt;',
    '    border-width: 0 0 2px 0;',
    '  }',
    '  .print-shield-bottom {',
    '    bottom: 0;',
    '    padding: 4pt 10pt;',
    '    font-size: 7pt;',
    '    letter-spacing: 1pt;',
    '    border-width: 2px 0 0 0;',
    '  }',
    '}',
    '@media screen {',
    '  .print-shield-top, .print-shield-bottom { display: none !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  function inject() {
    if (document.querySelector('.print-shield-top')) return;

    var top = document.createElement('div');
    top.className = 'print-shield-top';
    top.textContent = 'DEFENSE WORK-PRODUCT \u00B7 PREPARED IN ANTICIPATION OF LITIGATION \u00B7 Fed. R. Civ. P. 26(b)(3) \u00B7 Tex. R. Civ. P. 192.5 \u00B7 DO NOT DISCLOSE';
    document.body.insertBefore(top, document.body.firstChild);

    var bottom = document.createElement('div');
    bottom.className = 'print-shield-bottom';
    bottom.textContent = 'CONFIDENTIAL \u00B7 FOR AUTHORIZED EYES ONLY \u00B7 KYLE SCOTT HARRIS DEFENSE \u00B7 PREPARED BY TROY DANDURAND, DEFENSE RESEARCH AGENT (NON-ATTORNEY) UNDER Fed. R. Civ. P. 26(b)(3) \u00B7 UNAUTHORIZED USE, COPY, TRANSMISSION, OR SCREEN CAPTURE PROHIBITED \u00B7 D-S337-EXT7';
    document.body.appendChild(bottom);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
