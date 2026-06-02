# Product

## Register

product

## Users

Clientes de Grido San Rafael (Mendoza, Argentina) que quieren pedir helados a domicilio o para retirar. Edad 18-45, usan el celular, esperan una experiencia tan ágil como PedidosYa. El contexto de uso es casual: están en casa, quieren algo rico, abren la app y en 2 minutos ya tienen el pedido hecho.

## Product Purpose

App de delivery de helados para la franquicia Grido San Rafael. El objetivo es que el cliente navegue el menú, elija productos y sabores, y complete el pedido por WhatsApp o pago online, en el menor tiempo y fricción posible. Éxito = pedido completado en menos de 3 minutos.

## Brand Personality

Fresca, moderna, rápida. Energía de una heladería conocida y querida, pero con la eficiencia de una app de delivery de 2026. Cercana sin ser informal, apetitosa sin ser recargada.

## Anti-references

- Apps de delivery genéricas con UI gris y sin personalidad
- Diseños con demasiados gradientes o efectos glassmorphism decorativos
- Tipografías pesadas y oscuras que no transmiten frescura
- Cards idénticas en grid sin jerarquía visual
- Animaciones lentas o excesivas que hacen la app sentir pesada

## Design Principles

1. **Velocidad percibida ante todo.** Cada interacción debe sentirse instantánea. Animaciones bajo 250ms, feedback táctil inmediato en cada botón.
2. **El producto es la estrella.** Las cards de productos deben ser apetitosas y claras. El precio y el botón de agregar deben ser obvios sin pensar.
3. **Fricción cero.** Cada paso del flujo (elegir → personalizar → pagar) debe ser evidente. Sin ambigüedad, sin pasos innecesarios.
4. **Identidad Grido.** Azul marino (#0d2050) como base, blanco como superficie, acento rojo (#E3001B) solo para CTAs críticos. Nunca decorativo.
5. **Mobile-first sin concesiones.** El 95% del tráfico es móvil. Targets táctiles grandes (min 44px), gestos naturales, sin hover states como única affordance.

## Accessibility & Inclusion

- WCAG AA mínimo (contraste 4.5:1 en texto normal, 3:1 en texto grande)
- prefers-reduced-motion respetado en todas las animaciones GSAP
- Targets táctiles mínimo 44x44px
- Textos legibles en light mode (app principalmente diurna)
