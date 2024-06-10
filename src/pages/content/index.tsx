// import { createRoot } from 'react-dom/client';
// import './style.css';
// const div = document.createElement('div');
// div.id = '__root';
// document.body.appendChild(div);

// const rootContainer = document.querySelector('#__root');
// if (!rootContainer) throw new Error("Can't find Content root element");
// const root = createRoot(rootContainer);
// root.render(
//   <div className="absolute bottom-0 left-0 text-lg text-black bg-amber-400 z-50">
//     content script loaded
//   </div>
// );

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}

export const getHtmlContent = (): [string, boolean, string[]] => {
  const elements: Element[] = [];

  // process selector queries
  // if (selectors.length > 0) {
  //   for (const selector of selectors) {
  //     const selectedElement = document.querySelector(selector);
  //     if (selectedElement !== null) {
  //       elements.push(selectedElement);
  //     }
  //   }
  // }

  // process selectorAll queries
  // if (selectorsAll.length > 0) {
  //   for (const selectorAll of selectorsAll) {
  //     const selectedElements = document.querySelectorAll(selectorAll);
  //     for (let i = 0; i < selectedElements.length; i++) {
  //       elements.push(selectedElements[i]);
  //     }
  //   }
  // }

  const body = document.querySelector('body');

  if (body) {
    elements.push(body);
  } else {
    console.error(
      'Unable to parse the document. No body element found in the document'
    );
  }

  const parser = new DOMParser();
  let content = '';
  const imageURLs: string[] = [];

  for (const element of elements) {
    const doc = parser.parseFromString(element.outerHTML, 'text/html');
    let textContent = doc.body.innerText || '';

    // Use a regular expression to replace contiguous white spaces with a single space
    textContent = textContent.replace(/\s+/g, ' ').trim();

    // append textContent to overall content
    content += textContent + '\n';

    // find img elements and add src (URL) to imageURLs list
    const imageElements = doc.querySelectorAll('img');
    imageElements.forEach((imageElement) => {
      const imageURL = imageElement.getAttribute('src');
      if (imageURL) {
        imageURLs.push(imageURL);
      }
    });
  }

  return [content, false, imageURLs];
};
