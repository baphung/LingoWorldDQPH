import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request:NextRequest){
  try{
    const auth=request.headers.get('authorization');
    const token=auth?.startsWith('Bearer ')?auth.slice(7):null;
    if(!token) return NextResponse.json({ok:false,error:'Unauthorized'},{status:401});
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key) return NextResponse.json({ok:false,error:'Missing Supabase configuration'},{status:500});
    const supabase=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}}});
    const {data:{user},error:userError}=await supabase.auth.getUser(token);
    if(userError||!user) return NextResponse.json({ok:false,error:'Invalid session'},{status:401});
    const body=await request.json();
    const lessonId=String(body.lesson_id||'');
    const score=body.score==null?null:Number(body.score);
    const answers=body.answers && typeof body.answers==='object'?body.answers:{};
    if(!lessonId) return NextResponse.json({ok:false,error:'lesson_id is required'},{status:400});
    const {data:lesson}=await supabase.from('lessons').select('id,course_id,xp').eq('id',lessonId).eq('published',true).single();
    if(!lesson) return NextResponse.json({ok:false,error:'Lesson not found'},{status:404});
    const {error:attemptError}=await supabase.from('lesson_attempts').insert({user_id:user.id,lesson_id:lesson.id,score,answers});
    if(attemptError) throw attemptError;
    const {data:attempts}=await supabase.from('lesson_attempts').select('lesson_id').eq('user_id',user.id).eq('lesson_id',lesson.id);
    const {data:allLessons}=await supabase.from('lessons').select('id').eq('course_id',lesson.course_id).eq('published',true);
    const uniqueCompleted=new Set((attempts||[]).map(a=>a.lesson_id));
    const total=Math.max((allLessons||[]).length,1);
    const progress=Math.min(100,Math.round(uniqueCompleted.size/total*100));
    await supabase.from('enrollments').upsert({user_id:user.id,course_id:lesson.course_id,progress},{onConflict:'user_id,course_id'});
    const {data:profile}=await supabase.from('profiles').select('xp').eq('id',user.id).maybeSingle();
    await supabase.from('profiles').upsert({id:user.id,xp:Number(profile?.xp||0)+Number(lesson.xp||0)},{onConflict:'id'});
    return NextResponse.json({ok:true,progress,xp_awarded:Number(lesson.xp||0)});
  }catch(error){
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:'Unexpected error'},{status:500});
  }
}
