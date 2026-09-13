import Link from 'next/link';
import { getSupabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Languages(){
  const supabase = getSupabase();
  const { data } = await supabase
    .from('languages')
    .select('slug,name_vi,name_native,iso_639_1')
    .eq('published', true)
    .order('name_vi');

  const flags: Record<string,string> = { zh:'🇨🇳', en:'🇬🇧', ja:'🇯🇵', ko:'🇰🇷', fr:'🇫🇷', de:'🇩🇪', es:'🇪🇸', vi:'🇻🇳' };
  const exams: Record<string,string> = { zh:'HSK', en:'IELTS / TOEFL', ja:'JLPT', ko:'TOPIK', fr:'DELF', de:'Goethe', es:'DELE', vi:'Tiếng Việt' };

  return <main className="section" style={{paddingTop:55}}>
    <p className="eyebrow">LANGUAGE LIBRARY</p>
    <h1 style={{fontFamily:'Georgia',fontSize:52}}>Mọi ngôn ngữ, một nơi.</h1>
    <p className="lead">Dữ liệu ngôn ngữ được tải trực tiếp từ Supabase.</p>
    <div className="grid">{(data || []).map(l=><Link className="lang" href={l.slug==='chinese'?'/learn/chinese':'/languages'} key={l.slug}>
      <span>{flags[l.iso_639_1 || ''] || '🌐'}</span>
      <div><b>{l.name_vi}</b><small>{l.name_native}</small></div>
      <small>{exams[l.iso_639_1 || ''] || 'Đang cập nhật'}</small>
    </Link>)}</div>
  </main>
}