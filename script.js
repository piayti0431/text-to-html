// Updated JS logic to preserve <ul><li> formatting and correct HTML

// ✅ Allowed tags
const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR', 'UL', 'OL', 'LI'];

// ✅ Clean unwanted elements but keep allowed
function cleanNode(node) {
  const children = Array.from(node.childNodes);
  for (let child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      if (!allowedTags.includes(child.tagName)) {
        const fragment = document.createDocumentFragment();
        while (child.firstChild) fragment.appendChild(child.firstChild);
        node.replaceChild(fragment, child);
        cleanNode(node);
      } else {
        [...child.attributes].forEach(attr => {
          if (child.tagName === 'A' && attr.name === 'href') return;
          child.removeAttribute(attr.name);
        });
        cleanNode(child);
      }
    }
  }
}

function convertToHTMLFromContentEditable(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  cleanNode(tempDiv);

  const lines = [];
  let buffer = [];

  for (const child of tempDiv.childNodes) {
    let content = '';

    if (child.nodeType === 1 && child.tagName === 'DIV') {
      content = child.innerHTML.trim();
    } else if (child.nodeType === 3) {
      content = child.textContent.trim();
    } else if (child.nodeType === 1) {
      content = child.outerHTML.trim();
    }

    if (content === '' && buffer.length) {
      lines.push(buffer.join(' ').trim());
      buffer = [];
    } else if (content !== '') {
      buffer.push(content);
    }
  }

  if (buffer.length) {
    lines.push(buffer.join(' ').trim());
  }

  const result = lines.map(rawLine => {
    const headingMatch = rawLine.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);
    if (headingMatch) {
      const level = headingMatch[2] || headingMatch[4];
      const title = rawLine.replace(headingMatch[0], '').trim();
      return `<h${level}><strong>${title}</strong></h${level}>`;
    }

    // ✅ Auto list detection
    if (/^<ul>([\s\S]*?)<\/ul>$/.test(rawLine)) {
      return rawLine; // already structured <ul>
    }

    // Detect manually entered bullet lists like "- Item"
    if (/^\s*[-\u2022]\s*/.test(rawLine)) {
      const items = lines.filter(line => /^\s*[-\u2022]\s*/.test(line))
        .map(line => `<li>${line.replace(/^\s*[-\u2022]\s*/, '')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }

    return `<p>${rawLine}</p>`;
  });

  return result.join('\n');
}

function updateOutputHTML() {
  const inputDiv = document.getElementById('inputText');
  const outputHTML = document.getElementById('outputHTML');
  const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
  outputHTML.value = html.trim() || '';
}

// ✅ Event listeners
window.addEventListener('DOMContentLoaded', () => {
  const inputDiv = document.getElementById('inputText');
  inputDiv.addEventListener('input', updateOutputHTML);
  inputDiv.addEventListener('keyup', updateOutputHTML);
  inputDiv.addEventListener('paste', () => setTimeout(updateOutputHTML, 50));

  window.applyFormat = function (format) {
    inputDiv.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const selectedText = sel.toString();
    if (!selectedText) return;

    if (format === 'uppercase') {
      document.execCommand('insertText', false, selectedText.toUpperCase());
    } else if (format === 'capitalize') {
      const cap = selectedText.replace(/\b\w/g, c => c.toUpperCase());
      document.execCommand('insertText', false, cap);
    } else if (format === 'bold') {
      document.execCommand('bold');
    } else if (format === 'italic') {
      document.execCommand('italic');
    } else if (format === 'link') {
      const url = prompt('Nhập URL:', 'https://');
      if (!url) return;
      document.execCommand('createLink', false, url);
    }

    updateOutputHTML();
  };
});
