# API Contracts (MeetingManager)

Este documento define o contrato da API REST que será exposta pelo backend Spring Boot. Estes contratos foram desenhados com base no modelo de dados do frontend e operações que antes eram executadas via Supabase.

## 1. Convenções Globais

- **URL Base:** `/api/v1`
- **Formatos:** `application/json`
- **Autenticação:** Baseada em sessão (Session Cookie / JWT em HttpOnly Cookie). O cliente deve incluir credenciais nas requisições (ex: `credentials: 'include'` no fetch/axios).
- **Nomenclatura:** Todos os atributos JSON utilizam **snake_case**, garantindo compatibilidade retroativa com as interfaces TypeScript preexistentes que consumiam dados do Supabase.

## 2. Tratamento de Erros

A API adota o padrão **RFC 7807 (Problem Details for HTTP APIs)**, nativo no Spring Boot 3 (`ProblemDetail`).

**Exemplo de Resposta (HTTP 400 Bad Request):**
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid parameters provided",
  "instance": "/api/v1/auth/login",
  "errors": [
    {
      "field": "email",
      "message": "Must be a well-formed email address"
    }
  ]
}
```

---

## 3. Endpoints de Autenticação

### `POST /api/v1/auth/login`
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```
*(Um cookie HttpOnly será retornado nos headers).*

### `GET /api/v1/auth/me`
**Response (200 OK):** (Retorna os dados do usuário atual).
```json
{
  "user": { ... }
}
```

### `POST /api/v1/auth/logout`
**Response (200 OK):** (Invalida a sessão e limpa o cookie).

---

## 4. Dashboard e Agendas Globais

### `GET /api/v1/dashboard/periods`
Retorna todos os períodos oficiais, juntamente com suas semanas correspondentes.
**Response (200 OK):**
```json
[
  {
    "id": "period_uuid",
    "name": "Jan-Fev 2026",
    "start_date": "2026-01-01",
    "end_date": "2026-02-28",
    "weeks": [
      {
        "id": "week_uuid",
        "label": "Semana 1",
        "date_range": "5-11 de Janeiro",
        "theme": "Tema da semana",
        "status": "upcoming"
      }
    ]
  }
]
```

---

## 5. Reuniões (Meetings)

### `POST /api/v1/meetings`
Cria o registro de uma nova reunião para uma semana específica, incluindo seus `agenda_items` padrão da estrutura global.
**Request Body:**
```json
{
  "week_id": "week_uuid"
}
```
**Response (201 Created):** Retorna a reunião criada e seus itens de agenda em formato aninhado.

### `GET /api/v1/meetings/active`
Busca a reunião atualmente em progresso pelo usuário (se houver).
**Response (200 OK):**
```json
{
  "id": "meeting_uuid",
  "week_id": "week_uuid",
  "started_at": "...",
  "agenda_items": [ ... ]
}
```

### `PUT /api/v1/meetings/{id}`
Atualiza dados macro da reunião (ex: iniciar relógio principal, presidente, finalizar reunião).
**Request Body (Partial Update / PATCH like):**
```json
{
  "started_at": "2026-06-16T19:00:00Z",
  "finished_at": null,
  "total_duration_seconds": 0,
  "president": "Nome do Irmão"
}
```

---

## 6. Partes da Reunião (Agenda Items)

### `PUT /api/v1/agenda-items/{id}`
Atualiza o progresso, tempo e responsáveis de uma parte da reunião.
**Request Body:**
```json
{
  "actual_seconds": 120,
  "status": "completed",
  "assigned_names": "Irmão A e Irmão B"
}
```

---

## 7. Comentários (Presidente)

### `POST /api/v1/comments`
Registra os comentários aplicados pelo presidente.
**Request Body:**
```json
{
  "meeting_id": "meeting_uuid",
  "agenda_item_id": "agenda_item_uuid",
  "duration_seconds": 45,
  "comment_type": "post_student"
}
```

---

## 8. Assistência (Attendance)

### `PUT /api/v1/meetings/{id}/attendance`
Atualiza a assistência da reunião de forma idempotente (Upsert).
**Request Body:**
```json
{
  "presencial": 50,
  "zoom": 15
}
```

---

## 9. Histórico e Relatórios

### `GET /api/v1/reports/history`
Retorna uma lista consolidada das reuniões anteriores do usuário para montagem do painel de histórico.
**Response (200 OK):** Array de reuniões incluindo resumo de `attendance` e links para detalhes.

### `GET /api/v1/reports/meetings/{id}`
Retorna a "foto completa" da reunião finalizada (Meeting + Agenda + Comments + Attendance), pronta para exportação/PDF.
