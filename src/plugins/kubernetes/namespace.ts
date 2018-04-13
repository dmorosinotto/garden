/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PluginContext } from "../../plugin-context"
import { Environment } from "../../types/common"
import {
  apiGetOrNull,
  coreApi,
} from "./api"
import { GARDEN_GLOBAL_SYSTEM_NAMESPACE } from "./system-global"

export async function namespaceReady(namespace: string) {
  /**
   * This is an issue with kubernetes-client where it fetches all namespaces instead of the requested one.
   * Is fixed in v4.0.0. See https://github.com/godaddy/kubernetes-client/issues/187 and
   * https://github.com/godaddy/kubernetes-client/pull/190
   */
  const allNamespaces = await apiGetOrNull(coreApi().namespaces, namespace)
  const ns = allNamespaces.items.find(n => n.metadata.name === namespace)
  return ns && ns.status.phase === "Active"
}

export async function createNamespace(namespace: string) {
  await coreApi().namespaces.post({
    body: {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: namespace,
        annotations: {
          "garden.io/generated": "true",
        },
      },
    },
  })
}

export function getAppNamespace(ctx: PluginContext, env?: Environment) {
  const currentEnv = env || ctx.getEnvironment()
  if (currentEnv.namespace === GARDEN_GLOBAL_SYSTEM_NAMESPACE) {
    return currentEnv.namespace
  }
  return `garden--${ctx.projectName}--${currentEnv.namespace}`
}

export function getMetadataNamespace(ctx: PluginContext) {
  const env = ctx.getEnvironment()
  return `garden-metadata--${ctx.projectName}--${env.namespace}`
}