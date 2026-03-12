# Planning Poker Viva 🃏

Herramienta de Planning Poker multijugador en tiempo real.

## Escalas disponibles
- 🌀 **Fibonacci** — 1, 2, 3, 5, 8, 13, 21, ∞, ☕
- 👕 **T-Shirt** — XS, S, M, L, XL, XXL, ∞, ☕
- ⚡ **Potencias ×2** — 1, 2, 4, 8, 16, 32, ∞, ☕

## Características
- Multijugador en tiempo real (Ably WebSockets)
- Modo observador para SM y PO
- Cambio de escala en caliente con ruedita ⚙️
- Expulsar jugadores
- Resetear votos
- Detección de consenso
- Promedio automático
Claro, aquí va:

---
ARQUITECTURA Y TECNOLOGÍAS

**Frontend**
- **React 18** — UI con hooks (`useState`, `useRef`, `useCallback`, `useEffect`)
- **Vite 5** — bundler y dev server, genera el build estático para deploy
- **CSS-in-JS inline** — todo el styling en objetos JS directamente en los componentes, sin librerías externas de estilos

**Tiempo real / Multiplayer**
- **Ably WebSockets** — canal pub/sub por sala (`vivaplanning-ROOMCODE`)
- Arquitectura **broadcast sin servidor** — cada cliente publica el estado completo y todos los demás lo reciben y aplican
- No hay backend propio — Ably actúa como bus de mensajes

**Hosting / Deploy**
- **GitHub Pages** — sirve el build estático
- **GitHub Actions** — CI/CD automático al hacer push a `main`, ejecuta `npm run build` y despliega el `dist/`

**Tipografías**
- **Playfair Display** — títulos y cartas (serif editorial)
- **DM Sans** — textos y UI (sans-serif limpio)
- Cargadas desde Google Fonts

---

**Flujo de datos en tiempo real**

```
Player A vota
    ↓
Publica estado completo al canal Ably
    ↓
Player B, C, D reciben el estado
    ↓
Cada cliente actualiza su UI localmente
```

No hay base de datos — el estado vive solo en memoria mientras la sala está abierta. Si todos cierran el navegador, la sala desaparece.

---

**Lo que NO tiene** (por diseño, para mantenerlo simple):
- No hay backend/API propio
- No hay base de datos ni persistencia
- No hay autenticación
- No hay servidor WebSocket propio — todo delegado a Ably
