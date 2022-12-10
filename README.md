# ☄️ effector-series

## Example

```ts
sample({
  clock: requestFx.doneData,
  fn: () => ['Message 1', 'Message 2'],
  target: series(notifyFx),
});

// ➜ notifyFx('Message 1')
// ➜ notifyFx('Message 2')
```

### Await effect

```ts
const targetFx = createEffect((message) => {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 500, message);
  });
});

const runFx = series(notifyFx);

runFx(['1', '2', '3']);
// notifyFx.doneData ➜ '2'
// notifyFx.doneData ➜ '3'
// notifyFx.doneData ➜ '1'
// runFx.done

runFx(['1', '2', '3'], { await: true });
// notifyFx.doneData ➜ '1'
// notifyFx.doneData ➜ '2'
// notifyFx.doneData ➜ '3'
// runFx.done
```
