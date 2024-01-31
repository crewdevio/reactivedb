// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

function bytesToUuid(bytes) {
  const bits = [...bytes].map((bit) => {
    const s = bit.toString(16);
    return bit < 0x10 ? "0" + s : s;
  });
  return [
    ...bits.slice(0, 4),
    "-",
    ...bits.slice(4, 6),
    "-",
    ...bits.slice(6, 8),
    "-",
    ...bits.slice(8, 10),
    "-",
    ...bits.slice(10, 16),
  ].join("");
}
new RegExp(
  "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
  "i"
);
function generate() {
  const rnds = crypto.getRandomValues(new Uint8Array(16));
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  return bytesToUuid(rnds);
}
const { Deno } = globalThis;
typeof Deno?.noColor === "boolean" ? Deno.noColor : false;
new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))",
  ].join("|"),
  "g"
);
var MutableEvents;
(function (MutableEvents) {
  MutableEvents["Remove"] = "child_removed";
  MutableEvents["Change"] = "child_changed";
  MutableEvents["Add"] = "child_added";
  MutableEvents["Load"] = "load";
  MutableEvents["Get"] = "get";
})(MutableEvents || (MutableEvents = {}));
const Routes = {
  id: "/v1/:collection/:id",
  collection: "/v1/:collection",
  schema: "/v1/functions_schema",
  auth: {
    register: "/auth/registeUserWithEmailAndPassword",
    login: "/auth/loginWithEmailAndPassword",
    delete: "/auth/deleteEmailAccount",
    disable: "/auth/disableEmailAccount",
  },
};
class HTTPClient {
  #fetch_config;
  #url;
  constructor(url, token) {
    this.#url = url;
    this.#fetch_config = {
      headers: {
        token,
      },
    };
  }
  async getDoc(collection, id) {
    const respose = await globalThis.fetch(
      `${this.#url}${Routes.id
        .replace(":collection", collection)
        .replace(":id", id)}`,
      {
        ...this.#fetch_config,
      }
    );
    return await respose.json();
  }
  async updatetDoc(collection, id, data) {
    const respose = await globalThis.fetch(
      `${this.#url}${Routes.id
        .replace(":collection", collection)
        .replace("id", id)}`,
      {
        ...this.#fetch_config,
        method: "PATCH",
        headers: {
          ...this.#fetch_config.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return await respose.json();
  }
  async deleteDoc(id) {}
  async getCollection(collection) {
    const respose = await globalThis.fetch(
      `${this.#url}${Routes.collection.replace(":collection", collection)}`,
      {
        ...this.#fetch_config,
      }
    );
    return await respose.json();
  }
}
function typeGuard(_value, isMatched) {
  return isMatched;
}
var CtxLike;
(function (CtxLike) {
  function match(o) {
    return (
      typeGuard(o, true) &&
      o instanceof Object &&
      typeof o.done === "function" &&
      typeof o.abort === "function" &&
      typeof o.zz__addHandler === "function" &&
      typeof o.zz__removeHandler === "function"
    );
  }
  CtxLike.match = match;
})(CtxLike || (CtxLike = {}));
const mod = {
  CtxLike: CtxLike,
};
var EventTargetLike;
(function (EventTargetLike) {
  let RxJSSubject;
  (function (RxJSSubject) {
    function match(eventTarget) {
      return (
        typeGuard(eventTarget, true) &&
        eventTarget instanceof Object &&
        typeof eventTarget.subscribe === "function"
      );
    }
    RxJSSubject.match = match;
  })(
    (RxJSSubject =
      EventTargetLike.RxJSSubject || (EventTargetLike.RxJSSubject = {}))
  );
  let NodeStyleEventEmitter;
  (function (NodeStyleEventEmitter) {
    function match(eventTarget) {
      return (
        typeGuard(eventTarget, true) &&
        eventTarget instanceof Object &&
        typeof eventTarget.addListener === "function" &&
        typeof eventTarget.removeListener === "function"
      );
    }
    NodeStyleEventEmitter.match = match;
  })(
    (NodeStyleEventEmitter =
      EventTargetLike.NodeStyleEventEmitter ||
      (EventTargetLike.NodeStyleEventEmitter = {}))
  );
  let JQueryStyleEventEmitter;
  (function (JQueryStyleEventEmitter) {
    function match(eventTarget) {
      return (
        typeGuard(eventTarget, true) &&
        eventTarget instanceof Object &&
        typeof eventTarget.on === "function" &&
        typeof eventTarget.off === "function"
      );
    }
    JQueryStyleEventEmitter.match = match;
  })(
    (JQueryStyleEventEmitter =
      EventTargetLike.JQueryStyleEventEmitter ||
      (EventTargetLike.JQueryStyleEventEmitter = {}))
  );
  let HasEventTargetAddRemove;
  (function (HasEventTargetAddRemove) {
    function match(eventTarget) {
      return (
        typeGuard(eventTarget, true) &&
        eventTarget instanceof Object &&
        typeof eventTarget.addEventListener === "function" &&
        typeof eventTarget.removeEventListener === "function"
      );
    }
    HasEventTargetAddRemove.match = match;
  })(
    (HasEventTargetAddRemove =
      EventTargetLike.HasEventTargetAddRemove ||
      (EventTargetLike.HasEventTargetAddRemove = {}))
  );
  function canBe(o) {
    try {
      return (
        HasEventTargetAddRemove.match(o) ||
        NodeStyleEventEmitter.match(o) ||
        JQueryStyleEventEmitter.match(o) ||
        RxJSSubject.match(o)
      );
    } catch {
      return false;
    }
  }
  EventTargetLike.canBe = canBe;
})(EventTargetLike || (EventTargetLike = {}));
const mod1 = {
  EventTargetLike: EventTargetLike,
};
class TimeoutEvtError extends Error {
  timeout;
  constructor(timeout) {
    super(`Evt timeout after ${timeout}ms`);
    this.timeout = timeout;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
class DetachedEvtError extends Error {
  constructor() {
    super(`Evt handler detached`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
function encapsulateOpState(statefulFλOp) {
  let state = statefulFλOp[1];
  return (data, registerSideEffect) => {
    const opResult = statefulFλOp[0](data, state, registerSideEffect);
    if (opResult !== null) {
      registerSideEffect(() => (state = opResult[0]));
    }
    return opResult;
  };
}
function statelessOpToStatelessFλ(op) {
  return (data, registerSideEffect) => {
    const opResult = op(data, registerSideEffect);
    return opResult instanceof Object &&
      !("input" in opResult) &&
      opResult.length === 1
      ? opResult
      : !!opResult
      ? [data]
      : null;
  };
}
function convertOperatorToStatelessFλ(op) {
  return typeof op !== "function"
    ? encapsulateOpState(op)
    : statelessOpToStatelessFλ(op);
}
const id = (x) => x;
function f_o_g(op1, op2) {
  const opAtoB = convertOperatorToStatelessFλ(op1);
  const opBtoC = convertOperatorToStatelessFλ(op2);
  return id((dataA, registerSideEffect) => {
    const resultB = opAtoB(dataA, registerSideEffect);
    if (!resultB) {
      return null;
    }
    const [dataB] = resultB;
    const resultC = opBtoC(dataB, registerSideEffect);
    if (!resultC) {
      return resultC;
    }
    return [resultC[0]];
  });
}
function compose(...ops) {
  if (ops.length === 1) {
    const [op] = ops;
    return convertOperatorToStatelessFλ(op);
  }
  const [op1, op2, ...rest] = ops;
  const op1_o_op2 = f_o_g(op1, op2);
  if (rest.length === 0) {
    return op1_o_op2;
  }
  return compose(op1_o_op2, ...rest);
}
const map = new Map();
const to = (eventName) =>
  map.get(eventName) ??
  (map.set(eventName, (data) => (data[0] !== eventName ? null : [data[1]])),
  to(eventName));
const assertIsRefWrapper = {
  ref: id(undefined),
};
const errorMessage = [
  `Wrong usage of the ${is.name} function refer to`,
  `https://docs.tsafe.dev/${is.name.toLowerCase()}`,
].join(" ");
function is(_value) {
  const ref = {};
  if (assertIsRefWrapper.ref !== undefined) {
    assertIsRefWrapper.ref = undefined;
    throw new Error(errorMessage);
  }
  assertIsRefWrapper.ref = ref;
  Promise.resolve().then(() => {
    if (assertIsRefWrapper.ref === ref) {
      throw new Error(errorMessage);
    }
  });
  return null;
}
class AssertionError extends Error {
  constructor(msg) {
    super(`Wrong assertion encountered` + (!msg ? "" : `: "${msg}"`));
    Object.setPrototypeOf(this, new.target.prototype);
    if (!this.stack) {
      return;
    }
    try {
      overwriteReadonlyProp(
        this,
        "stack",
        this.stack
          .split("\n")
          .filter((...[, i]) => i !== 1 && i !== 2)
          .join("\n")
      );
    } catch {}
  }
}
function assert(condition, msg) {
  if (arguments.length === 0) {
    condition = true;
  }
  if (assertIsRefWrapper.ref !== undefined) {
    assertIsRefWrapper.ref = undefined;
    return;
  }
  if (!condition) {
    throw new AssertionError(msg);
  }
}
const overwriteReadonlyProp = (obj, propertyName, value) => {
  try {
    obj[propertyName] = value;
  } catch {}
  if (obj[propertyName] === value) {
    return value;
  }
  let errorDefineProperty = undefined;
  const propertyDescriptor = Object.getOwnPropertyDescriptor(
    obj,
    propertyName
  ) || {
    enumerable: true,
    configurable: true,
  };
  if (!!propertyDescriptor.get) {
    throw new Error(
      `Probably a wrong ides to overwrite ${String(propertyName)} getter`
    );
  }
  try {
    Object.defineProperty(obj, propertyName, {
      ...propertyDescriptor,
      value,
    });
  } catch (error) {
    assert(is(error));
    errorDefineProperty = error;
  }
  if (obj[propertyName] !== value) {
    throw errorDefineProperty || new Error("Can't assign");
  }
  return value;
};
const importProxy = {};
class LazyEvt {
  initialPostCount = 0;
  get evt() {
    if (this.__evt === undefined) {
      this.__evt = new importProxy.Evt();
      overwriteReadonlyProp(this.__evt, "postCount", this.initialPostCount);
    }
    return this.__evt;
  }
  __post(data, doWait) {
    if (this.__evt === undefined) {
      return ++this.initialPostCount;
    }
    return this.__evt[doWait ? "postAndWait" : "post"](data);
  }
  post(data) {
    return this.__post(data, false);
  }
  postAndWait(data) {
    return this.__post(data, true);
  }
}
class CtxImpl {
  get evtDoneOrAborted() {
    return this.lazyEvtDoneOrAborted.evt;
  }
  get evtAttach() {
    return this.lazyEvtAttach.evt;
  }
  get evtDetach() {
    return this.lazyEvtDetach.evt;
  }
  __completionStatus;
  get completionStatus() {
    return this.__completionStatus;
  }
  lazyEvtAttach = new LazyEvt();
  lazyEvtDetach = new LazyEvt();
  lazyEvtDoneOrAborted = new LazyEvt();
  onDoneOrAborted(doneOrAborted) {
    this.__completionStatus = doneOrAborted;
    this.lazyEvtDoneOrAborted.post(doneOrAborted);
  }
  waitFor(timeout) {
    return this.evtDoneOrAborted.waitFor(timeout).then(
      (data) => {
        if (data.type === "ABORTED") {
          throw data.error;
        }
        return data.result;
      },
      (timeoutError) => {
        this.abort(timeoutError);
        throw timeoutError;
      }
    );
  }
  abort(error) {
    return this.__done(error);
  }
  done(result) {
    return this.__done(undefined, result);
  }
  __done(error, result) {
    const handlers = [];
    for (const handler of this.handlers.values()) {
      const evt = this.evtByHandler.get(handler);
      const wasStillAttached = handler.detach();
      if (!wasStillAttached) {
        continue;
      }
      handlers.push({
        handler,
        evt,
      });
    }
    this.onDoneOrAborted({
      ...(!!error
        ? {
            type: "ABORTED",
            error,
          }
        : {
            type: "DONE",
            result: result,
          }),
      handlers,
    });
    return handlers;
  }
  handlers = new Set();
  evtByHandler = new WeakMap();
  getHandlers() {
    return Array.from(this.handlers.values()).map((handler) => ({
      handler,
      evt: this.evtByHandler.get(handler),
    }));
  }
  zz__addHandler(handler, evt) {
    assert(handler.ctx === this);
    assert(is(handler));
    if (this.completionStatus !== undefined) {
      handler.detach();
      return;
    }
    this.handlers.add(handler);
    this.evtByHandler.set(handler, evt);
    this.lazyEvtAttach.post({
      handler,
      evt,
    });
  }
  zz__removeHandler(handler) {
    assert(handler.ctx === this);
    assert(is(handler));
    this.lazyEvtDetach.post({
      handler,
      evt: this.evtByHandler.get(handler),
    });
    this.handlers.delete(handler);
  }
}
const Ctx = CtxImpl;
try {
  overwriteReadonlyProp(Ctx, "name", "Ctx");
} catch {}
importProxy.Ctx = Ctx;
function create(...args) {
  return args.length === 0
    ? new importProxy.Evt()
    : new importProxy.StatefulEvt(args[0]);
}
function getCtxFactory() {
  const ctxByObj = new WeakMap();
  function getCtx(obj) {
    let ctx = ctxByObj.get(obj);
    if (ctx === undefined) {
      ctx = new importProxy.Ctx();
      ctxByObj.set(obj, ctx);
    }
    return ctx;
  }
  return getCtx;
}
function factorize(evt) {
  return evt;
}
function mergeImpl(ctx, evts) {
  const evtUnion = new importProxy.Evt();
  const callback = (data) => evtUnion.post(data);
  evts.forEach((evt) => {
    if (ctx === undefined) {
      evt.attach(callback);
    } else {
      evt.attach(ctx, callback);
    }
  });
  return evtUnion;
}
function merge(p1, p2) {
  return "length" in p1 ? mergeImpl(undefined, p1) : mergeImpl(p1, p2);
}
const { EventTargetLike: EventTargetLikeAsValue } = mod1;
function fromImplForTargetEventLike(ctx, target, eventName, options) {
  const matchEventTargetLike = (target_) =>
    EventTargetLikeAsValue.canBe(target_);
  if (!matchEventTargetLike(target)) {
    if ("then" in target) {
      const evt = new importProxy.Evt();
      const isCtxDone = (() => {
        const getEvtDonePostCount = () => ctx?.evtDoneOrAborted.postCount;
        const n = getEvtDonePostCount();
        return () => n !== getEvtDonePostCount();
      })();
      target.then((data) => {
        if (isCtxDone()) {
          return;
        }
        evt.post(data);
      });
      return evt;
    }
    return mergeImpl(
      ctx,
      Array.from(target).map((target) =>
        fromImplForTargetEventLike(ctx, target, eventName, options)
      )
    );
  }
  let proxy;
  if (EventTargetLikeAsValue.HasEventTargetAddRemove.match(target)) {
    proxy = {
      on: (listener, eventName, options) =>
        target.addEventListener(eventName, listener, options),
      off: (listener, eventName, options) =>
        target.removeEventListener(eventName, listener, options),
    };
  } else if (EventTargetLikeAsValue.NodeStyleEventEmitter.match(target)) {
    proxy = {
      on: (listener, eventName) => target.addListener(eventName, listener),
      off: (listener, eventName) => target.removeListener(eventName, listener),
    };
  } else if (EventTargetLikeAsValue.JQueryStyleEventEmitter.match(target)) {
    proxy = {
      on: (listener, eventName) => target.on(eventName, listener),
      off: (listener, eventName) => target.off(eventName, listener),
    };
  } else if (EventTargetLikeAsValue.RxJSSubject.match(target)) {
    let subscription;
    proxy = {
      on: (listener) =>
        (subscription = target.subscribe((data) => listener(data))),
      off: () => subscription.unsubscribe(),
    };
  } else {
    id(target);
    assert(false);
  }
  const evt = new importProxy.Evt();
  const listener = (data) => evt.post(data);
  ctx?.evtDoneOrAborted.attachOnce(() =>
    proxy.off(listener, eventName, options)
  );
  proxy.on(listener, eventName, options);
  return evt;
}
function fromImplForObserver(ctx, ObserverConstructor, target) {
  const evt = importProxy.Evt.create();
  const listener = ([entry]) => evt.post(entry);
  const observer = new ObserverConstructor(listener);
  observer.observe(target);
  ctx?.evtDoneOrAborted.attachOnce(() => observer.disconnect());
  return evt;
}
function from(
  ctxOrTargetOrObserverConstructor,
  targetOrEventNameOrObserverConstructorOrObserverTarget,
  eventNameOrOptionsOrObserverTarget,
  options
) {
  if ("evtDoneOrAborted" in ctxOrTargetOrObserverConstructor) {
    assert(
      typeGuard(targetOrEventNameOrObserverConstructorOrObserverTarget, true) &&
        typeGuard(eventNameOrOptionsOrObserverTarget, true) &&
        typeGuard(options, true)
    );
    if (
      typeof targetOrEventNameOrObserverConstructorOrObserverTarget ===
      "function"
    ) {
      assert(
        typeGuard(eventNameOrOptionsOrObserverTarget, true) &&
          typeGuard(options, true)
      );
      return fromImplForObserver(
        ctxOrTargetOrObserverConstructor,
        targetOrEventNameOrObserverConstructorOrObserverTarget,
        eventNameOrOptionsOrObserverTarget
      );
    } else {
      assert(typeGuard(eventNameOrOptionsOrObserverTarget, true));
      return fromImplForTargetEventLike(
        ctxOrTargetOrObserverConstructor,
        targetOrEventNameOrObserverConstructorOrObserverTarget,
        eventNameOrOptionsOrObserverTarget,
        options
      );
    }
  } else {
    assert(
      typeGuard(ctxOrTargetOrObserverConstructor, true) &&
        typeGuard(
          targetOrEventNameOrObserverConstructorOrObserverTarget,
          true
        ) &&
        typeGuard(eventNameOrOptionsOrObserverTarget, true)
    );
    if (typeof ctxOrTargetOrObserverConstructor === "function") {
      assert(
        typeGuard(
          targetOrEventNameOrObserverConstructorOrObserverTarget,
          true
        ) && typeGuard(eventNameOrOptionsOrObserverTarget, true)
      );
      return fromImplForObserver(
        undefined,
        ctxOrTargetOrObserverConstructor,
        targetOrEventNameOrObserverConstructorOrObserverTarget
      );
    } else {
      assert(
        typeGuard(targetOrEventNameOrObserverConstructorOrObserverTarget, true)
      );
      return fromImplForTargetEventLike(
        undefined,
        ctxOrTargetOrObserverConstructor,
        targetOrEventNameOrObserverConstructorOrObserverTarget,
        eventNameOrOptionsOrObserverTarget
      );
    }
  }
}
function asPostable(evt) {
  return evt;
}
function asyncPipe(evt, asyncOp) {
  const out =
    "state" in evt
      ? importProxy.Evt.create(undefined)
      : importProxy.Evt.create();
  let currentCallCount = 0;
  evt.attach(async (data) => {
    currentCallCount++;
    const thisCallCount = currentCallCount;
    const prOpResult = asyncOp(data);
    let opResult;
    if (prOpResult !== null && "then" in prOpResult) {
      opResult = await prOpResult;
      if ("state" in evt && thisCallCount !== currentCallCount) {
        return;
      }
    } else {
      opResult = prOpResult;
    }
    if (!opResult) {
      return;
    }
    out.post(opResult[0]);
  });
  return out;
}
function asNonPostable(evt) {
  return evt;
}
function matchAll() {
  return true;
}
const canBeOperator = (p) => {
  return (
    p !== undefined &&
    typeGuard(p, true) &&
    (typeof p === "function" || typeof p[0] === "function")
  );
};
const defaultParams = {
  op: matchAll,
  ctx: undefined,
  timeout: undefined,
  callback: undefined,
};
function parsePropsFromArgs(inputs, methodName) {
  switch (methodName) {
    case "pipe":
      {
        const getOpWrap = (ops) =>
          ops.length === 0
            ? {}
            : {
                op: ops.length === 1 ? ops[0] : compose(...ops),
              };
        if (canBeOperator(inputs[0])) {
          return id({
            ...defaultParams,
            ...getOpWrap(inputs),
          });
        } else {
          const [ctx, ...rest] = inputs;
          return id({
            ...defaultParams,
            ...(ctx !== undefined
              ? {
                  ctx,
                }
              : {}),
            ...getOpWrap(rest),
          });
        }
      }
      break;
    case "waitFor":
      {
        return parsePropsFromArgs(
          [
            ...inputs.filter(
              (value, index) =>
                !(index === inputs.length - 1 && value === undefined)
            ),
            defaultParams.callback,
          ],
          "attach*"
        );
      }
      break;
    case "attach*":
      {
        const n = inputs.length;
        switch (n) {
          case 4: {
            const [p1, p2, p3, p4] = inputs;
            return id({
              ...defaultParams,
              op: p1,
              ctx: p2,
              timeout: p3,
              callback: p4,
            });
          }
          case 3: {
            const [p1, p2, p3] = inputs;
            if (typeof p2 === "number") {
              const timeout = p2;
              const callback = p3;
              if (canBeOperator(p1)) {
                return id({
                  ...defaultParams,
                  timeout,
                  callback,
                  op: p1,
                });
              } else {
                return id({
                  ...defaultParams,
                  timeout,
                  callback,
                  ctx: p1,
                });
              }
            } else {
              return id({
                ...defaultParams,
                op: p1,
                ctx: p2,
                callback: p3,
              });
            }
          }
          case 2: {
            const [p1, p2] = inputs;
            if (typeof p1 === "number") {
              return id({
                ...defaultParams,
                timeout: p1,
                callback: p2,
              });
            } else {
              const callback = p2;
              if (canBeOperator(p1)) {
                return id({
                  ...defaultParams,
                  callback,
                  op: p1,
                });
              } else {
                return id({
                  ...defaultParams,
                  callback,
                  ctx: p1,
                });
              }
            }
          }
          case 1: {
            const [p] = inputs;
            return id({
              ...defaultParams,
              callback: p,
            });
          }
          case 0: {
            return id({
              ...defaultParams,
            });
          }
        }
      }
      break;
  }
}
function newCtx() {
  return new importProxy.Ctx();
}
class ExecQueue {
  queuedCalls = [];
  isRunning = false;
  cancelAllQueuedCalls() {
    let n;
    this.queuedCalls.splice(0, (n = this.queuedCalls.length));
    return n;
  }
  prComplete = Promise.resolve();
}
const globalContext = {};
const clusters = new WeakMap();
function getOrCreateExecQueue(context, groupRef) {
  let execQueueByGroup = clusters.get(context);
  if (!execQueueByGroup) {
    execQueueByGroup = new WeakMap();
    clusters.set(context, execQueueByGroup);
  }
  let execQueue = execQueueByGroup.get(groupRef);
  if (!execQueue) {
    execQueue = new ExecQueue();
    execQueueByGroup.set(groupRef, execQueue);
  }
  return execQueue;
}
function createGroupRef() {
  return new Array(0);
}
const groupByRunExclusiveFunction = new WeakMap();
function buildMethodCb(...inputs) {
  switch (inputs.length) {
    case 1:
      return buildFnCallback(false, createGroupRef(), inputs[0]);
    case 2:
      return buildFnCallback(false, inputs[0], inputs[1]);
  }
}
function buildFnCallback(isGlobal, groupRef, fun) {
  let execQueue;
  const runExclusiveFunction = function (...inputs) {
    if (!isGlobal) {
      if (!(this instanceof Object)) {
        throw new Error("Run exclusive, <this> should be an object");
      }
      execQueue = getOrCreateExecQueue(this, groupRef);
    }
    let callback = undefined;
    if (inputs.length && typeof inputs[inputs.length - 1] === "function") {
      callback = inputs.pop();
    }
    let onPrCompleteResolve;
    execQueue.prComplete = new Promise(
      (resolve) => (onPrCompleteResolve = () => resolve())
    );
    const onComplete = (...inputs) => {
      onPrCompleteResolve();
      execQueue.isRunning = false;
      if (execQueue.queuedCalls.length) {
        execQueue.queuedCalls.shift()();
      }
      if (callback) {
        callback.apply(this, inputs);
      }
    };
    onComplete.hasCallback = !!callback;
    (function callee(...inputs) {
      if (execQueue.isRunning) {
        execQueue.queuedCalls.push(() => callee.apply(this, inputs));
        return;
      }
      execQueue.isRunning = true;
      try {
        fun.apply(this, [...inputs, onComplete]);
      } catch (error) {
        error.message +=
          " ( This exception should not have been thrown, miss use of run-exclusive buildCb )";
        throw error;
      }
    }).apply(this, inputs);
  };
  if (isGlobal) {
    execQueue = getOrCreateExecQueue(globalContext, groupRef);
  }
  groupByRunExclusiveFunction.set(runExclusiveFunction, groupRef);
  return runExclusiveFunction;
}
class Deferred {
  pr;
  resolve;
  reject;
  constructor() {
    let resolve;
    let reject;
    this.pr = new Promise((resolve_, reject_) => {
      resolve = (value) => {
        overwriteReadonlyProp(this, "isPending", false);
        resolve_(value);
      };
      reject = (error) => {
        overwriteReadonlyProp(this, "isPending", false);
        reject_(error);
      };
    });
    this.resolve = resolve;
    this.reject = reject;
  }
  isPending = true;
}
function loosenType(evt) {
  return evt;
}
const safeSetTimeout = (callback, ms) => setTimeout(callback, ms);
const safeClearTimeout = (timer) => clearTimeout(timer);
function isPromiseLike(o) {
  return typeof o?.then === "function";
}
const runSideEffect = (sideEffect) => sideEffect();
const { CtxLike: CtxLikeAsValue } = mod;
class EvtImpl {
  static create = create;
  static newCtx = newCtx;
  static merge = merge;
  static from = from;
  static getCtx = getCtxFactory();
  static loosenType = loosenType;
  static factorize = factorize;
  static asPostable = asPostable;
  static asyncPipe = asyncPipe;
  static asNonPostable = asNonPostable;
  static __defaultMaxHandlers = 25;
  static setDefaultMaxHandlers(n) {
    this.__defaultMaxHandlers = isFinite(n) ? n : 0;
  }
  toStateful(p1, p2) {
    const isP1Ctx = CtxLikeAsValue.match(p1);
    const initialValue = isP1Ctx ? undefined : p1;
    const ctx = p2 || (isP1Ctx ? p1 : undefined);
    const out = new importProxy.StatefulEvt(initialValue);
    const callback = (data) => out.post(data);
    if (!!ctx) {
      this.attach(ctx, callback);
    } else {
      this.attach(callback);
    }
    return out;
  }
  get evtAttach() {
    return this.lazyEvtAttach.evt;
  }
  get evtDetach() {
    return this.lazyEvtDetach.evt;
  }
  lazyEvtAttach = new LazyEvt();
  lazyEvtDetach = new LazyEvt();
  __maxHandlers = undefined;
  setMaxHandlers(n) {
    this.__maxHandlers = isFinite(n) ? n : 0;
    return this;
  }
  postCount = 0;
  traceId = null;
  traceFormatter;
  log;
  enableTrace(params) {
    const { id, formatter, log } = params;
    this.traceId = id;
    this.traceFormatter =
      formatter ||
      ((data) => {
        try {
          return JSON.stringify(data, null, 2);
        } catch {
          return `${data}`;
        }
      });
    this.log =
      log === undefined
        ? (...inputs) => console.log(...inputs)
        : log === false
        ? undefined
        : log;
  }
  disableTrace() {
    this.traceId = null;
    return this;
  }
  handlers = [];
  handlerTriggers = new Map();
  get asyncHandlerChronologyMark() {
    return ((this["~internal"] ??= {})["asyncHandlerChronologyMark"] ??=
      new WeakMap());
  }
  get asyncHandlerChronologyExceptionRange() {
    return ((this["~internal"] ??= {})[
      "asyncHandlerChronologyExceptionRange"
    ] ??= new WeakMap());
  }
  get invocableOpByOp() {
    return ((this["~internal"] ??= {})["invocableOpByOp"] ??= new WeakMap());
  }
  getInvocableOp(op) {
    const invocableOp = this.invocableOpByOp.get(op);
    if (invocableOp === undefined) {
      throw new Error(
        [
          "Provided operator isn't the operator of any handler",
          "currently attached to the Evt instance",
        ].join(" ")
      );
    }
    return invocableOp;
  }
  __currentChronologyMark = 0;
  getChronologyMark() {
    return this.__currentChronologyMark++;
  }
  asyncHandlerCount = 0;
  detachHandler(handler, wTimer, rejectPr) {
    const index = this.handlers.indexOf(handler);
    if (index < 0) {
      return false;
    }
    if (typeGuard(handler, !!handler.ctx)) {
      handler.ctx.zz__removeHandler(handler);
    }
    this.handlers.splice(index, 1);
    if (handler.async) {
      this.asyncHandlerCount--;
    }
    this.handlerTriggers.delete(handler);
    if (wTimer[0] !== undefined) {
      safeClearTimeout(wTimer[0]);
      rejectPr(new DetachedEvtError());
    }
    this.lazyEvtDetach.post(handler);
    return true;
  }
  triggerHandler(handler, wTimer, resolvePr, opResult) {
    const { callback, once } = handler;
    if (wTimer[0] !== undefined) {
      safeClearTimeout(wTimer[0]);
      wTimer[0] = undefined;
    }
    if (once) {
      handler.detach();
    }
    const [transformedData] = opResult;
    const prOrValue = callback?.call(this, transformedData);
    resolvePr?.(transformedData);
    return isPromiseLike(prOrValue) ? prOrValue : undefined;
  }
  addHandler(propsFromArgs, propsFromMethodName) {
    this.invocableOpByOp.set(
      propsFromArgs.op,
      convertOperatorToStatelessFλ(propsFromArgs.op)
    );
    const d = new Deferred();
    const wTimer = [undefined];
    const handler = {
      ...propsFromArgs,
      ...propsFromMethodName,
      detach: () => this.detachHandler(handler, wTimer, d.reject),
      promise: d.pr,
    };
    if (typeof handler.timeout === "number") {
      wTimer[0] = safeSetTimeout(() => {
        wTimer[0] = undefined;
        handler.detach();
        d.reject(new TimeoutEvtError(handler.timeout));
      }, handler.timeout);
    }
    const handlerTrigger = (opResult) =>
      this.triggerHandler(
        handler,
        wTimer,
        d.isPending ? d.resolve : undefined,
        opResult
      );
    this.handlerTriggers.set(handler, handlerTrigger);
    if (handler.async) {
      this.asyncHandlerChronologyMark.set(handler, this.getChronologyMark());
    }
    if (handler.prepend) {
      let i;
      for (i = 0; i < this.handlers.length; i++) {
        if (this.handlers[i].extract) {
          continue;
        }
        break;
      }
      this.handlers.splice(i, 0, handler);
    } else {
      this.handlers.push(handler);
    }
    if (handler.async) {
      this.asyncHandlerCount++;
    }
    this.checkForPotentialMemoryLeak();
    if (typeGuard(handler, !!handler.ctx)) {
      handler.ctx.zz__addHandler(handler, this);
    }
    onAddHandlerByEvt.get(this)?.(handler, handlerTrigger);
    if (this.handlerTriggers.has(handler)) {
      this.lazyEvtAttach.post(handler);
    }
    return handler;
  }
  checkForPotentialMemoryLeak() {
    const maxHandlers =
      this.__maxHandlers !== undefined
        ? this.__maxHandlers
        : EvtImpl.__defaultMaxHandlers;
    if (maxHandlers === 0 || this.handlers.length % (maxHandlers + 1) !== 0) {
      return;
    }
    let message = [
      `MaxHandlersExceededWarning: Possible Evt memory leak detected.`,
      `${this.handlers.length} handlers attached${
        this.traceId ? ` to "${this.traceId}"` : ""
      }.\n`,
      `Use Evt.prototype.setMaxHandlers(n) to increase limit on a specific Evt.\n`,
      `Use Evt.setDefaultMaxHandlers(n) to change the default limit currently set to ${EvtImpl.__defaultMaxHandlers}.\n`,
    ].join("");
    const map = new Map();
    this.getHandlers()
      .map(({ ctx, async, once, prepend, extract, op, callback }) => ({
        hasCtx: !!ctx,
        once,
        prepend,
        extract,
        isWaitFor: async,
        ...(op === matchAll
          ? {}
          : {
              op: op.toString(),
            }),
        ...(!callback
          ? {}
          : {
              callback: callback.toString(),
            }),
      }))
      .map(
        (obj) =>
          "{\n" +
          Object.keys(obj)
            .map((key) => `  ${key}: ${obj[key]}`)
            .join(",\n") +
          "\n}"
      )
      .forEach((str) => map.set(str, (map.has(str) ? map.get(str) : 0) + 1));
    message +=
      "\n" +
      Array.from(map.keys())
        .map(
          (str) =>
            `${map.get(str)} handler${
              map.get(str) === 1 ? "" : "s"
            } like:\n${str}`
        )
        .join("\n") +
      "\n";
    if (this.traceId === null) {
      message +=
        "\n" +
        [
          `To validate the identify of the Evt instance that is triggering this warning you can call`,
          `Evt.prototype.enableTrace({ "id": "My evt id", "log": false }) on the Evt that you suspect.\n`,
        ].join(" ");
    }
    try {
      console.warn(message);
    } catch {}
  }
  isHandledByOp(op, data) {
    let hasSideEffect = false;
    let invocableOp;
    try {
      invocableOp = this.getInvocableOp(op);
    } catch {
      return false;
    }
    const opResult = invocableOp(data, () => (hasSideEffect = true));
    return opResult !== null || hasSideEffect;
  }
  trace(data) {
    if (this.traceId === null) {
      return;
    }
    let message = `(${this.traceId}) `;
    const isExtracted = !!this.handlers.find(
      ({ extract, op }) => extract && this.isHandledByOp(op, data)
    );
    if (isExtracted) {
      message += "extracted ";
    } else {
      const handlerCount = this.handlers.filter(
        ({ extract, op }) => !extract && this.isHandledByOp(op, data)
      ).length;
      message += `${handlerCount} handler${handlerCount > 1 ? "s" : ""}, `;
    }
    this.log?.(message + this.traceFormatter(data));
  }
  postSync(data) {
    const prAllHandlerCallbacksResolved = [];
    const getReturnValue = (isExtracted) => [
      isExtracted,
      Promise.all(prAllHandlerCallbacksResolved).then(() => {}),
    ];
    for (const handler of [...this.handlers]) {
      const { async, op, extract } = handler;
      if (async) {
        continue;
      }
      const handlerTrigger = this.handlerTriggers.get(handler);
      const opResult = this.getInvocableOp(op)(data, runSideEffect);
      if (opResult === null) {
        continue;
      }
      if (!handlerTrigger) {
        continue;
      }
      const prOrUndefined = handlerTrigger(opResult);
      if (prOrUndefined !== undefined) {
        prAllHandlerCallbacksResolved.push(prOrUndefined);
      }
      if (extract) {
        return getReturnValue(true);
      }
    }
    return getReturnValue(false);
  }
  postAsyncFactory() {
    return buildMethodCb((data, postChronologyMark, releaseLock) => {
      if (this.asyncHandlerCount === 0) {
        releaseLock();
        return;
      }
      const promises = [];
      let chronologyMarkStartResolveTick;
      Promise.resolve().then(
        () => (chronologyMarkStartResolveTick = this.getChronologyMark())
      );
      for (const handler of [...this.handlers]) {
        if (!handler.async) {
          continue;
        }
        const opResult = this.getInvocableOp(handler.op)(data, runSideEffect);
        if (opResult === null) {
          continue;
        }
        const handlerTrigger = this.handlerTriggers.get(handler);
        if (!handlerTrigger) {
          continue;
        }
        const shouldCallHandlerTrigger = (() => {
          const handlerMark = this.asyncHandlerChronologyMark.get(handler);
          if (postChronologyMark > handlerMark) {
            return true;
          }
          const exceptionRange =
            this.asyncHandlerChronologyExceptionRange.get(handler);
          return (
            exceptionRange !== undefined &&
            exceptionRange.lowerMark < postChronologyMark &&
            postChronologyMark < exceptionRange.upperMark &&
            handlerMark > exceptionRange.upperMark
          );
        })();
        if (!shouldCallHandlerTrigger) {
          continue;
        }
        promises.push(
          new Promise((resolve) =>
            handler.promise.then(() => resolve()).catch(() => resolve())
          )
        );
        handlerTrigger(opResult);
      }
      if (promises.length === 0) {
        releaseLock();
        return;
      }
      const handlersDump = [...this.handlers];
      Promise.all(promises).then(() => {
        for (const handler of this.handlers) {
          if (!handler.async) {
            continue;
          }
          if (handlersDump.indexOf(handler) >= 0) {
            continue;
          }
          this.asyncHandlerChronologyExceptionRange.set(handler, {
            lowerMark: postChronologyMark,
            upperMark: chronologyMarkStartResolveTick,
          });
        }
        releaseLock();
      });
    });
  }
  static propsFormMethodNames = {
    waitFor: {
      async: true,
      extract: false,
      once: true,
      prepend: false,
    },
    attach: {
      async: false,
      extract: false,
      once: false,
      prepend: false,
    },
    attachExtract: {
      async: false,
      extract: true,
      once: false,
      prepend: true,
    },
    attachPrepend: {
      async: false,
      extract: false,
      once: false,
      prepend: true,
    },
    attachOnce: {
      async: false,
      extract: false,
      once: true,
      prepend: false,
    },
    attachOncePrepend: {
      async: false,
      extract: false,
      once: true,
      prepend: true,
    },
    attachOnceExtract: {
      async: false,
      extract: true,
      once: true,
      prepend: true,
    },
  };
  isHandled(data) {
    return !!this.getHandlers().find(({ op }) => this.isHandledByOp(op, data));
  }
  getHandlers() {
    return [...this.handlers];
  }
  detach(ctx) {
    const detachedHandlers = [];
    for (const handler of this.getHandlers()) {
      if (ctx !== undefined && handler.ctx !== ctx) {
        continue;
      }
      const wasStillAttached = handler.detach();
      if (!wasStillAttached) {
        continue;
      }
      detachedHandlers.push(handler);
    }
    return detachedHandlers;
  }
  pipe(...args) {
    const evtDelegate = new EvtImpl();
    this.addHandler(
      {
        ...parsePropsFromArgs(args, "pipe"),
        callback: (transformedData) => evtDelegate.post(transformedData),
      },
      EvtImpl.propsFormMethodNames.attach
    );
    return evtDelegate;
  }
  waitFor(...args) {
    return this.addHandler(
      parsePropsFromArgs(args, "waitFor"),
      EvtImpl.propsFormMethodNames.waitFor
    ).promise;
  }
  [Symbol.asyncIterator]() {
    return this.iter()[Symbol.asyncIterator]();
  }
  iter(...args) {
    const props = parsePropsFromArgs(args, "waitFor");
    const ctx = props.ctx ?? newCtx();
    const self = this;
    return {
      ctx,
      [Symbol.asyncIterator]() {
        const previousDonePostCount = ctx.evtDoneOrAborted.postCount;
        const timerWrap = (() => {
          const { timeout } = props;
          if (timeout === undefined) {
            return undefined;
          }
          const setTimeoutCallback = () => {
            const error = new TimeoutEvtError(timeout);
            ctx.abort(error);
          };
          const timer = setTimeout(setTimeoutCallback, timeout);
          return {
            timeout,
            setTimeoutCallback,
            timer,
          };
        })();
        const evtProxy = self
          .pipe(ctx, props.op)
          .pipe((data, registerSideEffect) => {
            if (timerWrap !== undefined) {
              registerSideEffect(() => {
                clearTimeout(timerWrap.timer);
                timerWrap.timer = setTimeout(
                  timerWrap.setTimeoutCallback,
                  timerWrap.timeout
                );
              });
            }
            return [data];
          });
        const events = [];
        evtProxy.attach((event) => events.push([event]));
        if (timerWrap !== undefined) {
          const { timer } = timerWrap;
          ctx.evtDoneOrAborted.attachOnce(
            (event) => event.type === "DONE",
            () => clearTimeout(timer)
          );
        }
        return {
          async next() {
            let eventWrap = events.shift();
            if (eventWrap === undefined) {
              const dEventWrap = new Deferred();
              if (previousDonePostCount < ctx.evtDoneOrAborted.postCount) {
                return {
                  done: true,
                };
              }
              const ctx2 = newCtx();
              ctx.evtDoneOrAborted.attachOnce(ctx2, () =>
                dEventWrap.resolve(undefined)
              );
              evtProxy.attachOnceExtract(ctx2, (event) => {
                ctx2.done();
                dEventWrap.resolve([event]);
              });
              eventWrap = await dEventWrap.pr;
              if (eventWrap === undefined) {
                return {
                  done: true,
                };
              }
            }
            const out = {
              done: false,
              value: eventWrap[0],
            };
            return out;
          },
          return() {
            self.detach(ctx);
            return {
              done: true,
            };
          },
        };
      },
    };
  }
  $attach(...args) {
    return this.attach(...args);
  }
  attach(...args) {
    return this.__attachX(args, "attach");
  }
  $attachOnce(...args) {
    return this.attachOnce(...args);
  }
  attachOnce(...args) {
    return this.__attachX(args, "attachOnce");
  }
  $attachExtract(...args) {
    return this.attachExtract(...args);
  }
  attachExtract(...args) {
    return this.__attachX(args, "attachExtract");
  }
  $attachPrepend(...args) {
    return this.attachPrepend(...args);
  }
  attachPrepend(...args) {
    return this.__attachX(args, "attachPrepend");
  }
  $attachOncePrepend(...args) {
    return this.attachOncePrepend(...args);
  }
  attachOncePrepend(...args) {
    return this.__attachX(args, "attachOncePrepend");
  }
  $attachOnceExtract(...args) {
    return this.attachOnceExtract(...args);
  }
  attachOnceExtract(...args) {
    return this.__attachX(args, "attachOnceExtract");
  }
  __attachX(args, methodName) {
    const propsFromArgs = parsePropsFromArgs(args, "attach*");
    const handler = this.addHandler(
      propsFromArgs,
      EvtImpl.propsFormMethodNames[methodName]
    );
    return propsFromArgs.timeout === undefined ? this : handler.promise;
  }
  postAsyncOnceHandled(data) {
    if (this.isHandled(data)) {
      return this.post(data);
    }
    const d = new Deferred();
    this.evtAttach.attachOnce(
      ({ op }) => this.isHandledByOp(op, data),
      () => Promise.resolve().then(() => d.resolve(this.post(data)))
    );
    return d.pr;
  }
  postOrPostAndWait(data, wait) {
    this.trace(data);
    overwriteReadonlyProp(this, "postCount", this.postCount + 1);
    const postChronologyMark = this.getChronologyMark();
    const [isExtracted, prAllHandlerCallbacksResolved] = this.postSync(data);
    const getReturnValue = wait
      ? () => prAllHandlerCallbacksResolved
      : () => this.postCount;
    if (isExtracted) {
      return getReturnValue();
    }
    if (this.postAsync === undefined) {
      if (this.asyncHandlerCount === 0) {
        return getReturnValue();
      }
      this.postAsync = this.postAsyncFactory();
    }
    this.postAsync(data, postChronologyMark);
    return getReturnValue();
  }
  post(data) {
    return this.postOrPostAndWait(data, false);
  }
  postAndWait(data) {
    return this.postOrPostAndWait(data, true);
  }
}
const onAddHandlerByEvt = new WeakMap();
const Evt = EvtImpl;
try {
  overwriteReadonlyProp(Evt, "name", "Evt");
} catch {}
importProxy.Evt = Evt;
class LazyStatefulEvt {
  initialPostCount = 0;
  initialState;
  get evt() {
    if (this.__evt === undefined) {
      this.__evt = new importProxy.StatefulEvt(this.initialState);
      this.initialState = null;
      overwriteReadonlyProp(this.__evt, "postCount", this.initialPostCount);
    }
    return this.__evt;
  }
  constructor(initialState) {
    this.initialState = initialState;
  }
  __post(data, doWait) {
    if (this.__evt === undefined) {
      this.initialState = data;
      return ++this.initialPostCount;
    }
    return this.__evt[doWait ? "postAndWait" : "post"](data);
  }
  post(data) {
    return this.__post(data, false);
  }
  postAndWait(data) {
    return this.__post(data, true);
  }
}
const runSideEffect1 = (sideEffect) => sideEffect();
class StatefulEvtImpl extends Evt {
  __state;
  get state() {
    return this.__state;
  }
  set state(value) {
    if (this.state === value) return;
    this.post(value);
  }
  constructor(initialState) {
    super();
    this.__state = initialState;
    this.lazyEvtChange = new LazyStatefulEvt(this.__state);
    onAddHandlerByEvt.set(this, (handler, handlerTrigger) => {
      if (handler.extract) {
        return;
      }
      const opResult = this.getInvocableOp(handler.op)(
        this.__state,
        runSideEffect1
      );
      if (!opResult) {
        return;
      }
      handlerTrigger(opResult);
    });
  }
  lazyEvtDiff = new LazyEvt();
  get evtDiff() {
    return this.lazyEvtDiff.evt;
  }
  lazyEvtChange;
  get evtChange() {
    return this.lazyEvtChange.evt;
  }
  lazyEvtChangeDiff = new LazyEvt();
  get evtChangeDiff() {
    return this.lazyEvtChangeDiff.evt;
  }
  post(data) {
    return this.__post(data, false, false);
  }
  postForceChange(wData) {
    return this.__post(!!wData ? wData[0] : this.state, true, false);
  }
  postAndWait(data) {
    return this.__post(data, false, true);
  }
  __post(data, forceChange, doWait) {
    const prevState = this.state;
    this.__state = data;
    const diff = {
      prevState,
      newState: this.state,
    };
    const postVariantName = doWait ? "postAndWait" : "post";
    const prs = [];
    const r1 = this.lazyEvtDiff[postVariantName](diff);
    if (doWait) {
      prs.push(r1);
    }
    if (forceChange || !Object.is(prevState, this.state)) {
      const r2 = this.lazyEvtChange[postVariantName](this.state);
      const r3 = this.lazyEvtChangeDiff[postVariantName](diff);
      if (doWait) {
        prs.push(r2, r3);
      }
    }
    const r4 = super[postVariantName](data);
    return doWait ? (prs.push(r4), Promise.all(prs).then(() => {})) : r4;
  }
  pipe(...args) {
    const evt = super.pipe(...args);
    const opResult = this.getInvocableOp(parsePropsFromArgs(args, "pipe").op)(
      this.__state,
      runSideEffect1
    );
    if (!opResult) {
      throw new Error(
        [
          "Cannot pipe StatefulEvt because the operator does not match",
          "it's current state. You would end up with evt.state === undefined",
          "Use evt.toStateless([ctx]).pipe(op).toStatic(initialState)",
          "to be sure the StatefulEvt does not have an undefined state",
        ].join(" ")
      );
    }
    return evt.toStateful(opResult[0]);
  }
  toStateless(ctx) {
    const onAddHandler = onAddHandlerByEvt.get(this);
    onAddHandlerByEvt.delete(this);
    const out = !!ctx ? super.pipe(ctx) : super.pipe();
    onAddHandlerByEvt.set(this, onAddHandler);
    return out;
  }
}
const StatefulEvt = StatefulEvtImpl;
importProxy.StatefulEvt = StatefulEvt;
const events = new Evt();
class Auth {
  #url;
  token = Auth.store.getItem(Auth.store_key)
    ? JSON.parse(Auth.store.getItem(Auth.store_key))
    : null;
  static get store_key() {
    return globalThis?.Deno
      ? "__reactivedb__token__"
      : "__reactivedb__token__web__";
  }
  static get store() {
    return globalThis.localStorage;
  }
  constructor(connection) {
    this.#url = connection;
  }
  async registeUserWithEmailAndPassword(email, password) {
    const url = new URL(this.#url);
    url.pathname = Routes.auth.register;
    url.searchParams.set("token", this.token?.token);
    url.searchParams.set("uuid", this.token?.uuid);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }
    return data;
  }
  async loginWithEmailAndPassword(email, password) {
    const url = new URL(this.#url);
    url.pathname = Routes.auth.login;
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }
    this.token = data;
    Auth.store.setItem(Auth.store_key, JSON.stringify(this.token));
    events.post({
      token: this.token,
      session: !!this.token,
    });
    return this.token;
  }
  async changePassword(current, update) {}
  onAuthStateChange(callback) {
    events.attach(({ session, token }) => {
      callback(token, session);
    });
    events.post({
      token: this.token,
      session: !!this.token,
    });
    return () => events.detach();
  }
  logout() {
    this.token = null;
    Auth.store.removeItem(Auth.store_key);
    events.post({
      token: this.token,
      session: !!this.token,
    });
  }
}
function parseURL(url) {
  let { protocol, hostname, port } = new URL(url);
  if (!["http:", "https:"].includes(protocol)) {
    throw new Error("only http protocol are allowed: http:// or https://")
      .message;
  }
  const isHTTPS = protocol === "https:";
  port = port ? `:${port}` : "";
  return {
    toWs() {
      const host = hostname === "localhost" ? "127.0.0.1" : hostname;
      return `${isHTTPS ? "wss:" : "ws:"}//${host}${port}/[WebSocket]`;
    },
    toHttp() {
      const host = hostname === "localhost" ? "127.0.0.1" : hostname;
      return `${isHTTPS ? "https:" : "http:"}//${host}${port}`;
    },
  };
}
const validStream = (stream) => stream.startsWith(`{"from":"Server","to":`);
function ClientWarning(message) {
  console.warn(`[ReactiveDB Client]: ${message}`);
}
function ClientError(message, err) {
  return new Error(`[ReactiveDB Client]: ${message}`, {
    cause: err,
  }).message;
}
class ReactiveDB {
  #__queqe__;
  #__actions__;
  #__events__;
  #__ws__;
  #__uuid__;
  #__invalidate__;
  #__to__;
  #__url__;
  #__instance__ = true;
  #__token__;
  #__client_uuid__;
  api;
  constructor(connection, token) {
    const url = parseURL(connection);
    this.api = new HTTPClient(url.toHttp(), token.token);
    this.#__client_uuid__ = generate();
    this.#__token__ = token;
    this.#__uuid__ = token.uuid;
    this.#__url__ = url.toWs();
    this.#__ws__ = this.#Websocket();
    this.#__invalidate__ = false;
    this.#__actions__ = [];
    this.#__queqe__ = [];
    this.#__to__ = null;
    this.#__events__ = {
      remove: "child_removed",
      set: "child_changed",
      add: "child_added",
      load: "load",
      value: "value",
      get: "get",
    };
    this.#__ws__.addEventListener("close", (e) => {
      switch (e.code) {
        case 4999:
          throw ClientError(`WS Server Error: ${e.reason}`);
        case 4004:
          throw ClientError(`WS Server: ${e.reason}`);
        default:
          throw ClientError(`WS Server Error: ${e.reason}`);
      }
    });
  }
  #Websocket() {
    const url = new URL(this.#__url__);
    url.searchParams.set("x-authorization-token", this.#__token__?.token);
    url.searchParams.set("x-authorization-uuid", this.#__token__?.uuid ?? "");
    url.searchParams.set("x-client-uuid", this.#__client_uuid__ ?? "");
    return new WebSocket(url.toString());
  }
  #Send({ to, data }) {
    this.#__ws__.send(
      JSON.stringify({
        send_packet: {
          to,
          message: data,
        },
      })
    );
  }
  #Connected(callback = (event) => {}) {
    this.#__ws__.addEventListener("open", callback);
  }
  connectTo(collection, callback = (_event) => {}) {
    if (this.#__instance__) {
      this.#__to__ = collection;
      this.#Connected(async (event) => {
        this.#__ws__.send(
          JSON.stringify({
            connect_to: [this.#__to__],
          })
        );
        callback(event);
      });
      this.#__instance__ = false;
    } else {
      ClientWarning(
        "you can't connect to multiple collection using only one instance."
      );
    }
    return this;
  }
  on(evt, callback = (_data, _event) => {}) {
    if (!this.#__invalidate__) {
      this.#Connected(() => {
        const uuid = `${this.#__uuid__}@${this.#__client_uuid__}`;
        this.#Send({
          to: this.#__to__,
          data: {
            event: this.#__events__.load,
            actions: this.#__actions__,
            uuid,
          },
        });
      });
      this.#__ws__.addEventListener("message", (stream) => {
        if (validStream(stream.data)) {
          const { message } = JSON.parse(stream.data);
          const { data, event, uuid } = JSON.parse(message);
          const isLoadEvent =
            event === this.#__events__.load &&
            uuid === `${this.#__uuid__}@${this.#__client_uuid__}`;
          if (isLoadEvent) {
            callback(data, event);
          }
          if (
            event !== this.#__events__.load &&
            event !== this.#__events__.get &&
            evt === this.#__events__.value
          ) {
            callback(data, event);
          }
          this.#__queqe__.forEach(({ event: itemEvent, callback }) => {
            if (itemEvent === event) {
              callback(data);
            }
          });
        }
      });
      this.#__invalidate__ = true;
    } else {
      this.#__queqe__.push({
        event: evt,
        callback,
      });
    }
    return () => this.#__ws__.close();
  }
  add(data = {}) {
    if (this.#__ws__.readyState === 1 && Object.keys(data).length) {
      this.#Send({
        to: this.#__to__,
        data: {
          event: this.#__events__.add,
          ...data,
        },
      });
    }
    return this;
  }
  remove(id = "") {
    if (this.#__ws__.readyState === 1 && id !== "") {
      this.#Send({
        to: this.#__to__,
        data: {
          event: this.#__events__.remove,
          data: {
            id,
          },
        },
      });
    }
    return this;
  }
  set(id = "", data = {}) {
    if (
      this.#__ws__.readyState === 1 &&
      Object.keys(data).length &&
      id !== ""
    ) {
      this.#Send({
        to: this.#__to__,
        data: {
          event: this.#__events__.set,
          data: {
            id,
            new: data,
          },
        },
      });
    }
    return this;
  }
  onClose(callback = (_event) => {}) {
    this.#__ws__.addEventListener("close", callback);
    const mutations = {
      add: (data = {}) => {
        if (Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.add,
            on: this.#__to__,
            data,
          });
        }
        return mutations;
      },
      set: (id = "", data = {}) => {
        if (id !== "" && Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.set,
            on: this.#__to__,
            data: {
              id,
              new: data,
            },
          });
        }
        return mutations;
      },
      remove: (id = "") => {
        if (id !== "") {
          this.#__actions__.push({
            action: this.#__events__.remove,
            on: this.#__to__,
            data: {
              id,
            },
          });
        }
        return mutations;
      },
    };
    return mutations;
  }
}
function createClient(connection, token) {
  return () => new ReactiveDB(connection, token);
}
export { Auth as Auth };
export { createClient as createClient };
