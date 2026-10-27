// 노션 커버를 우선 쓰고, 없으면 유튜브 썸네일로 대체
export function thumbBg(s) {
  const layers = [`url(/api/cover/${s.id})`];
  if (s.video) layers.push(`url(https://img.youtube.com/vi/${s.video}/maxresdefault.jpg)`, `url(https://img.youtube.com/vi/${s.video}/mqdefault.jpg)`);
  return layers.join(", ");
}
