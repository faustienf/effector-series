# ☄️ effector-series

```ts
const requestFx = createEffect((messages) => Promise.resolve(messages));

const notifyFx = createEffect(async (message) => {
  console.log(message);
});

sample({
  clock: requestFx,
  target: series(notifyFx),
});

requestFx(['Message 1', 'Message 2']);
// Log:
// ➜ Message 1
// ➜ Message 2
```
