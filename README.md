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

## Deploy
1. Sube a un repo de GitHub
2. En `vite.config.js` cambia `planning-poker-viva` por el nombre exacto de tu repo
3. Settings → Pages → Source: GitHub Actions
4. Push a main → se deploya automáticamente
