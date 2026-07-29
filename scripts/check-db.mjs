import { createClient } from '@supabase/supabase-js';

async function check() {
  const supabase = createClient(
    'https://atkaxzfpwyhrvquvrenr.supabase.co',
    process.env.SUPABASE_KEY
  );

  const { data: props, error: pe } = await supabase.from('properties').select('id, title, slug').limit(3);
  const { data: agents, error: ae } = await supabase.from('agents').select('id, first_name, last_name').limit(3);
  const { data: posts, error: be } = await supabase.from('blog_posts').select('id, title').limit(3);

  console.log('=== Properties ===');
  if (pe) console.log('Error:', pe.message);
  else console.log(JSON.stringify(props, null, 2));

  console.log('\n=== Agents ===');
  if (ae) console.log('Error:', ae.message);
  else console.log(JSON.stringify(agents, null, 2));

  console.log('\n=== Blog Posts ===');
  if (be) console.log('Error:', be.message);
  else console.log(JSON.stringify(posts, null, 2));
}
check();
