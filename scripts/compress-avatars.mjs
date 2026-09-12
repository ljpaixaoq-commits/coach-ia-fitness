/**
 * COMPRESS AVATARS (migração)
 * Percorre o bucket `avatars` no Supabase Storage e re-encoda cada imagem
 * para JPEG 512x512 (máx.) qualidade 0.8, mantendo a MESMA URL pública
 * (re-upload no mesmo caminho). Se o resultado não for menor, mantém o original.
 *
 * Uso: node scripts/compress-avatars.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const BUCKET = 'avatars';
const MAX_SIZE = 512;
const QUALITY = 80;

const IMAGE_EXT = /\.(png|jpe?g|webp|bmp|tiff?|gif|heic|avif)$/i;

const files = [];

async function walk(folder) {
  const { data, error } = await supabase.storage.from(BUCKET).list(folder);
  if (error) throw new Error(`Falha ao listar ${folder}: ${error.message}`);
  for (const item of data || []) {
    if (item.id) {
      files.push({ folder, name: item.name, size: item.metadata?.size ?? 0 });
    } else {
      await walk(folder ? `${folder}/${item.name}` : item.name);
    }
  }
}

const run = async () => {
  await walk('');
  console.log(`Arquivos no bucket '${BUCKET}': ${files.length}`);

  let saved = 0;
  let skipped = 0;
  let errors = 0;

  for (const f of files) {
    const full = f.folder ? `${f.folder}/${f.name}` : f.name;
    if (!IMAGE_EXT.test(f.name)) {
      console.log(`  ─ pulando (não-imagem): ${full}`);
      skipped++;
      continue;
    }

    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(full);
      if (error) throw new Error(error.message);
      const buf = Buffer.from(await data.arrayBuffer());

      const out = await sharp(buf)
        .rotate()
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer();

      if (out.length >= buf.length) {
        console.log(`  ─ mantém (já ≤ ${out.length} B): ${full}`);
        skipped++;
        continue;
      }

      const up = await supabase.storage
        .from(BUCKET)
        .upload(full, out, { upsert: true, contentType: 'image/jpeg' });
      if (up.error) throw new Error(up.error.message);

      const reduction = ((1 - out.length / buf.length) * 100).toFixed(1);
      console.log(`  ✓ ${full}: ${(buf.length / 1024).toFixed(1)} KB → ${(out.length / 1024).toFixed(1)} KB (-${reduction}%)`);
      saved++;
    } catch (e) {
      console.log(`  ✗ ERRO em ${full}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\nConcluído: ${saved} comprimidos, ${skipped} mantidos, ${errors} erros.`);
};

run().catch((e) => {
  console.error('Falhou:', e.message);
  process.exit(1);
});