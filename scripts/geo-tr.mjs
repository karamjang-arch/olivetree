// 튀르키예 여행 지도용 정적 지형 데이터 생성 (Natural Earth via world-atlas, 퍼블릭 도메인)
// node scripts/geo-tr.mjs → data/geo-tr.json
import fs from "node:fs";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature, mesh } from "topojson-client";

const W = 1000;
const read = (f) => JSON.parse(fs.readFileSync(new URL(`../node_modules/world-atlas/${f}`, import.meta.url)));
const w110 = read("countries-110m.json");
const w50 = read("countries-50m.json");

const land110 = feature(w110, w110.objects.land);
const proj = geoNaturalEarth1().fitWidth(W, land110);
const H = Math.round(geoPath(proj).bounds(land110)[1][1] + 6);
const path = geoPath(proj).digits(1);

// 상세 레이어는 튀르키예 주변만 잘라서
const [x0, y0] = proj([17, 47.5]);
const [x1, y1] = proj([51, 29.5]);
const clip = geoNaturalEarth1().scale(proj.scale()).translate(proj.translate()).clipExtent([[x0, y0], [x1, y1]]);
const cpath = geoPath(clip).digits(2);
const countries50 = feature(w50, w50.objects.countries);
const tr = countries50.features.find((f) => f.id === "792");

const r = (n) => Math.round(n * 10) / 10;
const box = [r(x0), r(y0), r(x1 - x0), r(y1 - y0)];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><mask id="m"><rect width="${W}" height="${H}" fill="#fff"/><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="#000"/></mask></defs>
<rect x="-2000" y="-2000" width="${W + 4000}" height="${H + 4000}" fill="#a8d5e8"/>
<path d="${path(land110)}" fill="#f2ecdf" stroke="#d9cdb5" stroke-width=".4" mask="url(#m)"/>
<path d="${cpath(feature(w50, w50.objects.land))}" fill="#f2ecdf"/>
<path d="${cpath(tr)}" fill="#f6cfbd"/>
<path d="${cpath(mesh(w50, w50.objects.countries, (a, b) => a !== b))}" fill="none" stroke="#c9b99c" stroke-width=".07" stroke-dasharray=".3 .2"/>
<path d="${cpath(tr)}" fill="none" stroke="#e3a78d" stroke-width=".08"/>
</svg>`;
fs.mkdirSync(new URL("../public/maps/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../public/maps/turkey.svg", import.meta.url), svg);
fs.writeFileSync(new URL("../data/geo-tr.json", import.meta.url), JSON.stringify({ w: W, h: H, scale: proj.scale(), translate: proj.translate() }));
console.log("ok", W, H, (svg.length / 1024).toFixed(0) + "KB");
