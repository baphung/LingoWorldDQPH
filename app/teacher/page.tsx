'use client';
import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function Teacher() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào! Tôi là AI Teacher. Bạn muốn luyện từ vựng, ngữ pháp, nói hay viết?' },
  ]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const message = text.trim();
    if (!message || loading) return;
    const next = [...msgs, { role: 'user' as const, content: message }];
    setMsgs(next);
    setText('');
    setLoading(true);
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: msgs }),
      });
      const data = await res.json();
      setMsgs([...next, { role: 'assistant', content: data.answer || data.error || 'AI Teacher chưa trả lời được.' }]);
    } catch {
      setMsgs([...next, { role: 'assistant', content: 'Không thể kết nối AI Teacher. Hãy thử lại.' }]);
    } finally { setLoading(false); }
  }

  return <main className="section" style={{ paddingTop: 50, maxWidth: 850 }}>
    <p className="eyebrow">AI TEACHER</p>
    <h1 style={{ fontFamily: 'Georgia', fontSize: 50 }}>Giáo viên luôn sẵn sàng.</h1>
    <div className="ai-card">
      {msgs.map((m, i) => <div className={'bubble ' + (m.role === 'user' ? 'user' : '')} key={i}>{m.content}</div>)}
      {loading && <div className="bubble">Đang suy nghĩ…</div>}
      <form onSubmit={send} className="search">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Viết câu bạn muốn luyện…" disabled={loading} />
        <button disabled={loading}>{loading ? '...' : 'Gửi'}</button>
      </form>
    </div>
  </main>;
}
