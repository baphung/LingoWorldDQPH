import Link from 'next/link';
import { getSupabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

type Word = [string, string, string];
type LessonContent = { words?: Word[] };

export default async function Lesson({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const supabase=getSupabase();
  const {data:lesson}=await supabase.from('lessons').select('id,slug,title,subtitle,lesson_type,content,xp,position,course_id').eq('slug',slug).eq('published',true).single();
  if(!lesson) return <main className="section" style={{paddingTop:45,maxWidth:900}}><Link href="/learn/chinese">← HSK1</Link><h1 style={{fontFamily:'Georgia',fontSize:48,marginTop:30}}>Không tìm thấy bài học</h1><p className="lead">Bài học này chưa được xuất bản hoặc không tồn tại.</p></main>;
  const content=(lesson.content || {}) as LessonContent;
  const words=Array.isArray(content.words)?content.words:[];
  const type=lesson.lesson_type==='grammar'?'Ngữ pháp':'Từ vựng';
  return <main className="section" style={{paddingTop:45,maxWidth:900}}>
    <Link href="/learn/chinese">← HSK1</Link>
    <p className="eyebrow" style={{marginTop:30}}>BÀI HỌC · {type.toUpperCase()}</p>
    <h1 style={{fontFamily:'Georgia',fontSize:48}}>{lesson.title}</h1>
    <p className="lead">{lesson.subtitle || ''} · +{lesson.xp} XP</p>
    <div className="grid" style={{marginTop:30}}>{words.map((w,i)=><div className="lang" key={`${w[0]}-${i}`} style={{display:'block',textAlign:'center',padding:30}}><div style={{fontSize:42,fontWeight:800}}>{w[0]}</div><div style={{fontSize:18,marginTop:8}}>{w[1]}</div><small>{w[2]}</small></div>)}</div>
    <div className="continue" style={{marginTop:30}}><div><b>🤖 AI Teacher</b><p>Hãy đọc to từng từ và đặt một câu đơn giản để luyện ngay.</p></div><Link href={`/teacher?lesson=${encodeURIComponent(lesson.slug)}`} className="primary">Hỏi AI Teacher</Link></div>
  </main>;
}