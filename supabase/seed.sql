-- LingoWorld AI seed data
-- Run after supabase/schema.sql in the target Supabase project.

insert into public.courses (language_id, code, title, level, description, published)
select id, 'HSK1', 'Tiếng Trung HSK 1', 'HSK1', 'Lộ trình tiếng Trung từ số 0.', true
from public.languages where slug = 'chinese'
on conflict (language_id, code) do update set title=excluded.title, level=excluded.level, description=excluded.description, published=true;

insert into public.lessons (course_id, slug, title, subtitle, lesson_type, content, position, xp, published)
select c.id, v.slug, v.title, v.subtitle, v.lesson_type, v.content::jsonb, v.position, v.xp, true
from public.courses c
cross join (values
('ni-hao','Xin chào – 你好','Chào hỏi cơ bản','vocabulary','{"words":[["你好","nǐ hǎo","xin chào"],["你","nǐ","bạn"],["好","hǎo","tốt"]]}',1,20),
('wo-jiao','Tôi tên là… – 我叫','Giới thiệu bản thân','vocabulary','{"words":[["我","wǒ","tôi"],["叫","jiào","gọi / tên là"],["名字","míngzi","tên"]]}',2,25),
('shi-shenme','Đây là gì? – 是什么','Hỏi và trả lời','grammar','{"words":[["是","shì","là"],["什么","shénme","cái gì"],["这","zhè","này"]]}',3,30),
('numbers','Số đếm 1–10','Làm quen với số','vocabulary','{"words":[["一","yī","một"],["二","èr","hai"],["三","sān","ba"]]}',4,20),
('family','Gia đình – 家庭','Nói về gia đình','vocabulary','{"words":[["家","jiā","nhà / gia đình"],["爸爸","bàba","bố"],["妈妈","māma","mẹ"]]}',5,30)
) as v(slug,title,subtitle,lesson_type,content,position,xp)
where c.code='HSK1' and c.language_id=(select id from public.languages where slug='chinese')
on conflict (course_id, slug) do update set title=excluded.title, subtitle=excluded.subtitle, lesson_type=excluded.lesson_type, content=excluded.content, position=excluded.position, xp=excluded.xp, published=true;

select count(*) as courses from public.courses where code='HSK1';
select count(*) as chinese_lessons from public.lessons l join public.courses c on c.id=l.course_id where c.code='HSK1';
