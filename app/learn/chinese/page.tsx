import Link from 'next/link';
import { getSupabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Chinese(){
  const supabase = getSupabase();
  const { data: course } = await supabase
    .from('courses')
    .select('id,title,level,description')
    .eq('code','HSK1')
    .eq('published',true)
    .single();

  const { data: lessons } = course ? await supabase
    .from('lessons')
    .select('id,slug,title,subtitle,lesson_type,xp,position')
    .eq('course_id',course.id)
    .eq('published',true)
    .order('position') : { data: [] };

  return <main className="section" style={{paddingTop:45}}>
    <p className="eyebrow">中文 · HSK 1</p>
    <h1 style={{fontFamily:'Georgia',fontSize:48}}>Tiếng Trung từ số 0</h1>
    <p className="lead">{course?.description || 'Lộ trình HSK1 ngắn gọn, thực hành mỗi ngày.'}</p>
    <div className="continue"><div><b>Lộ trình HSK1</b><p>{lessons?.length || 0} bài học đang có trên Supabase</p></div><b>🔥 Học mỗi ngày</b></div>
    <h2 style={{fontFamily:'Georgia'}}>Các bài học</h2>
    {(lessons || []).map((l,i)=><Link href={'/lesson/'+l.slug} className="lang" style={{margin:'10px 0'}} key={l.id}>
      <span>{i<2?'✓':'○'}</span>
      <div><b>{l.title}</b><small>{l.subtitle || ''} · +{l.xp} XP</small></div>
      <small>{l.lesson_type==='grammar'?'Ngữ pháp':'Từ vựng'}</small>
    </Link>)}
  </main>
}