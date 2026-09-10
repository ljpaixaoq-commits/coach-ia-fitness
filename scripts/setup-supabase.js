import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env
dotenv.config({ path: path.resolve(rootDir, '.env') });

async function runAutoMigration() {
  console.log('================================================================');
  console.log('🤖 SETUP AUTOMÁTICO SUPABASE - COACH IA PESSOAL');
  console.log('================================================================\n');

  // Check connection string
  let connectionString = process.env.DATABASE_URL || process.argv[2];

  if (!connectionString) {
    console.log('ℹ️ Nenhuma DATABASE_URL foi detectada no arquivo .env.');
    console.log('Você pode passar a connection string do Supabase de 2 formas:');
    console.log('  1. Adicionar DATABASE_URL="postgresql://postgres.[ref]:[senha]@aws-0-[region].pooler.supabase.com:65432/postgres" no arquivo .env');
    console.log('  2. Executar: node scripts/setup-supabase.js "sua-connection-string"\n');
    console.log('⚠️ Caso prefira utilizar o painel web do Supabase:');
    console.log('  - Acesse o SQL Editor do seu projeto e cole o conteúdo de supabase/schema.sql e supabase/seed.sql.\n');
    return;
  }

  console.log('🔄 Conectando ao PostgreSQL do Supabase...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso com o Supabase!\n');

    // 1. Executar Schema
    console.log('📦 Criando tabelas, índices, views e políticas RLS (schema.sql)...');
    const schemaSql = fs.readFileSync(path.resolve(rootDir, 'supabase', 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✅ Tabelas, RLS e índices criados com sucesso!');

    // 2. Criar Views Adicionais de Dashboard e Performance
    console.log('📊 Criando Views Analíticas Inteligentes...');
    const viewsSql = `
      -- View de Resumo Diário do Usuário
      CREATE OR REPLACE VIEW v_daily_dashboard_summary AS
      SELECT 
        p.id AS profile_id,
        p.name,
        p.current_weight,
        p.target_weight,
        ROUND((p.current_weight - p.target_weight)::numeric, 1) AS kg_remaining,
        COALESCE(w.today_water_ml, 0) AS water_intake_ml,
        p.daily_water_target_ml,
        COALESCE(m.today_calories, 0) AS calories_consumed,
        p.daily_calorie_target
      FROM profiles p
      LEFT JOIN (
        SELECT profile_id, SUM(amount_ml) AS today_water_ml
        FROM water_logs
        WHERE logged_at >= CURRENT_DATE
        GROUP BY profile_id
      ) w ON w.profile_id = p.id
      LEFT JOIN (
        SELECT profile_id, SUM(total_calories) AS today_calories
        FROM meals
        WHERE consumed_at >= CURRENT_DATE
        GROUP BY profile_id
      ) m ON m.profile_id = p.id;

      -- View de Frequência e Performance de Treinos
      CREATE OR REPLACE VIEW v_workout_performance AS
      SELECT 
        p.id AS profile_id,
        p.name,
        COUNT(wl.id) AS total_workouts_completed,
        ROUND(AVG(wl.duration_seconds / 60)::numeric, 0) AS avg_duration_minutes,
        ROUND(AVG(wl.rpe_effort)::numeric, 1) AS avg_rpe_effort
      FROM profiles p
      LEFT JOIN workout_logs wl ON wl.profile_id = p.id
      GROUP BY p.id, p.name;
    `;
    await client.query(viewsSql);
    console.log('✅ Views analíticas (v_daily_dashboard_summary, v_workout_performance) criadas!');

    // 3. Executar Seed Inicial
    console.log('🌱 Inserindo dados de seed para testes (seed.sql)...');
    const seedSql = fs.readFileSync(path.resolve(rootDir, 'supabase', 'seed.sql'), 'utf8');
    await client.query(seedSql);
    console.log('✅ Dados de seed inseridos com sucesso!');

    // 4. Validação final
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📋 Tabelas ativas no seu Supabase:');
    res.rows.forEach((r, idx) => console.log(`  ${idx + 1}. ${r.table_name}`));

    console.log('\n🎉 BANCO DE DADOS SUPABASE CONFIGURADO COM SUCESSO DE FORMA 100% AUTOMÁTICA!');

  } catch (err) {
    console.error('❌ Erro durante a configuração:', err.message);
  } finally {
    await client.end();
  }
}

runAutoMigration().catch(console.error);