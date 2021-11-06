/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { EventSender } from "../types.ts";
import { Evt } from "../../imports/evt.ts";

export const reactiveEvents = new Evt<EventSender>();
