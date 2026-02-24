import type { Core } from '@strapi/strapi'

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  upload: {
    config: {
      provider: 'local',
      actionOptions: {
        upload: {},
        uploadStream: {},
      },
    },
  },
})

export default config
