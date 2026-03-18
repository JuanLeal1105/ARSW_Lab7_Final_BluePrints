const mockData = [
  {
    author: "juan",
    name: "house",
    points: [
      { x: 10, y: 10 },
      { x: 100, y: 10 },
      { x: 100, y: 100 },
      { x: 10, y: 100 }
    ]
  },
  {
    author: "ana",
    name: "triangle",
    points: [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 100, y: 150 }
    ]
  }
]

const apimock = {
  getAll: async () => mockData,

  getByAuthor: async (author) => {
    return mockData.filter(bp => bp.author === author)
  },

  getByAuthorAndName: async (author, name) => {
    return mockData.find(
      bp => bp.author === author && bp.name === name
    )
  },

  create: async (blueprint) => {
    mockData.push(blueprint)
    return blueprint
  }
}

export default apimock