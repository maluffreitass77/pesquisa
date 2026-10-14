# Meu Perfil

Aplicativo mobile de exemplo para cadastro, login, recuperação de senha e gerenciamento de perfil. Foi feito com Ionic Vue, TypeScript, Capacitor e Supabase.

## Tecnologias

- Ionic Vue: interface adaptável a celular e navegador.
- Vue 3 + TypeScript + Vue Router: telas, lógica e navegação.
- Supabase Auth: cadastro, login e recuperação de senha.
- Supabase Database: tabela `profiles`, protegida por Row Level Security (RLS).
- Supabase Storage: fotos privadas, servidas por URL assinada temporária.
- Capacitor: empacotamento e execução em Android.

## 1. Preparar o Supabase

1. Acesse [supabase.com](https://supabase.com/), crie uma conta ou entre, clique em **New project**, escolha a organização, informe nome e senha do banco e selecione a região próxima dos usuários.
2. No painel, abra **SQL Editor**, cole e execute [`supabase/schema.sql`](./supabase/schema.sql). O script cria a tabela de perfil, ativa RLS e configura o bucket privado e suas políticas.
3. Em **Project Settings → API Keys**, copie a Project URL e a chave pública **Publishable** (começa com `sb_publishable_`). Em projetos antigos, a chave `anon` legada também pode ser usada. Nunca use a chave `service_role` ou outra chave secreta no aplicativo.
4. Em **Authentication → URL Configuration → Redirect URLs**, permita `http://localhost:5173/**`, `http://127.0.0.1:5173/**` e `br.edu.projeto.meuperfil://auth-callback` para retorno web/Android (confirmação de conta e recuperação de senha). A URL do Redirect URLs deve corresponder ao endereço usado para abrir o Vite.
5. Para testar a recuperação, habilite o envio de e-mail de confirmação/redefinição no Supabase. Em produção, configure um provedor SMTP.

O aplicativo usa a chave pública do Supabase no cliente. Nunca coloque a `service_role` ou qualquer segredo administrativo no arquivo `.env` ou no aplicativo.

## 2. Instalar e executar no navegador

Requisitos: Node.js 20.19+ (ou 22.12+) e npm.

```sh
npm install
```

Copie `.env.example` para `.env` e substitua os valores:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

O arquivo `.env` é ignorado pelo Git. Para projetos que ainda usam a chave `anon` legada, o cliente também aceita `VITE_SUPABASE_ANON_KEY`.
O `.env` deve ficar na mesma pasta do `package.json` (raiz do projeto); não deixe os textos `seu-projeto` e `sua-chave-publica`. Obtenha os valores reais em **Project Settings → API Keys**. No Windows, pode copiar o exemplo com `Copy-Item .env.example .env`, abrir `.env` no VS Code e substituir os dois valores. Depois que o arquivo for alterado, encerre o servidor Vite com `Ctrl+C` e execute `npm run dev` novamente. O terminal do Vite precisa estar aberto na pasta do projeto.

Depois execute:

```sh
npm run dev
```

O servidor mostra o endereço local. Se as credenciais ainda não estiverem preenchidas, o app exibe uma orientação e mantém as ações de autenticação desabilitadas. Reinicie o Vite após alterar `.env`.

## 3. Executar no Android

Instale o Android Studio e configure o Android SDK. Conecte um dispositivo com depuração USB ou inicie um emulador. Na primeira vez, adicione a plataforma Android:

```sh
npx cap add android
```

Para compilar a aplicação web e sincronizá-la com o projeto Android:

```sh
npm run cap:sync
```

Abra o projeto no Android Studio e execute no emulador/aparelho:

```sh
npm run android
```

Após alterações na aplicação web, execute `npm run cap:sync` novamente. Os plugins `@capacitor/camera` e `@capacitor/app` abrem a câmera/galeria e recebem links de confirmação e recuperação enviados pelo Supabase.

## Fluxos disponíveis

- Cadastro com nome, e-mail e senha. Se o Supabase exigir confirmação de e-mail, o app informa que é necessário confirmar antes de entrar.
- Login por e-mail e senha.
- Recuperação de senha por link de e-mail e tela para cadastrar a nova senha.
- Perfil com nome completo, data de nascimento, nickname e foto. O perfil fica vinculado ao UUID autenticado e usa `upsert` após validar os campos.
- Tela de boas-vindas com resumo e opção para editar o perfil.
- Rotas privadas e redirecionamento para completar o perfil.

## Perfil e fotos

A tabela `profiles` contém `id`, `name`, `birth_date`, `nickname`, `avatar_path`, `created_at` e `updated_at`. O `id` referencia `auth.users.id`, com exclusão em cascata. As políticas RLS de leitura, inserção e atualização verificam `auth.uid() = id`; não existe acesso anônimo nem leitura do perfil de outra pessoa.

O bucket privado `avatars` aceita imagens JPEG, PNG e WebP de até 5 MB. Os caminhos ficam no diretório do usuário (`{userId}/avatar-<id>.ext`). O aplicativo gera URLs assinadas válidas por uma hora para exibir as imagens. Ao substituir uma foto, primeiro envia a nova, atualiza `avatar_path` e somente então remove a anterior; se a gravação falhar, tenta remover o upload novo para manter o perfil consistente. As políticas de Storage limitam leitura, envio, substituição e remoção aos objetos do próprio usuário.

## Estrutura principal

```text
src/
  components/       Componentes compartilhados
  router/           Rotas e proteção de acesso
  services/         Cliente Supabase, autenticação, perfil e Storage
  types/            Tipos do banco e do perfil
  theme/            Tema Ionic da aplicação
  views/            Telas da aplicação
supabase/
  schema.sql        Tabela, RLS, bucket e políticas de Storage
```

## Verificações

```sh
npm run build
```

O comando valida os tipos TypeScript e gera a versão de produção em `dist/`.
