import { createEvent, createEffect, allSettled, fork, sample } from 'effector';
import { expect, test, vi } from 'vitest';
import { series } from '../src';

test('Simple use case', async () => {
  const targetSpy = vi.fn();

  const requestFx = createEffect(async (messages: string[]) => messages);
  const notifyFx = createEffect(async (message: string) => {
    targetSpy(message);
  });

  sample({
    clock: requestFx.doneData,
    target: series(notifyFx),
  });

  const scope = fork();
  await allSettled(requestFx, { scope, params: ['Message 1', 'Message 2'] });

  expect(targetSpy).toBeCalledTimes(2);
});

test('Event target is triggered N times', () => {
  const targetSpy = vi.fn();

  const target = createEvent<string>();
  const runFx = series(target);

  target.watch(targetSpy);

  runFx([]); // have to be ignored
  runFx(['1']);
  runFx(['2', '3', '4']);

  expect(targetSpy).toBeCalledTimes(4);
});

test('Effect target is triggered N times', () => {
  const targetSpy = vi.fn();

  const targetFx = createEffect(targetSpy);
  const runFx = series(targetFx);

  runFx([]); // have to be ignored
  runFx(['1']);
  runFx(['2', '3', '4']);

  expect(targetSpy).toBeCalledTimes(4);
});

test('Await every effect target and check finishing', async () => {
  const targetSpy = vi.fn();
  const finishSpy = vi.fn();
  const result: string[] = [];
  const params = ['1', '2', '3', '4', '5'];

  const targetFx = createEffect(async (message: string) => {
    return new Promise((resolve) => {
      targetSpy();
      setTimeout(() => {
        result.push(message);
        resolve(message);
      }, Math.random() * 500);
    });
  });

  const runFx = series(targetFx, { await: true });
  runFx.finally.watch(finishSpy);
  const scope = fork();

  expect(finishSpy).toBeCalledTimes(0);

  await allSettled(runFx, { scope, params });

  expect(targetSpy).toBeCalledTimes(5);
  expect(finishSpy).toBeCalledTimes(1);
  expect(params).toEqual(result);
});
