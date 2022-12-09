import {
  Event,
  Effect,
  createEvent,
  createStore,
  createEffect,
  sample,
  is,
} from 'effector';

type Options = {
  await: boolean;
};

class Deferred {
  promise: Promise<void>;
  reject = () => {};
  resolve = () => {};

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = () => resolve();
      this.reject = reject;
    });
  }
}

/**
 * @example
 * sample({
 *   clock: requestFx,
 *   fn: () => ['Message 1', 'Message 2'],
 *   target: series(notifyFx),
 * });
 *
 * ➜ notifyFx('Message 1')
 * ➜ notifyFx('Message 2')
 */
export const series = <T>(
  target: Event<T> | Effect<T, any>,
  options: Partial<Options> = {}
): Effect<T[], void> => {
  const awaitTarget = is.effect(target) && options.await;
  let deferred: Deferred;

  const pop = createEvent<any>();

  const pushFx = createEffect((seriesParams: T[]) => {
    seriesParams; // fake use var
    deferred = new Deferred();
    return deferred.promise;
  });

  const finishFx = createEffect(() => {
    deferred.resolve();
    return deferred.promise;
  });

  const $queue = createStore<T[]>([])
    .on(pushFx, (state, payload) => [...state, ...payload])
    .on(pop, ([_, ...rest]) => rest);

  const $queueEmpty = $queue.map((queue) => !queue.length);
  const $queueNotEmpty = $queueEmpty.map((queueEmpty) => !queueEmpty);
  const $first = $queue.map((queue) => queue.at(0) || null);

  if (awaitTarget) {
    sample({
      clock: $first,
      filter: $queueNotEmpty,
      target: target,
    });

    sample({
      clock: target.finally,
      target: pop,
    });
  } else {
    sample({
      clock: $first,
      filter: $queueNotEmpty,
      target: [target, pop],
    });
  }

  sample({
    clock: pop,
    filter: $queueEmpty,
    target: finishFx,
  });

  return pushFx;
};
