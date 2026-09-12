import { NextResponse } from 'next/server';

const system = `Bạn là AI Teacher của LingoWorld AI. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn và có tính sư phạm. Khi người học viết câu tiếng Trung, hãy sửa câu, chỉ ra lỗi, giải thích bằng tiếng Việt và đưa ra 1 câu mẫu đúng. Khi họ hỏi từ vựng, cho chữ Hán, pinyin, nghĩa và ví dụ. Ưu tiên trình độ HSK1-HSK3 nếu người học chưa nói rõ trình độ.`;

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Thiếu nội dung' }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI Teacher chưa được cấu hình OPENAI_API_KEY trên Vercel.' }, { status: 503 });

    const input = [
      { role: 'system', content: system },
      ...history.slice(-10).map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5.6-luna', input }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || 'OpenAI API error' }, { status: 502 });

    const text = data.output_text || data.output?.flatMap((item: { content?: { text?: string }[] }) => item.content || []).map((part: { text?: string }) => part.text || '').join('') || 'Tôi chưa tạo được câu trả lời.';
    return NextResponse.json({ answer: text });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI Teacher error' }, { status: 500 });
  }
}
