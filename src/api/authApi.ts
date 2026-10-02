import { supabase } from '@/api/index.ts';

export default  {
  async login(email: string, password: string) {
   const { error } = await supabase.auth.signInWithPassword({
     email,
     password,
   })

    if (error) throw error
  }
}
