import { describe, it, expect, vi } from 'vitest'
import service from '../src/services/blueprintsService'

// Mock apiClient
vi.mock('../src/services/apiClient', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  }
})

import apiClient from '../src/services/apiClient'

describe('Blueprints Service', () => {

  it('should fetch all blueprints', async () => {
    apiClient.get.mockResolvedValue({
      data: { data: [{ name: 'test', points: [] }] }
    })

    const res = await service.getAll()

    expect(apiClient.get).toHaveBeenCalled()
    expect(res.length).toBe(1)
  })

  it('should fetch blueprints by author', async () => {
    apiClient.get.mockResolvedValue({
      data: { data: [{ name: 'plano1', points: [] }] }
    })

    const res = await service.getByAuthor('juan')

    expect(apiClient.get).toHaveBeenCalled()
    expect(res[0].name).toBe('plano1')
  })

  it('should fetch blueprint by author and name', async () => {
    apiClient.get.mockResolvedValue({
      data: { data: { name: 'plano1', points: [] } }
    })

    const res = await service.getByAuthorAndName('juan', 'plano1')

    expect(apiClient.get).toHaveBeenCalled()
    expect(res.name).toBe('plano1')
  })

  it('should create a blueprint', async () => {
    const blueprint = { author: 'juan', name: 'plano1', points: [] }

    apiClient.post.mockResolvedValue({
      data: { data: blueprint }
    })

    const res = await service.create(blueprint)

    expect(apiClient.post).toHaveBeenCalled()
    expect(res.name).toBe('plano1')
  })

})