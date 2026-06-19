# Prueba Técnica Automatización — Decisiones Técnicas

## Estructura del Proyecto

```
farmatodo-automation/
├── api/                        # API client (transporte + parsing)
│   └── client.ts
├── pages/                      # Page Object Model
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutInfoPage.ts
│   ├── CheckoutOverviewPage.ts
│   └── CheckoutCompletePage.ts
├── fixtures/                   # Playwright fixtures (DI para POMs)
│   └── index.ts
├── utils/                      # Shared utilities
│   ├── schemas.ts              # Zod schemas para PokéAPI
│   ├── sort.ts                 # Insertion Sort genérico
│   └── types.ts                # Tipos compartidos (ProductInfo, PokemonEntry)
├── tests/
│   ├── integration/            # Integration spec (PokéAPI)
│   │   └── pokeapi-evolution.spec.ts
│   ├── e2e/                    # E2E spec (SauceDemo)
│   │   └── saucedemo-checkout.spec.ts
│   └── utils/                  # Unit tests del sort
│       └── sort.spec.ts
├── docs/
│   └── technical-decisions.md
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Decisiones Técnicas

### 1. Playwright + TypeScript

- **Playwright 1.54.2** — versión estable sin bugs de resolución de imports. 1.61.0 tiene un bug con imports relativos TypeScript (`context.conditions?.includes is not a function`).
- **TypeScript estricto** con `tsc --noEmit` para validación de tipos en CI.
- Dos proyectos separados en `playwright.config.ts`:
  - `api` — tests de integración + unit, **sin navegador**. Más rápidos.
  - `e2e` — tests de browser con Chromium, con `baseURL`, `screenshot` y `trace` configurados solo para este proyecto.
- Reporte HTML configurado con `open: 'never'` para no secuestrar el navegador del desarrollador.

### 2. Zod para validación runtime de API

- Las respuestas de PokéAPI se validan con Zod en el API client (`api/client.ts`).
- Los tipos se infieren de los schemas con `z.infer` — sin interfaces manuales.
- `z.lazy()` para la estructura recursiva de `ChainLink` (evolves_to → ChainLink[]).
- Si la API cambia, `ZodError` da el mensaje exacto de qué cambió, en vez de un error silencioso de `any`.

### 3. API Client Layer

Separación en dos capas:

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Schemas | `utils/schemas.ts` | Zod schemas + tipos inferidos |
| Client | `api/client.ts` | Solo HTTP calls + parsing Zod |

El API client es genérico — no tiene lógica de dominio ni funciones específicas de un Pokemon. Expone solo `fetchPokemon()`, `fetchSpecies()`, `fetchEvolutionChain()` que sirven para cualquier consulta.

La orquestación (traverse chain, build entries, status checks) vive en el spec. Esto mantiene el cliente reutilizable y la lógica de negocio visible en el test.

### 4. Page Object Model

Separación estricta:
- **Page Objects** → selectores + acciones + getters que retornan `ProductInfo`
- **Tests** → solo `expect()` y flujo con `test.step()`

**Páginas:**

| Clase | Página | Acciones clave |
|---|---|---|
| `LoginPage` | Login | `login()`, `readCredentials()` |
| `InventoryPage` | Products | `getProductInfo()`, `addItemToCart()`, `waitForItems()` |
| `CartPage` | Cart | `goto()`, `getProductInfo()`, `goToCheckout()` |
| `CheckoutInfoPage` | Checkout Step 1 | `fillInfo()`, `submit()` |
| `CheckoutOverviewPage` | Checkout Step 2 | `getProductInfo()`, `finish()` |
| `CheckoutCompletePage` | Confirmación | `isOrderComplete()`, `getThankYouText()` |

**Patrón `ProductInfo`:**
```typescript
interface ProductInfo {
  name: string;
  price: string;
}
```
Los page objects retornan `ProductInfo` en vez de obligar al test a llamar `getName()` + `getPrice()` por separado. Se compara con `toEqual()`.

### 5. Playwright Fixtures

Los Page Objects se inyectan vía fixtures (`fixtures/index.ts`), eliminando la instanciación manual:

```typescript
// Antes: cada test instanciaba 5 page objects manualmente
const loginPage = new LoginPage(page);
const inventoryPage = new InventoryPage(page);
// ...

// Después: llegan por parámetro del test
test('...', async ({ loginPage, inventoryPage, cartPage }) => {
  await loginPage.login(...);
});
```

### 6. Credenciales desde la UI

`LoginPage.readCredentials()` parsea el DOM real de la página de login usando `innerText` (respeta `<br>` como saltos de línea, a diferencia de `textContent`):

```typescript
const result = await this.page.evaluate(() => {
  const credsDiv = document.querySelector('[data-test="login-credentials"]');
  const pwdDiv = document.querySelector('[data-test="login-password"]');
  return {
    credsLines: (credsDiv as HTMLElement).innerText.split('\n'),
    pwdLines: (pwdDiv as HTMLElement).innerText.split('\n'),
  };
});
// result.credsLines[1] = "standard_user"
// result.pwdLines[1] = "secret_sauce"
```

**Bug encontrado durante implementación:** `textContent` concatena todo sin separadores (`standard_userlocked_out_user...`). Se usó `innerText` que sí respeta los `<br>` del DOM.

### 7. Insertion Sort

- Implementación manual sin `.sort()` nativo (requisito explícito de la prueba).
- Genérico: `insertionSort<T>(items: T[], compare: (a: T, b: T) => number): T[]`
- Inmutable: no muta el array original (`const arr = [...items]`).
- 9 unit tests cubriendo: vacío, single, ya ordenado, inverso, duplicados, strings, inmutabilidad, objetos por propiedad.

### 8. Locator Strategy

Prioridad real (documentada honestamente — no se afirma `getByRole` si no se usa):

1. **IDs estables** para form fields: `#user-name`, `#password`, `#first-name`, etc.
2. **Contenedores semánticos** filtrados por `hasText`: `.inventory_item`, `.cart_item`
3. **Selectores de clase** para botones: `.btn_inventory`, `#checkout`, `#continue`, `#finish`
4. **data-test** para parsing de credenciales: `[data-test="login-credentials"]`

### 9. Assertions completas

- Integración: `expect(sorted).toEqual([{ name, weight }, ...])` — valida **nombre + peso**, no solo nombres.
- E2E: `expect(cartProduct).toEqual(capturedProduct)` — compara todo el `ProductInfo` de una vez.

### 10. Comandos

```bash
npm run typecheck    # tsc --noEmit (validar tipos)
npm test             # playwright test (proyectos api + e2e)
npm run test:api     # playwright test --project=api
npm run test:e2e     # playwright test --project=e2e
npm run test:sort    # playwright test --project=api tests/utils/sort.spec.ts
npm run test:headed  # E2E con navegador visible
npm run test:report  # playwright show-report playwright-report
```

### 11. Playwright version bug

Playwright 1.61.0 tiene un bug en la resolución de imports relativos de TypeScript. Se downgradeó a 1.54.2 que funciona correctamente. Bug reportado incluye el error: `TypeError: context.conditions?.includes is not a function`.

### 12. Variables de entorno

| Variable | Propósito |
|---|---|
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE` | Ruta al binario de Chromium del sistema |
| `CI` | Modo CI (retries, workers, forbidOnly) |
