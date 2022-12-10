# ☄️ effector-series

```ts
sample({
  clock: requestFx.doneData,
  fn: () => ['Message 1', 'Message 2'],
  target: series(notifyFx),
});

// ➜ notifyFx('Message 1')
// ➜ notifyFx('Message 2')
```
