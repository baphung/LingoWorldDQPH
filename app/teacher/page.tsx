'use client';
import { FormEvent, useState } from 'react';
type Message = { role: 'user' | 'assistant'; content: string };
export default function Teacher() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', content: 'Xin chào! Tôi là AI Teacher. Hãy viết một câu tiếng Trung, tôi sẽ sửa và giải thích cho bạn.' }]);
  async function send(e: FormEvent) {
    e.preventDefault(); const message = text.trim(); if (!message || loading) return;
    const history = msgs.slice(-10); setMsgs(c => [...c, { role: 'user', content: message }]); setText(''); setLoading(true);
    try {
      const res = await fetch('/api/teacher', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) });
      const data = await res.json(); if (!res.ok) throw new Error(data?.error || 'Không thể kết nối AI Teacher');
      setMsgs(c => [...c, { role: 'assistant', content: data.answer }]);
    } catch (error) { setMsgs(c => [...c, { role: 'assistant', content: `⚠️ ${error instanceof Error ? error.message : 'Có lỗi xảy ra.'}` }]); }
    finally { setLoading(false); }
  }
  return <main className="section" style={{ paddingTop: 50, maxWidth: 850 }}>
    <p className="eyebrow">AI TEACHER</p><h1 style={{ fontFamily: 'Georgia', fontSize: 50 }}>Giáo viên luôn sẵn sàng.</h1>
    <div className="ai-card">{msgs.map((m, i) => <div className={'bubble ' + (m.role === 'user' ? 'user' : '')} key={i}>{m.content}</div>)}
      {loading && <div className="bubble">Đang suy nghĩ…</div>}
      <form onSubmit={send} className="search"><input value={text} onChange={e => setText(e.target.value)} placeholder="Ví dụ: 我喜欢学习中文。" disabled={loading}/><button disabled={loading}>{loading ? 'Đang gửi…' : 'Gửi'}</button></form>
    </div>
  </main>;
}
