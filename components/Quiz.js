"use client";
import { useState } from "react";

export default function Quiz({ items }) {
  const [ans, setAns] = useState({});
  const done = Object.keys(ans).length;
  const score = items.filter((q, i) => ans[i] === q.a).length;

  return (
    <div className="quiz">
      {items.map((q, i) => {
        const picked = ans[i];
        const answered = picked !== undefined;
        return (
          <div key={i} className="q">
            <div className="qn">{i + 1}. <span className="qref">{q.ref}</span></div>
            <div className="qt">{q.q}</div>
            <div className="opts">
              {q.opts.map((o, j) => {
                let cls = "opt";
                if (answered && j === q.a) cls += " right";
                else if (answered && j === picked) cls += " wrong";
                return (
                  <button key={j} className={cls} disabled={answered} onClick={() => setAns({ ...ans, [i]: j })}>{o}</button>
                );
              })}
            </div>
            {answered && (
              <div className="fb">
                <strong>{picked === q.a ? "정답입니다." : "아쉽습니다."}</strong> {q.note}
                <div className="hint"><b>{q.hintRef}</b> {q.hintText}</div>
              </div>
            )}
          </div>
        );
      })}
      {done === items.length && <div className="score">{items.length}문항 중 {score}문항을 맞혔습니다.</div>}
    </div>
  );
}
