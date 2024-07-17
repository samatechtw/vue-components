import { LocalStoragePlugin, useModule } from '@samatech/vue-store'

export interface IDemoState {
  immediateDownload: boolean
}

const getters = (state: IDemoState) => ({})

const mutations = (state: IDemoState) => ({
  setImediateDownload(immediate: boolean) {
    state.immediateDownload = immediate
  },
})

export const miscModule = useModule<
  IDemoState,
  ReturnType<typeof getters>,
  ReturnType<typeof mutations>
>({
  name: 'demo-store',
  version: 4,
  stateInit: () => ({
    immediateDownload: false,
  }),
  getters,
  mutations,
  plugins: [LocalStoragePlugin],
})
