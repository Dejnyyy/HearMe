module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/vote',
          destination: 'http://localhost:3000/vote',
        },
      ]
    },
  }
  