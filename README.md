# Trabalho de Graduação (Fatec) - Diário e Monitoramento do Ciclo Circadiano

Aplicativo mobile desenvolvido em React Native (Expo) inspirado na experiência de usuário do Daylio. O objetivo principal do projeto é permitir o registro granular do humor, horas de sono, atividades diárias (tags) e sonhos para cruzamento de dados e análise do ciclo circadiano do usuário.

## 🛠 Tecnologias e Stack
- **Framework:** React Native com [Expo](https://expo.dev/) (Managed Workflow)
- **Linguagem:** TypeScript
- **Navegação:** React Navigation (`@react-navigation/native-stack`)
- **Banco de Dados:** SQLite (`expo-sqlite`) gerido localmente.
- **Autenticação/Sessão:** `expo-secure-store`
- **UI/UX:** `react-native-safe-area-context`, `@expo/vector-icons`, `@react-native-community/datetimepicker`

---

## 🏗 Arquitetura do Projeto

O projeto segue uma arquitetura baseada no **Repository Pattern** para separar completamente a lógica de acesso a dados da camada de interface (UI).

```text
meu-app-tg/
├── App.tsx                  # Ponto de entrada e Maestro da Navegação
├── src/
│   ├── components/          # Componentes visuais reutilizáveis (ex: HistoryCard)
│   ├── database/            # Configuração e inicialização do SQLite (initDB.ts)
│   ├── repositories/        # Consultas SQL e regras de DB (RecordRepository, UserRepository)
│   ├── screens/             # Telas da aplicação (Dashboard, DailyLog, Login, Profile)
│   ├── services/            # Serviços externos ou nativos (AuthService)
│   └── types/               # Tipagens globais do TypeScript

Regras de Ouro da Arquitetura:
Telas (screens) NUNCA fazem queries SQL diretamente. Elas devem sempre chamar um método de um Repository.

services/AuthService é o único responsável por lidar com o SecureStore (tokens/IDs de sessão).

Navegação é gerenciada via React Navigation no App.tsx. Parâmetros entre telas (como IDs de edição e datas) são passados via route.params.

🤖 INSTRUÇÕES ESTRITAS PARA AGENTES DE IA (System Prompting)
Se você é uma Inteligência Artificial assumindo ou auxiliando no desenvolvimento deste projeto, leia e obedeça as seguintes diretrizes antes de gerar qualquer código:

1. Ambiente e Dependências (PERIGO)
Este é um projeto Expo Managed. NUNCA sugira instalar bibliotecas que exigem "linkagem" manual nativa (arquivos .gradle, Podfile, Info.plist, AndroidManifest.xml). Sempre priorize pacotes oficiais do Expo (ex: npx expo install).

NUNCA recomende rodar npm audit fix --force. Isso quebra o Expo SDK. Se houver erro de resolução de dependência, sugira --legacy-peer-deps ou limpe o cache (npx expo start -c).

2. Tratamento do Banco de Dados (SQLite)
Estamos usando o novo padrão síncrono/assíncrono do expo-sqlite (ex: openDatabaseSync, runAsync, getAllAsync, getFirstAsync). Não utilize sintaxes antigas baseadas em callbacks (db.transaction(tx => ...)).

Relacionamentos: Os registros diários (daily_records) e o sono podem conter N atividades (record_activities). Ao fazer UPDATE em um registro, a política atual é deletar os vínculos antigos em record_activities e reinserir os novos, para garantir consistência sem complexidade excessiva.

3. Design e UI (A Filosofia Daylio)
Mantenha a interface minimalista, com botões grandes e modais amigáveis.

O aplicativo utiliza um padrão "Dark Mode" customizado (backgroundColor: '#000', cards em #1E1E1E ou #222, detalhes em roxo #9d4edd).

Respeite o SafeAreaView e o KeyboardAvoidingView. Sempre garanta que barras inferiores ou modais flutuantes usem o useSafeAreaInsets para não conflitar com a navegação gestual do Android/iOS.

4. Ciclo de Autenticação
O login salva o userId no SecureStore.

O App.tsx usa uma renderização condicional (isAuthenticated ? <StackScreens> : <LoginScreen>). Não tente usar navigation.replace('Login') para logout. Apenas limpe o SecureStore e chame a função de callback de logout para alterar o estado no App.tsx.

5. Foco Acadêmico
Lembre-se que este é um Trabalho de Graduação (TG). O código deve priorizar a clareza, manutenibilidade e ser capaz de exportar/cruzar dados de forma mensurável (ex: qualidade do sono vs. humor). Não adicione complexidade técnica desnecessária (como Redux ou GraphQL) a menos que explicitamente solicitado.