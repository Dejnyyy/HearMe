module.exports = {
  images: {
    domains: ['i.scdn.co','platform-lookaside.fbsbx.com'],
  },
    async rewrites() {
      return [
        {
          source: '/api/vote',
          destination: 'http://localhost:3001/vote',
        },
      ]
    },
  }
  