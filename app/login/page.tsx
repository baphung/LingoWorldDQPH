'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../../lib/supabase';

export default function Login(){
  const router=useRouter();
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [displayName,setDisplayName]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(e:React.FormEvent){
    e.preventDefault(); setBusy(true); setMessage('');
    const supabase=getSupabase();
    const result=mode==='login'
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password});
    if(result.error){ setMessage(result.error.message); setBusy(false); return; }
    const user=result.data.user;
    if(user && mode==='signup'){
      await supabase.from('profiles').upsert({id:user.id,display_name:displayName || email.split('@')[0]});
      setMessage('Tài khoản đã tạo. Bạn có thể bắt đầu học.');
    } else {
      router.push('/progress'); router.refresh(); return;
    }
    setBusy(false);
  }

  async function logout(){ await getSupabase().auth.signOut(); router.push('/'); router.refresh(); }

  return <main className="section" style={{maxWidth:620,paddingTop:70}}>
    <p className="eyebrow">LINGOWORLD ACCOUNT</p>
    <h1 style={{fontFamily:'Georgia',fontSize:52}}>{mode==='login'?'Đăng nhập':'Tạo tài khoản'}</h1>
    <p className="lead">Lưu tiến độ, XP, streak và kết quả học tập trên mọi thiết bị.</p>
    <form onSubmit={submit} className="continue" style={{display:'block'}}>
      {mode==='signup' && <input aria-label="Tên hiển thị" placeholder="Tên hiển thị" value={displayName} onChange={e=>setDisplayName(e.target.value)} style={{width:'100%',marginBottom:12,padding:14}} />}
      <input required type="email" aria-label="Email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',marginBottom:12,padding:14}} />
      <input required minLength={6} type="password" aria-label="Mật khẩu" placeholder="Mật khẩu (ít nhất 6 ký tự)" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',marginBottom:12,padding:14}} />
      <button className="primary" disabled={busy} type="submit" style={{border:0,cursor:'pointer'}}>{busy?'Đang xử lý…':mode==='login'?'Đăng nhập':'Tạo tài khoản'}</button>
    </form>
    {message && <p style={{marginTop:16}}>{message}</p>}
    <button onClick={()=>setMode(mode==='login'?'signup':'login')} style={{marginTop:18,border:0,background:'transparent',textDecoration:'underline',cursor:'pointer'}}>
      {mode==='login'?'Chưa có tài khoản? Tạo tài khoản':'Đã có tài khoản? Đăng nhập'}
    </button>
    <button onClick={logout} style={{display:'none'}} aria-hidden="true">logout</button>
  </main>;
}
