import api from "./apiClient"
import apimock from "./apimock"

const useMock = import.meta.env.VITE_USE_MOCK === "true"

const apiReal = {
  getAll: async () => {
    const res = await api.get("/v1/blueprints") 
    return res.data.data
  },

  getByAuthor: async (author) => {
    const res = await api.get(`/v1/blueprints/${author}`)
    return res.data.data
  },

  getByAuthorAndName: async (author, name) => {
    const res = await api.get(`/v1/blueprints/${author}/${name}`)
    return res.data.data
  },

  create: async (blueprint) => {
    const res = await api.post("/v1/blueprints", blueprint)
    return res.data.data
  }
}

const service = useMock ? apimock : apiReal

export default service