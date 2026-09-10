import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Testando conexão com Supabase:', process.env.VITE_SUPABASE_URL);
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.log('Resultado da consulta profiles:', error.message);
    if (error.code === '42P01') {
      console.log('ℹ️ As tabelas ainda não foram criadas no banco de dados do Supabase.');
    }
  } else {
    console.log('✅ Conexão OK! Perfis encontrados no Supabase:', data?.length || 0);
  }
}

test().catch(console.error);