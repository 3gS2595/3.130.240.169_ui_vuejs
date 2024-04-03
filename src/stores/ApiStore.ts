import { defineStore } from 'pinia'
import { watch } from 'vue'

import { SessionStore } from '@/stores/SessionStore'
import { GlobalStore } from '@/stores/GlobalStore'
import { useForceGraphStore } from '@/stores/api/ForceGraphStore'
import { useKernalStore } from '@/stores/api/KernalStore'
import { useMixtapeStore } from '@/stores/api/MixtapeStore'
import { useSrcUrlSubsetStore } from '@/stores/api/SrcUrlSubsetStore'
import { useConnectionsStore } from '@/stores/api/connectionsStore'
import { useUserFeedStore } from '@/stores/api/UserFeedStore'


import type { apiStoreType } from '@/types/index'
const globalStore = GlobalStore()
export const ApiStore = defineStore({
  id: 'apiStore',
  state: (): apiStoreType => ({ controller: new AbortController() }),
  actions: {
    async initialize () {
      await Promise.all([
        useUserFeedStore().fetchUserFeed(),
        useMixtapeStore().fetchMixtapes(),
        useSrcUrlSubsetStore().fetchSrcUrlSubsets(),
        useForceGraphStore().fetchForceGraph()
      ])
      await Promise.all([
        useKernalStore().fetchKernals()
      ])
      useConnectionsStore().fetchConnections()

    },

    async update () {
      this.abortRequests ()
      useKernalStore().reset()
      useKernalStore().fetchKernals()
      useForceGraphStore().fetchForceGraph()
    },

    async logoutUser () {
      this.abortRequests()
      await SessionStore().logoutUser()
      this.reset()
    },

    async reset () {
      this.abortRequests()
      GlobalStore().$reset()
      useConnectionsStore().$reset()
      useUserFeedStore().$reset()
      useMixtapeStore().$reset()
      useSrcUrlSubsetStore().$reset()
      useForceGraphStore().$reset()
      useKernalStore().$reset()
    },

    async abortRequests () {
      this.controller.abort()
      this.controller = new AbortController()
    }
  }
})

watch(
  () => [
          globalStore.filter,
          globalStore.sortBy,
          globalStore.mixtape,
          globalStore.srcUrlSubset
        ],
  () => {
    if (SessionStore().auth_token != null) ApiStore().update()
  }
)


