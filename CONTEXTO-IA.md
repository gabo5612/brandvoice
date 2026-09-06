# Contexto para IA

> **quill — plataforma editorial RAG multi-tenant**
>
> Generación de artículos con recuperación aumentada y revisión humana. Multi-tenant con RLS, corpus por marca, trazabilidad y ledger de costos.

Este archivo existe para que un asistente de IA —o una persona con prisa— entienda el
proyecto **completo** sin ir leyendo archivos al azar. El orden de lectura de abajo no es
arbitrario: cada archivo asume lo del anterior.

## 🔗 Abrir con el contexto ya cargado

**[▸ Abrir en ChatGPT con este proyecto explicado](https://chatgpt.com/?q=Quiero%20que%20entiendas%20a%20fondo%20el%20repositorio%20p%C3%BAblico%20https%3A%2F%2Fgithub.com%2Fgabo5612%2Fquill.%0A%0Aquill%20%E2%80%94%20plataforma%20editorial%20RAG%20multi-tenant%0AGeneraci%C3%B3n%20de%20art%C3%ADculos%20con%20recuperaci%C3%B3n%20aumentada%20y%20revisi%C3%B3n%20humana.%20Multi-tenant%20con%20RLS%2C%20corpus%20por%20marca%2C%20trazabilidad%20y%20ledger%20de%20costos.%0A%0ALe%C3%A9%20estos%20archivos%20EN%20ESTE%20ORDEN%2C%20porque%20cada%20uno%20asume%20el%20anterior%3A%0A1.%20%60README.md%60%20%E2%80%94%20el%20stack%20y%20c%C3%B3mo%20funciona%20la%20ingesta%2C%20el%20retrieval%20y%20la%20generaci%C3%B3n%0A2.%20%60lib%2Frag%2F%60%20%E2%80%94%20por%20qu%C3%A9%20el%20modelo%20y%20la%20dimensi%C3%B3n%20se%20importan%20del%20mismo%20m%C3%B3dulo%0A3.%20%60lib%2Fingestion%2F%60%20%E2%80%94%20el%20pipeline%20y%20por%20qu%C3%A9%20se%20embebe%20en%20lotes%20de%20100%0A4.%20%60scripts%2Fqa%2FREADME.md%60%20%E2%80%94%20el%20harness%20que%20maneja%20la%20UI%20real%20y%20verifica%20en%20la%20base%0A%0APrest%C3%A1%20especial%20atenci%C3%B3n%20a%20los%20comentarios%20del%20c%C3%B3digo%3A%20explican%20POR%20QU%C3%89%20algo%20se%20hace%20de%20una%20manera%20y%20no%20de%20otra%2C%20y%20casi%20siempre%20hay%20un%20bug%20real%20detr%C3%A1s.%0A%0ACuando%20termines%2C%20respondeme%20estas%20preguntas%20con%20evidencia%20del%20c%C3%B3digo%3A%0A-%20%C2%BFPor%20qu%C3%A9%20la%20distancia%20coseno%20deja%20de%20significar%20nada%20si%20ingesta%20y%20retrieval%20divergen%3F%0A-%20%C2%BFQu%C3%A9%20defectos%20eran%20invisibles%20desde%20afuera%20y%20c%C3%B3mo%20se%20encontraron%3F%0A%0ANo%20resumas%20el%20README%20y%20ya.%20Quiero%20que%20puedas%20discutir%20las%20decisiones%20de%20dise%C3%B1o.)**

Ese link lleva el prompt pre-cargado. Si preferís armarlo a mano, pegá esto:

```text
Quiero que entiendas a fondo el repositorio público https://github.com/gabo5612/quill.

quill — plataforma editorial RAG multi-tenant
Generación de artículos con recuperación aumentada y revisión humana. Multi-tenant con RLS, corpus por marca, trazabilidad y ledger de costos.

Leé estos archivos EN ESTE ORDEN, porque cada uno asume el anterior:
1. `README.md` — el stack y cómo funciona la ingesta, el retrieval y la generación
2. `lib/rag/` — por qué el modelo y la dimensión se importan del mismo módulo
3. `lib/ingestion/` — el pipeline y por qué se embebe en lotes de 100
4. `scripts/qa/README.md` — el harness que maneja la UI real y verifica en la base

Prestá especial atención a los comentarios del código: explican POR QUÉ algo se hace de una manera y no de otra, y casi siempre hay un bug real detrás.

Cuando termines, respondeme estas preguntas con evidencia del código:
- ¿Por qué la distancia coseno deja de significar nada si ingesta y retrieval divergen?
- ¿Qué defectos eran invisibles desde afuera y cómo se encontraron?

No resumas el README y ya. Quiero que puedas discutir las decisiones de diseño.
```

## Orden de lectura

| # | Archivo | Por qué |
|---|---|---|
| 1 | `README.md` | el stack y cómo funciona la ingesta, el retrieval y la generación |
| 2 | `lib/rag/` | por qué el modelo y la dimensión se importan del mismo módulo |
| 3 | `lib/ingestion/` | el pipeline y por qué se embebe en lotes de 100 |
| 4 | `scripts/qa/README.md` | el harness que maneja la UI real y verifica en la base |

## Las preguntas que este proyecto responde

- ¿Por qué la distancia coseno deja de significar nada si ingesta y retrieval divergen?
- ¿Qué defectos eran invisibles desde afuera y cómo se encontraron?

## Cómo está escrito este código

Tres cosas que se repiten en todo el repositorio y conviene saber antes de leerlo:

1. **Los comentarios explican el *porqué*, no el *qué*.** Si un comentario dice que algo
   se hace de una manera rara, ahí hay un bug real detrás, casi siempre uno silencioso.
2. **Lo que no se pudo medir se dice, no se rellena.** Un `n/a` es una respuesta; un cero
   de relleno es una mentira que después se copia a un README.
3. **Los tests que importan son los que prueban que la verificación sirve** — no solo que
   el código pasa. Buscá los que inyectan un fallo a propósito y exigen que sea detectado.

---
*Generado el 2026-09-06. Si el proyecto cambió mucho, este archivo puede estar viejo: el
código manda.*
