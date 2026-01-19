# 🧭 MeetingManager - Product Strategy

> **Documento de referência para todas as decisões de produto**

---

## 📌 POSICIONAMENTO

### O que o MeetingManager É
> Uma ferramenta operacional para condução e registro fiel da reunião do meio de semana, em tempo real.

### O que NÃO é
- ❌ Sistema administrativo
- ❌ SaaS corporativo
- ❌ Plataforma social
- ❌ Sistema de designações

**Palavra-chave:** *operacional*

---

## 👤 USUÁRIO-ALVO

### Persona Principal
- Irmão designado para controle do tempo/assistência

### Contexto de Uso
- Durante a reunião
- Sob pressão de tempo
- Com pouco espaço para erro
- Muitas vezes em celular ou tablet

---

## 🎯 PROBLEMA QUE RESOLVE

| Antes (manual) | Depois (MeetingManager) |
|----------------|-------------------------|
| Cronômetro manual | ⏱️ Tempo das partes |
| Tempos no papel | 💬 Tempo dos comentários |
| Conta assistência "na cabeça" | 👥 Assistência simples |
| Relatório depois, manualmente | 🧾 Relatório automático |

---

## 🧱 ARQUITETURA (3 CAMADAS)

### 🥇 Camada 1 — Núcleo Operacional (IMUTÁVEL)
**Isso NUNCA pode quebrar:**
- Reunião ao vivo
- Cronômetro por parte
- Comentários como tempo
- Nomes manuais
- Assistência simples
- Relatório cronológico

### 🥈 Camada 2 — Persistência (Valor Agregado)
**Evolução SEM risco:**
- Histórico de reuniões
- Exportar PDF depois
- Revisar reuniões passadas
- Relatório mensal

⚠️ Sempre **fora do momento ao vivo**

### 🥉 Camada 3 — Conveniência (Opcional)
**Quando o produto estiver sólido:**
- Login opcional
- Backup em nuvem
- Multi-idioma
- Tema claro/escuro

📌 Nunca bloqueiam uso, nunca são obrigatórias

---

## 🗺️ ROADMAP (12-18 MESES)

### Fase A — Produto Correto (AGORA)
- [x] Ajustar modelo de comentários
- [x] Simplificar assistência
- [ ] Corrigir relatório
- [x] Cortar complexidade desnecessária
- **Resultado:** Ferramenta confiável

### Fase B — Produto Confiável
- [ ] Histórico por semana
- [ ] Reabrir relatório antigo
- [ ] Exportar PDF melhor formatado
- [ ] Pequenas melhorias de UX
- **Resultado:** Vira hábito

### Fase C — Produto Escalável
- [ ] Login opcional
- [ ] Perfis simples
- [ ] Templates por congregação
- [ ] Backup automático
- **Resultado:** Produto "instalado" na rotina

---

## 🎯 REGRA DE OURO

> **"Isso ajuda durante a reunião?"**

| Resposta | Ação |
|----------|------|
| ✅ Sim | Pode entrar |
| ⏸️ Não, mas útil depois | Talvez depois |
| ❌ Atrapalha | Não entra |

---

*Última atualização: 2026-01-18*
