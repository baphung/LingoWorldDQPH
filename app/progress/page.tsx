'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '../../lib/supabase';

type Profile={display_name:string|null;xp:number;streak:number};
type Course={id:string;title:string;code:string};
type Enrollment={course_id:string;progress:number};

export default function Progress(){
  const [user,setUser]=useState<{email?:string}|null>(null);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [course,setCourse]=useState<Course|null>(null);
  const [enrollment,setEnrollment]=useState<Enrollment|null>(null);
  const [attempts,setAttempts]=useState(0);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    const supabase=getSupabase();
    const {data:{user}}=await supabase.auth.getUser();
    setUser(user ? {email:user.email} : null);
    if(!user){setLoading(false);return;}
    const [{data:profile},{data:course},{data:enrollment},{count}]=await Promise.all([
      supabase.from('profiles').select('display_name,xp,streak').eq('id',user.id).maybeSingle(),
      supabase.from('courses').select('id,title,code').eq('code','HSK1').eq('published',true).maybeSingle(),
      supabase.from('enrollments').select('course_id,progress').eq('user_id',user.id),
      supabase.from('lesson_attempts').select('id',{count:'exact',head:true}).eq('user_id',user.id)
    ]);
    setProfile(profile);
    setCourse(course);
    setEnrollment(course ? ((enrollment||[]).find((e:Enrollment)=>e.course_id===course.id)||null) : null);
    setAttempts(count||0);
    setLoading(false);
  })()},[]);

  if(loading) return <main className="section" style={{paddingTop:55}}><p className="lead">Đang tải tiến độ…</p></main>;
  if(!user) return <main className="section" style={{paddingTop:55,maxWidth:760}}><p className="eyebrow">YOUR PROGRESS</p><h1 style={{fontFamily:'Georgia',fontSize:52}}>Tiến độ học tập</h1><p className="lead">Đăng nhập để lưu XP, streak, bài đã hoàn thành và kết quả luyện tập.</p><Link href="/login" className="primary">Đăng nhập / tạo tài khoản</Link></main>;

  return <main className="section" style={{paddingTop:55}}>
    <p className="eyebrow">YOUR PROGRESS</p>
    <h1 style={{fontFamily:'Georgia',fontSize:52}}>{profile?.display_name || user.email?.split('@')[0] || 'Học viên'}</h1>
    <p className="lead">Dữ liệu học tập của bạn được lưu trực tiếp trên Supabase.</p>
    <div className="grid" style={{marginTop:30}}>
      <div className="lang"><span>⚡</span><div><b>{profile?.xp || 0} XP</b><small>Tổng kinh nghiệm</small></div></div>
      <div className="lang"><span>🔥</span><div><b>{profile?.streak || 0} ngày</b><small>Streak</small></div></div>
      <div className="lang"><span>📝</span><div><b>{attempts}</b><small>Lần luyện tập</small></div></div>
      <div className="lang"><span>📚</span><div><b>{enrollment?.progress || 0}%</b><small>{course?.title || 'HSK1'}</small></div></div>
    </div>
    <div className="continue" style={{marginTop:30}}><div><b>Tiếp tục học</b><p>{course?.title || 'Tiếng Trung HSK 1'}</p></div><Link href="/learn/chinese" className="primary">Vào HSK1</Link></div>
  </main>;
}