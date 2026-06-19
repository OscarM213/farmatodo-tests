# Prueba Técnica Automatización

Playwright + TypeScript automation tests.

## Requisitos

- Node.js 18+
- npm
- Chromium (sistema o `npx playwright install chromium`)

## Instalación

```bash
npm install
```

Si no tienes Chromium en el sistema:

```bash
npx playwright install chromium
```

Para usar un Chromium específico:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

## Ejecutar Tests

```bash
npm run typecheck         # Validar tipos
npm test                  # Todos los tests
npm run test:api          # Solo integración PokéAPI
npm run test:e2e          # Solo E2E SauceDemo
npm run test:sort         # Solo unit tests Insertion Sort
npm run test:headed       # E2E con navegador visible
npm run test:report       # Ver reporte HTML
```

## Tests

### Integración — PokéAPI
Obtiene la cadena de evolución de Squirtle (Squirtle → Wartortle → Blastoise), extrae los pesos y los muestra ordenados alfabéticamente sin usar `.sort()`.

### E2E — SauceDemo
Flujo completo de compra: login (credenciales leídas desde la UI) → buscar producto → añadir al carrito → validar carrito → checkout → confirmar orden.

## Stack

- **Playwright** — Automatización browser + API testing
- **TypeScript** — Type safety con `tsc --noEmit`
- **Zod** — Validación runtime de respuestas API
- **Page Object Model** — Selectores y acciones encapsulados
- **Insertion Sort** — Implementación manual sin `.sort()` nativo
