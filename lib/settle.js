import data from "../data/settle.json";

// 검증을 마친 안내만 data/settle.json 에 들어간다 (검증 전 자료는 사이트에 올리지 않는다)
export { SETTLE_CATS, settleCat } from "./settle-cats";
export const settleAll = () => data;
export const settleGet = (id) => data.find((x) => x.id === id) || null;
