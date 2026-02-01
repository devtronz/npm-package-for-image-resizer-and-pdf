# @devtronz/image-resize-pdf

Advanced image resizer, compressor and multiple images to PDF converter.

## Install
npm install @devtronz/image-resize-pdf

## Resize image
```js
import { resizeImage } from "@devtronz/image-resize-pdf";

const output = await resizeImage(file, {
  width: 800,
  quality: 0.7,
  format: "image/webp",
  keepAspectRatio: true
});