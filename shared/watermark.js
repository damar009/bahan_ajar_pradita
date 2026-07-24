const body = document.body;

if (body.classList.contains("has-page-watermark") && body.dataset.watermarkEnabled !== "false") {
  const text = body.dataset.watermarkText ?? "Brain Academy @Ruangguru";
  const angle = Number(body.dataset.watermarkAngle ?? -25);
  const fontSize = Number(body.dataset.watermarkFontSize ?? 24);
  const fontFamily = body.dataset.watermarkFontFamily ?? "Poppins, Arial, sans-serif";
  const fontWeight = body.dataset.watermarkFontWeight ?? "500";
  const color = body.dataset.watermarkColor ?? "#000000";
  const opacity = body.dataset.watermarkOpacity ?? "0.055";
  const tileWidth = Number(body.dataset.watermarkTileWidth ?? 360);
  const tileHeight = Number(body.dataset.watermarkTileHeight ?? 220);
  const position = body.dataset.watermarkPosition ?? "scroll"; 

  const escapedText = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}" viewBox="0 0 ${tileWidth} ${tileHeight}">
      <g transform="translate(${tileWidth / 2} ${tileHeight / 2}) rotate(${angle})">
        <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}">
          ${escapedText}
        </text>
      </g>
    </svg>
  `;

  body.style.setProperty("--watermark-image", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  body.style.setProperty("--watermark-opacity", opacity);
  body.style.setProperty("--watermark-tile-width", `${tileWidth}px`);
  body.style.setProperty("--watermark-tile-height", `${tileHeight}px`);

  if (position === "scroll") {
    body.classList.add("watermark-scroll");
    body.style.setProperty("--watermark-position", "absolute");
  } else {
    body.classList.remove("watermark-scroll");
    body.style.setProperty("--watermark-position", "fixed");
  }
} else {
  body.classList.remove("has-page-watermark");
  body.classList.remove("watermark-scroll");
}
