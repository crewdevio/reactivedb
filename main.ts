import { ReactiveCore } from "./mod.ts";

await ReactiveCore({
  connection: "mongodb://localhost:27017/reactivedb_test",
  port: 3000,
  secret:
    "64d09d9930c8ecf79e513167a588cb75439b762ce8f9b22ea59765f32aa74ca19d2f1e97dc922a3d4954594a05062917fb24d1f8e72f2ed02a58ed7534f94d27",
});
