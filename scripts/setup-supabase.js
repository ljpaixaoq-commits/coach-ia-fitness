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
        p.id AS perfil_id,
        p.nome,
        p.peso_atual,
        p.peso_objetivo,
        ROUND((p.peso_atual - p.peso_objetivo)::numeric, 1) AS kg_restantes,
        COALESCE(w.agua_hoje_ml, 0) AS consumo_agua_ml,
        p.meta_agua_diaria_ml,
        COALESCE(m.calorias_hoje, 0) AS calorias_consumidas,
        p.meta_calorias_diaria
      FROM perfis p
      LEFT JOIN (
        SELECT perfil_id, SUM(quantidade_ml) AS agua_hoje_ml
        FROM registro_agua
        WHERE registrado_em >= CURRENT_DATE
        GROUP BY perfil_id
      ) w ON w.perfil_id = p.id
      LEFT JOIN (
        SELECT perfil_id, SUM(total_calorias) AS calorias_hoje
        FROM refeicoes
        WHERE consumida_em >= CURRENT_DATE
        GROUP BY perfil_id
      ) m ON m.perfil_id = p.id;

      -- View de Frequência e Performance de Treinos
      CREATE OR REPLACE VIEW v_workout_performance AS
      SELECT 
        p.id AS perfil_id,
        p.nome,
        COUNT(wl.id) AS total_treinos_concluidos,
        ROUND(AVG(wl.duracao_segundos / 60)::numeric, 0) AS duracao_media_minutos,
        ROUND(AVG(wl.esforco_rpe)::numeric, 1) AS rpe_medio
      FROM perfis p
      LEFT JOIN registro_treinos wl ON wl.perfil_id = p.id
      GROUP BY p.id, p.nome;
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