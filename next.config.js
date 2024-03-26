module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/vote',
          destination: 'http://localhost:3001/vote',
        },
      ]
    },
  }
  