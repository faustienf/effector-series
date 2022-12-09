import { createEvent } from 'effector';
import { expect, test, vi } from 'vitest';
import { series } from '../src';

test('Sync sequence', () => {
  const targetSpy = vi.fn();

  const target = createEvent<string>();
  const runFx = series(target);

  runFx.watch(() => {
    targetSpy();
  });

  runFx([]);
  runFx(['1']);
  runFx(['2', '3']);

  expect(targetSpy).toBeCalledTimes(3);
});
