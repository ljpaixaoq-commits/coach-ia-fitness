# 📘 Manual de Configuração Técnica: Coach IA Pessoal

Este documento é o guia oficial de instalação, configuração de banco de dados no **Supabase**, controle de versão no **GitHub** e geração de aplicativos para **Web**, **Android (Google Play)** e **Apple (iOS / App Store)**.

---

## 🗂️ 1. Arquitetura e Estrutura do Projeto

O sistema foi desenvolvido utilizando **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **Lucide Icons**, **Recharts** e **Capacitor**.

```
coach-ia-fitness/
├── public/                 # Ícones, manifest e favicon
├── src/
│   ├── components/         # Layout (Header, Sidebar, BottomNav), Modais e Cronômetro
│   ├── views/              # As 11 Telas do Sistema
│   ├── lib/                # Conexão Supabase, Motor do Coach IA, Storage Local
│   ├── store/              # Gerenciamento de Estado Reativo (useAppStore)
│   ├── types/              # Tipagens TypeScript (Séries, Cardio, Vídeos, Nutrição)
│   ├── App.tsx             # Orquestrador e Roteador Principal
│   ├── main.tsx            # Ponto de Entrada da Aplicação
│   └── index.css           # Tema Dark Moderno e Efeitos Glassmorphism
├── supabase/
│   ├── schema.sql          # Script SQL DDL com 16 Tabelas, Índices e RLS
│   └── seed.sql            # Dados Iniciais (Leonardo, Mariana, Treinos, Mistura, Joelho)
├── docs/                   # Manuais em formato DOCX e PDF
├── scripts/                # Scripts de Automação e Geração de Manuais
├── capacitor.config.json   # Configuração Multiplataforma Android / iOS
├── package.json            # Dependências do Projeto
├── vite.config.ts          # Configuração do Vite
├── .env                    # Variáveis de Ambiente e Chaves do Supabase
├── MANUAL_CONFIGURACAO.md  # Este Manual Técnico
└── MANUAL_UTILIZACAO.md    # Manual do Usuário Final
```

---

## ⚡ 2. Configuração do Banco de Dados no Supabase

### Passo 2.1: Acessar seu Projeto no Supabase
1. Acesse o console do Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Selecione o seu projeto (**`oevobunktlxeitkntonl`**).

### Passo 2.2: Executar o Script de Criação das Tabelas (`schema.sql`)
1. No menu lateral esquerdo, clique no ícone **SQL Editor** (ícone `>_`) ou acesse o link direto:
   👉 **[https://supabase.com/dashboard/project/oevobunktlxeitkntonl/sql/new](https://supabase.com/dashboard/project/oevobunktlxeitkntonl/sql/new)**
2. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](file:///C:/Users/leoje/.gemini/antigravity/scratch/coach-ia-fitness/supabase/schema.sql).
3. Cole no editor do Supabase e clique no botão verde **"Run"** (ou pressione `Ctrl + Enter`).
4. Todas as **16 tabelas**, **índices de busca rápida** e **políticas de segurança (RLS)** serão criadas instantaneamente.

### Passo 2.3: Inserir os Dados Iniciais de Demonstração (`seed.sql`) *(Opcional)*
1. No **SQL Editor**, abra uma nova aba de consulta.
2. Copie o conteúdo do arquivo [`supabase/seed.sql`](file:///C:/Users/leoje/.gemini/antigravity/scratch/coach-ia-fitness/supabase/seed.sql).
3. Cole e clique em **"Run"**.
4. Serão inseridos os perfis de **Leonardo** e **Mariana**, a ficha de treino de Peito/Ombro/Tríceps, a receita da **Mistura Personalizada**, o monitoramento do **Joelho Direito** e as metas.

---

## 🔑 3. Configuração do Arquivo de Ambiente (`.env`)

O arquivo `.env` na raiz do projeto já está devidamente configurado com as chaves do seu projeto:

```env
# URL e Chave Pública do Supabase
VITE_SUPABASE_URL=https://oevobunktlxeitkntonl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldm9idW5rdGx4ZWl0a250b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODkzMjEsImV4cCI6MjEwNDU2NTMyMX0.mc32BsjYIUE2HDxKS0jCJD78A6X_pFY51sDnEGoF2-I
```

---

## 💻 4. Executando o Sistema Localmente

1. Abra o terminal do PowerShell na pasta do projeto:
   ```powershell
   cd C:\Users\leoje\.gemini\antigravity\scratch\coach-ia-fitness
   ```
2. Instale as dependências caso necessário:
   ```powershell
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```powershell
   npm run dev
   ```
4. Abra seu navegador no endereço: **`http://localhost:3000/`**.
   * Para acessar pelo celular na mesma rede Wi-Fi, utilize o endereço de IP exibido no terminal (ex: `http://192.168.1.14:3000/`).

---

## 🐙 5. Envio do Projeto para o GitHub

Para manter seu projeto sob controle de versão contínuo:

1. Crie um repositório no seu GitHub com o nome `coach-ia-fitness`.
2. No terminal da pasta do projeto, execute os comandos:
   ```powershell
   git init
   git add .
   git commit -m "feat: Coach IA Pessoal completo com 11 telas, vídeos, séries e Supabase"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/coach-ia-fitness.git
   git push -u origin main
   ```
3. Para envios posteriores de novas melhorias:
   ```powershell
   git add .
   git commit -m "feat: atualização"
   git push
   ```

---

## 🌐 6. Publicação na Web (Vercel ou Netlify)

1. Acesse [https://vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em **"Add New Project"** e selecione o repositório `coach-ia-fitness`.
3. Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Clique em **"Deploy"**. A aplicação estará disponível online em segundos com certificado SSL gratuito.

---

## 📱 7. Publicação para Android e Apple iOS (Capacitor)

### Passo 7.1: Gerar a Versão de Produção
```powershell
npm run build
```

### Passo 7.2: Compilar para Android (Google Play Store)
1. Adicione a plataforma Android:
   ```powershell
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   npx cap sync android
   ```
2. Abra o projeto no **Android Studio**:
   ```powershell
   npx cap open android
   ```
3. No Android Studio, vá em **Build > Generate Signed Bundle / APK** para gerar o arquivo `.aab` pronto para envio à Google Play Store.

### Passo 7.3: Compilar para Apple (iOS / App Store)
*(Requer computador macOS com Xcode)*
1. Adicione a plataforma iOS:
   ```bash
   npm install @capacitor/ios
   npx cap add ios
   npx cap sync ios
   ```
2. Abra o projeto no **Xcode**:
   ```bash
   npx cap open ios
   ```
3. Vincule seu Apple Developer Account e selecione **Product > Archive** para publicação na App Store e TestFlight.

---

## 🔒 8. Segurança e Isolamento dos Dados da Família

- O sistema utiliza **Row Level Security (RLS)** nativo do PostgreSQL.
- Cada membro da família (ex: Leonardo, Mariana) possui seus treinos, evolução de cargas, fotos e histórico de dores associados ao seu próprio `profile_id`, garantindo privacidade absoluta entre os perfis.