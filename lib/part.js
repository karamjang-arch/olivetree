// 연재 편 표시: 번호 편(1, 2, 3…)과 이름 편(사이 글·강의·맺는 글)
export const isMain = (x) => x.part != null && x.part !== 0 && !x.partLabel;
export const partName = (x) => x.partLabel || (x.part ? `${x.part}편` : "");
export const partMark = (x) => (x.partLabel ? "·" : x.part);
export const mainCount = (list) => list.filter(isMain).length;
