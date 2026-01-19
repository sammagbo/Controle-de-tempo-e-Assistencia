# MeetingManager — Documento Oficial (v3.0)

## 1. Propósito

O **MeetingManager** é um **PWA offline-first**, de **uso individual**, para apoiar a condução da reunião do meio de semana (*Nossa Vida e Ministério Cristão*), permitindo:

* controle de tempo das partes;
* controle dos **comentários obrigatórios do presidente** (somente onde se aplica);
* contagem simples de assistência;
* registro **manual** dos nomes dos irmãos;
* geração de **relatório fiel**, humano e cronológico.

---

## 2. Usuário-alvo

Qualquer irmão que deseje **usar o sistema no próprio dispositivo**, para:

* conduzir a reunião;
* apoiar o controle de tempo/assistência;
* treinar/simular;
* gerar **seu próprio relatório**.

**Cada usuário é totalmente independente.**

---

## 3. Princípios inegociáveis

* **Offline-first** (funciona 100% offline após o primeiro uso).
* **Login existe**, mas **nunca bloqueia** o uso ao vivo (sessão persistente).
* **Estrutura da reunião já existe no sistema** (global, imutável).
* **Nenhuma importação de PDF**.
* **Dados não são compartilhados** entre usuários.
* **Relatório é a entrega principal**.

---

## 4. Estrutura da reunião (global e imutável)

A estrutura oficial da reunião **já está no sistema** e é igual no mundo todo.
O usuário **não cria, não edita e não reordena** a estrutura.

A ordem inclui:

* Cântico e oração iniciais
* Comentários iniciais
* Tesouros da Palavra de Deus (cronometrado)
* Joias Espirituais (cronometrado, **sem comentários separados**)
* Leitura da Bíblia (cronometrada + **comentário obrigatório do presidente**)
* Faça Seu Melhor no Ministério (partes de alunos + **comentário obrigatório do presidente após cada parte**)
* Nossa Vida Cristã
  * Cântico
  * Partes intermediárias
  * Estudo Bíblico da Congregação (30 min, **sem comentários separados**)
* Comentários finais
* Cântico final e oração

---

## 5. Cronometragem (regra geral)

* Cronômetro **sempre crescente** (00:00 → ∞).
* Cada parte tem **tempo previsto**.
* O cronômetro **nunca para sozinho**.
* O usuário decide quando parar.

### Estados visuais:

* 🟢 Dentro do tempo
* 🔴 Ultrapassou o tempo (mostrar `+mm:ss`)
* Se terminar antes: mostrar `−mm:ss`

---

## 6. Comentários do presidente (apenas onde se aplica)

**Existem comentários cronometrados APENAS para:**

* Leitura da Bíblia
* Todas as partes de alunos em *Faça Seu Melhor no Ministério*

**Não existem comentários cronometrados para:**

* Joias Espirituais
* Estudo Bíblico da Congregação
* Cânticos
* Orações
* Tesouros da Palavra de Deus

### Regras:

* Comentário é **obrigatório** quando aplicável.
* Comentário **não tem tempo fixo**.
* Comentário = **tempo**, sem nomes.
* Fluxo automático: **parte → comentário → próxima parte**.

---

## 7. Cânticos e orações

* **Não são cronometrados ao vivo**.
* Aparecem no relatório com **tempo previsto**.

---

## 8. Nomes dos irmãos (100% manuais)

* Cada parte tem um campo manual **"Irmãos / Designados"**.
* Texto livre.
* Aceita 0, 1 ou 2 nomes.
* Editável antes, durante e depois da reunião (até gerar o relatório).
* Usado **apenas no relatório do usuário**.

---

## 9. Início e término da reunião

* A reunião começa ao clicar em **"Iniciar Reunião"**:
  * registra o horário atual do dispositivo.
* A reunião termina ao finalizar a **oração final**:
  * registra o horário de término.
* O relatório mostra:
  * horário de início;
  * horário de término;
  * duração total.

---

## 10. Assistência

* **Um único número** por reunião.
* Incremento por toque.
* Decremento opcional.
* Salvo no histórico do usuário.
* Exibido no relatório.

---

## 11. Comparação tempo previsto × real

* **Não mostrar comparação durante a reunião**.
* Mostrar no **relatório final**, por parte:
  * tempo real;
  * diferença (`+` ou `−`).

---

## 12. Relatório final

* Gerado **manualmente** pelo usuário.
* Gerado **localmente no dispositivo** (offline).
* Salvo no histórico do usuário.
* Exportável (PDF/compartilhamento).

### Formato humano:

```
Iniciando conversas (Ionara e Laura) – 01:25 (−00:35)
Conselho: 01:39
```

Inclui:

* estrutura completa;
* nomes manuais;
* tempos reais;
* diferenças;
* assistência;
* dados gerais;
* horários de início/fim;
* duração total.

---

## 13. Dados gerais (opcionais)

* Congregação / Local
* Data exata da reunião
* Observações gerais

Editáveis a qualquer momento (até gerar o relatório).

---

## 14. Histórico e retenção

* Relatórios salvos por **1 ano**.
* Relatórios **fixados** ficam por **até 2 anos**.
* Aviso antes da exclusão:
  * no app;
  * por notificação do dispositivo.
* Exclusão manual pede confirmação.

---

## 15. Login e sincronização

* Login por usuário.
* Sessão persistente.
* Dados salvos localmente primeiro.
* Sincronização automática quando houver internet.
* Mesmo usuário pode recuperar histórico em outro dispositivo.
* Reuniões em andamento **não são continuadas** em outro dispositivo.

---

## 16. O que o sistema NÃO é

* Não é colaborativo.
* Não é oficial.
* Não importa PDFs.
* Não compartilha dados entre usuários.
* Não faz análises durante a reunião.
* Não impõe cargos ou permissões.

---

## 17. Critério final de sucesso

Dois irmãos podem usar o app simultaneamente, na mesma reunião real, e **cada um gera seu próprio relatório fiel**, sem interferência.
